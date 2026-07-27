import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/crm/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MultiSelectFilter } from "@/components/crm/MultiSelectFilter";
import { isVisibleUser } from "@/lib/filteredUsers";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ShieldCheck, GitBranch, MapPin, Navigation, Timer } from "lucide-react";

const META_VISITAS = 3;    // por 7 dias
const META_OUTBOUND = 10;  // por 7 dias

const STATUS_LABELS: Record<string, string> = {
  lead_recebido: "Lead Recebido", contato_feito: "Contato Feito", visita_agendada: "Visita Agendada",
  visita_realizada: "Visita Realizada", ficha_assinada: "Ficha Assinada", proposta_recebida: "Proposta Recebida",
  vendido: "Vendido", perdido: "Perdido",
};
const statusLabel = (s: string | null) => (s ? STATUS_LABELS[s] ?? s : "—");

type SemanaRow = { responsavel_id: string; nome: string; semana_num: number; semana_ini: string; dias: number; visitas: number; outbound: number; meta_visitas: number; meta_outbound: number; };
type SlaRow = { responsavel_id: string; sla_total: number; sla_conforme: number; sla_inconforme: number; sla_no_prazo: number; };
type LogRow = { id: string; deal_id: string; status_anterior: string | null; status_novo: string | null; responsavel_id: string | null; created_at: string; };
type SlaLead = { deal_id: string; cliente_nome: string; chegada: string; primeira_acao: string | null; minutos: number; teve_acao: boolean; conforme: boolean; };

