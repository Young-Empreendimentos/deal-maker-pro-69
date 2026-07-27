import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/crm/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultiSelectFilter } from "@/components/crm/MultiSelectFilter";
import { isVisibleUser } from "@/lib/filteredUsers";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Check, X, ShieldCheck, GitBranch } from "lucide-react";

// Metas semanais (fiéis à regra: visitas "mín. 3"; outbound "> 10")
const META_VISITAS = 3;   // mínimo por semana
const META_OUTBOUND = 10; // precisa passar de 10 (> 10)

const STATUS_LABELS: Record<string, string> = {
  lead_recebido: "Lead Recebido",
  contato_feito: "Contato Feito",
  visita_agendada: "Visita Agendada",
  visita_realizada: "Visita Realizada",
  ficha_assinada: "Ficha Assinada",
  proposta_recebida: "Proposta Recebida",
  vendido: "Vendido",
  perdido: "Perdido",
};
const statusLabel = (s: string | null) => (s ? STATUS_LABELS[s] ?? s : "—");

type AuditRow = {
  responsavel_id: string;
  nome: string;
  visitas_realizadas: number;
  visitas_outbound: number;
  sla_total: number;
  sla_conforme: number;
  sla_inconforme: number;
  sla_no_prazo: number;
};

type LogRow = {
  id: string;
  deal_id: string;
  status_anterior: string | null;
  status_novo: string | null;
  responsavel_id: string | null;
  created_at: string;
};

