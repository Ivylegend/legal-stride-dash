import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api, unwrapList, API_BASE_URL, tokenStore } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Users2, Search, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataPane } from "@/components/data-page";
import { EmptyState } from "@/components/data-state";
import { joinName } from "@/lib/format";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/clients")({
  head: () => ({ meta: [{ title: "Clients — Glidertech" }] }),
  component: ClientsPage,
});

interface ClientRow { publicId?: string; firstName?: string; lastName?: string; name?: string; type?: string; emailAddress?: string; phoneNumber?: unknown; [k: string]: unknown; }

function ClientsPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const query = useQuery({ queryKey: ["clients"], queryFn: async () => unwrapList<ClientRow>(await api("/client")) });

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return query.data ?? [];
    return (query.data ?? []).filter((r) => JSON.stringify(r).toLowerCase().includes(s));
  }, [query.data, q]);

  async function exportClients() {
    try {
      const t = tokenStore.get();
      const res = await fetch(`${API_BASE_URL}/client/export`, { headers: t ? { Authorization: `Bearer ${t}` } : {} });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "clients.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Individuals and corporate clients your firm represents."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={exportClients}><Download className="mr-1.5 h-4 w-4" /> Export</Button>
            <Button size="sm" onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> New client</Button>
          </>
        }
      />

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search clients…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>

      <Card className="overflow-hidden">
        <DataPane
          isLoading={query.isLoading}
          error={query.error}
          data={rows}
          onRetry={() => query.refetch()}
          empty={<EmptyState icon={<Users2 className="h-6 w-6" />} title="No clients yet" description="Add your first client to begin building your book of business." action={<Button onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> New client</Button>} />}
        >
          {(list) => (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((r, i) => {
                  const phone = r.phoneNumber as { countryCode?: string; phoneNumber?: string } | string | undefined;
                  const phoneStr = typeof phone === "string" ? phone : phone ? `+${phone.countryCode ?? ""} ${phone.phoneNumber ?? ""}` : "—";
                  return (
                    <TableRow key={(r.publicId as string) ?? i}>
                      <TableCell className="font-medium">{joinName(r as Record<string, unknown>)}</TableCell>
                      <TableCell className="capitalize">{r.type ?? "—"}</TableCell>
                      <TableCell>{r.emailAddress ?? "—"}</TableCell>
                      <TableCell>{phoneStr}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DataPane>
      </Card>

      <NewClientDrawer open={open} onOpenChange={setOpen} />
    </div>
  );
}

function NewClientDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState("individual");
  const [saving, setSaving] = useState(false);
  const [ind, setInd] = useState({ firstName: "", middleName: "", lastName: "", dateOfBirth: "", emailAddress: "", address: "", countryCode: "234", phoneNumber: "" });
  const [corp, setCorp] = useState({ name: "", emailAddress: "", address: "", countryCode: "234", phoneNumber: "" });

  async function submit() {
    setSaving(true);
    try {
      const body =
        tab === "individual"
          ? { firstName: ind.firstName, middleName: ind.middleName || null, lastName: ind.lastName, dateOfBirth: ind.dateOfBirth, type: "individual", emailAddress: ind.emailAddress, address: ind.address, phoneNumber: { countryCode: ind.countryCode, phoneNumber: ind.phoneNumber }, organizationId: null }
          : { name: corp.name, emailAddress: corp.emailAddress, type: "corporate", address: corp.address, phoneNumber: { countryCode: corp.countryCode, phoneNumber: corp.phoneNumber }, organizationId: null };
      await api("/client", { method: "POST", body });
      toast.success("Client created");
      qc.invalidateQueries({ queryKey: ["clients"] });
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to create client");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>New client</SheetTitle>
          <SheetDescription>Add an individual or corporate client. Entered details are kept if saving fails.</SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual">Individual</TabsTrigger>
              <TabsTrigger value="corporate">Corporate</TabsTrigger>
            </TabsList>
            <TabsContent value="individual" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <F label="First name"><Input value={ind.firstName} onChange={(e) => setInd({ ...ind, firstName: e.target.value })} /></F>
                <F label="Middle name"><Input value={ind.middleName} onChange={(e) => setInd({ ...ind, middleName: e.target.value })} /></F>
                <F label="Last name"><Input value={ind.lastName} onChange={(e) => setInd({ ...ind, lastName: e.target.value })} /></F>
                <F label="Date of birth"><Input type="date" value={ind.dateOfBirth} onChange={(e) => setInd({ ...ind, dateOfBirth: e.target.value })} /></F>
                <F label="Email" span={2}><Input type="email" value={ind.emailAddress} onChange={(e) => setInd({ ...ind, emailAddress: e.target.value })} /></F>
                <F label="Address" span={2}><Input value={ind.address} onChange={(e) => setInd({ ...ind, address: e.target.value })} /></F>
                <F label="Country code"><Input placeholder="234" value={ind.countryCode} onChange={(e) => setInd({ ...ind, countryCode: e.target.value })} /></F>
                <F label="Phone number"><Input value={ind.phoneNumber} onChange={(e) => setInd({ ...ind, phoneNumber: e.target.value })} /></F>
              </div>
            </TabsContent>
            <TabsContent value="corporate" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <F label="Company name" span={2}><Input value={corp.name} onChange={(e) => setCorp({ ...corp, name: e.target.value })} /></F>
                <F label="Email" span={2}><Input type="email" value={corp.emailAddress} onChange={(e) => setCorp({ ...corp, emailAddress: e.target.value })} /></F>
                <F label="Address" span={2}><Input value={corp.address} onChange={(e) => setCorp({ ...corp, address: e.target.value })} /></F>
                <F label="Country code"><Input placeholder="234" value={corp.countryCode} onChange={(e) => setCorp({ ...corp, countryCode: e.target.value })} /></F>
                <F label="Phone number"><Input value={corp.phoneNumber} onChange={(e) => setCorp({ ...corp, phoneNumber: e.target.value })} /></F>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Saving…" : "Create client"}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function F({ label, children, span = 1 }: { label: string; children: React.ReactNode; span?: 1 | 2 }) {
  return (
    <div className={span === 2 ? "col-span-2" : ""}>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      {children}
    </div>
  );
}

// Textarea import unused suppressor
void Textarea;