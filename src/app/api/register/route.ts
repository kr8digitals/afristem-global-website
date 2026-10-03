import { NextResponse } from "next/server";
import { renderTable, sendMail } from "@/lib/mail";
import { updateStore, nextId } from "@/lib/store";
import { bodyTooLarge, clientIp, rateLimit, tooManyRequests, txt } from "@/lib/security";

/** 6 registrations per IP per 10 minutes. */
const LIMIT = 6;
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  if (bodyTooLarge(req)) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  const gate = rateLimit(`register:${clientIp(req)}`, LIMIT, WINDOW_MS);
  if (!gate.ok) return tooManyRequests(gate.retryAfter);

  const data = (await req.json().catch(() => null)) as Record<string, string> | null;
  if (!data) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  if (data.website) return NextResponse.json({ ok: true });
  for (const k of ["type", "fullName", "email", "phone"]) if (!txt(data[k], 20_000)) return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(txt(data.email, 200))) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  if (data.consent !== "yes") return NextResponse.json({ error: "Consent required" }, { status: 400 });

  const fullName = txt(data.fullName, 120);
  const parts = fullName.split(/\s+/);
  const record = {
    id: nextId("reg"),
    createdAt: new Date().toISOString(),
    reference: `AFR-${new Date().getFullYear()}-${nextId("x").slice(-5).toUpperCase()}`,
    type: txt(data.type, 80),
    programme: txt(data.programme, 160),
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" ") ?? "",
    email: txt(data.email, 200),
    phone: txt(data.phone, 40),
    school: txt(data.school, 160),
    state: txt(data.state, 80),
    city: txt(data.city, 80),
    role: txt(data.role, 80) || txt(data.type, 80),
    participants: txt(data.participants || data.students, 20),
    notes: txt(data.notes || data.message, 3_000),
    status: "new" as const,
    thread: [],
  };

  updateStore((s) => {
    s.submissions.register.unshift(record);
  });

  const res = await sendMail({
    subject: `[Registration] ${record.type} – ${fullName}${record.programme ? ` – ${record.programme}` : ""}`,
    replyTo: record.email,
    html: `<h2 style="font-family:system-ui,sans-serif">New programme registration</h2>${renderTable({ ...data, reference: record.reference }, ["website", "consent"])}`,
  });
  if (!res.ok) return NextResponse.json({ ok: true, reference: record.reference, warning: "Saved, but the email notification failed." });
  return NextResponse.json({ ok: true, reference: record.reference });
}
