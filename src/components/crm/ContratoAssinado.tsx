import { useEffect, useState } from "react";
import { supabase, crmDb } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileSignature, Upload, ExternalLink } from "lucide-react";

// Contrato ASSINADO (campo próprio — NÃO é o link_contrato do modelo).
// Fluxo (01/10/2026): consultor anexa → RPC grava em crm_deal_contratos_assinados, leva o negócio
// pra "Sinal pago e contrato assinado" e o gatilho do banco avisa a Laís (n8n young-contrato-assinado).
// Bucket `crm-contratos` é PRIVADO: abre por URL assinada (10 min), nunca por link público.

type ContratoRow = { id: string; storage_path: string; nome_arquivo: string; tamanho: number | null; uploaded_at: string; uploaded_by: string | null };

const BUCKET = "crm-contratos";
const ACEITA = "application/pdf,image/jpeg,image/png,image/webp";
const MAX_MB = 25;

interface Props {
  dealId: string;
  status: string;
  /** Dono do negócio — só dono/admin/gestor/financeiro podem anexar (mesma regra da RPC). */
  responsavelId: string | null;
  /** Chamado após anexar (o status do negócio pode ter mudado). */
  onChanged: () => void;
}

export function ContratoAssinado({ dealId, status, responsavelId, onChanged }: Props) {
  const { user, isAdmin, veTodosLeads, isFinanceiro } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<ContratoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const carregar = async () => {
    setLoading(true);
    const { data } = await crmDb.from("crm_deal_contratos_assinados").select("*").eq("deal_id", dealId).order("uploaded_at", { ascending: false });
    setRows((data as ContratoRow[]) ?? []);
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
          ? "Negócio movido para \"Sinal pago e contrato assinado\". O financeiro foi avisado por e-mail."
          : "O financeiro foi avisado por e-mail.",
      });
      await carregar();
      onChanged();
    } catch (err) {
      toast({ title: "Não consegui anexar o contrato", description: (err as Error).message, variant: "destructive" });
    } finally {
      setEnviando(false);
    }
  };

  const podeAnexar = status !== "perdido" && (isAdmin || veTodosLeads || isFinanceiro || (!!user && user.id === responsavelId));
  const fmtTam = (n: number | null) => (n == null ? "" : n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

  return (
    <Card className={rows.length === 0 && status === "sinal_pago_contrato_assinado" ? "border-amber-300 dark:border-amber-700" : undefined}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <FileSignature className="h-4 w-4" /> Contrato assinado {rows.length > 0 && <span className="text-muted-foreground font-normal">({rows.length})</span>}
        </CardTitle>
        {podeAnexar && (
          <label className="cursor-pointer">
            <Button size="sm" variant={rows.length === 0 ? "default" : "outline"} asChild disabled={enviando}>
              <span><Upload className="h-4 w-4 mr-1" /> {enviando ? "Enviando…" : rows.length === 0 ? "Anexar contrato assinado" : "Anexar outro"}</span>
            </Button>
            <input type="file" accept={ACEITA} className="hidden" onChange={anexar} disabled={enviando} />
          </label>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : rows.length === 0 ? (
          <div className="text-sm text-muted-foreground border border-dashed rounded-md p-3 leading-snug">
            {status === "vendido"
              ? "Nenhum contrato assinado anexado."
              : <>Sinal pago e contrato assinado? <strong>Anexe o contrato aqui</strong> (PDF ou foto). Isso move o negócio para <em>"Sinal pago e contrato assinado"</em> e avisa o financeiro, que lança no Sienge e aprova a venda.</>}
          </div>
        ) : (
          <ul className="divide-y rounded-md border">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{r.nome_arquivo}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(r.uploaded_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    {r.tamanho ? ` · ${fmtTam(r.tamanho)}` : ""}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => abrir(r)} title="Abre em nova aba (link válido por 10 min)">
                  <ExternalLink className="h-4 w-4 mr-1" /> Abrir
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
