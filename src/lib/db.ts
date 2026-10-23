/**
 * Supabase connection (server only).
 *
 * The website talks to its Supabase database exclusively through the SQL
 * functions in docs/database/postgres/04-supabase-api.sql, called over the
 * Data API with the project's SECRET key. That key bypasses Row Level
 * Security, so it must never reach the browser: this module is server-only
 * and the key is read from a non-public environment variable.
 *
 * Environment:
 *   SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)  https://<project-ref>.supabase.co
 *   SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)  sb_secret_… / service_role JWT
 */
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Requests to the database give up after this long so a page can never hang. */
const TIMEOUT_MS = 10_000;

export class DbNotConfiguredError extends Error {
  constructor() {
    super("The database is not configured (set SUPABASE_URL and SUPABASE_SECRET_KEY).");
    this.name = "DbNotConfiguredError";
  }
}

export class DbError extends Error {
  code: string;
  details: string;
  hint: string;
  /** A message that is safe and useful to show to the admin. */
  friendly: string;
  constructor(raw: { message?: string; code?: string; details?: string | null; hint?: string | null }) {
    super(raw.message || "Database error");
    this.name = "DbError";
    this.code = raw.code ?? "";
    this.details = raw.details ?? "";
    this.hint = raw.hint ?? "";
    this.friendly = friendlyMessage(this.code, this.message, this.details);
  }
}

function friendlyMessage(code: string, message: string, details: string): string {
  const constraint = /constraint "([^"]+)"/.exec(message)?.[1] ?? "";
  const column = /column "([^"]+)"/.exec(message)?.[1] ?? "";
  switch (code) {
    case "23505":
      if (constraint.endsWith("_slug")) return "Two items have the same URL slug. Give each one a different slug and save again.";
      if (constraint.includes("email")) return "That email address is already on the list.";
      return "This item already exists (duplicate value).";
    case "23502":
      return `A required value is missing${column ? ` (${column.replace(/_/g, " ")})` : ""}.`;
    case "23514":
      return `A value is not allowed${constraint ? ` (${constraint.replace(/^ck_/, "").replace(/_/g, " ")})` : ""}.`;
    case "23503":
      return "This refers to an item that does not exist any more.";
    case "22001":
      return "One of the values is too long. Shorten it and save again.";
    case "22007":
    case "22008":
      return "One of the dates is not valid.";
    case "22P02":
      return "One of the values has the wrong format.";
    case "42501":
      return "The website is not allowed to use the database. Check that SUPABASE_SECRET_KEY holds the project's secret (service_role) key.";
    case "PGRST202":
    case "42883":
      return "The database is missing the website's functions. Run docs/database/postgres/04-supabase-api.sql in Supabase.";
    case "22023":
      return message;
    default:
      if (/fetch failed|abort|timeout|network|ENOTFOUND|ECONNREFUSED/i.test(`${message} ${details}`)) {
        return "Could not reach the database. Please try again in a moment.";
      }
      return "The database rejected the change. Please try again.";
  }
}

function supabaseUrl(): string {
  return (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "");
}

function secretKey(): string {
  return (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
}

export function dbConfigured(): boolean {
  return Boolean(supabaseUrl() && secretKey());
}

/** What kind of key is configured — used to warn when a public key was pasted by mistake. */
export function keyKind(): "secret" | "service_role" | "publishable" | "anon" | "missing" | "unknown" {
  const key = secretKey();
  if (!key) return "missing";
  if (key.startsWith("sb_secret_")) return "secret";
  if (key.startsWith("sb_publishable_")) return "publishable";
  const payload = key.split(".")[1];
  if (payload) {
    try {
      const role = (JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { role?: string }).role;
      if (role === "service_role") return "service_role";
      if (role === "anon") return "anon";
    } catch {
      /* not a JWT */
    }
  }
  return "unknown";
}

let client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (!dbConfigured()) throw new DbNotConfiguredError();
  if (!client) {
    client = createClient(supabaseUrl(), secretKey(), {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        // never let Next.js cache a database response, and never wait forever
        fetch: (input, init) =>
          fetch(input, { ...init, cache: "no-store", signal: init?.signal ?? AbortSignal.timeout(TIMEOUT_MS) }),
        headers: { "X-Client-Info": "afristem-website" },
      },
    });
  }
  return client;
}

/** Calls one of the website's database functions and returns its JSON result. */
export async function rpc<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  let result;
  try {
    result = await db().rpc(fn, args);
  } catch (error) {
    if (error instanceof DbNotConfiguredError) throw error;
    throw new DbError({ message: (error as Error).message, code: "" });
  }
  if (result.error) {
    // supabase-js turns every fetch failure into an error object — including the signal
    // Next.js throws to stop a page from being pre-rendered statically. Re-create that
    // signal so Next.js can render the page on demand instead of caching a fallback.
    if (/Dynamic server usage/i.test(result.error.message ?? "")) {
      const signal = new Error(result.error.message) as Error & { digest: string };
      signal.digest = "DYNAMIC_SERVER_USAGE";
      throw signal;
    }
    throw new DbError(result.error);
  }
  return result.data as T;
}

/** True for the internal signal Next.js uses to switch a page to on-demand rendering. */
export function isNextSignal(error: unknown): boolean {
  return typeof (error as { digest?: unknown })?.digest === "string" && (error as { digest: string }).digest === "DYNAMIC_SERVER_USAGE";
}

/** Public base URL of the Storage API (for the media proxy). */
export function storageBaseUrl(): string {
  return `${supabaseUrl()}/storage/v1`;
}

/** Turns any thrown value into a message that is safe to send to the browser. */
export function publicError(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof DbNotConfiguredError) return "The database is not configured yet.";
  if (error instanceof DbError) return error.friendly;
  return fallback;
}

/** Logs a database problem with its details (server logs only). */
export function logDbError(where: string, error: unknown) {
  if (error instanceof DbError) {
    console.error(`[db] ${where}: ${error.code} ${error.message}${error.details ? ` — ${error.details}` : ""}${error.hint ? ` (hint: ${error.hint})` : ""}`);
  } else {
    console.error(`[db] ${where}:`, error);
  }
}
