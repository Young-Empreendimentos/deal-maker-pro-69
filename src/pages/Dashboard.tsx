import { useEffect, useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/crm/AppLayout";
import { MultiSelectFilter } from "@/components/crm/MultiSelectFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KANBAN_COLUMNS, QUAL_COLORS, type Deal } from "@/pages/Negociacoes";
import { TASK_TIPOS, TIPO_CONFIG } from "@/pages/Tarefas";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  FunnelChart, Funnel, LabelList, Cell,
} from "recharts";
import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
  subWeeks, subMonths, subDays,
  format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Check, SlidersHorizontal, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { isVisibleUser } from "@/lib/filteredUsers";
import { fetchAllPaged } from "@/lib/supabasePagination";
import { useToast } from "@/hooks/use-toast";

// ── Types ────────────────────────────────────────────────────────────────────
type UserOption = { id: string; nome: string };
type Emp = { id: string; nome: string; cidade: string };
type Solicitacao = { id: string; user_id: string; email: string | null; nome: string | null; created_at: string };
type Task = { id: string; deal_id: string; titulo?: string; responsavel_id: string; tipo: string | null; concluida: boolean; updated_at: string };
type DatePreset = "hoje" | "ontem" | "semana_passada" | "mes" | "mes_passado" | "4_meses" | "ano" | "custom";
type DrillDown =
  | { kind: "deals"; label: string; items: Deal[] }
  | { kind: "tasks"; label: string; items: Task[] }
  | { kind: "gatilho"; label: string; items: Deal[] };

