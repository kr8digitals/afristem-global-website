import { NextResponse } from "next/server";
import { renderTable, sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  const data = (await req.json().catch(() => null)) as Record<string, string> | null;
  if (!data) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  if (data.website) return NextResponse.json({ ok: true });
  for (const k of ["type", "fullName", "email", "phone"]) if (!data[k]?.trim()) return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });
  if (data.consent !== "yes") return NextResponse.json({ error: "Consent required" }, { status: 400 });

  const res = await sendMail({
    subject: `[Registration] ${data.type} – ${data.fullName}${data.programme ? ` – ${data.programme}` : ""}`,
    replyTo: data.email,
    html: `<h2 style="font-family:system-ui,sans-serif">New programme registration</h2>${renderTable(data, ["website", "consent"])}`,
  });
  if (!res.ok) return NextResponse.json({ error: "Mail failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
