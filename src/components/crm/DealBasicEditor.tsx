import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2 } from "lucide-react";

type DealBasic = {
  id: string;
  cliente_nome: string;
  cliente_email: string | null;
  qualificacao: string;
  empreendimento_id: string | null;
  fonte_id: string | null;
};

type DealPhone = { id: string; telefone: string };

interface Props {
  deal: DealBasic;
  phones: DealPhone[];
  onSave: () => void;
}

export function DealBasicEditor({ deal, phones, onSave }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [nome, setNome] = useState(deal.cliente_nome);
  const [email, setEmail] = useState(deal.cliente_email ?? "");
  const [qualificacao, setQualificacao] = useState(deal.qualificacao);
  const [empId, setEmpId] = useState(deal.empreendimento_id ?? "");
  const [fonteId, setFonteId] = useState(deal.fonte_id ?? "");

  const [localPhones, setLocalPhones] = useState<DealPhone[]>(phones);
  const [newPhone, setNewPhone] = useState("");

  const [fontes, setFontes] = useState<{ id: string; nome: string }[]>([]);
  const [empreendimentos, setEmpreendimentos] = useState<{ id: string; nome: string; cidade: string }[]>([]);

  useEffect(() => {
    supabase.from("crm_fontes_lead").select("id, nome").eq("ativo", true).order("nome").then(({ data }) => setFontes(data ?? []));
    supabase.from("crm_empreendimentos").select("id, nome, cidade").eq("ativo", true).order("nome").then(({ data }) => setEmpreendimentos(data ?? []));
  }, []);

  useEffect(() => {
    setNome(deal.cliente_nome);
    setEmail(deal.cliente_email ?? "");
    setQualificacao(deal.qualificacao);
    setEmpId(deal.empreendimento_id ?? "");
    setFonteId(deal.fonte_id ?? "");
    setLocalPhones(phones);
  }, [deal, phones]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("crm_deals").update({
      cliente_nome: nome.trim(),
      cliente_email: email.trim() || null,
      qualificacao: qualificacao as any,
      empreendimento_id: empId || null,
      fonte_id: fonteId || null,
    } as any).eq("id", deal.id);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Dados atualizados!" });
      onSave();
    }
    setSaving(false);
  };

  const addPhone = async () => {
    if (!newPhone.trim()) return;
    const { error } = await supabase.from("crm_deal_phones").insert({ deal_id: deal.id, telefone: newPhone.trim() });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setNewPhone("");
      onSave();
    }
  };

  const removePhone = async (phoneId: string) => {
    await supabase.from("crm_deal_phones").delete().eq("id", phoneId);
    onSave();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Info Card */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Informações</CardTitle>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> {saving ? "Salvando..." : "Salvar"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome do Cliente</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">E-mail</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Qualificação</Label>
            <Select value={qualificacao} onValueChange={setQualificacao}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="frio">Frio</SelectItem>
                <SelectItem value="morno">Morno</SelectItem>
                <SelectItem value="quente">Quente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Empreendimento</Label>
            <Select value={empId} onValueChange={setEmpId}>
              <SelectTrigger className="text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Nenhum</SelectItem>
                {empreendimentos.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.nome}{e.cidade ? ` (${e.cidade})` : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fonte</Label>
            <Select value={fonteId} onValueChange={setFonteId}>
              <SelectTrigger className="text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma</SelectItem>
                {fontes.map((f) => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Phones Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Telefones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {localPhones.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <Input value={p.telefone} readOnly className="flex-1 text-sm" />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removePhone(p.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPhone())}
            />
            <Button size="sm" onClick={addPhone} disabled={!newPhone.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {localPhones.length === 0 && !newPhone && (
            <p className="text-xs text-muted-foreground text-center py-2">Nenhum telefone cadastrado</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
