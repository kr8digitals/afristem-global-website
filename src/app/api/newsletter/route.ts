import { NextResponse } from "next/server";
import { escapeHtml, sendMail } from "@/lib/mail";
import { subscribeNewsletter } from "@/lib/store";
import { logDbError } from "@/lib/db";
import { bodyTooLarge, clientIp, rateLimit, tooManyRequests, txt } from "@/lib/security";

/** 8 signups per IP per 10 minutes. */
const LIMIT = 8;
const WINDOW_MS = 10 * 60 * 1000;

/** Which form the visitor used (stored with the subscriber). */
const SOURCES = ["newsletter", "stem-guide"];

export async function POST(req: Request) {
  if (bodyTooLarge(req, 4 * 1024)) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  const gate = rateLimit(`newsletter:${clientIp(req)}`, LIMIT, WINDOW_MS);
  if (!gate.ok) return tooManyRequests(gate.retryAfter);

  const data = (await req.json().catch(() => null)) as { email?: unknown; source?: unknown; website?: unknown } | null;
  if (data?.website) return NextResponse.json({ ok: true }); // honeypot
  const email = txt(data?.email, 200).toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  const source = SOURCES.includes(txt(data?.source, 40)) ? txt(data?.source, 40) : "newsletter";

  let result: { duplicate: boolean; resubscribed: boolean } | null = null;
  try {
    result = await subscribeNewsletter(email, source);
  } catch (error) {
    logDbError("newsletter", error);
  }

  const hook = process.env.NEWSLETTER_WEBHOOK_URL;
  let forwarded = false;
  if (!result?.duplicate) {
    if (hook) {
      forwarded = await fetch(hook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      })
        .then((r) => r.ok)
        .catch(() => false);
    } else {
      const mail = await sendMail({
        subject: `[Newsletter] ${result?.resubscribed ? "Re-subscribed" : "New subscriber"}: ${email}`,
        html: `<p style="font-family:system-ui,sans-serif">${result?.resubscribed ? "A previous subscriber signed up again" : "New newsletter subscriber"}: <strong>${escapeHtml(email)}</strong> (form: ${source})</p>`,
      });
      forwarded = mail.ok && !mail.dev;
    }
  }

  if (!result && !forwarded) {
    return NextResponse.json({ error: "Sorry — we could not add you right now. Please try again in a few minutes." }, { status: 503 });
  }
  return NextResponse.json({ ok: true, duplicate: Boolean(result?.duplicate) });
}
