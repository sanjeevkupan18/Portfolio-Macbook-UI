import "server-only";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiFailure } from "@/types/message";
import { DatabaseNotConfiguredError } from "@/lib/db";
import { fieldErrorsFrom } from "@/lib/validation";

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fieldErrors?: Record<string, string>,
    public headers?: Record<string, string>,
  ) {
    super(message);
  }
}

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ ok: true, data }, { status, headers: { "Cache-Control": "no-store" } });
}

export function fail(status: number, code: string, message: string, fieldErrors?: Record<string, string>, headers?: Record<string, string>): NextResponse {
  const body: ApiFailure = { ok: false, error: { code, message, ...(fieldErrors ? { fieldErrors } : {}) } };
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

/** Wraps a route handler so every error becomes a consistent JSON failure. */
export async function handle(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof HttpError) return fail(error.status, error.code, error.message, error.fieldErrors, error.headers);
    if (error instanceof DatabaseNotConfiguredError) return fail(503, "db_not_configured", error.message);
    if (error instanceof ZodError) return fail(400, "validation_error", "Please check the highlighted fields.", fieldErrorsFrom(error));
    if (error instanceof SyntaxError) return fail(400, "bad_json", "Request body must be valid JSON.");
    console.error("[api] unhandled error:", error instanceof Error ? error.message : "unknown");
    return fail(500, "server_error", "Something went wrong on the server. Please try again.");
  }
}

export async function readJson(request: Request): Promise<unknown> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) throw new HttpError(415, "unsupported_media_type", "Content-Type must be application/json.");
  return request.json();
}

/** CSRF defence in depth (cookies are also SameSite=Strict): reject cross-origin mutations. */
export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) return; // same-origin fetches from some browsers omit it for GET; mutations from browsers include it
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    /* invalid origin */
  }
  if (!host || originHost !== host) throw new HttpError(403, "forbidden_origin", "Cross-origin requests are not allowed.");
}

/** Privacy-friendly rate-limit key: salted hash of the client IP, never the raw IP. */
export function clientKey(request: Request, scope: string): string {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const salt = process.env.ADMIN_SESSION_SECRET ?? "portfolio";
  return `${scope}:${createHash("sha256").update(`${salt}|${ip}`).digest("hex").slice(0, 32)}`;
}
