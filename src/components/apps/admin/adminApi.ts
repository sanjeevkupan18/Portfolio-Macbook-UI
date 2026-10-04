import type { ApiFailure, ApiResponse, ApiSuccess, ContactMessageDTO, MessageStats, MessageStatus } from "@/types/message";

export type ApiResult<T> = (ApiSuccess<T> | ApiFailure) & { status: number };

export type StatusFilter = "all" | MessageStatus;

export interface SessionData {
  authenticated: boolean;
  email?: string;
}

export interface MessagesPage {
  messages: ContactMessageDTO[];
  stats: MessageStats;
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const PAGE_SIZE = 20;

async function request<T>(path: string, init?: { method?: string; body?: unknown }): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      method: init?.method ?? "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    });
    try {
      const json = (await res.json()) as ApiResponse<T>;
      if (typeof json === "object" && json !== null && "ok" in json) return { ...json, status: res.status };
    } catch {
      // fall through to the generic error below
    }
    return { ok: false, status: res.status, error: { code: "bad_response", message: `Unexpected server response (${res.status}). Please try again.` } };
  } catch {
    return { ok: false, status: 0, error: { code: "network_error", message: "Couldn't reach the server. Check your connection and try again." } };
  }
}

export function isUnauthorized(res: ApiResult<unknown>): boolean {
  return !res.ok && (res.status === 401 || res.error.code === "unauthorized");
}

export const adminApi = {
  session: () => request<SessionData>("/api/admin/session"),
  login: (email: string, password: string) => request<{ email: string }>("/api/admin/login", { method: "POST", body: { email, password } }),
  logout: () => request<Record<string, never>>("/api/admin/logout", { method: "POST" }),
  list: (status: StatusFilter, q: string, page: number) => {
    const params = new URLSearchParams({ status, page: String(page), limit: String(PAGE_SIZE) });
    if (q.trim()) params.set("q", q.trim());
    return request<MessagesPage>(`/api/admin/messages?${params.toString()}`);
  },
  setStatus: (id: string, status: MessageStatus) =>
    request<{ message: ContactMessageDTO; stats: MessageStats }>(`/api/admin/messages/${encodeURIComponent(id)}`, { method: "PATCH", body: { status } }),
  remove: (id: string) => request<{ id: string; stats: MessageStats }>(`/api/admin/messages/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
