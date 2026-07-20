import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api, unwrapList } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Building2, Search } from "lucide-react";
import { DataPane } from "@/components/data-page";
import { EmptyState } from "@/components/data-state";
import { StatusBadge } from "@/components/status-badge";
import { OrgMark } from "@/components/glidertech-logo";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_app/organizations")({
  head: () => ({ meta: [{ title: "Organizations — D-CASE" }] }),
  component: OrganizationsPage,
});

interface OrgRow { publicId?: string; id?: string; name?: string; email?: string; emailAddress?: string; isEnabled?: boolean; createdAt?: string; logo?: string | null; phoneNumber?: string; address?: string; [k: string]: unknown }

function OrganizationsPage() {
  const [q, setQ] = useState("");
  const query = useQuery({ queryKey: ["orgs"], queryFn: async () => unwrapList<OrgRow>(await api("/super-admin/organization")) });
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (query.data ?? []).filter((r) => !s || JSON.stringify(r).toLowerCase().includes(s));
  }, [query.data, q]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizations"
        description="Firms and tenants managed under super-admin. Handle enable/disable carefully."
        actions={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> New organization</Button>}
      />
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search organizations…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>
      <DataPane
        isLoading={query.isLoading}
        error={query.error}
        data={rows}
        onRetry={() => query.refetch()}
        empty={<EmptyState icon={<Building2 className="h-6 w-6" />} title="No organizations yet" description="Onboard the first firm to begin." />}
      >
        {(list) => (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((o, i) => (
              <Card key={(o.publicId as string) ?? (o.id as string) ?? i}>
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <OrgMark name={o.name} logo={o.logo} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{o.name ?? "—"}</div>
                        <div className="truncate text-xs text-muted-foreground">{o.emailAddress ?? o.email ?? ""}</div>
                      </div>
                    </div>
                    <StatusBadge status={o.isEnabled ? "enabled" : "disabled"} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div><span className="block text-[10px] uppercase tracking-wider">Phone</span><span className="text-foreground">{o.phoneNumber ?? "—"}</span></div>
                    <div><span className="block text-[10px] uppercase tracking-wider">Onboarded</span><span className="text-foreground">{fmtDate(o.createdAt)}</span></div>
                    <div className="col-span-2"><span className="block text-[10px] uppercase tracking-wider">Address</span><span className="text-foreground">{o.address ?? "—"}</span></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DataPane>
    </div>
  );
}