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

    // Mostra o nome cadastrado no CRM (não o apelido do WhatsApp) quando o telefone
    // da conversa casa com uma negociação. Best-effort, em paralelo (a lista é pequena).
    const anexaNomeCrm = async (convs: any[]) => {
      await Promise.all((convs ?? []).map(async (c: any) => {
        const tel = c?.meta?.sender?.phone_number;
        if (!tel) return;
        try {
          const { data: dr } = await admin.rpc("crm_deal_por_telefone", { p_tel: tel });
          const nome = (dr as any[])?.[0]?.cliente_nome;
          if (nome) c.cliente_nome_crm = nome;
        } catch (_e) { /* ignora */ }
      }));
    };

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

    // Caixas (inboxes) e agente(s) do atendente. Admin => vê todas.
    let inboxesPermitidos: number[] | null = null;
    let meusAgentes: number[] = [];
    if (!isAdmin) {
      const { data: inbRows } = await admin.schema("crm").from("crm_atendimento_inbox").select("inbox_id, chatwoot_agent_id").eq("user_id", caller.id);
      inboxesPermitidos = (inbRows ?? []).map((r: any) => Number(r.inbox_id));
      meusAgentes = (inbRows ?? []).map((r: any) => Number(r.chatwoot_agent_id)).filter(Boolean);
    }
    // Visibilidade p/ não-admin: conversa ATRIBUÍDA só aparece pro atendente atribuído
    // (permite transferir de uma pessoa p/ outra); sem atribuição, aparece pro dono da caixa.
    const filtraVisiveis = (convs: any[]) => {
      if (isAdmin || !convs) return convs;
      return convs.filter((c: any) => {
        const aid = c?.meta?.assignee?.id;
        if (aid) return meusAgentes.includes(Number(aid));
        return (inboxesPermitidos ?? []).includes(Number(c.inbox_id));
      });
    };

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
        const params = new URLSearchParams();
        params.set("status", "all"); // traz todas (o default do Chatwoot é só 'open'); filtramos abaixo
        if (payload.page) params.set("page", String(payload.page));
        const raw = await cw(`/conversations?${params.toString()}`, { method: "GET" });
        // O endpoint de conversas embrulha em { data: { meta, payload } } — os demais não.
        // Desembrulha para o app ler direto data.payload.
        const data = raw?.data ?? raw;
        // Aba "Abertas" = open + pending (conversa a atender); "Resolvidas" = resolved.
        if (data?.payload) {
          data.payload = data.payload.filter((c: any) =>
            status === "resolved" ? c.status === "resolved" : (c.status === "open" || c.status === "pending"));
        }
        // Visibilidade por atribuição/caixa (admin vê todas; atribuída segue o atendente).
        if (data?.payload) data.payload = filtraVisiveis(data.payload);
        // Resolve a foto de perfil (thumbnail) do contato p/ URL absoluta.
        const absT = (u?: string) => (!u ? u : (u.startsWith("http") ? u : `${CHATWOOT_URL}${u.startsWith("/") ? "" : "/"}${u}`));
        // Atendente de cada conversa = quem cuida da caixa (mapeamento por inbox).
        const { data: mapRows } = await admin.schema("crm").from("crm_atendimento_inbox").select("inbox_id, nome");
        const inbAtendente: Record<number, string> = {};
        for (const r of (mapRows ?? [])) inbAtendente[Number((r as any).inbox_id)] = (r as any).nome ?? "";
        for (const c of (data?.payload ?? [])) {
          if (c?.meta?.sender) c.meta.sender.thumbnail = absT(c.meta.sender.thumbnail);
          // Nome do atendente: prefere quem está ATRIBUÍDO (reflete a transferência); senão, o dono da caixa.
          (c as any).atendente_nome = c?.meta?.assignee?.name ?? inbAtendente[Number(c.inbox_id)] ?? null;
        }
        await anexaNomeCrm(data?.payload);
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

      // Marca a conversa como lida no Chatwoot (some a bolinha depois que o atendente abre).
      case "mark_read": {
        const cid = payload.conversation_id;
        if (!cid) return J({ error: "conversation_id obrigatório" }, 400);
        try { await cw(`/conversations/${cid}/update_last_seen`, { method: "POST" }); } catch (_e) { /* best-effort */ }
        return J({ ok: true });
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
        // A tarefa "Atendimento WhatsApp" do dia é criada no webhook (chatwoot-webhook),
        // que dispara tanto respondendo pela tela quanto pelo celular — fonte única.
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

      // Envia um áudio (base64) como anexo de mensagem outgoing -> vira áudio no WhatsApp.
      case "send_audio": {
        const cid = payload.conversation_id;
        const b64 = String(payload.audio_base64 ?? "");
        const mime = String(payload.mime ?? "audio/webm");
        if (!cid || !b64) return J({ error: "conversation_id e audio_base64 obrigatórios" }, 400);
        const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const ext = mime.includes("ogg") ? "ogg" : (mime.includes("mp4") || mime.includes("m4a") ? "m4a" : "webm");
        // Assinatura de quem enviou (igual ao texto): vai junto do áudio.
        const sig = String(payload.signature_name ?? "").trim();
        const fd = new FormData();
        if (sig) fd.append("content", `*${sig}:*`);
        fd.append("message_type", "outgoing");
        fd.append("attachments[]", new Blob([bin], { type: mime }), `audio.${ext}`);
        const url = `${CHATWOOT_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${cid}/messages`;
        const res = await fetch(url, { method: "POST", headers: { api_access_token: CHATWOOT_TOKEN }, body: fd });
        const txt = await res.text();
        if (!res.ok) return J({ error: `Chatwoot HTTP ${res.status}: ${txt.slice(0, 200)}` }, 500);
        let data: any; try { data = txt ? JSON.parse(txt) : null; } catch { data = txt; }
        return J({ ok: true, data });
      }

      // Define/edita o nome de um contato no Chatwoot (p/ números que vêm sem nome).
      case "rename_contact": {
        const contactId = payload.contact_id;
        const nome = String(payload.name ?? "").trim();
        if (!contactId || !nome) return J({ error: "contact_id e name obrigatórios" }, 400);
        const data = await cw(`/contacts/${contactId}`, { method: "PUT", body: JSON.stringify({ name: nome }) });
        return J({ ok: true, data });
      }

      // Busca contatos pelo NOME no CRM (o Chatwoot só conhece o número).
      case "search_contacts": {
        const q = String(payload.q ?? "").trim();
        if (q.length < 2) return J({ ok: true, data: [] });
        const { data } = await admin.rpc("crm_busca_contatos", { p_q: q });
        return J({ ok: true, data: data ?? [] });
      }

      // Números (caixas) pelos quais o atendente pode iniciar conversa.
      case "sendable_inboxes": {
        if (isAdmin) {
          const resp = await cw(`/inboxes`, { method: "GET" });
          const list = (resp?.payload ?? []).filter((i: any) => i.name !== "Pingolead (teste)").map((i: any) => ({ inbox_id: i.id, nome: i.name }));
          return J({ ok: true, data: list });
        }
        const { data } = await admin.schema("crm").from("crm_atendimento_inbox").select("inbox_id, nome").eq("user_id", caller.id);
        return J({ ok: true, data: (data ?? []).map((r: any) => ({ inbox_id: Number(r.inbox_id), nome: r.nome })) });
      }

      // Busca conversas (inclui antigas/resolvidas) por nome, telefone ou conteúdo.
      case "search_conversations": {
        const q = String(payload.q ?? "").trim();
        if (!q) return J({ ok: true, data: { payload: [] } });
        const raw = await cw(`/conversations/search?q=${encodeURIComponent(q)}`, { method: "GET" });
        const data = raw?.data ?? raw;
        if (data?.payload) data.payload = filtraVisiveis(data.payload);
        await anexaNomeCrm(data?.payload);
        return J({ ok: true, data });
      }

      // Inicia (ou reabre) uma conversa de WhatsApp com um número — atender a partir do CRM.
      case "start_conversation": {
        const digits = String(payload.phone ?? "").replace(/[^0-9]/g, "");
        // Exige o código do país (NÃO assume 55) — evita mandar mensagem pro país errado.
        if (digits.length < 12) return J({ error: "Inclua o código do país no número (ex.: 55 para o Brasil). Ex.: 55 51 99999-9999" }, 400);
        const phone = "+" + digits;
        const nome = String(payload.name ?? "").trim() || phone;
        const suf = digits.slice(-8);

        // Caixa de envio: usa a escolhida (inbox_id) ou, na falta, a primeira real.
        const inboxesResp = await cw(`/inboxes`, { method: "GET" });
        const inboxes = (inboxesResp?.payload ?? []).filter((i: any) => i.name !== "Pingolead (teste)");
        const wantedInbox = Number(payload.inbox_id) || 0;
        const wa = (wantedInbox ? inboxes.find((i: any) => Number(i.id) === wantedInbox) : null)
          ?? inboxes.find((i: any) => /whatsapp/i.test(String(i.channel_type ?? ""))) ?? inboxes[0];
        if (!wa) return J({ error: "Nenhum inbox de WhatsApp encontrado. Conecte o número primeiro." }, 400);

        // Acha o contato existente por telefone (últimos 8 dígitos, tolera formatos).
        let contactId: number | undefined;
        let sourceId: string | undefined;
        const csResp = await cw(`/contacts/search?q=${encodeURIComponent(suf)}`, { method: "GET" }).catch(() => null);
        const contacts = ((csResp?.data ?? csResp)?.payload ?? csResp?.payload ?? []);
        const hit = (Array.isArray(contacts) ? contacts : []).find((c: any) => String(c.phone_number ?? "").replace(/[^0-9]/g, "").endsWith(suf));
        if (hit) {
          contactId = hit.id;
          sourceId = hit.contact_inboxes?.find((ci: any) => ci?.inbox?.id === wa.id)?.source_id ?? hit.contact_inboxes?.[0]?.source_id;
          // Já tem conversa com esse contato? Reaproveita (preferindo a do inbox de WhatsApp).
          const ccResp = await cw(`/contacts/${contactId}/conversations`, { method: "GET" }).catch(() => null);
          const convs = ((ccResp?.payload ?? ccResp?.data?.payload ?? ccResp) ?? []);
          const arr = Array.isArray(convs) ? convs : [];
          const existing = arr.find((c: any) => c.inbox_id === wa.id) ?? arr[0];
          if (existing?.id) return J({ ok: true, conversation_id: existing.id, reused: true, inbox_id: existing.inbox_id ?? wa.id, phone });
        }

        // Modo "só verificar" (find_only): NÃO cria conversa — evita o rascunho vazio.
        // O app usa isso pra abrir a tela de escrever; só cria de fato ao enviar a 1ª mensagem.
        if (payload.find_only) return J({ ok: true, conversation_id: null, reused: false, inbox_id: wa.id, phone });

        // Não achou: garante o contato (cria se não existir) e abre a conversa.
        if (!contactId) {
          let mk: any = null;
          try {
            mk = await cw(`/contacts`, { method: "POST", body: JSON.stringify({ inbox_id: wa.id, name: nome, phone_number: phone }) });
          } catch { mk = null; }
          const contact = mk?.payload?.contact ?? mk?.payload ?? mk;
          contactId = contact?.id;
          sourceId = contact?.contact_inboxes?.[0]?.source_id ?? mk?.payload?.contact_inbox?.source_id;
        }
        if (contactId && !sourceId) {
          let ci: any = null;
          try { ci = await cw(`/contacts/${contactId}/contact_inboxes`, { method: "POST", body: JSON.stringify({ inbox_id: wa.id }) }); } catch { ci = null; }
          sourceId = ci?.source_id ?? ci?.payload?.source_id;
        }
        if (!contactId) return J({ error: "Não consegui preparar o contato no Chatwoot." }, 500);

        const conv = await cw(`/conversations`, { method: "POST", body: JSON.stringify({ source_id: sourceId, inbox_id: wa.id, contact_id: contactId }) });
        const convId = conv?.id ?? conv?.payload?.id;
        return J({ ok: true, conversation_id: convId, reused: false, inbox_id: wa.id, phone });
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
