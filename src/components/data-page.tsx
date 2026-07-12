import type { ReactNode } from "react";
import { LoadingState, EmptyState, ErrorState } from "@/components/data-state";

export function DataPane<T>({
  isLoading,
  error,
  data,
  onRetry,
  empty,
  children,
}: {
  isLoading: boolean;
  error: unknown;
  data: T[] | undefined | null;
  onRetry?: () => void;
  empty: ReactNode;
  children: (data: T[]) => ReactNode;
}) {
  if (isLoading) return <LoadingState />;
  if (error) {
    const msg = error instanceof Error ? error.message : "Failed to load";
    return <ErrorState message={msg} onRetry={onRetry} />;
  }
  const list = data ?? [];
  if (list.length === 0) return <>{empty}</>;
  return <>{children(list)}</>;
}