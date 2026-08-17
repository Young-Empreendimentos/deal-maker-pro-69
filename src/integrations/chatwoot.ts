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

async function call<T = any>(action: string, params: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("chatwoot-proxy", { body: { action, ...params } });
  if (error) {
    let msg = error.message || "Falha ao falar com o Chatwoot";
    try {
      const j = await (error as any).context?.json?.();
      if (j?.error) msg = j.error;
    } catch { /* ignora */ }
    throw new Error(msg);
  }
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
}

export const chatwoot = {
  /** Diagnóstico: confirma secrets + Chatwoot no ar. */
  health: () => call<{ ok: boolean; chatwoot_url: string; account_id: string; inboxes: number }>("health"),

  listConversations: (status: string, assignee_type: string = "all") =>
    call<{ ok: boolean; data: { meta?: any; payload?: CwConversation[] } }>("list_conversations", { status, assignee_type }),

  /** Busca conversas (inclui antigas/resolvidas) por nome, telefone ou conteúdo. */
  searchConversations: (q: string) =>
    call<{ ok: boolean; data: { payload?: CwConversation[] } }>("search_conversations", { q }),

  /** Inicia (ou reabre) uma conversa de WhatsApp com um número, pela caixa (número) escolhida.
   *  find_only=true só verifica se já existe (não cria) — usado pra abrir a tela de escrever sem gerar rascunho. */
  startConversation: (phone: string, name?: string, inbox_id?: number, find_only?: boolean) =>
    call<{ ok: boolean; conversation_id: number | null; reused: boolean; inbox_id?: number; phone?: string }>("start_conversation", { phone, name, inbox_id, find_only }),

  /** Busca contatos por NOME no CRM (retorna nome + telefone). */
  searchContacts: (q: string) =>
    call<{ ok: boolean; data: { deal_id: string; cliente_nome: string; telefone: string; empreendimento_nome?: string }[] }>("search_contacts", { q }),

  /** Números (caixas) pelos quais o atendente pode iniciar conversa. */
  sendableInboxes: () =>
    call<{ ok: boolean; data: { inbox_id: number; nome: string }[] }>("sendable_inboxes"),

  getMessages: (conversation_id: number) =>
    call<{ ok: boolean; data: { payload?: CwMessage[] } }>("get_messages", { conversation_id }),

  sendMessage: (conversation_id: number, content: string, signature_name?: string, phone?: string) =>
    call("send_message", { conversation_id, content, signature_name, phone }),

  assign: (conversation_id: number, assignee_id: number | null) =>
    call("assign_conversation", { conversation_id, assignee_id }),

  toggleStatus: (conversation_id: number, status: "resolved" | "open" | "pending") =>
    call("toggle_status", { conversation_id, status }),

  /** Define/edita o nome do contato no Chatwoot (para números que aparecem sem nome). */
  renameContact: (contact_id: number, name: string) =>
    call("rename_contact", { contact_id, name }),

  /** Envia um áudio gravado (base64) como mensagem de voz para o WhatsApp do cliente. */
  sendAudio: (conversation_id: number, audio_base64: string, mime: string, signature_name?: string) =>
    call("send_audio", { conversation_id, audio_base64, mime, signature_name }),

  listAgents: () => call<{ ok: boolean; data: CwAgent[] }>("list_agents"),

  /** TEMP (fase de teste): cria uma conversa fake para validar a tela sem WhatsApp. */
  createTestConversation: () => call<{ ok: boolean; conversation_id: number }>("create_test_conversation"),
};
