import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/lib/auth";
import { LoadingState } from "@/components/data-state";

export const Route = createFileRoute("/_app")({
  component: AppGate,
});

function AppGate() {
  const { ready, token } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (ready && !token) navigate({ to: "/login", replace: true });
  }, [ready, token, navigate]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState label="Loading your workspace…" />
      </div>
    );
  }
  if (!token) return null;
  return <AppLayout />;
}