function cicloInicio(ref: Date) {
  const d = new Date(ref);
  let mes = d.getMonth();
  if (d.getDate() < 10) mes -= 1;
  return new Date(d.getFullYear(), mes, 10, 0, 0, 0, 0);
}
const addCiclo = (ini: Date, n: number) => new Date(ini.getFullYear(), ini.getMonth() + n, 10, 0, 0, 0, 0);
const addDias = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fmtDia = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
const fmtDataHora = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? " " + (m % 60) + "min" : ""}` : `${m}min`);

// ─────────────────────────── Drill-down por consultor ───────────────────────────
function DrillConsultor({ resp, nome, fromIso, toIso, onClose }: { resp: string; nome: string; fromIso: string; toIso: string; onClose: () => void; }) {
  const [visitas, setVisitas] = useState<{ deal_id: string; created_at: string; nome: string }[]>([]);
  const [outbound, setOutbound] = useState<{ deal_id: string; concluida_em: string; nome: string }[]>([]);
  const [sla, setSla] = useState<SlaLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [vis, out, slaRes] = await Promise.all([
        supabase.from("crm_deal_status_log").select("deal_id, created_at")
          .eq("status_novo", "visita_realizada").eq("responsavel_id", resp)
          .gte("created_at", fromIso).lt("created_at", toIso).order("created_at", { ascending: false }),
        supabase.from("crm_tasks").select("deal_id, concluida_em")
          .eq("tipo", "Visita outbound").eq("concluida", true).eq("responsavel_id", resp)
          .gte("concluida_em", fromIso).lt("concluida_em", toIso).order("concluida_em", { ascending: false }),
        (supabase as any).rpc("crm_auditoria_leads", { p_from: fromIso, p_to: toIso, p_responsavel: resp }),
      ]);
      const visRows = (vis.data as any[]) ?? [];
      const outRows = (out.data as any[]) ?? [];
      const ids = [...new Set([...visRows.map((r) => r.deal_id), ...outRows.map((r) => r.deal_id)])];
      const nmap: Record<string, string> = {};
      if (ids.length) {
        const { data: deals } = await supabase.from("crm_deals").select("id, cliente_nome").in("id", ids);
        (deals as any[] ?? []).forEach((d) => { nmap[d.id] = d.cliente_nome || "—"; });
      }
      setVisitas(visRows.map((r) => ({ ...r, nome: nmap[r.deal_id] ?? "—" })));
      setOutbound(outRows.map((r) => ({ ...r, nome: nmap[r.deal_id] ?? "—" })));
      setSla((slaRes.data as SlaLead[]) ?? []);
      setLoading(false);
    })();
  }, [resp, fromIso, toIso]);

  const Section = ({ icon: Icon, titulo, count, children }: any) => (
    <section>
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-2"><Icon className="h-4 w-4 text-primary" /> {titulo} <span className="text-muted-foreground font-normal">({count})</span></h3>
      {children}
    </section>
  );

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{nome} — detalhes do ciclo</DialogTitle></DialogHeader>
        {loading ? (
          <p className="text-muted-foreground py-6 text-center">Carregando…</p>
        ) : (
          <div className="space-y-6">
            <Section icon={MapPin} titulo="Visitas realizadas" count={visitas.length}>
              {visitas.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma no ciclo.</p> : (
                <ul className="space-y-1">{visitas.map((v, i) => (
                  <li key={i} className="flex justify-between text-sm border-b border-border/50 py-1"><span>{v.nome}</span><span className="text-muted-foreground">{fmtDataHora(v.created_at)}</span></li>
                ))}</ul>
              )}
            </Section>
            <Section icon={Navigation} titulo="Visitas outbound (concluídas)" count={outbound.length}>
              {outbound.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma no ciclo.</p> : (
                <ul className="space-y-1">{outbound.map((o, i) => (
                  <li key={i} className="flex justify-between text-sm border-b border-border/50 py-1"><span>{o.nome}</span><span className="text-muted-foreground">{o.concluida_em ? fmtDataHora(o.concluida_em) : "—"}</span></li>
                ))}</ul>
              )}
            </Section>
            <Section icon={Timer} titulo="SLA de 20 min — leads recebidos" count={sla.length}>
              {sla.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum lead recebido no ciclo.</p> : (
                <ul className="space-y-1">{sla.map((l) => (
                  <li key={l.deal_id} className="flex items-center justify-between text-sm border-b border-border/50 py-1">
                    <span className="truncate mr-2">{l.cliente_nome}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-muted-foreground">{l.teve_acao ? fmtMin(l.minutos) : "sem ação"}</span>
                      {l.conforme ? <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">no prazo</Badge>
                        : l.teve_acao ? <Badge variant="destructive">fora</Badge>
                        : <Badge variant="outline">aguardando</Badge>}
                    </span>
                  </li>
                ))}</ul>
              )}
            </Section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────── Página ───────────────────────────────
export default function Auditoria() {
  const [aba, setAba] = useState<"conformidade" | "trilha">("conformidade");
  const [cicloIni, setCicloIni] = useState<Date>(() => cicloInicio(new Date()));
  const cicloFim = useMemo(() => addCiclo(cicloIni, 1), [cicloIni]);
  const fromIso = useMemo(() => cicloIni.toISOString(), [cicloIni]);
  const toIso = useMemo(() => cicloFim.toISOString(), [cicloFim]);
  const noCicloAtual = useMemo(() => cicloIni.getTime() >= cicloInicio(new Date()).getTime(), [cicloIni]);

  const [semanaRows, setSemanaRows] = useState<SemanaRow[]>([]);
  const [slaMap, setSlaMap] = useState<Record<string, SlaRow>>({});
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [dealMap, setDealMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [fConsultor, setFConsultor] = useState<string[]>([]);
  const [drill, setDrill] = useState<{ id: string; nome: string } | null>(null);

  useEffect(() => {
    supabase.from("user_profiles").select("user_id, nome").then(({ data }) => {
      const m: Record<string, string> = {};
      (data as any[] ?? []).forEach((u) => { m[u.user_id] = u.nome || "—"; });
      setUserMap(m);
    });
  }, []);

  useEffect(() => {
    if (aba !== "conformidade") return;
    setLoading(true);
    Promise.all([
      (supabase as any).rpc("crm_auditoria_semanal", { p_from: fromIso, p_to: toIso }),
      (supabase as any).rpc("crm_auditoria", { p_from: fromIso, p_to: toIso }),
    ]).then(([sem, sla]: any[]) => {
      setSemanaRows((sem.data as SemanaRow[]) ?? []);
      const sm: Record<string, SlaRow> = {};
      ((sla.data as SlaRow[]) ?? []).forEach((r) => { sm[r.responsavel_id] = r; });
      setSlaMap(sm);
      setLoading(false);
    });
  }, [aba, fromIso, toIso]);

  const carregarTrilha = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("crm_deal_status_log")
      .select("id, deal_id, status_anterior, status_novo, responsavel_id, created_at")
      .gte("created_at", fromIso).lt("created_at", toIso)
      .order("created_at", { ascending: false }).limit(500);
    const rowsLog = (data as LogRow[]) ?? [];
    setLogs(rowsLog);
    const ids = [...new Set(rowsLog.map((r) => r.deal_id))];
    if (ids.length) {
      const { data: deals } = await supabase.from("crm_deals").select("id, cliente_nome").in("id", ids);
      const m: Record<string, string> = {};
      (deals as any[] ?? []).forEach((d) => { m[d.id] = d.cliente_nome || "—"; });
      setDealMap(m);
    } else setDealMap({});
    setLoading(false);
  }, [fromIso, toIso]);

  useEffect(() => { if (aba === "trilha") carregarTrilha(); }, [aba, carregarTrilha]);

  // Agrupa a matriz por consultor + colunas de semana
  const consultores = useMemo(() => {
    const m = new Map<string, { id: string; nome: string; semanas: Record<number, SemanaRow> }>();
    for (const r of semanaRows) {
      if (!m.has(r.responsavel_id)) m.set(r.responsavel_id, { id: r.responsavel_id, nome: r.nome, semanas: {} });
      m.get(r.responsavel_id)!.semanas[r.semana_num] = r;
    }
    return [...m.values()].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [semanaRows]);

  const colunas = useMemo(() => {
    const m = new Map<number, { num: number; ini: string; dias: number }>();
    for (const r of semanaRows) if (!m.has(r.semana_num)) m.set(r.semana_num, { num: r.semana_num, ini: r.semana_ini, dias: r.dias });
    return [...m.values()].sort((a, b) => a.num - b.num);
  }, [semanaRows]);

  const consultorOptions = useMemo(
    () => Object.entries(userMap).filter(([id]) => isVisibleUser(id)).map(([id, nome]) => ({ value: id, label: nome })),
    [userMap],
  );
  const logsFiltrados = useMemo(
    () => (fConsultor.length ? logs.filter((l) => l.responsavel_id && fConsultor.includes(l.responsavel_id)) : logs),
    [logs, fConsultor],
  );

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-primary" /> Auditoria comercial</h1>
            <p className="text-sm text-muted-foreground">Ciclo dia 10→9 · metas por semana (7 dias): 3 visitas e 10 outbound · só administradores.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCicloIni((p) => addCiclo(p, -1))} aria-label="Ciclo anterior"><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm font-medium min-w-[130px] text-center">{fmtDia(cicloIni)} – {fmtDia(addDias(cicloFim, -1))}</span>
            <Button variant="outline" size="icon" onClick={() => setCicloIni((p) => addCiclo(p, 1))} disabled={noCicloAtual} aria-label="Próximo ciclo"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="flex gap-2 border-b">
          <button onClick={() => setAba("conformidade")} className={cn("px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center gap-2", aba === "conformidade" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}><ShieldCheck className="h-4 w-4" /> Por consultor</button>
          <button onClick={() => setAba("trilha")} className={cn("px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center gap-2", aba === "trilha" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}><GitBranch className="h-4 w-4" /> Trilha de ações</button>
        </div>

        {aba === "conformidade" ? (
          <>
            {loading ? (
              <p className="text-center text-muted-foreground py-10">Carregando…</p>
            ) : consultores.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">Sem dados neste ciclo.</p>
            ) : (
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                {consultores.map((cons) => {
                  const semanas = colunas.map((c) => cons.semanas[c.num]).filter(Boolean);
                  const totVis = semanas.reduce((a, w) => a + w.visitas, 0);
                  const totOut = semanas.reduce((a, w) => a + w.outbound, 0);
                  const sla = slaMap[cons.id];
                  const pct = sla && sla.sla_total ? Math.round((sla.sla_conforme / sla.sla_total) * 100) : null;
                  const slaCls = pct === null ? "" : pct >= 90
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : pct >= 70
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
                  const iniciais = cons.nome.split(/\s+/).filter(Boolean).map((p) => p.replace(/\./g, "")[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
                  const trilha = (tipo: "visitas" | "outbound") => (
                    <div className="flex items-center gap-1.5">
                      <span className="w-16 shrink-0 text-xs text-muted-foreground">{tipo === "visitas" ? "Visitas" : "Outbound"}</span>
                      {colunas.map((col) => {
                        const w = cons.semanas[col.num];
                        const futura = addDias(new Date(col.ini), col.dias).getTime() > Date.now();
                        const val = tipo === "visitas" ? (w?.visitas ?? 0) : (w?.outbound ?? 0);
                        const meta = tipo === "visitas" ? (w?.meta_visitas ?? 0) : (w?.meta_outbound ?? 0);
                        const cls = futura ? "bg-muted" : val >= meta ? "bg-emerald-500" : "bg-red-500";
                        return <span key={col.num} className={cn("h-[18px] w-[18px] shrink-0 rounded-[3px]", cls)} title={`${fmtDia(new Date(col.ini))}${futura ? " (em andamento)" : ""}: ${val}/${meta}`} />;
                      })}
                      <span className="ml-auto text-sm font-semibold tabular-nums">{tipo === "visitas" ? totVis : totOut}</span>
                    </div>
                  );
                  return (
                    <div key={cons.id} onClick={() => setDrill({ id: cons.id, nome: cons.nome })} className="cursor-pointer rounded-xl border bg-card p-4 transition-colors hover:border-primary/40">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{iniciais}</div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{cons.nome}</p>
                          <p className="text-xs text-muted-foreground">{totVis} visitas · {totOut} outbound</p>
                        </div>
                        {pct !== null && <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-medium", slaCls)}>SLA {pct}%</span>}
                      </div>
                      <div className="space-y-1.5">
                        {trilha("visitas")}
                        {trilha("outbound")}
                      </div>
                      <div className="mt-3 flex items-center justify-end gap-1 text-xs text-primary">abrir detalhes <ChevronRight className="h-3.5 w-3.5" /></div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 rounded-[3px] bg-emerald-500" /> bateu a meta</span>
              <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 rounded-[3px] bg-red-500" /> não bateu</span>
              <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 rounded-[3px] bg-muted" /> semana em andamento</span>
              <span>· cada quadradinho = 1 semana · metas: {META_VISITAS} visitas e {META_OUTBOUND} outbound por 7 dias</span>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="w-full sm:w-72"><MultiSelectFilter label="Consultor" options={consultorOptions} selected={fConsultor} onChange={setFConsultor} /></div>
            <Card className="border bg-card">
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Quando</TableHead><TableHead>Consultor</TableHead><TableHead>Cliente</TableHead><TableHead>Movimentação</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Carregando…</TableCell></TableRow>
                    ) : logsFiltrados.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma movimentação neste ciclo.</TableCell></TableRow>
                    ) : logsFiltrados.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{fmtDataHora(l.created_at)}</TableCell>
                        <TableCell className="text-sm">{l.responsavel_id ? (userMap[l.responsavel_id] ?? "—") : "—"}</TableCell>
                        <TableCell className="text-sm font-medium">{dealMap[l.deal_id] ?? "—"}</TableCell>
                        <TableCell className="text-sm"><span className="inline-flex items-center gap-1.5"><span className="text-muted-foreground">{statusLabel(l.status_anterior)}</span><span className="text-muted-foreground">→</span><Badge variant="outline" className="text-xs">{statusLabel(l.status_novo)}</Badge></span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            {logsFiltrados.length >= 500 && <p className="text-xs text-muted-foreground">Mostrando as 500 movimentações mais recentes do ciclo.</p>}
          </div>
        )}
      </div>

      {drill && <DrillConsultor resp={drill.id} nome={drill.nome} fromIso={fromIso} toIso={toIso} onClose={() => setDrill(null)} />}
    </AppLayout>
  );
}
