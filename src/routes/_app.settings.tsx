import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { THEME_OPTIONS, useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { Moon, Sun, Check, Upload } from "lucide-react";
import { joinName } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Glidertech" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme, mode, toggleMode } = useTheme();
  const { user, logout } = useAuth();
  const org = user?.organization ?? {};
  const initialOrg = useMemo(
    () => ({
      name: org.name ?? "Converge",
      emailAddress: (user?.emailAddress ?? user?.email ?? "admin@converge.example") as string,
      phoneNumber: "+234 1 700 4410",
      address: "12 Admiralty Way, Lekki Phase 1, Lagos",
      website: "https://converge.example",
      logo: org.logo ?? "/converge-org-icon.png",
    }),
    [org.logo, org.name, user?.email, user?.emailAddress],
  );
  const [orgForm, setOrgForm] = useState(initialOrg);

  function updateOrg<K extends keyof typeof orgForm>(key: K, value: (typeof orgForm)[K]) {
    setOrgForm((current) => ({ ...current, [key]: value }));
  }

  function saveOrgSettings() {
    toast.success("Organization settings saved locally");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Personalize your workspace and manage session preferences."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                Mode
              </Label>
              <Button variant="outline" onClick={toggleMode} className="gap-2">
                {mode === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {mode === "dark" ? "Dark" : "Light"} mode
              </Button>
            </div>
            <div>
              <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                Color palette
              </Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {THEME_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setTheme(o.value)}
                    className={`group relative flex items-center gap-2 rounded-md border p-3 text-left text-sm transition-colors hover:bg-accent ${theme === o.value ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
                  >
                    <span
                      className="h-6 w-6 rounded-full border"
                      style={{ backgroundColor: o.swatch }}
                    />
                    <span className="flex-1 truncate">{o.label}</span>
                    {theme === o.value && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border bg-muted/30 p-4">
              <div className="text-sm font-medium">
                {joinName((user ?? {}) as Record<string, unknown>)}
              </div>
              <div className="text-xs text-muted-foreground">
                {user?.emailAddress ?? user?.email ?? "—"}
              </div>
              {user?.organization?.name && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Organization: <span className="text-foreground">{user.organization.name}</span>
                </div>
              )}
            </div>
            <Button variant="destructive" onClick={logout}>
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organization settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <img
              src={orgForm.logo}
              alt={orgForm.name}
              className="h-20 w-20 rounded-md object-cover ring-1 ring-border"
            />
            <div className="space-y-2">
              <Label htmlFor="org-logo">Organization logo</Label>
              <Input
                id="org-logo"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) updateOrg("logo", URL.createObjectURL(file));
                }}
              />
              <Button type="button" variant="outline" size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload logo
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <OrgField label="Organization name">
              <Input value={orgForm.name} onChange={(e) => updateOrg("name", e.target.value)} />
            </OrgField>
            <OrgField label="Email">
              <Input
                type="email"
                value={orgForm.emailAddress}
                onChange={(e) => updateOrg("emailAddress", e.target.value)}
              />
            </OrgField>
            <OrgField label="Phone">
              <Input
                value={orgForm.phoneNumber}
                onChange={(e) => updateOrg("phoneNumber", e.target.value)}
              />
            </OrgField>
            <OrgField label="Website">
              <Input
                value={orgForm.website}
                onChange={(e) => updateOrg("website", e.target.value)}
              />
            </OrgField>
            <OrgField label="Address" span>
              <Input
                value={orgForm.address}
                onChange={(e) => updateOrg("address", e.target.value)}
              />
            </OrgField>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveOrgSettings}>Save organization settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OrgField({
  label,
  children,
  span = false,
}: {
  label: string;
  children: React.ReactNode;
  span?: boolean;
}) {
  return (
    <div className={span ? "sm:col-span-2" : ""}>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      {children}
    </div>
  );
}
