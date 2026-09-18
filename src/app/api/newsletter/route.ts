import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  const data = (await req.json().catch(() => null)) as { email?: string } | null;
  const email = data?.email?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  // Optional: forward to a Mailchimp/Brevo audience via env-configured webhook
  const hook = process.env.NEWSLETTER_WEBHOOK_URL;
  if (hook) {
    await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source: "website" }) }).catch(() => null);
  } else {
    await sendMail({ subject: `[Newsletter] New subscriber: ${email}`, html: `<p style="font-family:system-ui,sans-serif">New newsletter subscriber: <strong>${email}</strong></p>` });
  }
  return NextResponse.json({ ok: true });
}
