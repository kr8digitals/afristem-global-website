/**
 * AFRISTEM data store — backed by the Supabase database.
 *
 * Every page read and every write goes through the SQL functions in
 * docs/database/postgres/04-supabase-api.sql (see src/lib/db.ts). Each write
 * is a single transaction, so two admins saving at once can never corrupt
 * each other's work, and nothing depends on the server's (read-only) disk.
 *
 * If the database cannot be reached, public pages fall back to the shipped
 * content (src/lib/seed.ts) so the site stays up; writes report an error.
 */
import "server-only";
import crypto from "node:crypto";
import { cache } from "react";
import { DbError, DbNotConfiguredError, dbConfigured, isNextSignal, logDbError, rpc } from "@/lib/db";
import { seedContent } from "@/lib/seed";
import type {
  AdminUser,
  ContactSubmission,
  EditableSection,
  NewsletterSubmission,
  RegistrationSubmission,
  SiteContent,
  Store,
  Submissions,
} from "@/lib/types";

export type * from "@/lib/types";
export { EDITABLE_SECTIONS } from "@/lib/types";
export { parseStat } from "@/lib/utils";

/* ------------------------------------------------------------------ ids */

export function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${crypto.randomBytes(2).toString("hex")}`;
}

/* -------------------------------------------------------------- reading */

type ContentResult = { content: SiteContent; source: "database" | "defaults"; error?: string };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Fills keys the database did not return (e.g. a missing singleton row) from the shipped defaults. */
function withDefaults<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (Array.isArray(base)) return (Array.isArray(override) ? override : base) as T;
  if (isPlainObject(base) && isPlainObject(override)) {
    const out: Record<string, unknown> = { ...base };
    for (const [k, v] of Object.entries(override)) out[k] = k in base ? withDefaults(base[k], v) : v;
    return out as T;
  }
  return (typeof override === typeof base || base === undefined ? override : base) as T;
}

async function readContent(): Promise<ContentResult> {
  const fallback = seedContent();
  if (!dbConfigured()) {
    return { content: fallback, source: "defaults", error: "not-configured" };
  }
  try {
    const fromDb = await rpc<Partial<SiteContent> | null>("app_get_content");
    // lists come straight from the database (an empty list is a deliberate choice);
    // a missing singleton row or key falls back to the shipped default
    return { content: withDefaults(fallback, fromDb), source: "database" };
  } catch (error) {
    if (isNextSignal(error)) throw error;
    logDbError("app_get_content", error);
    return { content: fallback, source: "defaults", error: error instanceof DbError ? error.friendly : String(error) };
  }
}

/** Content plus where it came from. Memoised for the duration of one request. */
export const getContentResult = cache(readContent);

/** Everything the public pages display. Memoised for the duration of one request. */
export const getContent = cache(async (): Promise<SiteContent> => (await getContentResult()).content);

export async function getSubmissions(): Promise<Submissions> {
  const s = await rpc<Partial<Submissions> | null>("app_get_submissions");
  return {
    contact: (s?.contact ?? []) as ContactSubmission[],
    register: (s?.register ?? []) as RegistrationSubmission[],
    newsletter: (s?.newsletter ?? []) as NewsletterSubmission[],
  };
}

/** The admin password record (hash + salt), or null before the first login. */
export async function getAdminUser(): Promise<AdminUser | null> {
  return (await rpc<AdminUser | null>("app_get_admin")) ?? null;
}

/**
 * Everything the admin dashboard needs. The password hash is never included.
 * When the database is unreachable the dashboard still opens (with the shipped
 * content and an explanation) instead of crashing.
 */
export async function loadAdminStore(): Promise<Store> {
  const { content, source, error } = await getContentResult();
  let submissions: Submissions = { contact: [], register: [], newsletter: [] };
  let admin: AdminUser | null = null;
  let dbError = source === "defaults" ? error : undefined;
  if (source === "database") {
    try {
      [submissions, admin] = await Promise.all([getSubmissions(), getAdminUser()]);
    } catch (e) {
      logDbError("loadAdminStore", e);
      dbError = e instanceof DbError ? e.friendly : "Could not load submissions.";
    }
  }
  return {
    ...content,
    submissions,
    admin: { user: admin ? { updatedAt: admin.updatedAt, passwordHash: "", salt: "" } : null },
    source,
    dbError,
  };
}

/** Complete backup for "Download everything (JSON)" — includes the password hash, admin only. */
export async function exportEverything(): Promise<Record<string, unknown>> {
  const [{ content }, submissions, admin] = await Promise.all([getContentResult(), getSubmissions(), getAdminUser()]);
  return { ...content, version: 5, submissions, admin: { user: admin } };
}

/* -------------------------------------------------------------- writing */

export async function saveSection(section: EditableSection, value: unknown): Promise<{ updatedAt: string }> {
  const r = await rpc<{ ok: boolean; updatedAt: string }>("app_save_section", { p_section: section, p_value: value });
  return { updatedAt: r.updatedAt };
}

export type NewContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  category: string;
  subject: string;
  message: string;
};

export async function addContactMessage(record: NewContactMessage): Promise<{ id: string; createdAt: string }> {
  return rpc("app_add_contact", { p: record });
}

export type NewRegistration = Omit<
  RegistrationSubmission,
  "createdAt" | "reference" | "status" | "thread" | "programmeName" | "eventTitle" | "consentAt"
> & { consent: boolean };

export async function addRegistration(record: NewRegistration): Promise<{ id: string; reference: string; createdAt: string }> {
  return rpc("app_add_registration", { p: record });
}

export async function subscribeNewsletter(email: string, source: string): Promise<{ duplicate: boolean; resubscribed: boolean }> {
  return rpc("app_subscribe", { p_id: nextId("sub"), p_email: email, p_source: source });
}

export type SubmissionKind = "contact" | "register" | "newsletter";

export async function getSubmission(type: SubmissionKind, id: string): Promise<ContactSubmission | RegistrationSubmission | NewsletterSubmission | null> {
  return (await rpc<ContactSubmission | RegistrationSubmission | NewsletterSubmission | null>("app_get_submission", { p_type: type, p_id: id })) ?? null;
}

export async function updateSubmission(
  type: SubmissionKind,
  id: string,
  change: { status?: string; note?: string; by?: string },
): Promise<{ found: boolean }> {
  return rpc("app_update_submission", {
    p_type: type,
    p_id: id,
    p_status: change.status ?? "",
    p_note: change.note ?? "",
    p_author: change.by ?? "admin",
  });
}

export type EmailStatus = "sent" | "logged_only" | "failed";

export async function recordReply(
  type: "contact" | "register",
  id: string,
  reply: { subject: string; body: string; emailStatus: EmailStatus; by?: string },
): Promise<{ found: boolean }> {
  return rpc("app_add_reply", {
    p_type: type,
    p_id: id,
    p_subject: reply.subject,
    p_body: reply.body,
    p_email_status: reply.emailStatus,
    p_author: reply.by ?? "admin",
  });
}

export async function deleteSubmission(type: SubmissionKind, id: string): Promise<{ deleted: boolean }> {
  return rpc("app_delete_submission", { p_type: type, p_id: id });
}

/** onlyIfAbsent = first login (never overwrites); otherwise changes the password. */
export async function setAdminPassword(passwordHash: string, salt: string, onlyIfAbsent: boolean): Promise<{ written: boolean }> {
  return rpc("app_set_admin", { p_hash: passwordHash, p_salt: salt, p_only_if_absent: onlyIfAbsent });
}

export type MediaRecord = {
  id: string;
  fileName: string;
  url: string;
  storage: string;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  originalName?: string;
};

export async function addMediaFile(record: MediaRecord): Promise<void> {
  await rpc("app_add_media", { p: record });
}

export async function listMediaFiles(): Promise<{ url: string; name: string; createdAt: string }[]> {
  return (await rpc<{ url: string; name: string; createdAt: string }[] | null>("app_list_media")) ?? [];
}

export async function dbHealth(): Promise<{ ok: boolean; tables?: number; error?: string }> {
  if (!dbConfigured()) return { ok: false, error: "not-configured" };
  try {
    const h = await rpc<{ ok: boolean; tables: number }>("app_health");
    return { ok: Boolean(h?.ok) && Number(h.tables) === 24, tables: Number(h?.tables ?? 0) };
  } catch (error) {
    logDbError("app_health", error);
    return { ok: false, error: error instanceof DbError ? error.code || "unreachable" : "unreachable" };
  }
}

export { DbError, DbNotConfiguredError, dbConfigured };
