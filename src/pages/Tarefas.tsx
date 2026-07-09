import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Plus, Calendar, CheckCircle2, Circle, Upload, X, Image as ImageIcon, Trash2, Phone, Mail, MapPin, MessageCircle, Users as UsersIcon, RotateCcw, Pencil, Pin } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRangeFilter, type DateRange } from "@/components/crm/DateRangeFilter";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { fetchAllPaged } from "@/lib/supabasePagination";
import { isTaskOverdue } from "@/lib/taskOverdue";

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
  fixado?: boolean;
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
  const navigate = useNavigate();

  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  // Busca de cliente (combobox) no formulário de nova tarefa
  const [dealSearch, setDealSearch] = useState("");
  const [dealResults, setDealResults] = useState<Deal[]>([]);
  const [dealSearchLoading, setDealSearchLoading] = useState(false);
  const [selectedDealNome, setSelectedDealNome] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"todas" | "pendentes" | "concluidas" | "deletadas">("pendentes");
  const [fDataVenc, setFDataVenc] = useState<DateRange>({ from: "", to: "" });

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

  const togglePin = async (task: Task) => {
    const novo = !task.fixado;
    const { error } = await supabase.from("crm_tasks").update({ fixado: novo } as any).eq("id", task.id);
    if (error) { toast({ title: "Erro ao fixar", description: error.message, variant: "destructive" }); return; }
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, fixado: novo } : t)));
  };

  // Edição completa da tarefa (título, descrição, tipo, data, hora)
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState({ titulo: "", descricao: "", tipo: "", data_vencimento: "", hora_vencimento: "" });
  const openEditTask = (task: Task) => {
    setEditTask(task);
    setEditForm({
      titulo: task.titulo,
      descricao: task.descricao ?? "",
      tipo: task.tipo ?? "",
      data_vencimento: task.data_vencimento ?? "",
      hora_vencimento: task.hora_vencimento ?? "",
    });
  };
  const saveTaskEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask) return;
    if (!editForm.titulo.trim()) { toast({ title: "Título é obrigatório", variant: "destructive" }); return; }
    const { error } = await supabase.from("crm_tasks").update({
      titulo: editForm.titulo.trim(),
      descricao: editForm.descricao || "",
      tipo: editForm.tipo || null,
      data_vencimento: editForm.data_vencimento || null,
      hora_vencimento: editForm.hora_vencimento || null,
    } as any).eq("id", editTask.id);
    if (error) { toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Tarefa atualizada!" });
    setEditTask(null);
    fetchTasks();
  };

  // Image viewer
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskImages, setTaskImages] = useState<TaskImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchTasks = async () => {
    // O RLS de crm_tasks já escopa: admin vê todas, usuário comum vê as suas
    // (responsavel_id). O nome do cliente vem EMBUTIDO pela FK numa query só —
    // sem seed de 1000 deals nem resolução de nomes em lotes (era o gargalo).
    const rawTasksData = await fetchAllPaged<any>((from, to) =>
      supabase.from("crm_tasks")
        .select("*, crm_deals(cliente_nome)")
        .order("created_at", { ascending: false })
        .range(from, to)
    );

    // Nomes dos responsáveis (poucos usuários) — uma única consulta
    const responsavelIds = [...new Set(rawTasksData.map((t: any) => t.responsavel_id).filter(Boolean))] as string[];
    let profileMap = new Map<string, string>();
    if (responsavelIds.length > 0) {
      const { data: profiles } = await supabase.from("user_profiles").select("user_id, nome").in("user_id", responsavelIds);
      profileMap = new Map(((profiles as any[]) ?? []).map((p) => [p.user_id, p.nome]));
    }

    const enriched = rawTasksData.map((t: any) => ({
      ...t,
      deal_nome: t.crm_deals?.cliente_nome ?? "—",
      responsavel_nome: profileMap.get(t.responsavel_id) ?? "—",
    }));

    setTasks(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, [isAdmin, user?.id]);

  // Busca de clientes no servidor (debounce) — visibilidade: comum só os seus, admin todos
  useEffect(() => {
    const term = dealSearch.trim();
    if (term.length < 2) { setDealResults([]); setDealSearchLoading(false); return; }
    setDealSearchLoading(true);
    const handle = setTimeout(async () => {
      let q = supabase.from("crm_deals").select("id, cliente_nome")
        .ilike("cliente_nome", `%${term}%`).order("cliente_nome").limit(20);
      if (!isAdmin && user) q = q.eq("responsavel_id", user.id);
      const { data } = await q;
      setDealResults((data as Deal[]) ?? []);
      setDealSearchLoading(false);
    }, 300);
    return () => clearTimeout(handle);
  }, [dealSearch, isAdmin, user?.id]);

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
      setSelectedDealNome(""); setDealSearch(""); setDealResults([]);
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

  // Reduz imagens grandes no navegador antes de enviar (fotos de celular chegam a vários MB
  // e podem travar o upload). Se algo falhar, usa o arquivo original.
  const prepareImage = async (file: File): Promise<Blob> => {
    if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
    try {
      const bitmap = await createImageBitmap(file);
      const MAX = 1600;
      const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
      if (scale >= 1) return file;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.82));
      return blob ?? file;
    } catch {
      return file;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedTask || !user) return;
    const files = Array.from(e.target.files);
    e.target.value = ""; // libera o input pra reselecionar o mesmo arquivo
    setUploading(true);
    try {
      for (const file of files) {
        const blob = await prepareImage(file);
        const ext = blob.type === "image/jpeg" ? "jpg" : (file.name.split(".").pop() || "bin");
        const path = `${user.id}/${selectedTask.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage.from("task-images").upload(path, blob, {
          contentType: blob.type || undefined,
        });
        if (uploadError) {
          toast({ title: "Erro no upload", description: uploadError.message, variant: "destructive" });
          continue;
        }

        const { data: urlData } = supabase.storage.from("task-images").getPublicUrl(path);

        const { error: insertError } = await supabase.from("crm_task_images").insert({
          task_id: selectedTask.id,
          image_url: urlData.publicUrl,
          nome_arquivo: file.name,
        } as any);
        if (insertError) {
          toast({ title: "Erro ao salvar a imagem", description: insertError.message, variant: "destructive" });
        }
      }

      const { data } = await supabase
        .from("crm_task_images")
        .select("*")
        .eq("task_id", selectedTask.id)
        .order("uploaded_at", { ascending: false });
      setTaskImages((data as TaskImage[]) ?? []);
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err?.message ?? "Falha inesperada", variant: "destructive" });
    } finally {
      setUploading(false);
    }
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

  const vencNoIntervalo = (venc: string | null) => {
    if (!fDataVenc.from && !fDataVenc.to) return true;
    if (!venc) return false; // sem data de vencimento não entra quando há filtro de data
    const dv = venc.slice(0, 10);
    if (fDataVenc.from && dv < fDataVenc.from) return false;
    if (fDataVenc.to && dv > fDataVenc.to) return false;
    return true;
  };

  const filtered = tasks.filter((t) => {
    const statusOk =
      filter === "deletadas" ? t.deleted_at !== null
      : filter === "pendentes" ? (!t.concluida && t.deleted_at === null)
      : filter === "concluidas" ? (t.concluida && t.deleted_at === null)
      : t.deleted_at === null; // "todas" — somente ativas
    if (!statusOk) return false;
    return vencNoIntervalo(t.data_vencimento);
  }).sort((a, b) => Number(!!b.fixado) - Number(!!a.fixado));

  const parseLocalDate = (s: string) => new Date(s + "T00:00:00");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Tarefas</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} tarefas</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[190px]">
              <DateRangeFilter label="Vencimento" value={fDataVenc} onChange={setFDataVenc} />
            </div>
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
              <Card key={task.id} className={cn("border transition-colors", task.concluida && "opacity-60", task.fixado && "ring-1 ring-primary/40 border-primary/30")}>
                <CardContent className="p-4 flex items-start gap-3">
                  <button onClick={() => toggleConcluida(task)} className="mt-0.5 flex-shrink-0">
                    {task.concluida ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/negociacoes/${task.deal_id}`)}
                    title="Abrir negociação"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={cn("font-medium text-sm hover:underline", task.concluida && "line-through")}>{task.titulo}</p>
                      {task.tipo && (() => {
                        const cfg = TIPO_CONFIG[task.tipo];
                        const Icon = cfg?.icon;
                        return (
                          <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full", cfg?.color ?? "bg-muted text-muted-foreground")}>
                            {Icon && <Icon className="h-3 w-3" />}{task.tipo}
                          </span>
                        );
                      })()}
                      {isTaskOverdue(task) && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Atrasada</Badge>}
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
                            className={cn("flex items-center gap-1 hover:underline", task.data_vencimento && isTaskOverdue(task) ? "text-destructive" : "text-muted-foreground")}
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
                  {task.deleted_at === null && (
                    <>
                      <button onClick={() => togglePin(task)} title={task.fixado ? "Desafixar" : "Fixar no topo"} className={cn("p-2 rounded-md hover:bg-muted transition-colors flex-shrink-0", task.fixado ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
                        <Pin className={cn("h-4 w-4", task.fixado && "fill-current")} />
                      </button>
                      <button onClick={() => openEditTask(task)} title="Editar tarefa" className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </>
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
              {form.deal_id ? (
                <div className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                  <span className="truncate">{selectedDealNome || "Cliente selecionado"}</span>
                  <button
                    type="button"
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => { setForm((f) => ({ ...f, deal_id: "" })); setSelectedDealNome(""); setDealSearch(""); setDealResults([]); }}
                    aria-label="Trocar cliente"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    value={dealSearch}
                    onChange={(e) => setDealSearch(e.target.value)}
                    placeholder="Digite o nome do cliente"
                    autoComplete="off"
                  />
                  {dealSearch.trim().length >= 2 && (
                    <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border bg-popover shadow-md">
                      {dealSearchLoading ? (
                        <p className="px-3 py-2 text-sm text-muted-foreground">Buscando...</p>
                      ) : dealResults.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum cliente encontrado</p>
                      ) : (
                        dealResults.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                            onClick={() => { setForm((f) => ({ ...f, deal_id: d.id })); setSelectedDealNome(d.cliente_nome); }}
                          >
                            {d.cliente_nome}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
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

      {/* Edit Task Dialog */}
      <Dialog open={!!editTask} onOpenChange={(open) => !open && setEditTask(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Editar Tarefa</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveTaskEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={editForm.titulo} onChange={(e) => setEditForm((f) => ({ ...f, titulo: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={editForm.descricao} onChange={(e) => setEditForm((f) => ({ ...f, descricao: e.target.value }))} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={editForm.tipo || "__none__"} onValueChange={(v) => setEditForm((f) => ({ ...f, tipo: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sem tipo</SelectItem>
                  {TASK_TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data de Vencimento</Label>
                <Input type="date" value={editForm.data_vencimento} onChange={(e) => setEditForm((f) => ({ ...f, data_vencimento: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Hora (opcional)</Label>
                <Input type="time" value={editForm.hora_vencimento} onChange={(e) => setEditForm((f) => ({ ...f, hora_vencimento: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditTask(null)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
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
