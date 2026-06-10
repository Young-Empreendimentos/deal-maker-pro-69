import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/crm/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, LayoutGrid, Table as TableIcon, Filter, X, ArrowUpDown, ChevronDown, ChevronRight, TrendingDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DealFormDialog } from "@/components/crm/DealFormDialog";
import { MultiSelectFilter } from "@/components/crm/MultiSelectFilter";
import { DateRangeFilter, type DateRange } from "@/components/crm/DateRangeFilter";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkActionsBar } from "@/components/crm/BulkActionsBar";

export const KANBAN_COLUMNS = [
  { value: "lead_recebido", label: "Lead Recebido" },
  { value: "contato_feito", label: "Contato Feito" },
  { value: "visita_agendada", label: "Visita Agendada" },
  { value: "visita_realizada", label: "Visita Realizada" },
  { value: "ficha_assinada", label: "Ficha Assinada" },
  { value: "proposta_recebida", label: "Proposta Recebida" },
] as const;

export const QUAL_COLORS: Record<string, string> = {
  frio: "bg-[hsl(var(--qual-frio))] text-white",
  morno: "bg-[hsl(var(--qual-morno))] text-white",
  quente: "bg-[hsl(var(--qual-quente))] text-white",
};

export type Deal = {
  id: string;
  cliente_nome: string;
  cliente_email: string | null;
  qualificacao: string;
  status: string;
  responsavel_id: string;
  created_at: string;
  updated_at: string;
  empreendimento_id: string | null;
  fonte_id: string | null;
  ordem_kanban: number;
  interesse: string | null;
  preco_lote: number | null;
};

type Empreendimento = { id: string; nome: string; cidade: string };
type FonteLead = { id: string; nome: string };
type UserOption = { id: string; email: string; nome: string };

const STATUS_FILTER_OPTIONS = [
  { value: "em_andamento", label: "Em andamento" },
  { value: "vendido", label: "Vendido" },
  { value: "perdido", label: "Perdido" },
];

const INTERESSE_OPTIONS = [
  { value: "moradia", label: "Moradia" },
  { value: "investimento", label: "Investimento" },
  { value: "comércio", label: "Comércio" },
  { value: "presente ou doação", label: "Presente ou doação" },
];

