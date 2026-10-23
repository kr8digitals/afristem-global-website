import { NextResponse } from "next/server";
import { logDbError, publicError } from "@/lib/db";
import { mailConfigured, officeInbox, renderReceiptRejected, renderRegistrationApproved, sendMail } from "@/lib/mail";
import { NO_STORE_HEADERS, requireAdmin, txt } from "@/lib/security";
import { confirmRegistration, getContent, reviewPayment } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/payments — the admin decisions behind "Payments to review"
 * and "Confirm registration".
 *
 *   { action: "approve", id, registrationNumber, note? }  receipt accepted
 *   { action: "reject",  id, reason }                     receipt refused
 *   { action: "confirm", id, registrationNumber }         free registration confirmed
 *
 * A registration number is required for approve and confirm (and is unique
 * across every registration); a reason is required to reject. The database
 * enforces all three as well, so this route cannot be bypassed.
 */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await req.json().catch(() => null)) as
    | { id?: string; action?: string; registrationNumber?: string; reason?: string; note?: string }
    | null;
  const id = txt(body?.id, 100);
  const action = txt(body?.action, 20);
  const registrationNumber = txt(body?.registrationNumber, 40);
  const reason = txt(body?.reason, 2_000);
  const note = txt(body?.note, 2_000);

  if (!id || !["approve", "reject", "confirm"].includes(action)) {
    return NextResponse.json({ ok: false, error: "A registration id and a valid action are required." }, { status: 400 });
  }
  if ((action === "approve" || action === "confirm") && !registrationNumber) {
    return NextResponse.json({ ok: false, error: "Enter the person's registration number first." }, { status: 400 });
  }
  if (action === "reject" && !reason) {
    return NextResponse.json({ ok: false, error: "Give a reason — the person is shown it word for word." }, { status: 400 });
  }

  try {
    const result =
      action === "confirm"
        ? await confirmRegistration({ id, registrationNumber })
        : await reviewPayment({
            id,
            decision: action === "approve" ? "approve" : "reject",
            registrationNumber,
            reason: action === "reject" ? reason : note,
          });

    if (mailConfigured() && action !== "confirm") {
      const content = await getContent();
      const what = result.programmeName || result.eventTitle || "";
      const common = {
        reference: result.reference ?? "",
        fullName: result.fullName ?? "",
        what,
        registrationNumber: result.registrationNumber ?? registrationNumber,
        reason,
        orgName: content.site.name || "AFRISTEM",
        orgEmail: content.site.email || officeInbox(),
        orgPhone: content.site.primaryPhone || "",
        whatsapp: content.site.whatsapp,
        statusUrl: `${new URL(req.url).origin}/register/status`,
      };
      const mail =
        action === "approve"
          ? { subject: `Registration approved — ${common.reference}`, html: renderRegistrationApproved(common) }
          : { subject: `Payment receipt not accepted — ${common.reference}`, html: renderReceiptRejected(common) };
      const sent = await sendMail({ to: result.email, replyTo: content.site.email || undefined, ...mail });
      if (!sent.ok) console.error("[payments] notification email failed");
    }

    return NextResponse.json(
      {
        ok: true,
        paymentStatus: result.paymentStatus,
        registrationNumber: result.registrationNumber ?? null,
      },
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    logDbError(`payments ${action}`, error);
    return NextResponse.json({ ok: false, error: publicError(error) }, { status: 400, headers: NO_STORE_HEADERS });
  }
}
