import { LayoutDashboard, Handshake, Building2, Settings, LogOut, Menu, X, ClipboardList } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/negociacoes", label: "Negociações", icon: Handshake },
  { to: "/tarefas", label: "Tarefas", icon: ClipboardList },
  
  { to: "/configuracoes", label: "Configurações", icon: Settings, adminOnly: true },
];

export function MobileNav() {
  const { isAdmin, signOut } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <h1 className="font-display text-lg font-bold text-primary">CRM</h1>
        <button onClick={() => setOpen(!open)} className="p-2">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="bg-card border-b border-border p-3 space-y-1">
          {links.map((link) => {
            if (link.adminOnly && !isAdmin) return null;
            const active = location.pathname.startsWith(link.to);
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            );
          })}
          <button onClick={signOut} className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 w-full">
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </nav>
      )}
    </div>
  );
}
