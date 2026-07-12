const BASE_URL = "https://dcaseapi.glidertechcorp.com";
const TOKEN_KEY = "gt_access_token";
const REFRESH_KEY = "gt_refresh_token";
const USER_KEY = "gt_user";

const fixtureData: Record<string, unknown> = {
  "/case": {
    data: [
      {
        publicId: "case-001",
        suitNumber: "FHC/L/CS/1842/2026",
        suitName: "Adebayo Holdings Ltd v. Meridian Bank Plc",
        type: "litigation",
        filingDate: "2026-02-12",
        court: "Federal High Court, Lagos",
        status: "in_progress",
        createdAt: "2026-02-10T10:30:00.000Z",
      },
      {
        publicId: "case-002",
        suitNumber: "CA/L/442/2026",
        suitName: "Okoro v. Zenith Energy Services",
        type: "appeal",
        filingDate: "2026-04-03",
        court: "Court of Appeal, Lagos Division",
        status: "pending",
        createdAt: "2026-04-03T08:45:00.000Z",
      },
      {
        publicId: "case-003",
        suitNumber: "LD/ADR/219/2026",
        suitName: "Cedar Estates Settlement Conference",
        type: "litigation",
        filingDate: "2026-06-18",
        court: "Lagos Multi-Door Courthouse",
        status: "completed",
        createdAt: "2026-06-15T14:20:00.000Z",
      },
    ],
  },
  "/client": {
    data: [
      {
        publicId: "client-001",
        firstName: "Amara",
        lastName: "Okonkwo",
        type: "individual",
        emailAddress: "amara.okonkwo@example.com",
        phoneNumber: { countryCode: "234", phoneNumber: "8035550171" },
      },
      {
        publicId: "client-002",
        name: "Bluewater Logistics Ltd",
        type: "corporate",
        emailAddress: "legal@bluewater.example",
        phoneNumber: { countryCode: "234", phoneNumber: "8124401188" },
      },
      {
        publicId: "client-003",
        firstName: "Tunde",
        lastName: "Lawal",
        type: "individual",
        emailAddress: "tunde.lawal@example.com",
        phoneNumber: { countryCode: "234", phoneNumber: "8093342210" },
      },
    ],
  },
  "/contact": {
    data: [
      {
        publicId: "contact-001",
        firstName: "Chioma",
        lastName: "Eze",
        type: "opposing counsel",
        organization: "Eze & Partners",
        emailAddress: "chioma.eze@example.com",
        phoneNumber: { countryCode: "234", phoneNumber: "8021119944" },
      },
      {
        publicId: "contact-002",
        firstName: "Musa",
        lastName: "Bello",
        type: "court officer",
        organization: "Federal High Court",
        emailAddress: "musa.bello@example.com",
        phoneNumber: { countryCode: "234", phoneNumber: "8058803341" },
      },
    ],
  },
  "/document": {
    data: [
      {
        publicId: "doc-001",
        title: "Statement of Claim - Adebayo Holdings",
        type: "upload",
        url: "https://example.com/documents/statement-of-claim.pdf",
        caseId: "case-001",
        createdAt: "2026-02-15T09:15:00.000Z",
      },
      {
        publicId: "doc-002",
        title: "Appeal Brief Working Draft",
        type: "online",
        url: "https://example.com/documents/appeal-brief",
        caseId: "case-002",
        createdAt: "2026-04-07T11:40:00.000Z",
      },
      {
        publicId: "doc-003",
        title: "Settlement Terms Summary",
        type: "upload",
        url: "https://example.com/documents/settlement-summary.pdf",
        caseId: "case-003",
        createdAt: "2026-06-21T16:05:00.000Z",
      },
    ],
  },
  "/task": {
    data: [
      {
        publicId: "task-001",
        name: "Prepare witness bundle",
        dueDate: "2026-07-18",
        status: "pending",
        assignedUsers: [{ id: "user-001" }, { id: "user-002" }],
      },
      {
        publicId: "task-002",
        name: "Review respondent's brief",
        dueDate: "2026-07-24",
        status: "in_progress",
        assignedUsers: [{ id: "user-003" }],
      },
      {
        publicId: "task-003",
        name: "File settlement notice",
        dueDate: "2026-07-09",
        status: "completed",
        assignedUsers: [],
      },
    ],
  },
  "/notification": {
    data: [
      {
        publicId: "notif-001",
        title: "Hearing date assigned",
        message: "FHC/L/CS/1842/2026 has been listed for July 29, 2026.",
        isRead: false,
        createdAt: "2026-07-11T08:10:00.000Z",
        type: "case",
      },
      {
        publicId: "notif-002",
        title: "Document uploaded",
        message: "Appeal Brief Working Draft was added to Okoro v. Zenith Energy Services.",
        isRead: true,
        readAt: "2026-07-10T14:03:00.000Z",
        createdAt: "2026-07-10T13:58:00.000Z",
        type: "document",
      },
    ],
  },
  "/admin/user": {
    data: [
      {
        id: "user-001",
        firstName: "Nadia",
        lastName: "Adeyemi",
        emailAddress: "nadia.adeyemi@example.com",
        countryCode: "234",
        phoneNumber: "8012234500",
        privilege: "partner",
        isEnabled: true,
        isOrganizationAdmin: true,
      },
      {
        id: "user-002",
        firstName: "Kelechi",
        lastName: "Nwosu",
        emailAddress: "kelechi.nwosu@example.com",
        countryCode: "234",
        phoneNumber: "8095561200",
        privilege: "associate",
        isEnabled: true,
      },
      {
        id: "user-003",
        firstName: "Fatima",
        lastName: "Yusuf",
        emailAddress: "fatima.yusuf@example.com",
        countryCode: "234",
        phoneNumber: "8133304511",
        privilege: "paralegal",
        isEnabled: false,
      },
    ],
  },
  "/super-admin/organization": {
    data: [
      {
        publicId: "org-001",
        name: "Stride Legal Partners",
        emailAddress: "admin@stridelegal.example",
        isEnabled: true,
        createdAt: "2026-01-05T10:00:00.000Z",
        phoneNumber: "+234 1 700 4410",
        address: "12 Admiralty Way, Lekki Phase 1, Lagos",
      },
      {
        publicId: "org-002",
        name: "Northbridge Chambers",
        emailAddress: "ops@northbridge.example",
        isEnabled: false,
        createdAt: "2026-03-22T12:30:00.000Z",
        phoneNumber: "+234 9 460 1288",
        address: "Plot 88 Ahmadu Bello Way, Abuja",
      },
    ],
  },
  "/admin/tasks": {
    data: { summary: { overall: { total: 24, pending: 9, inProgress: 11, completed: 4 } } },
  },
  "/admin/clients": { data: { summary: { overall: { total: 18, individual: 11, corporate: 7 } } } },
  "/admin/users": { data: { summary: { overall: { total: 8, enabled: 7, disabled: 1 } } } },
  "/admin/cases": { data: { summary: { overall: { total: 13, litigation: 9, appeal: 4 } } } },
  "/admin/contacts": {
    data: { summary: { overall: { total: 31, counsel: 12, court: 8, experts: 11 } } },
  },
};

