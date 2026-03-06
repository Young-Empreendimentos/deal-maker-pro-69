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
import { Plus, Calendar, CheckCircle2, Circle, Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  deal_id: string;
  titulo: string;
  descricao: string;
  data_vencimento: string | null;
  concluida: boolean;
  responsavel_id: string;
  created_at: string;
  deal_nome?: string;
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"todas" | "pendentes" | "concluidas">("pendentes");

  // Form state
  const [form, setForm] = useState({ titulo: "", descricao: "", deal_id: "", data_vencimento: "" });
  const [formLoading, setFormLoading] = useState(false);

  // Image viewer
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskImages, setTaskImages] = useState<TaskImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchTasks = async () => {
    const { data: tasksData } = await supabase
      .from("crm_tasks")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: dealsData } = await supabase
      .from("crm_deals")
      .select("id, cliente_nome");

    setDeals((dealsData as Deal[]) ?? []);

    const dealsMap = new Map((dealsData ?? []).map((d: any) => [d.id, d.cliente_nome]));
    const enriched = ((tasksData as Task[]) ?? []).map((t) => ({
      ...t,
      deal_nome: dealsMap.get(t.deal_id) ?? "—",
    }));
    setTasks(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormLoading(true);

    const { error } = await supabase.from("crm_tasks").insert({
      titulo: form.titulo,
      descricao: form.descricao || "",
      deal_id: form.deal_id,
      data_vencimento: form.data_vencimento || null,
      responsavel_id: user.id,
    });

    if (error) {
      toast({ title: "Erro ao criar tarefa", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tarefa criada!" });
      setShowForm(false);
      setForm({ titulo: "", descricao: "", deal_id: "", data_vencimento: "" });
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

  const deleteImage = async (imageId: string) => {
    await supabase.from("crm_task_images").delete().eq("id", imageId);
    setTaskImages((prev) => prev.filter((i) => i.id !== imageId));
  };

  const filtered = tasks.filter((t) => {
    if (filter === "pendentes") return !t.concluida;
    if (filter === "concluidas") return t.concluida;
    return true;
  });

  const isOverdue = (t: Task) => t.data_vencimento && !t.concluida && new Date(t.data_vencimento) < new Date();

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
                      {isOverdue(task) && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Atrasada</Badge>}
                    </div>
                    {task.descricao && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.descricao}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>📋 {task.deal_nome}</span>
                      {task.data_vencimento && (
                        <span className={cn("flex items-center gap-1", isOverdue(task) && "text-destructive")}>
                          <Calendar className="h-3 w-3" />
                          {new Date(task.data_vencimento).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => openTaskImages(task)} className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                    <ImageIcon className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <div className="text-center text-muted-foreground py-12 border border-dashed rounded-lg">
                Nenhuma tarefa encontrada
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Negociação *</Label>
                <Select value={form.deal_id} onValueChange={(v) => setForm((f) => ({ ...f, deal_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {deals.map((d) => <SelectItem key={d.id} value={d.id}>{d.cliente_nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Vencimento</Label>
                <Input type="date" value={form.data_vencimento} onChange={(e) => setForm((f) => ({ ...f, data_vencimento: e.target.value }))} />
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
