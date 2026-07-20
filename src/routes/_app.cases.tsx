import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api, unwrapList } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Briefcase, Search } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
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
import { fmtDate, pick } from "@/lib/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateCaseDrawer } from "@/components/forms/create-case-drawer";
import { TableRowActions } from "@/components/table-row-actions";

export const Route = createFileRoute("/_app/cases")({
  head: () => ({ meta: [{ title: "Cases — D-CASE" }] }),
  component: CasesPage,
});

interface CaseRow {
  publicId?: string;
  suitNumber?: string;
  suitName?: string;
  type?: string;
  filingDate?: string;
  court?: string;
  status?: string;
  createdAt?: string;
  [k: string]: unknown;
}

function CasesPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [tab, setTab] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const query = useQuery({
    queryKey: ["cases"],
    queryFn: async () => unwrapList<CaseRow>(await api("/case")),
  });

  const filtered = useMemo(() => {
    const rows = query.data ?? [];
    return rows.filter((r) => {
      const s = q.trim().toLowerCase();
      const matchQ =
        !s ||
        [r.suitNumber, r.suitName, r.court, r.type].some((v) =>
          (v ?? "").toString().toLowerCase().includes(s),
        );
      const matchStatus = status === "all" || (r.status ?? "").toLowerCase() === status;
      const matchTab = tab === "all" || (r.type ?? "").toLowerCase() === tab;
      return matchQ && matchStatus && matchTab;
    });
  }, [query.data, q, status, tab]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cases"
        description="Manage litigation, appeals and all matters your firm handles."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> New case
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="litigation">Litigation</TabsTrigger>
          <TabsTrigger value="appeal">Appeal</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by suit number, name or court…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        <DataPane
          isLoading={query.isLoading}
          error={query.error}
          data={filtered}
          onRetry={() => query.refetch()}
          empty={
            <EmptyState
              icon={<Briefcase className="h-6 w-6" />}
              title="No cases yet"
              description="Create your first matter to start tracking filings, hearings, parties and documents."
              action={
                <Button onClick={() => setOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> New case
                </Button>
              }
            />
          }
        >
          {(rows) => (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Suit no.</TableHead>
                  <TableHead>Suit name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Court</TableHead>
                  <TableHead>Filed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={(r.publicId as string) ?? i}>
                    <TableCell className="font-mono text-xs">{r.suitNumber ?? "—"}</TableCell>
                    <TableCell className="font-medium">
                      {r.suitName ?? pick<string>(r, "title", "name") ?? "—"}
                    </TableCell>
                    <TableCell className="capitalize">{r.type ?? "—"}</TableCell>
                    <TableCell>{r.court ?? "—"}</TableCell>
                    <TableCell>{fmtDate(r.filingDate)}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <TableRowActions extraActions={["Assign counsel", "Add hearing"]} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DataPane>
      </Card>

      <CreateCaseDrawer open={open} onOpenChange={setOpen} />
    </div>
  );
}
