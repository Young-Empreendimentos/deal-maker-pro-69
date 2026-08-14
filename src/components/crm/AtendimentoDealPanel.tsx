import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, crmDb } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { DealFormDialog } from "./DealFormDialog";
import {
  Phone, MessageSquarePlus, Link2, ExternalLink, Loader2, Search, Handshake, ArrowRight,
} from "lucide-react";

type DealMatch = {
  deal_id: string;
  cliente_nome: string;
  status: string;
  empreendimento_nome: string | null;
  telefone: string;
};

const STATUS_LABEL: Record<string, string> = {
  lead_recebido: "Lead Recebido",
  contato_feito: "Contato Feito",
  visita_agendada: "Visita Agendada",
  visita_realizada: "Visita Realizada",
  ficha_assinada: "Ficha Assinada",
  proposta_recebida: "Proposta Recebida",
  vendido: "Vendido",
  perdido: "Perdido",
};

function iniciais(nome?: string | null) {
  const p = (nome || "?").trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() || "?";
}

/** Coluna direita do Atendimento: casa o telefone da conversa com negociações do CRM. */
export function AtendimentoDealPanel({ phone, nome }: { phone?: string | null; nome?: string | null }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deals, setDeals] = useState<DealMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [vincOpen, setVincOpen] = useState(false);
  const [vincQ, setVincQ] = useState("");
  const [vincRes, setVincRes] = useState<{ id: string; cliente_nome: string; status: string }[]>([]);
  const [vincLoading, setVincLoading] = useState(false);

  const buscar = useCallback(async () => {
    if (!phone) { setDeals([]); return; }
    setLoading(true);
    const { data } = await (supabase as any).rpc("crm_deal_por_telefone", { p_tel: phone });
    setDeals((data as DealMatch[]) ?? []);
    setLoading(false);
  }, [phone]);

  useEffect(() => { buscar(); setVincOpen(false); setVincQ(""); }, [buscar]);

  // Busca de negociações para "vincular a existente".
  useEffect(() => {
    if (!vincOpen) return;
    const t = setTimeout(async () => {
      if (vincQ.trim().length < 2) { setVincRes([]); return; }
      setVincLoading(true);
      const { data } = await crmDb
        .from("crm_deals").select("id, cliente_nome, status")
        .ilike("cliente_nome", `%${vincQ}%`).limit(10);
      setVincRes((data as any) ?? []);
      setVincLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [vincQ, vincOpen]);

  async function vincular(dealId: string) {
    if (!phone) return;
    const { error } = await crmDb.from("crm_deal_phones").insert({ deal_id: dealId, telefone: phone } as any);
    if (error) { toast({ title: "Não consegui vincular", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Conversa vinculada à negociação ✅" });
    setVincOpen(false); setVincQ(""); setVincRes([]);
    buscar();
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Contato */}
      <div className="flex flex-col items-center text-center gap-2 pb-3 border-b">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-semibold">
          {iniciais(nome)}
        </div>
        <div>
          <p className="font-semibold">{nome || "Contato sem nome"}</p>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Phone className="h-3 w-3" /> {phone || "sem telefone"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : deals.length > 0 ? (
        /* Negociação(ões) casada(s) pelo telefone */
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Handshake className="h-3.5 w-3.5" /> {deals.length > 1 ? "Negociações" : "Negociação"}
          </p>
          {deals.map((d) => (
            <button
              key={d.deal_id}
              onClick={() => navigate(`/negociacoes/${d.deal_id}`)}
              className="w-full text-left rounded-lg border p-3 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm truncate">{d.cliente_nome?.trim() || "Sem nome"}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover:text-primary" />
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                  d.status === "vendido" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" :
                  d.status === "perdido" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" :
                  "bg-muted text-muted-foreground",
                )}>
                  {STATUS_LABEL[d.status] ?? d.status}
                </span>
                {d.empreendimento_nome && <span className="text-[11px] text-muted-foreground truncate">{d.empreendimento_nome}</span>}
              </div>
            </button>
          ))}
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={() => setVincOpen((v) => !v)}>
            <Link2 className="h-3.5 w-3.5 mr-1" /> Vincular a outra negociação
          </Button>
        </div>
      ) : (
        /* Sem negociação: criar ou vincular */
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Este número ainda não está em nenhuma negociação.</p>
          <Button className="w-full gap-2" onClick={() => setShowCreate(true)}>
            <MessageSquarePlus className="h-4 w-4" /> Criar negociação
          </Button>
          <Button variant="outline" className="w-full gap-2" onClick={() => setVincOpen((v) => !v)}>
            <Link2 className="h-4 w-4" /> Vincular a existente
          </Button>
        </div>
      )}

      {/* Buscador de "vincular a existente" */}
      {vincOpen && (
        <div className="rounded-lg border p-2 space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              autoFocus
              value={vincQ}
              onChange={(e) => setVincQ(e.target.value)}
              placeholder="Buscar negociação por nome…"
              className="pl-8 h-8 text-sm"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {vincLoading ? (
              <p className="text-xs text-muted-foreground py-2 text-center">Buscando…</p>
            ) : vincQ.trim().length < 2 ? (
              <p className="text-xs text-muted-foreground py-2 text-center">Digite ao menos 2 letras.</p>
            ) : vincRes.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2 text-center">Nada encontrado.</p>
            ) : (
              vincRes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => vincular(r.id)}
                  className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-sm"
                >
                  <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="flex-1 truncate">{r.cliente_nome?.trim() || "Sem nome"}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{STATUS_LABEL[r.status] ?? r.status}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <DealFormDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={() => {}}
        initial={{ nome: nome ?? undefined, telefone: phone ?? undefined }}
        onCreated={() => buscar()}
      />
    </div>
  );
}
