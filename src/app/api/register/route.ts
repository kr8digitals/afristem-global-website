import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { mailConfigured, renderRegistrationConfirmation, renderTable, sendMail } from "@/lib/mail";
import { addRegistration, getContent, nextId, type NewRegistration } from "@/lib/store";
import { logDbError } from "@/lib/db";
import { bodyTooLarge, clientIp, rateLimit, tooManyRequests, txt } from "@/lib/security";

/** 6 registrations per IP per 10 minutes. */
const LIMIT = 6;
const WINDOW_MS = 10 * 60 * 1000;

const TYPES = ["student", "school", "educator", "professional", "partner"] as const;
const TYPE_LABEL: Record<string, string> = {
  student: "Student / Participant",
  school: "School",
  educator: "Educator",
  professional: "STEM Professional",
  partner: "Organisation / Partner",
};

function realDate(v: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return "";
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v ? v : "";
}

function isMinor(dob: string): boolean {
  if (!dob) return true; // the form treats a missing date of birth as "needs a guardian"
  const age = (Date.now() - new Date(`${dob}T00:00:00Z`).getTime()) / (365.25 * 24 * 3600 * 1000);
  return age < 18;
}

export async function POST(req: Request) {
  if (bodyTooLarge(req)) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  const gate = rateLimit(`register:${clientIp(req)}`, LIMIT, WINDOW_MS);
  if (!gate.ok) return tooManyRequests(gate.retryAfter);

  const data = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!data || typeof data !== "object") return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  if (data.website) return NextResponse.json({ ok: true }); // honeypot
  for (const k of ["type", "fullName", "email", "phone"]) {
    if (!txt(data[k], 20_000)) return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });
  }
  const email = txt(data.email, 200);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  if (data.consent !== "yes" && data.consent !== true) return NextResponse.json({ error: "Consent required" }, { status: 400 });

  const type = txt(data.type, 20);
  if (!(TYPES as readonly string[]).includes(type)) return NextResponse.json({ error: "Unknown registration type" }, { status: 400 });

  const fullName = txt(data.fullName, 120);
  const [firstName = "", ...rest] = fullName.split(/\s+/);
  const record: NewRegistration = {
    id: nextId("reg"),
    type,
    programme: txt(data.programme, 160),
    event: txt(data.event, 160),
    category: txt(data.category, 80),
    format: txt(data.format, 20),
    fullName,
    firstName: firstName.slice(0, 120),
    lastName: rest.join(" ").slice(0, 120),
    dob: type === "student" ? realDate(txt(data.dob, 10)) : "",
    gender: txt(data.gender, 20),
    email,
    phone: txt(data.phone, 40),
    // the form sends "schoolName"; older clients sent "school"
    school: txt(data.schoolName, 160) || txt(data.school, 160),
    grade: txt(data.grade, 80),
    schoolLocation: txt(data.schoolLocation, 200),
    state: txt(data.state, 80),
    city: txt(data.city, 80),
    role: txt(data.role, 80),
    organisation: txt(data.organisation, 160),
    participants: txt(data.participants ?? data.students, 20),
    notes: txt(data.notes ?? data.message, 3_000),
    guardianName: txt(data.guardianName, 120),
    guardianPhone: txt(data.guardianPhone, 40),
    guardianEmail: txt(data.guardianEmail, 200),
    guardianRelationship: txt(data.guardianRelationship, 40),
    consent: true,
  };

  // Same rules the form applies in the browser.
  if ((type === "student" || type === "school") && !record.programme && !record.event) {
    return NextResponse.json({ error: "Choose a programme or an event" }, { status: 400 });
  }
  if (type === "student") {
    if (!record.school || !record.grade) return NextResponse.json({ error: "School name and class are required" }, { status: 400 });
    if (isMinor(record.dob ?? "") && (!record.guardianName || !record.guardianPhone)) {
      return NextResponse.json({ error: "A parent or guardian's name and phone number are required for participants under 18" }, { status: 400 });
    }
  } else if (type === "school") {
    if (!record.school || !record.schoolLocation) return NextResponse.json({ error: "School name and location are required" }, { status: 400 });
  } else if (!record.role) {
    return NextResponse.json({ error: "Role / profession is required" }, { status: 400 });
  }

  const content = await getContent();
  const programme = content.programmes.find((p) => p.slug === record.programme);
  const event = content.events.find((e) => e.slug === record.event);
  const programmeName = programme?.name ?? record.programme;
  const eventTitle = event?.title ?? record.event ?? "";
  const what = programmeName || eventTitle;

  // The payment rule (also enforced in the database): students and schools pay
  // when the programme or event they chose requires payment. Everyone else
  // never pays.
  const payerType = type === "student" || type === "school";
  const programmePays = payerType && Boolean(programme?.requiresPayment);
  const eventPays = payerType && Boolean(event?.requiresPayment);
  const needsPayment = programmePays || eventPays;
  const fee = programmePays ? (programme?.fee ?? "") : eventPays ? (event?.fee ?? "") : "";
  const paymentInstructions = programmePays
    ? (programme?.paymentInstructions ?? "")
    : eventPays
      ? (event?.paymentInstructions ?? "")
      : "";

  let reference = "";
  let saved = false;
  try {
    const created = await addRegistration(record);
    reference = created.reference;
    saved = true;
  } catch (error) {
    logDbError("register", error);
    if (!mailConfigured()) {
      return NextResponse.json(
        { error: "Sorry — registration is temporarily unavailable. Please try again in a few minutes." },
        { status: 503 },
      );
    }
    // the office still gets every detail by email, with a reference the registrant can quote
    reference = `AFR-${new Date().getUTCFullYear()}-${crypto.randomBytes(3).toString("hex").slice(0, 5).toUpperCase()}`;
  }

  const office = await sendMail({
    subject: `[Registration] ${TYPE_LABEL[type] ?? type} – ${fullName}${what ? ` – ${what}` : ""}`,
    replyTo: email,
    html: `<h2 style="font-family:system-ui,sans-serif">New ${saved ? "" : "(NOT SAVED IN THE DASHBOARD) "}registration</h2>${renderTable(
      {
        reference,
        type: TYPE_LABEL[type] ?? type,
        programme: programmeName,
        event: eventTitle,
        category: record.category,
        format: record.format,
        fullName,
        dateOfBirth: record.dob,
        gender: record.gender,
        email,
        phone: record.phone,
        school: record.school,
        grade: record.grade,
        schoolLocation: record.schoolLocation,
        role: record.role,
        organisation: record.organisation,
        notes: record.notes,
        guardianName: record.guardianName,
        guardianPhone: record.guardianPhone,
        guardianEmail: record.guardianEmail,
        guardianRelationship: record.guardianRelationship,
        fee: needsPayment ? fee : "",
        paymentInstructions: needsPayment ? paymentInstructions : "",
        paymentStatus: needsPayment ? "awaiting receipt" : "not required",
      },
    )}`,
  });

  if (!saved && !(office.ok && !office.dev)) {
    return NextResponse.json({ error: "Sorry — registration is temporarily unavailable. Please try again in a few minutes." }, { status: 503 });
  }

  // A confirmation for the registrant — only when email delivery is really configured.
  let confirmationSent = false;
  if (mailConfigured()) {
    const confirmation = await sendMail({
      to: email,
      replyTo: content.site.email || undefined,
      subject: `Your ${content.site.name || "AFRISTEM"} registration — ${reference}`,
      html: renderRegistrationConfirmation({
        firstName: record.firstName ?? "",
        reference,
        what,
        orgName: content.site.name || "AFRISTEM",
        orgEmail: content.site.email,
        orgPhone: content.site.primaryPhone,
      }),
    });
    confirmationSent = confirmation.ok && !confirmation.dev;
  }

  // Everything the confirmation screen ("Step 1 of 2 complete") shows. The
  // WhatsApp number is read from Admin → Brand & contact, never hard-coded.
  const origin = new URL(req.url).origin;
  return NextResponse.json({
    ok: true,
    reference,
    confirmationSent,
    confirmation: {
      reference,
      fullName,
      firstName: record.firstName,
      email,
      phone: record.phone,
      type,
      school: record.school,
      registeredFor: what,
      paymentRequired: needsPayment,
      paymentStatus: needsPayment ? "awaiting_receipt" : "not_required",
      fee: needsPayment ? fee : "",
      paymentInstructions: needsPayment ? paymentInstructions : "",
      whatsapp: content.site.whatsapp || content.site.primaryPhone || "",
      statusUrl: `${origin}/register/status`,
      saved,
    },
    ...(saved ? {} : { warning: "Received by email; it could not be saved to the dashboard." }),
    ...(office.ok ? {} : { warning: "Saved, but the email notification failed." }),
  });
}
