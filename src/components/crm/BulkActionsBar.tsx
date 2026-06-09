import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { X, UserCog, TrendingDown, ArrowRightLeft, Trash2, FileText, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { KANBAN_COLUMNS, type Deal } from "@/pages/Negociacoes";

type UserOption = { id: string; nome: string };
type Motivo = { id: string; nome: string };
type Empreendimento = { id: string; nome: string };
type Fonte = { id: string; nome: string };

interface Props {
  selectedDeals: Deal[];
  users: UserOption[];
  empreendimentos: Empreendimento[];
  fontes: Fonte[];
  onClear: () => void;
  onRefresh: () => void;
}

export function BulkActionsBar({ selectedDeals, users, empreendimentos, fontes, onClear, onRefresh }: Props) {
  const { toast } = useToast();
  const { user: currentUser, nome: currentUserNome } = useAuth();
  const [openTransfer, setOpenTransfer] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [openPerda, setOpenPerda] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [novoResp, setNovoResp] = useState("");
  const [novoStatus, setNovoStatus] = useState("");
  const [motivoId, setMotivoId] = useState("");
  const [motivos, setMotivos] = useState<Motivo[]>([]);
  const [loading, setLoading] = useState(false);

  const count = selectedDeals.length;
  const ids = selectedDeals.map((d) => d.id);

  const loadMotivos = async () => {
    if (motivos.length) return;
    const { data } = await supabase.from("crm_motivos_perda").select("id, nome").eq("ativo", true).order("nome");
    setMotivos((data as Motivo[]) ?? []);
  };

  const doTransfer = async () => {
    if (!novoResp) return;
    setLoading(true);
    const { error } = await supabase.from("crm_deals").update({ responsavel_id: novoResp } as any).in("id", ids);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      const newNome = users.find((u) => u.id === novoResp)?.nome || "Desconhecido";
      const quemFez = currentUserNome || currentUser?.email || "Admin";
      // Log de transferência como tarefa concluída em cada deal
      await supabase.from("crm_tasks").insert(
        selectedDeals.map((d) => ({
          deal_id: d.id,
          responsavel_id: currentUser?.id,
          titulo: `Negócio transferido para ${newNome}`,
          descricao: `Transferência em massa por ${quemFez}`,
          concluida: true,
        })) as any
      );
      toast({ title: `${count} negociação(ões) transferida(s) para ${newNome}` });
      setOpenTransfer(false);
      setNovoResp("");
      onClear();
      onRefresh();
    }
    setLoading(false);
  };

  const doChangeStatus = async () => {
    if (!novoStatus) return;
    setLoading(true);
    const { error } = await supabase.from("crm_deals").update({ status: novoStatus } as any).in("id", ids);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${count} negociação(ões) atualizada(s)` });
      setOpenStatus(false);
      setNovoStatus("");
      onClear();
      onRefresh();
    }
    setLoading(false);
  };

  const doMarkPerda = async () => {
    if (!motivoId) return;
    setLoading(true);
    const { error } = await supabase.from("crm_deals").update({
      status: "perdido",
      motivo_perda_id: motivoId,
    } as any).in("id", ids);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${count} negociação(ões) marcada(s) como perdida(s)` });
      setOpenPerda(false);
      setMotivoId("");
      onClear();
      onRefresh();
    }
    setLoading(false);
  };

  const doDelete = async () => {
    setLoading(true);
    const { error } = await supabase.from("crm_deals").delete().in("id", ids);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${count} negociação(ões) excluída(s)` });
      setOpenDelete(false);
      onClear();
      onRefresh();
    }
    setLoading(false);
  };

  const buildRows = () => {
    const empMap = new Map(empreendimentos.map((e) => [e.id, e.nome]));
    const fonteMap = new Map(fontes.map((f) => [f.id, f.nome]));
    const userMap = new Map(users.map((u) => [u.id, u.nome]));
    const statusLabel = (s: string) =>
      KANBAN_COLUMNS.find((c) => c.value === s)?.label ||
      (s === "vendido" ? "Vendido" : s === "perdido" ? "Perdido" : s);
    return selectedDeals.map((d) => ({
      cliente: d.cliente_nome,
      email: d.cliente_email ?? "",
      status: statusLabel(d.status),
      qualificacao: d.qualificacao,
      empreendimento: d.empreendimento_id ? empMap.get(d.empreendimento_id) ?? "" : "",
      fonte: d.fonte_id ? fonteMap.get(d.fonte_id) ?? "" : "",
      responsavel: userMap.get(d.responsavel_id) ?? "",
      preco: d.preco_lote ? d.preco_lote.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "",
      criado_em: new Date(d.created_at).toLocaleDateString("pt-BR"),
    }));
  };

  const exportCSV = () => {
    const rows = buildRows();
    const headers = ["Cliente", "E-mail", "Status", "Qualificação", "Empreendimento", "Fonte", "Responsável", "Preço", "Criado em"];
    const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      headers.join(";"),
      ...rows.map((r) => [r.cliente, r.email, r.status, r.qualificacao, r.empreendimento, r.fonte, r.responsavel, r.preco, r.criado_em].map(escape).join(";")),
    ].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `negociacoes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `${count} negociação(ões) exportada(s) em CSV` });
  };

  const exportPDF = () => {
    const rows = buildRows();
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("Negociações", 14, 14);
    doc.setFontSize(9);
    doc.text(`${count} registros — gerado em ${new Date().toLocaleString("pt-BR")}`, 14, 20);
    autoTable(doc, {
      startY: 25,
      head: [["Cliente", "Status", "Qual.", "Empreendimento", "Fonte", "Responsável", "Preço", "Criado"]],
      body: rows.map((r) => [r.cliente, r.status, r.qualificacao, r.empreendimento, r.fonte, r.responsavel, r.preco, r.criado_em]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 41, 59] },
    });
    doc.save(`negociacoes-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast({ title: `${count} negociação(ões) exportada(s) em PDF` });
  };

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-card border-2 border-primary shadow-xl rounded-xl px-3 py-2 flex items-center gap-2 flex-wrap max-w-[95vw]">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClear}>
          <X className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold px-2 border-r mr-1">{count} selecionada(s)</span>
        <Button size="sm" variant="outline" onClick={() => setOpenTransfer(true)}>
          <UserCog className="h-4 w-4 mr-1" /> Transferir
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpenStatus(true)}>
          <ArrowRightLeft className="h-4 w-4 mr-1" /> Alterar status
        </Button>
        <Button size="sm" variant="outline" onClick={() => { loadMotivos(); setOpenPerda(true); }}>
          <TrendingDown className="h-4 w-4 mr-1" /> Marcar perda
        </Button>
        <Button size="sm" variant="outline" onClick={exportCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-1" /> CSV
        </Button>
        <Button size="sm" variant="outline" onClick={exportPDF}>
          <FileText className="h-4 w-4 mr-1" /> PDF
        </Button>
        <Button size="sm" variant="destructive" onClick={() => setOpenDelete(true)}>
          <Trash2 className="h-4 w-4 mr-1" /> Excluir
        </Button>
      </div>

      {/* Transferir */}
      <Dialog open={openTransfer} onOpenChange={setOpenTransfer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transferir {count} negociação(ões)</DialogTitle>
            <DialogDescription>Selecione o novo responsável.</DialogDescription>
          </DialogHeader>
          <Select value={novoResp} onValueChange={setNovoResp}>
            <SelectTrigger><SelectValue placeholder="Selecione um consultor" /></SelectTrigger>
            <SelectContent>
              {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.nome || u.id}</SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenTransfer(false)}>Cancelar</Button>
            <Button onClick={doTransfer} disabled={!novoResp || loading}>{loading ? "Transferindo..." : "Confirmar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alterar Status */}
      <Dialog open={openStatus} onOpenChange={setOpenStatus}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar status de {count} negociação(ões)</DialogTitle>
            <DialogDescription>O novo status será aplicado a todas as selecionadas.</DialogDescription>
          </DialogHeader>
          <Select value={novoStatus} onValueChange={setNovoStatus}>
            <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
            <SelectContent>
              {KANBAN_COLUMNS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Para marcar como <strong>Vendido</strong>, use a tela de detalhes (precisa de dados de fechamento). Para <strong>Perdido</strong>, use o botão "Marcar perda".
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenStatus(false)}>Cancelar</Button>
            <Button onClick={doChangeStatus} disabled={!novoStatus || loading}>{loading ? "Salvando..." : "Confirmar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Marcar Perda */}
      <Dialog open={openPerda} onOpenChange={setOpenPerda}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar {count} negociação(ões) como perdida(s)</DialogTitle>
            <DialogDescription>Selecione o motivo da perda.</DialogDescription>
          </DialogHeader>
          <Select value={motivoId} onValueChange={setMotivoId}>
            <SelectTrigger><SelectValue placeholder="Selecione o motivo" /></SelectTrigger>
            <SelectContent>
              {motivos.map((m) => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPerda(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={doMarkPerda} disabled={!motivoId || loading}>{loading ? "Salvando..." : "Confirmar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Excluir */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {count} negociação(ões)?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todas as tarefas, anotações, telefones e imagens vinculadas também serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {loading ? "Excluindo..." : "Excluir permanentemente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
