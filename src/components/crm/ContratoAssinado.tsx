import { useEffect, useState } from "react";
import { supabase, crmDb } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileSignature, Upload, ExternalLink, Trash2 } from "lucide-react";

// Contrato ASSINADO (campo próprio — NÃO é o link_contrato do modelo).
// Regra (05/10/2026): UM contrato por cliente.
//  • Anexar → RPC grava + move o negócio pra "Sinal pago e contrato assinado" + avisa a Laís (n8n).
//  • Veio errado → Excluir → o negócio SAI da etapa (volta pra Proposta Recebida); anexar um novo gera NOVO disparo.
// Bucket `crm-contratos` é PRIVADO: abre por URL assinada (10 min), nunca por link público.

type ContratoRow = { id: string; storage_path: string; nome_arquivo: string; tamanho: number | null; uploaded_at: string; uploaded_by: string | null };

const BUCKET = "crm-contratos";
const ACEITA = "application/pdf,image/jpeg,image/png,image/webp";
const MAX_MB = 25;

interface Props {
  dealId: string;
  status: string;
  /** Dono do negócio — só dono/admin/gestor/financeiro podem anexar/excluir (mesma regra da RPC). */
  responsavelId: string | null;
  /** Chamado após anexar/excluir (o status do negócio pode ter mudado). */
  onChanged: () => void;
}

export function ContratoAssinado({ dealId, status, responsavelId, onChanged }: Props) {
  const { user, isAdmin, veTodosLeads, isFinanceiro } = useAuth();
  const { toast } = useToast();
  const [contrato, setContrato] = useState<ContratoRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = async () => {
    setLoading(true);
    // UM por cliente: só o contrato ativo (deleted_at nulo).
    const { data } = await crmDb.from("crm_deal_contratos_assinados")
      .select("*").eq("deal_id", dealId).is("deleted_at", null)
      .order("uploaded_at", { ascending: false }).limit(1);
    setContrato(((data as ContratoRow[]) ?? [])[0] ?? null);
    setLoading(false);
  };
  useEffect(() => { carregar(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [dealId]);

  const abrir = async (r: ContratoRow) => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(r.storage_path, 600);
    if (error || !data?.signedUrl) { toast({ title: "Não consegui abrir o arquivo", description: error?.message, variant: "destructive" }); return; }
    window.open(data.signedUrl, "_blank", "noopener");
  };

  const anexar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (file.size > MAX_MB * 1024 * 1024) { toast({ title: `Arquivo acima de ${MAX_MB} MB`, variant: "destructive" }); return; }
    setEnviando(true);
    try {
      const safe = file.name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-80);
      const path = `${dealId}/${crypto.randomUUID()}-${safe}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined, upsert: false });
      if (upErr) throw upErr;
      const { data, error } = await (supabase as any).rpc("crm_registrar_contrato_assinado", {
        p_deal_id: dealId, p_storage_path: path, p_nome_arquivo: file.name, p_tamanho: file.size,
      });
      if (error) {
        // RPC negou/falhou depois do upload → não deixa arquivo órfão no bucket (best-effort).
        await supabase.storage.from(BUCKET).remove([path]).catch(() => { /* ignora */ });
        throw error;
      }
      const moveu = !!data?.status_novo;
      toast({
        title: "Contrato assinado anexado ✓",
        description: moveu
          ? "Negócio movido para \"Sinal pago e contrato assinado\". O financeiro foi avisado."
          : "O financeiro foi avisado.",
      });
      await carregar();
      onChanged();
    } catch (err) {
      toast({ title: "Não consegui anexar o contrato", description: (err as Error).message, variant: "destructive" });
    } finally {
      setEnviando(false);
    }
  };

  const excluir = async () => {
    if (!contrato) return;
    if (!window.confirm("Excluir este contrato assinado?\n\nO negócio sai da etapa \"Sinal pago e contrato assinado\". Para avisar o financeiro de novo, é só anexar o contrato correto.")) return;
    setExcluindo(true);
    try {
      const { data, error } = await (supabase as any).rpc("crm_excluir_contrato_assinado", { p_contrato_id: contrato.id });
      if (error) throw error;
      // Remove o arquivo errado do bucket (best-effort; a linha fica como histórico, marcada excluída).
      if (data?.storage_path) await supabase.storage.from(BUCKET).remove([data.storage_path]).catch(() => { /* ignora */ });
      toast({
        title: "Contrato excluído",
        description: data?.saiu_etapa ? "O negócio voltou para \"Proposta Recebida\". Anexe o contrato correto para reenviar ao financeiro." : "Anexe o contrato correto quando quiser.",
      });
      await carregar();
      onChanged();
    } catch (err) {
      toast({ title: "Não consegui excluir", description: (err as Error).message, variant: "destructive" });
    } finally {
      setExcluindo(false);
    }
  };

  const podeMexer = status !== "perdido" && (isAdmin || veTodosLeads || isFinanceiro || (!!user && user.id === responsavelId));
  const fmtTam = (n: number | null) => (n == null ? "" : n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

  return (
    <Card className={!contrato && status === "sinal_pago_contrato_assinado" ? "border-amber-300 dark:border-amber-700" : undefined}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <FileSignature className="h-4 w-4" /> Contrato assinado
        </CardTitle>
        {/* Anexar só aparece quando NÃO há contrato ativo (um por cliente) */}
        {podeMexer && !contrato && (
          <label className="cursor-pointer">
            <Button size="sm" variant="default" asChild disabled={enviando}>
              <span><Upload className="h-4 w-4 mr-1" /> {enviando ? "Enviando…" : "Anexar contrato assinado"}</span>
            </Button>
            <input type="file" accept={ACEITA} className="hidden" onChange={anexar} disabled={enviando} />
          </label>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : !contrato ? (
          <div className="text-sm text-muted-foreground border border-dashed rounded-md p-3 leading-snug">
            {status === "vendido"
              ? "Nenhum contrato assinado anexado."
              : <>Sinal pago e contrato assinado? <strong>Anexe o contrato aqui</strong> (PDF ou foto). Isso move o negócio para <em>"Sinal pago e contrato assinado"</em> e avisa o financeiro, que lança no Sienge e aprova a venda.</>}
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2 text-sm rounded-md border">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{contrato.nome_arquivo}</p>
              <p className="text-[11px] text-muted-foreground">
                {new Date(contrato.uploaded_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                {contrato.tamanho ? ` · ${fmtTam(contrato.tamanho)}` : ""}
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => abrir(contrato)} title="Abre em nova aba (link válido por 10 min)">
              <ExternalLink className="h-4 w-4 mr-1" /> Abrir
            </Button>
            {podeMexer && status !== "vendido" && (
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={excluir} disabled={excluindo} title="Contrato errado? Exclui e o negócio sai da etapa.">
                <Trash2 className="h-4 w-4 mr-1" /> {excluindo ? "Excluindo…" : "Excluir"}
              </Button>
            )}
          </div>
        )}
        {contrato && status !== "vendido" && (
          <p className="text-[11px] text-muted-foreground mt-2">Veio errado? Clique em <strong>Excluir</strong> — o negócio sai da etapa. Anexar o contrato correto reenvia o aviso ao financeiro.</p>
        )}
      </CardContent>
    </Card>
  );
}
