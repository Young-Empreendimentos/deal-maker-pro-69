import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/crm/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type FonteLead = { id: string; nome: string; ativo: boolean };
type UserInfo = { id: string; email: string; role: string; nome: string; created_at: string };

export default function Configuracoes() {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [fontes, setFontes] = useState<FonteLead[]>([]);
  const [novaFonte, setNovaFonte] = useState("");
  const [users, setUsers] = useState<UserInfo[]>([]);

  const fetchFontes = async () => {
    const { data } = await supabase.from("crm_fontes_lead").select("*").order("nome");
    setFontes((data as FonteLead[]) ?? []);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.rpc("get_all_users_with_roles");
    setUsers((data as UserInfo[]) ?? []);
  };

  useEffect(() => {
    fetchFontes();
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const addFonte = async () => {
    if (!novaFonte.trim()) return;
    const { error } = await supabase.from("crm_fontes_lead").insert({ nome: novaFonte.trim() });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setNovaFonte("");
      fetchFontes();
    }
  };

  const toggleFonte = async (id: string, ativo: boolean) => {
    await supabase.from("crm_fontes_lead").update({ ativo: !ativo }).eq("id", id);
    fetchFontes();
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-3xl">
        <h1 className="font-display text-2xl font-bold tracking-tight">Configurações</h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fontes de Lead</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={novaFonte} onChange={(e) => setNovaFonte(e.target.value)} placeholder="Nova fonte..." onKeyDown={(e) => e.key === "Enter" && addFonte()} />
              <Button onClick={addFonte} size="sm"><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {fontes.map((f) => (
                <Badge key={f.id} variant={f.ativo ? "default" : "secondary"} className="cursor-pointer" onClick={() => toggleFonte(f.id, f.ativo)}>
                  {f.nome}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Perfil</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.nome || "—"}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">
                          {u.role === "admin" ? "Admin" : "Vendedor"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
