import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/crm/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, LayoutGrid, Table as TableIcon, Filter, X, ArrowUpDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DealFormDialog } from "@/components/crm/DealFormDialog";
import { MultiSelectFilter } from "@/components/crm/MultiSelectFilter";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useToast } from "@/hooks/use-toast";

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
  { value: "presente", label: "Presente" },
  { value: "doação", label: "Doação" },
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
  const [view, setView] = useState<"kanban" | "table">("kanban");
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

  const [sortBy, setSortBy] = useState<"created_at" | "cliente_nome" | "qualificacao" | "updated_at">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const hasFilters = fConsultor.length > 0 || fEmpreendimento.length > 0 || fFonte.length > 0 || fInteresse.length > 0 || fPreco.length > 0;

  const fetchDeals = async () => {
    const { data } = await supabase
      .from("crm_deals")
      .select("*")
      .order("ordem_kanban", { ascending: true });
    setDeals((data as Deal[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDeals();
    supabase.from("crm_empreendimentos").select("id, nome, cidade").eq("ativo", true).then(({ data }) => setEmpreendimentos((data as Empreendimento[]) ?? []));
    supabase.from("crm_fontes_lead").select("id, nome").eq("ativo", true).then(({ data }) => setFontes((data as FonteLead[]) ?? []));
    if (isAdmin) {
      supabase.rpc("get_all_users_with_roles").then(({ data }) => setUsers(((data as any[]) ?? []).map((u) => ({ id: u.id, email: u.email, nome: u.nome }))));
    }
  }, [isAdmin]);

  const qualOrder: Record<string, number> = { frio: 0, morno: 1, quente: 2 };
  const kanbanStatuses = new Set(KANBAN_COLUMNS.map((c) => c.value));

  const filtered = useMemo(() => {
    const list = deals.filter((d) => {
      // Status group filter
      if (fStatusGroup.length > 0) {
        const isInProgress = kanbanStatuses.has(d.status);
        const matchesGroup = fStatusGroup.some((g) => {
          if (g === "em_andamento") return isInProgress;
          return d.status === g;
        });
        if (!matchesGroup) return false;
      }
      if (fConsultor.length > 0 && !fConsultor.includes(d.responsavel_id)) return false;
      if (fEmpreendimento.length > 0 && (!d.empreendimento_id || !fEmpreendimento.includes(d.empreendimento_id))) return false;
      if (fFonte.length > 0 && (!d.fonte_id || !fFonte.includes(d.fonte_id))) return false;
      if (fInteresse.length > 0 && (!d.interesse || !fInteresse.includes(d.interesse))) return false;
      if (fPreco.length > 0) {
        if (!d.preco_lote) return false;
        const matches = fPreco.some((faixa) => {
          const [min, max] = faixa.split("-").map(Number);
          return d.preco_lote! >= min && d.preco_lote! <= max;
        });
        if (!matches) return false;
      }
      return true;
    });
    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "cliente_nome") cmp = a.cliente_nome.localeCompare(b.cliente_nome);
      else if (sortBy === "qualificacao") cmp = (qualOrder[a.qualificacao] ?? 0) - (qualOrder[b.qualificacao] ?? 0);
      else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [deals, fStatusGroup, fConsultor, fEmpreendimento, fFonte, fInteresse, fPreco, sortBy, sortDir]);

  const clearFilters = () => {
    setFConsultor([]);
    setFEmpreendimento([]);
    setFFonte([]);
    setFInteresse([]);
    setFPreco([]);
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
              <button onClick={() => setView("kanban")} className={cn("p-2 rounded-sm transition-colors", view === "kanban" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}>
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button onClick={() => setView("table")} className={cn("p-2 rounded-sm transition-colors", view === "table" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}>
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
        ) : view === "kanban" ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {KANBAN_COLUMNS.map((col) => {
                const colDeals = filtered.filter((d) => d.status === col.value);
                return (
                  <div key={col.value} className="min-w-[280px] flex-shrink-0">
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
                      <Badge variant="secondary" className="text-xs">{colDeals.length}</Badge>
                    </div>
                    <Droppable droppableId={col.value}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={cn("space-y-2 min-h-[100px] rounded-lg p-2 transition-colors", snapshot.isDraggingOver ? "bg-primary/5 ring-2 ring-primary/20" : "bg-muted/30")}
                        >
                          {colDeals.map((deal, index) => (
                            <Draggable key={deal.id} draggableId={deal.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => navigate(`/negociacoes/${deal.id}`)}
                                  className={cn("cursor-pointer", snapshot.isDragging && "rotate-2 shadow-lg")}
                                >
                                  <Card className="hover:shadow-md transition-shadow border bg-card">
                                    <CardContent className="p-3 space-y-2">
                                      <p className="font-medium text-sm">{deal.cliente_nome}</p>
                                      <div className="flex items-center gap-2">
                                        <Badge className={cn("text-[10px] px-1.5 py-0", QUAL_COLORS[deal.qualificacao])}>{deal.qualificacao}</Badge>
                                        <span className="text-[10px] text-muted-foreground">{new Date(deal.created_at).toLocaleDateString("pt-BR")}</span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {colDeals.length === 0 && !snapshot.isDraggingOver && (
                            <div className="text-xs text-muted-foreground text-center py-6">Arraste aqui</div>
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
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma negociação encontrada</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <DealFormDialog open={showForm} onOpenChange={setShowForm} onSuccess={fetchDeals} />
    </AppLayout>
  );
}
