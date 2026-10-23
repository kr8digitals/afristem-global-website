import { NextResponse } from "next/server";
import { deleteSubmission, getSubmissions, updateSubmission, type SubmissionKind } from "@/lib/store";
import { logDbError, publicError } from "@/lib/db";
import { NO_STORE_HEADERS, requireAdmin, txt } from "@/lib/security";

export const dynamic = "force-dynamic";

const KINDS: SubmissionKind[] = ["contact", "register", "newsletter"];
const STATUSES: Record<SubmissionKind, string[]> = {
  contact: ["new", "in-progress", "replied", "closed"],
  register: ["new", "contacted", "confirmed", "waitlist", "declined"],
  newsletter: ["subscribed", "unsubscribed"],
};

export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const url = new URL(req.url);
  const type = (url.searchParams.get("type") ?? "contact") as SubmissionKind;
  if (!KINDS.includes(type)) return NextResponse.json({ ok: false, error: "Unknown type" }, { status: 400 });
  try {
    const all = await getSubmissions();
    return NextResponse.json({ ok: true, type, items: all[type] }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    logDbError("submissions GET", error);
    return NextResponse.json({ ok: false, error: publicError(error) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as
    | { type?: SubmissionKind; id?: string; status?: string; note?: string; by?: string }
    | null;
  const type = body?.type;
  if (!type || !KINDS.includes(type) || !body?.id) {
    return NextResponse.json({ ok: false, error: "type and id required" }, { status: 400 });
  }
  const status = txt(body.status, 20);
  if (status && !STATUSES[type].includes(status)) {
    return NextResponse.json({ ok: false, error: `Status must be one of: ${STATUSES[type].join(", ")}` }, { status: 400 });
  }
  try {
    const r = await updateSubmission(type, txt(body.id, 100), { status, note: txt(body.note, 3_000), by: txt(body.by, 80) || "admin" });
    if (!r.found) return NextResponse.json({ ok: false, error: "Submission not found" }, { status: 404 });
    return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    logDbError("submissions PATCH", error);
    return NextResponse.json({ ok: false, error: publicError(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const url = new URL(req.url);
  const type = url.searchParams.get("type") as SubmissionKind | null;
  const id = url.searchParams.get("id");
  if (!type || !KINDS.includes(type) || !id) return NextResponse.json({ ok: false, error: "type and id required" }, { status: 400 });
  try {
    await deleteSubmission(type, id);
    return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    logDbError("submissions DELETE", error);
    return NextResponse.json({ ok: false, error: publicError(error) }, { status: 500 });
  }
}
