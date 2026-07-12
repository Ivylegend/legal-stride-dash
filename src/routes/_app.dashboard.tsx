import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, unwrapList } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users2, UserRound, FileText, CheckSquare, Bell, Building2, ShieldCheck } from "lucide-react";
import { LoadingState, EmptyState } from "@/components/data-state";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Glidertech" }] }),
  component: DashboardPage,
});

function useCount(path: string) {
  return useQuery({
    queryKey: ["count", path],
    queryFn: async () => {
      try {
        const r = await api(path);
        return unwrapList(r).length;
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
  });
}

function SummaryCard({ label, icon: Icon, value, loading }: { label: string; icon: LucideIcon; value: number | null | undefined; loading: boolean }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold tabular-nums">
            {loading ? "…" : value ?? "—"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardPage() {
  const cases = useCount("/case");
  const clients = useCount("/client");
  const contacts = useCount("/contact");
  const documents = useCount("/document");
  const tasks = useCount("/task");
  const notifications = useCount("/notification");
  const admins = useCount("/admin/user");
  const orgs = useCount("/super-admin/organization");

  const isLoading = [cases, clients, contacts, documents, tasks, notifications].some((q) => q.isLoading);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="A snapshot of your firm's active matters, people, and workload."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        <SummaryCard label="Cases" icon={Briefcase} value={cases.data ?? 0} loading={cases.isLoading} />
        <SummaryCard label="Clients" icon={Users2} value={clients.data ?? 0} loading={clients.isLoading} />
        <SummaryCard label="Contacts" icon={UserRound} value={contacts.data ?? 0} loading={contacts.isLoading} />
        <SummaryCard label="Documents" icon={FileText} value={documents.data ?? 0} loading={documents.isLoading} />
        <SummaryCard label="Tasks" icon={CheckSquare} value={tasks.data ?? 0} loading={tasks.isLoading} />
        <SummaryCard label="Notifications" icon={Bell} value={notifications.data ?? 0} loading={notifications.isLoading} />
        <SummaryCard label="Admin Users" icon={ShieldCheck} value={admins.data ?? 0} loading={admins.isLoading} />
        <SummaryCard label="Organizations" icon={Building2} value={orgs.data ?? 0} loading={orgs.isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingState label="Fetching activity…" />
            ) : (
              <EmptyState
                title="No recent activity yet"
                description="Once your firm creates cases, tasks or documents, activity will appear here."
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Upcoming hearings</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState title="No hearings scheduled" description="Hearing dates from your cases will surface here." />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}