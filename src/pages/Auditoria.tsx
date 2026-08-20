import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase, crmDb } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/crm/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultiSelectFilter } from "@/components/crm/MultiSelectFilter";
import { isVisibleUser } from "@/lib/filteredUsers";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ShieldCheck, GitBranch, Building2, AlertTriangle } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  lead_recebido: "Lead Recebido", contato_feito: "Contato Feito", visita_agendada: "Visita Agendada",
  visita_realizada: "Visita Realizada", ficha_assinada: "Ficha Assinada", proposta_recebida: "Proposta Recebida",
  vendido: "Vendido", perdido: "Perdido",
};
const statusLabel = (s: string | null) => (s ? STATUS_LABELS[s] ?? s : "—");

type SemanaRow = { responsavel_id: string; nome: string; semana_num: number; semana_ini: string; dias: number; visitas: number; outbound: number; meta_visitas: number; meta_outbound: number; };
type SlaRow = { responsavel_id: string; sla_total: number; sla_conforme: number; sla_inconforme: number; sla_no_prazo: number; };
type LogRow = { id: string; deal_id: string; status_anterior: string | null; status_novo: string | null; responsavel_id: string | null; created_at: string; };
type ConsComissao = { responsavel_id: string; nome: string; faturamento: number; vendas: number; fat_externo: number; vendas_externas: number; bate_externo: boolean; positivas: number; atingiu_min: boolean; faixa_de: number | null; pct_base: number | null; pct_max: number | null; pct_final: number; valor: number };
type Imob = { nome: string; faturamento: number; vendas: number };
type Aviso = { deal_id: string; cliente: string; empreendimento: string | null; lote: string | null; valor: number | null; corretor: string | null; dono: string | null };
type BonusGestora = { responsavel_id: string; nome: string; fat_externo: number; fat_time: number; base: number; pct: number; valor: number; membros: { nome: string; faturamento: number }[] };

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
const fmtBRL = (v: number, dec = 0) => (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtPct = (v: number) => (v ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// ─────────────────────────────── Página ───────────────────────────────
export default function Auditoria() {
  const [aba, setAba] = useState<"conformidade" | "trilha">("conformidade");
  const [cicloIni, setCicloIni] = useState<Date>(() => cicloInicio(new Date()));
  const cicloFim = useMemo(() => addCiclo(cicloIni, 1), [cicloIni]);
  const fromIso = useMemo(() => cicloIni.toISOString(), [cicloIni]);
  const toIso = useMemo(() => cicloFim.toISOString(), [cicloFim]);
  const noCicloAtual = useMemo(() => cicloIni.getTime() >= cicloInicio(new Date()).getTime(), [cicloIni]);
  // Faturamento (vendas) roda 19→18; fechamento no dia 20 do mês seguinte ao início do ciclo.
  const fatIni = useMemo(() => new Date(cicloIni.getFullYear(), cicloIni.getMonth(), 19, 0, 0, 0, 0), [cicloIni]);
  const fatFim = useMemo(() => new Date(cicloIni.getFullYear(), cicloIni.getMonth() + 1, 19, 0, 0, 0, 0), [cicloIni]);
  const fechamento = useMemo(() => new Date(cicloIni.getFullYear(), cicloIni.getMonth() + 1, 20, 0, 0, 0, 0), [cicloIni]);
  const fatFromIso = useMemo(() => fatIni.toISOString(), [fatIni]);
  const fatToIso = useMemo(() => fatFim.toISOString(), [fatFim]);

  const [semanaRows, setSemanaRows] = useState<SemanaRow[]>([]);
  const [slaMap, setSlaMap] = useState<Record<string, SlaRow>>({});
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [dealMap, setDealMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [fConsultor, setFConsultor] = useState<string[]>([]);
  const [comissaoMap, setComissaoMap] = useState<Record<string, ConsComissao>>({});
  const [imobiliarias, setImobiliarias] = useState<Imob[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [bonusGestora, setBonusGestora] = useState<BonusGestora | null>(null);
  const navigate = useNavigate();

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
      (supabase as any).rpc("crm_comissao", { p_aud_from: fromIso, p_aud_to: toIso, p_fat_from: fatFromIso, p_fat_to: fatToIso }),
      (supabase as any).rpc("crm_vendas_sem_contrato", { p_from: fatFromIso, p_to: fatToIso }),
    ]).then(([sem, sla, com, av]: any[]) => {
      setSemanaRows((sem.data as SemanaRow[]) ?? []);
      const sm: Record<string, SlaRow> = {};
      ((sla.data as SlaRow[]) ?? []).forEach((r) => { sm[r.responsavel_id] = r; });
      setSlaMap(sm);
      const cd = (com.data as any) ?? {};
      const cmap: Record<string, ConsComissao> = {};
      ((cd.consultores as ConsComissao[]) ?? []).forEach((c) => { cmap[c.responsavel_id] = c; });
      setComissaoMap(cmap);
      setImobiliarias((cd.imobiliarias as Imob[]) ?? []);
      setBonusGestora((cd.bonus_gestora as BonusGestora) ?? null);
      setAvisos((av.data as Aviso[]) ?? []);
      setLoading(false);
    });
  }, [aba, fromIso, toIso, fatFromIso, fatToIso]);

  const carregarTrilha = useCallback(async () => {
    setLoading(true);
    const { data } = await crmDb.from("crm_deal_status_log")
      .select("id, deal_id, status_anterior, status_novo, responsavel_id, created_at")
      .gte("created_at", fromIso).lt("created_at", toIso)
      .order("created_at", { ascending: false }).limit(500);
    const rowsLog = (data as LogRow[]) ?? [];
    setLogs(rowsLog);
    const ids = [...new Set(rowsLog.map((r) => r.deal_id))];
    if (ids.length) {
      const { data: deals } = await crmDb.from("crm_deals").select("id, cliente_nome").in("id", ids);
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
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCicloIni((p) => addCiclo(p, -1))} aria-label="Ciclo anterior"><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm font-medium min-w-[130px] text-center">{fmtDia(cicloIni)} – {fmtDia(addDias(cicloFim, -1))}</span>
            <Button variant="outline" size="icon" onClick={() => setCicloIni((p) => addCiclo(p, 1))} disabled={noCicloAtual} aria-label="Próximo ciclo"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>

        <p className="-mt-1 text-xs text-muted-foreground">
          Auditoria (visitas · outbound · SLA) {fmtDia(cicloIni)}–{fmtDia(addDias(cicloFim, -1))} · Faturamento {fmtDia(fatIni)}–{fmtDia(addDias(fatFim, -1))} · Fechamento {fmtDia(fechamento)}
        </p>

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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {consultores.map((cons) => {
                  const semanas = colunas.map((c) => cons.semanas[c.num]).filter(Boolean);
                  const totVis = semanas.reduce((a, w) => a + w.visitas, 0);
                  const totOut = semanas.reduce((a, w) => a + w.outbound, 0);
                  const sla = slaMap[cons.id];
                  const com = comissaoMap[cons.id];
                  const bg = bonusGestora && com && com.responsavel_id === bonusGestora.responsavel_id ? bonusGestora : null;
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
                    <div key={cons.id} onClick={() => navigate(`/auditoria/${cons.id}?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`)} className="group cursor-pointer rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 hover:shadow-sm">
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
                      {com && (
                        <div className="mt-3 border-t pt-2.5">
                          {com.atingiu_min ? (
                            <div className="flex items-end justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Faturamento · faixa {com.faixa_de != null ? fmtBRL(com.faixa_de) : "—"}</p>
                                <p className="text-sm font-medium tabular-nums">{fmtBRL(com.faturamento)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Comissão {fmtPct(com.pct_final)}%</p>
                                <p className="text-base font-semibold tabular-nums text-primary">{fmtBRL(com.valor, 2)}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Faturamento</p>
                                <p className="text-sm font-medium tabular-nums">{fmtBRL(com.faturamento)}</p>
                              </div>
                              <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">abaixo do mínimo</span>
                            </div>
                          )}
                          {(bg ? bg.base > 0 : com.fat_externo > 0) && (
                            <div className="mt-2 border-t border-dashed pt-2 text-xs">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">Via corretores <span className="font-medium tabular-nums text-foreground">{fmtBRL(bg ? bg.base : com.fat_externo)}</span></span>
                                {(bg ? bg.pct > 0 : com.bate_externo) ? (
                                  <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">bateu 500k{bg ? ` · ${fmtBRL(bg.valor, 2)}` : ""}</span>
                                ) : (
                                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-muted-foreground">meta 500k</span>
                                )}
                              </div>
                              {bg && (
                                <p className="mt-1 text-[11px] text-muted-foreground">gestora · externas {fmtBRL(bg.fat_externo)} + time {fmtBRL(bg.fat_time)} (Murilo + Joana)</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="mt-3 flex items-center justify-between border-t pt-2.5 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
                        <span>Ver detalhes do consultor</span>
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 rounded-[3px] bg-emerald-500" /> Meta atingida</span>
              <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 rounded-[3px] bg-red-500" /> Meta não atingida</span>
              <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 rounded-[3px] bg-muted" /> Semana em andamento</span>
              <span>· Cada quadrado corresponde a uma semana do ciclo.</span>
            </div>

            {!loading && imobiliarias.length > 0 && (
              <div className="pt-3">
                <h2 className="mb-0.5 flex items-center gap-2 text-lg font-semibold"><Building2 className="h-5 w-5 text-primary" /> Imobiliárias</h2>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {imobiliarias.map((im) => (
                    <div key={im.nome} className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3.5 py-2.5">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-sm">{im.nome}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">{im.vendas} {im.vendas === 1 ? "venda" : "vendas"}</span>
                      </span>
                      <span className="shrink-0 text-sm font-medium tabular-nums">{fmtBRL(im.faturamento)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && avisos.length > 0 && (
              <div className="pt-3">
                <h2 className="mb-0.5 flex items-center gap-2 text-lg font-semibold text-amber-700 dark:text-amber-400"><AlertTriangle className="h-5 w-5" /> Vendas sem contrato no Sienge</h2>
                <p className="mb-3 text-xs text-muted-foreground">Marcadas como vendidas no Pingo, mas ainda sem contrato emitido no Sienge — conferir se falta lançar ou se foi marcação indevida.</p>
                <div className="space-y-1.5">
                  {avisos.map((a) => (
                    <div key={a.deal_id} className="flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 dark:border-amber-800/60 dark:bg-amber-950/30">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{a.cliente}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {a.empreendimento ?? "—"}{a.lote ? ` · lote ${a.lote}` : ""} · {a.corretor ?? "—"}{a.dono && a.dono !== a.corretor ? ` · dono ${a.dono}` : ""}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {a.valor != null && <span className="text-sm tabular-nums">{fmtBRL(a.valor)}</span>}
                        <Button variant="outline" size="sm" className="h-7 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400" onClick={() => navigate(`/negociacoes/${a.deal_id}`)}>Abrir</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <div className="w-full sm:w-72"><MultiSelectFilter label="Consultor" options={consultorOptions} selected={fConsultor} onChange={setFConsultor} /></div>
            <Card className="border bg-card">
              <CardContent className="p-0 overflow-x-auto">
                <Table className="min-w-[560px]">
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
    </AppLayout>
  );
}
