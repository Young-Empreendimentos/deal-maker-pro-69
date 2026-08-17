import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Recebe os eventos do Chatwoot (webhook) e espelha as mensagens no Supabase, já
// vinculadas à negociação pelo telefone. Também: sincroniza a foto de perfil do
// WhatsApp (via Evolution), cria a tarefa de atendimento do dia e atribui a conversa.
// Escrita via service role (o app só lê). Segurança: secret opcional (?s=).

const CW_URL = Deno.env.get("CHATWOOT_URL") ?? "";
const CW_ACC = Deno.env.get("CHATWOOT_ACCOUNT_ID") ?? "1";
const CW_TOKEN = Deno.env.get("CHATWOOT_API_TOKEN") ?? "";
const EVO_URL = (Deno.env.get("EVOLUTION_URL") ?? "").trim();
const EVO_KEY = (Deno.env.get("EVOLUTION_API_KEY") ?? "").trim();
const EVO_INST = (Deno.env.get("EVOLUTION_INSTANCE") ?? "").trim();

// Busca a foto de perfil do WhatsApp na Evolution e seta como avatar do contato no Chatwoot.
// Best-effort: se faltar config, não tiver foto ou der erro, apenas ignora (fica nas iniciais).
async function sincronizarFoto(contactId: number | undefined, phone: string, jaTem: boolean) {
  if (jaTem || !contactId || !phone || !EVO_URL || !EVO_KEY || !EVO_INST || !CW_TOKEN) return;
  try {
    const pr = await fetch(`${EVO_URL}/chat/fetchProfilePictureUrl/${EVO_INST}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": EVO_KEY },
      body: JSON.stringify({ number: phone.replace(/[^0-9]/g, "") }),
    });
    const pj = await pr.json().catch(() => null);
    const foto = pj?.profilePictureUrl;
    if (!foto) return;
    await fetch(`${CW_URL}/api/v1/accounts/${CW_ACC}/contacts/${contactId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "api_access_token": CW_TOKEN },
      body: JSON.stringify({ avatar_url: foto }),
    });
  } catch (_e) { /* foto é opcional; ignora */ }
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const secret = Deno.env.get("CHATWOOT_WEBHOOK_SECRET") ?? "";
    if (secret && url.searchParams.get("s") !== secret) return new Response("forbidden", { status: 403 });

    const body = await req.json().catch(() => ({} as any));
    if (body?.event !== "message_created") return new Response("ignored", { status: 200 });

    const mid = body.id ?? body.message?.id;
    const messageType = body.message_type ?? body.message?.message_type;
    const direcao = messageType === "outgoing" || messageType === 1 ? "out"
      : (messageType === "incoming" || messageType === 0 ? "in" : null);
    if (!direcao || !mid) return new Response("ignored", { status: 200 });

    const conv = body.conversation ?? {};
    const convId = conv.id ?? body.conversation_id ?? null;
    const sender = conv?.meta?.sender ?? body?.sender ?? {};
    const phone = sender?.phone_number ?? "";
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
    const { error } = await admin.schema("crm").from("crm_atendimento_mensagens").upsert({
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
    if (error) { console.error("chatwoot-webhook upsert:", error.message); return new Response("db-error", { status: 200 }); }

    // Foto de perfil (só p/ mensagens do cliente, quando o contato ainda não tem avatar).
    if (direcao === "in") await sincronizarFoto(sender?.id, phone, !!sender?.thumbnail);

    // Dados da caixa (atendente + agente do Chatwoot) — usados p/ a tarefa e a atribuição.
    const inboxId = conv?.inbox_id;
    let inbRow: any = null;
    if (inboxId) {
      const { data } = await admin.schema("crm").from("crm_atendimento_inbox")
        .select("user_id, chatwoot_agent_id").eq("inbox_id", inboxId).maybeSingle();
      inbRow = data;
    }

    // Tarefa automática: 1 "Atendimento WhatsApp" concluída por dia por cliente, no nome
    // do atendente da caixa. Vale respondendo pela tela do Pingolead OU pelo celular.
    if (direcao === "out" && dealId && inbRow?.user_id) {
      const { error: taskErr } = await admin.rpc("crm_registra_atividade_whats", { p_deal: dealId, p_user: inbRow.user_id });
      if (taskErr) console.error("atividade whats:", taskErr.message);
    }

    // Atribuição automática: conversa da caixa vai pro atendente da caixa (se ainda sem atendente).
    if (inboxId && !conv?.meta?.assignee && CW_TOKEN && inbRow?.chatwoot_agent_id && convId) {
      try {
        await fetch(`${CW_URL}/api/v1/accounts/${CW_ACC}/conversations/${convId}/assignments`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "api_access_token": CW_TOKEN },
          body: JSON.stringify({ assignee_id: inbRow.chatwoot_agent_id }),
        });
      } catch (_e) { /* atribuição best-effort */ }
    }

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("chatwoot-webhook:", (e as Error).message);
    return new Response("error", { status: 200 });
  }
});
