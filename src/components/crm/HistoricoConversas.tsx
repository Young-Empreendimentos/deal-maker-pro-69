import { useEffect, useState } from "react";
import { crmDb } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Loader2, Paperclip, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = {
  id: string;
  direcao: "in" | "out";
  conteudo: string | null;
  autor_nome: string | null;
  msg_em: string | null;
  anexos: { length?: number } | null;
};

// No WhatsApp a assinatura vira negrito (*Nome:*); aqui mostra sem os asteriscos.
function limpaAssinatura(s?: string | null) {
  return (s ?? "").replace(/^\*([^\n*]+):\*/, "$1:");
}

/**
 * Histórico das conversas de WhatsApp vinculadas à negociação (crm_atendimento_mensagens).
 * Só leitura — o consultor não edita nem apaga; o registro é preenchido pelo webhook do Chatwoot.
 */
export function HistoricoConversas({ dealId }: { dealId: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let vivo = true;
    (async () => {
      setLoading(true);
      const { data } = await (crmDb as any)
        .from("crm_atendimento_mensagens")
        .select("id, direcao, conteudo, autor_nome, msg_em, anexos")
        .eq("deal_id", dealId)
        .order("msg_em", { ascending: true })
        .limit(500);
      if (!vivo) return;
      setMsgs((data as Msg[]) ?? []);
      setLoading(false);
    })();
    return () => { vivo = false; };
  }, [dealId]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          Histórico de conversas ({msgs.length})
          <span className="ml-auto flex items-center gap-1 text-[10px] font-normal text-muted-foreground">
            <Lock className="h-3 w-3" /> só leitura
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : msgs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhuma conversa registrada ainda. As mensagens do WhatsApp deste cliente aparecem aqui automaticamente.
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {msgs.map((m) => {
              const mine = m.direcao === "out";
              const temAnexo = Array.isArray(m.anexos) && m.anexos.length > 0;
              return (
                <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-1.5 text-sm break-words whitespace-pre-wrap",
                    mine ? "bg-primary/10 rounded-br-sm" : "bg-muted rounded-bl-sm",
                  )}>
                    {temAnexo && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
                        <Paperclip className="h-3 w-3" /> anexo
                      </span>
                    )}
                    {limpaAssinatura(m.conteudo) || <span className="italic opacity-60">(sem texto)</span>}
                    <div className="text-[10px] text-muted-foreground mt-0.5 text-right">
                      {m.msg_em ? new Date(m.msg_em).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
