import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api, unwrapList } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Briefcase, Search, Star, Eye, Receipt, Calendar, Pencil, Archive, StickyNote } from "lucide-react";
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
import { toast } from "sonner";

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
  const [court, setCourt] = useState<string>("all");
  const [starred, setStarred] = useState<Record<string, boolean>>({});

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
      const matchCourt = court === "all" || (r.court ?? "").toLowerCase() === court;
      const id = (r.publicId as string) ?? "";
      const matchTab =
        tab === "all" ||
        (tab === "starred" && starred[id]) ||
        (tab === "archived" && (r.status ?? "").toLowerCase() === "closed") ||
        (tab !== "starred" && tab !== "archived" && (r.type ?? "").toLowerCase() === tab);
      return matchQ && matchStatus && matchCourt && matchTab;
    });
  }, [query.data, q, status, court, tab, starred]);

  const courts = useMemo(() => {
    const set = new Set<string>();
    (query.data ?? []).forEach((r) => r.court && set.add(r.court));
    return Array.from(set);
  }, [query.data]);

  const toggleStar = (id: string) => setStarred((s) => ({ ...s, [id]: !s[id] }));

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
          <TabsTrigger value="starred">Starred</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
          <TabsTrigger value="litigation">Litigation</TabsTrigger>
          <TabsTrigger value="appeal">Appeal</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          <SelectTrigger><SelectValue placeholder="Case Stage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={court} onValueChange={setCourt}>
          <SelectTrigger><SelectValue placeholder="Filter by Court" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courts</SelectItem>
            {courts.map((c) => (
              <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input placeholder="Hearing date…" type="date" />
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
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Suit no.</TableHead>
                  <TableHead>Suit name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Court</TableHead>
                  <TableHead>Filed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => {
                  const id = (r.publicId as string) ?? String(i);
                  const isStarred = !!starred[id];
                  return (
                  <TableRow key={id}>
                    <TableCell>
                      <button onClick={() => toggleStar(id)} className="text-muted-foreground hover:text-amber-500" aria-label="Star case">
                        <Star className={`h-4 w-4 ${isStarred ? "fill-amber-400 text-amber-500" : ""}`} />
                      </button>
                    </TableCell>
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
                    <TableCell>
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs" onClick={() => toast("View case")}>
                          <Eye className="h-3 w-3" /> View
                        </Button>
                        <Button size="sm" className="h-7 gap-1 bg-sky-500 px-2 text-xs text-white hover:bg-sky-600" onClick={() => toast("Manage fees")}>
                          <Receipt className="h-3 w-3" /> Fees
                        </Button>
                        <Button size="sm" className="h-7 gap-1 bg-emerald-500 px-2 text-xs text-white hover:bg-emerald-600" onClick={() => toast("Manage hearing dates")}>
                          <Calendar className="h-3 w-3" /> Hearing
                        </Button>
                        <Button size="sm" className="h-7 gap-1 bg-amber-500 px-2 text-xs text-white hover:bg-amber-600" onClick={() => toast("Edit case")}>
                          <Pencil className="h-3 w-3" /> Edit
                        </Button>
                        <Button size="sm" className="h-7 gap-1 bg-rose-500 px-2 text-xs text-white hover:bg-rose-600" onClick={() => toast("Case archived")}>
                          <Archive className="h-3 w-3" /> Archive
                        </Button>
                        <Button size="sm" className="h-7 gap-1 bg-violet-500 px-2 text-xs text-white hover:bg-violet-600" onClick={() => toast("Add note")}>
                          <StickyNote className="h-3 w-3" /> Notes
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DataPane>
      </Card>

      <CreateCaseDrawer open={open} onOpenChange={setOpen} />
    </div>
  );
}
