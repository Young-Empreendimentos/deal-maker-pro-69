import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot } from "lucide-react";

const INTERESSES_AUTO = ["moradia", "investimento", "presente ou doação", "negócio"] as const;
const RENDAS_AUTO = [
  "Até 3 mil reais",
  "3 a 5 mil reais",
  "5 a 10 mil reais",
  "10 a 15 mil reais",
  "15 a 20 mil reais",
  "Acima de 20 mil reais",
] as const;

type Props = {
  interesse: string | null;
  rendaFamiliar: string | null;
  valorEntrada: number | null;
};

export function QualificacaoAutomatica({ interesse, rendaFamiliar, valorEntrada }: Props) {
  const entradaFormatada = valorEntrada != null
    ? valorEntrada.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Bot className="h-4 w-4 text-muted-foreground" />
          Qualificação automática
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Interesse</Label>
          <Input value={interesse ?? ""} disabled className="text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Renda familiar</Label>
          <Input value={rendaFamiliar ?? ""} disabled className="text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Quanto pode pagar de entrada (R$)</Label>
          <Input value={entradaFormatada} disabled className="text-sm" />
        </div>
      </CardContent>
    </Card>
  );
}

export { INTERESSES_AUTO, RENDAS_AUTO };
