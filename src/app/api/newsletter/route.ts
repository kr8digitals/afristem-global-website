import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";
import { updateStore, nextId, readStore } from "@/lib/store";
import { bodyTooLarge, clientIp, rateLimit, tooManyRequests, txt } from "@/lib/security";

/** 8 signups per IP per 10 minutes. */
const LIMIT = 8;
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  if (bodyTooLarge(req, 4 * 1024)) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  const gate = rateLimit(`newsletter:${clientIp(req)}`, LIMIT, WINDOW_MS);
  if (!gate.ok) return tooManyRequests(gate.retryAfter);

  const data = (await req.json().catch(() => null)) as { email?: string } | null;
  const email = txt(data?.email, 200).toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const already = readStore().submissions.newsletter.some((s) => s.email.toLowerCase() === email && s.status === "subscribed");
  if (!already) {
    updateStore((s) => {
      s.submissions.newsletter.unshift({ id: nextId("sub"), createdAt: new Date().toISOString(), email, status: "subscribed" });
    });
  }

  const hook = process.env.NEWSLETTER_WEBHOOK_URL;
  if (hook) {
    await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source: "website" }) }).catch(() => null);
  } else {
    await sendMail({ subject: `[Newsletter] New subscriber: ${email}`, html: `<p style="font-family:system-ui,sans-serif">New newsletter subscriber: <strong>${email}</strong></p>` });
  }
  return NextResponse.json({ ok: true, duplicate: already });
}
