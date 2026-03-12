import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Image as ImageIcon, Upload, Trash2 } from "lucide-react";

type TaskImage = {
  id: string;
  task_id: string;
  image_url: string;
  nome_arquivo: string;
  uploaded_at: string;
  task_titulo?: string;
};

type DealImage = {
  id: string;
  image_url: string;
  nome_arquivo: string;
  uploaded_at: string;
};

interface Props {
  dealId: string;
  taskImages: TaskImage[];
  dealImages: DealImage[];
  onRefresh: () => void;
}

export function DealGallery({ dealId, taskImages, dealImages, onRefresh }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    setUploading(true);

    for (const file of Array.from(e.target.files)) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${dealId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("task-images").upload(path, file);
      if (uploadErr) {
        toast({ title: "Erro no upload", description: uploadErr.message, variant: "destructive" });
        continue;
      }
      const { data: urlData } = supabase.storage.from("task-images").getPublicUrl(path);
      const { error: insertErr } = await supabase.from("crm_deal_images").insert({
        deal_id: dealId,
        image_url: urlData.publicUrl,
        nome_arquivo: file.name,
        uploaded_by: user.id,
      });
      if (insertErr) {
        toast({ title: "Erro ao salvar imagem", description: insertErr.message, variant: "destructive" });
      }
    }

    setUploading(false);
    onRefresh();
    e.target.value = "";
  };

  const removeDealImage = async (imgId: string) => {
    await supabase.from("crm_deal_images").delete().eq("id", imgId);
    onRefresh();
  };

  const allImages = [
    ...dealImages.map((img) => ({ ...img, source: "Galeria" as const, isDealImage: true })),
    ...taskImages.map((img) => ({ ...img, source: img.task_titulo || "Tarefa" as const, isDealImage: false })),
  ].sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());

  return (
    <>
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ImageIcon className="h-4 w-4" /> Galeria de Imagens ({allImages.length})
          </CardTitle>
          <label className="cursor-pointer">
            <Button size="sm" variant="outline" asChild disabled={uploading}>
              <span>
                <Upload className="h-4 w-4 mr-1" /> {uploading ? "Enviando..." : "Adicionar"}
              </span>
            </Button>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleDirectUpload} />
          </label>
        </CardHeader>
        <CardContent>
          {allImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {allImages.map((img) => (
                <div key={img.id} className="group relative rounded-lg overflow-hidden border">
                  <div className="cursor-pointer" onClick={() => setViewImage(img.image_url)}>
                    <img src={img.image_url} alt={img.nome_arquivo} className="w-full h-28 object-cover transition-transform group-hover:scale-105" />
                  </div>
                  <div className="p-2 bg-card flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium truncate">{img.nome_arquivo}</p>
                      <p className="text-[10px] text-muted-foreground">{img.source} · {new Date(img.uploaded_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                    {img.isDealImage && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                        onClick={() => removeDealImage(img.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground text-sm py-6 border border-dashed rounded-md">
              Nenhuma imagem. Clique em "Adicionar" para enviar.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewImage} onOpenChange={(open) => !open && setViewImage(null)}>
        <DialogContent className="sm:max-w-2xl p-2">
          {viewImage && <img src={viewImage} alt="" className="w-full rounded-md" />}
        </DialogContent>
      </Dialog>
    </>
  );
}
