import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, API_BASE_URL, tokenStore } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports — D-CASE" }] }),
  component: ReportsPage,
});

const REPORTS = [
  { key: "tasks", label: "Tasks report", path: "/admin/tasks", download: "/admin/tasks/download" },
  { key: "clients", label: "Clients report", path: "/admin/clients", download: "/admin/clients/download" },
  { key: "users", label: "Users report", path: "/admin/users", download: "/admin/users/download" },
  { key: "cases", label: "Cases report", path: "/admin/cases", download: "/admin/cases/download" },
  { key: "contacts", label: "Contacts report", path: "/admin/contacts", download: "/admin/contacts/download" },
];

async function download(path: string, name: string) {
  try {
    const t = tokenStore.get();
    const res = await fetch(`${API_BASE_URL}${path}`, { headers: t ? { Authorization: `Bearer ${t}` } : {} });
    if (!res.ok) throw new Error(`Download failed (${res.status})`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${name}.csv`; a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Download failed");
  }
}

function ReportCard({ label, path, dl }: { label: string; path: string; dl: string }) {
  const q = useQuery({
    queryKey: ["report", path],
    queryFn: async () => {
      try { return await api(path); } catch { return null; }
    },
  });
  const summary = ((q.data as { data?: { summary?: Record<string, Record<string, number>> } } | null)?.data?.summary) ?? null;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">{label}</CardTitle>
        <Button variant="outline" size="sm" onClick={() => download(dl, label.replace(/\s+/g, "-").toLowerCase())}>
          <Download className="mr-1.5 h-4 w-4" /> CSV
        </Button>
      </CardHeader>
      <CardContent>
        {q.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : q.error || !q.data ? (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Report currently unavailable.</div>
        ) : summary ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Object.entries(summary.overall ?? summary.thisWeek ?? {}).map(([k, v]) => (
              <div key={k} className="rounded-md border border-border bg-muted/30 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
                <div className="text-lg font-semibold tabular-nums">{v}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Available. Download the CSV for full data.</div>
        )}
      </CardContent>
    </Card>
  );
}

function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Operational summaries across the firm. Download raw data as CSV." />
      <div className="grid gap-4 md:grid-cols-2">
        {REPORTS.map((r) => <ReportCard key={r.key} label={r.label} path={r.path} dl={r.download} />)}
      </div>
    </div>
  );
}