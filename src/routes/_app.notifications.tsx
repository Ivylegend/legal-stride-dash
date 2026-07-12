import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrapList } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import { DataPane } from "@/components/data-page";
import { EmptyState } from "@/components/data-state";
import { fmtDateTime } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Glidertech" }] }),
  component: NotificationsPage,
});

interface NotifRow { publicId?: string; id?: string; title?: string; message?: string; body?: string; isRead?: boolean; readAt?: string | null; createdAt?: string; type?: string; [k: string]: unknown }

function NotificationsPage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["notifications"], queryFn: async () => unwrapList<NotifRow>(await api("/notification")) });

  async function markAll() {
    try { await api("/notification/read-all", { method: "POST" }); qc.invalidateQueries({ queryKey: ["notifications"] }); toast.success("All caught up"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Unable to mark all read"); }
  }

  const list = query.data ?? [];
  const unread = list.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={unread ? `${unread} unread` : "You're all caught up"}
        actions={<Button variant="outline" size="sm" onClick={markAll} disabled={!unread}><Check className="mr-1.5 h-4 w-4" /> Mark all read</Button>}
      />
      <Card className="overflow-hidden">
        <DataPane
          isLoading={query.isLoading}
          error={query.error}
          data={list}
          onRetry={() => query.refetch()}
          empty={<EmptyState icon={<Bell className="h-6 w-6" />} title="No notifications" description="System alerts and mentions will appear here." />}
        >
          {(items) => (
            <ul className="divide-y">
              {items.map((n, i) => (
                <li key={(n.publicId as string) ?? (n.id as string) ?? i} className="flex items-start gap-3 p-4">
                  <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.isRead ? "bg-muted-foreground/30" : "bg-primary"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{n.title ?? "Notification"}</div>
                    <div className="text-sm text-muted-foreground">{n.message ?? n.body ?? ""}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{fmtDateTime(n.createdAt)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DataPane>
      </Card>
    </div>
  );
}