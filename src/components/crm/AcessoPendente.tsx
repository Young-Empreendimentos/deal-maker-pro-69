import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Clock, Lock } from "lucide-react";

/**
 * Tela mostrada para quem está logado (domínio permitido) mas ainda não tem
 * acesso liberado ao CRM. O bloqueio de dados em si é feito pelo RLS no banco;
 * esta tela só evita que a pessoa veja telas vazias sem entender o porquê.
 */
export function AcessoPendente({ status }: { status: "pending" | "inactive" }) {
  const { user, nome, signOut } = useAuth();
  const isInactive = status === "inactive";

  // Registra a solicitação de acesso para os admins aprovarem/rejeitarem —
  // tanto para quem nunca teve acesso (pendente) quanto para quem foi
  // desativado e quer voltar (idempotente por user_id — não duplica).
  useEffect(() => {
    if (!user) return;
    void (supabase as any).from("crm_solicitacoes_acesso").upsert(
      { user_id: user.id, email: user.email ?? null, nome: nome || null, status: "pendente" },
      { onConflict: "user_id", ignoreDuplicates: true },
    );
  }, [user, nome]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-4 rounded-xl border bg-card p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          {isInactive
            ? <Lock className="h-6 w-6 text-muted-foreground" />
            : <Clock className="h-6 w-6 text-muted-foreground" />}
        </div>
        <h1 className="text-lg font-semibold">
          {isInactive ? "Acesso desativado" : "Aguardando autorização"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isInactive
            ? "Seu acesso ao CRM foi desativado. Enviamos um pedido de reativação aos administradores."
            : "Sua conta ainda não tem acesso ao CRM. Enviamos seu pedido aos administradores para liberação."}
        </p>
        {user?.email && (
          <p className="text-xs text-muted-foreground">Conectado como {user.email}</p>
        )}
        <Button variant="outline" onClick={signOut} className="w-full">Sair</Button>
      </div>
    </div>
  );
}
