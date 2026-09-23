import { NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/store";

export const dynamic = "force-dynamic";

type Kind = "contact" | "register" | "newsletter";
const KINDS: Kind[] = ["contact", "register", "newsletter"];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = (url.searchParams.get("type") ?? "contact") as Kind;
  if (!KINDS.includes(type)) return NextResponse.json({ ok: false, error: "Unknown type" }, { status: 400 });
  const store = readStore();
  return NextResponse.json({ ok: true, type, items: store.submissions[type] });
}

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { type?: Kind; id?: string; status?: string; note?: string; by?: string }
    | null;
  const type = body?.type;
  if (!type || !KINDS.includes(type) || !body?.id) {
    return NextResponse.json({ ok: false, error: "type and id required" }, { status: 400 });
  }
  const id = body.id;
  const updated = updateStore((s) => {
    if (type === "newsletter") {
      const item = s.submissions.newsletter.find((x) => x.id === id);
      if (item && (body.status === "subscribed" || body.status === "unsubscribed")) item.status = body.status;
      return;
    }
    const list = s.submissions[type] as Array<{
      id: string;
      status: string;
      notes?: { at: string; text: string; by: string }[];
      thread?: { at: string; text: string; by: string }[];
    }>;
    const item = list.find((x) => x.id === id);
    if (!item) return;
    if (body.status) item.status = body.status;
    if (body.note?.trim()) {
      const entry = { at: new Date().toISOString(), text: body.note.trim(), by: body.by || "admin" };
      if (type === "contact") item.notes = [...(item.notes ?? []), entry];
      else item.thread = [...(item.thread ?? []), entry];
    }
  });
  return NextResponse.json({ ok: true, updatedAt: updated.updatedAt });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") as Kind | null;
  const id = url.searchParams.get("id");
  if (!type || !KINDS.includes(type) || !id) return NextResponse.json({ ok: false, error: "type and id required" }, { status: 400 });
  updateStore((s) => {
    if (type === "newsletter") s.submissions.newsletter = s.submissions.newsletter.filter((x) => x.id !== id);
    else if (type === "contact") s.submissions.contact = s.submissions.contact.filter((x) => x.id !== id);
    else s.submissions.register = s.submissions.register.filter((x) => x.id !== id);
  });
  return NextResponse.json({ ok: true });
}
