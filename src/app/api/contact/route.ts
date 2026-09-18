import { NextResponse } from "next/server";
import { renderTable, sendMail, escapeHtml } from "@/lib/mail";

export async function POST(req: Request) {
  const data = (await req.json().catch(() => null)) as Record<string, string> | null;
  if (!data) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  if (data.website) return NextResponse.json({ ok: true }); // honeypot – silently accept
  const required = ["name", "email", "category", "subject", "message"];
  for (const k of required) if (!data[k]?.trim()) return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const res = await sendMail({
    subject: `[Website] ${data.category}: ${data.subject}`,
    replyTo: data.email,
    html: `<h2 style="font-family:system-ui,sans-serif">New contact message</h2>${renderTable(data, ["website"])}<p style="font-family:system-ui,sans-serif;margin-top:16px">${escapeHtml(data.message).replace(/\n/g, "<br/>")}</p>`,
  });
  if (!res.ok) return NextResponse.json({ error: "Mail failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
