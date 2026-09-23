import { NextResponse } from "next/server";
import { readStore, updateStore, seedStore, type Store } from "@/lib/store";

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
  const store = readStore();
  return NextResponse.json({ ok: true, content: { ...store, admin: { user: store.admin.user ? { updatedAt: store.admin.user.updatedAt } : null } } });
}

export async function PUT(req: Request) {
  const body = (await req.json().catch(() => null)) as { section?: string; value?: unknown } | null;
  if (!body?.section) return NextResponse.json({ ok: false, error: "section required" }, { status: 400 });
  if (!(WRITABLE as readonly string[]).includes(body.section)) {
    return NextResponse.json({ ok: false, error: `Section "${body.section}" is not editable` }, { status: 400 });
  }
  const section = body.section as (typeof WRITABLE)[number];
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
  return NextResponse.json({ ok: false, error: "Use POST to reset a section" }, { status: 405 });
}

export type AdminContentResponse = { ok: true; content: Store };
