import { Scale } from "lucide-react";

export function GlidertechLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
        <Scale className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <div className="text-base font-semibold tracking-tight">Glidertech</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Case Management
        </div>
      </div>
    </div>
  );
}

export function OrgMark({
  name,
  logo,
  className = "",
}: {
  name?: string | null;
  logo?: string | null;
  className?: string;
}) {
  const initials =
    (name ?? "GT")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "GT";
  if (logo) {
    return (
      <img
        src={logo}
        alt={name ?? "Organization"}
        className={`h-9 w-9 rounded-md object-cover ring-1 ring-sidebar-border ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground text-sm font-semibold ring-1 ring-sidebar-border ${className}`}
    >
      {initials}
    </div>
  );
}