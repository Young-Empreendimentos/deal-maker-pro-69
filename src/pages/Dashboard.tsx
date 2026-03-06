import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/crm/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KANBAN_COLUMNS, QUAL_COLORS, type Deal } from "@/pages/Negociacoes";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  FunnelChart, Funnel, LabelList, Cell,
} from "recharts";

type UserOption = { id: string; email: string; nome: string };

const FUNNEL_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--accent))",
];

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("crm_deals").select("*");
      setDeals((data as Deal[]) ?? []);
      if (isAdmin) {
        const { data: u } = await supabase.rpc("get_all_users_with_roles");
        setUsers(((u as any[]) ?? []).map((x) => ({ id: x.id, email: x.email, nome: x.nome })));
      }
      setLoading(false);
    };
    load();
  }, [isAdmin]);

  const statusData = useMemo(
    () => KANBAN_COLUMNS.map((col) => ({
      name: col.label,
      value: deals.filter((d) => d.status === col.value).length,
    })),
    [deals]
  );

  const funnelData = useMemo(
    () => KANBAN_COLUMNS.map((col, i) => ({
      name: col.label,
      value: deals.filter((d) => d.status === col.value).length,
      fill: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
    })).filter((d) => d.value > 0),
    [deals]
  );

  const qualData = useMemo(() => {
    const counts = { frio: 0, morno: 0, quente: 0 };
    deals.forEach((d) => { if (d.qualificacao in counts) counts[d.qualificacao as keyof typeof counts]++; });
    return [
      { name: "Frio", value: counts.frio, fill: "hsl(var(--qual-frio))" },
      { name: "Morno", value: counts.morno, fill: "hsl(var(--qual-morno))" },
      { name: "Quente", value: counts.quente, fill: "hsl(var(--qual-quente))" },
    ];
  }, [deals]);

  const performanceData = useMemo(() => {
    if (!isAdmin || users.length === 0) return [];
    const map: Record<string, { total: number; quente: number }> = {};
    deals.forEach((d) => {
      if (!map[d.responsavel_id]) map[d.responsavel_id] = { total: 0, quente: 0 };
      map[d.responsavel_id].total++;
      if (d.qualificacao === "quente") map[d.responsavel_id].quente++;
    });
    return Object.entries(map).map(([uid, v]) => {
      const u = users.find((x) => x.id === uid);
      return { name: u?.nome || u?.email?.split("@")[0] || "—", ...v };
    }).sort((a, b) => b.total - a.total);
  }, [deals, users, isAdmin]);

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center text-muted-foreground py-12">Carregando...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{deals.length} negociações no total</p>
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
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Funnel dataKey="value" data={funnelData} isAnimationActive>
                      <LabelList position="center" fill="hsl(var(--card-foreground))" fontSize={12} formatter={(v: number) => v > 0 ? v : ""} />
                      {funnelData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
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
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                    {qualData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
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
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                  />
                  <Bar dataKey="total" name="Total" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={20} />
                  <Bar dataKey="quente" name="Quentes" fill="hsl(var(--qual-quente))" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
