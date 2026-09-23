import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";
import { updateStore, nextId, readStore } from "@/lib/store";

export async function POST(req: Request) {
  const data = (await req.json().catch(() => null)) as { email?: string } | null;
  const email = data?.email?.trim().toLowerCase();
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
