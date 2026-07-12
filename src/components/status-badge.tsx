import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status?: string | null }) {
  const s = (status ?? "").toLowerCase();
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300",
    in_progress: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300",
    completed: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300",
    active: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300",
    enabled: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300",
    closed: "bg-muted text-muted-foreground",
    disabled: "bg-muted text-muted-foreground",
    overdue: "bg-red-100 text-red-800 border-red-200 dark:bg-red-500/15 dark:text-red-300",
  };
  const cls = map[s] ?? "bg-muted text-muted-foreground";
  return (
    <Badge variant="outline" className={cn("border font-medium capitalize", cls)}>
      {status ? status.replace(/_/g, " ") : "—"}
    </Badge>
  );
}