import { LayoutDashboard, Handshake, Settings, LogOut, ClipboardList, BarChart3, CalendarRange, Users2, Droplet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/negociacoes", label: "Negociações", icon: Handshake },
  { to: "/tarefas", label: "Tarefas", icon: ClipboardList },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3, adminOnly: true },
  { to: "/relatorio-diario", label: "Relatório Diário", icon: CalendarRange, adminOnly: true },
  { to: "/publico-alvo", label: "Perfil de Cliente", icon: Users2, adminOnly: true },
  { to: "/configuracoes", label: "Configurações", icon: Settings, adminOnly: true },
];

export function AppSidebar() {
  const { isAdmin, nome, user, signOut } = useAuth();
  const location = useLocation();
  const inicial = (nome || user?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <>
      {/* Espaçador: reserva a largura do rail recolhido para o conteúdo não pular */}
      <div className="hidden md:block w-16 flex-shrink-0" aria-hidden="true" />

      {/* Rail recolhido (w-16) que expande no hover (w-64), sobrepondo o conteúdo */}
      <aside className="group hidden md:flex fixed left-0 top-0 z-40 h-screen w-16 hover:w-64 flex-col overflow-hidden bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width] duration-200 ease-out">
        {/* Marca */}
        <div className="flex items-center gap-3 h-16 px-3 shrink-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-ember shadow-ember">
            <Droplet className="h-5 w-5 text-white" fill="currentColor" />
          </div>
          <span className="text-lg font-bold tracking-tight whitespace-nowrap">
            Pingo<span className="text-sidebar-primary">'lead</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {links.map((link) => {
            if (link.adminOnly && !isAdmin) return null;
            const active = location.pathname.startsWith(link.to);
            return (
              <NavLink
                key={link.to}
                to={link.to}
                title={link.label}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                <span className="whitespace-nowrap">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-primary">
              {inicial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{nome || user?.email}</p>
              <p className="text-xs text-sidebar-foreground/50 capitalize">{isAdmin ? "Admin" : "Vendedor"}</p>
            </div>
            <button
              onClick={signOut}
              title="Sair"
              className="shrink-0 p-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