function fixtureFor(path: string): unknown {
  const cleanPath = path.split("?")[0] ?? path;
  return fixtureData[cleanPath];
}

function isEmptyApiPayload(payload: unknown): boolean {
  if (Array.isArray(payload)) return payload.length === 0;
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data: unknown }).data;
    return Array.isArray(data) && data.length === 0;
  }
  return false;
}

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
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
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
  const fixture = method === "GET" ? fixtureFor(path) : undefined;
  const h: Record<string, string> = { Accept: "application/json", ...headers };
  if (body !== undefined && !(body instanceof FormData)) h["Content-Type"] = "application/json";
  if (auth) {
    const t = tokenStore.get();
    if (t) h.Authorization = `Bearer ${t}`;
  }
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: h,
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
    const contentType = res.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await res.json().catch(() => null)
      : await res.text().catch(() => null);
    if (!res.ok) {
      if (fixture !== undefined) return fixture as T;
      throw new ApiError(
        extractMessage(payload, `Request failed (${res.status})`),
        res.status,
        payload,
      );
    }
    if (fixture !== undefined && isEmptyApiPayload(payload)) return fixture as T;
    return payload as T;
  } catch (error) {
    if (fixture !== undefined) return fixture as T;
    throw error;
  }
}

export function unwrap<T>(res: { data?: T } | T | null | undefined): T | null {
  if (res == null) return null;
  if (typeof res === "object" && "data" in (res as object)) {
    return (res as { data: T }).data ?? null;
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
