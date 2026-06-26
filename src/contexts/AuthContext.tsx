import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "admin" | "user";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: UserRole;
  nome: string;
  loading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_DOMAINS = [
  "@youngempreendimentos.com.br",
  "@adventurelabs.com.br",
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>("user");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchUserMeta = async (userId: string) => {
    const [roleRes, profileRes, statusRes] = await Promise.all([
      supabase.from("crm_user_roles").select("role").eq("user_id", userId).maybeSingle(),
      supabase.from("user_profiles").select("nome").eq("user_id", userId).maybeSingle(),
      supabase.from("crm_usuarios").select("ativo").eq("user_id", userId).maybeSingle(),
    ]);
    // Acesso ao CRM desativado: encerra a sessão com mensagem clara.
    // (O bloqueio de verdade é no banco; aqui é só UX.)
    if (statusRes.data?.ativo === false) {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setRole("user");
      setNome("");
      setAuthError("Seu acesso ao CRM foi desativado. Fale com um administrador.");
      return;
    }
    setRole((roleRes.data?.role as UserRole) ?? "user");
    setNome(profileRes.data?.nome ?? "");
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchUserMeta(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const provider = session.user.app_metadata?.provider as string | undefined;
        const email = session.user.email ?? "";

        // Restrição de domínio apenas para Google OAuth
        if (provider === "google" && !ALLOWED_DOMAINS.some((d) => email.endsWith(d))) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setRole("user");
          setNome("");
          setAuthError(
            `Apenas e-mails ${ALLOWED_DOMAINS.join(" ou ")} têm acesso via Google.`,
          );
          return;
        }

        setSession(session);
        setUser(session.user);
        fetchUserMeta(session.user.id);
      } else {
        setSession(null);
        setUser(null);
        setRole("user");
        setNome("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const callbackUrl = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider value={{
      session, user, role, nome, loading, authError,
      signIn, signInWithGoogle, signOut,
      isAdmin: role === "admin",
      clearAuthError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
