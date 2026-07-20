import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GlidertechLogo } from "@/components/glidertech-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Loader2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — D-CASE" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login, token, ready } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && token) navigate({ to: "/dashboard", replace: true });
  }, [ready, token, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Sign in failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen w-full bg-background text-foreground lg:grid-cols-2">
      <div
        className="relative hidden flex-col justify-between p-10 text-white lg:flex bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.png')" }}
      >
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/75 via-slate-900/40 to-slate-950/70" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <GlidertechLogo className="text-white" />
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-widest text-white/90 backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              Trusted by legal teams
            </div>
            <h1 className="max-w-md text-3xl font-semibold leading-tight tracking-tight text-white">
              The calm, precise workspace your firm has been waiting for.
            </h1>
            <p className="max-w-md text-sm text-white/80">
              Track matters, clients, tasks, filings and hearings in one professional dashboard
              built for the pace and rigour of legal practice.
            </p>
          </div>
          <div className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Glidertech. All rights reserved.
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden">
            <GlidertechLogo />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your firm's case management dashboard.
            </p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username or email</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to your organization's terms of use.
          </p>
        </div>
      </div>
    </div>
  );
}
