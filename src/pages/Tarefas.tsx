import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/crm/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Calendar, CheckCircle2, Circle, Upload, X, Image as ImageIcon, Trash2, Phone, Mail, MapPin, MessageCircle, Users as UsersIcon, RotateCcw, Pencil } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { fetchAllPaged } from "@/lib/supabasePagination";

export const TASK_TIPOS = ["Ligação", "E-mail", "Visita", "Whatsapp", "Reunião"] as const;
export type TaskTipo = typeof TASK_TIPOS[number];

export const TIPO_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  "Ligação":  { icon: Phone,          color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  "E-mail":   { icon: Mail,           color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  "Visita":   { icon: MapPin,         color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  "Whatsapp": { icon: MessageCircle,  color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  "Reunião":  { icon: UsersIcon,      color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
};

type Task = {
  id: string;
  deal_id: string;
  titulo: string;
  descricao: string;
  data_vencimento: string | null;
  hora_vencimento: string | null;
  concluida: boolean;
  responsavel_id: string;
  tipo: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deal_nome?: string;
  responsavel_nome?: string;
};

type Deal = { id: string; cliente_nome: string };

type TaskImage = {
  id: string;
  task_id: string;
  image_url: string;
  nome_arquivo: string;
  uploaded_at: string;
};

export default function Tarefas() {
  const { user, isAdmin } = useAuth();

  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"todas" | "pendentes" | "concluidas" | "deletadas">("pendentes");

  // Form state
  const [form, setForm] = useState({ titulo: "", descricao: "", deal_id: "", data_vencimento: "", hora_vencimento: "", tipo: "" });
  const [formLoading, setFormLoading] = useState(false);

  // Inline date edit
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editHora, setEditHora] = useState("");

  const startEditDate = (task: Task) => {
    setEditingTaskId(task.id);
    setEditDate(task.data_vencimento ?? "");
    setEditHora(task.hora_vencimento ?? "");
  };

  const saveDate = async () => {
    if (!editingTaskId) return;
    const { error } = await supabase.from("crm_tasks").update({
      data_vencimento: editDate || null,
      hora_vencimento: editHora || null,
    }).eq("id", editingTaskId);
    if (error) {
      toast({ title: "Erro ao salvar data", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Data atualizada!" });
      setEditingTaskId(null);
      fetchTasks();
    }
  };

  // Image viewer
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskImages, setTaskImages] = useState<TaskImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchTasks = async () => {
    // Deals: admins veem todos; usuários comuns só os seus
    let dealsQuery = supabase.from("crm_deals").select("id, cliente_nome").order("cliente_nome");
    if (!isAdmin && user) {
      dealsQuery = dealsQuery.eq("responsavel_id", user.id);
    }
    const { data: dealsData } = await dealsQuery;
    setDeals((dealsData as Deal[]) ?? []);

    // Tarefas: admins veem todas; usuários comuns só as dos seus negócios.
    // Paginamos manualmente porque o Supabase limita 1000 linhas por request.
    const dealIdsParaUsuario: string[] | null = !isAdmin && user
      ? ((dealsData as Deal[]) ?? []).map((d) => d.id)
      : null;
    if (dealIdsParaUsuario && dealIdsParaUsuario.length === 0) {
      setTasks([]);
      setLoading(false);
      return;
    }
    // Paginação manual (Supabase limita 1000 por request)
    const rawTasksData = await fetchAllPaged<any>((from, to) => {
      let q = supabase.from("crm_tasks").select("*")
        .order("created_at", { ascending: false })
        .range(from, to);
      if (dealIdsParaUsuario) q = q.in("deal_id", dealIdsParaUsuario);
      return q;
    });

    // Buscar nomes das negociações e responsáveis a partir das tarefas
    const rawList = rawTasksData;
    let dealsMap = new Map((dealsData ?? []).map((d: any) => [d.id, d.cliente_nome]));
    let profileMap = new Map<string, string>();

    if (rawList.length > 0) {
      // Buscar nomes de deals que faltam no dealsMap
      const missingDealIds = [...new Set(rawList.map((t) => t.deal_id).filter((id: string) => id && !dealsMap.has(id)))];
      if (missingDealIds.length > 0) {
        const { data: extraDeals } = await supabase.from("crm_deals").select("id, cliente_nome").in("id", missingDealIds);
        ((extraDeals as any[]) ?? []).forEach((d) => dealsMap.set(d.id, d.cliente_nome));
      }

      // Buscar nomes dos responsáveis
      const responsavelIds = [...new Set(rawList.map((t) => t.responsavel_id).filter(Boolean))];
      if (responsavelIds.length > 0) {
        const { data: profiles } = await supabase.from("user_profiles").select("user_id, nome").in("user_id", responsavelIds);
        profileMap = new Map(((profiles as any[]) ?? []).map((p) => [p.user_id, p.nome]));
      }
    }

    // Enriquecer com nome da negociação e responsável
    const enriched = rawList.map((t: any) => ({
      ...t,
      deal_nome: dealsMap.get(t.deal_id) ?? "—",
      responsavel_nome: profileMap.get(t.responsavel_id) ?? "—",
    }));

    setTasks(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, [isAdmin, user?.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormLoading(true);

    // FIX: Input type="date" pode causar problema de timezone
    // Garantir que a data seja enviada como string literal "YYYY-MM-DD" sem conversão
    let dataVencimento: any = null;
    if (form.data_vencimento && form.data_vencimento.trim()) {
      dataVencimento = form.data_vencimento.trim();
    }

    // Hora de vencimento como string "HH:MM"
    let horaVencimento: any = null;
    if (form.hora_vencimento && form.hora_vencimento.trim()) {
      horaVencimento = form.hora_vencimento.trim();
    }

    const { error } = await supabase.from("crm_tasks").insert({
      titulo: form.titulo,
      descricao: form.descricao || "",
      deal_id: form.deal_id,
      data_vencimento: dataVencimento,
      hora_vencimento: horaVencimento,
      responsavel_id: user.id,
      tipo: form.tipo || null,
    } as any);

    if (error) {
      toast({ title: "Erro ao criar tarefa", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tarefa criada!" });
      setShowForm(false);
      setForm({ titulo: "", descricao: "", deal_id: "", data_vencimento: "", hora_vencimento: "", tipo: "" });
      fetchTasks();
    }
    setFormLoading(false);
  };

  const toggleConcluida = async (task: Task) => {
    await supabase.from("crm_tasks").update({ concluida: !task.concluida }).eq("id", task.id);
    fetchTasks();
  };

  const openTaskImages = async (task: Task) => {
    setSelectedTask(task);
    const { data } = await supabase
      .from("crm_task_images")
      .select("*")
      .eq("task_id", task.id)
      .order("uploaded_at", { ascending: false });
    setTaskImages((data as TaskImage[]) ?? []);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedTask || !user) return;
    setUploading(true);

    for (const file of Array.from(e.target.files)) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${selectedTask.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from("task-images").upload(path, file);
      if (uploadError) {
        toast({ title: "Erro no upload", description: uploadError.message, variant: "destructive" });
        continue;
      }

      const { data: urlData } = supabase.storage.from("task-images").getPublicUrl(path);

      await supabase.from("crm_task_images").insert({
        task_id: selectedTask.id,
        image_url: urlData.publicUrl,
        nome_arquivo: file.name,
      });
    }

    // Refresh images
    const { data } = await supabase
      .from("crm_task_images")
      .select("*")
      .eq("task_id", selectedTask.id)
      .order("uploaded_at", { ascending: false });
    setTaskImages((data as TaskImage[]) ?? []);
    setUploading(false);
    e.target.value = "";
  };

  const deleteTask = async (taskId: string) => {
    // Soft delete - marca como deletada em vez de deletar do banco
    await supabase.from("crm_tasks").update({ deleted_at: new Date().toISOString() }).eq("id", taskId);
    toast({ title: "Tarefa excluída" });
    fetchTasks();
  };

  const restoreTask = async (taskId: string) => {
    // Restaurar tarefa deletada
    await supabase.from("crm_tasks").update({ deleted_at: null }).eq("id", taskId);
    toast({ title: "Tarefa restaurada" });
    fetchTasks();
  };

  const deleteImage = async (imageId: string) => {
    await supabase.from("crm_task_images").delete().eq("id", imageId);
    setTaskImages((prev) => prev.filter((i) => i.id !== imageId));
  };

  const filtered = tasks.filter((t) => {
    if (filter === "deletadas") return t.deleted_at !== null;
    if (filter === "pendentes") return !t.concluida && t.deleted_at === null;
    if (filter === "concluidas") return t.concluida && t.deleted_at === null;
    return t.deleted_at === null; // "todas" — somente ativas
  });

  const parseLocalDate = (s: string) => new Date(s + "T00:00:00");
  const isOverdue = (t: Task) => {
    if (!t.data_vencimento || t.concluida) return false;
    const agora = new Date();
    // Com hora definida: atrasada se já passou do dia + hora
    if (t.hora_vencimento) return new Date(`${t.data_vencimento}T${t.hora_vencimento}`) < agora;
    // Só data: o dia inteiro é prazo — atrasada apenas se venceu antes de hoje
    const hoje = new Date(agora); hoje.setHours(0, 0, 0, 0);
    return parseLocalDate(t.data_vencimento) < hoje;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Tarefas</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} tarefas</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendentes">Pendentes</SelectItem>
                <SelectItem value="concluidas">Concluídas</SelectItem>
                <SelectItem value="todas">Todas</SelectItem>
                {isAdmin && <SelectItem value="deletadas">Deletadas</SelectItem>}
              </SelectContent>
            </Select>
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Nova
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Carregando...</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((task) => (
              <Card key={task.id} className={cn("border transition-colors", task.concluida && "opacity-60")}>
                <CardContent className="p-4 flex items-start gap-3">
                  <button onClick={() => toggleConcluida(task)} className="mt-0.5 flex-shrink-0">
                    {task.concluida ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={cn("font-medium text-sm", task.concluida && "line-through")}>{task.titulo}</p>
                      {task.tipo && (() => {
                        const cfg = TIPO_CONFIG[task.tipo];
                        const Icon = cfg?.icon;
                        return (
                          <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full", cfg?.color ?? "bg-muted text-muted-foreground")}>
                            {Icon && <Icon className="h-3 w-3" />}{task.tipo}
                          </span>
                        );
                      })()}
                      {isOverdue(task) && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Atrasada</Badge>}
                    </div>
                    {task.descricao && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.descricao}</p>}
                    <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-muted-foreground">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-medium">
                        {task.deal_nome}
                      </span>
                      {task.responsavel_nome && task.responsavel_nome !== "—" && (
                        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-medium">
                          {task.responsavel_nome}
                        </span>
                      )}
                      <Popover open={editingTaskId === task.id} onOpenChange={(open) => { if (!open) setEditingTaskId(null); }}>
                        <PopoverTrigger asChild>
                          <button
                            onClick={(e) => { e.stopPropagation(); startEditDate(task); }}
                            className={cn("flex items-center gap-1 hover:underline", task.data_vencimento && isOverdue(task) ? "text-destructive" : "text-muted-foreground")}
                          >
                            <Calendar className="h-3 w-3" />
                            {task.data_vencimento
                              ? <>
                                  {parseLocalDate(task.data_vencimento).toLocaleDateString("pt-BR")}
                                  {task.hora_vencimento && <span className="ml-1">às {task.hora_vencimento}</span>}
                                </>
                              : <span className="italic">Sem data</span>
                            }
                            <Pencil className="h-2.5 w-2.5 ml-0.5 opacity-50" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                          <div className="space-y-1">
                            <Label className="text-xs">Data</Label>
                            <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="h-8 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Hora</Label>
                            <Input type="time" value={editHora} onChange={(e) => setEditHora(e.target.value)} className="h-8 text-sm" />
                          </div>
                          <Button size="sm" className="w-full h-7 text-xs" onClick={saveDate}>Salvar</Button>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  {task.deleted_at === null && (
                    <button onClick={() => openTaskImages(task)} className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                      <ImageIcon className="h-4 w-4" />
                    </button>
                  )}
                  {isAdmin && (
                    task.deleted_at === null ? (
                      <button onClick={() => deleteTask(task.id)} className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <button onClick={() => restoreTask(task.id)} className="p-2 rounded-md hover:bg-success/10 text-muted-foreground hover:text-success transition-colors flex-shrink-0">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )
                  )}
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <div className="text-center text-muted-foreground py-12 border border-dashed rounded-lg">
                {tasks.length === 0
                  ? "Nenhuma tarefa criada"
                  : filter === "deletadas"
                    ? "Nenhuma tarefa deletada"
                    : filter === "concluidas"
                      ? "Nenhuma tarefa concluída"
                      : "Nenhuma tarefa pendente"
                }
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Nova Tarefa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.tipo || "__none__"} onValueChange={(v) => setForm((f) => ({ ...f, tipo: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sem tipo</SelectItem>
                  {TASK_TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Negociação *</Label>
              <Select value={form.deal_id} onValueChange={(v) => setForm((f) => ({ ...f, deal_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {deals.map((d) => <SelectItem key={d.id} value={d.id}>{d.cliente_nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data de Vencimento</Label>
                <Input type="date" value={form.data_vencimento} onChange={(e) => setForm((f) => ({ ...f, data_vencimento: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Hora (opcional)</Label>
                <Input type="time" value={form.hora_vencimento} onChange={(e) => setForm((f) => ({ ...f, hora_vencimento: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={formLoading || !form.deal_id}>{formLoading ? "Criando..." : "Criar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task Images Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Imagens — {selectedTask?.titulo}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
                <Upload className="h-4 w-4" />
                {uploading ? "Enviando..." : "Anexar imagens"}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
            {taskImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                {taskImages.map((img) => (
                  <div key={img.id} className="relative group rounded-md overflow-hidden border">
                    <img src={img.image_url} alt={img.nome_arquivo} className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => deleteImage(img.id)} className="p-1 bg-destructive rounded-full text-destructive-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-1.5">
                      <p className="text-[10px] text-muted-foreground truncate">{img.nome_arquivo}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(img.uploaded_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground text-sm py-8 border border-dashed rounded-md">
                Nenhuma imagem anexada
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
