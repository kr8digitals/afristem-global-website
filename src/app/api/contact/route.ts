import { NextResponse } from "next/server";
import { renderTable, sendMail, escapeHtml } from "@/lib/mail";
import { updateStore, nextId } from "@/lib/store";

export async function POST(req: Request) {
  const data = (await req.json().catch(() => null)) as Record<string, string> | null;
  if (!data) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  if (data.website) return NextResponse.json({ ok: true }); // honeypot
  const required = ["name", "email", "category", "subject", "message"];
  for (const k of required) if (!data[k]?.trim()) return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const record = {
    id: nextId("msg"),
    createdAt: new Date().toISOString(),
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone?.trim() ?? "",
    category: data.category?.trim() ?? "General Enquiry",
    subject: data.subject.trim(),
    message: data.message.trim(),
    status: "new" as const,
    notes: [],
  };

  // always store it so the admin dashboard has the message even if email fails
  updateStore((s) => {
    s.submissions.contact.unshift(record);
  });

  const res = await sendMail({
    subject: `[Website] ${record.category}: ${record.subject}`,
    replyTo: record.email,
    html: `<h2 style="font-family:system-ui,sans-serif">New contact message</h2>${renderTable(record, ["notes", "id", "status"])}<p style="font-family:system-ui,sans-serif;margin-top:16px">${escapeHtml(record.message).replace(/\n/g, "<br/>")}</p>`,
  });
  if (!res.ok) return NextResponse.json({ ok: true, warning: "Saved, but the email notification failed." });
  return NextResponse.json({ ok: true });
}
