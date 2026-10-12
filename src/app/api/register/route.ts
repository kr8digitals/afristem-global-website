import { NextResponse } from "next/server";
import { renderTable, sendMail } from "@/lib/mail";
import { updateStore, nextId, readStore } from "@/lib/store";
import { eventState } from "@/lib/events";
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

  const store = readStore();
  const selectedEvent = store.events.find((e) => e.slug === data.event);
  const programmeEvent = store.events.find((e) => e.registrationStatus && e.programmeSlug === data.programme);
  const event = selectedEvent?.registrationStatus ? selectedEvent : programmeEvent;
  if (data.eventForm === "yes" && (!selectedEvent || !selectedEvent.registrationStatus)) return NextResponse.json({ error: "Unknown event" }, { status: 400 });
  if (event) {
    const state = eventState(event);
    if (state !== "open") return NextResponse.json({ state, error: state === "pending" ? "Registration schedule awaiting confirmation. Contact the organisers." : "Registration closed — awaiting results or official results announcement." }, { status: 410 });
    if (data.eventForm !== "yes" || data.event !== event.slug || (data.programme && data.programme !== event.programmeSlug)) return NextResponse.json({ error: "Please use the dedicated event registration form", href: `/events/${event.slug}` }, { status: 400 });
    for (const key of ["school", "city", "candidates", "examMode", "examLocation", "role", "participants"]) {
      if (!txt(data[key], 12000)) return NextResponse.json({ error: `Missing ${key}` }, { status: 400 });
    }
    if (!["individual", "school"].includes(data.type) || !["Parent", "Guardian", "School coordinator"].includes(data.role)) return NextResponse.json({ error: "An authorised adult contact and entry type are required" }, { status: 400 });
    const count = Number(data.participants);
    if (!Number.isInteger(count) || count < 1 || count > 500 || (data.type === "individual" && count !== 1)) return NextResponse.json({ error: "Invalid candidate count" }, { status: 400 });
    const candidates = txt(data.candidates, 12000).split(/\r?\n/).filter((line) => line.trim());
    if (candidates.length !== count) return NextResponse.json({ error: "Candidate count must match your list: enter one candidate and class per line" }, { status: 400 });
    const aoct = event.programmeSlug === "african-organic-chemistry-tournament";
    const classPattern = aoct ? /\bSSS\s*[1-3]\b/i : /\b(?:Basic\s*[3-6]|JSS\s*[1-3])\b/i;
    if (candidates.some((line) => !classPattern.test(line))) return NextResponse.json({ error: "Please include an eligible class on every candidate line, using Basic, JSS or SSS as shown on the form" }, { status: 400 });
    if (!(aoct ? ["Online CBT"] : ["Physical", "Online"]).includes(data.examMode)) return NextResponse.json({ error: "Invalid exam mode" }, { status: 400 });
    if (aoct && (!/^\d{4}-\d{2}-\d{2}$/.test(data.examDate || "") || data.examDate < event.start || data.examDate > (event.end || event.start) || !txt(data.examTime, 100))) return NextResponse.json({ error: "Choose an exam date within the published window and specify a preferred time and time zone" }, { status: 400 });
  }

  const fullName = txt(data.fullName, 120);
  const parts = fullName.split(/\s+/);
  const record = {
    id: nextId("reg"),
    createdAt: new Date().toISOString(),
    reference: `AFR-${new Date().getFullYear()}-${nextId("x").slice(-5).toUpperCase()}`,
    type: txt(data.type, 80),
    programme: event?.programmeSlug || txt(data.programme, 160),
    event: event?.slug || txt(data.event, 160),
    eventTitle: event?.title || selectedEvent?.title || "",
    registrationDetails: event ? Object.fromEntries(["candidates", "examMode", "examLocation", "examDate", "examTime", "paymentReference", "role"].map((k) => [k, txt(data[k], k === "candidates" ? 12000 : 200)])) : undefined,
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" ") ?? "",
    email: txt(data.email, 200),
    phone: txt(data.phone, 40),
    school: txt(data.school || data.schoolName, 160),
    state: txt(data.state, 80),
    city: txt(data.city || data.schoolLocation, 160),
    role: txt(data.role, 80) || txt(data.type, 80),
    participants: txt(data.participants || data.students, 20),
    notes: txt(data.notes || data.message, 3_000),
    status: "new" as const,
    thread: [],
  };

  // Recheck inside the synchronous write, including admin closures/deletions.
  let accepted = false;
  updateStore((s) => {
    if (event) {
      const latest = s.events.find((e) => e.slug === event.slug);
      if (!latest || eventState(latest) !== "open") return;
    }
    s.submissions.register.unshift(record);
    accepted = true;
  });
  if (!accepted) return NextResponse.json({ state: "closed", error: "Registration closed — awaiting results." }, { status: 410 });

  const res = await sendMail({
    subject: `[Registration] ${record.type} – ${fullName}${record.programme ? ` – ${record.programme}` : ""}`,
    replyTo: record.email,
    html: `<h2 style="font-family:system-ui,sans-serif">New programme registration</h2>${renderTable({ ...data, reference: record.reference }, ["website", "consent"])}`,
  });
  if (!res.ok) return NextResponse.json({ ok: true, reference: record.reference, warning: "Saved, but the email notification failed." });
  return NextResponse.json({ ok: true, reference: record.reference });
}