// Segunda-feira 00:00 (local) da semana que contém `d`
function inicioSemana(d: Date) {
  const dt = new Date(d);
  const dow = (dt.getDay() + 6) % 7; // 0 = segunda
  dt.setDate(dt.getDate() - dow);
  dt.setHours(0, 0, 0, 0);
  return dt;
}
const addDias = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fmtDia = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
const fmtDataHora = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function Auditoria() {
  const [aba, setAba] = useState<"conformidade" | "trilha">("conformidade");
  const [semanaIni, setSemanaIni] = useState<Date>(() => inicioSemana(new Date()));
  const semanaFim = useMemo(() => addDias(semanaIni, 7), [semanaIni]);

  const [rows, setRows] = useState<AuditRow[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [dealMap, setDealMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [fConsultor, setFConsultor] = useState<string[]>([]);

  const fromIso = useMemo(() => semanaIni.toISOString(), [semanaIni]);
  const toIso = useMemo(() => semanaFim.toISOString(), [semanaFim]);

  // Mapa de nomes de usuários (uma vez)
  useEffect(() => {
    supabase.from("user_profiles").select("user_id, nome").then(({ data }) => {
      const m: Record<string, string> = {};
      (data as any[] ?? []).forEach((u) => { m[u.user_id] = u.nome || "—"; });
      setUserMap(m);
    });
  }, []);

  // Conformidade (RPC)
  useEffect(() => {
    if (aba !== "conformidade") return;
    setLoading(true);
    (supabase as any).rpc("crm_auditoria", { p_from: fromIso, p_to: toIso }).then(({ data }: any) => {
      setRows((data as AuditRow[]) ?? []);
      setLoading(false);
    });
  }, [aba, fromIso, toIso]);

  // Trilha (log de status)
  const carregarTrilha = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("crm_deal_status_log")
      .select("id, deal_id, status_anterior, status_novo, responsavel_id, created_at")
      .gte("created_at", fromIso).lt("created_at", toIso)
      .order("created_at", { ascending: false })
      .limit(500);
    const rowsLog = (data as LogRow[]) ?? [];
    setLogs(rowsLog);
    const ids = [...new Set(rowsLog.map((r) => r.deal_id))];
    if (ids.length) {
      const { data: deals } = await supabase.from("crm_deals").select("id, cliente_nome").in("id", ids);
      const m: Record<string, string> = {};
      (deals as any[] ?? []).forEach((d) => { m[d.id] = d.cliente_nome || "—"; });
      setDealMap(m);
    } else {
      setDealMap({});
    }
    setLoading(false);
  }, [fromIso, toIso]);

  useEffect(() => {
    if (aba !== "trilha") return;
    carregarTrilha();
  }, [aba, carregarTrilha]);

  const consultorOptions = useMemo(
    () => Object.entries(userMap).filter(([id]) => isVisibleUser(id)).map(([id, nome]) => ({ value: id, label: nome })),
    [userMap],
  );

  const logsFiltrados = useMemo(
    () => (fConsultor.length ? logs.filter((l) => l.responsavel_id && fConsultor.includes(l.responsavel_id)) : logs),
    [logs, fConsultor],
  );

  const slaPct = (r: AuditRow) => (r.sla_total ? Math.round((r.sla_conforme / r.sla_total) * 100) : null);

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Cabeçalho + navegação de semana */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-primary" /> Auditoria comercial</h1>
            <p className="text-sm text-muted-foreground">Metas e SLA por consultor — visível apenas para administradores.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setSemanaIni((p) => addDias(p, -7))} aria-label="Semana anterior"><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm font-medium min-w-[150px] text-center">
              {fmtDia(semanaIni)} – {fmtDia(addDias(semanaIni, 6))}
            </span>
            <Button variant="outline" size="icon" onClick={() => setSemanaIni((p) => addDias(p, 7))} disabled={addDias(semanaIni, 7) > new Date()} aria-label="Próxima semana"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setAba("conformidade")}
            className={cn("px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center gap-2", aba === "conformidade" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            <ShieldCheck className="h-4 w-4" /> Conformidade
          </button>
          <button
            onClick={() => setAba("trilha")}
            className={cn("px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center gap-2", aba === "trilha" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            <GitBranch className="h-4 w-4" /> Trilha de ações
          </button>
        </div>

        {aba === "conformidade" ? (
          <Card className="border bg-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Consultor</TableHead>
                    <TableHead className="text-center">Visitas realizadas <span className="text-muted-foreground font-normal">(mín. {META_VISITAS})</span></TableHead>
                    <TableHead className="text-center">Visitas outbound <span className="text-muted-foreground font-normal">(&gt; {META_OUTBOUND})</span></TableHead>
                    <TableHead className="text-center">SLA 20 min</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Carregando…</TableCell></TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Sem dados nesta semana.</TableCell></TableRow>
                  ) : rows.map((r) => {
                    const visOk = r.visitas_realizadas >= META_VISITAS;
                    const outOk = r.visitas_outbound > META_OUTBOUND;
                    const pct = slaPct(r);
                    return (
                      <TableRow key={r.responsavel_id}>
                        <TableCell className="font-medium">{r.nome}</TableCell>
                        <TableCell className="text-center">
                          <span className={cn("inline-flex items-center gap-1 font-semibold", visOk ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                            {visOk ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />} {r.visitas_realizadas}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={cn("inline-flex items-center gap-1 font-semibold", outOk ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                            {outOk ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />} {r.visitas_outbound}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {r.sla_total === 0 ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className={cn("font-semibold", pct! >= 90 ? "text-emerald-600 dark:text-emerald-400" : pct! >= 70 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400")}>{pct}%</span>
                              <span className="text-xs text-muted-foreground">{r.sla_conforme} no prazo · {r.sla_inconforme} fora{r.sla_no_prazo ? ` · ${r.sla_no_prazo} aguardando` : ""}</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <div className="w-full sm:w-72"><MultiSelectFilter label="Consultor" options={consultorOptions} selected={fConsultor} onChange={setFConsultor} /></div>
            <Card className="border bg-card">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quando</TableHead>
                      <TableHead>Consultor</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Movimentação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Carregando…</TableCell></TableRow>
                    ) : logsFiltrados.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma movimentação nesta semana.</TableCell></TableRow>
                    ) : logsFiltrados.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{fmtDataHora(l.created_at)}</TableCell>
                        <TableCell className="text-sm">{l.responsavel_id ? (userMap[l.responsavel_id] ?? "—") : "—"}</TableCell>
                        <TableCell className="text-sm font-medium">{dealMap[l.deal_id] ?? "—"}</TableCell>
                        <TableCell className="text-sm">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-muted-foreground">{statusLabel(l.status_anterior)}</span>
                            <span className="text-muted-foreground">→</span>
                            <Badge variant="outline" className="text-xs">{statusLabel(l.status_novo)}</Badge>
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            {logsFiltrados.length >= 500 && <p className="text-xs text-muted-foreground">Mostrando as 500 movimentações mais recentes da semana.</p>}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
