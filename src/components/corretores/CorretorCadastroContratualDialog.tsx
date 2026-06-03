/**
 * CorretorCadastroContratualDialog.tsx
 * Modal para cadastro contratual de imobiliárias/corretores no Pingolead.
 * Integra com RPC: public.update_corretor_cadastro_completo()
 * Tabela: public.comercial_corretores
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeCheck, Clock, Building2, User, Phone, Mail, MapPin, CreditCard, FileText, Loader2 } from "lucide-react";

export type CorretorCadastro = {
  id: string; nome: string; nome_exibicao: string | null; tipo: string | null;
  razao_social: string | null; cpf: string | null; cnpj: string | null; creci: string | null;
  email: string | null; email_secundario: string | null; telefone: string | null;
  endereco: string | null; bairro: string | null; cidade: string | null; uf: string | null;
  cep: string | null; banco_nome: string | null; banco_agencia: string | null;
  banco_conta: string | null; banco_tipo: string | null; banco_chave_pix: string | null;
  is_cadastro_completo: boolean; ativo: boolean;
};

type Props = { corretor: CorretorCadastro | null; open: boolean; onOpenChange: (open: boolean) => void; onSaved?: () => void; };

function avaliarCompletude(form: Partial<CorretorCadastro>): { completo: boolean; faltando: string[] } {
  const faltando: string[] = [];
  if (!form.nome_exibicao?.trim()) faltando.push("Nome de exibição");
  if (!form.tipo?.trim()) faltando.push("Tipo (PF / PJ)");
  if (!form.email?.trim()) faltando.push("E-mail");
  if (!form.telefone?.trim()) faltando.push("Telefone");
  if (!form.cidade?.trim()) faltando.push("Cidade");
  if (!form.uf?.trim()) faltando.push("UF");
  if (!(form.cpf?.trim() || form.cnpj?.trim())) faltando.push("CPF ou CNPJ");
  if (!(form.banco_chave_pix?.trim() || (form.banco_conta?.trim() && form.banco_agencia?.trim())))
    faltando.push("Forma de recebimento (Pix ou conta bancária)");
  return { completo: faltando.length === 0, faltando };
}

export function CorretorCadastroContratualDialog({ corretor, open, onOpenChange, onSaved }: Props) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<Partial<CorretorCadastro>>({});
  useEffect(() => { if (corretor) setForm({ ...corretor }); }, [corretor]);
  if (!corretor) return null;
  const { completo, faltando } = avaliarCompletude(form);
  const field = (name: keyof CorretorCadastro) => ({
    value: (form[name] as string) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [name]: e.target.value || null })),
  });
  const selectField = (name: keyof CorretorCadastro) => ({
    value: (form[name] as string) ?? "",
    onValueChange: (val: string) => setForm((p) => ({ ...p, [name]: val || null })),
  });
  async function handleSave() {
    if (!corretor?.id) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase.rpc("update_corretor_cadastro_completo", {
        p_id: corretor.id, p_nome_exibicao: form.nome_exibicao ?? null,
        p_tipo: form.tipo ?? null, p_razao_social: form.razao_social ?? null,
        p_cpf: form.cpf ?? null, p_cnpj: form.cnpj ?? null, p_creci: form.creci ?? null,
        p_email: form.email ?? null, p_email_secundario: form.email_secundario ?? null,
        p_telefone: form.telefone ?? null, p_endereco: form.endereco ?? null,
        p_bairro: form.bairro ?? null, p_cidade: form.cidade ?? null,
        p_uf: form.uf ?? null, p_cep: form.cep ?? null, p_banco_nome: form.banco_nome ?? null,
        p_banco_agencia: form.banco_agencia ?? null, p_banco_conta: form.banco_conta ?? null,
        p_banco_tipo: form.banco_tipo ?? null, p_banco_chave_pix: form.banco_chave_pix ?? null,
      });
      if (error) throw error;
      const ok = (data as { is_cadastro_completo: boolean })?.is_cadastro_completo ?? false;
      toast({ title: ok ? "✅ Cadastro contratual completo!" : "Cadastro salvo",
        description: ok ? "Campos obrigatórios preenchidos." : `Faltam: ${faltando.join(", ")}.` });
      onSaved?.(); onOpenChange(false);
    } catch (err: unknown) {
      toast({ title: "Erro ao salvar", description: err instanceof Error ? err.message : "Erro desconhecido", variant: "destructive" });
    } finally { setIsSaving(false); }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div><DialogTitle className="text-lg">Cadastro contratual</DialogTitle><p className="text-sm text-muted-foreground mt-0.5">{corretor.nome_exibicao ?? corretor.nome}</p></div>
            {corretor.is_cadastro_completo
              ? <Badge variant="outline" className="gap-1.5 text-emerald-700 border-emerald-300 bg-emerald-50"><BadgeCheck className="h-3.5 w-3.5" />Completo</Badge>
              : <Badge variant="outline" className="gap-1.5 text-amber-700 border-amber-300 bg-amber-50"><Clock className="h-3.5 w-3.5" />Incompleto</Badge>}
          </div>
        </DialogHeader>
        {faltando.length > 0 && (<div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><p className="font-medium mb-1">Para marcar como completo:</p><ul className="list-disc list-inside space-y-0.5 text-amber-700">{faltando.map((f) => <li key={f}>{f}</li>)}</ul></div>)}
        <Tabs defaultValue="basico" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basico"><User className="h-3.5 w-3.5 mr-1.5" />Básico</TabsTrigger>
            <TabsTrigger value="endereco"><MapPin className="h-3.5 w-3.5 mr-1.5" />Endereço</TabsTrigger>
            <TabsTrigger value="financeiro"><CreditCard className="h-3.5 w-3.5 mr-1.5" />Recebimento</TabsTrigger>
          </TabsList>
          <TabsContent value="basico" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5"><Label>Nome de exibição <span className="text-destructive text-xs">*</span></Label><Input placeholder="Ex: BAY - Imobilar" {...field("nome_exibicao")} /><p className="text-xs text-muted-foreground">Padrão canônico: SIGLA - Nome</p></div>
              <div className="space-y-1.5"><Label>Tipo <span className="text-destructive text-xs">*</span></Label><Select {...selectField("tipo")}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent><SelectItem value="PJ"><span className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" />Imobiliária (PJ)</span></SelectItem><SelectItem value="PF"><span className="flex items-center gap-2"><User className="h-3.5 w-3.5" />Corretor PF</span></SelectItem></SelectContent></Select></div>
              <div className="space-y-1.5"><Label>CRECI</Label><Input placeholder="RS-12345" {...field("creci")} /></div>
              <div className="space-y-1.5"><Label>CPF</Label><Input placeholder="000.000.000-00" {...field("cpf")} /></div>
              <div className="space-y-1.5"><Label>CNPJ</Label><Input placeholder="00.000.000/0001-00" {...field("cnpj")} /></div>
              <div className="space-y-1.5"><Label>Razão social</Label><Input placeholder="Nome legal para contratos" {...field("razao_social")} /></div>
              <div className="space-y-1.5"><Label>E-mail <span className="text-destructive text-xs">*</span></Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input className="pl-9" placeholder="contato@exemplo.com" {...field("email")} /></div></div>
              <div className="space-y-1.5"><Label>E-mail secundário</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input className="pl-9" placeholder="outro@exemplo.com" {...field("email_secundario")} /></div></div>
              <div className="space-y-1.5"><Label>Telefone <span className="text-destructive text-xs">*</span></Label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input className="pl-9" placeholder="(51) 99999-0000" {...field("telefone")} /></div></div>
            </div>
          </TabsContent>
          <TabsContent value="endereco" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>CEP</Label><Input placeholder="00000-000" {...field("cep")} /></div>
              <div className="col-span-2 space-y-1.5"><Label>Logradouro</Label><Input placeholder="Rua, Av., número" {...field("endereco")} /></div>
              <div className="space-y-1.5"><Label>Bairro</Label><Input {...field("bairro")} /></div>
              <div className="space-y-1.5"><Label>Cidade <span className="text-destructive text-xs">*</span></Label><Input {...field("cidade")} /></div>
              <div className="space-y-1.5"><Label>UF <span className="text-destructive text-xs">*</span></Label><Input maxLength={2} placeholder="RS" className="uppercase" {...field("uf")} /></div>
            </div>
          </TabsContent>
          <TabsContent value="financeiro" className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">Preencha ao menos uma forma de recebimento para liberar o <span className="font-medium text-foreground">cadastro completo</span>.</p>
            <div className="rounded-lg border p-4 space-y-3"><p className="text-sm font-medium flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />Chave Pix</p><div className="space-y-1.5"><Label>Chave Pix</Label><Input placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória" {...field("banco_chave_pix")} /></div></div>
            <div className="rounded-lg border p-4 space-y-3"><p className="text-sm font-medium flex items-center gap-2"><CreditCard className="h-4 w-4 text-muted-foreground" />Conta bancária</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Banco</Label><Input placeholder="Ex: Itaú, Bradesco" {...field("banco_nome")} /></div>
                <div className="space-y-1.5"><Label>Tipo</Label><Select {...selectField("banco_tipo")}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent><SelectItem value="corrente">Corrente</SelectItem><SelectItem value="poupanca">Poupança</SelectItem></SelectContent></Select></div>
                <div className="space-y-1.5"><Label>Agência <span className="text-destructive text-xs">*</span></Label><Input placeholder="0000" {...field("banco_agencia")} /></div>
                <div className="space-y-1.5"><Label>Conta <span className="text-destructive text-xs">*</span></Label><Input placeholder="00000-0" {...field("banco_conta")} /></div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <div className={`rounded-lg border px-4 py-3 text-sm flex items-center gap-3 ${completo ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-muted bg-muted/40 text-muted-foreground"}`}>
          {completo ? (<><BadgeCheck className="h-4 w-4 shrink-0" /><span>Ao salvar, <strong>is_cadastro_completo</strong> será <strong>verdadeiro</strong>.</span></>) : (<><Clock className="h-4 w-4 shrink-0" /><span>Ao salvar, <strong>is_cadastro_completo</strong> permanecerá <strong>falso</strong> (faltam {faltando.length} campo{faltando.length !== 1 ? "s" : ""}).</span></>)}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving}>{isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : "Salvar cadastro"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
