import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/crm/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRangeFilter, type DateRange } from "@/components/crm/DateRangeFilter";
import { MultiSelectFilter } from "@/components/crm/MultiSelectFilter";
import { TrendingUp, DollarSign, Target, Percent, Download, Search, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

type Deal = {
  id: string;
  cliente_nome: string;
  status: string;
  numero_lote: string | null;
  preco_lote: number | null;
  valor_entrada: number | null;
  forma_pagamento: string | null;
  data_vendido: string | null;
  data_perdido: string | null;
  created_at: string;
  empreendimento_id: string | null;
  responsavel_id: string | null;
  responsavel_venda_user_id: string | null;
  responsavel_venda_corretor_id: string | null;
  responsavel_venda_original: string | null;
  fonte_id: string | null;
  fonte_original: string | null;
  utm_campaign: string | null;
};

const BRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const REPORT_TIME_ZONE = "America/Sao_Paulo";
const reportDateParts = new Intl.DateTimeFormat("pt-BR", {
  timeZone: REPORT_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const parseDbDate = (value: string | null) => {
  if (!value) return null;
  let normalized = value.trim().replace(/^(\d{4}-\d{2}-\d{2})\s+(\d)/, "$1T$2");
  normalized = normalized.replace(/\.([0-9]{3})[0-9]+/, ".$1");
  normalized = normalized.replace(/([+-]\d{2})$/, "$1:00");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const dateKey = (value: string | null) => {
  const parsed = parseDbDate(value);
  if (!parsed) return "";
  const parts = reportDateParts.formatToParts(parsed);
  const day = parts.find((p) => p.type === "day")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const year = parts.find((p) => p.type === "year")?.value;
  return year && month && day ? `${year}-${month}-${day}` : "";
};

const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  const parsed = parseDbDate(iso);
  return parsed ? reportDateParts.format(parsed) : "—";
};

function toCSV(rows: Record<string, unknown>[], cols: { key: string; label: string }[]) {
  const head = cols.map((c) => `"${c.label}"`).join(";");
  const body = rows
    .map((r) =>
      cols
        .map((c) => {
          const v = r[c.key];
          if (v == null) return "";
          const s = String(v).replace(/"/g, '""');
          return `"${s}"`;
        })
        .join(";"),
    )
    .join("\n");
  return head + "\n" + body;
}

export default function Relatorios() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [empMap, setEmpMap] = useState<Record<string, string>>({});
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [corretorMap, setCorretorMap] = useState<Record<string, string>>({});
  const [fonteMap, setFonteMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Filtros — padrão: últimos 30 dias
  const today = new Date();
  const def30 = new Date();
  def30.setDate(today.getDate() - 30);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const [period, setPeriod] = useState<DateRange>({ from: iso(def30), to: iso(today) });
  const [empSel, setEmpSel] = useState<string[]>([]);
  const [respSel, setRespSel] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const COLS =
        "id, cliente_nome, status, numero_lote, preco_lote, valor_entrada, forma_pagamento, data_vendido, data_perdido, created_at, empreendimento_id, responsavel_id, responsavel_venda_user_id, responsavel_venda_corretor_id, responsavel_venda_original, fonte_id, fonte_original, utm_campaign";
      // Paginação: o PostgREST tem teto de linhas por requisição (max-rows),
      // então buscamos em páginas de 1000 até esgotar.
      const fetchAllDeals = async (): Promise<Deal[]> => {
        const PAGE = 1000;
        const all: Deal[] = [];
        let from = 0;
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { data, error } = await supabase
            .from("crm_deals")
            .select(COLS)
            .order("created_at", { ascending: false })
            .range(from, from + PAGE - 1);
          if (error) {
            console.error("Erro ao buscar deals:", error);
            break;
          }
          const batch = (data as Deal[]) ?? [];
          all.push(...batch);
          if (batch.length < PAGE) break;
          from += PAGE;
        }
        return all;
      };

      const [d, { data: e }, { data: u }, { data: c }, { data: f }] = await Promise.all([
        fetchAllDeals(),
        supabase.from("crm_empreendimentos").select("id, nome"),
        supabase.from("user_profiles").select("user_id, nome"),
        supabase.from("comercial_corretores").select("id, nome_exibicao"),
        supabase.from("crm_fontes_lead").select("id, nome"),
      ]);
      setDeals(d);
      setEmpMap(Object.fromEntries((e ?? []).map((x: any) => [x.id, x.nome])));
      setUserMap(Object.fromEntries((u ?? []).map((x: any) => [x.user_id, x.nome])));
      setCorretorMap(Object.fromEntries((c ?? []).map((x: any) => [x.id, x.nome_exibicao])));
      setFonteMap(Object.fromEntries((f ?? []).map((x: any) => [x.id, x.nome])));
      setLoading(false);
    })();
  }, []);

  const empOptions = useMemo(
    () =>
      Object.entries(empMap)
        .map(([value, label]) => ({ value, label: label as string }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [empMap],
  );

  const respOptions = useMemo(() => {
    // Lista de responsáveis-venda que aparecem nos deals
    const set = new Map<string, string>();
    for (const d of deals) {
      if (d.responsavel_venda_user_id && userMap[d.responsavel_venda_user_id])
        set.set("u:" + d.responsavel_venda_user_id, userMap[d.responsavel_venda_user_id]);
      if (d.responsavel_venda_corretor_id && corretorMap[d.responsavel_venda_corretor_id])
        set.set(
          "c:" + d.responsavel_venda_corretor_id,
          corretorMap[d.responsavel_venda_corretor_id],
        );
      if (d.responsavel_id && userMap[d.responsavel_id])
        set.set("u:" + d.responsavel_id, userMap[d.responsavel_id]);
    }
    return Array.from(set.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [deals, userMap, corretorMap]);

  const respKey = (d: Deal): string | null => {
    if (d.responsavel_venda_user_id) return "u:" + d.responsavel_venda_user_id;
    if (d.responsavel_venda_corretor_id) return "c:" + d.responsavel_venda_corretor_id;
    if (d.responsavel_id) return "u:" + d.responsavel_id;
    return null;
  };

  const respLabel = (d: Deal) => {
    if (d.responsavel_venda_user_id && userMap[d.responsavel_venda_user_id])
      return userMap[d.responsavel_venda_user_id];
    if (d.responsavel_venda_corretor_id && corretorMap[d.responsavel_venda_corretor_id])
      return corretorMap[d.responsavel_venda_corretor_id];
    if (d.responsavel_id && userMap[d.responsavel_id]) return userMap[d.responsavel_id];
    return d.responsavel_venda_original || "—";
  };

  // Filtrar deals
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deals.filter((d) => {
      // Vendas sem data_vendido NÃO entram no filtro de período
      // (são exibidas separadamente em "Vendas sem data de fechamento")
      const refKey = d.status === "vendido" ? dateKey(d.data_vendido) : dateKey(d.created_at);
      if (d.status === "vendido") {
        if (!refKey) return false;
      }
      if (period.from && refKey < period.from) return false;
      if (period.to && refKey > period.to) return false;
      if (empSel.length && (!d.empreendimento_id || !empSel.includes(d.empreendimento_id)))
        return false;
      if (respSel.length) {
        const k = respKey(d);
        if (!k || !respSel.includes(k)) return false;
      }
      if (q && !(d.cliente_nome || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [deals, period, empSel, respSel, search]);

  const vendas = filtered.filter((d) => d.status === "vendido");
  const perdas = filtered.filter((d) => d.status === "perdido");

  // Vendas sem data de fechamento (independente do período, mas respeita emp/resp/busca)
  const vendasSemData = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deals.filter((d) => {
      if (d.status !== "vendido" || d.data_vendido) return false;
      if (empSel.length && (!d.empreendimento_id || !empSel.includes(d.empreendimento_id)))
        return false;
      if (respSel.length) {
        const k = respKey(d);
        if (!k || !respSel.includes(k)) return false;
      }
      if (q && !(d.cliente_nome || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [deals, empSel, respSel, search]);
  const [mostrarSemData, setMostrarSemData] = useState(false);

  const totalValor = vendas.reduce((s, d) => s + (Number(d.preco_lote) || 0), 0);
  const ticket = vendas.length > 0 ? totalValor / vendas.length : 0;
  const conversao = filtered.length > 0 ? (vendas.length / filtered.length) * 100 : 0;

  // Vendas por dia
  const porDia = useMemo(() => {
    const map = new Map<string, { dia: string; vendas: number; valor: number }>();
    for (const d of vendas) {
      const day = dateKey(d.data_vendido || d.created_at);
      if (!day) continue;
      const cur = map.get(day) || { dia: day, vendas: 0, valor: 0 };
      cur.vendas += 1;
      cur.valor += Number(d.preco_lote) || 0;
      map.set(day, cur);
    }
    return Array.from(map.values()).sort((a, b) => a.dia.localeCompare(b.dia));
  }, [vendas]);

  // Vendas por empreendimento
  const porEmp = useMemo(() => {
    const map = new Map<string, { nome: string; vendas: number; valor: number }>();
    for (const d of vendas) {
      const nome = (d.empreendimento_id && empMap[d.empreendimento_id]) || "—";
      const cur = map.get(nome) || { nome, vendas: 0, valor: 0 };
      cur.vendas += 1;
      cur.valor += Number(d.preco_lote) || 0;
      map.set(nome, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.valor - a.valor);
  }, [vendas, empMap]);

  // Ranking responsáveis
  const porResp = useMemo(() => {
    const map = new Map<string, { nome: string; vendas: number; valor: number }>();
    for (const d of vendas) {
      const nome = respLabel(d);
      const cur = map.get(nome) || { nome, vendas: 0, valor: 0 };
      cur.vendas += 1;
      cur.valor += Number(d.preco_lote) || 0;
      map.set(nome, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.valor - a.valor);
  }, [vendas, userMap, corretorMap]);

  const exportar = () => {
    const rows = vendas.map((d) => ({
      data: fmtDate(d.data_vendido),
      cliente: d.cliente_nome,
      empreendimento: (d.empreendimento_id && empMap[d.empreendimento_id]) || "",
      lote: d.numero_lote || "",
      valor: d.preco_lote || 0,
      entrada: d.valor_entrada || 0,
      pagamento: d.forma_pagamento || "",
      responsavel: respLabel(d),
      origem: (d.fonte_id && fonteMap[d.fonte_id]) || d.fonte_original || "",
      campanha: d.utm_campaign || "",
    }));
    const csv = toCSV(rows, [
      { key: "data", label: "Data" },
      { key: "cliente", label: "Cliente" },
      { key: "empreendimento", label: "Empreendimento" },
      { key: "lote", label: "Lote" },
      { key: "valor", label: "Valor" },
      { key: "entrada", label: "Entrada" },
      { key: "pagamento", label: "Pagamento" },
      { key: "responsavel", label: "Responsável" },
      { key: "origem", label: "Origem" },
      { key: "campanha", label: "Campanha" },
    ]);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-vendas-${period.from || "inicio"}-${period.to || "fim"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-sm text-muted-foreground">Performance comercial e funil de vendas</p>
          </div>
          <Button onClick={exportar} variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <DateRangeFilter label="Período" value={period} onChange={setPeriod} />
              <MultiSelectFilter
                label="Empreendimento"
                options={empOptions}
                selected={empSel}
                onChange={setEmpSel}
              />
              <MultiSelectFilter
                label="Responsável pela venda"
                options={respOptions}
                selected={respSel}
                onChange={setRespSel}
              />
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Vendas"
            value={vendas.length.toString()}
            sub={`${perdas.length} perdas no período`}
          />
          <KpiCard
            icon={<DollarSign className="h-4 w-4" />}
            label="Valor total"
            value={BRL(totalValor)}
            sub="Soma dos lotes vendidos"
          />
          <KpiCard
            icon={<Target className="h-4 w-4" />}
            label="Ticket médio"
            value={BRL(ticket)}
            sub="Por venda"
          />
          <KpiCard
            icon={<Percent className="h-4 w-4" />}
            label="Conversão"
            value={`${conversao.toFixed(1)}%`}
            sub={`${vendas.length} de ${filtered.length} negociações`}
          />
        </div>

        {/* Alerta vendas sem data de fechamento */}
        {vendasSemData.length > 0 && (
          <Card className="border-amber-500/40 bg-amber-500/5">
            <CardContent className="p-4">
              <button
                onClick={() => setMostrarSemData((v) => !v)}
                className="w-full flex items-center gap-3 text-left"
              >
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {vendasSemData.length} venda{vendasSemData.length > 1 ? "s" : ""} sem data de fechamento
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Essas vendas não aparecem no filtro de período acima. Clique para {mostrarSemData ? "ocultar" : "ver a lista"}.
                  </p>
                </div>
                {mostrarSemData ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {mostrarSemData && (
                <div className="mt-4 border-t pt-3 max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Empreendimento</TableHead>
                        <TableHead>Lote</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Criada em</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendasSemData
                        .slice()
                        .sort((a, b) => b.created_at.localeCompare(a.created_at))
                        .map((d) => (
                          <TableRow key={d.id}>
                            <TableCell className="font-medium">{d.cliente_nome}</TableCell>
                            <TableCell>
                              {(d.empreendimento_id && empMap[d.empreendimento_id]) || (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>{d.numero_lote || "—"}</TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              {d.preco_lote ? BRL(Number(d.preco_lote)) : "—"}
                            </TableCell>
                            <TableCell className="text-sm">{respLabel(d)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {fmtDate(d.created_at)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Gráfico por dia */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Vendas por dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porDia}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="dia"
                    tickFormatter={(v) => v.slice(5)}
                    style={{ fontSize: 11 }}
                  />
                  <YAxis yAxisId="left" style={{ fontSize: 11 }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    style={{ fontSize: 11 }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v: number, name: string) =>
                      name === "valor" ? BRL(v) : v.toString()
                    }
                    labelFormatter={(v) => fmtDate(v + "T00:00:00")}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="vendas" fill="hsl(var(--primary))" name="Vendas" />
                  <Bar
                    yAxisId="right"
                    dataKey="valor"
                    fill="hsl(var(--primary) / 0.4)"
                    name="Valor"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RankingCard title="Por empreendimento" rows={porEmp} />
          <RankingCard title="Por responsável" rows={porResp} />
        </div>

        {/* Tabela detalhada (estilo "Vendas RD automação") */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Vendas detalhadas ({vendas.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Tabela (desktop) */}
            <div className="hidden md:block overflow-auto max-h-[600px]">
              <Table className="min-w-[900px]">
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Empreendimento</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Origem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && vendas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        Nenhuma venda no período/filtro
                      </TableCell>
                    </TableRow>
                  )}
                  {vendas
                    .slice()
                    .sort((a, b) =>
                      (b.data_vendido || b.created_at).localeCompare(a.data_vendido || a.created_at),
                    )
                    .map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="whitespace-nowrap">
                          {fmtDate(d.data_vendido)}
                        </TableCell>
                        <TableCell className="font-medium">{d.cliente_nome}</TableCell>
                        <TableCell>
                          {(d.empreendimento_id && empMap[d.empreendimento_id]) || (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>{d.numero_lote || "—"}</TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {d.preco_lote ? BRL(Number(d.preco_lote)) : "—"}
                        </TableCell>
                        <TableCell>
                          {d.forma_pagamento ? (
                            <Badge variant="secondary" className="text-xs font-normal">
                              {d.forma_pagamento}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{respLabel(d)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {(d.fonte_id && fonteMap[d.fonte_id]) || d.fonte_original || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>

            {/* Cards (mobile) */}
            <div className="md:hidden divide-y max-h-[600px] overflow-auto">
              {loading && (
                <div className="text-center text-muted-foreground py-8 text-sm">Carregando...</div>
              )}
              {!loading && vendas.length === 0 && (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  Nenhuma venda no período/filtro
                </div>
              )}
              {vendas
                .slice()
                .sort((a, b) =>
                  (b.data_vendido || b.created_at).localeCompare(a.data_vendido || a.created_at),
                )
                .map((d) => (
                  <div key={d.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{d.cliente_nome}</div>
                        <div className="text-xs text-muted-foreground">
                          {fmtDate(d.data_vendido)}
                          {d.numero_lote ? ` · Lote ${d.numero_lote}` : ""}
                        </div>
                      </div>
                      <div className="text-right font-mono text-sm whitespace-nowrap">
                        {d.preco_lote ? BRL(Number(d.preco_lote)) : "—"}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(d.empreendimento_id && empMap[d.empreendimento_id]) || "—"}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                      {d.forma_pagamento && (
                        <Badge variant="secondary" className="text-xs font-normal">
                          {d.forma_pagamento}
                        </Badge>
                      )}
                      <span><span className="text-muted-foreground">Resp.:</span> {respLabel(d)}</span>
                      <span>
                        <span className="text-muted-foreground">Origem:</span>{" "}
                        {(d.fonte_id && fonteMap[d.fonte_id]) || d.fonte_original || "—"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
          {icon}
          {label}
        </div>
        <div className="mt-2 text-2xl font-bold font-display">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function RankingCard({
  title,
  rows,
}: {
  title: string;
  rows: { nome: string; vendas: number; valor: number }[];
}) {
  const max = Math.max(...rows.map((r) => r.valor), 1);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Sem dados</p>
        ) : (
          <div className="space-y-2.5">
            {rows.slice(0, 8).map((r) => (
              <div key={r.nome} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate font-medium">{r.nome}</span>
                  <span className="text-muted-foreground tabular-nums whitespace-nowrap ml-3">
                    {r.vendas} · {BRL(r.valor)}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(r.valor / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}