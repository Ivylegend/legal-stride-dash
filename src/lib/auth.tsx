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

const SUPER_ADMIN_EMAIL = "enuoma.iweze@gmail.com";
const SUPER_ADMIN_PASSWORD = "Dcase@1234!";

function createLocalUser(username: string, password: string): AuthUser {
  const isSuperAdmin =
    username.trim().toLowerCase() === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD;

  if (isSuperAdmin) {
    return {
      name: "Enuoma Iweze",
      fullName: "Enuoma Iweze",
      email: SUPER_ADMIN_EMAIL,
      emailAddress: SUPER_ADMIN_EMAIL,
      role: "super_admin",
      isSuperAdmin: true,
      organization: {
        id: "converge",
        name: "Converge",
        logo: "/converge-org-icon.png",
      },
    };
  }

  return {
    name: username || "Organization User",
    fullName: username || "Organization User",
    email: username,
    emailAddress: username,
    role: "organization_admin",
    isOrganizationAdmin: true,
    organization: {
      id: "converge",
      name: "Converge",
      logo: "/converge-org-icon.png",
    },
  };
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

  const login = useCallback(
    async (username: string, password: string) => {
      const localUser = createLocalUser(username, password);
      const localToken = `local-${localUser.role}-${Date.now()}`;
      tokenStore.set(localToken);
      tokenStore.saveUser(localUser);
      setToken(localToken);
      setUser(localUser);
    },
    [loadMe],
  );

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
