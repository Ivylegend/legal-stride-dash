import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function CreateCaseDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();
  const [form, setForm] = useState({
    suitNumber: "", suitName: "", type: "litigation", court: "", filingDate: "",
    plaintiffs: "", defendants: "", representation: "", nextHearing: "", notes: "",
  });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    setSaving(true);
    try {
      await api("/case", { method: "POST", body: form });
      toast.success("Case created");
      qc.invalidateQueries({ queryKey: ["cases"] });
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create case");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>New case</SheetTitle>
          <SheetDescription>Add a new matter. You can edit and add parties later.</SheetDescription>
        </SheetHeader>
        <div className="space-y-6 py-6">
          <Section title="Basic case info">
            <Field label="Suit number"><Input value={form.suitNumber} onChange={(e) => update("suitNumber", e.target.value)} /></Field>
            <Field label="Suit name"><Input value={form.suitName} onChange={(e) => update("suitName", e.target.value)} /></Field>
            <Field label="Type">
              <Select value={form.type} onValueChange={(v) => update("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="litigation">Litigation</SelectItem>
                  <SelectItem value="appeal">Appeal</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Filing date"><Input type="date" value={form.filingDate} onChange={(e) => update("filingDate", e.target.value)} /></Field>
          </Section>
          <Separator />
          <Section title="Court info">
            <Field label="Court" span={2}><Input value={form.court} onChange={(e) => update("court", e.target.value)} /></Field>
            <Field label="Next hearing"><Input type="date" value={form.nextHearing} onChange={(e) => update("nextHearing", e.target.value)} /></Field>
          </Section>
          <Separator />
          <Section title="Parties">
            <Field label="Plaintiff(s)"><Input value={form.plaintiffs} onChange={(e) => update("plaintiffs", e.target.value)} /></Field>
            <Field label="Defendant(s)"><Input value={form.defendants} onChange={(e) => update("defendants", e.target.value)} /></Field>
          </Section>
          <Separator />
          <Section title="Representation & notes">
            <Field label="Counsel"><Input value={form.representation} onChange={(e) => update("representation", e.target.value)} /></Field>
            <Field label="Notes" span={2}><Textarea rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} /></Field>
          </Section>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Saving…" : "Create case"}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}
function Field({ label, children, span = 1 }: { label: string; children: React.ReactNode; span?: 1 | 2 }) {
  return (
    <div className={span === 2 ? "sm:col-span-2" : ""}>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      {children}
    </div>
  );
}