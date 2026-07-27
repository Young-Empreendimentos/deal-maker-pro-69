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

// Metas SEMANAIS (avaliadas pela média/semana dentro do ciclo mensal)
const META_VISITAS = 3;    // mínimo 3 visitas realizadas por semana
const META_OUTBOUND = 10;  // mais de 10 visitas outbound por semana

const STATUS_LABELS: Record<string, string> = {
  lead_recebido: "Lead Recebido", contato_feito: "Contato Feito", visita_agendada: "Visita Agendada",
  visita_realizada: "Visita Realizada", ficha_assinada: "Ficha Assinada", proposta_recebida: "Proposta Recebida",
  vendido: "Vendido", perdido: "Perdido",
};
const statusLabel = (s: string | null) => (s ? STATUS_LABELS[s] ?? s : "—");

type AuditRow = {
  responsavel_id: string; nome: string;
  visitas_realizadas: number; visitas_outbound: number;
  sla_total: number; sla_conforme: number; sla_inconforme: number; sla_no_prazo: number;
};
type LogRow = { id: string; deal_id: string; status_anterior: string | null; status_novo: string | null; responsavel_id: string | null; created_at: string; };
type SlaLead = { deal_id: string; cliente_nome: string; chegada: string; primeira_acao: string | null; minutos: number; teve_acao: boolean; conforme: boolean; };

// Ciclo de fechamento: dia 10 -> dia 9 do mês seguinte
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
  const semanas = useMemo(() => Math.max(1, (cicloFim.getTime() - cicloIni.getTime()) / (7 * 86400000)), [cicloIni, cicloFim]);
  const noCicloAtual = useMemo(() => cicloIni.getTime() >= cicloInicio(new Date()).getTime(), [cicloIni]);

  const [rows, setRows] = useState<AuditRow[]>([]);
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
    (supabase as any).rpc("crm_auditoria", { p_from: fromIso, p_to: toIso }).then(({ data }: any) => {
      setRows((data as AuditRow[]) ?? []);
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
            <p className="text-sm text-muted-foreground">Ciclo de fechamento (dia 10 ao dia 9) · metas por semana · visível só para administradores.</p>
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
            <Card className="border bg-card">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Consultor</TableHead>
                      <TableHead className="text-center">Visitas realizadas <span className="text-muted-foreground font-normal">(meta {META_VISITAS}/sem)</span></TableHead>
                      <TableHead className="text-center">Visitas outbound <span className="text-muted-foreground font-normal">(&gt; {META_OUTBOUND}/sem)</span></TableHead>
                      <TableHead className="text-center">SLA 20 min</TableHead>
                      <TableHead className="w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Carregando…</TableCell></TableRow>
                    ) : rows.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Sem dados neste ciclo.</TableCell></TableRow>
                    ) : rows.map((r) => {
                      const medVis = r.visitas_realizadas / semanas;
                      const medOut = r.visitas_outbound / semanas;
                      const visOk = medVis >= META_VISITAS;
                      const outOk = medOut > META_OUTBOUND;
                      const pct = r.sla_total ? Math.round((r.sla_conforme / r.sla_total) * 100) : null;
                      return (
                        <TableRow key={r.responsavel_id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDrill({ id: r.responsavel_id, nome: r.nome })}>
                          <TableCell className="font-medium">{r.nome}</TableCell>
                          <TableCell className="text-center">
                            <div className={cn("font-semibold text-base", visOk ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>{r.visitas_realizadas}</div>
                            <div className="text-xs text-muted-foreground">{medVis.toFixed(1)}/sem</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className={cn("font-semibold text-base", outOk ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>{r.visitas_outbound}</div>
                            <div className="text-xs text-muted-foreground">{medOut.toFixed(1)}/sem</div>
                          </TableCell>
                          <TableCell className="text-center">
                            {r.sla_total === 0 ? <span className="text-muted-foreground">—</span> : (
                              <>
                                <div className={cn("font-semibold text-base", pct! >= 90 ? "text-emerald-600 dark:text-emerald-400" : pct! >= 70 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400")}>{pct}%</div>
                                <div className="text-xs text-muted-foreground">{r.sla_conforme} ok · {r.sla_inconforme} fora{r.sla_no_prazo ? ` · ${r.sla_no_prazo} aguard.` : ""}</div>
                              </>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground"><ChevronRight className="h-4 w-4" /></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <p className="text-xs text-muted-foreground">Clique num consultor para ver os detalhes (visitas, outbound e leads do SLA). Metas por semana; média calculada sobre {semanas.toFixed(1)} semanas do ciclo.</p>
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
