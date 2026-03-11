import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/crm/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, CheckCircle2, Circle, Calendar, Phone, Mail, Image as ImageIcon, Upload, XCircle, Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { KANBAN_COLUMNS, QUAL_COLORS } from "./Negociacoes";
import { DealProposalForm, isProposalComplete } from "@/components/crm/DealProposalForm";

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
  // Proposal fields
  numero_lote: string | null;
  preco_lote: number | null;
  forma_pagamento: string | null;
  link_contrato: string | null;
  versao_tabela: string | null;
  interesse: string | null;
  satisfacao_atendimento: number | null;
  satisfacao_produto: number | null;
  responsavel_venda_user_id: string | null;
  responsavel_venda_imobiliaria_id: string | null;
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
};

type DealPhone = { id: string; telefone: string };
type Task = { id: string; titulo: string; descricao: string; data_vencimento: string | null; concluida: boolean; created_at: string };
type TaskImage = { id: string; task_id: string; image_url: string; nome_arquivo: string; uploaded_at: string; task_titulo?: string };

const PROPOSAL_STAGE_INDEX = KANBAN_COLUMNS.findIndex((c) => c.value === "proposta_recebida");
const ALL_STATUSES = [
  ...KANBAN_COLUMNS,
  { value: "vendido", label: "Vendido" },
  { value: "perdido", label: "Perdido" },
];

