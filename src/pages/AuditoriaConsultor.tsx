import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/crm/AppLayout";
import { cn } from "@/lib/utils";
import { ArrowLeft, MapPin, Navigation, Clock } from "lucide-react";

type SlaLead = { deal_id: string; cliente_nome: string; chegada: string; primeira_acao: string | null; minutos: number; teve_acao: boolean; conforme: boolean };
type Visita = { deal_id: string; created_at: string; nome: string };
type Outbound = { deal_id: string; concluida_em: string; nome: string };

const META_VISITAS = 3;
const META_OUTBOUND = 10;

const fmtDia = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
const fmtDataHora = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? " " + (m % 60) + "min" : ""}` : `${m}min`);
const DIA = 86400000;

function cicloDefault() {
  const d = new Date();
  let mes = d.getMonth();
  if (d.getDate() < 10) mes -= 1;
  const ini = new Date(d.getFullYear(), mes, 10, 0, 0, 0, 0);
  const fim = new Date(ini.getFullYear(), ini.getMonth() + 1, 10, 0, 0, 0, 0);
  return { from: ini.toISOString(), to: fim.toISOString() };
}

export default function AuditoriaConsultor() {
  const { id = "" } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const def = useMemo(cicloDefault, []);
  const fromIso = sp.get("from") ?? def.from;
  const toIso = sp.get("to") ?? def.to;

  const [nome, setNome] = useState("—");
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [outbound, setOutbound] = useState<Outbound[]>([]);
  const [sla, setSla] = useState<SlaLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [prof, vis, out, slaRes] = await Promise.all([
        supabase.from("user_profiles").select("nome").eq("user_id", id).maybeSingle(),
        supabase.from("crm_deal_status_log").select("deal_id, created_at").eq("status_novo", "visita_realizada").eq("responsavel_id", id).gte("created_at", fromIso).lt("created_at", toIso).order("created_at"),
        supabase.from("crm_tasks").select("deal_id, concluida_em").eq("tipo", "Visita outbound").eq("concluida", true).eq("responsavel_id", id).gte("concluida_em", fromIso).lt("concluida_em", toIso).order("concluida_em"),
        (supabase as any).rpc("crm_auditoria_leads", { p_from: fromIso, p_to: toIso, p_responsavel: id }),
      ]);
      setNome((prof.data as any)?.nome || "—");
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
  }, [id, fromIso, toIso]);

  const blocos = useMemo(() => {
    const res: { num: number; ini: Date; fim: Date; dias: number }[] = [];
    const to = new Date(toIso).getTime();
    let ini = new Date(fromIso).getTime();
    let num = 1;
    while (ini < to) {
      const fim = Math.min(ini + 7 * DIA, to);
      res.push({ num, ini: new Date(ini), fim: new Date(fim), dias: Math.round((fim - ini) / DIA) });
      ini += 7 * DIA;
      num++;
    }
    return res;
  }, [fromIso, toIso]);

  const iniciais = nome.split(/\s+/).filter(Boolean).map((p) => p.replace(/\./g, "")[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  const totVis = visitas.length;
  const totOut = outbound.length;
  const totSla = sla.length;
  const totConf = sla.filter((l) => l.conforme).length;
  const pctSla = totSla ? Math.round((totConf / totSla) * 100) : null;

  const dentro = (iso: string, b: { ini: Date; fim: Date }) => {
    const t = new Date(iso).getTime();
    return t >= b.ini.getTime() && t < b.fim.getTime();
  };

  const okCls = "text-emerald-600 dark:text-emerald-400";
  const badCls = "text-red-600 dark:text-red-400";

  return (
    <AppLayout>
      <div className="space-y-4 max-w-6xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> voltar para a auditoria
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">{iniciais}</div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate">{nome}</h1>
              <p className="text-sm text-muted-foreground">Ciclo {fmtDia(new Date(fromIso))} – {fmtDia(new Date(new Date(toIso).getTime() - DIA))}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5 sm:flex">
            <div className="rounded-md bg-muted/60 px-3 py-1.5 text-center"><p className="text-xs text-muted-foreground">Visitas</p><p className="text-lg font-semibold leading-tight">{totVis}</p></div>
            <div className="rounded-md bg-muted/60 px-3 py-1.5 text-center"><p className="text-xs text-muted-foreground">Outbound</p><p className="text-lg font-semibold leading-tight">{totOut}</p></div>
            <div className="rounded-md bg-muted/60 px-3 py-1.5 text-center"><p className="text-xs text-muted-foreground">SLA</p><p className={cn("text-lg font-semibold leading-tight", pctSla === null ? "" : pctSla >= 90 ? okCls : pctSla >= 70 ? "text-amber-600 dark:text-amber-400" : badCls)}>{pctSla === null ? "—" : `${pctSla}%`}</p></div>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-10">Carregando…</p>
        ) : (
          <div className="space-y-4">
          {blocos.map((b) => {
          const visSem = visitas.filter((v) => dentro(v.created_at, b));
          const outSem = outbound.filter((o) => o.concluida_em && dentro(o.concluida_em, b));
          const slaSem = sla.filter((l) => dentro(l.chegada, b));
          const metaVis = Math.max(1, Math.round((META_VISITAS * b.dias) / 7));
          const metaOut = Math.max(1, Math.round((META_OUTBOUND * b.dias) / 7));
          const futura = b.fim.getTime() > Date.now();
          const okVis = visSem.length >= metaVis;
          const okOut = outSem.length >= metaOut;
          const conf = slaSem.filter((l) => l.conforme).length;
          const fora = slaSem.length - conf;
          const metaChip = (ok: boolean, val: number, meta: number) =>
            futura
              ? <span className="text-xs text-muted-foreground">{val} · em andamento</span>
              : <span className={cn("text-xs font-semibold", ok ? okCls : badCls)}>{val}/{meta}</span>;

          return (
            <div key={b.num} className="rounded-xl border bg-card p-4 sm:p-5">
              <div className="mb-3 font-medium">Semana {b.num} · {fmtDia(b.ini)} a {fmtDia(new Date(b.fim.getTime() - DIA))}{b.dias < 7 ? ` (${b.dias} dias)` : ""}</div>

              <div className="mb-4">
                <p className="mb-1.5 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" /> Tempo de atendimento — {slaSem.length} {slaSem.length === 1 ? "lead" : "leads"}
                  {slaSem.length > 0 && <>· <span className={okCls}>{conf} no prazo</span> · <span className={badCls}>{fora} fora</span></>}
                </p>
                {slaSem.length > 0 && (
                  <div className="grid grid-cols-1 gap-x-7 text-sm sm:grid-cols-2 xl:grid-cols-3">
                    {slaSem.map((l) => (
                      <div key={l.deal_id} className="flex items-center justify-between gap-2 border-b border-border/40 py-1">
                        <span className="truncate">{l.cliente_nome}</span>
                        <span className={cn("shrink-0 whitespace-nowrap", l.conforme ? okCls : l.teve_acao ? badCls : "text-muted-foreground")}>
                          {l.teve_acao ? fmtMin(l.minutos) : "sem ação"}{l.conforme ? "" : l.teve_acao ? " · fora" : " · aguardando"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2 text-sm">
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5"><MapPin className="h-4 w-4 text-muted-foreground" /> <span className="text-muted-foreground">Visitas realizadas</span> {metaChip(okVis, visSem.length, metaVis)}</p>
                  {visSem.length === 0 ? <p className="text-muted-foreground">nenhuma nesta semana</p> : (
                    <div className="space-y-0.5">{visSem.map((v, i) => <div key={i} className="flex justify-between gap-2 border-b border-border/40 py-1"><span className="truncate">{v.nome}</span><span className="text-muted-foreground shrink-0">{fmtDataHora(v.created_at)}</span></div>)}</div>
                  )}
                </div>
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5"><Navigation className="h-4 w-4 text-muted-foreground" /> <span className="text-muted-foreground">Visitas outbound</span> {metaChip(okOut, outSem.length, metaOut)}</p>
                  {outSem.length === 0 ? <p className="text-muted-foreground">nenhuma nesta semana</p> : (
                    <div className="space-y-0.5">{outSem.map((o, i) => <div key={i} className="flex justify-between gap-2 border-b border-border/40 py-1"><span className="truncate">{o.nome}</span><span className="text-muted-foreground shrink-0">{o.concluida_em ? fmtDataHora(o.concluida_em) : "—"}</span></div>)}</div>
                  )}
                </div>
              </div>
            </div>
          );
          })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
