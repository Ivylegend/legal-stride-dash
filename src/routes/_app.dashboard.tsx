import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, unwrapList } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users2, UserRound, FileText, CheckSquare, Bell, Building2, ShieldCheck, Star, Archive, BookOpen, Inbox } from "lucide-react";
import { LoadingState, EmptyState } from "@/components/data-state";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — D-CASE" }] }),
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

type Tone = "blue" | "green" | "amber" | "red" | "indigo" | "rose" | "sky" | "violet";

const TONES: Record<Tone, string> = {
  blue: "from-sky-500 to-sky-600",
  green: "from-emerald-500 to-emerald-600",
  amber: "from-amber-500 to-amber-600",
  red: "from-rose-500 to-rose-600",
  indigo: "from-indigo-500 to-indigo-600",
  rose: "from-pink-500 to-rose-600",
  sky: "from-cyan-500 to-sky-600",
  violet: "from-violet-500 to-purple-600",
};

function SummaryCard({ label, icon: Icon, value, loading, tone = "blue" }: { label: string; icon: LucideIcon; value: number | null | undefined; loading: boolean; tone?: Tone }) {
  return (
    <Card className={`relative overflow-hidden border-0 bg-gradient-to-br ${TONES[tone]} text-white shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg`}>
      <CardContent className="relative p-5">
        <div className="text-3xl font-bold tabular-nums leading-none">
          {loading ? "…" : value ?? "—"}
        </div>
        <div className="mt-1 text-sm font-medium text-white/90">{label}</div>
        <div className="mt-3 text-[11px] uppercase tracking-wider text-white/70">More info →</div>
        <Icon className="pointer-events-none absolute -right-2 -bottom-2 h-20 w-20 text-white/15" strokeWidth={1.5} />
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
        <SummaryCard tone="sky" label="Clients" icon={Users2} value={clients.data ?? 0} loading={clients.isLoading} />
        <SummaryCard tone="green" label="Cases" icon={Briefcase} value={cases.data ?? 0} loading={cases.isLoading} />
        <SummaryCard tone="amber" label="Starred Cases" icon={Star} value={0} loading={false} />
        <SummaryCard tone="rose" label="Archived Cases" icon={Archive} value={0} loading={false} />
        <SummaryCard tone="indigo" label="Contacts" icon={UserRound} value={contacts.data ?? 0} loading={contacts.isLoading} />
        <SummaryCard tone="red" label="Tasks" icon={CheckSquare} value={tasks.data ?? 0} loading={tasks.isLoading} />
        <SummaryCard tone="violet" label="Documents" icon={FileText} value={documents.data ?? 0} loading={documents.isLoading} />
        <SummaryCard tone="blue" label="Notifications" icon={Bell} value={notifications.data ?? 0} loading={notifications.isLoading} />
        <SummaryCard tone="sky" label="Case Study" icon={BookOpen} value={0} loading={false} />
        <SummaryCard tone="green" label="My Tasks" icon={Inbox} value={tasks.data ?? 0} loading={tasks.isLoading} />
        <SummaryCard tone="indigo" label="Admin Users" icon={ShieldCheck} value={admins.data ?? 0} loading={admins.isLoading} />
        <SummaryCard tone="amber" label="Organizations" icon={Building2} value={orgs.data ?? 0} loading={orgs.isLoading} />
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