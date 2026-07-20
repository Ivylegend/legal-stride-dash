import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/lib/auth";
import { LoadingState } from "@/components/data-state";
import { canAccessPath } from "@/lib/access";

export const Route = createFileRoute("/_app")({
  component: AppGate,
});

function AppGate() {
  const { ready, token, user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (!canAccessPath(pathname, user)) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [navigate, pathname, ready, token, user]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState label="Loading your workspace…" />
      </div>
    );
  }
  if (!token || !canAccessPath(pathname, user)) return null;
  return <AppLayout />;
}