export default function NegociacaoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [phones, setPhones] = useState<DealPhone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allImages, setAllImages] = useState<TaskImage[]>([]);
  const [empNome, setEmpNome] = useState("");
  const [fonteNome, setFonteNome] = useState("");
  const [loading, setLoading] = useState(true);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ titulo: "", descricao: "", data_vencimento: "" });
  const [taskLoading, setTaskLoading] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);

  const fetchAll = async () => {
    if (!id) return;

    const [dealRes, phonesRes, tasksRes] = await Promise.all([
      supabase.from("crm_deals").select("*").eq("id", id).single(),
      supabase.from("crm_deal_phones").select("*").eq("deal_id", id),
      supabase.from("crm_tasks").select("*").eq("deal_id", id).order("created_at", { ascending: false }),
    ]);

    const dealData = dealRes.data as DealDetail | null;
    setDeal(dealData);
    setPhones((phonesRes.data as DealPhone[]) ?? []);
    const tasksData = (tasksRes.data as Task[]) ?? [];
    setTasks(tasksData);

    if (dealData?.empreendimento_id) {
      const { data } = await supabase.from("crm_empreendimentos").select("nome").eq("id", dealData.empreendimento_id).single();
      setEmpNome(data?.nome ?? "");
    }
    if (dealData?.fonte_id) {
      const { data } = await supabase.from("crm_fontes_lead").select("nome").eq("id", dealData.fonte_id).single();
      setFonteNome(data?.nome ?? "");
    }

    if (tasksData.length > 0) {
      const taskIds = tasksData.map((t) => t.id);
      const { data: imgs } = await supabase.from("crm_task_images").select("*").in("task_id", taskIds).order("uploaded_at", { ascending: false });
      const tasksMap = new Map(tasksData.map((t) => [t.id, t.titulo]));
      setAllImages(((imgs as TaskImage[]) ?? []).map((img) => ({ ...img, task_titulo: tasksMap.get(img.task_id) ?? "" })));
    } else {
      setAllImages([]);
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
    if (!deal) return;
    const { complete, missing } = isProposalComplete(deal);
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
  };

  const handleMarkLost = async () => {
    if (!deal) return;
    await handleStatusChange("perdido");
    toast({ title: "Negociação marcada como perdida" });
  };

  const toggleTask = async (task: Task) => {
    await supabase.from("crm_tasks").update({ concluida: !task.concluida }).eq("id", task.id);
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, concluida: !t.concluida } : t));
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    setTaskLoading(true);
    const { error } = await supabase.from("crm_tasks").insert({
      titulo: taskForm.titulo,
      descricao: taskForm.descricao || "",
      deal_id: id,
      data_vencimento: taskForm.data_vencimento || null,
      responsavel_id: user.id,
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tarefa criada!" });
      setShowTaskForm(false);
      setTaskForm({ titulo: "", descricao: "", data_vencimento: "" });
      fetchAll();
    }
    setTaskLoading(false);
  };

  const handleImageUpload = async (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
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

  if (loading) return <AppLayout><div className="text-center text-muted-foreground py-12">Carregando...</div></AppLayout>;
  if (!deal) return <AppLayout><div className="text-center text-muted-foreground py-12">Negociação não encontrada</div></AppLayout>;

  const isOverdue = (t: Task) => t.data_vencimento && !t.concluida && new Date(t.data_vencimento) < new Date();
  const currentStageIndex = KANBAN_COLUMNS.findIndex((c) => c.value === deal.status);
  const showProposalForm = currentStageIndex >= PROPOSAL_STAGE_INDEX || deal.status === "vendido";
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
        </div>

        {/* Action buttons */}
        {!isFinal && (
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={handleMarkLost}>
              <XCircle className="h-4 w-4 mr-1" /> Perda
            </Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleMarkSold}>
              <Trophy className="h-4 w-4 mr-1" /> Vendido
            </Button>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Informações</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                {isFinal ? (
                  <Badge variant={deal.status === "vendido" ? "default" : "destructive"} className="capitalize text-xs">{deal.status}</Badge>
                ) : (
                  <Select value={deal.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {KANBAN_COLUMNS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {empNome && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Empreendimento</span>
                  <span className="font-medium">{empNome}</span>
                </div>
              )}
              {fonteNome && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fonte</span>
                  <span className="font-medium">{fonteNome}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Contato</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {deal.cliente_email && (
                <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> <span>{deal.cliente_email}</span></div>
              )}
              {phones.map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> <span>{p.telefone}</span></div>
              ))}
              {!deal.cliente_email && phones.length === 0 && <p className="text-muted-foreground text-xs">Nenhum contato cadastrado</p>}
            </CardContent>
          </Card>
        </div>

        {/* Proposal Form - only visible from proposta_recebida stage */}
        {showProposalForm && (
          <DealProposalForm
            dealId={deal.id}
            initialData={{
              numero_lote: deal.numero_lote,
              preco_lote: deal.preco_lote,
              forma_pagamento: deal.forma_pagamento,
              link_contrato: deal.link_contrato,
              versao_tabela: deal.versao_tabela,
              interesse: deal.interesse,
              satisfacao_atendimento: deal.satisfacao_atendimento,
              satisfacao_produto: deal.satisfacao_produto,
              responsavel_venda_user_id: deal.responsavel_venda_user_id,
              responsavel_venda_imobiliaria_id: deal.responsavel_venda_imobiliaria_id,
              valor_entrada: deal.valor_entrada,
              data_nascimento: deal.data_nascimento,
              escolaridade: deal.escolaridade,
              estado_civil: deal.estado_civil,
              sexo: deal.sexo,
              nacionalidade: deal.nacionalidade,
              cidade_cliente: deal.cidade_cliente,
              logradouro: deal.logradouro,
              numero_logradouro: deal.numero_logradouro,
              tipo_residencia: deal.tipo_residencia,
              renda_familiar: deal.renda_familiar,
              filhos: deal.filhos,
              interesses_pessoais: deal.interesses_pessoais,
            }}
            onSave={fetchAll}
          />
        )}

        {/* Tasks */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Tarefas ({tasks.length})</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowTaskForm(true)}><Plus className="h-4 w-4 mr-1" /> Nova tarefa</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className={cn("flex items-start gap-3 p-3 rounded-md border transition-colors", task.concluida && "opacity-50")}>
                <button onClick={() => toggleTask(task)} className="mt-0.5 flex-shrink-0">
                  {task.concluida ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium text-sm", task.concluida && "line-through")}>{task.titulo}</p>
                  {task.descricao && <p className="text-xs text-muted-foreground mt-0.5">{task.descricao}</p>}
                  {task.data_vencimento && (
                    <span className={cn("text-xs flex items-center gap-1 mt-1", isOverdue(task) ? "text-destructive" : "text-muted-foreground")}>
                      <Calendar className="h-3 w-3" /> {new Date(task.data_vencimento).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
                <label className="cursor-pointer p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground flex-shrink-0">
                  <Upload className="h-4 w-4" />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(task.id, e)} />
                </label>
              </div>
            ))}
            {tasks.length === 0 && <div className="text-center text-muted-foreground text-sm py-6 border border-dashed rounded-md">Nenhuma tarefa criada</div>}
          </CardContent>
        </Card>

        {/* Image Gallery */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Galeria de Imagens ({allImages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {allImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {allImages.map((img) => (
                  <div key={img.id} className="group relative rounded-lg overflow-hidden border cursor-pointer" onClick={() => setViewImage(img.image_url)}>
                    <img src={img.image_url} alt={img.nome_arquivo} className="w-full h-28 object-cover transition-transform group-hover:scale-105" />
                    <div className="p-2 bg-card">
                      <p className="text-[10px] font-medium truncate">{img.nome_arquivo}</p>
                      <p className="text-[10px] text-muted-foreground">{img.task_titulo} · {new Date(img.uploaded_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground text-sm py-6 border border-dashed rounded-md">Nenhuma imagem anexada às tarefas</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Task Dialog */}
      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-display">Nova Tarefa</DialogTitle></DialogHeader>
          <form onSubmit={createTask} className="space-y-4">
            <div className="space-y-2"><Label>Título *</Label><Input value={taskForm.titulo} onChange={(e) => setTaskForm((f) => ({ ...f, titulo: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={taskForm.descricao} onChange={(e) => setTaskForm((f) => ({ ...f, descricao: e.target.value }))} rows={3} /></div>
            <div className="space-y-2"><Label>Vencimento</Label><Input type="date" value={taskForm.data_vencimento} onChange={(e) => setTaskForm((f) => ({ ...f, data_vencimento: e.target.value }))} /></div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowTaskForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={taskLoading}>{taskLoading ? "Criando..." : "Criar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      <Dialog open={!!viewImage} onOpenChange={(open) => !open && setViewImage(null)}>
        <DialogContent className="sm:max-w-2xl p-2">
          {viewImage && <img src={viewImage} alt="" className="w-full rounded-md" />}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
