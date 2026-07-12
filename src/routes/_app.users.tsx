import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api, unwrapList } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, ShieldCheck, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataPane } from "@/components/data-page";
import { EmptyState } from "@/components/data-state";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { joinName } from "@/lib/format";
import { TableRowActions } from "@/components/table-row-actions";

export const Route = createFileRoute("/_app/users")({
  head: () => ({ meta: [{ title: "Users — Glidertech" }] }),
  component: UsersPage,
});

interface UserRow {
  id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  emailAddress?: string;
  phoneNumber?: string;
  countryCode?: string;
  privilege?: string;
  status?: string;
  isEnabled?: boolean;
  isSuperAdmin?: boolean;
  isOrganizationAdmin?: boolean;
  [k: string]: unknown;
}

function UsersPage() {
  const [q, setQ] = useState("");
  const query = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => unwrapList<UserRow>(await api("/admin/user")),
  });
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (query.data ?? []).filter((r) => !s || JSON.stringify(r).toLowerCase().includes(s));
  }, [query.data, q]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin users"
        description="Team members with access to your firm's workspace. Adding a user sends an invitation."
        actions={
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" /> Invite user
          </Button>
        }
      />
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>
      <Card className="overflow-hidden">
        <DataPane
          isLoading={query.isLoading}
          error={query.error}
          data={rows}
          onRetry={() => query.refetch()}
          empty={
            <EmptyState
              icon={<ShieldCheck className="h-6 w-6" />}
              title="No users yet"
              description="Invite colleagues to collaborate on matters."
            />
          }
        >
          {(list) => (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((r, i) => (
                  <TableRow key={(r.id as string) ?? i}>
                    <TableCell className="font-medium">
                      {joinName(r as Record<string, unknown>)}
                    </TableCell>
                    <TableCell>{r.emailAddress ?? "—"}</TableCell>
                    <TableCell>
                      {r.phoneNumber ? `+${r.countryCode ?? ""} ${r.phoneNumber}` : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {r.isSuperAdmin && <Badge>Super admin</Badge>}
                        {r.isOrganizationAdmin && <Badge variant="secondary">Org admin</Badge>}
                        {r.privilege && (
                          <Badge variant="outline" className="capitalize">
                            {r.privilege}
                          </Badge>
                        )}
                        {!r.isSuperAdmin && !r.isOrganizationAdmin && !r.privilege && (
                          <span className="text-xs text-muted-foreground">Member</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.isEnabled ? "enabled" : (r.status ?? "disabled")} />
                    </TableCell>
                    <TableCell className="text-right">
                      <TableRowActions extraActions={["Reset password", "Change role"]} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DataPane>
      </Card>
    </div>
  );
}
