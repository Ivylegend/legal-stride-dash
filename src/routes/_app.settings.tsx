import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { THEME_OPTIONS, useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { Moon, Sun, Check } from "lucide-react";
import { joinName } from "@/lib/format";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Glidertech" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme, mode, toggleMode } = useTheme();
  const { user, logout } = useAuth();
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Personalize your workspace and manage session preferences." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Mode</Label>
              <Button variant="outline" onClick={toggleMode} className="gap-2">
                {mode === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {mode === "dark" ? "Dark" : "Light"} mode
              </Button>
            </div>
            <div>
              <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Color palette</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {THEME_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setTheme(o.value)}
                    className={`group relative flex items-center gap-2 rounded-md border p-3 text-left text-sm transition-colors hover:bg-accent ${theme === o.value ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
                  >
                    <span className="h-6 w-6 rounded-full border" style={{ backgroundColor: o.swatch }} />
                    <span className="flex-1 truncate">{o.label}</span>
                    {theme === o.value && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border bg-muted/30 p-4">
              <div className="text-sm font-medium">{joinName((user ?? {}) as Record<string, unknown>)}</div>
              <div className="text-xs text-muted-foreground">{user?.emailAddress ?? user?.email ?? "—"}</div>
              {user?.organization?.name && <div className="mt-2 text-xs text-muted-foreground">Organization: <span className="text-foreground">{user.organization.name}</span></div>}
            </div>
            <Button variant="destructive" onClick={logout}>Sign out</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}