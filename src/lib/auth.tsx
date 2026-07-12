import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, tokenStore } from "./api";

export interface AuthUser {
  name?: string;
  email?: string;
  emailAddress?: string;
  role?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  organization?: {
    name?: string;
    logo?: string;
    id?: string | number;
  } | null;
  [k: string]: unknown;
}

interface AuthCtx {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const loadMe = useCallback(async () => {
    try {
      const res = await api<{ data: AuthUser }>("/auth/me");
      const u = (res as { data?: AuthUser })?.data ?? (res as AuthUser);
      setUser(u);
      tokenStore.saveUser(u);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const t = tokenStore.get();
    if (t) {
      setToken(t);
      setUser(tokenStore.getUser<AuthUser>());
      loadMe().finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [loadMe]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await api<{ data: { token: string; refresh_token?: string } }>("/auth/login", {
      method: "POST",
      body: { username, password },
      auth: false,
    });
    const data = (res as { data?: { token: string; refresh_token?: string } })?.data;
    if (!data?.token) throw new Error("Login response missing token");
    tokenStore.set(data.token, data.refresh_token);
    setToken(data.token);
    await loadMe();
  }, [loadMe]);

  const logout = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <Ctx.Provider value={{ user, token, ready, login, logout, refresh: loadMe }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}