import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api, unwrapList } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, CheckSquare, Search } from "lucide-react";
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
import { fmtDate } from "@/lib/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableRowActions } from "@/components/table-row-actions";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Tasks — D-CASE" }] }),
  component: TasksPage,
});

interface TaskRow {
  publicId?: string;
  name?: string;
  dueDate?: string;
  status?: string;
  assignedUsers?: unknown[];
  litigation?: unknown;
  [k: string]: unknown;
}

function TasksPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const query = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => unwrapList<TaskRow>(await api("/task")),
  });
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (query.data ?? []).filter((r) => {
      if (status !== "all" && (r.status ?? "").toLowerCase() !== status) return false;
      return !s || JSON.stringify(r).toLowerCase().includes(s);
    });
  }, [query.data, q, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Track work-in-progress across matters, teams and hearings."
        actions={
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" /> New task
          </Button>
        }
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card className="overflow-hidden">
        <DataPane
          isLoading={query.isLoading}
          error={query.error}
          data={rows}
          onRetry={() => query.refetch()}
          empty={
            <EmptyState
              icon={<CheckSquare className="h-6 w-6" />}
              title="No tasks yet"
              description="Create tasks to keep your matters on schedule."
            />
          }
        >
          {(list) => (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((r, i) => (
                  <TableRow key={(r.publicId as string) ?? i}>
                    <TableCell className="font-medium">{r.name ?? "—"}</TableCell>
                    <TableCell>{fmtDate(r.dueDate)}</TableCell>
                    <TableCell>
                      {Array.isArray(r.assignedUsers) && r.assignedUsers.length
                        ? `${r.assignedUsers.length} user(s)`
                        : "Unassigned"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <TableRowActions extraActions={["Assign user", "Move due date"]} />
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