// ── Constants ─────────────────────────────────────────────────────────────────
const FUNNEL_COLORS = [
  "hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--accent))",
];

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: "hoje",          label: "Hoje" },
  { value: "ontem",         label: "Ontem" },
  { value: "semana_passada",label: "Semana passada" },
  { value: "mes",           label: "Este mês" },
  { value: "mes_passado",   label: "Mês passado" },
  { value: "4_meses",       label: "Últimos 4 meses" },
  { value: "ano",           label: "Este ano" },
  { value: "custom",        label: "Intervalo personalizado" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getPresetRange(preset: DatePreset): [Date, Date] {
  const now = new Date();
  switch (preset) {
    case "hoje":          return [startOfDay(now), endOfDay(now)];
    case "ontem": {
      const y = subDays(now, 1);
      return [startOfDay(y), endOfDay(y)];
    }
    case "semana_passada": {
      const w = subWeeks(now, 1);
      return [startOfWeek(w, { weekStartsOn: 0 }), endOfWeek(w, { weekStartsOn: 0 })];
    }
    case "mes":           return [startOfMonth(now), endOfMonth(now)];
    case "mes_passado": {
      const m = subMonths(now, 1);
      return [startOfMonth(m), endOfMonth(m)];
    }
    case "4_meses":       return [startOfMonth(subMonths(now, 3)), endOfMonth(now)];
    case "ano":           return [startOfYear(now), endOfYear(now)];
    default:              return [startOfMonth(now), endOfMonth(now)];
  }
}

function fmtDate(d: Date) { return format(d, "dd/MM/yyyy", { locale: ptBR }); }

// Persistência dos filtros do Dashboard entre navegações (sessão do navegador)
const DASH_FILTERS_KEY = "pingolead:dashboard:filtros:v1";
type DashPersist = { datePreset?: DatePreset; customFrom?: string; customTo?: string; filterUsers?: string[]; filterEmp?: string };
function loadDashFilters(): DashPersist {
  try { const raw = sessionStorage.getItem(DASH_FILTERS_KEY); return raw ? (JSON.parse(raw) as DashPersist) : {}; }
  catch { return {}; }
}

// ── Gatilho de entrada ──────────────────────────────────────────────────────
// Regra de negócio: a venda "atinge o gatilho" quando a entrada dada na
// assinatura é >= 10% do preço à vista do lote (preco_lote, vindo de
// comercial_tabela_precos.preco_av). Vendas à vista contam como atingidas,
// pois o valor pago já supera 10%.
const GATILHO_PCT = 0.10;

function entradaDeal(d: Deal): number {
  return ((d as any).valor_entrada ?? (d as any).auto_valor_entrada ?? 0) as number;
}

function atingiuGatilho(d: Deal): boolean {
  if ((d as any).forma_pagamento === "à vista") return true;
  const preco = d.preco_lote ?? 0;
  if (preco <= 0) return false;
  return entradaDeal(d) >= preco * GATILHO_PCT;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const [deals,  setDeals]  = useState<Deal[]>([]);
  const [dashCounts, setDashCounts] = useState<{ perdas: number; atividades: Record<string, number> }>({ perdas: 0, atividades: {} });
  const [drillDown, setDrillDown] = useState<DrillDown | null>(null);
  const [users,  setUsers]  = useState<UserOption[]>([]);
  const [emps,   setEmps]   = useState<Emp[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendasDeals, setVendasDeals] = useState<Deal[]>([]);
  const fetchSeqRef = useRef(0);

  // ── Solicitações de acesso ao CRM (admin) ─────────────────────────────────
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const fetchSolicitacoes = async () => {
    const { data } = await (supabase as any)
      .from("crm_solicitacoes_acesso")
      .select("id, user_id, email, nome, created_at")
      .eq("status", "pendente")
      .order("created_at", { ascending: true });
    setSolicitacoes((data as Solicitacao[]) ?? []);
  };
  useEffect(() => { if (isAdmin) fetchSolicitacoes(); }, [isAdmin]);

  const aprovarSolicitacao = async (s: Solicitacao) => {
    // Reativa preservando o papel se ja existe; senao cria como 'user'
    const { data: existente } = await supabase
      .from("crm_user_roles").select("user_id").eq("user_id", s.user_id).maybeSingle();
    const res = existente
      ? await supabase.from("crm_user_roles").update({ ativo: true }).eq("user_id", s.user_id)
      : await supabase.from("crm_user_roles").insert({ user_id: s.user_id, role: "user" as any, ativo: true });
    if (res.error) { toast({ title: "Erro ao aprovar", description: res.error.message, variant: "destructive" }); return; }
    await (supabase as any).from("crm_solicitacoes_acesso").delete().eq("id", s.id);
    toast({ title: "Acesso liberado!" });
    fetchSolicitacoes();
  };
  const rejeitarSolicitacao = async (s: Solicitacao) => {
    const { error } = await (supabase as any)
      .from("crm_solicitacoes_acesso").update({ status: "rejeitada" }).eq("id", s.id);
    if (error) { toast({ title: "Erro ao rejeitar", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Solicitação rejeitada" });
    fetchSolicitacoes();
  };

  // ── Applied filters (restaurados da sessão) ───────────────────────────────
  const [dashInit] = useState<DashPersist>(loadDashFilters);
  const [datePreset,   setDatePreset]   = useState<DatePreset>(dashInit.datePreset ?? "ano");
  const [customRange,  setCustomRange]  = useState<{ from?: Date; to?: Date }>(() => ({
    from: dashInit.customFrom ? new Date(dashInit.customFrom) : undefined,
    to:   dashInit.customTo   ? new Date(dashInit.customTo)   : undefined,
  }));
  const [filterUsers,  setFilterUsers]  = useState<string[]>(dashInit.filterUsers ?? []);
  const [filterEmp,    setFilterEmp]    = useState(dashInit.filterEmp ?? "todos");

  // Salva os filtros na sessão para sobreviver à navegação (voltar pra página)
  useEffect(() => {
    try {
      sessionStorage.setItem(DASH_FILTERS_KEY, JSON.stringify({
        datePreset,
        customFrom: customRange.from ? customRange.from.toISOString() : undefined,
        customTo:   customRange.to   ? customRange.to.toISOString()   : undefined,
        filterUsers,
        filterEmp,
      } as DashPersist));
    } catch { /* ignora quota/serialização */ }
  }, [datePreset, customRange, filterUsers, filterEmp]);

  // ── Pending (inside popover before saving) ────────────────────────────────
  const [dateOpen,       setDateOpen]       = useState(false);
  const [pendingPreset,  setPendingPreset]  = useState<DatePreset>(dashInit.datePreset ?? "ano");
  const [pendingRange,   setPendingRange]   = useState<{ from?: Date; to?: Date }>({});
  const [calTab,         setCalTab]         = useState<"from" | "to">("from");

  // ── Computed date range ───────────────────────────────────────────────────
  const [dateFrom, dateTo] = useMemo<[Date | null, Date | null]>(() => {
    if (datePreset === "custom") {
      return [customRange.from ? startOfDay(customRange.from) : null, customRange.to ? endOfDay(customRange.to) : null];
    }
    return getPresetRange(datePreset);
  }, [datePreset, customRange]);

  // ── Carrega listas estáticas (emps + users) uma vez ───────────────────────
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const empsRes = await supabase.from("crm_empreendimentos").select("id, nome, cidade").eq("ativo", true).order("nome");
      setEmps((empsRes.data as Emp[]) ?? []);
      if (isAdmin) {
        const { data: u } = await supabase.from("user_profiles").select("user_id, nome").order("nome");
        setUsers(
          ((u as any[]) ?? [])
            .filter((x) => isVisibleUser(x.user_id))
            .map((x) => ({ id: x.user_id, nome: x.nome })),
        );
      }
    })();
  }, [isAdmin, user?.id]);

  // ── Carrega negócios + tarefas escopados pelo filtro (servidor) ───────────
  useEffect(() => {
    if (!user?.id || !dateFrom || !dateTo) return;
    const seq = ++fetchSeqRef.current;
    setLoading(true);

    const fromIso = dateFrom.toISOString();
    const toIso   = dateTo.toISOString();
    const responsavelScope: string | string[] | null = !isAdmin
      ? user.id
      : (filterUsers.length > 0 ? filterUsers : null);
    const empScope = filterEmp !== "todos" ? filterEmp : null;

    (async () => {
      try {
        const [dealsAtivos, vendas, counts] = await Promise.all([
          // Ativos do período (filtro por created_at) — leve (~200)
          fetchAllPaged<Deal>((from, to) => {
            let q = supabase.from("crm_deals").select("*")
              .not("status", "in", "(vendido,perdido)")
              .gte("created_at", fromIso).lte("created_at", toIso)
              .order("created_at", { ascending: false })
              .range(from, to);
            if (responsavelScope) q = Array.isArray(responsavelScope) ? q.in("responsavel_id", responsavelScope) : q.eq("responsavel_id", responsavelScope);
            if (empScope)         q = q.eq("empreendimento_id", empScope);
            return q;
          }),
          // Vendas do período — leve (~130)
          fetchAllPaged<Deal>((from, to) => {
            let q = supabase.from("crm_deals").select("*")
              .eq("status", "vendido")
              .gte("data_vendido", fromIso).lte("data_vendido", toIso)
              .order("data_vendido", { ascending: false })
              .range(from, to);
            if (responsavelScope) q = Array.isArray(responsavelScope) ? q.in("responsavel_id", responsavelScope) : q.eq("responsavel_id", responsavelScope);
            if (empScope)         q = q.eq("empreendimento_id", empScope);
            return q;
          }),
          // Perdas + tarefas concluídas: só a CONTAGEM no servidor (evita baixar milhares
          // de linhas só p/ contar). As linhas em si só são buscadas ao abrir o drill-down.
          (supabase as any).rpc("crm_dashboard_counts", {
            p_from: fromIso,
            p_to: toIso,
            p_users: (isAdmin && filterUsers.length > 0) ? filterUsers : null,
            p_emp: empScope,
          }).then((r: any) => (r.data as { perdas: number; atividades: Record<string, number> } | null)),
        ]);

        if (seq !== fetchSeqRef.current) return; // resposta obsoleta
        setDeals(dealsAtivos);
        setVendasDeals(vendas);
        setDashCounts(counts ?? { perdas: 0, atividades: {} });
        setLoading(false);
      } catch (err) {
        if (seq !== fetchSeqRef.current) return;
        console.error("[Dashboard] erro ao carregar dados:", err);
        setLoading(false);
      }
    })();
  }, [user?.id, isAdmin, dateFrom, dateTo, filterUsers, filterEmp]);

  // ── Date button label ─────────────────────────────────────────────────────
  const dateBtnLabel = useMemo(() => {
    if (datePreset === "custom" && customRange.from && customRange.to) {
      return `${fmtDate(customRange.from)} à ${fmtDate(customRange.to)}`;
    }
    return DATE_PRESETS.find((p) => p.value === datePreset)?.label ?? "Período";
  }, [datePreset, customRange]);

  // ── Open popover: seed pending from current ───────────────────────────────
  const openDatePicker = () => {
    setPendingPreset(datePreset);
    setPendingRange(customRange);
    setCalTab("from");
    setDateOpen(true);
  };

  const applyDate = () => {
    setDatePreset(pendingPreset);
    if (pendingPreset === "custom") setCustomRange(pendingRange);
    setDateOpen(false);
  };

  // ── Filtered deals ────────────────────────────────────────────────────────
  const filteredDeals = useMemo(() => deals.filter((d) => {
    if (!isAdmin && d.responsavel_id !== user?.id) return false;
    if (isAdmin && filterUsers.length > 0 && !filterUsers.includes(d.responsavel_id)) return false;
    if (filterEmp !== "todos" && d.empreendimento_id !== filterEmp) return false;
    if (dateFrom && dateTo) {
      const dt = new Date(d.created_at);
      if (dt < dateFrom || dt > dateTo) return false;
    }
    return true;
  }), [deals, isAdmin, user, filterUsers, filterEmp, dateFrom, dateTo]);

  // Perdas e tarefas concluídas: os NÚMEROS vêm de dashCounts (contados no servidor).
  // As linhas só são buscadas ao abrir o drill-down (lazy) — mantém a lista sem
  // baixar milhares de linhas no carregamento.
  const scopeUsers = (): string[] | null =>
    isAdmin ? (filterUsers.length > 0 ? filterUsers : null) : (user ? [user.id] : null);

  const abrirDrillPerdas = async () => {
    if (!dateFrom || !dateTo) return;
    let q = supabase.from("crm_deals").select("*")
      .eq("status", "perdido")
      .gte("data_perdido", dateFrom.toISOString()).lte("data_perdido", dateTo.toISOString())
      .order("data_perdido", { ascending: false }).limit(500);
    const s = scopeUsers();
    if (s) q = q.in("responsavel_id", s);
    if (filterEmp !== "todos") q = q.eq("empreendimento_id", filterEmp);
    const { data } = await q;
    setDrillDown({ kind: "deals", label: "Perdidas", items: (data as Deal[]) ?? [] });
  };

  const abrirDrillTarefas = async (tipo: string) => {
    if (!dateFrom || !dateTo) return;
    let q = supabase.from("crm_tasks")
      .select("id, deal_id, titulo, responsavel_id, tipo, concluida, updated_at")
      .eq("concluida", true).eq("tipo", tipo)
      .gte("updated_at", dateFrom.toISOString()).lte("updated_at", dateTo.toISOString())
      .order("updated_at", { ascending: false }).limit(500);
    const s = scopeUsers();
    if (s) q = q.in("responsavel_id", s);
    const { data } = await q;
    setDrillDown({ kind: "tasks", label: `Tarefas — ${tipo}`, items: (data as Task[]) ?? [] });
  };

  // ── Chart data ────────────────────────────────────────────────────────────
  // Apenas os estágios que não se sobrepõem com tipos de tarefa
  const KPI_STAGES = [
    "lead_recebido", "contato_feito", "visita_agendada",
    "visita_realizada", "ficha_assinada", "proposta_recebida",
  ] as const;

  const statusData = useMemo(
    () => KANBAN_COLUMNS
      .filter((col) => (KPI_STAGES as readonly string[]).includes(col.value))
      .map((col) => ({ name: col.label, value: filteredDeals.filter((d) => d.status === col.value).length })),
    [filteredDeals],
  );

  const filteredVendas = useMemo(() => vendasDeals.filter((d) => {
    if (!isAdmin && d.responsavel_id !== user?.id) return false;
    if (isAdmin && filterUsers.length > 0 && !filterUsers.includes(d.responsavel_id)) return false;
    if (filterEmp !== "todos" && d.empreendimento_id !== filterEmp) return false;
    if (dateFrom && dateTo) {
      const dt = new Date((d as any).data_vendido ?? d.created_at);
      if (dt < dateFrom || dt > dateTo) return false;
    }
    return true;
  }), [vendasDeals, isAdmin, user, filterUsers, filterEmp, dateFrom, dateTo]);

  const vendasCount  = filteredVendas.length;
  const perdasCount  = dashCounts.perdas;

  const vgv = useMemo(
    () => filteredVendas.reduce((sum, d) => sum + (d.preco_lote ?? 0), 0),
    [filteredVendas],
  );

  // Gatilho: quantas das vendas do período tiveram entrada >= 10% do valor à vista
  const gatilhoCount = useMemo(
    () => filteredVendas.filter(atingiuGatilho).length,
    [filteredVendas],
  );
  const gatilhoPct = vendasCount > 0 ? Math.round((gatilhoCount / vendasCount) * 100) : 0;

  const fmtBRL = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  const funnelData = useMemo(
    () => KANBAN_COLUMNS.map((col, i) => ({
      name: col.label,
      value: filteredDeals.filter((d) => d.status === col.value).length,
      fill: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
    })).filter((d) => d.value > 0),
    [filteredDeals],
  );

  const qualData = useMemo(() => {
    const c = { frio: 0, morno: 0, quente: 0 };
    filteredDeals.forEach((d) => { if (d.qualificacao in c) c[d.qualificacao as keyof typeof c]++; });
    return [
      { name: "Frio",   value: c.frio,   fill: "hsl(var(--qual-frio))" },
      { name: "Morno",  value: c.morno,  fill: "hsl(var(--qual-morno))" },
      { name: "Quente", value: c.quente, fill: "hsl(var(--qual-quente))" },
    ];
  }, [filteredDeals]);

  const performanceData = useMemo(() => {
    if (!isAdmin || users.length === 0) return [];
    const map: Record<string, { total: number; quente: number }> = {};
    filteredDeals.forEach((d) => {
      if (!map[d.responsavel_id]) map[d.responsavel_id] = { total: 0, quente: 0 };
      map[d.responsavel_id].total++;
      if (d.qualificacao === "quente") map[d.responsavel_id].quente++;
    });
    return Object.entries(map).map(([uid, v]) => ({
      name: users.find((x) => x.id === uid)?.nome ?? "—", ...v,
    })).sort((a, b) => b.total - a.total);
  }, [filteredDeals, users, isAdmin]);

  const activityData = useMemo(
    () => TASK_TIPOS.map((tipo) => ({
      tipo,
      count: dashCounts.atividades[tipo] ?? 0,
      cfg: TIPO_CONFIG[tipo],
    })),
    [dashCounts],
  );
  const atividadesTotal = useMemo(
    () => Object.values(dashCounts.atividades).reduce((a, b) => a + b, 0),
    [dashCounts],
  );

  if (loading) return <AppLayout><div className="text-center text-muted-foreground py-12">Carregando...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* Header ---------------------------------------------------------- */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{filteredDeals.length} negociações no período</p>
          </div>

          {/* Filters row */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* Date picker ------------------------------------------------ */}
            <Popover open={dateOpen} onOpenChange={(o) => { if (o) openDatePicker(); else setDateOpen(false); }}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2 font-normal">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {dateBtnLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end" sideOffset={6}>
                <div className="flex divide-x">

                  {/* Preset list */}
                  <div className="flex flex-col py-2 min-w-[200px]">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 pb-2">Data</p>
                    {DATE_PRESETS.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => { setPendingPreset(p.value); if (p.value !== "custom") setCalTab("from"); }}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors",
                          pendingPreset === p.value && "bg-primary text-primary-foreground hover:bg-primary/90",
                        )}
                      >
                        <Check className={cn("h-3.5 w-3.5 flex-shrink-0", pendingPreset === p.value ? "opacity-100" : "opacity-0")} />
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Calendar (custom only) */}
                  {pendingPreset === "custom" && (
                    <div className="p-3 space-y-2">
                      {/* Tabs */}
                      <div className="flex border-b">
                        {(["from", "to"] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setCalTab(tab)}
                            className={cn(
                              "px-4 py-2 text-sm border-b-2 -mb-px transition-colors",
                              calTab === tab ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground",
                            )}
                          >
                            {tab === "from" ? "Data Inicial" : "Data Final"}
                          </button>
                        ))}
                      </div>
                      {/* Range display */}
                      {pendingRange.from && pendingRange.to && (
                        <p className="text-xs text-center font-medium text-primary bg-primary/10 rounded-md py-1">
                          {fmtDate(pendingRange.from)} à {fmtDate(pendingRange.to)}
                        </p>
                      )}
                      <Calendar
                        mode="single"
                        locale={ptBR}
                        selected={calTab === "from" ? pendingRange.from : pendingRange.to}
                        onSelect={(date) => {
                          if (!date) return;
                          if (calTab === "from") {
                            setPendingRange((r) => ({ ...r, from: date }));
                            setCalTab("to");
                          } else {
                            setPendingRange((r) => ({ ...r, to: date }));
                          }
                        }}
                        disabled={(date) =>
                          calTab === "to" && !!pendingRange.from && date < pendingRange.from
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-4 py-3 border-t bg-muted/30">
                  <Button variant="outline" size="sm" onClick={() => setDateOpen(false)}>Cancelar</Button>
                  <Button
                    size="sm"
                    disabled={pendingPreset === "custom" && (!pendingRange.from || !pendingRange.to)}
                    onClick={applyDate}
                  >
                    Salvar
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Empreendimento -------------------------------------------- */}
            <Select value={filterEmp} onValueChange={setFilterEmp}>
              <SelectTrigger className="h-9 text-sm w-[180px]">
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />
                <SelectValue placeholder="Empreendimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os empreendimentos</SelectItem>
                {emps.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.nome}{e.cidade ? ` (${e.cidade})` : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Consultor (admin only) ------------------------------------- */}
            {isAdmin && (
              <div className="w-[190px]">
                <MultiSelectFilter
                  label="Consultor"
                  options={users.map((u) => ({ value: u.id, label: u.nome }))}
                  selected={filterUsers}
                  onChange={setFilterUsers}
                />
              </div>
            )}
          </div>
        </div>

        {/* Solicitações de acesso (admin) ---------------------------------- */}
        {isAdmin && solicitacoes.length > 0 && (
          <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/20 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-semibold">Solicitações de acesso</p>
              <Badge variant="secondary">{solicitacoes.length}</Badge>
            </div>
            <div className="divide-y">
              {solicitacoes.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.nome || "—"}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" onClick={() => aprovarSolicitacao(s)}>Aprovar</Button>
                    <Button size="sm" variant="outline" onClick={() => rejeitarSolicitacao(s)}>Rejeitar</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPI Cards ------------------------------------------------------- */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statusData.map((s) => {
            const col = KANBAN_COLUMNS.find((c) => c.label === s.name);
            return (
              <button
                key={s.name}
                className="group text-left rounded-xl border bg-card px-4 py-4 hover:bg-accent/40 transition-colors"
                onClick={() => col && setDrillDown({
                  kind: "deals",
                  label: s.name,
                  items: filteredDeals.filter((d) => d.status === col.value),
                })}
              >
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground truncate">{s.name}</p>
                <p className="text-3xl font-bold mt-1 tabular-nums">{s.value}</p>
              </button>
            );
          })}

          {/* Vendas */}
          <button
            className="group text-left rounded-xl border bg-card px-4 py-4 hover:bg-accent/40 transition-colors"
            onClick={() => setDrillDown({ kind: "deals", label: "Vendas", items: filteredVendas })}
          >
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Vendas</p>
            </div>
            <p className={cn("text-3xl font-bold mt-1 tabular-nums", vendasCount > 0 ? "text-green-600 dark:text-green-400" : "")}>
              {vendasCount}
            </p>
          </button>

          {/* Perdidas */}
          <button
            className="group text-left rounded-xl border bg-card px-4 py-4 hover:bg-accent/40 transition-colors"
            onClick={abrirDrillPerdas}
          >
            <div className="flex items-center gap-1.5">
              <TrendingDown className="h-3 w-3 text-red-500" />
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Perdidas</p>
            </div>
            <p className={cn("text-3xl font-bold mt-1 tabular-nums", perdasCount > 0 ? "text-red-600 dark:text-red-400" : "")}>
              {perdasCount}
            </p>
          </button>
        </div>

        {/* VGV --------------------------------------------------------------- */}
        <button
          className="w-full text-left rounded-xl border bg-card px-5 py-4 flex items-center justify-between hover:bg-accent/40 transition-colors"
          onClick={() => setDrillDown({ kind: "deals", label: "VGV Realizado", items: filteredVendas })}
        >
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">VGV Realizado</p>
            <p className="text-xs text-muted-foreground mt-0.5">{vendasCount} venda{vendasCount !== 1 ? "s" : ""} no período</p>
          </div>
          <p className={cn("text-2xl font-bold tabular-nums", vgv > 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground")}>
            {fmtBRL(vgv)}
          </p>
        </button>

        {/* Gatilho de Entrada ---------------------------------------------- */}
        <button
          className="w-full text-left rounded-xl border bg-card px-5 py-4 hover:bg-accent/40 transition-colors"
          onClick={() => setDrillDown({ kind: "gatilho", label: "Gatilho de Entrada (≥ 10%)", items: filteredVendas })}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Gatilho de Entrada</p>
              <p className="text-xs text-muted-foreground mt-0.5">Entrada ≥ 10% do valor à vista do lote</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={cn("text-2xl font-bold tabular-nums", gatilhoCount > 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground")}>
                {gatilhoCount}
                <span className="text-base font-medium text-muted-foreground"> / {vendasCount}</span>
              </p>
              <p className="text-xs text-muted-foreground tabular-nums">{gatilhoPct}% das vendas</p>
            </div>
          </div>
          {vendasCount > 0 && (
            <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${gatilhoPct}%` }} />
            </div>
          )}
        </button>

        {/* Atividades Realizadas ------------------------------------------- */}
        <div className="rounded-xl border bg-card">
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Tarefas Finalizadas</p>
            <p className="text-xs text-muted-foreground tabular-nums">{atividadesTotal} total</p>
          </div>
          <div className="px-3 pb-3">
            {activityData.map(({ tipo, count, cfg }) => {
              const Icon = cfg.icon;
              return (
                <button
                  key={tipo}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent/50 transition-colors text-left"
                  onClick={() => abrirDrillTarefas(tipo)}
                >
                  <span className={cn("flex items-center justify-center h-6 w-6 rounded-md flex-shrink-0", cfg.color)}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex-1 text-sm text-foreground">{tipo}</span>
                  <span className="text-sm font-semibold tabular-nums text-muted-foreground">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Charts ---------------------------------------------------------- */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border bg-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Funil de Vendas</CardTitle></CardHeader>
            <CardContent>
              {funnelData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <FunnelChart>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
                    <Funnel dataKey="value" data={funnelData} isAnimationActive>
                      <LabelList position="center" fill="hsl(var(--card-foreground))" fontSize={12} formatter={(v: number) => v > 0 ? v : ""} />
                      {funnelData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground py-12 text-sm">Sem dados</div>
              )}
            </CardContent>
          </Card>

          <Card className="border bg-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Por Qualificação</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={qualData} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "hsl(var(--foreground))", fontSize: 13 }} width={60} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                    {qualData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance (admin only) ---------------------------------------- */}
        {isAdmin && performanceData.length > 0 && (
          <Card className="border bg-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Performance por Vendedor</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={Math.max(200, performanceData.length * 50)}>
                <BarChart data={performanceData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "hsl(var(--foreground))", fontSize: 13 }} width={100} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
                  <Bar dataKey="total"  name="Total"   fill="hsl(var(--primary))"     radius={[0, 6, 6, 0]} barSize={20} />
                  <Bar dataKey="quente" name="Quentes" fill="hsl(var(--qual-quente))" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Drilldown Sheet ─────────────────────────────────────────────────── */}
      <Sheet open={!!drillDown} onOpenChange={(o) => { if (!o) setDrillDown(null); }}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="text-base font-display">{drillDown?.label}</SheetTitle>
            <p className="text-xs text-muted-foreground">
              {drillDown?.items.length ?? 0} {drillDown?.kind === "tasks" ? "tarefa" : drillDown?.kind === "gatilho" ? "venda" : "negociação"}{(drillDown?.items.length ?? 0) !== 1 ? "s" : ""}
            </p>
          </SheetHeader>

          <ScrollArea className="flex-1">
            {drillDown?.kind === "deals" && (
              <div className="divide-y">
                {drillDown.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">Nenhuma negociação</p>
                ) : drillDown.items.map((deal) => (
                  <Link
                    key={deal.id}
                    to={`/negociacoes/${deal.id}`}
                    className="w-full flex items-center gap-3 px-6 py-4 hover:bg-accent/50 text-left transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{deal.cliente_nome}</p>
                      {deal.preco_lote != null && (
                        <p className="text-xs text-muted-foreground mt-0.5">{fmtBRL(deal.preco_lote)}</p>
                      )}
                    </div>
                    <Badge className={cn("text-xs flex-shrink-0", QUAL_COLORS[deal.qualificacao] ?? "bg-muted text-foreground")}>
                      {deal.qualificacao}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}

            {drillDown?.kind === "gatilho" && (
              <div className="divide-y">
                {drillDown.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">Nenhuma venda</p>
                ) : [...drillDown.items]
                    .sort((a, b) => Number(atingiuGatilho(a)) - Number(atingiuGatilho(b)))
                    .map((deal) => {
                  const preco   = deal.preco_lote ?? 0;
                  const entrada = entradaDeal(deal);
                  const pct     = preco > 0 ? Math.round((entrada / preco) * 100) : 0;
                  const ok      = atingiuGatilho(deal);
                  const aVista  = (deal as any).forma_pagamento === "à vista";
                  return (
                    <Link
                      key={deal.id}
                      to={`/negociacoes/${deal.id}`}
                      className="w-full flex items-center gap-3 px-6 py-4 hover:bg-accent/50 text-left transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{deal.cliente_nome}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {aVista
                            ? "À vista"
                            : entrada > 0
                              ? `Entrada ${fmtBRL(entrada)} · ${pct}%`
                              : "Sem entrada"}
                          {preco > 0 && ` · lote ${fmtBRL(preco)}`}
                        </p>
                      </div>
                      <Badge className={cn(
                        "text-xs flex-shrink-0",
                        ok
                          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
                      )}>
                        {ok ? "Atingiu" : "Não atingiu"}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}

            {drillDown?.kind === "tasks" && (
              <div className="divide-y">
                {drillDown.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">Nenhuma tarefa</p>
                ) : drillDown.items.map((task) => {
                  const deal = deals.find((d) => d.id === task.deal_id);
                  const cfg  = task.tipo ? TIPO_CONFIG[task.tipo] : null;
                  const Icon = cfg?.icon;
                  return (
                    <Link
                      key={task.id}
                      to={`/negociacoes/${task.deal_id}`}
                      className="w-full flex items-center gap-3 px-6 py-4 hover:bg-accent/50 text-left transition-colors"
                    >
                      {Icon && cfg && (
                        <span className={cn("flex items-center justify-center h-7 w-7 rounded-md flex-shrink-0", cfg.color)}>
                          <Icon className="h-4 w-4" />
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.titulo ?? "(sem título)"}</p>
                        {deal && <p className="text-xs text-muted-foreground truncate mt-0.5">{deal.cliente_nome}</p>}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

    </AppLayout>
  );
}
