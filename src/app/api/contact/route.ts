import { NextResponse } from "next/server";
import { renderTable, sendMail, escapeHtml } from "@/lib/mail";
import { updateStore, nextId } from "@/lib/store";
import { bodyTooLarge, clientIp, rateLimit, tooManyRequests, txt } from "@/lib/security";

/** 5 messages per IP per 10 minutes — plenty for a real visitor, useless for a bot. */
const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  if (bodyTooLarge(req)) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  const gate = rateLimit(`contact:${clientIp(req)}`, LIMIT, WINDOW_MS);
  if (!gate.ok) return tooManyRequests(gate.retryAfter);

  const data = (await req.json().catch(() => null)) as Record<string, string> | null;
  if (!data) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  if (data.website) return NextResponse.json({ ok: true }); // honeypot
  const required = ["name", "email", "category", "subject", "message"];
  for (const k of required) if (!txt(data[k], 20_000)) return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(txt(data.email, 200))) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const record = {
    id: nextId("msg"),
    createdAt: new Date().toISOString(),
    name: txt(data.name, 120),
    email: txt(data.email, 200),
    phone: txt(data.phone, 40),
    category: txt(data.category, 80) || "General Enquiry",
    subject: txt(data.subject, 200),
    message: txt(data.message, 5_000),
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
