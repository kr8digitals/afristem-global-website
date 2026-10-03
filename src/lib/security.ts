/**
 * Shared security helpers.
 *
 * Two jobs:
 *
 * 1. `requireAdmin()` — defence in depth. The proxy (src/proxy.ts) already
 *    gates /admin and /api/admin, but every protected route handler also calls
 *    this, so a future change to the matcher can never silently expose data.
 *
 * 2. Rate limiting — the public forms and the admin login are the only
 *    endpoints an anonymous visitor can write to. A tiny in-memory sliding
 *    window is enough for a single-node deployment (Hostinger runs one Node
 *    process) and needs no external service.
 *
 * Nothing in here throws: all helpers degrade to "allow" rather than taking the
 * site down if something unexpected happens.
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/* --------------------------------------------------------------- headers */

/** Applied to every admin response so no CDN or browser ever caches it. */
export const NO_STORE_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

/* ------------------------------------------------------------ admin gate */

/** True when the request carries a valid, unexpired admin session cookie. */
export async function isAdmin(): Promise<boolean> {
  try {
    const jar = await cookies();
    return await verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  } catch {
    return false;
  }
}

/**
 * Returns a 401 response when the caller is not a signed-in admin, or `null`
 * when the request may proceed. Usage:
 *
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdmin()) return null;
  return NextResponse.json(
    { ok: false, error: "Unauthorised" },
    { status: 401, headers: NO_STORE_HEADERS },
  );
}

/* -------------------------------------------------------- rate limiting */

type Window = { hits: number[] };

const buckets = new Map<string, Window>();

/** Hard cap so a flood of unique keys cannot grow the map without bound. */
const MAX_KEYS = 5_000;

function prune(now: number, windowMs: number) {
  if (buckets.size <= MAX_KEYS) return;
  for (const [key, win] of buckets) {
    if (win.hits.length === 0 || now - win.hits[win.hits.length - 1] > windowMs) {
      buckets.delete(key);
    }
  }
  // Still oversized (pathological): drop the oldest-inserted keys.
  if (buckets.size > MAX_KEYS) {
    let excess = buckets.size - MAX_KEYS;
    for (const key of buckets.keys()) {
      if (excess-- <= 0) break;
      buckets.delete(key);
    }
  }
}

export type RateResult = { ok: true } | { ok: false; retryAfter: number };

/**
 * Sliding-window limiter. Counts a hit on every call and reports whether the
 * caller has exceeded `limit` hits within `windowMs`.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  try {
    const now = Date.now();
    prune(now, windowMs);
    const win = buckets.get(key) ?? { hits: [] };
    win.hits = win.hits.filter((t) => now - t < windowMs);
    if (win.hits.length >= limit) {
      const oldest = win.hits[0] ?? now;
      buckets.set(key, win);
      return { ok: false, retryAfter: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)) };
    }
    win.hits.push(now);
    buckets.set(key, win);
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

/** Clears a key — used after a successful login so one good sign-in resets. */
export function resetRateLimit(key: string) {
  buckets.delete(key);
}

/**
 * Best-effort client IP for rate limiting.
 *
 * The *last* entry is used, not the first: a client can send its own
 * `X-Forwarded-For` header, but the proxy in front of us appends the address it
 * actually saw, so the rightmost value is the one we can trust. Falls back to
 * other proxy headers and finally to a shared bucket.
 */
export function clientIp(req: Request): string {
  const h = req.headers;
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1]!;
  }
  return h.get("x-real-ip")?.trim() || h.get("cf-connecting-ip")?.trim() || "unknown";
}

export function tooManyRequests(retryAfter: number): NextResponse {
  return NextResponse.json(
    { ok: false, error: "Too many requests. Please wait a moment and try again." },
    { status: 429, headers: { ...NO_STORE_HEADERS, "Retry-After": String(retryAfter) } },
  );
}

/* --------------------------------------------------------- input limits */

/** Trims and hard-caps a string field so a submission can never bloat the store. */
export function txt(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  const clean = value.replace(/\u0000/g, "").trim();
  return clean.length > max ? clean.slice(0, max) : clean;
}

/** Rejects oversized request bodies before they are buffered. */
export function bodyTooLarge(req: Request, maxBytes = 64 * 1024): boolean {
  const len = Number(req.headers.get("content-length") ?? "0");
  return Number.isFinite(len) && len > maxBytes;
}
