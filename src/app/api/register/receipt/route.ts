import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { logDbError, publicError } from "@/lib/db";
import { RECEIPT_EXTENSION, RECEIPT_MAX_BYTES, cleanFileName, detectReceiptType } from "@/lib/files";
import { mailConfigured, officeInbox, renderNewReceiptOffice, renderReceiptReceived, sendMail } from "@/lib/mail";
import { bodyTooLarge, clientIp, rateLimit, tooManyRequests, txt } from "@/lib/security";
import { addReceipt, getContent, getRegistrationStatus } from "@/lib/store";
import { deleteReceipt, uploadReceipt } from "@/lib/storage";

export const dynamic = "force-dynamic";

/** 8 receipts per IP per 15 minutes. */
const LIMIT = 8;
const WINDOW_MS = 15 * 60 * 1000;

/**
 * POST /api/register/receipt — the receipt box on the confirmation screen and
 * on /register/status.
 *
 * multipart/form-data: reference, email, file.
 *
 * The real file type is read from the file's first bytes (never the extension
 * or the browser's claim). Accepted: JPG, PNG, WebP, PDF up to 10 MB. The file
 * goes into the PRIVATE bucket "receipts"; the database records the upload and
 * moves the registration to "payment under review".
 */
export async function POST(req: Request) {
  if (bodyTooLarge(req, RECEIPT_MAX_BYTES + 1024 * 1024)) {
    return NextResponse.json({ ok: false, error: "Receipts must be smaller than 10 MB." }, { status: 413 });
  }
  const gate = rateLimit(`receipt:${clientIp(req)}`, LIMIT, WINDOW_MS);
  if (!gate.ok) return tooManyRequests(gate.retryAfter);

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ ok: false, error: "Send the receipt as a form upload." }, { status: 400 });

  const reference = txt(form.get("reference"), 40).toUpperCase();
  const email = txt(form.get("email"), 200).toLowerCase();
  const file = form.get("file");
  if (!reference || !email) {
    return NextResponse.json({ ok: false, error: "Your reference and email address are required." }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, error: "Choose a receipt file to upload." }, { status: 400 });
  }
  if (file.size > RECEIPT_MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "Receipts must be smaller than 10 MB." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = detectReceiptType(buffer);
  if (!mime) {
    return NextResponse.json(
      { ok: false, error: "That file is not a JPG, PNG, WebP or PDF. Please upload a photo or scan of your receipt." },
      { status: 400 },
    );
  }

  // Check the reference + email before storing anything, so a wrong pair never
  // leaves a file behind and gets a clear answer.
  let lookup;
  try {
    lookup = await getRegistrationStatus(reference, email);
  } catch (error) {
    logDbError("receipt lookup", error);
    return NextResponse.json({ ok: false, error: publicError(error) }, { status: 500 });
  }
  if (!lookup.found) {
    return NextResponse.json(
      { ok: false, error: "We could not find a registration with that reference and email address." },
      { status: 404 },
    );
  }
  if (lookup.paymentStatus === "under_review") {
    return NextResponse.json(
      { ok: false, error: "Your receipt is already being reviewed. We will contact you when it has been checked." },
      { status: 409 },
    );
  }
  if (lookup.paymentStatus === "approved") {
    return NextResponse.json(
      { ok: false, error: "This registration is already approved — no further receipt is needed.", registrationNumber: lookup.registrationNumber },
      { status: 409 },
    );
  }
  if (lookup.paymentStatus === "not_required" || !lookup.paymentRequired) {
    return NextResponse.json({ ok: false, error: "This registration does not require a payment receipt." }, { status: 400 });
  }

  const path = `${reference}/${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}.${RECEIPT_EXTENSION[mime]}`;
  try {
    await uploadReceipt(path, buffer, mime);
  } catch (error) {
    console.error("[receipt] upload failed", error);
    return NextResponse.json({ ok: false, error: "The receipt could not be stored. Please try again." }, { status: 502 });
  }

  let saved;
  try {
    saved = await addReceipt({
      reference,
      email,
      path,
      fileName: cleanFileName(file.name),
      mimeType: mime,
      sizeBytes: buffer.length,
    });
  } catch (error) {
    // the file is useless without its record — remove it
    await deleteReceipt(path).catch(() => undefined);
    logDbError("receipt record", error);
    return NextResponse.json({ ok: false, error: publicError(error) }, { status: 400 });
  }

  // Emails go out only when Resend is configured; the WhatsApp buttons and the
  // status page cover everything without them.
  if (mailConfigured()) {
    const content = await getContent();
    const what = saved.programmeName || saved.eventTitle || "";
    const statusUrl = `${new URL(req.url).origin}/register/status`;
    const common = {
      reference: saved.reference ?? reference,
      fullName: saved.fullName ?? lookup.fullName ?? "",
      what,
      fee: saved.fee ?? lookup.fee ?? "",
      orgName: content.site.name || "AFRISTEM",
      orgEmail: content.site.email || officeInbox(),
      orgPhone: content.site.primaryPhone || "",
      whatsapp: content.site.whatsapp,
      statusUrl,
    };
    const [toRegistrant, toOffice] = await Promise.all([
      sendMail({
        to: saved.email || email,
        replyTo: content.site.email || undefined,
        subject: `Receipt received — ${common.reference}`,
        html: renderReceiptReceived(common),
      }),
      sendMail({
        subject: `[Payment] Receipt to review — ${common.reference} — ${common.fullName}`,
        replyTo: saved.email || email,
        html: renderNewReceiptOffice({
          ...common,
          fileName: cleanFileName(file.name),
          uploaderPhone: saved.phone ?? lookup.phone ?? "",
        }),
      }),
    ]);
    if (!toRegistrant.ok || !toOffice.ok) console.error("[receipt] one or more notification emails failed");
  }

  return NextResponse.json(
    {
      ok: true,
      paymentStatus: "under_review",
      message: "Receipt received — your payment is now under review.",
      fileName: cleanFileName(file.name),
      reference: saved.reference ?? reference,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
