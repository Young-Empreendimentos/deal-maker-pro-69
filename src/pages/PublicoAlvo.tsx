import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/crm/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DateRangeFilter, type DateRange } from "@/components/crm/DateRangeFilter";
import { MultiSelectFilter } from "@/components/crm/MultiSelectFilter";
import { Users2 } from "lucide-react";

type HistRow = Record<string, any>;

// Corte: deals só a partir de 30/05/2026 (histórico cobre o passado)
const CORTE_DEALS = "2026-05-30T00:00:00-03:00";

type DealRow = {
  created_at: string;
  cliente_nome: string | null;
  cliente_email: string | null;
  status: string | null;
  empreendimento_id: string | null;
  interesse: string | null;
  auto_interesse: string | null;
  fonte_id: string | null;
  fonte_original: string | null;
  escolaridade: string | null;
  estado_civil: string | null;
  sexo: string | null;
  filhos: string | null;
  tipo_residencia: string | null;
  renda_familiar: string | null;
  auto_renda_familiar: string | null;
  interesses_pessoais: string[] | null;
  cidade_cliente: string | null;
};

type Empreendimento = { id: string; nome: string };

/** Parse "DD/MM/YYYY HH:MM:SS" ou ISO */
function parseAny(value: string | null | undefined): Date | null {
  if (!value) return null;
  const s = String(value).trim();
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (m) {
    const [, d, mo, y, h = "0", mi = "0", se = "0"] = m;
    return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(se));
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function norm(v: any): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s || /^(n\/?a|nao informado|não informado|null|undefined|-)$/i.test(s)) return null;
  return s;
}

