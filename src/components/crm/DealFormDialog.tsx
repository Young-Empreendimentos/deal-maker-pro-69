import { useEffect, useState } from "react";
import { crmDb } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  /** Pré-preenche o formulário (ex.: criar negociação a partir de uma conversa do WhatsApp). */
  initial?: { nome?: string; telefone?: string };
  /** Chamado com o id do deal recém-criado (ex.: para vincular a conversa). */
  onCreated?: (dealId: string) => void;
}

export function DealFormDialog({ open, onOpenChange, onSuccess, initial, onCreated }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fontes, setFontes] = useState<{ id: string; nome: string }[]>([]);
  const [empreendimentos, setEmpreendimentos] = useState<{ id: string; nome: string }[]>([]);

  const [form, setForm] = useState({
    cliente_nome: "",
    cliente_email: "",
    qualificacao: "frio",
    fonte_id: "",
    empreendimento_id: "",
    telefone: "",
  });

  useEffect(() => {
    if (open) {
      crmDb.from("crm_fontes_lead").select("id, nome").eq("ativo", true).then(({ data }) => setFontes(data ?? []));
      crmDb.from("crm_empreendimentos").select("id, nome").eq("ativo", true).then(({ data }) => setEmpreendimentos(data ?? []));
      // Pré-preenche com o que veio da conversa (nome/telefone), mantendo o resto.
      setForm((f) => ({
        ...f,
        cliente_nome: initial?.nome ?? f.cliente_nome,
        telefone: initial?.telefone ?? f.telefone,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.nome, initial?.telefone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.empreendimento_id) {
      toast({ title: "Empreendimento é obrigatório", description: "Selecione um empreendimento.", variant: "destructive" });
      return;
    }
    setLoading(true);

    const { data: novo, error } = await crmDb.from("crm_deals").insert({
      cliente_nome: form.cliente_nome,
      cliente_email: form.cliente_email || null,
      qualificacao: form.qualificacao as any,
      fonte_id: form.fonte_id || null,
      empreendimento_id: form.empreendimento_id,
      responsavel_id: user.id,
    } as any).select("id").single();

    if (error || !novo) {
      toast({ title: "Erro ao criar negociação", description: error?.message ?? "Tente novamente.", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Associa o telefone, se houver.
    if (form.telefone) {
      await crmDb.from("crm_deal_phones").insert({ deal_id: novo.id, telefone: form.telefone } as any);
    }

    toast({ title: "Negociação criada com sucesso!" });
    onOpenChange(false);
    setForm({ cliente_nome: "", cliente_email: "", qualificacao: "frio", fonte_id: "", empreendimento_id: "", telefone: "" });
    onCreated?.(novo.id);
    onSuccess();
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Nova Negociação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do Cliente *</Label>
            <Input value={form.cliente_nome} onChange={(e) => setForm((f) => ({ ...f, cliente_nome: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={form.cliente_email} onChange={(e) => setForm((f) => ({ ...f, cliente_email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={form.telefone} onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))} placeholder="(00) 00000-0000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Qualificação</Label>
              <Select value={form.qualificacao} onValueChange={(v) => setForm((f) => ({ ...f, qualificacao: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="frio">Frio</SelectItem>
                  <SelectItem value="morno">Morno</SelectItem>
                  <SelectItem value="quente">Quente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fonte</Label>
              <Select value={form.fonte_id} onValueChange={(v) => setForm((f) => ({ ...f, fonte_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {fontes.map((f) => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Empreendimento <span className="text-destructive">*</span></Label>
            <Select value={form.empreendimento_id} onValueChange={(v) => setForm((f) => ({ ...f, empreendimento_id: v }))}>
              <SelectTrigger className={!form.empreendimento_id ? "border-destructive" : ""}><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {empreendimentos.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Criando..." : "Criar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
