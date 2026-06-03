import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/crm/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, CheckCircle2, Circle, Calendar, Upload, XCircle, Trophy, Trash2, StickyNote, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { KANBAN_COLUMNS, QUAL_COLORS } from "./Negociacoes";
import { TASK_TIPOS, TIPO_CONFIG } from "./Tarefas";
import { DealProposalForm, isProposalComplete } from "@/components/crm/DealProposalForm";
import { DealBasicEditor } from "@/components/crm/DealBasicEditor";
import { DealGallery } from "@/components/crm/DealGallery";

type DealDetail = {
  id: string;
  cliente_nome: string;
  cliente_email: string | null;
  qualificacao: string;
  status: string;
  responsavel_id: string;
  created_at: string;
  empreendimento_id: string | null;
  fonte_id: string | null;
  numero_lote: string | null;
  preco_lote: number | null;
  forma_pagamento: string | null;
  link_contrato: string | null;
  versao_tabela: string | null;
  interesse: string | null;
  satisfacao_atendimento: number | null;
  satisfacao_produto: number | null;
  responsavel_venda_user_id: string | null;
  responsavel_venda_corretor_id: string | null;
  valor_entrada: number | null;
  data_nascimento: string | null;
  escolaridade: string | null;
  estado_civil: string | null;
  sexo: string | null;
  nacionalidade: string | null;
  cidade_cliente: string | null;
  logradouro: string | null;
  numero_logradouro: string | null;
  tipo_residencia: string | null;
  renda_familiar: string | null;
  filhos: string | null;
  interesses_pessoais: string[] | null;
  auto_interesse: string | null;
  auto_renda_familiar: string | null;
  auto_valor_entrada: number | null;
};

type DealPhone  = { id: string; telefone: string };
type Task       = { id: string; titulo: string; descricao: string; data_vencimento: string | null; hora_vencimento: string | null; concluida: boolean; created_at: string; tipo?: string };
type TaskImage  = { id: string; task_id: string; image_url: string; nome_arquivo: string; uploaded_at: string; task_titulo?: string };
type DealImage  = { id: string; image_url: string; nome_arquivo: string; uploaded_at: string };
type MotivoPerda = { id: string; nome: string };
type Anotacao   = { id: string; texto: string; created_at: string; user_id: string; user_nome?: string };

const ALL_STATUSES = [
  ...KANBAN_COLUMNS,
  { value: "vendido", label: "Vendido" },
  { value: "perdido", label: "Perdido" },
];

