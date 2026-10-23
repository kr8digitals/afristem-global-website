import { NextResponse } from "next/server";
import { renderTable, sendMail, escapeHtml, mailConfigured, officeInbox } from "@/lib/mail";
import { addContactMessage, nextId } from "@/lib/store";
import { logDbError } from "@/lib/db";
import { bodyTooLarge, clientIp, rateLimit, tooManyRequests, txt } from "@/lib/security";

/** 5 messages per IP per 10 minutes — plenty for a real visitor, useless for a bot. */
const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  if (bodyTooLarge(req)) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  const gate = rateLimit(`contact:${clientIp(req)}`, LIMIT, WINDOW_MS);
  if (!gate.ok) return tooManyRequests(gate.retryAfter);

  const data = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!data || typeof data !== "object") return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  if (data.website) return NextResponse.json({ ok: true }); // honeypot
  const required = ["name", "email", "category", "subject", "message"];
  for (const k of required) if (!txt(data[k], 20_000)) return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(txt(data.email, 200))) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const record = {
    id: nextId("msg"),
    name: txt(data.name, 120),
    email: txt(data.email, 200),
    phone: txt(data.phone, 40),
    organisation: txt(data.organisation, 160),
    category: txt(data.category, 80) || "General Enquiry",
    subject: txt(data.subject, 200),
    message: txt(data.message, 5_000),
  };

  // Save first so the dashboard has the message even if the email fails.
  let saved = false;
  try {
    await addContactMessage(record);
    saved = true;
  } catch (error) {
    logDbError("contact", error);
  }

  const mail = await sendMail({
    subject: `[Website] ${record.category}: ${record.subject}`,
    replyTo: record.email,
    html: `<h2 style="font-family:system-ui,sans-serif">New contact message</h2>${renderTable(record, ["id", "message"])}<p style="font-family:system-ui,sans-serif;margin-top:16px">${escapeHtml(record.message).replace(/\n/g, "<br/>")}</p>${saved ? "" : `<p style="font-family:system-ui,sans-serif;color:#b91c1c"><strong>Note:</strong> this message could not be saved to the admin dashboard.</p>`}`,
  });
  const emailed = mail.ok && !mail.dev;

  if (!saved && !emailed) {
    return NextResponse.json(
      { error: `Sorry — we could not send your message right now. Please try again in a few minutes or email ${officeInbox()}.` },
      { status: 503 },
    );
  }
  if (!saved) return NextResponse.json({ ok: true, warning: "Delivered by email; it could not be saved to the dashboard." });
  if (mailConfigured() && !mail.ok) return NextResponse.json({ ok: true, warning: "Saved, but the email notification failed." });
  return NextResponse.json({ ok: true });
}
