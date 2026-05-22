import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

type Atividade = {
  id: string;
  tipo: string;
  descricao: string;
  created_at: string;
};

export function DealAtividades({ atividades }: { atividades: Atividade[] }) {
  if (atividades.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          Histórico de alterações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {atividades.map((a, i) => (
          <div key={a.id} className={`flex items-start gap-3 py-2.5 ${i < atividades.length - 1 ? "border-b" : ""}`}>
            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm">{a.descricao}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(a.created_at).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export type { Atividade };
