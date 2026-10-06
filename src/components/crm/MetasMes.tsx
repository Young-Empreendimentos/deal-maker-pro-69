import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Item = { id: string; nome: string };
type Prog = { escopo: string; ref_id: string; nome: string; meta_minima: number; meta_super: number; realizado: number };
type MetaPar = { min: number; sup: number };

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// Consultores que NÃO entram nas metas (desligado / gestão comercial).
const CONSULTORES_SEM_META = new Set([
  "7c3c08e2-ceca-4e1b-9c04-a5bb7b7d18d4", // M. Linhares (Murilo) — desligado
  "61aaeca9-f853-47af-836d-56e2f8ae6542", // C. Bortoluzzi (caroline@) — gestão comercial
  "fb37f75d-124d-43d0-bf79-c49c6e01720f", // E. Tebaldi (eduardo@)
  "1f0a16df-0777-4907-91c9-2592c94a39b2", // C. Tebaldi (tebaldi@)
  "53d3b898-bbb1-445d-8cff-9b1452167542", // M. Vargas (matheus@)
  "57ce770f-ed66-4ccf-9bd1-e42fb9a382f7", // Elen (elen@) — admin, não é meta
]);

// Empreendimentos que NÃO entram nas metas.
const EMPREENDIMENTOS_SEM_META = new Set([
  "c15d6b4c-c7db-4d95-a63e-eb98ccaab637", // Parque Lorena Itaqui
  "0b7e7271-b929-4244-800d-a22ee2b82bbb", // Young
  "23fea984-3848-4479-b90a-300494c50090", // Parque Lorena I
  "b53a3316-11f9-4359-bc4d-bbbdfbe71ccd", // Parque da Guarda Residence
  "ef8a2d9e-6df8-4bec-abc7-3d7e651b82ec", // Jardim do Parque
]);

/**
 * Quadro de metas mensais (nº de vendas) por empreendimento e por consultor.
 * - DOIS níveis: Meta mínima e Super meta (a Direção edita; RPC crm_meta_set).
 * - Progresso (realizado) vem da RPC crm_metas_progresso (1ª venda válida / data do contrato).
 * - Quando um consultor bate a mínima ou a super, um parabéns é postado no grupo (gatilho na venda).
 */
