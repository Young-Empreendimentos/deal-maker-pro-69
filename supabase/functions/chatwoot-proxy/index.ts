import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Proxy entre o Pingolead e a API do Chatwoot.
// - Guarda o token do Chatwoot como SECRET (nunca vai pro navegador).
// - Valida que quem chama é um usuário ativo do CRM (JWT do Supabase).
// - Expõe só as ações que a tela de atendimento precisa (allowlist por 'action').

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CHATWOOT_URL = (Deno.env.get("CHATWOOT_URL") ?? "").replace(/\/+$/, "");
const CHATWOOT_ACCOUNT_ID = Deno.env.get("CHATWOOT_ACCOUNT_ID") ?? "1";
const CHATWOOT_TOKEN = Deno.env.get("CHATWOOT_API_TOKEN") ?? "";

// Chama a Application API do Chatwoot já com o account e o token.
async function cw(path: string, init?: RequestInit) {
  const url = `${CHATWOOT_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "api_access_token": CHATWOOT_TOKEN,
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  let body: any;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) {
    const msg = (body && typeof body === "object" && (body.message || body.error)) || (typeof body === "string" ? body : "") || `Chatwoot HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const J = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    if (!CHATWOOT_URL || !CHATWOOT_TOKEN) {
      return J({ error: "Chatwoot não configurado. Faltam os secrets CHATWOOT_URL e/ou CHATWOOT_API_TOKEN." }, 500);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Quem está chamando? (usuário logado no Pingolead)
    const authHeader = req.headers.get("Authorization") ?? "";
    const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) return J({ error: "Não autenticado" }, 401);

    // Precisa estar na lista do CRM e ativo. (crm_user_roles vive no schema `crm` após o cutover.)
    const { data: roleRow, error: roleErr } = await admin.schema("crm").from("crm_user_roles").select("role, ativo").eq("user_id", caller.id).maybeSingle();
    if (roleErr) return J({ error: `Erro ao checar permissão no CRM: ${roleErr.message}` }, 500);
    if (!roleRow || roleRow.ativo === false) return J({ error: "Sem acesso ao CRM" }, 403);
    const isAdmin = roleRow.role === "admin";

    const payload = await req.json().catch(() => ({} as any));
    const action = String(payload?.action ?? "");

    switch (action) {
      // Diagnóstico: confirma que os secrets funcionam e o Chatwoot responde.
      case "health": {
        const inboxes = await cw(`/inboxes`, { method: "GET" });
        const n = inboxes?.payload?.length ?? 0;
        return J({ ok: true, chatwoot_url: CHATWOOT_URL, account_id: CHATWOOT_ACCOUNT_ID, inboxes: n });
      }

      case "list_agents":
        return J({ ok: true, data: await cw(`/agents`, { method: "GET" }) });

      case "list_inboxes":
        return J({ ok: true, data: await cw(`/inboxes`, { method: "GET" }) });

      // Lista conversas. status: open|resolved|pending|all ; assignee_type: me|unassigned|assigned|all
      case "list_conversations": {
        const status = String(payload.status ?? "open");
        const assigneeType = String(payload.assignee_type ?? "all");
        const params = new URLSearchParams();
        if (status && status !== "all") params.set("status", status);
        // 'me' no Chatwoot é relativo ao token; filtramos por agente no app. Aqui tratamos só unassigned.
        if (assigneeType === "unassigned") params.set("assignee_type", "unassigned");
        if (payload.page) params.set("page", String(payload.page));
        const raw = await cw(`/conversations?${params.toString()}`, { method: "GET" });
        // O endpoint de conversas embrulha em { data: { meta, payload } } — os demais não.
        // Desembrulha para o app ler direto data.payload.
        const data = raw?.data ?? raw;
        return J({ ok: true, data });
      }

      case "get_messages": {
        const cid = payload.conversation_id;
        if (!cid) return J({ error: "conversation_id obrigatório" }, 400);
        const data = await cw(`/conversations/${cid}/messages`, { method: "GET" });
        // Resolve URLs de anexos (relativos -> absolutos) p/ o app abrir imagens/áudios/arquivos.
        const abs = (u?: string) => (!u ? u : (u.startsWith("http") ? u : `${CHATWOOT_URL}${u.startsWith("/") ? "" : "/"}${u}`));
        for (const m of (data?.payload ?? [])) {
          for (const a of (m.attachments ?? [])) { a.data_url = abs(a.data_url); a.thumb_url = abs(a.thumb_url); }
        }
        return J({ ok: true, data });
      }

      case "send_message": {
        const cid = payload.conversation_id;
        const content = String(payload.content ?? "").trim();
        if (!cid || !content) return J({ error: "conversation_id e content obrigatórios" }, 400);
        // Assinatura: mostra ao cliente quem está atendendo (nome do Pingolead).
        const sig = String(payload.signature_name ?? "").trim();
        const finalContent = sig ? `*${sig}:*\n${content}` : content;
        const data = await cw(`/conversations/${cid}/messages`, {
          method: "POST",
          body: JSON.stringify({ content: finalContent, message_type: "outgoing", private: false }),
        });
        return J({ ok: true, data });
      }

      // Transferir para outro consultor (assignee do Chatwoot).
      case "assign_conversation": {
        const cid = payload.conversation_id;
        if (!cid) return J({ error: "conversation_id obrigatório" }, 400);
        const data = await cw(`/conversations/${cid}/assignments`, {
          method: "POST",
          body: JSON.stringify({ assignee_id: payload.assignee_id ?? null }),
        });
        return J({ ok: true, data });
      }

      // Resolver / reabrir. status: resolved|open|pending
      case "toggle_status": {
        const cid = payload.conversation_id;
        const status = String(payload.status ?? "");
        if (!cid || !status) return J({ error: "conversation_id e status obrigatórios" }, 400);
        const data = await cw(`/conversations/${cid}/toggle_status`, {
          method: "POST",
          body: JSON.stringify({ status }),
        });
        return J({ ok: true, data });
      }

      // Busca conversas (inclui antigas/resolvidas) por nome, telefone ou conteúdo.
      case "search_conversations": {
        const q = String(payload.q ?? "").trim();
        if (!q) return J({ ok: true, data: { payload: [] } });
        const raw = await cw(`/conversations/search?q=${encodeURIComponent(q)}`, { method: "GET" });
        const data = raw?.data ?? raw;
        return J({ ok: true, data });
      }

      // Inicia (ou reabre) uma conversa de WhatsApp com um número — atender a partir do CRM.
      case "start_conversation": {
        const digits = String(payload.phone ?? "").replace(/[^0-9]/g, "");
        if (digits.length < 8) return J({ error: "Telefone inválido." }, 400);
        const phone = "+" + digits;
        const nome = String(payload.name ?? "").trim() || phone;
        const suf = digits.slice(-8);

        // Acha o inbox de WhatsApp (o real da Evolution; nunca o de teste).
        const inboxesResp = await cw(`/inboxes`, { method: "GET" });
        const inboxes = (inboxesResp?.payload ?? []).filter((i: any) => i.name !== "Pingolead (teste)");
        const wa = inboxes.find((i: any) => /whatsapp/i.test(String(i.channel_type ?? ""))) ?? inboxes[0];
        if (!wa) return J({ error: "Nenhum inbox de WhatsApp encontrado. Conecte o número primeiro." }, 400);

        // Já existe conversa com esse número? Reaproveita.
        const foundResp = await cw(`/conversations/search?q=${encodeURIComponent(suf)}`, { method: "GET" });
        const found = ((foundResp?.data ?? foundResp)?.payload ?? []);
        const existing = found.find((c: any) => String(c.meta?.sender?.phone_number ?? "").replace(/[^0-9]/g, "").endsWith(suf));
        if (existing) return J({ ok: true, conversation_id: existing.id, reused: true });

        // Cria o contato (ou acha, se já existir) e abre a conversa.
        let contactId: number | undefined;
        let sourceId: string | undefined;
        let mk: any = null;
        try {
          mk = await cw(`/contacts`, { method: "POST", body: JSON.stringify({ inbox_id: wa.id, name: nome, phone_number: phone }) });
        } catch { mk = null; }
        if (mk) {
          const contact = mk?.payload?.contact ?? mk?.payload ?? mk;
          contactId = contact?.id;
          sourceId = contact?.contact_inboxes?.[0]?.source_id ?? mk?.payload?.contact_inbox?.source_id;
        } else {
          const s = await cw(`/contacts/search?q=${encodeURIComponent(suf)}`, { method: "GET" });
          const list = ((s?.data ?? s)?.payload ?? s?.payload ?? []);
          const hit = list.find((c: any) => String(c.phone_number ?? "").replace(/[^0-9]/g, "").endsWith(suf)) ?? list[0];
          contactId = hit?.id;
          sourceId = hit?.contact_inboxes?.find((ci: any) => ci?.inbox?.id === wa.id)?.source_id ?? hit?.contact_inboxes?.[0]?.source_id;
          if (contactId && !sourceId) {
            let ci: any = null;
            try { ci = await cw(`/contacts/${contactId}/contact_inboxes`, { method: "POST", body: JSON.stringify({ inbox_id: wa.id }) }); } catch { ci = null; }
            sourceId = ci?.source_id ?? ci?.payload?.source_id;
          }
        }
        if (!contactId) return J({ error: "Não consegui preparar o contato no Chatwoot." }, 500);

        const conv = await cw(`/conversations`, { method: "POST", body: JSON.stringify({ source_id: sourceId, inbox_id: wa.id, contact_id: contactId }) });
        const convId = conv?.id ?? conv?.payload?.id;
        return J({ ok: true, conversation_id: convId, reused: false });
      }

      // TEMP (fase de teste): cria uma conversa fake para validar a tela sem WhatsApp.
      // Garante um inbox tipo API "Pingolead (teste)", um contato e 1 mensagem do "cliente".
      case "create_test_conversation": {
        const inboxes = await cw(`/inboxes`, { method: "GET" });
        let inbox = (inboxes?.payload ?? []).find((i: any) => i.name === "Pingolead (teste)");
        if (!inbox) {
          inbox = await cw(`/inboxes`, {
            method: "POST",
            body: JSON.stringify({ name: "Pingolead (teste)", channel: { type: "api", webhook_url: "" } }),
          });
        }
        const inboxId = inbox.id ?? inbox?.payload?.id;
        // Garante que os atendentes ENXERGUEM este inbox (senão a listagem não traz as conversas dele).
        try {
          const agentsResp = await cw(`/agents`, { method: "GET" });
          const agentIds = (Array.isArray(agentsResp) ? agentsResp : (agentsResp?.payload ?? [])).map((a: any) => a.id).filter(Boolean);
          if (agentIds.length) await cw(`/inbox_members`, { method: "POST", body: JSON.stringify({ inbox_id: inboxId, user_ids: agentIds }) });
        } catch (_e) { /* provavelmente já são membros */ }
        const uniq = `${Date.now()}`.slice(-7) + Math.floor(Math.random() * 90 + 10);
        const nomeCliente = String(payload.name ?? `Cliente Teste ${uniq.slice(-3)}`);
        const contactResp = await cw(`/contacts`, {
          method: "POST",
          body: JSON.stringify({ inbox_id: inboxId, name: nomeCliente, phone_number: `+55519${uniq}` }),
        });
        const contact = contactResp?.payload?.contact ?? contactResp?.payload ?? contactResp;
        const contactId = contact?.id;
        const sourceId =
          contact?.contact_inboxes?.[0]?.source_id ??
          contactResp?.payload?.contact_inbox?.source_id ??
          contact?.contact_inbox?.source_id;
        const conv = await cw(`/conversations`, {
          method: "POST",
          body: JSON.stringify({ source_id: sourceId, inbox_id: inboxId, contact_id: contactId }),
        });
        const convId = conv?.id ?? conv?.payload?.id;
        await cw(`/conversations/${convId}/messages`, {
          method: "POST",
          body: JSON.stringify({
            content: String(payload.text ?? "Olá! Vi o anúncio de vocês e queria saber sobre os lotes disponíveis. 🙂"),
            message_type: "incoming",
          }),
        });
        return J({ ok: true, conversation_id: convId });
      }

      default:
        return J({ error: `Ação desconhecida: ${action || "(vazia)"}` }, 400);
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message ?? String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
