import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

// Página pública aberta pelo botão do e-mail de auditoria. Dispara o envio dos
// e-mails individuais (um por consultor) via Edge Function e mostra o status.
// Fica no domínio do Pingolead (link amigável), sem exigir login; a Edge Function
// valida um token que vem na URL.
const FN_URL = "https://vvtympzatclvjaqucebr.supabase.co/functions/v1/auditoria-individual";

export default function EnviarAuditoriaIndividual() {
  const [sp] = useSearchParams();
  const [status, setStatus] = useState<"enviando" | "ok" | "erro">("enviando");
  const [detalhe, setDetalhe] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // evita disparo duplicado
    ran.current = true;
    const from = sp.get("from") ?? "";
    const to = sp.get("to") ?? "";
    const token = sp.get("token") ?? "";
    const url = `${FN_URL}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&token=${encodeURIComponent(token)}`;
    fetch(url)
      .then(async (r) => {
        const j = await r.json().catch(() => ({} as any));
        if (r.ok && j.ok) { setStatus("ok"); setDetalhe(`${j.enviados} auditoria(s) enviada(s).`); }
        else { setStatus("erro"); setDetalhe(j.error || `HTTP ${r.status}`); }
      })
      .catch((e) => { setStatus("erro"); setDetalhe(String(e)); });
  }, [sp]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md text-center rounded-xl border bg-card p-8">
        {status === "enviando" && (
          <>
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
            <p className="text-muted-foreground">Enviando as auditorias individuais…</p>
          </>
        )}
        {status === "ok" && (
          <>
            <h1 className="text-2xl font-bold text-emerald-600">✓ Enviado</h1>
            <p className="mt-2">{detalhe}</p>
            <p className="mt-2 text-sm text-muted-foreground">Cada consultor recebeu apenas a própria auditoria.</p>
          </>
        )}
        {status === "erro" && (
          <>
            <h1 className="text-2xl font-bold text-red-600">Não foi possível enviar</h1>
            <p className="mt-2 text-sm text-muted-foreground">{detalhe}</p>
          </>
        )}
      </div>
    </div>
  );
}
