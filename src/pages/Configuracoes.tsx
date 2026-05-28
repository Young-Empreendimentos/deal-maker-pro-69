import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/crm/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Check, X, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CidadeCombobox } from "@/components/crm/CidadeCombobox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type FonteLead = { id: string; nome: string; ativo: boolean };
type MotivoPerda = { id: string; nome: string; ativo: boolean };
type Empreendimento = { id: string; nome: string; cidade: string; ativo: boolean };
type EmpreendimentoSigla = { id: string; codigo: string; nome: string };
type Imobiliaria = {
  id: string;
  nome: string;
  contato_nome: string | null;
  telefone: string | null;
  link_social: string | null;
  ativo: boolean;
  // #17 multi-app: visibilidade independente por app Lovable consumidor da tabela.
  ativo_crm: boolean; // Pingolead (este app)
  ativo_nn: boolean;  // Novos Negocios (Perdigueiro Lovable)
};
type UserInfo = { id: string; email: string; role: string; nome: string; created_at: string };
type UserProfile = { user_id: string; nome: string; ativo: boolean };

// Siglas guarda-chuva que não são empreendimentos individuais (vivem em pseudo-grupos
// no padrão canônico Young/RD): SAP = região Santo Antônio da Patrulha, SBY = grupo
// Parque Lorena I+II. Sempre disponíveis no datalist mesmo sem registro em
// crm_empreendimentos.
const SIGLAS_EXTRAS_CANONICAS = ["SAP", "SBY"] as const;

// "SIGLA - Nome" → { sigla, nome }. Imobiliárias legadas (sem prefixo) caem em sigla="".
function parseNomeImobiliaria(full: string): { sigla: string; nome: string } {
  const idx = full.indexOf(" - ");
  if (idx === -1) return { sigla: "", nome: full };
  return { sigla: full.slice(0, idx).trim(), nome: full.slice(idx + 3).trim() };
}
function montarNomeImobiliaria(sigla: string, nome: string): string {
  const s = sigla.trim();
  const n = nome.trim();
  return s ? `${s} - ${n}` : n;
}

function EmpreendimentoForm({ onAdd }: { onAdd: (nome: string, cidade: string) => Promise<boolean> }) {
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo || isSaving) return;
    setIsSaving(true);
    try {
      const created = await onAdd(nomeLimpo, cidade);
      if (created) { setNome(""); setCidade(""); }
    } finally { setIsSaving(false); }
  };

  return (
    <div className="flex gap-2 items-center">
      <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome..." className="flex-1" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void handleAdd(); } }} />
      <CidadeCombobox value={cidade} onSelect={setCidade} className="flex-1 h-10" />
      <Button size="sm" type="button" disabled={!nome.trim() || isSaving} onClick={() => void handleAdd()}><Plus className="h-4 w-4" /></Button>
    </div>
  );
}

function EmpreendimentoRow({ emp, onToggle, onSave }: { emp: Empreendimento; onToggle: () => void; onSave: (nome: string, cidade: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(emp.nome);
  const [cidade, setCidade] = useState(emp.cidade);
  return (
    <TableRow className={!emp.ativo ? "opacity-50" : ""}>
      <TableCell>{editing ? <Input value={nome} onChange={(e) => setNome(e.target.value)} className="h-8 text-sm" /> : <span className="text-sm">{emp.nome}</span>}</TableCell>
      <TableCell>{editing ? <CidadeCombobox value={cidade} onSelect={setCidade} className="h-8 text-sm w-full" /> : <span className="text-sm text-muted-foreground">{emp.cidade || "—"}</span>}</TableCell>
      <TableCell><Switch checked={emp.ativo} onCheckedChange={onToggle} /></TableCell>
      <TableCell>
        {editing ? (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => { await onSave(nome.trim(), cidade.trim()); setEditing(false); }}><Check className="h-3.5 w-3.5 text-success" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(false); setNome(emp.nome); setCidade(emp.cidade); }}><X className="h-3.5 w-3.5 text-destructive" /></Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(true)}><Pencil className="h-3.5 w-3.5" /></Button>
        )}
      </TableCell>
    </TableRow>
  );
}

