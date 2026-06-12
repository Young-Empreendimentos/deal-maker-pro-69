import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/crm/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DateRangeFilter, type DateRange } from "@/components/crm/DateRangeFilter";
import { MultiSelectFilter } from "@/components/crm/MultiSelectFilter";
import { isVisibleUser } from "@/lib/filteredUsers";
import { Download } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

type Row = {
  data: string;
  empreendimento_id: string | null;
  responsavel_id: string | null;
  negociacoes_criadas: number;
  leads_recebidos: number;
  contatos_feitos: number;
  visitas_agendadas: number;
  visitas_realizadas: number;
  fichas_assinadas: number;
  vendas: number;
  perdas: number;
};

const METRICAS: { key: keyof Row; label: string }[] = [
  { key: "negociacoes_criadas", label: "Negociações criadas" },
  { key: "leads_recebidos", label: "Leads recebidos" },
  { key: "contatos_feitos", label: "Contatos feitos" },
  { key: "visitas_agendadas", label: "Visitas agendadas" },
  { key: "visitas_realizadas", label: "Visitas realizadas" },
  { key: "fichas_assinadas", label: "Fichas assinadas" },
  { key: "vendas", label: "Vendas" },
  { key: "perdas", label: "Perdas" },
];

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

function toCSV(rows: Record<string, unknown>[], cols: { key: string; label: string }[]) {
  const header = cols.map((c) => `"${c.label}"`).join(";");
  const body = rows
    .map((r) => cols.map((c) => `"${String(r[c.key] ?? "").replace(/"/g, '""')}"`).join(";"))
    .join("\n");
  return header + "\n" + body;
}

