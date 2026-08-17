import { useEffect, useState } from "react";
import { crmDb } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Loader2, Mic, Image as ImageIcon, Video, FileText, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type Anexo = {
  file_type?: string;      // audio | image | video | file
  data_url?: string;
  extension?: string | null;
  transcribed_text?: string | null;
};

type Msg = {
  id: string;
  direcao: "in" | "out";
  conteudo: string | null;
  autor_nome: string | null;
  msg_em: string | null;
  anexos: Anexo[] | null;
};

// No WhatsApp a assinatura vira negrito (*Nome:*); aqui mostra sem os asteriscos.
function limpaAssinatura(s?: string | null) {
  return (s ?? "").replace(/^\*([^\n*]+):\*/, "$1:");
}

const ANEXO = {
  audio: { icon: Mic, label: "Áudio" },
  image: { icon: ImageIcon, label: "Imagem" },
  video: { icon: Video, label: "Vídeo" },
  file: { icon: FileText, label: "Arquivo" },
} as const;

function tipoAnexo(ft?: string) {
  return (ANEXO as any)[ft ?? ""] ?? ANEXO.file;
}

// Mostra um anexo (áudio toca ali mesmo; imagem vira miniatura; resto vira link).
function Anexo({ a }: { a: Anexo }) {
  const info = tipoAnexo(a.file_type);
  const Icon = info.icon;
  return (
    <div className="mb-1">
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Icon className="h-3 w-3" /> {info.label}
      </span>
      {a.file_type === "audio" && a.data_url && (
        <audio controls preload="none" src={a.data_url} className="mt-1 h-8 w-56 max-w-full" />
      )}
      {a.file_type === "image" && a.data_url && (
        <a href={a.data_url} target="_blank" rel="noreferrer">
          <img src={a.data_url} alt="imagem" className="mt-1 max-h-40 rounded-lg" loading="lazy" />
        </a>
      )}
      {a.file_type !== "audio" && a.file_type !== "image" && a.data_url && (
        <a href={a.data_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-primary underline">
          abrir {info.label.toLowerCase()}
        </a>
      )}
      {/* Transcrição do áudio, quando o Chatwoot conseguir gerar. */}
      {a.transcribed_text && a.transcribed_text.trim() && (
        <p className="mt-1 text-xs italic opacity-80">“{a.transcribed_text.trim()}”</p>
      )}
    </div>
  );
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
              const anexos = Array.isArray(m.anexos) ? m.anexos : [];
              const texto = limpaAssinatura(m.conteudo);
              return (
                <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-1.5 text-sm break-words whitespace-pre-wrap",
                    mine ? "bg-primary/10 rounded-br-sm" : "bg-muted rounded-bl-sm",
                  )}>
                    {anexos.map((a, i) => <Anexo key={i} a={a} />)}
                    {texto
                      ? <span>{texto}</span>
                      : anexos.length === 0 && <span className="italic opacity-60">(sem texto)</span>}
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
