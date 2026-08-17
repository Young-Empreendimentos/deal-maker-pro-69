import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppLayout } from "@/components/crm/AppLayout";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { chatwoot, type CwAgent, type CwAttachment, type CwConversation, type CwMessage } from "@/integrations/chatwoot";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Headset, Send, CheckCheck, UserPlus, RotateCcw, Loader2,
  ArrowLeft, AlertTriangle, Search, X, Plus, Paperclip, Pencil, Check, Mic, Trash2,
} from "lucide-react";
import { AtendimentoDealPanel } from "@/components/crm/AtendimentoDealPanel";

const POLL_MS = 6000;

type StatusTab = "open" | "resolved";
type AssigneeTab = "me" | "unassigned" | "all";

function hora(ts?: number) {
  if (!ts) return "";
  return new Date(ts * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
function iniciais(nome?: string) {
  const n = (nome || "?").trim();
  const p = n.split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() || "?";
}
function fonePretty(f?: string | null) {
  return f || "sem telefone";
}
function pareceNumero(s: string) {
  return s.replace(/[^0-9]/g, "").length >= 6;
}
function limpaAssinatura(s: string) {
  // No WhatsApp a assinatura do atendente vira negrito (*Nome:*); no painel, mostra sem os asteriscos.
  return s.replace(/^\*([^\n*]+):\*/, "$1:");
}
function fmtSeg(s: number) {
  const m = Math.floor(s / 60), r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
// Escolhe um formato de áudio que o navegador saiba gravar (opus é o ideal p/ WhatsApp).
function melhorMimeAudio() {
  const cands = ["audio/ogg;codecs=opus", "audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  for (const m of cands) {
    try { if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) return m; } catch { /* ignora */ }
  }
  return "";
}
function blobParaBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onloadend = () => { const s = String(r.result || ""); const i = s.indexOf(","); resolve(i >= 0 ? s.slice(i + 1) : s); };
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

export default function Atendimento() {
  const { user, nome, isAdmin } = useAuth();
  const { toast } = useToast();
  const [sp] = useSearchParams();

  const [statusTab, setStatusTab] = useState<StatusTab>("open");
  // Piloto (número central): todos veem as conversas do número. A separação por pessoa
  // ("Minhas") entra quando cada consultor tiver o próprio número conectado.
  const [assigneeTab, setAssigneeTab] = useState<AssigneeTab>("all");
  const [filtroAtendente, setFiltroAtendente] = useState("");
  const [convs, setConvs] = useState<CwConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [selId, setSelId] = useState<number | null>(() => {
    try { const s = sessionStorage.getItem("atendimento_sel"); return s ? Number(s) : null; } catch { return null; }
  });
  const [msgs, setMsgs] = useState<CwMessage[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [agents, setAgents] = useState<CwAgent[]>([]);
  const [busy, setBusy] = useState(false);
  const [busca, setBusca] = useState("");
  const [resultadosBusca, setResultadosBusca] = useState<CwConversation[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [nomeInicial, setNomeInicial] = useState("");
  const [iniciando, setIniciando] = useState(false);
  const [inboxesEnvio, setInboxesEnvio] = useState<{ inbox_id: number; nome: string }[]>([]);
  const [inboxEnvio, setInboxEnvio] = useState<number | null>(null);
  const [contatos, setContatos] = useState<{ deal_id: string; cliente_nome: string; telefone: string; empreendimento_nome?: string }[]>([]);
  const [compose, setCompose] = useState<{ phone: string; nome: string; inboxId: number | null } | null>(null);
  const [nomesManuais, setNomesManuais] = useState<Record<number, string>>(() => {
    try { return JSON.parse(localStorage.getItem("atendimento_nomes") || "{}"); } catch { return {}; }
  });
  const [editandoNome, setEditandoNome] = useState(false);
  const [nomeEdit, setNomeEdit] = useState("");
  const [salvandoNome, setSalvandoNome] = useState(false);
  const [gravando, setGravando] = useState(false);
  const [enviandoAudio, setEnviandoAudio] = useState(false);
  const [segGrav, setSegGrav] = useState(0);
  const gravadorRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const enviarAoPararRef = useRef(false);
  const ocupadoRef = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  const loadConvs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const r = await chatwoot.listConversations(statusTab, "all");
      setConvs(r.data?.payload ?? []);
      setErro(null);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [statusTab]);

  const loadMsgs = useCallback(async (id: number, silent = false) => {
    try {
      const r = await chatwoot.getMessages(id);
      setMsgs(r.data?.payload ?? []);
    } catch {
      if (!silent) toast({ title: "Não consegui carregar as mensagens", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => { loadConvs(); }, [loadConvs]);
  useEffect(() => { chatwoot.listAgents().then((r) => setAgents(r.data ?? [])).catch(() => {}); }, []);
  useEffect(() => {
    if (selId) {
      loadMsgs(selId);
      // Marca como lida no Chatwoot (some a bolinha) e limpa localmente na hora.
      chatwoot.markRead(selId).catch(() => {});
      setConvs((cs) => cs.map((c) => (c.id === selId ? { ...c, unread_count: 0 } : c)));
    } else setMsgs([]);
  }, [selId, loadMsgs]);
  useEffect(() => {
    setEditandoNome(false);
    // trocou de conversa no meio de uma gravação: descarta o áudio
    enviarAoPararRef.current = false;
    if (gravadorRef.current && gravadorRef.current.state !== "inactive") gravadorRef.current.stop();
  }, [selId]);
  // Ao sair da tela, garante que o microfone seja liberado.
  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); if (timerRef.current) clearInterval(timerRef.current); }, []);
  // Guarda os nomes definidos no lápis (sobrevive ao reload de 5 min).
  useEffect(() => { try { localStorage.setItem("atendimento_nomes", JSON.stringify(nomesManuais)); } catch { /* ignora */ } }, [nomesManuais]);
  // Mantém a conversa aberta mesmo depois de um reload (rede de segurança abaixo).
  useEffect(() => {
    try { if (selId) sessionStorage.setItem("atendimento_sel", String(selId)); else sessionStorage.removeItem("atendimento_sel"); } catch { /* ignora */ }
  }, [selId]);
  // Rede de segurança: recarrega a página a cada 5 min (caso o polling trave e pare de
  // trazer conversas novas) — mas NUNCA no meio de digitar / gravar / enviar.
  useEffect(() => { ocupadoRef.current = !!(reply.trim() || gravando || enviandoAudio || sending); }, [reply, gravando, enviandoAudio, sending]);
  useEffect(() => {
    const t = setInterval(() => { if (!ocupadoRef.current) window.location.reload(); }, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  // Atualização automática (sem realtime): repuxa a lista e a conversa aberta.
  useEffect(() => {
    const t = setInterval(() => {
      loadConvs(true);
      if (selId) loadMsgs(selId, true);
    }, POLL_MS);
    return () => clearInterval(t);
  }, [loadConvs, loadMsgs, selId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  // Números (caixas) pelos quais dá pra iniciar conversa.
  useEffect(() => {
    chatwoot.sendableInboxes().then((r) => {
      const list = r.data ?? [];
      setInboxesEnvio(list);
      setInboxEnvio((prev) => prev ?? list[0]?.inbox_id ?? null);
    }).catch(() => {});
  }, []);

  // Busca: conversas antigas/resolvidas (Chatwoot) + contatos por NOME (CRM), com debounce.
  useEffect(() => {
    const q = busca.trim();
    if (q.length < 2) { setResultadosBusca([]); setContatos([]); setBuscando(false); return; }
    setBuscando(true);
    const t = setTimeout(async () => {
      try {
        const [rc, rk] = await Promise.all([
          chatwoot.searchConversations(q).catch(() => ({ data: { payload: [] } } as any)),
          chatwoot.searchContacts(q).catch(() => ({ data: [] } as any)),
        ]);
        setResultadosBusca(rc.data?.payload ?? []);
        setContatos(rk.data ?? []);
      } finally {
        setBuscando(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [busca]);

  // Veio de "Conversar no WhatsApp" numa negociação: já busca o número.
  useEffect(() => {
    const tel = sp.get("tel");
    if (tel) { setBusca(tel); setNomeInicial(sp.get("nome") ?? ""); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Atendentes existentes (p/ o filtro do admin).
  const atendentes = useMemo(() => {
    const s = new Set<string>();
    for (const c of convs) { const n = (c as any).atendente_nome; if (n) s.add(n); }
    return Array.from(s).sort();
  }, [convs]);

  const filtered = useMemo(() => {
    const me = user?.email?.toLowerCase();
    return convs.filter((c) => {
      if (filtroAtendente && (c as any).atendente_nome !== filtroAtendente) return false;
      if (assigneeTab === "me") return c.meta?.assignee?.email?.toLowerCase() === me;
      if (assigneeTab === "unassigned") return !c.meta?.assignee;
      return true;
    });
  }, [convs, assigneeTab, user, filtroAtendente]);

  const buscaAtiva = busca.trim().length >= 2;
  const listaExibida = buscaAtiva ? resultadosBusca : filtered;

  const sel = useMemo(
    () => convs.find((c) => c.id === selId) ?? resultadosBusca.find((c) => c.id === selId) ?? null,
    [convs, resultadosBusca, selId],
  );

  async function enviar() {
    const texto = reply.trim();
    if (!texto || sending) return;
    setSending(true);
    try {
      const alvo = await garantirConversa();
      if (!alvo) return;
      await chatwoot.sendMessage(alvo.id, texto, nome || undefined, alvo.phone ?? undefined);
      setReply("");
      await loadMsgs(alvo.id, true);
    } catch (e) {
      toast({ title: "Não consegui enviar", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  async function transferir(agent: CwAgent) {
    if (!sel) return;
    setBusy(true);
    try {
      await chatwoot.assign(sel.id, agent.id);
      toast({ title: `Transferida para ${agent.name}` });
      await loadConvs(true);
    } catch (e) {
      toast({ title: "Não consegui transferir", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  async function salvarNomeContato() {
    const cid = sel?.meta?.sender?.id;
    const novo = nomeEdit.trim();
    if (!cid || !novo) { setEditandoNome(false); return; }
    setSalvandoNome(true);
    try {
      await chatwoot.renameContact(cid, novo);
      // O nome definido no lápis passa a ser o exibido (vale p/ qualquer contato, inclusive negociação).
      setNomesManuais((m) => ({ ...m, [sel!.id]: novo }));
      setConvs((cs) => cs.map((c) => (c.id === sel!.id
        ? { ...c, meta: { ...c.meta, sender: { ...c.meta?.sender, id: cid, name: novo } } }
        : c)));
      setEditandoNome(false);
      toast({ title: "Nome salvo" });
      await loadConvs(true);
    } catch (e) {
      toast({ title: "Não consegui salvar o nome", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSalvandoNome(false);
    }
  }

  function pararStreamGrav() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  async function iniciarGravacao() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast({ title: "Seu navegador não permite gravar áudio", variant: "destructive" });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = melhorMimeAudio();
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const deveEnviar = enviarAoPararRef.current;
        enviarAoPararRef.current = false;
        const tipo = mr.mimeType || mime || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: tipo });
        const temAlvo = !!(sel || compose);
        pararStreamGrav();
        setGravando(false);
        setSegGrav(0);
        if (!deveEnviar || !temAlvo || blob.size === 0) return;
        setEnviandoAudio(true);
        try {
          const alvo = await garantirConversa();
          if (!alvo) return;
          const b64 = await blobParaBase64(blob);
          await chatwoot.sendAudio(alvo.id, b64, tipo, nome || undefined);
          await loadMsgs(alvo.id, true);
        } catch (e) {
          toast({ title: "Não consegui enviar o áudio", description: (e as Error).message, variant: "destructive" });
        } finally {
          setEnviandoAudio(false);
        }
      };
      mr.start();
      gravadorRef.current = mr;
      setGravando(true);
      setSegGrav(0);
      timerRef.current = window.setInterval(() => setSegGrav((s) => s + 1), 1000);
    } catch {
      toast({ title: "Não consegui acessar o microfone", description: "Permita o uso do microfone no navegador.", variant: "destructive" });
      pararStreamGrav();
    }
  }

  function enviarAudio() {
    if (!gravadorRef.current || gravadorRef.current.state === "inactive") return;
    enviarAoPararRef.current = true;
    gravadorRef.current.stop();
  }

  function cancelarGravacao() {
    enviarAoPararRef.current = false;
    if (gravadorRef.current && gravadorRef.current.state !== "inactive") {
      gravadorRef.current.stop();
    } else {
      pararStreamGrav();
      setGravando(false);
      setSegGrav(0);
    }
  }

  async function resolverOuReabrir() {
    if (!sel) return;
    const novo = sel.status === "resolved" ? "open" : "resolved";
    setBusy(true);
    try {
      await chatwoot.toggleStatus(sel.id, novo);
      toast({ title: novo === "resolved" ? "Conversa resolvida" : "Conversa reaberta" });
      setSelId(null);
      await loadConvs(true);
    } catch (e) {
      toast({ title: "Não consegui atualizar", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  // Abre a conversa com um número (já com código do país). Cria/reaproveita no Chatwoot
  // pela caixa (número) de envio escolhida, injeta na lista e abre na hora.
  // Abre a conversa com um número: se já existe, abre com o histórico; se não, entra no
  // "modo escrever" — NÃO cria nada no Chatwoot (a conversa só nasce ao enviar a 1ª mensagem).
  async function abrirConversa(phoneComPais: string, nomeContato: string) {
    const digits = phoneComPais.replace(/[^0-9]/g, "");
    setIniciando(true);
    try {
      const r = await chatwoot.startConversation("+" + digits, nomeContato || undefined, inboxEnvio ?? undefined, true);
      setBusca(""); setNomeInicial(""); setContatos([]);
      const id = (r as any)?.conversation_id;
      if (id) {
        setCompose(null);
        setSelId(id);
        await loadMsgs(id, true);
        loadConvs(true);
      } else {
        setSelId(null);
        setCompose({ phone: "+" + digits, nome: nomeContato || "", inboxId: inboxEnvio ?? null });
      }
    } catch (e) {
      toast({ title: "Não consegui abrir a conversa", description: (e as Error).message, variant: "destructive" });
    } finally {
      setIniciando(false);
    }
  }

  // Garante uma conversa real p/ enviar: no modo escrever, cria agora (só na 1ª mensagem).
  async function garantirConversa(): Promise<{ id: number; phone?: string } | null> {
    if (sel) return { id: sel.id, phone: sel.meta?.sender?.phone_number ?? undefined };
    if (compose) {
      const r = await chatwoot.startConversation(compose.phone, compose.nome || undefined, compose.inboxId ?? undefined);
      const id = (r as any)?.conversation_id;
      if (!id) throw new Error("Não consegui abrir a conversa.");
      const novo: any = { id, status: "open", inbox_id: (r as any)?.inbox_id, meta: { sender: { id: 0, name: compose.nome || "", phone_number: (r as any)?.phone ?? compose.phone } } };
      setConvs((prev) => [novo, ...prev.filter((c) => c.id !== id)]);
      setCompose(null);
      setSelId(id);
      loadConvs(true);
      return { id, phone: compose.phone };
    }
    return null;
  }

  function fecharConversa() { setSelId(null); setCompose(null); }

  // Botão "Iniciar conversa com o número digitado" — exige o código do país.
  function iniciarConversa() {
    const tel = busca.trim();
    if (tel.replace(/[^0-9]/g, "").length < 12) {
      toast({
        title: "Inclua o código do país",
        description: "Ex.: 55 51 99999-9999 (55 = Brasil). Sem o código do país, o WhatsApp pode entender o número errado.",
        variant: "destructive",
      });
      return;
    }
    abrirConversa(tel, nomeInicial);
  }

  // Clique num contato do CRM (cliente é do Brasil — completa o 55 se faltar).
  function abrirContatoCrm(c: { cliente_nome: string; telefone: string }) {
    let d = (c.telefone || "").replace(/[^0-9]/g, "");
    if (d.length <= 11 && !d.startsWith("55")) d = "55" + d;
    if (d.length < 12) { toast({ title: "Telefone do contato incompleto", variant: "destructive" }); return; }
    abrirConversa("+" + d, c.cliente_nome);
  }

  const abasAssignee: { key: AssigneeTab; label: string; adminOnly?: boolean }[] = [
    { key: "me", label: "Minhas" },
    { key: "unassigned", label: "Não atribuídas", adminOnly: true },
    { key: "all", label: "Todas", adminOnly: true },
  ];

  // Nome exibido de um contato: 1º o nome que o atendente definiu no lápis (sessão),
  // 2º o nome do CRM (negociação), 3º o nome do WhatsApp, 4º o número.
  const nomeExibido = (c: any) => nomesManuais[c?.id] || c?.cliente_nome_crm || c?.meta?.sender?.name || fonePretty(c?.meta?.sender?.phone_number);

  // Modo escrever (compose): conversa nova ainda não criada no Chatwoot.
  const emCompose = !sel && !!compose;
  const alvoConv: any = sel ?? (compose ? { id: 0, status: "open", inbox_id: compose.inboxId ?? undefined, meta: { sender: { id: 0, name: compose.nome, phone_number: compose.phone } } } : null);
  // Caixa de resposta (texto + microfone/gravação) — usada tanto na conversa quanto no modo escrever.
  const caixaResposta = (gravando || enviandoAudio) ? (
    <div className="border-t p-2 flex items-center gap-2">
      {gravando && (
        <Button variant="ghost" size="icon" onClick={cancelarGravacao} title="Cancelar" className="h-[42px] w-[42px] shrink-0 text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      <div className="flex-1 flex items-center gap-2 text-sm text-muted-foreground">
        {enviandoAudio ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Enviando áudio…</>
        ) : (
          <><span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" /> Gravando… {fmtSeg(segGrav)}</>
        )}
      </div>
      {gravando && (
        <Button onClick={enviarAudio} size="icon" title="Enviar áudio" className="h-[42px] w-[42px] shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      )}
    </div>
  ) : (
    <div className="border-t p-2 flex items-end gap-2">
      <Textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }}
        placeholder={`Responder como ${nome || "atendente"}…`}
        className="min-h-[42px] max-h-32 resize-none"
      />
      {reply.trim() ? (
        <Button onClick={enviar} disabled={sending} size="icon" className="h-[42px] w-[42px] shrink-0">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      ) : (
        <Button onClick={iniciarGravacao} variant="outline" size="icon" title="Gravar áudio" className="h-[42px] w-[42px] shrink-0">
          <Mic className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  return (
    <AppLayout>
      <div className="mb-4 flex items-center gap-2">
        <Headset className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">Atendimento</h1>
      </div>

      {erro && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Não consegui falar com o Chatwoot.</p>
            <p className="text-amber-700 dark:text-amber-300/80">{erro}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-3 h-[calc(100vh-11rem)]">
        {/* Coluna 1 — lista de conversas */}
        <div className={cn("flex flex-col rounded-xl border bg-card overflow-hidden", selId && "hidden lg:flex")}>
          {/* Busca de conversas (inclui antigas/resolvidas) */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou número…"
                className="pl-8 pr-8 h-8 text-sm"
              />
              {busca && (
                <button onClick={() => setBusca("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          {!buscaAtiva && (
            <div className="flex gap-1 p-2 border-b">
              <TabBtn active={statusTab === "open"} onClick={() => { setStatusTab("open"); setSelId(null); }}>Abertas</TabBtn>
              <TabBtn active={statusTab === "resolved"} onClick={() => { setStatusTab("resolved"); setSelId(null); }}>Resolvidas</TabBtn>
            </div>
          )}
          {isAdmin && !buscaAtiva && (
            <div className="flex gap-1 px-2 py-1.5 border-b overflow-x-auto">
              {abasAssignee.filter((a) => !a.adminOnly || isAdmin).map((a) => (
                <button
                  key={a.key}
                  onClick={() => setAssigneeTab(a.key)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                    assigneeTab === a.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}
          {isAdmin && !buscaAtiva && atendentes.length > 0 && (
            <div className="flex items-center gap-2 px-2 py-1.5 border-b text-xs">
              <span className="text-muted-foreground shrink-0">Atendente:</span>
              <select
                value={filtroAtendente}
                onChange={(e) => setFiltroAtendente(e.target.value)}
                className="flex-1 h-7 rounded-md border bg-background px-2 text-xs"
              >
                <option value="">Todos</option>
                {atendentes.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {(buscaAtiva ? buscando : loading) ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : (
              <>
                {listaExibida.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8 px-4">
                    {buscaAtiva ? "Nenhuma conversa com esse nome." : `Nenhuma conversa ${statusTab === "open" ? "aberta" : "resolvida"} aqui.`}
                  </p>
                ) : (
                  listaExibida.map((c) => {
                    const s = c.meta?.sender;
                    const last = c.last_non_activity_message?.content ?? c.messages?.[c.messages.length - 1]?.content ?? "";
                    return (
                      <button
                        key={c.id}
                        onClick={() => { setCompose(null); setSelId(c.id); }}
                        className={cn(
                          "w-full text-left flex gap-3 px-3 py-2.5 border-b hover:bg-muted/50 transition-colors",
                          selId === c.id && "bg-muted",
                        )}
                      >
                        <Avatar nome={nomeExibido(c)} foto={s?.thumbnail} className="h-9 w-9 text-xs" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-sm truncate">{nomeExibido(c)}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">{hora(c.timestamp)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{last || "—"}</p>
                        </div>
                        {!!c.unread_count && <span className="self-center h-2 w-2 rounded-full bg-primary shrink-0" />}
                      </button>
                    );
                  })
                )}
                {/* Buscar por nome: primeiro as conversas (acima); aqui embaixo, iniciar nova a partir do CRM. */}
                {buscaAtiva && (contatos.length > 0 || pareceNumero(busca)) && (
                  <div className="border-t">
                    <p className="px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Iniciar nova conversa</p>
                    {inboxesEnvio.length > 1 && (
                      <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                        <span className="shrink-0">Enviar pelo número:</span>
                        <select
                          value={inboxEnvio ?? ""}
                          onChange={(e) => setInboxEnvio(Number(e.target.value))}
                          className="flex-1 h-7 rounded-md border bg-background px-2 text-xs"
                        >
                          {inboxesEnvio.map((i) => <option key={i.inbox_id} value={i.inbox_id}>{i.nome}</option>)}
                        </select>
                      </div>
                    )}
                    {contatos.map((c, i) => (
                      <button
                        key={`ct-${c.deal_id}-${i}`}
                        onClick={() => abrirContatoCrm(c)}
                        disabled={iniciando}
                        className="flex items-center gap-2 px-3 py-2 border-t text-sm hover:bg-primary/5 transition-colors w-full text-left"
                      >
                        <Plus className="h-4 w-4 shrink-0 text-primary" />
                        <span className="min-w-0 flex-1 truncate">
                          Iniciar com <strong>{c.cliente_nome}</strong>
                          <span className="text-muted-foreground"> · {fonePretty(c.telefone)}{c.empreendimento_nome ? ` · ${c.empreendimento_nome}` : ""}</span>
                        </span>
                      </button>
                    ))}
                    {pareceNumero(busca) && (
                      <button
                        onClick={iniciarConversa}
                        disabled={iniciando}
                        className="flex items-center gap-2 px-3 py-2 border-t text-sm text-primary hover:bg-primary/5 transition-colors w-full text-left"
                      >
                        {iniciando ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <Plus className="h-4 w-4 shrink-0" />}
                        <span className="truncate">Iniciar conversa com o número <strong>{busca.trim()}</strong></span>
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Coluna 2 — conversa + resposta */}
        <div className={cn("flex flex-col rounded-xl border bg-card overflow-hidden", (!selId && !compose) && "hidden lg:flex")}>
          {emCompose ? (
            <>
              {/* Modo escrever — nova conversa (ainda não criada) */}
              <div className="flex items-center gap-2 px-3 py-2 border-b">
                <button className="lg:hidden p-1" onClick={fecharConversa}><ArrowLeft className="h-4 w-4" /></button>
                <Avatar nome={compose!.nome} className="h-8 w-8 text-xs" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{compose!.nome || fonePretty(compose!.phone)}</p>
                  <p className="text-[11px] text-muted-foreground truncate">Nova conversa</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={fecharConversa} title="Fechar"><X className="h-4 w-4" /></Button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center text-muted-foreground gap-1 bg-muted/20">
                <Send className="h-8 w-8 opacity-30" />
                <p className="text-sm">Escreva a 1ª mensagem para <strong>{compose!.nome || fonePretty(compose!.phone)}</strong>.</p>
                <p className="text-xs">A conversa só é criada quando você enviar.</p>
              </div>
              {caixaResposta}
            </>
          ) : !sel ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Headset className="h-10 w-10 opacity-30" />
              <p className="text-sm">Escolha uma conversa para começar a atender.</p>
            </div>
          ) : (
            <>
              {/* Cabeçalho da conversa */}
              <div className="flex items-center gap-2 px-3 py-2 border-b">
                <button className="lg:hidden p-1" onClick={fecharConversa}><ArrowLeft className="h-4 w-4" /></button>
                <Avatar nome={nomeExibido(sel)} foto={sel.meta?.sender?.thumbnail} className="h-8 w-8 text-xs" />
                <div className="min-w-0 flex-1">
                  {editandoNome ? (
                    <div className="flex items-center gap-1">
                      <Input
                        autoFocus
                        value={nomeEdit}
                        onChange={(e) => setNomeEdit(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") salvarNomeContato(); if (e.key === "Escape") setEditandoNome(false); }}
                        placeholder="Nome do contato"
                        className="h-7 text-sm"
                      />
                      <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" disabled={salvandoNome} onClick={salvarNomeContato}>
                        {salvandoNome ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => setEditandoNome(false)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-sm truncate">{nomeExibido(sel)}</p>
                      <button
                        type="button"
                        title="Dar/editar o nome deste contato"
                        className="p-0.5 text-muted-foreground hover:text-foreground shrink-0"
                        onClick={() => { setNomeEdit(nomesManuais[sel.id] || sel.cliente_nome_crm || sel.meta?.sender?.name || ""); setEditandoNome(true); }}
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground truncate">
                    {sel.atendente_nome ? `Atendente: ${sel.atendente_nome}` : (sel.meta?.assignee ? `Atendente: ${sel.meta.assignee.name}` : "Sem atendente")}
                  </p>
                </div>

                {/* Transferir */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5" disabled={busy}>
                      <UserPlus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Transferir</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-56 p-1">
                    <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Transferir para…</p>
                    <div className="max-h-64 overflow-y-auto">
                      {agents.length === 0 && <p className="px-2 py-2 text-xs text-muted-foreground">Nenhum atendente cadastrado no Chatwoot ainda.</p>}
                      {agents.map((a) => (
                        <button key={a.id} onClick={() => transferir(a)} className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-sm">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold">{iniciais(a.name)}</div>
                          <span className="truncate">{a.name}</span>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Resolver / Reabrir */}
                <Button variant={sel.status === "resolved" ? "outline" : "default"} size="sm" className="h-8 gap-1.5" onClick={resolverOuReabrir} disabled={busy}>
                  {sel.status === "resolved" ? <RotateCcw className="h-3.5 w-3.5" /> : <CheckCheck className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">{sel.status === "resolved" ? "Reabrir" : "Resolver"}</span>
                </Button>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-muted/20">
                {msgs.filter((m) => m.message_type !== 2).map((m) => {
                  const mine = m.message_type === 1;
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[78%] rounded-2xl px-3 py-1.5 text-sm break-words",
                        mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border rounded-bl-sm",
                      )}>
                        {(m.attachments ?? []).map((a) => <Anexo key={a.id} att={a} mine={mine} />)}
                        {m.content && <div className="whitespace-pre-wrap">{limpaAssinatura(m.content)}</div>}
                        {!m.content && !(m.attachments?.length) && <span className="italic opacity-60">(sem texto)</span>}
                        <div className={cn("text-[10px] mt-0.5 text-right", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>{hora(m.created_at)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              {/* Caixa de resposta */}
              {sel.status !== "resolved" ? caixaResposta : (
                <div className="border-t p-3 text-center text-xs text-muted-foreground">
                  Conversa resolvida. Reabra para responder (ou o cliente reabre ao mandar mensagem).
                </div>
              )}
            </>
          )}
        </div>

        {/* Coluna 3 — painel da negociação (Fase 2) */}
        <div className="flex-col rounded-xl border bg-card overflow-hidden hidden lg:flex">
          {!alvoConv ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm px-4 text-center">
              O painel da negociação aparece aqui ao abrir uma conversa.
            </div>
          ) : (
            <AtendimentoDealPanel phone={alvoConv.meta?.sender?.phone_number} nome={alvoConv.meta?.sender?.name} />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function Anexo({ att, mine }: { att: CwAttachment; mine: boolean }) {
  const url = att.data_url;
  if (!url) return null;
  if (att.file_type === "image") {
    return <img src={url} alt="imagem" loading="lazy" onClick={() => window.open(url, "_blank")} className="rounded-lg max-w-full max-h-64 mb-1 cursor-pointer block" />;
  }
  if (att.file_type === "audio") {
    return <audio controls src={url} className="max-w-full mb-1" />;
  }
  if (att.file_type === "video") {
    return <video controls src={url} className="rounded-lg max-w-full max-h-64 mb-1" />;
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className={cn("flex items-center gap-1.5 underline mb-1", mine ? "text-primary-foreground" : "text-primary")}>
      <Paperclip className="h-3.5 w-3.5 shrink-0" /> {att.extension ? att.extension.toUpperCase() : "Arquivo"}
    </a>
  );
}

function Avatar({ nome, foto, className }: { nome?: string | null; foto?: string | null; className?: string }) {
  const [erro, setErro] = useState(false);
  const base = "shrink-0 rounded-full flex items-center justify-center font-semibold overflow-hidden";
  if (foto && !erro) {
    return <img src={foto} alt="" onError={() => setErro(true)} className={cn(base, "object-cover bg-muted", className)} />;
  }
  return <div className={cn(base, "bg-primary/10 text-primary", className)}>{iniciais(nome ?? undefined)}</div>;
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
