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
import { Plus, Pencil, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type FonteLead = { id: string; nome: string; ativo: boolean };
type MotivoPerda = { id: string; nome: string; ativo: boolean };
type Empreendimento = { id: string; nome: string; cidade: string; ativo: boolean };
type UserInfo = { id: string; email: string; role: string; nome: string; created_at: string };
type UserProfile = { user_id: string; nome: string; ativo: boolean };

function EditableList({
  title,
  items,
  onAdd,
  onToggle,
  onRename,
}: {
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
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={novo}
            onChange={(e) => setNovo(e.target.value)}
            placeholder={`Novo item...`}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
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
                      <Input
                        value={editNome}
                        onChange={(e) => setEditNome(e.target.value)}
                        className="h-8 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { onRename(item.id, editNome); setEditingId(null); }
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm">{item.nome}</span>
                    )}
                  </TableCell>
                  <TableCell className="w-[60px]">
                    <Switch checked={item.ativo} onCheckedChange={() => onToggle(item.id, item.ativo)} />
                  </TableCell>
                  <TableCell className="w-[40px]">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { onRename(item.id, editNome); setEditingId(null); }}>
                          <Check className="h-3.5 w-3.5 text-success" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}>
                          <X className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingId(item.id); setEditNome(item.nome); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
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

export default function Configuracoes() {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [fontes, setFontes] = useState<FonteLead[]>([]);
  const [motivos, setMotivos] = useState<MotivoPerda[]>([]);
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [profiles, setProfiles] = useState<Map<string, UserProfile>>(new Map());

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editRole, setEditRole] = useState("");

  const fetchFontes = async () => {
    const { data } = await supabase.from("crm_fontes_lead").select("*").order("nome");
    setFontes((data as FonteLead[]) ?? []);
  };

  const fetchMotivos = async () => {
    const { data } = await supabase.from("crm_motivos_perda").select("*").order("nome");
    setMotivos((data as MotivoPerda[]) ?? []);
  };

  const fetchEmpreendimentos = async () => {
    const { data } = await supabase.from("crm_empreendimentos").select("*").order("nome");
    setEmpreendimentos((data as Empreendimento[]) ?? []);
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
    if (isAdmin) fetchUsers();
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
      <div className="space-y-8 max-w-3xl">
        <h1 className="font-display text-2xl font-bold tracking-tight">Configurações</h1>

        <EditableList
          title="Fontes de Lead"
          items={fontes}
          onAdd={async (nome) => {
            const { error } = await supabase.from("crm_fontes_lead").insert({ nome });
            if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
            else fetchFontes();
          }}
          onToggle={async (id, ativo) => {
            await supabase.from("crm_fontes_lead").update({ ativo: !ativo }).eq("id", id);
            fetchFontes();
          }}
          onRename={async (id, nome) => {
            if (!nome.trim()) return;
            await supabase.from("crm_fontes_lead").update({ nome: nome.trim() }).eq("id", id);
            fetchFontes();
          }}
        />

        <EditableList
          title="Motivos de Perda"
          items={motivos}
          onAdd={async (nome) => {
            const { error } = await supabase.from("crm_motivos_perda").insert({ nome });
            if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
            else fetchMotivos();
          }}
          onToggle={async (id, ativo) => {
            await supabase.from("crm_motivos_perda").update({ ativo: !ativo }).eq("id", id);
            fetchMotivos();
          }}
          onRename={async (id, nome) => {
            if (!nome.trim()) return;
            await supabase.from("crm_motivos_perda").update({ nome: nome.trim() }).eq("id", id);
            fetchMotivos();
          }}
        />

        <Card>
          <CardHeader><CardTitle className="text-lg">Usuários</CardTitle></CardHeader>
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
                      <TableCell>
                        {isEditing ? <Input value={editNome} onChange={(e) => setEditNome(e.target.value)} className="h-8 text-sm" /> : (u.nome || "—")}
                      </TableCell>
                      <TableCell className="text-sm">{u.email}</TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Select value={editRole} onValueChange={setEditRole}>
                            <SelectTrigger className="h-8 w-[120px] text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="user">Vendedor</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">
                            {u.role === "admin" ? "Admin" : "Vendedor"}
                          </Badge>
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
      </div>
    </AppLayout>
  );
}
