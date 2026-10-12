import { NextResponse } from "next/server";
import { readStore, updateStore, seedStore, type Store } from "@/lib/store";
import { registrationCutoff, safeEventUrl } from "@/lib/events";
import { requireAdmin } from "@/lib/security";

export const dynamic = "force-dynamic";

/** Sections the dashboard is allowed to write. */
const WRITABLE = [
  "announcement",
  "hero",
  "site",
  "stats",
  "programmes",
  "events",
  "news",
  "gallery",
  "videos",
  "faqs",
  "testimonials",
  "partners",
] as const;

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const store = readStore();
  return NextResponse.json({ ok: true, content: { ...store, admin: { user: store.admin.user ? { updatedAt: store.admin.user.updatedAt } : null } } });
}

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as { section?: string; value?: unknown } | null;
  if (!body?.section) return NextResponse.json({ ok: false, error: "section required" }, { status: 400 });
  if (!(WRITABLE as readonly string[]).includes(body.section)) {
    return NextResponse.json({ ok: false, error: `Section "${body.section}" is not editable` }, { status: 400 });
  }
  const section = body.section as (typeof WRITABLE)[number];
  if (section === "events") {
    if (!Array.isArray(body.value)) return NextResponse.json({ error: "Events must be a list" }, { status: 400 });
    const slugs = new Set<string>();
    for (const e of body.value) {
      if (!e || typeof e !== "object" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.slug) || slugs.has(e.slug)) return NextResponse.json({ error: "Each event needs a unique lowercase URL slug" }, { status: 400 });
      slugs.add(e.slug);
      if (e.registrationStatus && !["pending", "open", "closed", "results"].includes(e.registrationStatus)) return NextResponse.json({ error: "Invalid registration status" }, { status: 400 });
      if (e.registrationClosure && !["deadline", "manual"].includes(e.registrationClosure)) return NextResponse.json({ error: "Invalid registration closure mode" }, { status: 400 });
      if ((e.registrationCloses && registrationCutoff(e.registrationCloses) === null) || (e.registrationStatus === "open" && e.registrationClosure !== "manual" && !e.registrationCloses)) return NextResponse.json({ error: `${e.title}: set a valid closing date or select manual closure before opening registration` }, { status: 400 });
      for (const key of ["resultsUrl", "flyer", "documentCover", "memorandumUrl", "handbookUrl", "preparationUrl"]) {
        if (e[key] && (typeof e[key] !== "string" || !safeEventUrl(e[key]))) return NextResponse.json({ error: `${key}: use a local path or HTTPS URL` }, { status: 400 });
      }
      if (e.registrationStatus === "results" && !e.resultsUrl && !e.resultsMessage) return NextResponse.json({ error: `${e.title}: add verified results or a results announcement first` }, { status: 400 });
    }
  }
  try {
    const updated = updateStore((s) => {
      (s as unknown as Record<string, unknown>)[section] = body.value;
    });
    return NextResponse.json({ ok: true, updatedAt: updated.updatedAt });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  // reset a section back to the shipped defaults
  const body = (await req.json().catch(() => null)) as { section?: string } | null;
  if (!body?.section) return NextResponse.json({ ok: false, error: "section required" }, { status: 400 });
  const defaults = seedStore() as unknown as Record<string, unknown>;
  if (!(body.section in defaults)) return NextResponse.json({ ok: false, error: "Unknown section" }, { status: 400 });
  const value = defaults[body.section];
  const updated = updateStore((s) => {
    (s as unknown as Record<string, unknown>)[body.section as string] = value;
  });
  return NextResponse.json({ ok: true, value, updatedAt: updated.updatedAt });
}

export async function DELETE() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ ok: false, error: "Use POST to reset a section" }, { status: 405 });
}

export type AdminContentResponse = { ok: true; content: Store };
