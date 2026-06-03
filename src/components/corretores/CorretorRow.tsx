/**
 * CorretorRow.tsx
 * Linha de tabela para comercial_corretores no Pingolead.
 * Renderiza badge condicional baseado em is_cadastro_completo:
 *   - BadgeCheck verde = cadastro contratual completo
 *   - Clock ambar = incompleto, mostra botao 'Contrato'
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BadgeCheck, Clock, Pencil, Check, X, FileText } from "lucide-react";
import type { CorretorCadastro } from "./CorretorCadastroContratualDialog";

type Props = {
  corretor: CorretorCadastro;
  onToggle: () => void;
  onOpenCadastro: () => void;
  onRename?: (id: string, novoNome: string) => Promise<void>;
};

export function CorretorRow({ corretor, onToggle, onOpenCadastro, onRename }: Props) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [nomeEdit, setNomeEdit] = useState(corretor.nome_exibicao ?? corretor.nome);

  async function handleSaveNome() {
    const novoNome = nomeEdit.trim();
    if (!novoNome || novoNome === (corretor.nome_exibicao ?? corretor.nome)) {
      setEditing(false);
      return;
    }
    try {
      const { error } = await supabase
        .from("comercial_corretores")
        .update({ nome_exibicao: novoNome, nome: novoNome })
        .eq("id", corretor.id);
      if (error) throw error;
      await onRename?.(corretor.id, novoNome);
      toast({ title: "Nome atualizado" });
    } catch {
      toast({ title: "Erro ao renomear", variant: "destructive" });
    }
    setEditing(false);
  }

  const nomeExibido = corretor.nome_exibicao ?? corretor.nome;
  const isCompleto = corretor.is_cadastro_completo;
  const labelTipo = corretor.tipo === "PJ" ? "PJ" : corretor.tipo === "PF" ? "PF" : "\u2014";

  return (
    <TableRow className={!corretor.ativo ? "opacity-50" : ""}>
      <TableCell>
        <div className="flex items-center gap-2 min-w-[220px]">
          {editing ? (
            <Input
              value={nomeEdit}
              onChange={(e) => setNomeEdit(e.target.value)}
              className="h-7 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveNome();
                if (e.key === "Escape") { setEditing(false); setNomeEdit(nomeExibido); }
              }}
              autoFocus
            />
          ) : (
            <span className="text-sm">{nomeExibido}</span>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {isCompleto ? (
                  <BadgeCheck className="h-4 w-4 text-emerald-600 shrink-0 cursor-default" aria-label="Cadastro contratual completo" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-500 shrink-0 cursor-default" aria-label="Cadastro contratual incompleto" />
                )}
              </TooltipTrigger>
              <TooltipContent side="right">
                {isCompleto ? "Cadastro contratual completo" : "Incompleto \u2014 clique em \u00abContrato\u00bb para completar"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground w-[60px]">{labelTipo}</TableCell>
      <TableCell className="w-[60px]"><Switch checked={corretor.ativo} onCheckedChange={onToggle} /></TableCell>
      <TableCell className="w-[130px]">
        {editing ? (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSaveNome}><Check className="h-3.5 w-3.5 text-emerald-600" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(false); setNomeEdit(nomeExibido); }}><X className="h-3.5 w-3.5 text-destructive" /></Button>
          </div>
        ) : (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(true); setNomeEdit(nomeExibido); }} title="Renomear"><Pencil className="h-3.5 w-3.5" /></Button>
            <Button
              variant={isCompleto ? "ghost" : "outline"}
              size="sm"
              className={`h-7 text-xs gap-1.5 ${isCompleto ? "text-muted-foreground" : "text-amber-700 border-amber-300 hover:bg-amber-50"}`}
              onClick={onOpenCadastro}
              title="Abrir cadastro contratual"
            >
              <FileText className="h-3 w-3" />Contrato
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

// \u2500\u2500\u2500 Hook de listagem \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

/**
 * useCorretores
 * Substitui fetchImobiliarias em Configuracoes.tsx para a nova tabela.
 */
export function useCorretores() {
  const [corretores, setCorretores] = useState<CorretorCadastro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  async function fetchCorretores() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("comercial_corretores")
      .select(
        "id, nome, nome_exibicao, tipo, razao_social, cpf, cnpj, creci, " +
        "email, email_secundario, telefone, endereco, bairro, cidade, uf, cep, " +
        "banco_nome, banco_agencia, banco_conta, banco_tipo, banco_chave_pix, " +
        "is_cadastro_completo, ativo"
      )
      .order("nome_exibicao", { ascending: true, nullsFirst: false });

    if (error) {
      toast({ title: "Erro ao carregar corretores", description: error.message, variant: "destructive" });
      setCorretores([]);
    } else {
      setCorretores(((data ?? []) as unknown) as CorretorCadastro[]);
    }
    setIsLoading(false);
  }

  useState(() => { void fetchCorretores(); });

  async function toggleAtivo(id: string, ativo: boolean) {
    const { error } = await supabase.from("comercial_corretores").update({ ativo: !ativo }).eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else await fetchCorretores();
  }

  async function addCorretor(input: { nome: string; tipo: string }) {
    const { error } = await supabase.from("comercial_corretores").insert({
      nome: input.nome, nome_exibicao: input.nome, tipo: input.tipo, ativo: true,
    });
    if (error) {
      toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" });
      return false;
    }
    await fetchCorretores();
    return true;
  }

  return { corretores, isLoading, refetch: fetchCorretores, toggleAtivo, addCorretor };
}
