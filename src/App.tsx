import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import Login from "./pages/Login";
import Negociacoes from "./pages/Negociacoes";
import Dashboard from "./pages/Dashboard";
import Empreendimentos from "./pages/Empreendimentos";
import Configuracoes from "./pages/Configuracoes";
import Tarefas from "./pages/Tarefas";
import NegociacaoDetalhes from "./pages/NegociacaoDetalhes";
import Relatorios from "./pages/Relatorios";
import RelatorioDiario from "./pages/RelatorioDiario";
import PublicoAlvo from "./pages/PublicoAlvo";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import { AcessoPendente } from "@/components/crm/AcessoPendente";

const queryClient = new QueryClient();

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading, isAdmin, authStatus } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  // Meta do usuário (papel/autorização) ainda carregando
  if (authStatus === null) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  // Logado mas sem acesso ao CRM → tela de aviso (não o app vazio)
  if (authStatus !== "authorized") return <AcessoPendente status={authStatus} />;
  if (adminOnly && !isAdmin) return <Navigate to="/negociacoes" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/negociacoes" element={<ProtectedRoute><Negociacoes /></ProtectedRoute>} />
      <Route path="/negociacoes/:id" element={<ProtectedRoute><NegociacaoDetalhes /></ProtectedRoute>} />
      <Route path="/tarefas" element={<ProtectedRoute><Tarefas /></ProtectedRoute>} />
      <Route path="/relatorios" element={<ProtectedRoute adminOnly><Relatorios /></ProtectedRoute>} />
      <Route path="/relatorio-diario" element={<ProtectedRoute adminOnly><RelatorioDiario /></ProtectedRoute>} />
      <Route path="/publico-alvo" element={<ProtectedRoute adminOnly><PublicoAlvo /></ProtectedRoute>} />
      <Route path="/configuracoes" element={<ProtectedRoute adminOnly><Configuracoes /></ProtectedRoute>} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
