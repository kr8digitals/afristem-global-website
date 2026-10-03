import { NextResponse } from "next/server";
import { escapeHtml, renderReply, sendMail } from "@/lib/mail";
import { updateStore } from "@/lib/store";
import { requireAdmin } from "@/lib/security";

export const dynamic = "force-dynamic";

/** Sends a reply to a contact message or a registration enquiry and records it. */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as
    | { type?: "contact" | "register"; id?: string; subject?: string; message?: string }
    | null;
  const { type, id, subject, message } = body ?? {};
  if (!type || !id || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ ok: false, error: "type, id, subject and message are required" }, { status: 400 });
  }

  const store = updateStore(() => {}); // current snapshot (also refreshes cache)
  const list = type === "contact" ? store.submissions.contact : store.submissions.register;
  const item = list.find((x) => x.id === id);
  if (!item) return NextResponse.json({ ok: false, error: "Submission not found" }, { status: 404 });

  const result = await sendMail({
    subject,
    to: item.email,
    replyTo: process.env.CONTACT_TO_EMAIL || "contact@afristemglobal.com",
    html: renderReply(escapeHtml(message).replace(/\n/g, "<br/>")),
  });

  const note = `Reply sent${result.dev ? " (dev mode — email logged, not delivered)" : ""}: ${subject}`;
  updateStore((s) => {
    const entry = { at: new Date().toISOString(), text: `${note}\n\n${message}`, by: "admin" };
    if (type === "contact") {
      const m = s.submissions.contact.find((x) => x.id === id);
      if (m) {
        m.notes = [...(m.notes ?? []), entry];
        if (m.status === "new") m.status = "replied";
      }
    } else {
      const r = s.submissions.register.find((x) => x.id === id);
      if (r) {
        r.thread = [...(r.thread ?? []), entry];
        if (r.status === "new") r.status = "contacted";
      }
    }
  });

  return NextResponse.json({ ok: true, delivered: !result.dev, dev: Boolean(result.dev) });
}
