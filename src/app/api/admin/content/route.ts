import { NextResponse } from "next/server";
import { loadAdminStore, saveSection, EDITABLE_SECTIONS, type EditableSection } from "@/lib/store";
import { seedSection } from "@/lib/seed";
import { normaliseSection, ValidationError } from "@/lib/validate";
import { logDbError, publicError } from "@/lib/db";
import { NO_STORE_HEADERS, requireAdmin } from "@/lib/security";

export const dynamic = "force-dynamic";

const isSection = (s: unknown): s is EditableSection => typeof s === "string" && (EDITABLE_SECTIONS as readonly string[]).includes(s);

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const content = await loadAdminStore();
  return NextResponse.json({ ok: true, content }, { headers: NO_STORE_HEADERS });
}

/** Save one section. Returns the cleaned value so the dashboard shows exactly what was stored. */
export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as { section?: string; value?: unknown } | null;
  if (!body?.section) return NextResponse.json({ ok: false, error: "section required" }, { status: 400 });
  if (!isSection(body.section)) {
    return NextResponse.json({ ok: false, error: `Section "${body.section}" is not editable` }, { status: 400 });
  }
  try {
    const value = normaliseSection(body.section, body.value);
    const { updatedAt } = await saveSection(body.section, value);
    return NextResponse.json({ ok: true, updatedAt, value }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    logDbError(`save ${body.section}`, error);
    return NextResponse.json({ ok: false, error: publicError(error) }, { status: 500 });
  }
}

/** Reset a section back to the shipped defaults. */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as { section?: string } | null;
  if (!body?.section) return NextResponse.json({ ok: false, error: "section required" }, { status: 400 });
  if (!isSection(body.section)) return NextResponse.json({ ok: false, error: "Unknown section" }, { status: 400 });
  try {
    const value = normaliseSection(body.section, seedSection(body.section));
    const { updatedAt } = await saveSection(body.section, value);
    return NextResponse.json({ ok: true, value, updatedAt }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    logDbError(`reset ${body.section}`, error);
    return NextResponse.json({ ok: false, error: publicError(error) }, { status: 500 });
  }
}

export async function DELETE() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ ok: false, error: "Use POST to reset a section" }, { status: 405 });
}
