import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/crm/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Empreendimento = { id: string; nome: string; cidade: string; ativo: boolean };

export default function Empreendimentos() {
  const { toast } = useToast();
  const [items, setItems] = useState<Empreendimento[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from("crm_empreendimentos").select("*").order("nome");
    setItems((data as Empreendimento[]) ?? []);
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("crm_empreendimentos").insert({ nome, cidade });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Empreendimento criado!" });
      setShowForm(false);
      setNome(""); setCidade("");
      fetch();
    }
    setLoading(false);
  };

  const toggleAtivo = async (id: string, ativo: boolean) => {
    await supabase.from("crm_empreendimentos").update({ ativo: !ativo }).eq("id", id);
    fetch();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold tracking-tight">Empreendimentos</h1>
          <Button onClick={() => setShowForm(true)} size="sm"><Plus className="h-4 w-4 mr-1" /> Novo</Button>
        </div>

        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell>{item.cidade}</TableCell>
                  <TableCell>
                    <Badge
                      className="cursor-pointer"
                      variant={item.ativo ? "default" : "secondary"}
                      onClick={() => toggleAtivo(item.id, item.ativo)}
                    >
                      {item.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">Nenhum empreendimento</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Novo Empreendimento</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Nome *</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Cidade *</Label><Input value={cidade} onChange={(e) => setCidade(e.target.value)} required /></div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>{loading ? "Criando..." : "Criar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
