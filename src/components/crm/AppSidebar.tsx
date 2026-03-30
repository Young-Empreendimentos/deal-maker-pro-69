import { LayoutDashboard, Handshake, Building2, Settings, LogOut, ClipboardList } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/negociacoes", label: "Negociações", icon: Handshake },
  { to: "/tarefas", label: "Tarefas", icon: ClipboardList },
  
  { to: "/configuracoes", label: "Configurações", icon: Settings, adminOnly: true },
];

export function AppSidebar() {
  const { isAdmin, nome, user, signOut } = useAuth();
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-4">
        <img
          src="/Logo Caixa - Laranja e Cinza.png"
          alt="Young Empreendimentos"
          className="h-12 w-auto object-contain"
        />
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => {
          if (link.adminOnly && !isAdmin) return null;
          const active = location.pathname.startsWith(link.to);
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{nome || user?.email}</p>
            <p className="text-xs text-sidebar-foreground/50 capitalize">{isAdmin ? "Admin" : "Vendedor"}</p>
          </div>
          <button onClick={signOut} className="p-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