function EditableList({ title, items, onAdd, onToggle, onRename }: {
  title: string;
  items: { id: string; nome: string; ativo: boolean }[];
  onAdd: (nome: string) => Promise<void>;
  onToggle: (id: string, ativo: boolean) => Promise<void>;
  onRename: (id: string, nome: string) => Promise<void>;
}) {
  const [novo, setNovo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");

  const handleAdd = async () => {
    if (!novo.trim()) return;
    await onAdd(novo.trim());
    setNovo("");
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={novo} onChange={(e) => setNovo(e.target.value)} placeholder="Novo item..." onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          <Button onClick={handleAdd} size="sm"><Plus className="h-4 w-4" /></Button>
        </div>
        <Table>
          <TableBody>
            {items.map((item) => {
              const isEditing = editingId === item.id;
              return (
                <TableRow key={item.id} className={!item.ativo ? "opacity-50" : ""}>
                  <TableCell className="flex-1">
                    {isEditing ? (
                      <Input value={editNome} onChange={(e) => setEditNome(e.target.value)} className="h-8 text-sm" onKeyDown={(e) => { if (e.key === "Enter") { onRename(item.id, editNome); setEditingId(null); } if (e.key === "Escape") setEditingId(null); }} autoFocus />
                    ) : (<span className="text-sm">{item.nome}</span>)}
                  </TableCell>
                  <TableCell className="w-[60px]"><Switch checked={item.ativo} onCheckedChange={() => onToggle(item.id, item.ativo)} /></TableCell>
                  <TableCell className="w-[40px]">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { onRename(item.id, editNome); setEditingId(null); }}><Check className="h-3.5 w-3.5 text-success" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}><X className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingId(item.id); setEditNome(item.nome); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum item cadastrado</p>}
      </CardContent>
    </Card>
  );
}

function ImobiliariaForm({
  siglas,
  onAdd,
}: {
  siglas: EmpreendimentoSigla[];
  onAdd: (input: {
    sigla: string;
    nome: string;
    contato_nome: string;
    telefone: string;
    link_social: string;
  }) => Promise<boolean>;
}) {
  const [sigla, setSigla] = useState("");
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [telefone, setTelefone] = useState("");
  const [linkSocial, setLinkSocial] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setSigla("");
    setNome("");
    setContato("");
    setTelefone("");
    setLinkSocial("");
  };

  const handleAdd = async () => {
    const n = nome.trim();
    const s = sigla.trim();
    if (!n || !s || saving) return;
    setSaving(true);
    try {
      const created = await onAdd({ sigla: s, nome: n, contato_nome: contato.trim(), telefone: telefone.trim(), link_social: linkSocial.trim() });
      if (created) reset();
    } finally {
      setSaving(false);
    }
  };

  // Datalist agrega códigos de empreendimentos + extras canônicas (SAP, SBY).
  // dedupe preserva ordem dos códigos, com extras no fim.
  const siglaOptions = Array.from(new Set([
    ...siglas.map((e) => e.codigo),
    ...SIGLAS_EXTRAS_CANONICAS,
  ]));

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <Input
          list="imobiliaria-siglas-form"
          value={sigla}
          onChange={(e) => setSigla(e.target.value.toUpperCase())}
          placeholder="Sigla"
          className="w-[120px] uppercase"
          maxLength={6}
        />
        <datalist id="imobiliaria-siglas-form">
          {siglaOptions.map((code) => {
            const meta = siglas.find((e) => e.codigo === code);
            return <option key={code} value={code}>{meta ? `${code} — ${meta.nome}` : code}</option>;
          })}
        </datalist>
        <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da imobiliária / corretor" className="flex-1" />
        <Button size="sm" type="button" disabled={!sigla.trim() || !nome.trim() || saving} onClick={() => void handleAdd()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-2 items-center">
        <Input value={contato} onChange={(e) => setContato(e.target.value)} placeholder="Contato (opcional)" className="flex-1" />
        <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="Telefone (opcional)" className="flex-1" />
        <Input value={linkSocial} onChange={(e) => setLinkSocial(e.target.value)} placeholder="Link social (opcional)" className="flex-1" />
      </div>
    </div>
  );
}

function ImobiliariaRow({
  imo,
  siglas,
  onToggle,
  onToggleCrm,
  onToggleNn,
  onSave,
}: {
  imo: Imobiliaria;
  siglas: EmpreendimentoSigla[];
  onToggle: () => void;
  onToggleCrm: () => void;
  onToggleNn: () => void;
  onSave: (patch: { nome: string; contato_nome: string; telefone: string; link_social: string }) => Promise<void>;
}) {
  const parsed = parseNomeImobiliaria(imo.nome);
  const [editing, setEditing] = useState(false);
  const [sigla, setSigla] = useState(parsed.sigla);
  const [nome, setNome] = useState(parsed.nome);
  const [contato, setContato] = useState(imo.contato_nome ?? "");
  const [telefone, setTelefone] = useState(imo.telefone ?? "");
  const [linkSocial, setLinkSocial] = useState(imo.link_social ?? "");

  const cancel = () => {
    setEditing(false);
    setSigla(parsed.sigla);
    setNome(parsed.nome);
    setContato(imo.contato_nome ?? "");
    setTelefone(imo.telefone ?? "");
    setLinkSocial(imo.link_social ?? "");
  };

  const save = async () => {
    const novoNome = montarNomeImobiliaria(sigla, nome);
    if (!novoNome) return;
    await onSave({
      nome: novoNome,
      contato_nome: contato.trim(),
      telefone: telefone.trim(),
      link_social: linkSocial.trim(),
    });
    setEditing(false);
  };

  // Linha legada (sem sigla) recebe destaque para ajudar limpeza canônica via #11.
  const legacy = !parsed.sigla;

  return (
    <TableRow className={!imo.ativo ? "opacity-50" : ""}>
      <TableCell className="w-[110px]">
        {editing ? (
          <>
            <Input
              list="imobiliaria-siglas-row"
              value={sigla}
              onChange={(e) => setSigla(e.target.value.toUpperCase())}
              className="h-8 text-sm uppercase"
              placeholder="—"
              maxLength={6}
            />
            <datalist id="imobiliaria-siglas-row">
              {Array.from(new Set([...siglas.map((e) => e.codigo), ...SIGLAS_EXTRAS_CANONICAS])).map((code) => {
                const meta = siglas.find((e) => e.codigo === code);
                return <option key={code} value={code}>{meta ? `${code} — ${meta.nome}` : code}</option>;
              })}
            </datalist>
          </>
        ) : (
          <Badge variant={legacy ? "destructive" : "secondary"} className="text-xs">
            {parsed.sigla || "sem-sigla"}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        {editing ? (
          <Input value={nome} onChange={(e) => setNome(e.target.value)} className="h-8 text-sm" />
        ) : (
          <span className="text-sm">{parsed.nome}</span>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {editing ? (
          <Input value={contato} onChange={(e) => setContato(e.target.value)} className="h-8 text-sm" placeholder="Contato" />
        ) : (
          imo.contato_nome || "—"
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {editing ? (
          <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} className="h-8 text-sm" placeholder="Telefone" />
        ) : (
          imo.telefone || "—"
        )}
      </TableCell>
      <TableCell className="w-[60px]" title="Visivel no dropdown CRM (Pingolead)">
        <Switch checked={imo.ativo_crm} onCheckedChange={onToggleCrm} disabled={!imo.ativo} />
      </TableCell>
      <TableCell className="w-[60px]" title="Visivel no dropdown Novos Negocios (Perdigueiro)">
        <Switch checked={imo.ativo_nn} onCheckedChange={onToggleNn} disabled={!imo.ativo} />
      </TableCell>
      <TableCell className="w-[60px]" title="Soft-delete (oculta de todas as apps)">
        <Switch checked={imo.ativo} onCheckedChange={onToggle} />
      </TableCell>
      <TableCell className="w-[80px]">
        {editing ? (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => void save()} disabled={!nome.trim() || !sigla.trim()}>
              <Check className="h-3.5 w-3.5 text-success" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancel}>
              <X className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

type ConsultorLivre = { id: string; nome: string };

function AddUserDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [saving, setSaving] = useState(false);
  const [consultorId, setConsultorId] = useState<string>("");
  const [consultoresLivres, setConsultoresLivres] = useState<ConsultorLivre[]>([]);

  const resetForm = () => {
    setEmail(""); setNome(""); setPassword(""); setRole("user"); setConsultorId("");
  };

  // Fetch consultores ativos sem user_id quando o dialog abre com role=vendedor.
  // Coluna user_id pode não existir ainda (depende da migration de #1) — nesse caso
  // a query devolve erro silencioso e o Select fica vazio.
  useEffect(() => {
    if (!open || role !== "user") { setConsultoresLivres([]); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("crm_consultores")
        .select("id, nome, user_id" as unknown as "id, nome")
        .is("user_id" as unknown as "ativo", null)
        .eq("ativo", true)
        .order("nome");
      if (cancelled) return;
      if (error) { setConsultoresLivres([]); return; }
      setConsultoresLivres(((data ?? []) as unknown as ConsultorLivre[]).map((c) => ({ id: c.id, nome: c.nome })));
    })();
    return () => { cancelled = true; };
  }, [open, role]);

  const handleCreate = async () => {
    if (!email.trim() || !password.trim()) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: { email: email.trim(), password, nome: nome.trim(), role },
      });
      if (error || data?.error) {
        toast({ title: "Erro ao criar usuário", description: error?.message || data?.error, variant: "destructive" });
        return;
      }
      const newUserId = (data as { user_id?: string } | null)?.user_id;
      if (role === "user" && consultorId && newUserId) {
        const { error: linkError } = await supabase
          .from("crm_consultores")
          .update({ user_id: newUserId } as unknown as { ativo: boolean })
          .eq("id", consultorId);
        if (linkError) {
          toast({ title: "Usuário criado, mas não vinculado", description: linkError.message, variant: "destructive" });
        } else {
          toast({ title: "Usuário criado e vinculado ao consultor!" });
        }
      } else {
        toast({ title: "Usuário criado com sucesso!" });
      }
      resetForm();
      onOpenChange(false);
      onCreated();
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Novo Usuário</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
          </div>
          <div className="space-y-2">
            <Label>Senha</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
          </div>
          <div className="space-y-2">
            <Label>Perfil</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">Vendedor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {role === "user" && consultoresLivres.length > 0 && (
            <div className="space-y-2">
              <Label>Vincular a consultor existente (opcional)</Label>
              <Select value={consultorId} onValueChange={(v) => setConsultorId(v === "__none__" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Não vincular" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Não vincular</SelectItem>
                  {consultoresLivres.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Vincular ao consultor faz com que os leads atribuídos a ele apareçam na conta do novo usuário.</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={!email.trim() || !password.trim() || saving}>Criar Usuário</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Configuracoes() {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [fontes, setFontes] = useState<FonteLead[]>([]);
  const [motivos, setMotivos] = useState<MotivoPerda[]>([]);
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [imobiliarias, setImobiliarias] = useState<Imobiliaria[]>([]);
  const [siglas, setSiglas] = useState<EmpreendimentoSigla[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [profiles, setProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [showAddUser, setShowAddUser] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editRole, setEditRole] = useState("");

  const fetchFontes = async () => { const { data } = await supabase.from("crm_fontes_lead").select("*").order("nome"); setFontes((data as FonteLead[]) ?? []); };
  const fetchMotivos = async () => { const { data } = await supabase.from("crm_motivos_perda").select("*").order("nome"); setMotivos((data as MotivoPerda[]) ?? []); };
  const fetchEmpreendimentos = async () => { const { data } = await supabase.from("crm_empreendimentos").select("*").order("nome"); setEmpreendimentos((data as Empreendimento[]) ?? []); };
  const fetchSiglas = async () => {
    const { data } = await supabase
      .from("crm_empreendimentos")
      .select("id, codigo, nome")
      .eq("ativo", true)
      .not("codigo", "is", null)
      .order("codigo");
    setSiglas(((data ?? []) as { id: string; codigo: string | null; nome: string }[])
      .filter((e) => !!e.codigo)
      .map((e) => ({ id: e.id, codigo: e.codigo as string, nome: e.nome })));
  };
  const fetchImobiliarias = async () => {
    const { data, error } = await supabase
      .from("imobiliarias")
      .select("id, nome, contato_nome, telefone, link_social, ativo, ativo_crm, ativo_nn")
      .order("nome");
    if (error) { setImobiliarias([]); return; }
    setImobiliarias((data as Imobiliaria[]) ?? []);
  };
  const fetchUsers = async () => {
    const { data } = await supabase.rpc("get_all_users_with_roles");
    setUsers((data as UserInfo[]) ?? []);
    const { data: profs } = await supabase.from("user_profiles").select("user_id, nome, ativo");
    const map = new Map<string, UserProfile>();
    ((profs as UserProfile[]) ?? []).forEach((p) => map.set(p.user_id, p));
    setProfiles(map);
  };

  useEffect(() => {
    fetchFontes();
    fetchMotivos();
    fetchEmpreendimentos();
    if (isAdmin) {
      fetchUsers();
      fetchImobiliarias();
      fetchSiglas();
    }
  }, [isAdmin]);

  const toggleUserAtivo = async (userId: string, currentAtivo: boolean) => {
    const { error } = await supabase.from("user_profiles").update({ ativo: !currentAtivo }).eq("user_id", userId);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else fetchUsers();
  };

  const startEdit = (u: UserInfo) => { setEditingId(u.id); setEditNome(u.nome || ""); setEditRole(u.role || "user"); };
  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (userId: string) => {
    const { error: profError } = await supabase.from("user_profiles").update({ nome: editNome.trim() }).eq("user_id", userId);
    if (profError) { toast({ title: "Erro ao atualizar nome", description: profError.message, variant: "destructive" }); return; }
    const currentUser = users.find((u) => u.id === userId);
    if (currentUser && currentUser.role !== editRole) {
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error: roleError } = await supabase.from("user_roles").insert({ user_id: userId, role: editRole as any });
      if (roleError) { toast({ title: "Erro ao atualizar perfil", description: roleError.message, variant: "destructive" }); return; }
    }
    toast({ title: "Usuário atualizado!" });
    setEditingId(null);
    fetchUsers();
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <h1 className="font-display text-2xl font-bold tracking-tight">Configurações</h1>

        <Tabs defaultValue="empreendimentos" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="empreendimentos">Empreendimentos</TabsTrigger>
            <TabsTrigger value="fontes">Fontes de Lead</TabsTrigger>
            <TabsTrigger value="motivos">Motivos de Perda</TabsTrigger>
            {isAdmin && <TabsTrigger value="imobiliarias">Imobiliárias</TabsTrigger>}
            {isAdmin && <TabsTrigger value="usuarios">Usuários</TabsTrigger>}
          </TabsList>

          <TabsContent value="empreendimentos" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Empreendimentos</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <EmpreendimentoForm onAdd={async (nome, cidade) => {
                  const { error } = await supabase.from("crm_empreendimentos").insert({ nome, cidade });
                  if (error) { toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" }); return false; }
                  toast({ title: "Empreendimento adicionado!" }); await fetchEmpreendimentos(); return true;
                }} />
                <Table>
                  <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Cidade</TableHead><TableHead className="w-[60px]">Ativo</TableHead><TableHead className="w-[40px]"></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {empreendimentos.map((emp) => (
                      <EmpreendimentoRow key={emp.id} emp={emp}
                        onToggle={async () => { await supabase.from("crm_empreendimentos").update({ ativo: !emp.ativo }).eq("id", emp.id); fetchEmpreendimentos(); }}
                        onSave={async (nome, cidade) => { await supabase.from("crm_empreendimentos").update({ nome, cidade }).eq("id", emp.id); fetchEmpreendimentos(); }}
                      />
                    ))}
                  </TableBody>
                </Table>
                {empreendimentos.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum empreendimento cadastrado</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fontes" className="mt-4">
            <EditableList title="Fontes de Lead" items={fontes}
              onAdd={async (nome) => { const { error } = await supabase.from("crm_fontes_lead").insert({ nome }); if (error) toast({ title: "Erro", description: error.message, variant: "destructive" }); else fetchFontes(); }}
              onToggle={async (id, ativo) => { await supabase.from("crm_fontes_lead").update({ ativo: !ativo }).eq("id", id); fetchFontes(); }}
              onRename={async (id, nome) => { if (!nome.trim()) return; await supabase.from("crm_fontes_lead").update({ nome: nome.trim() }).eq("id", id); fetchFontes(); }}
            />
          </TabsContent>

          <TabsContent value="motivos" className="mt-4">
            <EditableList title="Motivos de Perda" items={motivos}
              onAdd={async (nome) => { const { error } = await supabase.from("crm_motivos_perda").insert({ nome }); if (error) toast({ title: "Erro", description: error.message, variant: "destructive" }); else fetchMotivos(); }}
              onToggle={async (id, ativo) => { await supabase.from("crm_motivos_perda").update({ ativo: !ativo }).eq("id", id); fetchMotivos(); }}
              onRename={async (id, nome) => { if (!nome.trim()) return; await supabase.from("crm_motivos_perda").update({ nome: nome.trim() }).eq("id", id); fetchMotivos(); }}
            />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="imobiliarias" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Imobiliárias / Corretores parceiros</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Opções do dropdown <strong>Responsável pela venda → Imobiliária</strong>. Padrão canônico: <code>SIGLA - Nome</code> (sigla do empreendimento). Registros sem sigla aparecem destacados — normalize via edição.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ImobiliariaForm
                    siglas={siglas}
                    onAdd={async (input) => {
                      const nomeFinal = montarNomeImobiliaria(input.sigla, input.nome);
                      const { error } = await supabase.from("imobiliarias").insert({
                        nome: nomeFinal,
                        contato_nome: input.contato_nome || null,
                        telefone: input.telefone || null,
                        link_social: input.link_social || null,
                        // #17 multi-app: novos cadastros via admin do CRM entram visiveis
                        // no Pingolead por default. Admin marca o toggle NN se aplicavel.
                        ativo_crm: true,
                        ativo_nn: false,
                      });
                      if (error) {
                        toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" });
                        return false;
                      }
                      toast({ title: "Imobiliária adicionada!" });
                      await fetchImobiliarias();
                      return true;
                    }}
                  />
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[110px]">Sigla</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead className="w-[60px]" title="Visivel no dropdown CRM (Pingolead)">CRM</TableHead>
                        <TableHead className="w-[60px]" title="Visivel no dropdown Novos Negocios">NN</TableHead>
                        <TableHead className="w-[60px]" title="Soft-delete global">Ativo</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {imobiliarias.map((imo) => (
                        <ImobiliariaRow
                          key={imo.id}
                          imo={imo}
                          siglas={siglas}
                          onToggle={async () => {
                            const { error } = await supabase
                              .from("imobiliarias")
                              .update({ ativo: !imo.ativo })
                              .eq("id", imo.id);
                            if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
                            else fetchImobiliarias();
                          }}
                          onToggleCrm={async () => {
                            const { error } = await supabase
                              .from("imobiliarias")
                              .update({ ativo_crm: !imo.ativo_crm })
                              .eq("id", imo.id);
                            if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
                            else fetchImobiliarias();
                          }}
                          onToggleNn={async () => {
                            const { error } = await supabase
                              .from("imobiliarias")
                              .update({ ativo_nn: !imo.ativo_nn })
                              .eq("id", imo.id);
                            if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
                            else fetchImobiliarias();
                          }}
                          onSave={async (patch) => {
                            const { error } = await supabase
                              .from("imobiliarias")
                              .update({
                                nome: patch.nome,
                                contato_nome: patch.contato_nome || null,
                                telefone: patch.telefone || null,
                                link_social: patch.link_social || null,
                              })
                              .eq("id", imo.id);
                            if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
                            else { toast({ title: "Imobiliária atualizada!" }); fetchImobiliarias(); }
                          }}
                        />
                      ))}
                    </TableBody>
                  </Table>
                  {imobiliarias.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhuma imobiliária cadastrada</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="usuarios" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Usuários</CardTitle>
                  <Button size="sm" onClick={() => setShowAddUser(true)}><UserPlus className="h-4 w-4 mr-2" />Novo Usuário</Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Perfil</TableHead>
                        <TableHead>Ativo</TableHead>
                        <TableHead className="w-[80px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => {
                        const profile = profiles.get(u.id);
                        const isAtivo = profile?.ativo ?? true;
                        const isEditing = editingId === u.id;
                        return (
                          <TableRow key={u.id} className={!isAtivo ? "opacity-50" : ""}>
                            <TableCell>{isEditing ? <Input value={editNome} onChange={(e) => setEditNome(e.target.value)} className="h-8 text-sm" /> : (u.nome || "—")}</TableCell>
                            <TableCell className="text-sm">{u.email}</TableCell>
                            <TableCell>
                              {isEditing ? (
                                <Select value={editRole} onValueChange={setEditRole}>
                                  <SelectTrigger className="h-8 w-[120px] text-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="user">Vendedor</SelectItem></SelectContent>
                                </Select>
                              ) : (
                                <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">{u.role === "admin" ? "Admin" : "Vendedor"}</Badge>
                              )}
                            </TableCell>
                            <TableCell><Switch checked={isAtivo} onCheckedChange={() => toggleUserAtivo(u.id, isAtivo)} /></TableCell>
                            <TableCell>
                              {isEditing ? (
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveEdit(u.id)}><Check className="h-4 w-4 text-success" /></Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEdit}><X className="h-4 w-4 text-destructive" /></Button>
                                </div>
                              ) : (
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(u)}><Pencil className="h-4 w-4" /></Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <AddUserDialog open={showAddUser} onOpenChange={setShowAddUser} onCreated={fetchUsers} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
}
