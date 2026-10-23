/**
 * Payment wording shared by the confirmation screen, the status page and the
 * admin inbox. Plain language first — every label here is read by a parent,
 * a student or an admin, so avoid database words like "not_required".
 */

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  not_required: "Payment not required",
  awaiting_receipt: "Awaiting receipt",
  under_review: "Payment under review",
  approved: "Approved",
  rejected: "Receipt rejected",
};

export const PAYMENT_STATUS_TONE: Record<string, string> = {
  not_required: "bg-slate-100 text-slate-600",
  awaiting_receipt: "bg-amber-100 text-amber-800",
  under_review: "bg-sky-100 text-sky-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

export function paymentStatusLabel(status: string | undefined | null): string {
  return PAYMENT_STATUS_LABEL[status ?? ""] ?? "Payment not required";
}

/** One sentence explaining what the person should do next, in plain words. */
export function paymentStatusSentence(input: {
  paymentStatus?: string | null;
  paymentRequired?: boolean;
  rejectionReason?: string;
  registrationNumber?: string | null;
  status?: string | null;
}): string {
  switch (input.paymentStatus) {
    case "awaiting_receipt":
      return "We are waiting for your payment receipt. Upload a photo or PDF of your receipt below, then our team will check it.";
    case "under_review":
      return "We have your receipt and our team is checking it. You do not need to do anything — we will contact you as soon as it is approved.";
    case "rejected":
      return `We could not accept your last receipt${input.rejectionReason ? `: ${input.rejectionReason}` : "."} Please upload a new one below.`;
    case "approved":
      return `Payment confirmed — your place is secured${input.registrationNumber ? `. Your registration number is ${input.registrationNumber}` : ""}.`;
    case "not_required":
    default:
      return input.registrationNumber
        ? `Your registration is confirmed. Your registration number is ${input.registrationNumber}.`
        : "Your registration has been received. A team member will confirm it and give you your registration number.";
  }
}

/** True when a registration still needs a file from the person. */
export function canUploadReceipt(paymentStatus: string | undefined | null): boolean {
  return paymentStatus === "awaiting_receipt" || paymentStatus === "rejected";
}

/** Types that never pay, whatever the programme or event says. */
export const NEVER_PAY_TYPES = ["educator", "professional", "partner"];
