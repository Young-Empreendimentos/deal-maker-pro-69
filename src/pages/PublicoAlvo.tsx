import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/crm/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DateRangeFilter, type DateRange } from "@/components/crm/DateRangeFilter";
import { MultiSelectFilter } from "@/components/crm/MultiSelectFilter";
import { Users2, ChevronDown } from "lucide-react";

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

/** Capitaliza a primeira letra de cada palavra (ignora siglas) */
function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** Normaliza "Motivo de compra": desmembra valores combinados e unifica grafia.
 *  Ex.: "Moradia, Investimento" → ["Moradia","Investimento"]; "moradia" → ["Moradia"].
 */
function canonMotivo(v: any): string[] {
  const s = norm(v);
  if (!s) return [];
  const partes = splitMulti(s)
    .map((p) => norm(p))
    .filter((p): p is string => !!p)
    .map((p) => titleCase(p));
  // dedup interno (caso venha "Moradia, moradia" no mesmo registro)
  return Array.from(new Set(partes));
}

/** Normaliza "Mídia motivadora": desmembra valores combinados e unifica grafias.
 *  Ex.: "Facebook/instagram" → "Facebook/Instagram";
 *       "Rede social (Facebook ou Instagram)" → "Facebook/Instagram";
 *       "Whatsapp / Ligação" → "WhatsApp/Ligação".
 */
function canonMidia(v: any): string[] {
  const s = norm(v);
  if (!s) return [];
  const partes = splitMulti(s)
    .map((p) => norm(p))
    .filter((p): p is string => !!p)
    .map((p) => {
      const key = p.toLowerCase().replace(/\s+/g, " ").trim();
      // Sinônimos → forma canônica
      if (
        key === "facebook/instagram" ||
        key === "facebook / instagram" ||
        key === "facebook" ||
        key === "instagram" ||
        key === "rede social (facebook ou instagram)" ||
        key === "rede social" ||
        key === "redes sociais"
      ) return "Facebook/Instagram";
      if (
        key === "whatsapp/ligação" ||
        key === "whatsapp / ligação" ||
        key === "whatsapp" ||
        key === "ligação" ||
        key === "whatsapp/ligacao"
      ) return "WhatsApp/Ligação";
      if (key === "youtube") return "YouTube";
      if (key === "google") return "Google";
      if (key === "indicação" || key === "indicacao") return "Indicação";
      if (key === "oferta do corretor" || key === "corretor") return "Oferta do corretor";
      if (key === "outbound corretor" || key === "outbound") return "Outbound corretor";
      if (
        key === "visita ao plantão de vendas" ||
        key === "visita ao plantao de vendas" ||
        key === "plantão de vendas" ||
        key === "plantao de vendas"
      ) return "Visita ao plantão de vendas";
      if (key === "imobiliária" || key === "imobiliaria") return "Imobiliária";
      if (key === "site da empresa" || key === "site") return "Site da empresa";
      if (key === "hotsite") return "Hotsite";
      if (key === "rádio" || key === "radio") return "Rádio";
      if (key === "jornal") return "Jornal";
      return titleCase(p);
    });
  return Array.from(new Set(partes));
}

/** Helpers de canonicalização por campo */
function canonSexo(v: any): string | null {
  const s = norm(v);
  if (!s) return null;
  const k = s.toLowerCase();
  if (k.startsWith("masc")) return "Masculino";
  if (k.startsWith("fem")) return "Feminino";
  return titleCase(s);
}

function canonEstadoCivil(v: any): string | null {
  const s = norm(v);
  if (!s) return null;
  const k = s.toLowerCase();
  if (k.startsWith("casado") || k.startsWith("casada")) return "Casado(a)";
  if (k.startsWith("solteiro")) return "Solteiro(a)";
  if (k.startsWith("divorciado") || k.startsWith("separado")) return "Divorciado(a)";
  if (k.startsWith("viúvo") || k.startsWith("viuvo")) return "Viúvo(a)";
  if (k.includes("união") || k.includes("uniao")) return "União estável";
  return titleCase(s);
}