export default function NegociacaoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [phones, setPhones] = useState<DealPhone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskImages, setTaskImages] = useState<TaskImage[]>([]);
  const [dealImages, setDealImages] = useState<DealImage[]>([]);
  const [loading, setLoading] = useState(true);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ titulo: "", descricao: "", data_vencimento: "", hora_vencimento: "", tipo: "" });
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskFilter, setTaskFilter] = useState<"todas" | "pendentes" | "concluidas">("pendentes");

  const [anotacoes, setAnotacoes]         = useState<Anotacao[]>([]);
  const [anotacaoTexto, setAnotacaoTexto] = useState("");
  const [anotacaoLoading, setAnotacaoLoading] = useState(false);

  const [showDeleteDealDialog, setShowDeleteDealDialog] = useState(false);
  const [showLossDialog, setShowLossDialog] = useState(false);
  const [motivosPerda, setMotivosPerda] = useState<MotivoPerda[]>([]);
  const [selectedMotivo, setSelectedMotivo] = useState("");

  const fetchAll = async () => {
    if (!id) return;

    const [dealRes, phonesRes, tasksRes, dealImgsRes, anotacoesRes] = await Promise.all([
      supabase.from("crm_deals").select("*").eq("id", id).single(),
      supabase.from("crm_deal_phones").select("*").eq("deal_id", id),
      supabase.from("crm_tasks").select("*").eq("deal_id", id).order("created_at", { ascending: false }),
      supabase.from("crm_deal_images").select("*").eq("deal_id", id).order("uploaded_at", { ascending: false }),
      supabase.from("crm_deal_anotacoes").select("*").eq("deal_id", id).order("created_at", { ascending: false }),
    ]);

    const dealData = dealRes.data as DealDetail | null;
    setDeal(dealData);
    setPhones((phonesRes.data as DealPhone[]) ?? []);
    const tasksData = (tasksRes.data as Task[]) ?? [];
    setTasks(tasksData);
    setDealImages((dealImgsRes.data as DealImage[]) ?? []);

    // Anotações — busca nomes dos usuários via user_profiles
    const anotacoesRaw = (anotacoesRes.data as Anotacao[]) ?? [];
    if (anotacoesRaw.length > 0) {
      const userIds = [...new Set(anotacoesRaw.map((a) => a.user_id))];
      const { data: profiles } = await supabase.from("user_profiles").select("user_id, nome").in("user_id", userIds);
      const profileMap = new Map(((profiles as any[]) ?? []).map((p) => [p.user_id, p.nome]));
      setAnotacoes(anotacoesRaw.map((a) => ({ ...a, user_nome: profileMap.get(a.user_id) ?? "Usuário" })));
    } else {
      setAnotacoes([]);
    }

    if (tasksData.length > 0) {
      const taskIds = tasksData.map((t) => t.id);
      const { data: imgs } = await supabase.from("crm_task_images").select("*").in("task_id", taskIds).order("uploaded_at", { ascending: false });
      const tasksMap = new Map(tasksData.map((t) => [t.id, t.titulo]));
      setTaskImages(((imgs as TaskImage[]) ?? []).map((img) => ({ ...img, task_titulo: tasksMap.get(img.task_id) ?? "" })));
    } else {
      setTaskImages([]);
    }

    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !deal) return;
    await supabase.from("crm_deals").update({ status: newStatus } as any).eq("id", id);
    setDeal((prev) => prev ? { ...prev, status: newStatus } : prev);
  };

  const handleMarkSold = async () => {
    if (!deal || !id) return;
    // Re-busca o deal mais recente para garantir que os dados salvos estão sendo verificados
    const { data: freshData } = await supabase.from("crm_deals").select("*").eq("id", id).single();
    const checkDeal = (freshData as DealDetail) ?? deal;
    const { complete, missing } = isProposalComplete(checkDeal);
    if (!complete) {
      toast({
        title: "Campos obrigatórios",
        description: `Preencha todos os campos para marcar como vendido: ${missing.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    await handleStatusChange("vendido");
    toast({ title: "Negociação marcada como vendida! 🎉" });
    // Notifica o n8n diretamente — mais confiável que webhook do banco
    try {
      fetch("https://primary-production-ee65.up.railway.app/webhook/young-leads-ganhos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ record: { id } }),
      });
    } catch {
      // silencioso — não bloqueia a marcação como vendido
    }
  };

  const openLossDialog = async () => {
    const { data } = await supabase.from("crm_motivos_perda").select("id, nome").eq("ativo", true).order("nome");
    setMotivosPerda((data as MotivoPerda[]) ?? []);
    setSelectedMotivo("");
    setShowLossDialog(true);
  };

  const confirmLoss = async () => {
    if (!deal || !id || !selectedMotivo) return;
    await supabase.from("crm_deals").update({ status: "perdido", motivo_perda_id: selectedMotivo } as any).eq("id", id);
    setDeal((prev) => prev ? { ...prev, status: "perdido" } : prev);
    setShowLossDialog(false);
    toast({ title: "Negociação marcada como perdida" });
  };

  const handleUndoFinal = async () => {
    if (!deal || !id) return;
    // Retorna para "ficha_assinada" e limpa motivo_perda se existir
    await supabase.from("crm_deals").update({
      status: "ficha_assinada",
      motivo_perda_id: null
    } as any).eq("id", id);
    setDeal((prev) => prev ? { ...prev, status: "ficha_assinada", motivo_perda_id: null } : prev);
    toast({ title: `Negociação retornada para "Ficha Assinada"` });
  };

  const toggleTask = async (task: Task) => {
    await supabase.from("crm_tasks").update({ concluida: !task.concluida }).eq("id", task.id);
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, concluida: !t.concluida } : t));
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    setTaskLoading(true);

    // FIX: Input type="date" pode causar problema de timezone
    // Garantir que a data seja enviada como string literal "YYYY-MM-DD" sem conversão
    let dataVencimento: any = null;
    if (taskForm.data_vencimento && taskForm.data_vencimento.trim()) {
      // Se vier como string "YYYY-MM-DD", enviar diretamente para PostgreSQL interpretar como DATE literal
      dataVencimento = taskForm.data_vencimento.trim();
    }

    // Hora de vencimento como string "HH:MM:SS"
    let horaVencimento: any = null;
    if (taskForm.hora_vencimento && taskForm.hora_vencimento.trim()) {
      horaVencimento = taskForm.hora_vencimento.trim();
    }

    const { error } = await supabase.from("crm_tasks").insert({
      titulo: taskForm.titulo,
      descricao: taskForm.descricao || "",
      deal_id: id,
      data_vencimento: dataVencimento,
      hora_vencimento: horaVencimento,
      responsavel_id: user.id,
      tipo: taskForm.tipo || null,
    } as any);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tarefa criada!" });
      setShowTaskForm(false);
      setTaskForm({ titulo: "", descricao: "", data_vencimento: "", hora_vencimento: "", tipo: "" });
      fetchAll();
    }
    setTaskLoading(false);
  };

  const handleTaskImageUpload = async (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    for (const file of Array.from(e.target.files)) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${taskId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("task-images").upload(path, file);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); continue; }
      const { data: urlData } = supabase.storage.from("task-images").getPublicUrl(path);
      await supabase.from("crm_task_images").insert({ task_id: taskId, image_url: urlData.publicUrl, nome_arquivo: file.name });
    }
    fetchAll();
    e.target.value = "";
  };

  const deleteDeal = async () => {
    if (!id) return;
    await supabase.from("crm_deals").delete().eq("id", id);
    toast({ title: "Negociação excluída" });
    navigate("/negociacoes");
  };

  const deleteTask = async (taskId: string) => {
    await supabase.from("crm_tasks").delete().eq("id", taskId);
    fetchAll();
  };

  const createAnotacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !anotacaoTexto.trim()) return;
    setAnotacaoLoading(true);
    const { error } = await supabase.from("crm_deal_anotacoes").insert({
      deal_id: id,
      user_id: user.id,
      texto: anotacaoTexto.trim(),
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setAnotacaoTexto("");
      fetchAll();
    }
    setAnotacaoLoading(false);
  };

  const deleteAnotacao = async (anotacaoId: string) => {
    await supabase.from("crm_deal_anotacoes").delete().eq("id", anotacaoId);
    setAnotacoes((prev) => prev.filter((a) => a.id !== anotacaoId));
  };

  if (loading) return <AppLayout><div className="text-center text-muted-foreground py-12">Carregando...</div></AppLayout>;
  if (!deal) return <AppLayout><div className="text-center text-muted-foreground py-12">Negociação não encontrada</div></AppLayout>;

  const isOverdue = (t: Task) => t.data_vencimento && !t.concluida && new Date(t.data_vencimento) < new Date();

  // Filtrar tarefas
  const filteredTasks = useMemo(() => {
    if (taskFilter === "pendentes") return tasks.filter((t) => !t.concluida);
    if (taskFilter === "concluidas") return tasks.filter((t) => t.concluida);
    return tasks;
  }, [tasks, taskFilter]);

  const isFinal = deal.status === "vendido" || deal.status === "perdido";

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/negociacoes")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold tracking-tight">{deal.cliente_nome}</h1>
            <p className="text-sm text-muted-foreground">Criado em {new Date(deal.created_at).toLocaleDateString("pt-BR")}</p>
          </div>
          <Badge className={cn("text-xs", QUAL_COLORS[deal.qualificacao])}>{deal.qualificacao}</Badge>
          {isFinal && (
            <Badge variant={deal.status === "vendido" ? "default" : "destructive"} className="text-xs">
              {deal.status === "vendido" ? "✅ Vendido" : "❌ Perdido"}
            </Badge>
          )}
          {isAdmin && (
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setShowDeleteDealDialog(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Status + Action buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {!isFinal && (
            <>
              <Select value={deal.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[200px] h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KANBAN_COLUMNS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="destructive" size="sm" onClick={openLossDialog}>
                <XCircle className="h-4 w-4 mr-1" /> Perda
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleMarkSold}>
                <Trophy className="h-4 w-4 mr-1" /> Vendido
              </Button>
            </>
          )}
          {isFinal && (
            <Button variant="outline" size="sm" onClick={handleUndoFinal} className="text-xs">
              ↩️ Desfazer {deal.status === "vendido" ? "Venda" : "Perda"}
            </Button>
          )}
        </div>

        {/* Editable basic fields + auto qualification */}
        <DealBasicEditor
          deal={deal}
          phones={phones}
          autoInteresse={deal.auto_interesse}
          autoRendaFamiliar={deal.auto_renda_familiar}
          autoValorEntrada={deal.auto_valor_entrada}
          onSave={fetchAll}
        />

        {/* Proposal Form - always visible */}
        <DealProposalForm
          dealId={deal.id}
          initialData={{
            numero_lote: deal.numero_lote,
            preco_lote: deal.preco_lote,
            forma_pagamento: deal.forma_pagamento,
            link_contrato: deal.link_contrato,
            versao_tabela: deal.versao_tabela,
            interesse: deal.interesse || deal.auto_interesse,
            satisfacao_atendimento: deal.satisfacao_atendimento,
            satisfacao_produto: deal.satisfacao_produto,
            responsavel_venda_user_id: deal.responsavel_venda_user_id,
            responsavel_venda_corretor_id: deal.responsavel_venda_corretor_id,
            valor_entrada: deal.valor_entrada ?? deal.auto_valor_entrada,
            data_nascimento: deal.data_nascimento,
            escolaridade: deal.escolaridade,
            estado_civil: deal.estado_civil,
            sexo: deal.sexo,
            nacionalidade: deal.nacionalidade,
            cidade_cliente: deal.cidade_cliente,
            logradouro: deal.logradouro,
            numero_logradouro: deal.numero_logradouro,
            tipo_residencia: deal.tipo_residencia,
            renda_familiar: deal.renda_familiar || deal.auto_renda_familiar,
            filhos: deal.filhos,
            interesses_pessoais: deal.interesses_pessoais,
          }}
          onSave={fetchAll}
        />

        {/* Tasks */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold">Tarefas ({filteredTasks.length})</CardTitle>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={taskFilter === "todas" ? "default" : "outline"}
                  onClick={() => setTaskFilter("todas")}
                  className="text-xs px-2 h-7"
                >
                  Todas
                </Button>
                <Button
                  size="sm"
                  variant={taskFilter === "pendentes" ? "default" : "outline"}
                  onClick={() => setTaskFilter("pendentes")}
                  className="text-xs px-2 h-7"
                >
                  Pendentes
                </Button>
                <Button
                  size="sm"
                  variant={taskFilter === "concluidas" ? "default" : "outline"}
                  onClick={() => setTaskFilter("concluidas")}
                  className="text-xs px-2 h-7"
                >
                  Concluídas
                </Button>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setShowTaskForm(true)}><Plus className="h-4 w-4 mr-1" /> Nova tarefa</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {filteredTasks.map((task) => (
              <div key={task.id} className={cn("flex items-start gap-3 p-3 rounded-md border transition-colors", task.concluida && "opacity-50")}>
                <button onClick={() => toggleTask(task)} className="mt-0.5 flex-shrink-0">
                  {task.concluida ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={cn("font-medium text-sm", task.concluida && "line-through")}>{task.titulo}</p>
                    {(task as any).tipo && (() => {
                      const cfg = TIPO_CONFIG[(task as any).tipo];
                      const Icon = cfg?.icon;
                      return (
                        <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full", cfg?.color ?? "bg-muted text-muted-foreground")}>
                          {Icon && <Icon className="h-3 w-3" />}{(task as any).tipo}
                        </span>
                      );
                    })()}
                  </div>
                  {task.descricao && <p className="text-xs text-muted-foreground mt-0.5">{task.descricao}</p>}
                  {task.data_vencimento && (
                    <span className={cn("text-xs flex items-center gap-1 mt-1", isOverdue(task) ? "text-destructive" : "text-muted-foreground")}>
                      <Calendar className="h-3 w-3" /> {new Date(task.data_vencimento).toLocaleDateString("pt-BR")}
                      {task.hora_vencimento && <span className="ml-1">às {task.hora_vencimento}</span>}
                    </span>
                  )}
                </div>
                <label className="cursor-pointer p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground flex-shrink-0">
                  <Upload className="h-4 w-4" />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleTaskImageUpload(task.id, e)} />
                </label>
                {isAdmin && (
                  <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex-shrink-0 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-6 border border-dashed rounded-md">
                {tasks.length === 0 ? "Nenhuma tarefa criada" : `Nenhuma tarefa ${taskFilter === "concluidas" ? "concluída" : "pendente"}`}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Image Gallery */}
        <DealGallery dealId={deal.id} taskImages={taskImages} dealImages={dealImages} onRefresh={fetchAll} />

        {/* Anotações */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-muted-foreground" />
              Anotações ({anotacoes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Input de nova anotação */}
            <form onSubmit={createAnotacao} className="flex gap-2 items-end">
              <Textarea
                value={anotacaoTexto}
                onChange={(e) => setAnotacaoTexto(e.target.value)}
                placeholder="Escreva uma anotação..."
                rows={2}
                className="flex-1 resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    createAnotacao(e as any);
                  }
                }}
              />
              <Button type="submit" size="sm" disabled={anotacaoLoading || !anotacaoTexto.trim()} className="flex-shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>

            {/* Lista de anotações */}
            {anotacoes.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-6 border border-dashed rounded-md">
                Nenhuma anotação ainda
              </div>
            ) : (
              <div className="space-y-3">
                {anotacoes.map((a) => (
                  <div key={a.id} className="group flex gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
                    {/* Avatar inicial */}
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary uppercase">
                      {(a.user_nome ?? "U").charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold text-foreground">{a.user_nome ?? "Usuário"}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(a.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                          {" às "}
                          {new Date(a.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{a.texto}</p>
                    </div>
                    {/* Deletar — próprio usuário ou admin */}
                    {(isAdmin || a.user_id === user?.id) && (
                      <button
                        onClick={() => deleteAnotacao(a.id)}
                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground">Ctrl+Enter para enviar</p>
          </CardContent>
        </Card>
      </div>

      {/* New Task Dialog */}
      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-display">Nova Tarefa</DialogTitle></DialogHeader>
          <form onSubmit={createTask} className="space-y-4">
            <div className="space-y-2"><Label>Título *</Label><Input value={taskForm.titulo} onChange={(e) => setTaskForm((f) => ({ ...f, titulo: e.target.value }))} required /></div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={taskForm.tipo || "__none__"} onValueChange={(v) => setTaskForm((f) => ({ ...f, tipo: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sem tipo</SelectItem>
                  {TASK_TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={taskForm.descricao} onChange={(e) => setTaskForm((f) => ({ ...f, descricao: e.target.value }))} rows={3} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2"><Label>Data de Vencimento</Label><Input type="date" value={taskForm.data_vencimento} onChange={(e) => setTaskForm((f) => ({ ...f, data_vencimento: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Hora (opcional)</Label><Input type="time" value={taskForm.hora_vencimento} onChange={(e) => setTaskForm((f) => ({ ...f, hora_vencimento: e.target.value }))} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowTaskForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={taskLoading}>{taskLoading ? "Criando..." : "Criar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Deal Dialog */}
      <AlertDialog open={showDeleteDealDialog} onOpenChange={setShowDeleteDealDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir negociação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deal?.cliente_nome}</strong>? Esta ação não pode ser desfeita e irá remover todos os dados vinculados (telefones, tarefas e imagens).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteDeal} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Loss Reason Dialog */}
      <Dialog open={showLossDialog} onOpenChange={setShowLossDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-display">Motivo da Perda</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Selecione o motivo pelo qual esta negociação foi perdida:</p>
            <Select value={selectedMotivo} onValueChange={setSelectedMotivo}>
              <SelectTrigger><SelectValue placeholder="Selecione o motivo" /></SelectTrigger>
              <SelectContent>
                {motivosPerda.map((m) => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLossDialog(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={confirmLoss} disabled={!selectedMotivo}>Confirmar Perda</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