export default function RelatorioDiario() {
  const today = new Date().toISOString().slice(0, 10);
  const trintaDias = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);

  const [rows, setRows] = useState<Row[]>([]);
  const [emps, setEmps] = useState<{ id: string; nome: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; nome: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState<DateRange>({ from: trintaDias, to: today });
  const [empSel, setEmpSel] = useState<string[]>([]);
  const [userSel, setUserSel] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [v, e, p] = await Promise.all([
        (supabase as any)
          .from("crm_relatorio_vendas_diario")
          .select("*")
          .gte("data", period.from || "1900-01-01")
          .lte("data", period.to || "2999-12-31")
          .order("data", { ascending: false }),
        supabase.from("crm_empreendimentos").select("id,nome").order("nome"),
        supabase.from("user_profiles").select("user_id,nome"),
      ]);
      setRows((v.data as Row[]) || []);
      setEmps((e.data as any[])?.map((x) => ({ id: x.id, nome: x.nome })) || []);
      setUsers(
        (p.data as any[])
          ?.filter((x) => isVisibleUser(x.user_id))
          ?.map((x) => ({ id: x.user_id, nome: x.nome || "—" })) || [],
      );
      setLoading(false);
    })();
  }, [period.from, period.to]);

  const empMap = useMemo(() => Object.fromEntries(emps.map((e) => [e.id, e.nome])), [emps]);
  const userMap = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u.nome])), [users]);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (empSel.length === 0 || (r.empreendimento_id && empSel.includes(r.empreendimento_id))) &&
          (userSel.length === 0 || (r.responsavel_id && userSel.includes(r.responsavel_id))),
      ),
    [rows, empSel, userSel],
  );

  const totais = useMemo(() => {
    const t: Record<string, number> = {};
    METRICAS.forEach((m) => (t[m.key] = 0));
    filtered.forEach((r) => METRICAS.forEach((m) => (t[m.key] += Number(r[m.key]) || 0)));
    return t;
  }, [filtered]);

  const porDia = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    filtered.forEach((r) => {
      const cur = map.get(r.data) || { data: 0 } as any;
      METRICAS.forEach((m) => (cur[m.key] = (cur[m.key] || 0) + (Number(r[m.key]) || 0)));
      map.set(r.data, cur);
    });
    return Array.from(map.entries())
      .map(([data, vals]) => ({ data: fmtDate(data), _sort: data, ...vals }))
      .sort((a, b) => a._sort.localeCompare(b._sort));
  }, [filtered]);

  const porEmp = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    filtered.forEach((r) => {
      const k = r.empreendimento_id || "—";
      const cur = map.get(k) || ({} as any);
      METRICAS.forEach((m) => (cur[m.key] = (cur[m.key] || 0) + (Number(r[m.key]) || 0)));
      map.set(k, cur);
    });
    return Array.from(map.entries())
      .map(([id, vals]) => ({ empreendimento: empMap[id] || "—", ...vals } as Record<string, any>))
      .sort((a, b) => (Number(b.vendas) || 0) - (Number(a.vendas) || 0));
  }, [filtered, empMap]);

  const exportCSV = () => {
    const cols = [
      { key: "data", label: "Data" },
      { key: "empreendimento", label: "Empreendimento" },
      { key: "responsavel", label: "Responsável" },
      ...METRICAS.map((m) => ({ key: m.key as string, label: m.label })),
    ];
    const data = filtered.map((r) => ({
      data: fmtDate(r.data),
      empreendimento: empMap[r.empreendimento_id || ""] || "—",
      responsavel: userMap[r.responsavel_id || ""] || "—",
      ...METRICAS.reduce((acc, m) => ({ ...acc, [m.key]: r[m.key] }), {}),
    }));
    const csv = toCSV(data, cols);
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-diario-${period.from}-${period.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Relatório Diário de Vendas</h1>
            <p className="text-sm text-muted-foreground">
              Funil consolidado por dia, empreendimento e responsável (fuso de São Paulo).
            </p>
          </div>
          <Button onClick={exportCSV} variant="outline" size="sm">
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6 flex flex-wrap items-end gap-3">
            <DateRangeFilter label="Período" value={period} onChange={setPeriod} />
            <MultiSelectFilter
              label="Empreendimentos"
              options={emps.map((e) => ({ value: e.id, label: e.nome }))}
              selected={empSel}
              onChange={setEmpSel}
            />
            <MultiSelectFilter
              label="Responsáveis"
              options={users.map((u) => ({ value: u.id, label: u.nome }))}
              selected={userSel}
              onChange={setUserSel}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {METRICAS.map((m) => (
            <Card key={m.key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">{m.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totais[m.key] || 0}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolução diária</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={porDia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line dataKey="leads_recebidos" name="Leads" stroke="#3b82f6" />
                  <Line dataKey="visitas_realizadas" name="Visitas" stroke="#f59e0b" />
                  <Line dataKey="vendas" name="Vendas" stroke="#16a34a" />
                  <Line dataKey="perdas" name="Perdas" stroke="#dc2626" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Por empreendimento</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porEmp}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="empreendimento" fontSize={10} interval={0} angle={-20} textAnchor="end" height={70} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="leads_recebidos" name="Leads" fill="#3b82f6" />
                  <Bar dataKey="visitas_realizadas" name="Visitas" fill="#f59e0b" />
                  <Bar dataKey="vendas" name="Vendas" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhamento diário</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Empreendimento</TableHead>
                  <TableHead>Responsável</TableHead>
                  {METRICAS.map((m) => (
                    <TableHead key={m.key} className="text-right">{m.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={3 + METRICAS.length} className="text-center text-muted-foreground py-8">Carregando…</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={3 + METRICAS.length} className="text-center text-muted-foreground py-8">Sem dados no período.</TableCell></TableRow>
                ) : filtered.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{fmtDate(r.data)}</TableCell>
                    <TableCell>{empMap[r.empreendimento_id || ""] || "—"}</TableCell>
                    <TableCell>{userMap[r.responsavel_id || ""] || "—"}</TableCell>
                    {METRICAS.map((m) => (
                      <TableCell key={m.key} className="text-right tabular-nums">{Number(r[m.key]) || 0}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}