import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Negociacoes from "./pages/Negociacoes";
import Empreendimentos from "./pages/Empreendimentos";
import Configuracoes from "./pages/Configuracoes";
import Tarefas from "./pages/Tarefas";
import NegociacaoDetalhes from "./pages/NegociacaoDetalhes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/negociacoes" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/negociacoes" replace /> : <Login />} />
      <Route path="/" element={<Navigate to="/negociacoes" replace />} />
      <Route path="/negociacoes" element={<ProtectedRoute><Negociacoes /></ProtectedRoute>} />
      <Route path="/negociacoes/:id" element={<ProtectedRoute><NegociacaoDetalhes /></ProtectedRoute>} />
      <Route path="/tarefas" element={<ProtectedRoute><Tarefas /></ProtectedRoute>} />
      <Route path="/empreendimentos" element={<ProtectedRoute adminOnly><Empreendimentos /></ProtectedRoute>} />
      <Route path="/configuracoes" element={<ProtectedRoute adminOnly><Configuracoes /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
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
);

export default App;
