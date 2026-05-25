import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/crm/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KANBAN_COLUMNS, type Deal } from "@/pages/Negociacoes";
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
} from "date-fns";

type UserOption = { id: string; nome: string };
type Task = { id: string; responsavel_id: string; tipo: string | null; concluida: boolean; updated_at: string };

const FUNNEL_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--accent))",
];

const PERIODS = [
  { value: "hoje",   label: "Hoje" },
  { value: "semana", label: "Esta semana" },
  { value: "mes",    label: "Este mês" },
  { value: "ano",    label: "Este ano" },
  { value: "todos",  label: "Todos" },
];

function getPeriodRange(period: string): [Date | null, Date | null] {
  const now = new Date();
  if (period === "hoje")   return [startOfDay(now),  endOfDay(now)];
  if (period === "semana") return [startOfWeek(now, { weekStartsOn: 0 }), endOfWeek(now, { weekStartsOn: 0 })];
  if (period === "mes")    return [startOfMonth(now), endOfMonth(now)];
  if (period === "ano")    return [startOfYear(now),  endOfYear(now)];
  return [null, null];
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [deals, setDeals]   = useState<Deal[]>([]);
  const [tasks, setTasks]   = useState<Task[]>([]);
  const [users, setUsers]   = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [period,     setPeriod]     = useState("mes");
  const [filterUser, setFilterUser] = useState("todos");

  useEffect(() => {
    const load = async () => {
      const [dealsRes, tasksRes] = await Promise.all([
        supabase.from("crm_deals").select("*").order("created_at", { ascending: false }),
        supabase.from("crm_tasks").select("id, responsavel_id, tipo, concluida, updated_at"),
      ]);
      setDeals((dealsRes.data as Deal[]) ?? []);
      setTasks((tasksRes.data as Task[]) ?? []);

      if (isAdmin) {
        const { data: u } = await supabase.from("user_profiles").select("user_id, nome").order("nome");
        setUsers(((u as any[]) ?? []).map((x) => ({ id: x.user_id, nome: x.nome })));
      }
      setLoading(false);
    };
    load();
  }, [isAdmin]);

  // ── filtered deals ──────────────────────────────────────────────────────────
  const filteredDeals = useMemo(() => {
    const [from, to] = getPeriodRange(period);
    return deals.filter((d) => {
      if (!isAdmin && d.responsavel_id !== user?.id) return false;
      if (isAdmin && filterUser !== "todos" && d.responsavel_id !== filterUser) return false;
      if (from && to) {
        const dt = new Date(d.created_at);
        if (dt < from || dt > to) return false;
      }
      return true;
    });
  }, [deals, period, filterUser, isAdmin, user]);

  // ── filtered completed tasks ─────────────────────────────────────────────────
  const filteredTasks = useMemo(() => {
    const [from, to] = getPeriodRange(period);
    return tasks.filter((t) => {
      if (!t.concluida) return false;
      if (!isAdmin && t.responsavel_id !== user?.id) return false;
      if (isAdmin && filterUser !== "todos" && t.responsavel_id !== filterUser) return false;
      if (from && to) {
        const dt = new Date(t.updated_at);
        if (dt < from || dt > to) return false;
      }
      return true;
    });
  }, [tasks, period, filterUser, isAdmin, user]);

  // ── chart data ───────────────────────────────────────────────────────────────
  const statusData = useMemo(
    () => KANBAN_COLUMNS.map((col) => ({
      name: col.label,
      value: filteredDeals.filter((d) => d.status === col.value).length,
    })),
    [filteredDeals]
  );

  const funnelData = useMemo(
    () => KANBAN_COLUMNS.map((col, i) => ({
      name: col.label,
      value: filteredDeals.filter((d) => d.status === col.value).length,
      fill: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
    })).filter((d) => d.value > 0),
    [filteredDeals]
  );

  const qualData = useMemo(() => {
    const counts = { frio: 0, morno: 0, quente: 0 };
    filteredDeals.forEach((d) => { if (d.qualificacao in counts) counts[d.qualificacao as keyof typeof counts]++; });
    return [
      { name: "Frio",    value: counts.frio,   fill: "hsl(var(--qual-frio))" },
      { name: "Morno",   value: counts.morno,  fill: "hsl(var(--qual-morno))" },
      { name: "Quente",  value: counts.quente, fill: "hsl(var(--qual-quente))" },
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
    return Object.entries(map).map(([uid, v]) => {
      const u = users.find((x) => x.id === uid);
      return { name: u?.nome || "—", ...v };
    }).sort((a, b) => b.total - a.total);
  }, [filteredDeals, users, isAdmin]);

  // ── activity data ─────────────────────────────────────────────────────────────
  const activityData = useMemo(() =>
    TASK_TIPOS.map((tipo) => ({
      tipo,
      count: filteredTasks.filter((t) => t.tipo === tipo).length,
      cfg: TIPO_CONFIG[tipo],
    })),
    [filteredTasks]
  );
  const totalAtividades = filteredTasks.length;

  if (loading) return <AppLayout><div className="text-center text-muted-foreground py-12">Carregando...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* Header + filters */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">{filteredDeals.length} negociações no período</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {isAdmin && (
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger className="w-[160px] h-9 text-sm"><SelectValue placeholder="Todos os usuários" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os usuários</SelectItem>
                  {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PERIODS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {statusData.map((s) => (
            <Card key={s.name} className="border bg-card">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-tight">{s.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Atividades Realizadas */}
        <Card className="border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-display">Atividades Realizadas</CardTitle>
              <span className="text-sm font-semibold text-muted-foreground">{totalAtividades} total</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {activityData.map(({ tipo, count, cfg }) => {
                const Icon = cfg.icon;
                return (
                  <div key={tipo} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 ${count > 0 ? "border-transparent " + cfg.color : "border-dashed border-muted bg-muted/30 text-muted-foreground"}`}>
                    <Icon className="h-6 w-6" />
                    <span className="text-2xl font-bold leading-none">{count}</span>
                    <span className="text-xs font-medium">{tipo}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Funnel */}
          <Card className="border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Funil de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              {funnelData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <FunnelChart>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
                    <Funnel dataKey="value" data={funnelData} isAnimationActive>
                      <LabelList position="center" fill="hsl(var(--card-foreground))" fontSize={12} formatter={(v: number) => v > 0 ? v : ""} />
                      {funnelData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground py-12 text-sm">Sem dados</div>
              )}
            </CardContent>
          </Card>

          {/* Qualificação */}
          <Card className="border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Por Qualificação</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={qualData} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "hsl(var(--foreground))", fontSize: 13 }} width={60} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                    {qualData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance por vendedor (admin only) */}
        {isAdmin && performanceData.length > 0 && (
          <Card className="border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Performance por Vendedor</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={Math.max(200, performanceData.length * 50)}>
                <BarChart data={performanceData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "hsl(var(--foreground))", fontSize: 13 }} width={100} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
                  <Bar dataKey="total"  name="Total"   fill="hsl(var(--primary))"      radius={[0, 6, 6, 0]} barSize={20} />
                  <Bar dataKey="quente" name="Quentes" fill="hsl(var(--qual-quente))"  radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
