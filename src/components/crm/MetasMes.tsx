import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Item = { id: string; nome: string };
type Prog = { escopo: string; ref_id: string; nome: string; meta_vendas: number; realizado: number };

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

/**
 * Quadro de metas mensais (nº de vendas) por empreendimento e por consultor.
 * - Progresso (meta × realizado) vem da RPC crm_metas_progresso (1ª venda válida).
 * - Admin edita a meta de cada linha (RPC crm_meta_set, upsert).
 * O mesmo número aparece no relatório diário das 8h no grupo de vendas.
 */
export function MetasMes({ isAdmin, emps, users }: { isAdmin: boolean; emps: Item[]; users: Item[] }) {
  const { toast } = useToast();
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth()); // 0-11
  const [realizadoMap, setRealizadoMap] = useState<Record<string, number>>({});
  const [metaMap, setMetaMap] = useState<Record<string, number>>({}); // metas salvas no banco
  const [draft, setDraft] = useState<Record<string, string>>({}); // valores em edição
  const [saving, setSaving] = useState(false);
  const [aba, setAba] = useState<"empreendimento" | "consultor">("empreendimento");

  const mesISO = useMemo(() => `${ano}-${String(mes + 1).padStart(2, "0")}-01`, [ano, mes]);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const { data } = await (supabase as any).rpc("crm_metas_progresso", { p_mes: mesISO });
      if (!vivo) return;
      const prog = (data as Prog[]) ?? [];
      const rMap: Record<string, number> = {};
      const mMap: Record<string, number> = {};
      for (const p of prog) {
        rMap[p.ref_id] = p.realizado;
        if (p.meta_vendas > 0) mMap[p.ref_id] = p.meta_vendas;
      }
      setRealizadoMap(rMap);
      setMetaMap(mMap);
      setDraft(Object.fromEntries(Object.entries(mMap).map(([k, v]) => [k, String(v)])));
    })();
    return () => { vivo = false; };
  }, [mesISO]);

  const lista = aba === "empreendimento" ? emps : users;

  function prevMes() { if (mes === 0) { setMes(11); setAno((a) => a - 1); } else setMes((m) => m - 1); }
  function nextMes() { if (mes === 11) { setMes(0); setAno((a) => a + 1); } else setMes((m) => m + 1); }

  const metaOrig = (id: string) => (metaMap[id] != null ? String(metaMap[id]) : "");
  const temMudanca = lista.some((it) => (draft[it.id] ?? "") !== metaOrig(it.id));

  async function salvar() {
    setSaving(true);
    try {
      const alterados = lista.filter((it) => (draft[it.id] ?? "") !== metaOrig(it.id));
      for (const it of alterados) {
        const val = parseInt(draft[it.id] || "0", 10) || 0;
        const { error } = await (supabase as any).rpc("crm_meta_set", {
          p_mes: mesISO, p_escopo: aba, p_ref: it.id, p_meta: val,
        });
        if (error) throw error;
      }
      // atualiza a base local de comparação
      setMetaMap((prev) => {
        const next = { ...prev };
        for (const it of alterados) {
          const val = parseInt(draft[it.id] || "0", 10) || 0;
          if (val > 0) next[it.id] = val; else delete next[it.id];
        }
        return next;
      });
      toast({ title: "Metas salvas", description: `${alterados.length} meta(s) de ${aba === "empreendimento" ? "empreendimento" : "consultor"} atualizada(s).` });
    } catch (e) {
      toast({ title: "Erro ao salvar metas", description: (e as { message?: string })?.message ?? String(e), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border bg-card">
      <CardHeader className="pb-2 flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Target className="h-4 w-4" /> Metas do mês <span className="font-normal text-muted-foreground">· nº de vendas</span>
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMes} aria-label="Mês anterior"><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium tabular-nums min-w-[104px] text-center">{MESES[mes]}/{ano}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMes} aria-label="Próximo mês"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1 mb-2">
          <Button variant={aba === "empreendimento" ? "default" : "outline"} size="sm" className="h-7" onClick={() => setAba("empreendimento")}>Empreendimentos</Button>
          <Button variant={aba === "consultor" ? "default" : "outline"} size="sm" className="h-7" onClick={() => setAba("consultor")}>Consultores</Button>
        </div>

        {/* Cabeçalho das colunas */}
        <div className="flex items-center gap-2 pb-1.5 border-b text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          <span className="flex-1">{aba === "empreendimento" ? "Empreendimento" : "Consultor"}</span>
          <span className="w-14 text-center">Vendas</span>
          <span className="w-16 text-center">Meta</span>
          <span className="w-24 text-center hidden sm:block">Progresso</span>
        </div>

        <div className="divide-y">
          {lista.map((it) => {
            const realizado = realizadoMap[it.id] ?? 0;
            const meta = parseInt(draft[it.id] || "0", 10) || 0;
            const pct = meta > 0 ? Math.min(100, Math.round((100 * realizado) / meta)) : 0;
            const bateu = meta > 0 && realizado >= meta;
            return (
              <div key={it.id} className="flex items-center gap-2 py-1.5">
                <span className="flex-1 text-sm truncate" title={it.nome}>{it.nome}</span>
                {/* Vendas realizadas (automático) */}
                <span className="w-14 text-center text-sm tabular-nums font-semibold">{realizado}</span>
                {/* Meta (manual) */}
                <div className="w-16 flex justify-center">
                  {isAdmin ? (
                    <Input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      className="h-8 w-16 text-center tabular-nums px-1"
                      value={draft[it.id] ?? ""}
                      placeholder="—"
                      onChange={(e) => setDraft((d) => ({ ...d, [it.id]: e.target.value }))}
                    />
                  ) : (
                    <span className="text-sm tabular-nums text-muted-foreground">{meta > 0 ? meta : "—"}</span>
                  )}
                </div>
                {/* Progresso */}
                <div className="w-24 items-center gap-1.5 hidden sm:flex">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", bateu ? "bg-green-500" : "bg-primary")} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={cn("w-11 text-right text-xs tabular-nums shrink-0", bateu ? "text-green-600 dark:text-green-400 font-semibold" : "text-muted-foreground")}>
                    {meta > 0 ? `${pct}%` : "—"}
                  </span>
                </div>
              </div>
            );
          })}
          {lista.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Nada para exibir neste mês.</p>}
        </div>

        {isAdmin && (
          <div className="flex justify-end mt-3">
            <Button size="sm" onClick={salvar} disabled={!temMudanca || saving}>{saving ? "Salvando…" : "Salvar metas"}</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