function canonRenda(v: any): string | null {
  const s = norm(v);
  if (!s) return null;
  const k = s.toLowerCase().replace(/\s+/g, " ").trim();
  if (k.includes("até 3") || k === "r$0-r$3.000" || k === "r$1.000-r$3.000") return "Até 3 mil reais";
  if (k.includes("3 a 5") || k === "r$3.000-r$5.000") return "3 a 5 mil reais";
  if (k.includes("5 a 10") || k === "r$5.000-r$10.000") return "5 a 10 mil reais";
  if (k.includes("10 a 15") || k === "r$10.000-r$15.000") return "10 a 15 mil reais";
  if (k.includes("15 a 20") || k === "r$15.000-r$20.000") return "15 a 20 mil reais";
  if (k.includes("acima de 20") || k.includes("mais de 20")) return "Acima de 20 mil reais";
  return titleCase(s);
}

function canonTipoResidencia(v: any): string | null {
  const s = norm(v);
  if (!s) return null;
  const k = s.toLowerCase();
  if (k.includes("alug") || k.includes("locatário") || k.includes("locatario")) return "Alugada";
  if (k.includes("família") || k.includes("familia")) return "Mora com família";
  if ((k.includes("própria") || k.includes("propria") || k.includes("proprietário") || k.includes("proprietario")) && k.includes("financ")) return "Própria financiada";
  if (k.includes("própria") || k.includes("propria") || k.includes("proprietário") || k.includes("proprietario") || k.includes("quitad")) return "Própria quitada";
  return titleCase(s);
}

function canonFilhos(v: any): string | null {
  const s = norm(v);
  if (!s) return null;
  const k = s.toLowerCase();
  if (k === "nenhum" || k === "não possuo" || k === "nao possuo" || k === "0") return "Nenhum";
  if (k === "4" || k.startsWith("4 ou") || k.startsWith("4 +") || k.startsWith("mais de 4")) return "4 ou mais";
  return s;
}

function canonEscolaridade(v: any): string | null {
  const s = norm(v);
  if (!s) return null;
  const k = s.toLowerCase();
  if (k.startsWith("pós-doutor") || k.startsWith("pos-doutor")) return "Pós-doutorado";
  if (k.startsWith("doutor")) return "Doutorado";
  if (k.startsWith("mestr")) return "Mestrado";
  if (k.startsWith("pós") || k.startsWith("pos")) return "Pós-graduação";
  if (k.includes("superior") && k.includes("incomplet")) return "Superior incompleto";
  if (k.includes("superior")) return "Superior completo";
  if ((k.includes("médio") || k.includes("medio")) && k.includes("incomplet")) return "Médio incompleto";
  if (k.includes("médio") || k.includes("medio")) return "Médio completo";
  if (k.includes("fundamental") && k.includes("incomplet")) return "Fundamental incompleto";
  if (k.includes("fundamental")) return "Fundamental completo";
  return titleCase(s);
}

function canonTempoResidencia(v: any): string | null {
  const s = norm(v);
  if (!s) return null;
  const k = s.toLowerCase().trim();
  if (k.startsWith("até 1") || k.startsWith("ate 1") || k.includes("menos de 1")) return "Até 1 ano";
  if (k.startsWith("1 a 3")) return "1 a 3 anos";
  if (k.startsWith("3 a 5")) return "3 a 5 anos";
  if (k.startsWith("5 a 10")) return "5 a 10 anos";
  if (k.includes("mais de 10") || k.includes("+10") || k.includes("acima de 10")) return "Mais de 10 anos";
  return titleCase(s);
}

function canonNacionalidade(v: any): string | null {
  const s = norm(v);
  if (!s) return null;
  if (/^n[ãa]o\s+cadastrad/i.test(s)) return null;
  const k = s.toLowerCase();
  if (k.startsWith("brasile")) return "Brasileira(o)";
  if (k.startsWith("uruguai")) return "Uruguaia(o)";
  if (k.startsWith("argentin")) return "Argentina(o)";
  if (k.startsWith("paraguai")) return "Paraguaia(o)";
  return titleCase(s);
}

function canonLotes(v: any): string | null {
  const s = norm(v);
  if (!s) return null;
  const k = s.toLowerCase();
  if (k.startsWith("4")) return "4 ou mais";
  return s;
}