const FUNNEL_STAGE_COLORS = [
  { bar: "bg-violet-500",  light: "bg-violet-50  dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800",  text: "text-violet-700 dark:text-violet-300" },
  { bar: "bg-indigo-500",  light: "bg-indigo-50  dark:bg-indigo-950/30", border: "border-indigo-200 dark:border-indigo-800",  text: "text-indigo-700 dark:text-indigo-300" },
  { bar: "bg-blue-500",    light: "bg-blue-50    dark:bg-blue-950/30",   border: "border-blue-200   dark:border-blue-800",    text: "text-blue-700   dark:text-blue-300" },
  { bar: "bg-cyan-500",    light: "bg-cyan-50    dark:bg-cyan-950/30",   border: "border-cyan-200   dark:border-cyan-800",    text: "text-cyan-700   dark:text-cyan-300" },
  { bar: "bg-teal-500",    light: "bg-teal-50    dark:bg-teal-950/30",   border: "border-teal-200   dark:border-teal-800",    text: "text-teal-700   dark:text-teal-300" },
  { bar: "bg-emerald-500", light: "bg-emerald-50 dark:bg-emerald-950/30",border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300" },
];

const PRECO_FAIXAS = [
  { value: "0-100000", label: "Até R$ 100 mil" },
  { value: "100000-200000", label: "R$ 100 - 200 mil" },
  { value: "200000-500000", label: "R$ 200 - 500 mil" },
  { value: "500000-99999999", label: "Acima de R$ 500 mil" },
];

export default function Negociacoes() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [view, setView] = useState<"kanban" | "table" | "funil">("kanban");
  const [openStages, setOpenStages] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter data
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [fontes, setFontes] = useState<FonteLead[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);

  // Multi-select filter state
  const [fStatusGroup, setFStatusGroup] = useState<string[]>(["em_andamento"]);
  const [fConsultor, setFConsultor] = useState<string[]>([]);
  const [fEmpreendimento, setFEmpreendimento] = useState<string[]>([]);
  const [fFonte, setFFonte] = useState<string[]>([]);
  const [fInteresse, setFInteresse] = useState<string[]>([]);
  const [fPreco, setFPreco] = useState<string[]>([]);

  const EMPTY_RANGE: DateRange = { from: "", to: "" };
  const [fDateCriacao,  setFDateCriacao]  = useState<DateRange>(EMPTY_RANGE);
  const [fDateContato,  setFDateContato]  = useState<DateRange>(EMPTY_RANGE);
  const [fDateVenda,    setFDateVenda]    = useState<DateRange>(EMPTY_RANGE);

  const [sortBy, setSortBy] = useState<"created_at" | "cliente_nome" | "qualificacao" | "updated_at">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Seleção em massa (apenas admin, tabela)
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggleSel = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const hasDateFilter = (r: DateRange) => r.from !== "" || r.to !== "";
  const hasFilters = fConsultor.length > 0 || fEmpreendimento.length > 0 || fFonte.length > 0 || fInteresse.length > 0 || fPreco.length > 0
    || hasDateFilter(fDateCriacao) || hasDateFilter(fDateContato) || hasDateFilter(fDateVenda);

  const fetchDeals = async () => {
    setLoading(true);

    // Determinar quais status buscar no servidor baseado no filtro
    const statusesToFetch: string[] = [];
    if (fStatusGroup.length === 0 || fStatusGroup.includes("em_andamento")) {
      statusesToFetch.push(...KANBAN_COLUMNS.map((c) => c.value));
    }
    if (fStatusGroup.length === 0 || fStatusGroup.includes("vendido")) {
      statusesToFetch.push("vendido");
    }
    if (fStatusGroup.length === 0 || fStatusGroup.includes("perdido")) {
      statusesToFetch.push("perdido");
    }

    // Buscar com paginação mas já filtrado por status no servidor
    let allDeals: Deal[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      let query = supabase.from("crm_deals").select("*")
        .in("status", statusesToFetch as any)
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1);
      if (!isAdmin && user) {
        query = query.eq("responsavel_id", user.id);
      }
      const { data } = await query;
      const page = (data as Deal[]) ?? [];
      allDeals = [...allDeals, ...page];
      hasMore = page.length === pageSize;
      from += pageSize;
    }

    setDeals(allDeals);
    setLoading(false);
  };

  useEffect(() => {
    fetchDeals();
    supabase.from("crm_empreendimentos").select("id, nome, cidade").eq("ativo", true).then(({ data }) => setEmpreendimentos((data as Empreendimento[]) ?? []));
    supabase.from("crm_fontes_lead").select("id, nome").eq("ativo", true).then(({ data }) => setFontes((data as FonteLead[]) ?? []));
    if (isAdmin) {
      supabase.from("user_profiles").select("user_id, nome").order("nome").then(({ data }) => {
        setUsers(((data as any[]) ?? []).map((u) => ({ id: u.user_id, email: "", nome: u.nome })));
      });
    }
  }, [isAdmin, fStatusGroup]);

  const qualOrder: Record<string, number> = { frio: 0, morno: 1, quente: 2 };
  const kanbanStatuses = new Set(KANBAN_COLUMNS.map((c) => c.value));

  // Helper: checa se uma data ISO cai dentro de um DateRange
  const inRange = (iso: string, r: DateRange) => {
    if (!r.from && !r.to) return true;
    const d = new Date(iso);
    if (r.from && d < new Date(r.from + "T00:00:00")) return false;
    if (r.to   && d > new Date(r.to   + "T23:59:59")) return false;
    return true;
  };

  const filtered = useMemo(() => {
    const list = deals.filter((d) => {
      // Status group filter
      if (fStatusGroup.length > 0) {
        const isInProgress = kanbanStatuses.has(d.status as any);
        const matchesGroup = fStatusGroup.some((g) => {
          if (g === "em_andamento") return isInProgress;
          return d.status === g;
        });
        if (!matchesGroup) return false;
      }
      if (fConsultor.length > 0 && !fConsultor.includes(d.responsavel_id)) return false;
      if (fEmpreendimento.length > 0 && (!d.empreendimento_id || !fEmpreendimento.includes(d.empreendimento_id))) return false;
      if (fFonte.length > 0 && (!d.fonte_id || !fFonte.includes(d.fonte_id))) return false;
      if (fInteresse.length > 0) {
        // Normaliza registros antigos que tinham "presente" ou "doação" separados
        const normInteresse = (d.interesse === "presente" || d.interesse === "doação")
          ? "presente ou doação"
          : d.interesse;
        if (!normInteresse || !fInteresse.includes(normInteresse)) return false;
      }
      if (fPreco.length > 0) {
        if (!d.preco_lote) return false;
        const matches = fPreco.some((faixa) => {
          const [min, max] = faixa.split("-").map(Number);
          return d.preco_lote! >= min && d.preco_lote! <= max;
        });
        if (!matches) return false;
      }
      // Filtros de data
      if (hasDateFilter(fDateCriacao) && !inRange(d.created_at, fDateCriacao)) return false;
      if (hasDateFilter(fDateContato) && !inRange(d.updated_at, fDateContato)) return false;
      if (hasDateFilter(fDateVenda)) {
        if (d.status !== "vendido") return false;
        if (!inRange(d.updated_at, fDateVenda)) return false;
      }
      return true;
    });
    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "cliente_nome") cmp = a.cliente_nome.localeCompare(b.cliente_nome);
      else if (sortBy === "qualificacao") cmp = (qualOrder[a.qualificacao] ?? 0) - (qualOrder[b.qualificacao] ?? 0);
      else if (sortBy === "updated_at") cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [deals, fStatusGroup, fConsultor, fEmpreendimento, fFonte, fInteresse, fPreco,
      fDateCriacao, fDateContato, fDateVenda, sortBy, sortDir]);

  const clearFilters = () => {
    setFConsultor([]);
    setFEmpreendimento([]);
    setFFonte([]);
    setFInteresse([]);
    setFPreco([]);
    setFDateCriacao(EMPTY_RANGE);
    setFDateContato(EMPTY_RANGE);
    setFDateVenda(EMPTY_RANGE);
  };

  const onDragEnd = async (result: DropResult) => {
    const { draggableId, destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const newStatus = destination.droppableId;
    setDeals((prev) => prev.map((d) => (d.id === draggableId ? { ...d, status: newStatus, ordem_kanban: destination.index } : d)));
    const { error } = await supabase.from("crm_deals").update({ status: newStatus, ordem_kanban: destination.index } as any).eq("id", draggableId);
    if (error) { toast({ title: "Erro ao mover", description: error.message, variant: "destructive" }); fetchDeals(); }
  };

  const consultorOptions = users.map((u) => ({ value: u.id, label: u.nome || u.email }));
  const empreendimentoOptions = empreendimentos.map((e) => ({ value: e.id, label: e.nome }));
  const fonteOptions = fontes.map((f) => ({ value: f.id, label: f.nome }));

  const allFilteredSelected = filtered.length > 0 && filtered.every((d) => selected.has(d.id));
  const someFilteredSelected = filtered.some((d) => selected.has(d.id));
  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((d) => d.id)));
    }
  };
  const selectedDeals = filtered.filter((d) => selected.has(d.id));

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Negociações</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} negociações</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={showFilters ? "secondary" : "outline"} size="sm" onClick={() => setShowFilters(!showFilters)} className="relative">
              <Filter className="h-4 w-4 mr-1" /> Filtros
              {hasFilters && <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />}
            </Button>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-[160px] text-sm h-9">
                <ArrowUpDown className="h-3.5 w-3.5 mr-1 shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Data de criação</SelectItem>
                <SelectItem value="updated_at">Contato recente</SelectItem>
                <SelectItem value="cliente_nome">Nome</SelectItem>
                <SelectItem value="qualificacao">Qualificação</SelectItem>
              </SelectContent>
            </Select>
            <button onClick={() => setSortDir((d) => d === "asc" ? "desc" : "asc")} className="p-2 rounded-md border border-input bg-background text-sm hover:bg-accent transition-colors" title={sortDir === "asc" ? "Crescente" : "Decrescente"}>
              {sortDir === "asc" ? "↑" : "↓"}
            </button>
            <div className="flex bg-muted rounded-md p-0.5">
              <button onClick={() => setView("kanban")} className={cn("p-2 rounded-sm transition-colors", view === "kanban" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")} title="Kanban">
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button onClick={() => setView("funil")} className={cn("p-2 rounded-sm transition-colors", view === "funil" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")} title="Funil">
                <TrendingDown className="h-4 w-4" />
              </button>
              <button onClick={() => setView("table")} className={cn("p-2 rounded-sm transition-colors", view === "table" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")} title="Tabela">
                <TableIcon className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={() => setShowForm(true)} size="sm"><Plus className="h-4 w-4 mr-1" /> Nova</Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="border bg-card">
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <MultiSelectFilter label="Status" options={STATUS_FILTER_OPTIONS} selected={fStatusGroup} onChange={setFStatusGroup} />
                {isAdmin && <MultiSelectFilter label="Consultor" options={consultorOptions} selected={fConsultor} onChange={setFConsultor} />}
                <MultiSelectFilter label="Empreendimento" options={empreendimentoOptions} selected={fEmpreendimento} onChange={setFEmpreendimento} />
                <MultiSelectFilter label="Fonte" options={fonteOptions} selected={fFonte} onChange={setFFonte} />
                <MultiSelectFilter label="Interesse" options={INTERESSE_OPTIONS} selected={fInteresse} onChange={setFInteresse} />
                <MultiSelectFilter label="Preço" options={PRECO_FAIXAS} selected={fPreco} onChange={setFPreco} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 border-t">
                <DateRangeFilter label="Data de Criação" value={fDateCriacao} onChange={setFDateCriacao} />
                <DateRangeFilter label="Último Contato"  value={fDateContato} onChange={setFDateContato} />
                <DateRangeFilter label="Data da Venda"   value={fDateVenda}   onChange={setFDateVenda} />
              </div>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground">
                  <X className="h-3 w-3 mr-1" /> Limpar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center text-muted-foreground py-12">Carregando...</div>
        ) : view === "funil" ? (() => {
          const maxCount = Math.max(1, ...KANBAN_COLUMNS.map((col) => filtered.filter((d) => d.status === col.value).length));
          const toggleStage = (v: string) => setOpenStages((prev) => {
            const next = new Set(prev);
            next.has(v) ? next.delete(v) : next.add(v);
            return next;
          });
          return (
            <div className="space-y-2 max-w-3xl mx-auto">
              {KANBAN_COLUMNS.map((col, i) => {
                const colDeals  = filtered.filter((d) => d.status === col.value);
                const count     = colDeals.length;
                const pct       = Math.round((count / maxCount) * 100);
                const isOpen    = openStages.has(col.value);
                const clr       = FUNNEL_STAGE_COLORS[i % FUNNEL_STAGE_COLORS.length];
                return (
                  <div key={col.value} className={cn("rounded-xl border-2 overflow-hidden transition-all duration-200", clr.border)}>
                    {/* Stage header — clicável */}
                    <button
                      onClick={() => toggleStage(col.value)}
                      className={cn("w-full flex items-center gap-4 px-5 py-4 text-left transition-colors", clr.light, "hover:brightness-95")}
                    >
                      {/* Chevron */}
                      <span className={cn("flex-shrink-0 transition-transform duration-200", isOpen && "rotate-90")}>
                        <ChevronRight className={cn("h-4 w-4", clr.text)} />
                      </span>

                      {/* Label + barra proporcional */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn("text-sm font-semibold", clr.text)}>{col.label}</span>
                          <span className={cn("text-xs font-bold tabular-nums px-2 py-0.5 rounded-full", clr.bar, "text-white")}>
                            {count}
                          </span>
                        </div>
                        {/* Barra proporcional — cria o efeito visual de funil */}
                        <div className="h-1.5 rounded-full bg-black/10 dark:bg-white/10">
                          <div
                            className={cn("h-full rounded-full transition-all duration-500", clr.bar)}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </button>

                    {/* Deals expandidos */}
                    {isOpen && (
                      <div className="border-t border-inherit px-4 py-4 bg-card">
                        {colDeals.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma negociação neste estágio</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {colDeals.map((deal) => (
                              <Card
                                key={deal.id}
                                className="cursor-pointer hover:shadow-md transition-shadow border"
                                onClick={() => navigate(`/negociacoes/${deal.id}`)}
                              >
                                <CardContent className="p-3 space-y-2">
                                  <p className="font-medium text-sm leading-snug">{deal.cliente_nome}</p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge className={cn("text-[10px] px-1.5 py-0", QUAL_COLORS[deal.qualificacao])}>
                                      {deal.qualificacao}
                                    </Badge>
                                    {deal.preco_lote && (
                                      <span className="text-[10px] text-muted-foreground font-medium">
                                        {deal.preco_lote.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                                      </span>
                                    )}
                                    <span className="text-[10px] text-muted-foreground ml-auto">
                                      {new Date(deal.created_at).toLocaleDateString("pt-BR")}
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Resumo final: vendidos + perdidos */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {[
                  { status: "vendido", label: "Vendidos", bar: "bg-green-500", border: "border-green-200 dark:border-green-800", light: "bg-green-50 dark:bg-green-950/30", text: "text-green-700 dark:text-green-300" },
                  { status: "perdido", label: "Perdidos",  bar: "bg-red-500",   border: "border-red-200   dark:border-red-800",   light: "bg-red-50   dark:bg-red-950/30",   text: "text-red-700   dark:text-red-300" },
                ].map(({ status, label, bar, border, light, text }) => {
                  const colDeals = filtered.filter((d) => d.status === status);
                  const isOpen   = openStages.has(status);
                  return (
                    <div key={status} className={cn("rounded-xl border-2 overflow-hidden", border)}>
                      <button
                        onClick={() => toggleStage(status)}
                        className={cn("w-full flex items-center gap-3 px-4 py-3 text-left", light)}
                      >
                        <span className={cn("transition-transform duration-200 flex-shrink-0", isOpen && "rotate-90")}>
                          <ChevronRight className={cn("h-4 w-4", text)} />
                        </span>
                        <span className={cn("flex-1 text-sm font-semibold", text)}>{label}</span>
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full text-white", bar)}>
                          {colDeals.length}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="border-t border-inherit px-4 py-4 bg-card">
                          {colDeals.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-2">Nenhuma negociação</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {colDeals.map((deal) => (
                                <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow border" onClick={() => navigate(`/negociacoes/${deal.id}`)}>
                                  <CardContent className="p-3">
                                    <p className="font-medium text-sm truncate">{deal.cliente_nome}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(deal.created_at).toLocaleDateString("pt-BR")}</p>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })() : view === "kanban" ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex lg:grid lg:grid-cols-6 gap-2 overflow-x-auto lg:overflow-visible pb-4">
              {KANBAN_COLUMNS.map((col, i) => {
                const colDeals = filtered.filter((d) => d.status === col.value);
                const clr = FUNNEL_STAGE_COLORS[i % FUNNEL_STAGE_COLORS.length];
                return (
                  <div key={col.value} className="w-[230px] lg:w-auto flex-shrink-0 min-w-0">
                    <div className={cn("flex items-center justify-between gap-2 mb-2 px-2.5 py-1.5 rounded-md border", clr.light, clr.border)}>
                      <h3 className={cn("text-[11px] font-bold uppercase tracking-wide truncate", clr.text)}>{col.label}</h3>
                      <span className={cn("text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full text-white flex-shrink-0", clr.bar)}>{colDeals.length}</span>
                    </div>
                    <Droppable droppableId={col.value}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={cn("space-y-1.5 min-h-[120px] rounded-lg p-1.5 transition-colors", snapshot.isDraggingOver ? "bg-primary/5 ring-2 ring-primary/30" : "bg-muted/40")}
                        >
                          {colDeals.map((deal, index) => (
                            <Draggable key={deal.id} draggableId={deal.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => navigate(`/negociacoes/${deal.id}`)}
                                  className={cn("cursor-pointer", snapshot.isDragging && "rotate-1 shadow-lg")}
                                >
                                  <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all border bg-card">
                                    <CardContent className="p-2 space-y-1.5">
                                      <p className="font-medium text-[13px] leading-tight line-clamp-2 break-words">{deal.cliente_nome}</p>
                                      <div className="flex items-center justify-between gap-1.5">
                                        <Badge className={cn("text-[9px] px-1.5 py-0 h-4", QUAL_COLORS[deal.qualificacao])}>{deal.qualificacao}</Badge>
                                        <span className="text-[9px] text-muted-foreground tabular-nums">
                                          {new Date(deal.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                                        </span>
                                      </div>
                                      {deal.preco_lote && (
                                        <p className="text-[10px] font-semibold text-foreground/80 tabular-nums">
                                          {deal.preco_lote.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                                        </p>
                                      )}
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {colDeals.length === 0 && !snapshot.isDraggingOver && (
                            <div className="text-[10px] text-muted-foreground/60 text-center py-6 border border-dashed border-border/60 rounded-md">vazio</div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        ) : (
          <div className="bg-card rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && (
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allFilteredSelected ? true : someFilteredSelected ? "indeterminate" as any : false}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Selecionar tudo"
                      />
                    </TableHead>
                  )}
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Qualificação</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((deal) => {
                  const statusLabel = KANBAN_COLUMNS.find((c) => c.value === deal.status)?.label
                    || (deal.status === "vendido" ? "Vendido" : deal.status === "perdido" ? "Perdido" : deal.status);
                  return (
                    <TableRow key={deal.id} className="cursor-pointer" onClick={() => navigate(`/negociacoes/${deal.id}`)}>
                       {isAdmin && (
                         <TableCell onClick={(e) => e.stopPropagation()} className="w-10">
                           <Checkbox
                             checked={selected.has(deal.id)}
                             onCheckedChange={() => toggleSel(deal.id)}
                             aria-label={`Selecionar ${deal.cliente_nome}`}
                           />
                         </TableCell>
                       )}
                      <TableCell className="font-medium">{deal.cliente_nome}</TableCell>
                      <TableCell>
                        <Badge
                          variant={deal.status === "vendido" ? "default" : deal.status === "perdido" ? "destructive" : "outline"}
                          className="text-xs"
                        >
                          {statusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell><Badge className={cn("text-xs", QUAL_COLORS[deal.qualificacao])}>{deal.qualificacao}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(deal.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={isAdmin ? 5 : 4} className="text-center text-muted-foreground py-8">Nenhuma negociação encontrada</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <DealFormDialog open={showForm} onOpenChange={setShowForm} onSuccess={fetchDeals} />
      {isAdmin && selected.size > 0 && (
        <BulkActionsBar
          selectedDeals={selectedDeals}
          users={users.map((u) => ({ id: u.id, nome: u.nome || u.email }))}
          empreendimentos={empreendimentos}
          fontes={fontes}
          onClear={() => setSelected(new Set())}
          onRefresh={fetchDeals}
        />
      )}
    </AppLayout>
  );
}
