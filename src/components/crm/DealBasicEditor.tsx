import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { isVisibleUser } from "@/lib/filteredUsers";
import { Save, Plus, Trash2 } from "lucide-react";
import { QualificacaoAutomatica } from "./QualificacaoAutomatica";
import { Badge } from "@/components/ui/badge";

type DealBasic = {
  id: string;
  cliente_nome: string;
  cliente_email: string | null;
  qualificacao: string;
  empreendimento_id: string | null;
  fonte_id: string | null;
  responsavel_id: string | null;
  nome_anuncio: string | null;
  melhor_horario_contato: string | null;
};

type DealPhone = { id: string; telefone: string };
type UserProfile = { user_id: string; nome: string };

interface Props {
  deal: DealBasic;
  phones: DealPhone[];
  autoInteresse: string | null;
  autoRendaFamiliar: string | null;
  autoValorEntrada: number | null;
  onSave: () => void;
}

export function DealBasicEditor({ deal, phones, autoInteresse, autoRendaFamiliar, autoValorEntrada, onSave }: Props) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user: currentUser, nome: currentUserNome, isAdmin } = useAuth();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [nome, setNome] = useState(deal.cliente_nome);
  const [email, setEmail] = useState(deal.cliente_email ?? "");
  const [qualificacao, setQualificacao] = useState(deal.qualificacao);
  const [empId, setEmpId] = useState(deal.empreendimento_id ?? "");
  const [fonteId, setFonteId] = useState(deal.fonte_id ?? "");
  const [responsavelId, setResponsavelId] = useState(deal.responsavel_id ?? "");
  const [nomeAnuncio, setNomeAnuncio] = useState(deal.nome_anuncio ?? "");
  const [melhorHorario, setMelhorHorario] = useState(deal.melhor_horario_contato ?? "");

  const [localPhones, setLocalPhones] = useState<DealPhone[]>(phones);
  const [newPhone, setNewPhone] = useState("");

  const [fontes, setFontes] = useState<{ id: string; nome: string }[]>([]);
  const [empreendimentos, setEmpreendimentos] = useState<{ id: string; nome: string; cidade: string }[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);

  useEffect(() => {
    supabase.from("crm_fontes_lead").select("id, nome").eq("ativo", true).order("nome").then(({ data }) => setFontes(data ?? []));
    supabase.from("crm_empreendimentos").select("id, nome, cidade").eq("ativo", true).order("nome").then(({ data }) => setEmpreendimentos(data ?? []));
    supabase.from("user_profiles").select("user_id, nome").order("nome").then(({ data }) => {
      const all = (data as UserProfile[]) ?? [];
      setUserProfiles(all.filter((u) => isVisibleUser(u.user_id)));
    });
  }, []);

  useEffect(() => {
    setNome(deal.cliente_nome);
    setEmail(deal.cliente_email ?? "");
    setQualificacao(deal.qualificacao);
    setEmpId(deal.empreendimento_id ?? "");
    setFonteId(deal.fonte_id ?? "");
    setResponsavelId(deal.responsavel_id ?? "");
    setNomeAnuncio(deal.nome_anuncio ?? "");
    setMelhorHorario(deal.melhor_horario_contato ?? "");
    setLocalPhones(phones);
    setDirty(false);
  }, [deal, phones]);

  // Avisar antes de sair com alterações não salvas
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const handleSave = async () => {
    if (!responsavelId) {
      toast({ title: "Dono do negócio é obrigatório", description: "Selecione um responsável antes de salvar.", variant: "destructive" });
      return;
    }
    if (!empId) {
      toast({ title: "Empreendimento é obrigatório", description: "Selecione um empreendimento antes de salvar.", variant: "destructive" });
      return;
    }
    if (!nome.trim()) {
      toast({ title: "Nome do cliente é obrigatório", variant: "destructive" });
      return;
    }
    setSaving(true);

    const responsavelChanged = responsavelId !== (deal.responsavel_id ?? "");

    // Campos básicos — SEM o responsavel_id. A troca de dono vai por uma função
    // separada (crm_transferir_responsavel), porque o RLS não deixa trocar o dono
    // num UPDATE direto: a linha deixaria de ser visível para quem edita.
    const { error } = await supabase.from("crm_deals").update({
      cliente_nome: nome.trim(),
      cliente_email: email.trim() || null,
      qualificacao: qualificacao as any,
      empreendimento_id: empId,
      fonte_id: fonteId || null,
      nome_anuncio: nomeAnuncio.trim() || null,
      melhor_horario_contato: melhorHorario.trim() || null,
    } as any).eq("id", deal.id);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    if (responsavelChanged) {
      const { error: transferError } = await (supabase as any).rpc("crm_transferir_responsavel", {
        p_deal_id: deal.id,
        p_novo_responsavel: responsavelId,
      });
      if (transferError) {
        toast({ title: "Erro ao transferir o dono", description: transferError.message, variant: "destructive" });
        onSave();
        setSaving(false);
        return;
      }

      if (currentUser) {
        const oldNome = userProfiles.find((u) => u.user_id === deal.responsavel_id)?.nome || "Desconhecido";
        const newNome = userProfiles.find((u) => u.user_id === responsavelId)?.nome || "Desconhecido";
        const quemFez = currentUserNome || currentUser.email || "Usuário";
        await supabase.from("crm_tasks").insert({
          deal_id: deal.id,
          responsavel_id: currentUser.id,
          titulo: `Negócio transferido de ${oldNome} para ${newNome}`,
          descricao: `Transferido por ${quemFez}`,
          concluida: true,
        } as any);
      }
    }

    setDirty(false);
    toast({ title: responsavelChanged ? "Dono do negócio atualizado!" : "Dados atualizados!" });

    // Consultor (não-admin) que transferiu perde acesso ao lead — volta para a lista.
    if (responsavelChanged && !isAdmin) {
      navigate("/negociacoes");
      return;
    }

    onSave();
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

  const updatePhone = async (phoneId: string, newTelefone: string) => {
    if (!newTelefone.trim()) return;
    const { error } = await supabase.from("crm_deal_phones").update({ telefone: newTelefone.trim() }).eq("id", phoneId);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      onSave();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      {/* Info Card */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold">Informações</CardTitle>
            {dirty && !saving && (
              <Badge variant="destructive" className="text-[10px] animate-pulse">Não salvo</Badge>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            variant={dirty ? "destructive" : "default"}
            className={dirty ? "animate-pulse" : ""}
          >
            <Save className="h-4 w-4 mr-1" /> {saving ? "Salvando..." : dirty ? "Salvar alterações" : "Salvar"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome do Cliente <span className="text-destructive">*</span></Label>
            <Input
              value={nome}
              onChange={(e) => { setNome(e.target.value); setDirty(true); }}
              className={!nome.trim() ? "border-destructive" : ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">E-mail</Label>
            <Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setDirty(true); }} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Qualificação</Label>
            <Select value={qualificacao} onValueChange={(v) => { setQualificacao(v); setDirty(true); }}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="frio">Frio</SelectItem>
                <SelectItem value="morno">Morno</SelectItem>
                <SelectItem value="quente">Quente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Empreendimento <span className="text-destructive">*</span></Label>
            <Select value={empId} onValueChange={(v) => { setEmpId(v); setDirty(true); }}>
              <SelectTrigger className={`text-sm ${!empId ? "border-destructive" : ""}`}><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {empreendimentos.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.nome}{e.cidade ? ` (${e.cidade})` : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fonte</Label>
            <Select value={fonteId || "__none__"} onValueChange={(v) => { setFonteId(v === "__none__" ? "" : v); setDirty(true); }}>
              <SelectTrigger className="text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Nenhuma</SelectItem>
                {fontes.map((f) => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Dono do negócio <span className="text-destructive">*</span></Label>
            <Select value={responsavelId} onValueChange={(v) => { setResponsavelId(v); setDirty(true); }}>
              <SelectTrigger className={`text-sm ${!responsavelId ? "border-destructive" : ""}`}><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {userProfiles.map((u) => (
                  <SelectItem key={u.user_id} value={u.user_id}>{u.nome || u.user_id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Nome do anúncio</Label>
            <Input value={nomeAnuncio} onChange={(e) => { setNomeAnuncio(e.target.value); setDirty(true); }} placeholder="Preenchido pela automação — editável" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Melhor horário para contato</Label>
            <Input value={melhorHorario} onChange={(e) => { setMelhorHorario(e.target.value); setDirty(true); }} placeholder="Ex.: depois das 18h, fins de semana" />
          </div>
        </CardContent>
      </Card>

      {/* Right column: Phones + Qualificação automática */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Telefones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {localPhones.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <Input
                  value={p.telefone}
                  onChange={(e) => {
                    const newPhones = localPhones.map(ph => ph.id === p.id ? { ...ph, telefone: e.target.value } : ph);
                    setLocalPhones(newPhones);
                    updatePhone(p.id, e.target.value);
                  }}
                  className="flex-1 text-sm"
                />
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

        <QualificacaoAutomatica
          dealId={deal.id}
          interesse={autoInteresse}
          rendaFamiliar={autoRendaFamiliar}
          valorEntrada={autoValorEntrada}
          onSave={onSave}
        />
      </div>
    </div>
  );
}
