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
import { X, UserCog, TrendingDown, ArrowRightLeft, Trash2, FileText, FileSpreadsheet, Building2 } from "lucide-react";
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
  const [openTransferEmp, setOpenTransferEmp] = useState(false);
  const [novoResp, setNovoResp] = useState("");
  const [novoEmp, setNovoEmp] = useState("");
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

  const doTransferEmp = async () => {
    if (!novoEmp) return;
    setLoading(true);
    const { error } = await supabase.from("crm_deals").update({ empreendimento_id: novoEmp } as any).in("id", ids);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      const nome = empreendimentos.find((e) => e.id === novoEmp)?.nome || "—";
      toast({ title: `${count} negociação(ões) movida(s) para ${nome}` });
      setOpenTransferEmp(false);
      setNovoEmp("");
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

  // Export completo: busca TODOS os campos do deal + anotações e monta um CSV largo.
  const exportCSV = async () => {
    const empMap = new Map(empreendimentos.map((e) => [e.id, e.nome]));
    const fonteMap = new Map(fontes.map((f) => [f.id, f.nome]));
    const userMap = new Map(users.map((u) => [u.id, u.nome]));
    const statusLabel = (s: string) =>
      KANBAN_COLUMNS.find((c) => c.value === s)?.label ||
      (s === "vendido" ? "Vendido" : s === "perdido" ? "Perdido" : s);

    const CHUNK = 200;
    const fullDeals: any[] = [];
    for (let i = 0; i < ids.length; i += CHUNK) {
      const { data } = await supabase.from("crm_deals").select("*").in("id", ids.slice(i, i + CHUNK));
      fullDeals.push(...((data as any[]) ?? []));
    }
    const { data: motivosData } = await supabase.from("crm_motivos_perda").select("id, nome");
    const motivoMap = new Map(((motivosData as any[]) ?? []).map((m) => [m.id, m.nome]));
    const anotacoesByDeal = new Map<string, string[]>();
    for (let i = 0; i < ids.length; i += CHUNK) {
      const { data } = await supabase.from("crm_deal_anotacoes")
        .select("deal_id, texto, created_at").in("deal_id", ids.slice(i, i + CHUNK))
        .order("created_at", { ascending: true });
      for (const a of ((data as any[]) ?? [])) {
        const arr = anotacoesByDeal.get(a.deal_id) ?? [];
        arr.push(`[${new Date(a.created_at).toLocaleDateString("pt-BR")}] ${a.texto}`);
        anotacoesByDeal.set(a.deal_id, arr);
      }
    }

    const brl = (n: any) => (n || n === 0) ? Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "";
    const dtf = (s: any) => s ? new Date(s).toLocaleString("pt-BR") : "";
    const dOnly = (s: any) => s ? new Date(s).toLocaleDateString("pt-BR") : "";

    const cols: { h: string; get: (x: any) => any }[] = [
      { h: "Cliente", get: (x) => x.cliente_nome },
      { h: "E-mail", get: (x) => x.cliente_email },
      { h: "Status", get: (x) => statusLabel(x.status) },
      { h: "Qualificação", get: (x) => x.qualificacao },
      { h: "Empreendimento", get: (x) => x.empreendimento_id ? (empMap.get(x.empreendimento_id) ?? "") : "" },
      { h: "Lote", get: (x) => x.numero_lote },
      { h: "Preço do lote", get: (x) => brl(x.preco_lote) },
      { h: "Forma de pagamento", get: (x) => x.forma_pagamento },
      { h: "Valor de entrada", get: (x) => brl(x.valor_entrada) },
      { h: "Fonte", get: (x) => x.fonte_id ? (fonteMap.get(x.fonte_id) ?? "") : "" },
      { h: "Responsável", get: (x) => userMap.get(x.responsavel_id) ?? "" },
      { h: "Interesse", get: (x) => x.interesse },
      { h: "Nome do anúncio", get: (x) => x.nome_anuncio },
      { h: "Melhor horário p/ contato", get: (x) => x.melhor_horario_contato },
      { h: "Motivo da perda", get: (x) => x.motivo_perda_id ? (motivoMap.get(x.motivo_perda_id) ?? "") : "" },
      { h: "Renda familiar", get: (x) => x.renda_familiar },
      { h: "Data de nascimento", get: (x) => dOnly(x.data_nascimento) },
      { h: "Escolaridade", get: (x) => x.escolaridade },
      { h: "Estado civil", get: (x) => x.estado_civil },
      { h: "Sexo", get: (x) => x.sexo },
      { h: "Nacionalidade", get: (x) => x.nacionalidade },
      { h: "Cidade", get: (x) => x.cidade_cliente },
      { h: "Logradouro", get: (x) => [x.logradouro, x.numero_logradouro].filter(Boolean).join(", ") },
      { h: "Tipo de residência", get: (x) => x.tipo_residencia },
      { h: "Filhos", get: (x) => x.filhos },
      { h: "Interesses pessoais", get: (x) => Array.isArray(x.interesses_pessoais) ? x.interesses_pessoais.join(", ") : "" },
      { h: "UTM source", get: (x) => x.utm_source },
      { h: "UTM medium", get: (x) => x.utm_medium },
      { h: "UTM campaign", get: (x) => x.utm_campaign },
      { h: "Link do contrato", get: (x) => x.link_contrato },
      { h: "Satisfação atendimento", get: (x) => x.satisfacao_atendimento ?? "" },
      { h: "Satisfação produto", get: (x) => x.satisfacao_produto ?? "" },
      { h: "Criado em", get: (x) => dtf(x.created_at) },
      { h: "Atualizado em", get: (x) => dtf(x.updated_at) },
      { h: "Data da venda", get: (x) => dtf(x.data_vendido) },
      { h: "Data da perda", get: (x) => dtf(x.data_perdido) },
      { h: "Anotações", get: (x) => (anotacoesByDeal.get(x.id) ?? []).join(" | ") },
    ];

    const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      cols.map((c) => c.h).join(";"),
      ...fullDeals.map((x) => cols.map((c) => escape(c.get(x))).join(";")),
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

  const exportPDF = async () => {
    // Carrega as libs de PDF sob demanda (não pesam no bundle inicial)
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
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
        <Button size="sm" variant="outline" onClick={() => setOpenTransferEmp(true)}>
          <Building2 className="h-4 w-4 mr-1" /> Empreendimento
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

      {/* Transferir Empreendimento */}
      <Dialog open={openTransferEmp} onOpenChange={setOpenTransferEmp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mover {count} negociação(ões) de empreendimento</DialogTitle>
            <DialogDescription>Selecione o novo empreendimento.</DialogDescription>
          </DialogHeader>
          <Select value={novoEmp} onValueChange={setNovoEmp}>
            <SelectTrigger><SelectValue placeholder="Selecione o empreendimento" /></SelectTrigger>
            <SelectContent>
              {empreendimentos.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenTransferEmp(false)}>Cancelar</Button>
            <Button onClick={doTransferEmp} disabled={!novoEmp || loading}>{loading ? "Movendo..." : "Confirmar"}</Button>
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
