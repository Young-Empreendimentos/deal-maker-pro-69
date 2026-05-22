import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

function FieldDisplay({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      {value ? (
        <Badge variant="secondary" className="text-xs font-normal capitalize">{value}</Badge>
      ) : (
        <p className="text-xs text-muted-foreground italic">Aguardando automação...</p>
      )}
    </div>
  );
}

export function QualificacaoAutomatica({ interesse, rendaFamiliar, valorEntrada }: Props) {
  const entradaFormatada = valorEntrada != null
    ? valorEntrada.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Bot className="h-4 w-4 text-muted-foreground" />
          Qualificação automática
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FieldDisplay label="Interesse" value={interesse} />
        <FieldDisplay label="Renda familiar" value={rendaFamiliar} />
        <FieldDisplay label="Quanto pode pagar de entrada (R$)" value={entradaFormatada} />
      </CardContent>
    </Card>
  );
}

export { INTERESSES_AUTO, RENDAS_AUTO };
