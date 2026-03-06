import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/crm/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, LayoutGrid, Table as TableIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DealFormDialog } from "@/components/crm/DealFormDialog";

const KANBAN_COLUMNS = [
  { value: "lead_recebido", label: "Lead Recebido" },
  { value: "contato_feito", label: "Contato Feito" },
  { value: "visita_agendada", label: "Visita Agendada" },
  { value: "visita_realizada", label: "Visita Realizada" },
  { value: "ficha_assinada", label: "Ficha Assinada" },
  { value: "proposta_recebida", label: "Proposta Recebida" },
] as const;

const QUAL_COLORS: Record<string, string> = {
  frio: "bg-[hsl(var(--qual-frio))] text-white",
  morno: "bg-[hsl(var(--qual-morno))] text-white",
  quente: "bg-[hsl(var(--qual-quente))] text-white",
};

type Deal = {
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
};

export default function Negociacoes() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const handleStatusChange = async (dealId: string, newStatus: string) => {
    await supabase.from("crm_deals").update({ status: newStatus } as any).eq("id", dealId);
    fetchDeals();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Negociações</h1>
            <p className="text-sm text-muted-foreground">{deals.length} negociações encontradas</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-md p-0.5">
              <button onClick={() => setView("kanban")} className={cn("p-2 rounded-sm transition-colors", view === "kanban" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}>
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button onClick={() => setView("table")} className={cn("p-2 rounded-sm transition-colors", view === "table" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}>
                <TableIcon className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Nova
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Carregando...</div>
        ) : view === "kanban" ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {KANBAN_COLUMNS.map((col) => {
              const colDeals = deals.filter((d) => d.status === col.value);
              return (
                <div key={col.value} className="min-w-[280px] flex-shrink-0">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
                    <Badge variant="secondary" className="text-xs">{colDeals.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {colDeals.map((deal) => (
                      <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow border bg-card">
                        <CardContent className="p-3 space-y-2">
                          <p className="font-medium text-sm">{deal.cliente_nome}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={cn("text-[10px] px-1.5 py-0", QUAL_COLORS[deal.qualificacao])}>
                              {deal.qualificacao}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {colDeals.length === 0 && (
                      <div className="text-xs text-muted-foreground text-center py-8 border border-dashed rounded-md">
                        Nenhuma negociação
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
                {deals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell className="font-medium">{deal.cliente_nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {KANBAN_COLUMNS.find((c) => c.value === deal.status)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", QUAL_COLORS[deal.qualificacao])}>
                        {deal.qualificacao}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(deal.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))}
                {deals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhuma negociação encontrada
                    </TableCell>
                  </TableRow>
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
