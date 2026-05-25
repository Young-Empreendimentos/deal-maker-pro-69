import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, User, Phone, Mail, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Result = {
  id: string;
  cliente_nome: string;
  cliente_email: string | null;
  status: string;
  responsavel_id: string | null;
  matchedPhone?: string;
};

const STATUS_LABEL: Record<string, string> = {
  lead_recebido:    "Lead Recebido",
  contato_feito:    "Contato Feito",
  visita_agendada:  "Visita Agendada",
  visita_realizada: "Visita Realizada",
  ficha_assinada:   "Ficha Assinada",
  proposta_recebida:"Proposta Recebida",
  vendido:          "Vendido",
  perdido:          "Perdido",
};

export function GlobalSearch() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRef    = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setOpen(false); return; }

    setLoading(true);

    // Busca por nome e e-mail
    let dealsQuery = supabase
      .from("crm_deals")
      .select("id, cliente_nome, cliente_email, status, responsavel_id")
      .or(`cliente_nome.ilike.%${q}%,cliente_email.ilike.%${q}%`)
      .limit(20);

    if (!isAdmin && user) dealsQuery = dealsQuery.eq("responsavel_id", user.id);

    const { data: byName } = await dealsQuery;

    // Busca por telefone
    const { data: phones } = await supabase
      .from("crm_deal_phones")
      .select("deal_id, telefone")
      .ilike("telefone", `%${q}%`)
      .limit(20);

    // Busca os deals dos telefones encontrados
    let byPhone: Result[] = [];
    if (phones && phones.length > 0) {
      const dealIds = [...new Set(phones.map((p) => p.deal_id))];
      let phoneDealsQuery = supabase
        .from("crm_deals")
        .select("id, cliente_nome, cliente_email, status, responsavel_id")
        .in("id", dealIds);

      if (!isAdmin && user) phoneDealsQuery = phoneDealsQuery.eq("responsavel_id", user.id);

      const { data: phoneDeals } = await phoneDealsQuery;
      byPhone = (phoneDeals ?? []).map((d) => ({
        ...d,
        matchedPhone: phones.find((p) => p.deal_id === d.id)?.telefone,
      }));
    }

    // Merge sem duplicatas
    const merged = new Map<string, Result>();
    for (const d of [...(byName ?? []), ...byPhone]) {
      if (!merged.has(d.id)) merged.set(d.id, d as Result);
    }

    setResults([...merged.values()].slice(0, 15));
    setOpen(true);
    setLoading(false);
  }, [isAdmin, user]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  const handleSelect = (id: string) => {
    navigate(`/negociacoes/${id}`);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder="Buscar lead por nome, e-mail ou telefone…"
          className="pl-9 pr-8 h-9 text-sm bg-background"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">Buscando…</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">Nenhum lead encontrado</div>
          ) : (
            <ScrollArea className="max-h-80">
              <div className="py-1">
                <p className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {results.length} resultado{results.length !== 1 ? "s" : ""}
                </p>
                {results.map((r) => (
                  <button
                    key={r.id}
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(r.id); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent text-left transition-colors"
                  >
                    <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 flex-shrink-0">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.cliente_nome}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {r.matchedPhone ? (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />{r.matchedPhone}
                          </span>
                        ) : r.cliente_email ? (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />{r.cliente_email}
                          </span>
                        ) : null}
                        <span className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                          r.status === "vendido" ? "bg-green-100 text-green-700" :
                          r.status === "perdido" ? "bg-red-100 text-red-700" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {STATUS_LABEL[r.status] ?? r.status}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
}
