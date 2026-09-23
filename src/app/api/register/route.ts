import { NextResponse } from "next/server";
import { renderTable, sendMail } from "@/lib/mail";
import { updateStore, nextId } from "@/lib/store";

export async function POST(req: Request) {
  const data = (await req.json().catch(() => null)) as Record<string, string> | null;
  if (!data) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  if (data.website) return NextResponse.json({ ok: true });
  for (const k of ["type", "fullName", "email", "phone"]) if (!data[k]?.trim()) return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });
  if (data.consent !== "yes") return NextResponse.json({ error: "Consent required" }, { status: 400 });

  const parts = (data.fullName || "").trim().split(/\s+/);
  const record = {
    id: nextId("reg"),
    createdAt: new Date().toISOString(),
    reference: `AFR-${new Date().getFullYear()}-${nextId("x").slice(-5).toUpperCase()}`,
    type: data.type ?? "",
    programme: data.programme ?? "",
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" ") ?? "",
    email: data.email?.trim() ?? "",
    phone: data.phone?.trim() ?? "",
    school: data.school ?? "",
    state: data.state ?? "",
    city: data.city ?? "",
    role: data.role ?? data.type ?? "",
    participants: data.participants ?? data.students ?? "",
    notes: data.notes ?? data.message ?? "",
    status: "new" as const,
    thread: [],
  };

  updateStore((s) => {
    s.submissions.register.unshift(record);
  });

  const res = await sendMail({
    subject: `[Registration] ${record.type} – ${data.fullName}${record.programme ? ` – ${record.programme}` : ""}`,
    replyTo: record.email,
    html: `<h2 style="font-family:system-ui,sans-serif">New programme registration</h2>${renderTable({ ...data, reference: record.reference }, ["website", "consent"])}`,
  });
  if (!res.ok) return NextResponse.json({ ok: true, reference: record.reference, warning: "Saved, but the email notification failed." });
  return NextResponse.json({ ok: true, reference: record.reference });
}
