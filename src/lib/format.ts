export function fmtDate(v: unknown): string {
  if (!v) return "—";
  try {
    const d = new Date(v as string);
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return String(v);
  }
}

export function pick<T = unknown>(o: unknown, ...keys: string[]): T | undefined {
  if (!o || typeof o !== "object") return undefined;
  for (const k of keys) {
    const v = (o as Record<string, unknown>)[k];
    if (v !== undefined && v !== null && v !== "") return v as T;
  }
  return undefined;
}

export function joinName(o: Record<string, unknown> | null | undefined): string {
  if (!o) return "—";
  const full = (o.fullName ?? o.name) as string | undefined;
  if (full) return full;
  const parts = [o.firstName, o.middleName, o.lastName].filter(Boolean);
  return parts.length ? parts.join(" ") : "—";
}

export function fmtDateTime(v: unknown): string {
  if (!v) return "—";
  try {
    const d = new Date(v as string);
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return String(v);
  }
}