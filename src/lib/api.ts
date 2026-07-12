const BASE_URL = "https://dcaseapi.glidertechcorp.com";
const TOKEN_KEY = "gt_access_token";
const REFRESH_KEY = "gt_refresh_token";
const USER_KEY = "gt_user";

export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  set(t: string, r?: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TOKEN_KEY, t);
    if (r) window.localStorage.setItem(REFRESH_KEY, r);
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
    window.localStorage.removeItem(USER_KEY);
  },
  saveUser(u: unknown) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(USER_KEY, JSON.stringify(u));
  },
  getUser<T = unknown>(): T | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  },
};

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

function extractMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const p = payload as Record<string, unknown>;
  if (typeof p.message === "string") return p.message;
  if (typeof p.error === "string") return p.error;
  if (typeof p.detail === "string") return p.detail;
  if (typeof p.title === "string") return p.title;
  if (Array.isArray(p.violations) && p.violations.length) {
    const v = p.violations[0] as { message?: string };
    if (v?.message) return v.message;
  }
  return fallback;
}

export interface ApiOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, headers = {}, signal } = opts;
  const h: Record<string, string> = { Accept: "application/json", ...headers };
  if (body !== undefined && !(body instanceof FormData)) h["Content-Type"] = "application/json";
  if (auth) {
    const t = tokenStore.get();
    if (t) h.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: h,
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });
  const contentType = res.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await res.json().catch(() => null) : await res.text().catch(() => null);
  if (!res.ok) {
    throw new ApiError(extractMessage(payload, `Request failed (${res.status})`), res.status, payload);
  }
  return payload as T;
}

export function unwrap<T>(res: { data?: T } | T | null | undefined): T | null {
  if (res == null) return null;
  if (typeof res === "object" && "data" in (res as object)) {
    return ((res as { data: T }).data) ?? null;
  }
  return res as T;
}

export function unwrapList<T>(res: unknown): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  if (typeof res === "object" && res && "data" in res) {
    const d = (res as { data: unknown }).data;
    if (Array.isArray(d)) return d as T[];
  }
  return [];
}

export const API_BASE_URL = BASE_URL;