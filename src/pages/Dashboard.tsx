import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/crm/AppLayout";
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
  subWeeks, subMonths,
  format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Check, SlidersHorizontal, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────
type UserOption = { id: string; nome: string };
type Emp = { id: string; nome: string; cidade: string };
type Task = { id: string; deal_id: string; titulo?: string; responsavel_id: string; tipo: string | null; concluida: boolean; updated_at: string };
type DatePreset = "hoje" | "semana_passada" | "mes" | "mes_passado" | "4_meses" | "ano" | "custom";
type DrillDown =
  | { kind: "deals"; label: string; items: Deal[] }
  | { kind: "tasks"; label: string; items: Task[] };

// ── Constants ─────────────────────────────────────────────────────────────────
const FUNNEL_COLORS = [
  "hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--accent))",
];

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: "hoje",          label: "Hoje" },
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

// ── Component ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [deals,  setDeals]  = useState<Deal[]>([]);
  const [tasks,  setTasks]  = useState<Task[]>([]);
  const [drillDown, setDrillDown] = useState<DrillDown | null>(null);
  const [users,  setUsers]  = useState<UserOption[]>([]);
  const [emps,   setEmps]   = useState<Emp[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Applied filters ──────────────────────────────────────────────────────
  const [datePreset,   setDatePreset]   = useState<DatePreset>("mes");
  const [customRange,  setCustomRange]  = useState<{ from?: Date; to?: Date }>({});
  const [filterUser,   setFilterUser]   = useState("todos");
  const [filterEmp,    setFilterEmp]    = useState("todos");

  // ── Pending (inside popover before saving) ────────────────────────────────
  const [dateOpen,       setDateOpen]       = useState(false);
  const [pendingPreset,  setPendingPreset]  = useState<DatePreset>("mes");
  const [pendingRange,   setPendingRange]   = useState<{ from?: Date; to?: Date }>({});
  const [calTab,         setCalTab]         = useState<"from" | "to">("from");

  useEffect(() => {
    const load = async () => {
      const [dealsRes, tasksRes, empsRes] = await Promise.all([
        supabase.from("crm_deals").select("*").order("created_at", { ascending: false }),
        supabase.from("crm_tasks").select("id, deal_id, titulo, responsavel_id, tipo, concluida, updated_at"),
        supabase.from("crm_empreendimentos").select("id, nome, cidade").eq("ativo", true).order("nome"),
      ]);
      setDeals((dealsRes.data as Deal[]) ?? []);
      setTasks((tasksRes.data as Task[]) ?? []);
      setEmps((empsRes.data as Emp[]) ?? []);

      if (isAdmin) {
        const { data: u } = await supabase.from("user_profiles").select("user_id, nome").order("nome");
        setUsers(((u as any[]) ?? []).map((x) => ({ id: x.user_id, nome: x.nome })));
      }
      setLoading(false);
    };
    load();
  }, [isAdmin]);

  // ── Computed date range ───────────────────────────────────────────────────
  const [dateFrom, dateTo] = useMemo<[Date | null, Date | null]>(() => {
    if (datePreset === "custom") {
      return [customRange.from ? startOfDay(customRange.from) : null, customRange.to ? endOfDay(customRange.to) : null];
    }
    return getPresetRange(datePreset);
  }, [datePreset, customRange]);

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
    if (isAdmin && filterUser !== "todos" && d.responsavel_id !== filterUser) return false;
    if (filterEmp !== "todos" && d.empreendimento_id !== filterEmp) return false;
    if (dateFrom && dateTo) {
      const dt = new Date(d.created_at);
      if (dt < dateFrom || dt > dateTo) return false;
    }
    return true;
  }), [deals, isAdmin, user, filterUser, filterEmp, dateFrom, dateTo]);

  // ── Filtered completed tasks ──────────────────────────────────────────────
  // Filtra consultor/empreendimento via deal, mas usa updated_at da TAREFA
  // para data — não o created_at do deal (que cortaria tarefas de deals antigos).
  const dealsForTasks = useMemo(() =>
    new Set(
      deals.filter((d) => {
        if (!isAdmin && d.responsavel_id !== user?.id) return false;
        if (isAdmin && filterUser !== "todos" && d.responsavel_id !== filterUser) return false;
        if (filterEmp !== "todos" && d.empreendimento_id !== filterEmp) return false;
        return true;
      }).map((d) => d.id),
    ),
  [deals, isAdmin, user, filterUser, filterEmp]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.concluida) return false;
      if (!dealsForTasks.has(t.deal_id)) return false;
      if (dateFrom && dateTo) {
        const dt = new Date(t.updated_at);
        if (dt < dateFrom || dt > dateTo) return false;
      }
      return true;
    });
  }, [tasks, dealsForTasks, dateFrom, dateTo]);

  // ── Chart data ────────────────────────────────────────────────────────────
  // Apenas os estágios que não se sobrepõem com tipos de tarefa
  const KPI_STAGES = ["lead_recebido", "ficha_assinada", "proposta_recebida"] as const;

  const statusData = useMemo(
    () => KANBAN_COLUMNS
      .filter((col) => (KPI_STAGES as readonly string[]).includes(col.value))
      .map((col) => ({ name: col.label, value: filteredDeals.filter((d) => d.status === col.value).length })),
    [filteredDeals],
  );

  const vendasCount  = useMemo(() => filteredDeals.filter((d) => d.status === "vendido").length,  [filteredDeals]);
  const perdasCount  = useMemo(() => filteredDeals.filter((d) => d.status === "perdido").length,  [filteredDeals]);

  const vgv = useMemo(
    () => filteredDeals
      .filter((d) => d.status === "vendido")
      .reduce((sum, d) => sum + (d.preco_lote ?? 0), 0),
    [filteredDeals],
  );

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
      count: filteredTasks.filter((t) => t.tipo === tipo).length,
      cfg: TIPO_CONFIG[tipo],
    })),
    [filteredTasks],
  );

  if (loading) return <AppLayout><div className="text-center text-muted-foreground py-12">Carregando...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* Header ---------------------------------------------------------- */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">{filteredDeals.length} negociações no período</p>
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
                          "flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-accent transition-colors",
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
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger className="h-9 text-sm w-[170px]"><SelectValue placeholder="Consultor" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os consultores</SelectItem>
                  {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* KPI Cards ------------------------------------------------------- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Estágios do funil (sem os que se sobrepõem com tarefas) */}
          {statusData.map((s) => {
            const col = KANBAN_COLUMNS.find((c) => c.label === s.name);
            return (
              <Card
                key={s.name}
                className="border bg-card cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all"
                onClick={() => col && setDrillDown({
                  kind: "deals",
                  label: s.name,
                  items: filteredDeals.filter((d) => d.status === col.value),
                })}
              >
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">{s.name}</p>
                </CardContent>
              </Card>
            );
          })}

          {/* Vendas — destaque verde */}
          <Card
            className={cn(
              "border-2 transition-all cursor-pointer",
              vendasCount > 0
                ? "border-green-400 bg-green-50 dark:bg-green-950/40 dark:border-green-600 hover:shadow-sm hover:border-green-500"
                : "border-dashed border-muted bg-muted/20 hover:border-muted-foreground/30",
            )}
            onClick={() => setDrillDown({ kind: "deals", label: "Vendas", items: filteredDeals.filter((d) => d.status === "vendido") })}
          >
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <TrendingUp className={cn("h-4 w-4", vendasCount > 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground")} />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vendas</p>
              </div>
              <p className={cn("text-3xl font-bold", vendasCount > 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground")}>
                {vendasCount}
              </p>
            </CardContent>
          </Card>

          {/* Perdidas — destaque vermelho */}
          <Card
            className={cn(
              "border-2 transition-all cursor-pointer",
              perdasCount > 0
                ? "border-red-400 bg-red-50 dark:bg-red-950/40 dark:border-red-600 hover:shadow-sm hover:border-red-500"
                : "border-dashed border-muted bg-muted/20 hover:border-muted-foreground/30",
            )}
            onClick={() => setDrillDown({ kind: "deals", label: "Perdidas", items: filteredDeals.filter((d) => d.status === "perdido") })}
          >
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <TrendingDown className={cn("h-4 w-4", perdasCount > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground")} />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Perdidas</p>
              </div>
              <p className={cn("text-3xl font-bold", perdasCount > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground")}>
                {perdasCount}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* VGV --------------------------------------------------------------- */}
        <Card
          className={cn(
            "border-2 transition-all cursor-pointer",
            vgv > 0
              ? "border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 dark:border-green-600 hover:shadow-sm hover:border-green-500"
              : "border-dashed border-muted bg-muted/20 hover:border-muted-foreground/30",
          )}
          onClick={() => setDrillDown({ kind: "deals", label: "VGV Realizado", items: filteredDeals.filter((d) => d.status === "vendido") })}
        >
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center justify-center h-10 w-10 rounded-xl",
                vgv > 0 ? "bg-green-100 dark:bg-green-900/50" : "bg-muted",
              )}>
                <TrendingUp className={cn("h-5 w-5", vgv > 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground")} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">VGV Realizado</p>
                <p className="text-xs text-muted-foreground">{vendasCount} venda{vendasCount !== 1 ? "s" : ""} no período</p>
              </div>
            </div>
            <p className={cn(
              "text-2xl font-bold tabular-nums tracking-tight",
              vgv > 0 ? "text-green-700 dark:text-green-400" : "text-muted-foreground",
            )}>
              {fmtBRL(vgv)}
            </p>
          </CardContent>
        </Card>

        {/* Atividades Realizadas ------------------------------------------- */}
        <Card className="border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Tarefas Finalizadas</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-4">
            <div className="divide-y">
              {activityData.map(({ tipo, count, cfg }) => {
                const Icon = cfg.icon;
                return (
                  <div
                    key={tipo}
                    className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-accent/50 rounded-md px-2 -mx-2 transition-colors"
                    onClick={() => setDrillDown({ kind: "tasks", label: `Tarefas — ${tipo}`, items: filteredTasks.filter((t) => t.tipo === tipo) })}
                  >
                    <span className={cn("flex items-center justify-center h-7 w-7 rounded-md flex-shrink-0", cfg.color)}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-sm text-foreground">{tipo}</span>
                    <span className="text-sm font-semibold tabular-nums">{count}</span>
                  </div>
                );
              })}
            </div>
            {/* Total */}
            <div className="flex items-center gap-3 pt-3 mt-1 border-t">
              <span className="flex-1 text-sm font-semibold text-foreground">Total</span>
              <span className="text-sm font-bold tabular-nums">{filteredTasks.length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Charts ---------------------------------------------------------- */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border bg-card">
            <CardHeader className="pb-2"><CardTitle className="text-base font-display">Funil de Vendas</CardTitle></CardHeader>
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
            <CardHeader className="pb-2"><CardTitle className="text-base font-display">Por Qualificação</CardTitle></CardHeader>
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
            <CardHeader className="pb-2"><CardTitle className="text-base font-display">Performance por Vendedor</CardTitle></CardHeader>
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
              {drillDown?.items.length ?? 0} {drillDown?.kind === "deals" ? "negociação" : "tarefa"}{(drillDown?.items.length ?? 0) !== 1 ? "s" : ""}
            </p>
          </SheetHeader>

          <ScrollArea className="flex-1">
            {drillDown?.kind === "deals" && (
              <div className="divide-y">
                {drillDown.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">Nenhuma negociação</p>
                ) : drillDown.items.map((deal) => (
                  <button
                    key={deal.id}
                    className="w-full flex items-center gap-3 px-6 py-4 hover:bg-accent/50 text-left transition-colors"
                    onClick={() => { navigate(`/negociacoes/${deal.id}`); setDrillDown(null); }}
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
                  </button>
                ))}
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
                    <button
                      key={task.id}
                      className="w-full flex items-center gap-3 px-6 py-4 hover:bg-accent/50 text-left transition-colors"
                      onClick={() => { navigate(`/negociacoes/${task.deal_id}`); setDrillDown(null); }}
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
                    </button>
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
