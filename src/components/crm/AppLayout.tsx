import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import { GlobalSearch } from "./GlobalSearch";
import { ThemeToggle } from "./ThemeToggle";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileNav />

        {/* Header com busca global */}
        <header className="sticky top-0 z-30 hidden md:flex items-center gap-4 px-6 py-3 bg-background/95 backdrop-blur border-b border-border">
          <GlobalSearch />
          <ThemeToggle className="ml-auto" />
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