/** Chaves de deduplicação */
function keyEmail(v: any): string | null {
  const s = norm(v);
  if (!s) return null;
  const e = s.toLowerCase();
  return /.+@.+\..+/.test(e) ? e : null;
}
function keyPhone(v: any): string | null {
  const s = norm(v);
  if (!s) return null;
  const digits = s.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return digits.slice(-11); // últimos 11 dígitos (DDD + número)
}
function keyNome(v: any): string | null {
  const s = norm(v);
  if (!s) return null;
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Quebra string CSV/array em itens limpos */
function splitMulti(v: any): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  return String(v)
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

type Bucket = { label: string; count: number };

function bucketize(values: (string | null)[]): Bucket[] {
  const map = new Map<string, number>();
  for (const v of values) {
    const k = norm(v);
    if (!k) continue;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function bucketizeMulti(values: string[][]): Bucket[] {
  const flat: (string | null)[] = [];
  for (const arr of values) for (const v of arr) flat.push(v);
  return bucketize(flat);
}

async function fetchAll<T = any>(
  table: string,
  select: string,
  filter?: (q: any) => any
): Promise<T[]> {
  // Primeira página pede a contagem total — não dá pra confiar no tamanho
  // de página pedido, pois o PostgREST pode ter um max-rows menor.
  const build = () => {
    let q: any = supabase.from(table as any).select(select, { count: "exact" });
    if (filter) q = filter(q);
    return q;
  };
  const first = await build().range(0, 999);
  if (first.error) throw first.error;
  const out: T[] = ((first.data ?? []) as T[]).slice();
  const total = first.count ?? out.length;
  const pageSize = Math.max(out.length, 1);
  let from = out.length;
  let safety = 0;
  while (from < total && safety < 1000) {
    const { data, error } = await build().range(from, from + pageSize - 1);
    if (error) throw error;
    const rows = (data ?? []) as T[];
    if (rows.length === 0) break;
    out.push(...rows);
    from += rows.length;
    safety++;
  }
  return out;
}

export default function PublicoAlvo() {
  const [loading, setLoading] = useState(true);
  const [hist, setHist] = useState<HistRow[]>([]);
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);

  // Filtros
  const [periodo, setPeriodo] = useState<DateRange>({ from: "", to: "" });
  const [empSel, setEmpSel] = useState<string[]>([]);
  const [statusSel, setStatusSel] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [h, d, emps] = await Promise.all([
          fetchAll<HistRow>("crm_formulario_historico_dados", "*"),
          fetchAll<DealRow>(
            "crm_deals",
            "created_at,cliente_nome,cliente_email,status,empreendimento_id,interesse,auto_interesse,fonte_id,fonte_original,escolaridade,estado_civil,sexo,filhos,tipo_residencia,renda_familiar,auto_renda_familiar,interesses_pessoais,cidade_cliente"
          ),
          supabase.from("crm_empreendimentos").select("id,nome").order("nome"),
        ]);
        setHist(h);
        setDeals(d);
        setEmpreendimentos((emps.data as Empreendimento[]) ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const empById = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of empreendimentos) m.set(e.id, e.nome);
    return m;
  }, [empreendimentos]);

  const empByNomeLower = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of empreendimentos) m.set(e.nome.trim().toLowerCase(), e.id);
    return m;
  }, [empreendimentos]);

  // Normaliza histórico → mesma forma de "registro"
  type Registro = {
    data: Date | null;
    empreendimento: string | null;
    status: string | null;
    motivo: string | null;
    midia: string | null;
    profissao: string | null;
    filhos: string | null;
    interesses: string[];
    escolaridade: string | null;
    estado_civil: string | null;
    sexo: string | null;
    renda: string | null;
    cidade: string | null;
    tipo_residencia: string | null;
    fonte: "historico" | "deals";
    dedupKeys: string[];
  };

  const { registros, duplicados } = useMemo(() => {
    const out: Registro[] = [];
    const seen = new Set<string>();
    let dups = 0;

    const tryAdd = (reg: Registro) => {
      const keys = reg.dedupKeys.filter(Boolean);
      if (keys.length > 0 && keys.some((k) => seen.has(k))) {
        dups++;
        return;
      }
      for (const k of keys) seen.add(k);
      out.push(reg);
    };

    // Deals primeiro — fonte preferencial (mais atual, contém status)
    for (const d of deals) {
      const dt = parseAny(d.created_at);
      tryAdd({
        data: dt,
        empreendimento: d.empreendimento_id ? empById.get(d.empreendimento_id) ?? null : null,
        status: d.status ?? null,
        motivo: norm(d.interesse) ?? norm(d.auto_interesse),
        midia: norm(d.fonte_original),
        profissao: null,
        filhos: norm(d.filhos),
        interesses: d.interesses_pessoais ?? [],
        escolaridade: norm(d.escolaridade),
        estado_civil: norm(d.estado_civil),
        sexo: norm(d.sexo),
        renda: norm(d.renda_familiar) ?? norm(d.auto_renda_familiar),
        cidade: norm(d.cidade_cliente),
        tipo_residencia: norm(d.tipo_residencia),
        fonte: "deals",
        dedupKeys: [
          keyEmail(d.cliente_email),
          keyNome(d.cliente_nome),
        ].filter(Boolean) as string[],
      });
    }
    // Histórico em seguida — só entra se nenhuma chave já existir
    for (const r of hist) {
      const dt = parseAny(r["Carimbo de data/hora"]);
      tryAdd({
        data: dt,
        empreendimento: norm(r["Em qual empreendimento você adquiriu seu terreno?"]),
        status: "vendido",
        motivo: norm(r["Qual o motivo principal da compra?"]),
        midia: norm(r["Mídiamotivadoradaaquisição"]),
        profissao: norm(r["Profissão"]),
        filhos: norm(r["Você possui filhos? Quantos?"]),
        interesses: splitMulti(r["Marque seus principais interesses"]),
        escolaridade: norm(r["Qual o seu nível de escolaridade?"]),
        estado_civil: norm(r["Qual o seu estado civil?"]),
        sexo: norm(r["Sexo"]),
        renda: norm(r["Qual faixa melhor se aproxima da sua renda familiar mensal?"]),
        cidade: norm(r["Qual a cidade onde reside?"]),
        tipo_residencia: norm(r["Qual o seu tipo de residência?"]),
        fonte: "historico",
        dedupKeys: [
          keyEmail(r["Email"]),
          keyPhone(r["Telefone"]),
          keyNome(r["Qual o seu nome completo?"]),
        ].filter(Boolean) as string[],
      });
    }
    return { registros: out, duplicados: dups };
  }, [hist, deals, empById]);

  // Filtros aplicados
  const filtrados = useMemo(() => {
    const from = periodo.from ? new Date(`${periodo.from}T00:00:00`) : null;
    const to = periodo.to ? new Date(`${periodo.to}T23:59:59`) : null;
    const empNomes = new Set(
      empSel.map((id) => empById.get(id)?.trim().toLowerCase()).filter(Boolean) as string[]
    );
    return registros.filter((r) => {
      if (from && (!r.data || r.data < from)) return false;
      if (to && (!r.data || r.data > to)) return false;
      if (empSel.length > 0) {
        if (!r.empreendimento) return false;
        if (!empNomes.has(r.empreendimento.trim().toLowerCase())) return false;
      }
      if (statusSel.length > 0) {
        if (!r.status || !statusSel.includes(r.status)) return false;
      }
      return true;
    });
  }, [registros, periodo, empSel, statusSel, empById]);

  const total = filtrados.length;

  const blocos = useMemo(() => {
    return [
      { titulo: "Motivo de compra", buckets: bucketize(filtrados.map((r) => r.motivo)) },
      { titulo: "Mídia motivadora", buckets: bucketize(filtrados.map((r) => r.midia)) },
      { titulo: "Profissão", buckets: bucketize(filtrados.map((r) => r.profissao)) },
      { titulo: "Você possui filhos? Quantos?", buckets: bucketize(filtrados.map((r) => r.filhos)) },
      { titulo: "Interesses pessoais", buckets: bucketizeMulti(filtrados.map((r) => r.interesses)) },
      { titulo: "Escolaridade", buckets: bucketize(filtrados.map((r) => r.escolaridade)) },
      { titulo: "Estado civil", buckets: bucketize(filtrados.map((r) => r.estado_civil)) },
      { titulo: "Sexo", buckets: bucketize(filtrados.map((r) => r.sexo)) },
      { titulo: "Renda familiar", buckets: bucketize(filtrados.map((r) => r.renda)) },
      { titulo: "Tipo de residência", buckets: bucketize(filtrados.map((r) => r.tipo_residencia)) },
      { titulo: "Cidade onde reside", buckets: bucketize(filtrados.map((r) => r.cidade)) },
      { titulo: "Empreendimento", buckets: bucketize(filtrados.map((r) => r.empreendimento)) },
    ];
  }, [filtrados]);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of registros) if (r.status) set.add(r.status);
    return Array.from(set).sort().map((s) => ({ value: s, label: s }));
  }, [registros]);

  const empOptions = useMemo(
    () => empreendimentos.map((e) => ({ value: e.id, label: e.nome })),
    [empreendimentos]
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Formulário de Cadastro</h1>
            <p className="text-sm text-muted-foreground">
              Perfil do público — dados unificados do histórico (até 29/05/2026) e das negociações (a partir de 30/05/2026).
            </p>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4 flex flex-wrap items-center gap-3">
            <DateRangeFilter value={periodo} onChange={setPeriodo} label="Período" />
            <MultiSelectFilter
              label="Empreendimento"
              options={empOptions}
              selected={empSel}
              onChange={setEmpSel}
            />
            <MultiSelectFilter
              label="Status"
              options={statusOptions}
              selected={statusSel}
              onChange={setStatusSel}
            />
            <div className="ml-auto flex items-center gap-2">
              {duplicados > 0 && (
                <Badge variant="outline" className="text-xs">
                  {duplicados} duplicado{duplicados > 1 ? "s" : ""} removido{duplicados > 1 ? "s" : ""}
                </Badge>
              )}
              <Badge variant="secondary" className="text-sm">
                {total.toLocaleString("pt-BR")} registros
              </Badge>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Carregando dados...</div>
        ) : total === 0 ? (
          <div className="text-center text-muted-foreground py-12">Nenhum registro encontrado para os filtros selecionados.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {blocos.map((b) => (
              <BlocoCard key={b.titulo} titulo={b.titulo} buckets={b.buckets} total={total} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function BlocoCard({ titulo, buckets, total }: { titulo: string; buckets: Bucket[]; total: number }) {
  const respondido = buckets.reduce((s, b) => s + b.count, 0);
  const top = buckets.slice(0, 12);
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold leading-tight">{titulo}</CardTitle>
          <Badge variant="outline" className="shrink-0 text-xs">
            {respondido} resp.
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {top.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem dados.</p>
        ) : (
          top.map((b) => {
            const pct = total > 0 ? (b.count / total) * 100 : 0;
            return (
              <div key={b.label} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-foreground" title={b.label}>
                    {b.label}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {b.count} · {pct.toFixed(0)}%
                  </span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
            );
          })
        )}
        {buckets.length > top.length && (
          <p className="pt-1 text-xs text-muted-foreground">
            +{buckets.length - top.length} outras categorias
          </p>
        )}
      </CardContent>
    </Card>
  );
}