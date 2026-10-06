// Ponte do app com o Chatwoot. Nunca fala direto com o Chatwoot: sempre passa
// pela Edge Function `chatwoot-proxy` (que guarda o token e valida o usuário do CRM).
import { supabase } from "./supabase/client";

export type CwAgent = { id: number; name: string; email: string; availability_status?: string };

export type CwSender = {
  id: number;
  name?: string;
  phone_number?: string | null;
  email?: string | null;
  thumbnail?: string;
};

export type CwConversation = {
  id: number;
  status: "open" | "resolved" | "pending" | "snoozed";
  unread_count?: number;
  timestamp?: number;
  inbox_id?: number;
  atendente_nome?: string | null;
  cliente_nome_crm?: string | null; // nome cadastrado no CRM (quando o telefone casa com uma negociação)
  meta?: { sender?: CwSender; assignee?: CwAgent | null };
  last_non_activity_message?: { content?: string } | null;
  messages?: CwMessage[];
};

export type CwAttachment = {
  id: number;
  file_type: string; // image | audio | video | file | ...
  data_url?: string;
  thumb_url?: string;
  extension?: string | null;
};

export type CwMessage = {
  id: number;
  content: string | null;
  // 0 = recebida (cliente) · 1 = enviada (atendente) · 2 = atividade/sistema · 3 = template
  message_type: 0 | 1 | 2 | 3;
  created_at: number;
  private?: boolean;
  sender?: { name?: string; type?: string };
  attachments?: CwAttachment[];
};

// Erro TRANSIENTE = vale re-tentar: falha de rede (internet ruim) ou 5xx/429 do servidor.
// 401/403/400 (erro real de permissão/validação) NÃO re-tenta.
function transiente(error: any): boolean {
  if (!error) return false;
  const nome = String(error.name || "");
  if (nome === "FunctionsFetchError" || nome === "FunctionsRelayError") return true; // rede/relay
  if (/timeout|network|fetch|failed/i.test(String(error.message || ""))) return true;
  const st = error.context?.status ?? error.status;
  return st === 429 || st === 500 || st === 502 || st === 503 || st === 504;
}

// Timeout por tentativa (a invoke do supabase-js não aceita AbortSignal direto): corremos contra um
// timer pra não ficar pendurado numa conexão ruim — e aí a re-tentativa entra.
function comTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, rej) => setTimeout(() => rej(Object.assign(new Error("timeout"), { name: "FunctionsFetchError" })), ms)),
  ]);
}

// retriable=true → re-tenta leituras (idempotentes) quando a rede falha. Escritas ficam false.
async function call<T = any>(action: string, params: Record<string, unknown> = {}, retriable = false): Promise<T> {
  const maxTent = retriable ? 3 : 1;
  let ultimoErro: any;
  for (let tent = 0; tent < maxTent; tent++) {
    let data: any, error: any;
    try {
      ({ data, error } = await comTimeout(
        supabase.functions.invoke("chatwoot-proxy", { body: { action, ...params } }),
        retriable ? 15000 : 30000,
      ));
    } catch (e) { error = e; }

    if (!error) {
      if (data?.error) throw new Error(data.error); // erro de app (ex.: "Não autenticado") — não re-tenta
      return data as T;
    }
    // Erro transiente e ainda temos tentativa → espera e re-tenta.
    if (transiente(error) && tent < maxTent - 1) {
      ultimoErro = error;
      await new Promise((r) => setTimeout(r, 500 * (tent + 1)));
      continue;
    }
    // Erro definitivo → monta a mensagem e lança.
    let msg = error.message || "Falha ao falar com o Chatwoot";
    if (transiente(error)) msg = "Conexão instável — não consegui falar com o Atendimento. Tente de novo.";
    try {
      const j = await (error as any).context?.json?.();
      if (j?.error) msg = j.error;
    } catch { /* ignora */ }
    throw new Error(msg);
  }
  throw new Error(ultimoErro?.message || "Conexão instável — tente de novo.");
}

export const chatwoot = {
  /** Diagnóstico: confirma secrets + Chatwoot no ar. */
  health: () => call<{ ok: boolean; chatwoot_url: string; account_id: string; inboxes: number }>("health"),

  listConversations: (status: string, assignee_type: string = "all", max_pages?: number) =>
    call<{ ok: boolean; data: { meta?: any; payload?: CwConversation[] } }>("list_conversations", { status, assignee_type, max_pages }, true),

  /** Busca conversas (inclui antigas/resolvidas) por nome, telefone ou conteúdo. */
  searchConversations: (q: string) =>
    call<{ ok: boolean; data: { payload?: CwConversation[] } }>("search_conversations", { q }, true),

  /** Inicia (ou reabre) uma conversa de WhatsApp com um número, pela caixa (número) escolhida.
   *  find_only=true só verifica se já existe (não cria) — usado pra abrir a tela de escrever sem gerar rascunho. */
  startConversation: (phone: string, name?: string, inbox_id?: number, find_only?: boolean) =>
    call<{ ok: boolean; conversation_id: number | null; reused: boolean; inbox_id?: number; phone?: string }>("start_conversation", { phone, name, inbox_id, find_only }, !!find_only),

  /** Busca contatos por NOME no CRM (retorna nome + telefone). */
  searchContacts: (q: string) =>
    call<{ ok: boolean; data: { deal_id: string; cliente_nome: string; telefone: string; empreendimento_nome?: string }[] }>("search_contacts", { q }, true),

  /** Números (caixas) pelos quais o atendente pode iniciar conversa. */
  sendableInboxes: () =>
    call<{ ok: boolean; data: { inbox_id: number; nome: string }[] }>("sendable_inboxes", {}, true),

  /** Agenda do WhatsApp do número (caixa) — contatos salvos, pra buscar por nome. */
  whatsappContacts: (inbox_id: number) =>
    call<{ ok: boolean; data: { nome: string; telefone: string }[] }>("whatsapp_contacts", { inbox_id }, true),

  getMessages: (conversation_id: number) =>
    call<{ ok: boolean; data: { payload?: CwMessage[] } }>("get_messages", { conversation_id }, true),

  sendMessage: (conversation_id: number, content: string, signature_name?: string, phone?: string) =>
    call("send_message", { conversation_id, content, signature_name, phone }),

  assign: (conversation_id: number, assignee_id: number | null) =>
    call("assign_conversation", { conversation_id, assignee_id }),

  toggleStatus: (conversation_id: number, status: "resolved" | "open" | "pending") =>
    call("toggle_status", { conversation_id, status }),

  /** Marca a conversa como lida no Chatwoot (some a bolinha de não-lida). */
  markRead: (conversation_id: number) => call("mark_read", { conversation_id }),

  /** Define/edita o nome do contato no Chatwoot (para números que aparecem sem nome). */
  renameContact: (contact_id: number, name: string) =>
    call("rename_contact", { contact_id, name }),

  /** Envia um áudio gravado (base64) como mensagem de voz para o WhatsApp do cliente. */
  sendAudio: (conversation_id: number, audio_base64: string, mime: string, signature_name?: string) =>
    call("send_audio", { conversation_id, audio_base64, mime, signature_name }),

  listAgents: () => call<{ ok: boolean; data: CwAgent[] }>("list_agents", {}, true),

  /** TEMP (fase de teste): cria uma conversa fake para validar a tela sem WhatsApp. */
  createTestConversation: () => call<{ ok: boolean; conversation_id: number }>("create_test_conversation"),
};
