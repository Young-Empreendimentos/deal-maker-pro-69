import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppLayout } from "@/components/crm/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { chatwoot, type CwAgent, type CwConversation, type CwMessage } from "@/integrations/chatwoot";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Headset, Send, CheckCheck, UserPlus, RotateCcw, Loader2,
  ArrowLeft, AlertTriangle, FlaskConical, Search, X,
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

export default function Atendimento() {
  const { user, nome, isAdmin } = useAuth();
  const { toast } = useToast();

  const [statusTab, setStatusTab] = useState<StatusTab>("open");
  // Piloto (número central): todos veem as conversas do número. A separação por pessoa
  // ("Minhas") entra quando cada consultor tiver o próprio número conectado.
  const [assigneeTab, setAssigneeTab] = useState<AssigneeTab>("all");
  const [convs, setConvs] = useState<CwConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [selId, setSelId] = useState<number | null>(null);
  const [msgs, setMsgs] = useState<CwMessage[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [agents, setAgents] = useState<CwAgent[]>([]);
  const [busy, setBusy] = useState(false);
  const [criandoTeste, setCriandoTeste] = useState(false);
  const [busca, setBusca] = useState("");
  const [resultadosBusca, setResultadosBusca] = useState<CwConversation[]>([]);
  const [buscando, setBuscando] = useState(false);
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
  useEffect(() => { if (selId) loadMsgs(selId); else setMsgs([]); }, [selId, loadMsgs]);

  // Atualização automática (sem realtime): repuxa a lista e a conversa aberta.
  useEffect(() => {
    const t = setInterval(() => {
      loadConvs(true);
      if (selId) loadMsgs(selId, true);
    }, POLL_MS);
    return () => clearInterval(t);
  }, [loadConvs, loadMsgs, selId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  // Busca conversas antigas/resolvidas (server-side no Chatwoot), com debounce.
  useEffect(() => {
    const q = busca.trim();
    if (q.length < 2) { setResultadosBusca([]); setBuscando(false); return; }
    setBuscando(true);
    const t = setTimeout(async () => {
      try {
        const r = await chatwoot.searchConversations(q);
        setResultadosBusca(r.data?.payload ?? []);
      } catch {
        setResultadosBusca([]);
      } finally {
        setBuscando(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [busca]);

  const filtered = useMemo(() => {
    const me = user?.email?.toLowerCase();
    return convs.filter((c) => {
      if (assigneeTab === "me") return c.meta?.assignee?.email?.toLowerCase() === me;
      if (assigneeTab === "unassigned") return !c.meta?.assignee;
      return true;
    });
  }, [convs, assigneeTab, user]);

  const buscaAtiva = busca.trim().length >= 2;
  const listaExibida = buscaAtiva ? resultadosBusca : filtered;

  const sel = useMemo(
    () => convs.find((c) => c.id === selId) ?? resultadosBusca.find((c) => c.id === selId) ?? null,
    [convs, resultadosBusca, selId],
  );

  async function enviar() {
    if (!sel || !reply.trim()) return;
    setSending(true);
    try {
      await chatwoot.sendMessage(sel.id, reply.trim(), nome || undefined);
      setReply("");
      await loadMsgs(sel.id, true);
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

  async function criarTeste() {
    setCriandoTeste(true);
    try {
      const r = await chatwoot.createTestConversation();
      const novoId = (r as { conversation_id?: number })?.conversation_id;
      setStatusTab("open");
      setAssigneeTab("all");
      // A conversa recém-criada leva 1-2s para entrar na listagem do Chatwoot;
      // tenta algumas vezes e já abre a conversa quando ela aparecer.
      let achou = false;
      for (let i = 0; i < 5; i++) {
        await new Promise((res) => setTimeout(res, 1200));
        const rr = await chatwoot.listConversations("open", "all");
        const lista = rr.data?.payload ?? [];
        setConvs(lista);
        if (novoId && lista.some((c) => c.id === novoId)) { setSelId(novoId); achou = true; break; }
        if (!novoId && lista.length) { achou = true; break; }
      }
      toast({
        title: achou ? "Conversa de teste criada ✅" : "Conversa criada, atualizando…",
        description: achou ? "Abri ela pra você — responda aí embaixo." : "Se não aparecer, me avise.",
      });
    } catch (e) {
      toast({ title: "Não consegui criar a conversa de teste", description: (e as Error).message, variant: "destructive" });
    } finally {
      setCriandoTeste(false);
    }
  }

  const abasAssignee: { key: AssigneeTab; label: string; adminOnly?: boolean }[] = [
    { key: "me", label: "Minhas" },
    { key: "unassigned", label: "Não atribuídas", adminOnly: true },
    { key: "all", label: "Todas", adminOnly: true },
  ];

  return (
    <AppLayout>
      <div className="mb-4 flex items-center gap-2">
        <Headset className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">Atendimento</h1>
        <Badge variant="secondary" className="ml-1">beta</Badge>
        {isAdmin && (
          <Button variant="outline" size="sm" className="ml-auto gap-1.5" onClick={criarTeste} disabled={criandoTeste}>
            {criandoTeste ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FlaskConical className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Criar conversa de teste</span>
            <span className="sm:hidden">Teste</span>
          </Button>
        )}
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

          <div className="flex-1 overflow-y-auto">
            {(buscaAtiva ? buscando : loading) ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : listaExibida.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-10 px-4">
                {buscaAtiva ? "Nenhuma conversa encontrada." : `Nenhuma conversa ${statusTab === "open" ? "aberta" : "resolvida"} aqui.`}
              </p>
            ) : (
              listaExibida.map((c) => {
                const s = c.meta?.sender;
                const last = c.last_non_activity_message?.content ?? c.messages?.[c.messages.length - 1]?.content ?? "";
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelId(c.id)}
                    className={cn(
                      "w-full text-left flex gap-3 px-3 py-2.5 border-b hover:bg-muted/50 transition-colors",
                      selId === c.id && "bg-muted",
                    )}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {iniciais(s?.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm truncate">{s?.name || fonePretty(s?.phone_number)}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{hora(c.timestamp)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{last || "—"}</p>
                    </div>
                    {!!c.unread_count && <span className="self-center h-2 w-2 rounded-full bg-primary shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna 2 — conversa + resposta */}
        <div className={cn("flex flex-col rounded-xl border bg-card overflow-hidden", !selId && "hidden lg:flex")}>
          {!sel ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Headset className="h-10 w-10 opacity-30" />
              <p className="text-sm">Escolha uma conversa para começar a atender.</p>
            </div>
          ) : (
            <>
              {/* Cabeçalho da conversa */}
              <div className="flex items-center gap-2 px-3 py-2 border-b">
                <button className="lg:hidden p-1" onClick={() => setSelId(null)}><ArrowLeft className="h-4 w-4" /></button>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {iniciais(sel.meta?.sender?.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{sel.meta?.sender?.name || fonePretty(sel.meta?.sender?.phone_number)}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {sel.meta?.assignee ? `Atendendo: ${sel.meta.assignee.name}` : "Sem atendente"}
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
                        "max-w-[78%] rounded-2xl px-3 py-1.5 text-sm whitespace-pre-wrap break-words",
                        mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border rounded-bl-sm",
                      )}>
                        {m.content || <span className="italic opacity-60">(sem texto)</span>}
                        <div className={cn("text-[10px] mt-0.5 text-right", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>{hora(m.created_at)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              {/* Caixa de resposta */}
              {sel.status !== "resolved" ? (
                <div className="border-t p-2 flex items-end gap-2">
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }}
                    placeholder={`Responder como ${nome || "atendente"}…`}
                    className="min-h-[42px] max-h-32 resize-none"
                  />
                  <Button onClick={enviar} disabled={sending || !reply.trim()} size="icon" className="h-[42px] w-[42px] shrink-0">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              ) : (
                <div className="border-t p-3 text-center text-xs text-muted-foreground">
                  Conversa resolvida. Reabra para responder (ou o cliente reabre ao mandar mensagem).
                </div>
              )}
            </>
          )}
        </div>

        {/* Coluna 3 — painel da negociação (Fase 2) */}
        <div className={cn("flex-col rounded-xl border bg-card overflow-hidden", sel ? "hidden lg:flex" : "hidden lg:flex")}>
          {!sel ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm px-4 text-center">
              O painel da negociação aparece aqui ao abrir uma conversa.
            </div>
          ) : (
            <AtendimentoDealPanel phone={sel.meta?.sender?.phone_number} nome={sel.meta?.sender?.name} />
          )}
        </div>
      </div>
    </AppLayout>
  );
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
