import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Truck, Package, ShoppingCart, Wallet, Boxes,
  LogOut, Menu, X, Bell, Search, ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/fornecedores", label: "Fornecedores", icon: Truck },
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/vendas", label: "Vendas", icon: ShoppingCart },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/estoque", label: "Estoque", icon: Boxes },
] as const;

export function DashboardLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  const current = nav.find((n) => pathname.startsWith(n.to))?.label ?? "Dashboard";

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/30">
      {/* Brand header */}
      <div
        className="flex h-16 items-center justify-center px-4 text-white shadow-md"
        style={{ background: "linear-gradient(90deg, #6d28d9 0%, #9333ea 45%, #eab308 100%)" }}
      >
        <h1 className="text-2xl font-bold tracking-[0.2em] text-white drop-shadow-sm">PodGYN</h1>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div
            className="flex h-16 items-center gap-2 px-5 text-white lg:hidden"
            style={{ background: "linear-gradient(90deg, #6d28d9 0%, #eab308 100%)" }}
          >
            <p className="text-lg font-bold tracking-widest">PodGYN</p>
          </div>
          <div className="hidden h-4 lg:block" />
          <nav className="p-3 space-y-1">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || pathname.startsWith(to + "/");
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "text-white shadow-sm"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                  style={
                    active
                      ? { background: "linear-gradient(90deg, #7c3aed, #eab308)" }
                      : undefined
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 border-t p-3">
            <button
              onClick={async () => { await signOut(); navigate({ to: "/auth", replace: true }); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </aside>

        {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur lg:px-6">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((v) => !v)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
              <span>Sistema</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{current}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Buscar rápido..."
                  className="h-9 w-64 rounded-full border bg-muted/40 pl-9 pr-3 text-sm outline-none focus:bg-background focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 rounded-full border bg-card px-2 py-1 pr-3">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #eab308)" }}
                >
                  {(user?.nome?.[0] ?? "U").toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{user?.nome ?? "Usuário"}</span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-6 animate-in fade-in duration-300">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
