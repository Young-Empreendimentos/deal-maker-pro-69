// Cliente Supabase do Pingolead.
// ⚠️ SSO da Young (02/10/2026): a sessão é guardada em COOKIE no domínio pai
// `.youngempreendimentos.com.br` (via @supabase/ssr), e não mais no localStorage.
// Assim, logar em qualquer sistema da Young no mesmo navegador já deixa este app logado,
// e vice-versa. Em localhost (dev) o cookie fica só no host local.
// Regra que vale pra TODOS os apps: `signOut({ scope: "local" })` — nunca o global,
// que apaga a sessão da pessoa em todos os sistemas e dispositivos.
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

const SUPABASE_URL = "https://vvtympzatclvjaqucebr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dHltcHphdGNsdmphcXVjZWJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTI1NzYsImV4cCI6MjA4NjAyODU3Nn0.C8vWcljx6veAQ0hCi0ms7Ixm6NxhSdWBDeRgUy2Kz50";

const YOUNG_DOMAIN = "youngempreendimentos.com.br";
const host = typeof window !== "undefined" ? window.location.hostname : "";
const cookieDomain =
  host === YOUNG_DOMAIN || host.endsWith("." + YOUNG_DOMAIN) ? "." + YOUNG_DOMAIN : undefined;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  cookieOptions: {
    domain: cookieDomain,
    path: "/",
    sameSite: "lax",
    secure: typeof window !== "undefined" ? window.location.protocol === "https:" : true,
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Cutover 2026-08: as tabelas crm_ foram movidas para o schema `crm` no Postgres
// (as views de compatibilidade seguem no schema public). Use `crmDb` em TODA operação
// de tabela/view crm_ (.select/.insert/.update/.delete/.upsert). RPCs (.rpc), auth e
// storage continuam no client public (`supabase`). O schema `crm` não está no types.ts
// gerado, por isso o cast — em runtime funciona; a tipagem vem das views em public.
export const crmDb = supabase.schema("crm" as any);

// Idem para as tabelas comercial_ (movidas para o schema `comercial`; views de compat no public).
// Use `comercialDb` nas operações de tabela/view comercial_.
export const comercialDb = supabase.schema("comercial" as any);
