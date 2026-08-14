import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Recebe os eventos do Chatwoot (webhook) e espelha as mensagens no Supabase,
// já vinculadas à negociação pelo telefone. Escrita via service role (o app só lê).
// Segurança: se o secret CHATWOOT_WEBHOOK_SECRET estiver definido, exige ?s=<secret> na URL.

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const secret = Deno.env.get("CHATWOOT_WEBHOOK_SECRET") ?? "";
    if (secret && url.searchParams.get("s") !== secret) {
      return new Response("forbidden", { status: 403 });
    }

    const body = await req.json().catch(() => ({} as any));
    // Só interessa mensagem criada; o resto (typing, status, etc.) é ignorado.
    if (body?.event !== "message_created") return new Response("ignored", { status: 200 });

    const mid = body.id ?? body.message?.id;
    const messageType = body.message_type ?? body.message?.message_type;
    const direcao = messageType === "outgoing" || messageType === 1 ? "out"
      : (messageType === "incoming" || messageType === 0 ? "in" : null);
    if (!direcao || !mid) return new Response("ignored", { status: 200 }); // ignora atividade/template

    const conv = body.conversation ?? {};
    const convId = conv.id ?? body.conversation_id ?? null;
    const phone = conv?.meta?.sender?.phone_number ?? body?.sender?.phone_number ?? "";
    const conteudo = body.content ?? "";
    const autor = body?.sender?.name ?? "";
    const anexos = body.attachments ?? null;
    const rawT = body.created_at;
    const msgEm = typeof rawT === "number" ? new Date(rawT * 1000).toISOString()
      : (rawT ? new Date(rawT).toISOString() : new Date().toISOString());

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Casa o telefone com uma negociação (últimos 8 dígitos).
    let dealId: string | null = null;
    if (phone) {
      const { data } = await admin.rpc("crm_deal_por_telefone", { p_tel: phone });
      dealId = (data as any[])?.[0]?.deal_id ?? null;
    }

    // Grava (dedup por chatwoot_message_id).
    await admin.schema("crm").from("crm_atendimento_mensagens").upsert({
      chatwoot_message_id: mid,
      conversation_id: convId,
      deal_id: dealId,
      telefone: phone || null,
      direcao,
      conteudo,
      autor_nome: autor || null,
      anexos,
      msg_em: msgEm,
    }, { onConflict: "chatwoot_message_id", ignoreDuplicates: true });

    return new Response("ok", { status: 200 });
  } catch (e) {
    // Responde 200 pro Chatwoot não ficar reenviando; loga o erro.
    console.error("chatwoot-webhook:", (e as Error).message);
    return new Response("error", { status: 200 });
  }
});