/** Normaliza nomes de cidade: remove UF, espaços extras, aspas tipográficas e mapeia variantes. */
function canonCidade(v: any): string | null {
  let s = norm(v);
  if (!s) return null;
  // troca aspas tipográficas
  s = s.replace(/[’`´]/g, "'");
  // remove sufixos de UF nos formatos " - RS", "/RS", ", RS", " RS"
  s = s.replace(
    /[\s,\-\/]+(rs|sc|pr|sp|mg|rj|es|ba|pe|ce|df|go|mt|ms|to|pa|am|ap|rr|ro|ac|ma|pi|rn|pb|al|se)\.?\s*$/i,
    ""
  );
  s = s.replace(/\s+/g, " ").trim();
  if (!s) return null;
  const k = s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/'/g, "");
  const alias: Record<string, string> = {
    "bage": "Bagé",
    "caraa": "Caraá",
    "cachoerinha": "Cachoeirinha",
    "dompedrito": "Dom Pedrito",
    "dom pedrito": "Dom Pedrito",
    "libramento": "Sant'Ana do Livramento",
    "livramento": "Sant'Ana do Livramento",
    "livramentour": "Sant'Ana do Livramento",
    "santana do livramento": "Sant'Ana do Livramento",
    "santana do livramento ": "Sant'Ana do Livramento",
    "santana do livramento rs": "Sant'Ana do Livramento",
    "rivera": "Rivera",
    "rivera uruguai": "Rivera",
    "rivera uruguay": "Rivera",
    "novo hamburgo": "Novo Hamburgo",
    "porto alegre": "Porto Alegre",
    "cruz alta": "Cruz Alta",
    "dois irmaos": "Dois Irmãos",
    "gravatai": "Gravataí",
    "ararica": "Araricá",
    "araucaria": "Araucária",
    "maquine": "Maquiné",
    "joia": "Jóia",
    "osorio": "Osório",
    "imbe": "Imbé",
    "parabe": "Parabé",
    "brasilia": "Brasília",
    "estancia velha": "Estância Velha",
    "hulha negra": "Hulha Negra",
    "santo antonio da patrulha": "Santo Antônio da Patrulha",
    "rosario do sul": "Rosário do Sul",
    "ribeirao preto": "Ribeirão Preto",
    "caxias do sul": "Caxias do Sul",
  };
  if (alias[k]) return alias[k];
  return titleCase(s);
}

/** Resolve nome de empreendimento ao canônico cadastrado (case/acento-insensível). */
function canonEmpreendimento(v: any, empByNomeLower: Map<string, string>, empById: Map<string, string>): string | null {
  const s = norm(v);
  if (!s) return null;
  const direct = empByNomeLower.get(s.trim().toLowerCase());
  if (direct) return empById.get(direct) ?? s;
  // fallback: comparação sem acento
  const norm2 = (x: string) => x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const k = norm2(s);
  for (const [lower, id] of empByNomeLower) {
    if (norm2(lower) === k) return empById.get(id) ?? s;
  }
  return titleCase(s);
}

/** Normaliza categorias de "Interesses pessoais" entre deals e histórico. */
function canonInteresses(arr: string[] | null | undefined): string[] {
  if (!arr || arr.length === 0) return [];
  const out = arr
    .map((p) => norm(p))
    .filter((p): p is string => !!p)
    .map((p) => {
      const k = p.toLowerCase().trim();
      if (k.startsWith("gastronomia")) return "Gastronomia";
      if (k.startsWith("negócios") || k.startsWith("negocios")) return "Negócios/Empreendedorismo";
      if (k.startsWith("política") || k.startsWith("politica")) return "Política";
      if (k.startsWith("cinema")) return "Cinema/Televisão/Jornalismo";
      if (k.startsWith("esportes") || k.startsWith("saúde") || k.startsWith("saude") || k.startsWith("fitness")) return "Esportes/Saúde/Fitness";
      if (k.startsWith("viagens") || k.startsWith("turismo")) return "Viagens/Turismo";
      if (k.startsWith("finanças") || k.startsWith("financas") || k.startsWith("economia")) return "Finanças/Economia";
      if (k.startsWith("educação") || k.startsWith("educacao") || k.startsWith("cultura")) return "Educação/Cultura";
      if (k.startsWith("ciências") || k.startsWith("ciencias") || k.startsWith("tecnologia")) return "Ciências/Tecnologia";
      if (k.startsWith("animais")) return "Animais de estimação";
      if (k.startsWith("casa")) return "Casa e decoração";
      if (k.startsWith("automó") || k.startsWith("automo")) return "Automóveis";
      return p;
    });
  return Array.from(new Set(out));
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
  const build = () => {
    let q: any = supabase.from(table as any).select(select, { count: "exact" });
    if (filter) q = filter(q);
    return q;
  };
  const first = await build().range(0, 999);
  if (first.error) throw first.error;
  const out: T[] = ((first.data ?? []) as T[]).slice();
  // Se o servidor não devolver count, usamos Infinity e paramos quando
  // uma página vier vazia (ou menor que a anterior).
  const total = first.count ?? Infinity;
  const pageSize = Math.max(out.length, 1);
  let from = out.length;
  let safety = 0;
  while (from < total && safety < 5000) {
    const { data, error } = await build().range(from, from + pageSize - 1);
    if (error) throw error;
    const rows = (data ?? []) as T[];
    if (rows.length === 0) break;
    out.push(...rows);
    from += rows.length;
    // Se o servidor devolveu menos que o tamanho da página E não temos
    // count confiável, assumimos que acabou.
    if (rows.length < pageSize && !Number.isFinite(total)) break;
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
            "created_at,cliente_nome,cliente_email,status,empreendimento_id,interesse,auto_interesse,fonte_id,fonte_original,escolaridade,estado_civil,sexo,filhos,tipo_residencia,renda_familiar,auto_renda_familiar,interesses_pessoais,cidade_cliente",
            (q) => q.gte("created_at", CORTE_DEALS)
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
    motivos: string[];
    midias: string[];
    profissao: string | null;
    filhos: string | null;
    interesses: string[];
    escolaridade: string | null;
    estado_civil: string | null;
    sexo: string | null;
    renda: string | null;
    cidade: string | null;
    tipo_residencia: string | null;
    tempo_residencia: string | null;
    nacionalidade: string | null;
    lotes: string | null;
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
        motivos: canonMotivo(norm(d.interesse) ?? norm(d.auto_interesse)),
        midias: canonMidia(d.fonte_original),
        profissao: null,
        filhos: canonFilhos(d.filhos),
        interesses: canonInteresses(d.interesses_pessoais),
        escolaridade: canonEscolaridade(d.escolaridade),
        estado_civil: canonEstadoCivil(d.estado_civil),
        sexo: canonSexo(d.sexo),
        renda: canonRenda(d.renda_familiar) ?? canonRenda(d.auto_renda_familiar),
        cidade: canonCidade(d.cidade_cliente),
        tipo_residencia: canonTipoResidencia(d.tipo_residencia),
        tempo_residencia: null,
        nacionalidade: null,
        lotes: null,
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
        empreendimento: canonEmpreendimento(
          r["Em qual empreendimento você adquiriu seu terreno?"],
          empByNomeLower,
          empById
        ),
        status: "vendido",
        motivo: norm(r["Qual o motivo principal da compra?"]),
        motivos: canonMotivo(r["Qual o motivo principal da compra?"]),
        midias: canonMidia(r["Mídiamotivadoradaaquisição"]),
        profissao: norm(r["Profissão"]),
        filhos: canonFilhos(r["Você possui filhos? Quantos?"]),
        interesses: canonInteresses(splitMulti(r["Marque seus principais interesses"])),
        escolaridade: canonEscolaridade(r["Qual o seu nível de escolaridade?"]),
        estado_civil: canonEstadoCivil(r["Qual o seu estado civil?"]),
        sexo: canonSexo(r["Sexo"]),
        renda: canonRenda(r["Qual faixa melhor se aproxima da sua renda familiar mensal?"]),
        cidade: canonCidade(r["Qual a cidade onde reside?"]),
        tipo_residencia: canonTipoResidencia(r["Qual o seu tipo de residência?"]),
        tempo_residencia: canonTempoResidencia(r["Há quanto tempo mora no seu endereço atual?"]),
        nacionalidade: canonNacionalidade(r["Nacionalidade"]),
        lotes: canonLotes(r["Quantos lotes você adquiriu?"]),
        fonte: "historico",
        dedupKeys: [
          keyEmail(r["Email"]),
          keyPhone(r["Telefone"]),
          keyNome(r["Qual o seu nome completo?"]),
        ].filter(Boolean) as string[],
      });
    }
    return { registros: out, duplicados: dups };
  }, [hist, deals, empById, empByNomeLower]);

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
      { titulo: "Motivo de compra", buckets: bucketizeMulti(filtrados.map((r) => r.motivos)) },
      { titulo: "Mídia motivadora", buckets: bucketizeMulti(filtrados.map((r) => r.midias)) },
      { titulo: "Profissão", buckets: bucketize(filtrados.map((r) => r.profissao)) },
      { titulo: "Você possui filhos? Quantos?", buckets: bucketize(filtrados.map((r) => r.filhos)) },
      { titulo: "Interesses pessoais", buckets: bucketizeMulti(filtrados.map((r) => r.interesses)) },
      { titulo: "Escolaridade", buckets: bucketize(filtrados.map((r) => r.escolaridade)) },
      { titulo: "Estado civil", buckets: bucketize(filtrados.map((r) => r.estado_civil)) },
      { titulo: "Sexo", buckets: bucketize(filtrados.map((r) => r.sexo)) },
      { titulo: "Renda familiar", buckets: bucketize(filtrados.map((r) => r.renda)) },
      { titulo: "Tipo de residência", buckets: bucketize(filtrados.map((r) => r.tipo_residencia)) },
      { titulo: "Tempo no endereço atual", buckets: bucketize(filtrados.map((r) => r.tempo_residencia)) },
      { titulo: "Nacionalidade", buckets: bucketize(filtrados.map((r) => r.nacionalidade)) },
      { titulo: "Quantos lotes adquiriu", buckets: bucketize(filtrados.map((r) => r.lotes)) },
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
  const [expanded, setExpanded] = useState(false);
  const COLLAPSED = 5;
  const respondido = buckets.reduce((s, b) => s + b.count, 0);
  const denominador = respondido || total;
  const maxCount = buckets[0]?.count ?? 0;
  const visible = expanded ? buckets : buckets.slice(0, COLLAPSED);
  const restante = Math.max(0, buckets.length - COLLAPSED);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold leading-tight text-foreground">
            {titulo}
          </CardTitle>
          <Badge variant="outline" className="shrink-0 text-[10px] font-normal text-muted-foreground">
            {respondido} resp.
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5 flex-1 flex flex-col">
        {buckets.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem dados.</p>
        ) : (
          <>
            {visible.map((b, i) => {
              const pct = denominador > 0 ? (b.count / denominador) * 100 : 0;
              const barPct = maxCount > 0 ? (b.count / maxCount) * 100 : 0;
              const isTop = i === 0;
              return (
                <div
                  key={b.label}
                  className="relative rounded-md overflow-hidden border border-border/40 bg-muted/30"
                >
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0",
                      isTop ? "bg-primary/15" : "bg-primary/8"
                    )}
                    style={{ width: `${barPct}%` }}
                  />
                  <div className="relative flex items-center justify-between gap-3 px-2.5 py-1.5 text-xs">
                    <span
                      className={cn(
                        "truncate",
                        isTop ? "font-semibold text-foreground" : "text-foreground/85"
                      )}
                      title={b.label}
                    >
                      {b.label}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      <span className="font-medium text-foreground">{pct.toFixed(0)}%</span>
                      <span className="ml-1.5 opacity-60">· {b.count}</span>
                    </span>
                  </div>
                </div>
              );
            })}
            {restante > 0 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-1 inline-flex items-center gap-1 self-start text-xs font-medium text-primary hover:underline"
              >
                {expanded ? "Ver menos" : `Ver mais ${restante} categoria${restante > 1 ? "s" : ""}`}
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform",
                    expanded && "rotate-180"
                  )}
                />
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}