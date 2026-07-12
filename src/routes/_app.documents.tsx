import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api, unwrapList } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText, Search, ExternalLink, Download } from "lucide-react";
import { DataPane } from "@/components/data-page";
import { EmptyState } from "@/components/data-state";
import { fmtDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/documents")({
  head: () => ({ meta: [{ title: "Documents — D-CASE" }] }),
  component: DocumentsPage,
});

interface DocRow { publicId?: string; title?: string; url?: string; type?: string; caseId?: string; createdAt?: string; [k: string]: unknown }

function DocumentsPage() {
  const [q, setQ] = useState("");
  const query = useQuery({ queryKey: ["documents"], queryFn: async () => unwrapList<DocRow>(await api("/document")) });
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (query.data ?? []).filter((r) => !s || JSON.stringify(r).toLowerCase().includes(s));
  }, [query.data, q]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Uploads and linked online documents attached to your matters."
        actions={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Add document</Button>}
      />
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search documents…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>
      <DataPane
        isLoading={query.isLoading}
        error={query.error}
        data={rows}
        onRetry={() => query.refetch()}
        empty={<EmptyState icon={<FileText className="h-6 w-6" />} title="No documents yet" description="Upload a file or link an online document to a case." />}
      >
        {(list) => (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((d, i) => (
              <Card key={(d.publicId as string) ?? i} className="transition-shadow hover:shadow-sm">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="capitalize">{d.type ?? "document"}</Badge>
                  </div>
                  <div>
                    <div className="line-clamp-2 text-sm font-medium">{d.title ?? "Untitled document"}</div>
                    <div className="mt-1 text-xs text-muted-foreground">Added {fmtDate(d.createdAt)}</div>
                  </div>
                  {d.url && (
                    <a href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                      {d.type === "online" ? <><ExternalLink className="h-3 w-3" /> Open</> : <><Download className="h-3 w-3" /> Download</>}
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DataPane>
    </div>
  );
}