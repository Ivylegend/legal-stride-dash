import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api, unwrapList } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, UserRound, Search } from "lucide-react";
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
import { joinName } from "@/lib/format";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { TableRowActions } from "@/components/table-row-actions";

export const Route = createFileRoute("/_app/contacts")({
  head: () => ({ meta: [{ title: "Contacts — Glidertech" }] }),
  component: ContactsPage,
});

interface ContactRow {
  publicId?: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  phoneNumber?: unknown;
  organization?: string | null;
  [k: string]: unknown;
}

function ContactsPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const query = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => unwrapList<ContactRow>(await api("/contact")),
  });

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return query.data ?? [];
    return (query.data ?? []).filter((r) => JSON.stringify(r).toLowerCase().includes(s));
  }, [query.data, q]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description="Firm contacts — opposing counsel, court officers, experts and referrals."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> New contact
          </Button>
        }
      />
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search contacts…"
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
              icon={<UserRound className="h-6 w-6" />}
              title="No contacts yet"
              description="Build your firm-wide contact directory."
              action={
                <Button onClick={() => setOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> New contact
                </Button>
              }
            />
          }
        >
          {(list) => (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="w-12 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((r, i) => {
                  const phone = r.phoneNumber as
                    { countryCode?: string; phoneNumber?: string } | undefined;
                  return (
                    <TableRow key={(r.publicId as string) ?? i}>
                      <TableCell className="font-medium">
                        {joinName(r as Record<string, unknown>)}
                      </TableCell>
                      <TableCell className="capitalize">{(r.type as string) ?? "—"}</TableCell>
                      <TableCell>{(r.organization as string) ?? "—"}</TableCell>
                      <TableCell>{r.emailAddress ?? "—"}</TableCell>
                      <TableCell>
                        {phone ? `+${phone.countryCode ?? ""} ${phone.phoneNumber ?? ""}` : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <TableRowActions
                          statusActions={false}
                          extraActions={["Link to case", "Send message"]}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DataPane>
      </Card>
      <NewContactDrawer open={open} onOpenChange={setOpen} />
    </div>
  );
}

function NewContactDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    type: "referral",
    emailAddress: "",
    address: "",
    countryCode: "234",
    phoneNumber: "",
    organization: "",
    notes: "",
  });
  async function submit() {
    setSaving(true);
    try {
      await api("/contact", {
        method: "POST",
        body: {
          firstName: f.firstName,
          middleName: f.middleName || null,
          lastName: f.lastName,
          dateOfBirth: f.dateOfBirth,
          type: f.type,
          emailAddress: f.emailAddress,
          address: f.address,
          phoneNumber: { countryCode: f.countryCode, phoneNumber: f.phoneNumber },
          organizationId: null,
          organization: f.organization || null,
          notes: f.notes,
        },
      });
      toast.success("Contact created");
      qc.invalidateQueries({ queryKey: ["contacts"] });
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to create contact");
    } finally {
      setSaving(false);
    }
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>New contact</SheetTitle>
          <SheetDescription>
            Country code should be entered without a plus sign, e.g. 234.
          </SheetDescription>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-3 py-6">
          <FF label="First name">
            <Input
              value={f.firstName}
              onChange={(e) => setF({ ...f, firstName: e.target.value })}
            />
          </FF>
          <FF label="Last name">
            <Input value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} />
          </FF>
          <FF label="Middle name">
            <Input
              value={f.middleName}
              onChange={(e) => setF({ ...f, middleName: e.target.value })}
            />
          </FF>
          <FF label="Date of birth">
            <Input
              type="date"
              value={f.dateOfBirth}
              onChange={(e) => setF({ ...f, dateOfBirth: e.target.value })}
            />
          </FF>
          <FF label="Email" span={2}>
            <Input
              type="email"
              value={f.emailAddress}
              onChange={(e) => setF({ ...f, emailAddress: e.target.value })}
            />
          </FF>
          <FF label="Address" span={2}>
            <Input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
          </FF>
          <FF label="Country code">
            <Input
              placeholder="234"
              value={f.countryCode}
              onChange={(e) => setF({ ...f, countryCode: e.target.value })}
            />
          </FF>
          <FF label="Phone number">
            <Input
              value={f.phoneNumber}
              onChange={(e) => setF({ ...f, phoneNumber: e.target.value })}
            />
          </FF>
          <FF label="Organization" span={2}>
            <Input
              value={f.organization}
              onChange={(e) => setF({ ...f, organization: e.target.value })}
            />
          </FF>
          <FF label="Notes" span={2}>
            <Textarea
              rows={3}
              value={f.notes}
              onChange={(e) => setF({ ...f, notes: e.target.value })}
            />
          </FF>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Saving…" : "Create contact"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function FF({
  label,
  children,
  span = 1,
}: {
  label: string;
  children: React.ReactNode;
  span?: 1 | 2;
}) {
  return (
    <div className={span === 2 ? "col-span-2" : ""}>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      {children}
    </div>
  );
}
