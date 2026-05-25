import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }
      // Fecha o popup; se abrir direto, vai pro dashboard
      setTimeout(() => {
        if (window.opener && !window.opener.closed) {
          window.close();
        } else {
          window.location.href = "/dashboard";
        }
      }, 300);
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
        <p className="text-sm text-muted-foreground">Concluindo login…</p>
      </div>
    </div>
  );
}
