import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bot, Save } from "lucide-react";

const INTERESSES_AUTO = ["moradia", "investimento", "presente ou doação", "negócio"] as const;
const RENDAS_AUTO = [
  "Até 3 mil reais",
  "3 a 5 mil reais",
  "5 a 10 mil reais",
  "10 a 15 mil reais",
  "15 a 20 mil reais",
  "Acima de 20 mil reais",
] as const;

// A automação (n8n) pode gravar auto_interesse/auto_renda com caixa ou acento diferentes
// das opções do <Select> (ex.: "até 3 mil reais" x "Até 3 mil reais") — aí o campo aparecia
// vazio mesmo tendo dado. Casa com a opção canônica ignorando maiúscula/acento.
const normOpt = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const matchOption = (v: string | null | undefined, options: readonly string[]) =>
  !v ? "" : (options.find((o) => normOpt(o) === normOpt(v)) ?? v);

type Props = {
  dealId: string;
  interesse: string | null;
  rendaFamiliar: string | null;
  valorEntrada: number | null;
  nomeAnuncio: string | null;
  onSave: () => void;
};

export function QualificacaoAutomatica({ dealId, interesse, rendaFamiliar, valorEntrada, nomeAnuncio, onSave }: Props) {
  const { toast } = useToast();
  const [localNomeAnuncio, setLocalNomeAnuncio] = useState(nomeAnuncio ?? "");
  const [localInteresse, setLocalInteresse] = useState(matchOption(interesse, INTERESSES_AUTO));
  const [localRenda, setLocalRenda] = useState(matchOption(rendaFamiliar, RENDAS_AUTO));
  const [localValor, setLocalValor] = useState(valorEntrada?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("crm_deals").update({
      nome_anuncio: localNomeAnuncio.trim() || null,
      auto_interesse: localInteresse || null,
      auto_renda_familiar: localRenda || null,
      auto_valor_entrada: localValor ? parseFloat(localValor) : null,
    } as any).eq("id", dealId);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Qualificação salva!" });
      onSave();
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Bot className="h-4 w-4 text-muted-foreground" />
          Qualificação automática
        </CardTitle>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-1" /> {saving ? "Salvando..." : "Salvar"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Nome do anúncio</Label>
          <Input value={localNomeAnuncio} onChange={(e) => setLocalNomeAnuncio(e.target.value)} placeholder="Preenchido pela automação — editável" className="text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Interesse</Label>
          <Select value={localInteresse || "__none__"} onValueChange={(v) => setLocalInteresse(v === "__none__" ? "" : v)}>
            <SelectTrigger className="text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Selecione</SelectItem>
              {INTERESSES_AUTO.map((i) => (
                <SelectItem key={i} value={i} className="capitalize">{i}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Renda familiar</Label>
          <Select value={localRenda || "__none__"} onValueChange={(v) => setLocalRenda(v === "__none__" ? "" : v)}>
            <SelectTrigger className="text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Selecione</SelectItem>
              {RENDAS_AUTO.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Quanto pode pagar de entrada (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={localValor}
            onChange={(e) => setLocalValor(e.target.value)}
            placeholder="0,00"
            className="text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export { INTERESSES_AUTO, RENDAS_AUTO };
