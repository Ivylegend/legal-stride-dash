import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Users2,
  UserRound,
  FileText,
  CheckSquare,
  BarChart3,
  ShieldCheck,
  Building2,
  Bell,
  Settings,
  Search,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrgMark, GlidertechLogo } from "@/components/glidertech-logo";
import { useAuth } from "@/lib/auth";
import { useTheme, THEME_OPTIONS } from "@/lib/theme";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/cases", label: "Cases", icon: Briefcase },
  { to: "/clients", label: "Clients", icon: Users2 },
  { to: "/contacts", label: "Contacts", icon: UserRound },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/users", label: "Users", icon: ShieldCheck },
  { to: "/organizations", label: "Organizations", icon: Building2 },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppLayout() {
  const { user, logout } = useAuth();
  const { mode, toggleMode, setTheme, theme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const currentTitle = useMemo(() => {
    const match = NAV.find((n) => pathname.startsWith(n.to));
    return match?.label ?? "Dashboard";
  }, [pathname]);

  const org = user?.organization ?? null;
  const orgName = (org?.name as string | undefined) ?? "Your Firm";
  const orgLogo = (org?.logo as string | undefined) ?? null;

  const displayName =
    (user?.fullName as string | undefined) ||
    (user?.name as string | undefined) ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    (user?.email as string | undefined) ||
    "Signed in";
  const displayEmail = (user?.email as string | undefined) || (user?.emailAddress as string | undefined) || "";

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4">
          <OrgMark name={orgName} logo={orgLogo} />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{orgName}</div>
              <div className="truncate text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
                Case Management
              </div>
            </div>
          )}
          <button
            className="ml-auto rounded p-1 hover:bg-sidebar-accent lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden w-full items-center justify-center gap-2 rounded-md px-2 py-1.5 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent lg:flex"
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <><ChevronsLeft className="h-4 w-4" /> Collapse</>}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div className={cn("flex min-h-screen flex-1 flex-col", collapsed ? "lg:pl-16" : "lg:pl-64")}>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-sm font-semibold sm:text-base">{currentTitle}</h2>

          <div className="relative ml-auto hidden max-w-sm flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search…" className="h-9 pl-9" />
          </div>

          <Button variant="ghost" size="icon" asChild>
            <Link to="/notifications">
              <Bell className="h-5 w-5" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleMode} aria-label="Toggle theme">
            {mode === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
                <span className="hidden text-sm md:inline">{displayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span className="text-sm">{displayName}</span>
                {displayEmail && (
                  <span className="text-xs font-normal text-muted-foreground">{displayEmail}</span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                Color theme
              </DropdownMenuLabel>
              {THEME_OPTIONS.map((t) => (
                <DropdownMenuItem key={t.value} onClick={() => setTheme(t.value)}>
                  <span
                    className="mr-2 inline-block h-3 w-3 rounded-full ring-1 ring-border"
                    style={{ background: t.swatch }}
                  />
                  {t.label}
                  {theme === t.value && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  navigate({ to: "/login" });
                }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto w-full max-w-7xl space-y-6">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <GlidertechLogo className="scale-90 opacity-80" />
            <span>&copy; {new Date().getFullYear()} Glidertech</span>
          </div>
        </footer>
      </div>
    </div>
  );
}