export function MetasMes({ isAdmin, emps, users }: { isAdmin: boolean; emps: Item[]; users: Item[] }) {
  const { toast } = useToast();
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth()); // 0-11
  const [realizadoMap, setRealizadoMap] = useState<Record<string, number>>({});
  const [metaMap, setMetaMap] = useState<Record<string, MetaPar>>({}); // metas salvas no banco
  const [draft, setDraft] = useState<Record<string, { min: string; sup: string }>>({}); // em edição
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
      const mMap: Record<string, MetaPar> = {};
      for (const p of prog) {
        rMap[p.ref_id] = p.realizado;
        if ((p.meta_minima ?? 0) > 0 || (p.meta_super ?? 0) > 0) mMap[p.ref_id] = { min: p.meta_minima ?? 0, sup: p.meta_super ?? 0 };
      }
      setRealizadoMap(rMap);
      setMetaMap(mMap);
      setDraft(Object.fromEntries(Object.entries(mMap).map(([k, v]) => [k, { min: v.min ? String(v.min) : "", sup: v.sup ? String(v.sup) : "" }])));
    })();
    return () => { vivo = false; };
  }, [mesISO]);

  const lista = aba === "empreendimento"
    ? emps.filter((e) => !EMPREENDIMENTOS_SEM_META.has(e.id))
    : users.filter((u) => !CONSULTORES_SEM_META.has(u.id));

  function prevMes() { if (mes === 0) { setMes(11); setAno((a) => a - 1); } else setMes((m) => m - 1); }
  function nextMes() { if (mes === 11) { setMes(0); setAno((a) => a + 1); } else setMes((m) => m + 1); }

  const origMin = (id: string) => (metaMap[id]?.min ? String(metaMap[id].min) : "");
  const origSup = (id: string) => (metaMap[id]?.sup ? String(metaMap[id].sup) : "");
  const mudou = (it: Item) => (draft[it.id]?.min ?? "") !== origMin(it.id) || (draft[it.id]?.sup ?? "") !== origSup(it.id);
  const temMudanca = lista.some(mudou);
  const setCampo = (id: string, campo: "min" | "sup", val: string) =>
    setDraft((d) => ({ ...d, [id]: { min: d[id]?.min ?? "", sup: d[id]?.sup ?? "", [campo]: val } }));

  async function salvar() {
    setSaving(true);
    try {
      const alterados = lista.filter(mudou);
      for (const it of alterados) {
        const vmin = parseInt(draft[it.id]?.min || "0", 10) || 0;
        const vsup = parseInt(draft[it.id]?.sup || "0", 10) || 0;
        const { error } = await (supabase as any).rpc("crm_meta_set", {
          p_mes: mesISO, p_escopo: aba, p_ref: it.id, p_meta_minima: vmin, p_meta_super: vsup,
        });
        if (error) throw error;
      }
      setMetaMap((prev) => {
        const next = { ...prev };
        for (const it of alterados) {
          const vmin = parseInt(draft[it.id]?.min || "0", 10) || 0;
          const vsup = parseInt(draft[it.id]?.sup || "0", 10) || 0;
          if (vmin > 0 || vsup > 0) next[it.id] = { min: vmin, sup: vsup }; else delete next[it.id];
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
          <span className="w-12 text-center">Vendas</span>
          <span className="w-16 text-center">Mínima</span>
          <span className="w-16 text-center">Super</span>
          <span className="w-24 text-center hidden sm:block">Progresso</span>
        </div>

        <div className="divide-y">
          {lista.map((it) => {
            const realizado = realizadoMap[it.id] ?? 0;
            const vmin = parseInt(draft[it.id]?.min || "0", 10) || 0;
            const vsup = parseInt(draft[it.id]?.sup || "0", 10) || 0;
            const bateuMin = vmin > 0 && realizado >= vmin;
            const bateuSup = vsup > 0 && realizado >= vsup;
            const pct = vsup > 0 ? Math.min(100, Math.round((100 * realizado) / vsup)) : 0;
            return (
              <div key={it.id} className="flex items-center gap-2 py-1.5">
                <span className="flex-1 text-sm truncate" title={it.nome}>{it.nome}</span>
                <span className="w-12 text-center text-sm tabular-nums font-semibold">{realizado}</span>
                {/* Mínima */}
                <div className="w-16 flex justify-center">
                  {isAdmin ? (
                    <Input type="number" min={0} inputMode="numeric" className="h-8 w-16 text-center tabular-nums px-1"
                      value={draft[it.id]?.min ?? ""} placeholder="—"
                      onChange={(e) => setCampo(it.id, "min", e.target.value)} />
                  ) : (
                    <span className={cn("text-sm tabular-nums", bateuMin ? "text-green-600 dark:text-green-400 font-semibold" : "text-muted-foreground")}>{vmin > 0 ? vmin : "—"}</span>
                  )}
                </div>
                {/* Super */}
                <div className="w-16 flex justify-center">
                  {isAdmin ? (
                    <Input type="number" min={0} inputMode="numeric" className="h-8 w-16 text-center tabular-nums px-1"
                      value={draft[it.id]?.sup ?? ""} placeholder="—"
                      onChange={(e) => setCampo(it.id, "sup", e.target.value)} />
                  ) : (
                    <span className={cn("text-sm tabular-nums", bateuSup ? "text-green-600 dark:text-green-400 font-semibold" : "text-muted-foreground")}>{vsup > 0 ? vsup : "—"}</span>
                  )}
                </div>
                {/* Progresso (até a super) + marca da mínima */}
                <div className="w-24 items-center gap-1.5 hidden sm:flex">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden" title={bateuMin ? "Mínima batida" : "Mínima ainda não batida"}>
                    <div className={cn("h-full rounded-full transition-all", bateuSup ? "bg-green-500" : bateuMin ? "bg-emerald-400" : "bg-primary")} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={cn("w-10 text-right text-xs tabular-nums shrink-0", bateuSup ? "text-green-600 dark:text-green-400 font-semibold" : "text-muted-foreground")}>
                    {vsup > 0 ? `${pct}%` : bateuMin ? "✅" : "—"}
                  </span>
                </div>
              </div>
            );
          })}
          {lista.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Nada para exibir neste mês.</p>}
        </div>

        {isAdmin && (
          <div className="flex items-center justify-between mt-3 gap-2">
            <p className="text-[11px] text-muted-foreground">Ao bater a mínima ou a super, um parabéns é postado no grupo de vendas.</p>
            <Button size="sm" onClick={salvar} disabled={!temMudanca || saving}>{saving ? "Salvando…" : "Salvar metas"}</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
