/**
 * Lightweight email dispatcher.
 * Set RESEND_API_KEY (https://resend.com – free tier) and CONTACT_TO_EMAIL in the
 * hosting environment (Vercel → Project → Settings → Environment Variables)
 * to receive form submissions by email. Without a key, emails are only written
 * to the server log (`dev: true`) — nothing is delivered.
 */

export type MailResult = { ok: boolean; dev?: boolean };

/** True when real email delivery is configured. */
export function mailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/** The office inbox that receives notifications. */
export function officeInbox(): string {
  return process.env.CONTACT_TO_EMAIL?.trim() || "contact@afristemglobal.com";
}

export async function sendMail({
  subject,
  html,
  replyTo,
  to,
  from,
}: {
  subject: string;
  html: string;
  replyTo?: string;
  to?: string;
  from?: string;
}): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  const recipient = to || officeInbox();
  const sender = from || process.env.MAIL_FROM || "AFRISTEM Website <onboarding@resend.dev>";

  if (!key) {
    console.log(
      `[mail:dev] To: ${recipient}\nSubject: ${subject}\n${html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}`,
    );
    return { ok: true, dev: true };
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: sender, to: [recipient], subject, html, reply_to: replyTo }),
    });
    if (!r.ok) {
      console.error("[mail] failed", await r.text());
      return { ok: false };
    }
    return { ok: true };
  } catch (error) {
    console.error("[mail] error", error);
    return { ok: false };
  }
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

export function renderTable(data: Record<string, unknown>, skip: string[] = []) {
  const rows = Object.entries(data)
    .filter(([k, v]) => !skip.includes(k) && v !== undefined && v !== null && String(v).trim() !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;border:1px solid #e5e7eb;font-weight:600;text-transform:capitalize">${escapeHtml(
          k.replace(/([A-Z])/g, " $1"),
        )}</td><td style="padding:6px 12px;border:1px solid #e5e7eb">${escapeHtml(String(v))}</td></tr>`,
    )
    .join("");
  return `<table style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:14px">${rows}</table>`;
}

/** Nicely formatted wrapper used for admin replies. */
export function renderReply(bodyHtml: string) {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.65;color:#0f172a">
${bodyHtml}
<p style="margin-top:24px;color:#64748b;font-size:13px">— AFRISTEM Global<br/>Advancing STEM education across Africa</p>
</div>`;
}

/** The confirmation a registrant receives (only sent when email delivery is configured). */
export function renderRegistrationConfirmation(input: {
  firstName: string;
  reference: string;
  what: string;
  orgName: string;
  orgEmail: string;
  orgPhone: string;
}) {
  const e = escapeHtml;
  return `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.65;color:#0f172a">
<p>Hello ${e(input.firstName || "there")},</p>
<p>Thank you for registering${input.what ? ` for <strong>${e(input.what)}</strong>` : ""} with ${e(input.orgName)}. We have received your details.</p>
<p style="margin:20px 0;padding:14px 18px;border-radius:12px;background:#fff8e1;border:1px solid #ffc42d">
  Your registration reference: <strong style="font-size:17px;letter-spacing:.04em">${e(input.reference)}</strong><br/>
  <span style="color:#64748b;font-size:13px">Please quote it whenever you contact us.</span>
</p>
<p>Our team will contact you with the next steps${input.what ? " for this programme" : ""}, including any fees and payment instructions where they apply.</p>
<p>Questions? Reply to this email, write to <a href="mailto:${e(input.orgEmail)}">${e(input.orgEmail)}</a> or call ${e(input.orgPhone)}.</p>
<p style="margin-top:24px;color:#64748b;font-size:13px">— ${e(input.orgName)}<br/>Advancing STEM education across Africa</p>
</div>`;
}

/* ------------------------------------------------ payment proof (step 2) */

const wrap = (body: string) =>
  `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.65;color:#0f172a">
${body}
<p style="margin-top:24px;color:#64748b;font-size:13px">— AFRISTEM Global<br/>Advancing STEM education across Africa</p>
</div>`;

const referenceBox = (reference: string, registrationNumber?: string) =>
  `<p style="margin:20px 0;padding:14px 18px;border-radius:12px;background:#fff8e1;border:1px solid #ffc42d">
  Registration reference: <strong style="font-size:17px;letter-spacing:.04em">${escapeHtml(reference)}</strong>${
    registrationNumber
      ? `<br/>Registration number: <strong style="font-size:17px;letter-spacing:.04em">${escapeHtml(registrationNumber)}</strong>`
      : ""
  }</p>`;

export type PaymentMailInput = {
  reference: string;
  fullName: string;
  what: string;
  registrationNumber?: string;
  reason?: string;
  orgName: string;
  orgEmail: string;
  orgPhone: string;
  whatsapp?: string;
  statusUrl?: string;
};

/** "We have your receipt — an admin will review it." */
export function renderReceiptReceived(input: PaymentMailInput) {
  const e = escapeHtml;
  return wrap(`<p>Hello ${e(input.fullName || "there")},</p>
<p>Thank you — we have received your payment receipt${input.what ? ` for <strong>${e(input.what)}</strong>` : ""}.</p>
${referenceBox(input.reference)}
<p>Our team will check it and confirm your registration. You do not need to do anything else for now; we will email you as soon as it is reviewed.</p>
<p>You can check your status at any time${input.statusUrl ? ` at <a href="${e(input.statusUrl)}">${e(input.statusUrl)}</a>` : ""} using your reference and this email address.</p>
<p>Questions? Write to <a href="mailto:${e(input.orgEmail)}">${e(input.orgEmail)}</a> or call ${e(input.orgPhone)}.</p>`);
}

/** "Approved — here is your registration number." */
export function renderRegistrationApproved(input: PaymentMailInput) {
  const e = escapeHtml;
  return wrap(`<p>Hello ${e(input.fullName || "there")},</p>
<p>Good news — your payment has been confirmed${input.what ? ` and your place on <strong>${e(input.what)}</strong> is secured` : ""}.</p>
${referenceBox(input.reference, input.registrationNumber)}
<p>Please keep your registration number safe: quote it on the exam day and in every message to us.</p>
<p>You can print your confirmation slip at any time${input.statusUrl ? ` from <a href="${e(input.statusUrl)}">${e(input.statusUrl)}</a>` : ""}, using your reference and this email address.</p>
<p>Questions? Write to <a href="mailto:${e(input.orgEmail)}">${e(input.orgEmail)}</a> or call ${e(input.orgPhone)}.</p>`);
}

/** "We could not accept the receipt — here is why, please upload another." */
export function renderReceiptRejected(input: PaymentMailInput) {
  const e = escapeHtml;
  return wrap(`<p>Hello ${e(input.fullName || "there")},</p>
<p>Thank you for sending your payment receipt${input.what ? ` for <strong>${e(input.what)}</strong>` : ""}. We could not accept it yet.</p>
${referenceBox(input.reference)}
<p style="margin:16px 0;padding:12px 16px;border-radius:12px;background:#fef2f2;border:1px solid #fecaca">
  <strong>Reason:</strong> ${e(input.reason || "The receipt could not be verified.")}
</p>
<p>Please upload a new receipt${input.statusUrl ? ` at <a href="${e(input.statusUrl)}">${e(input.statusUrl)}</a>` : ""} — use your reference and this email address. If you have already paid, send the same receipt again with the bank reference visible, or contact us and we will sort it out.</p>
<p>Questions? Write to <a href="mailto:${e(input.orgEmail)}">${e(input.orgEmail)}</a> or call ${e(input.orgPhone)}.</p>`);
}

/** The office: a new receipt is waiting for review. */
export function renderNewReceiptOffice(input: PaymentMailInput & { fileName?: string; uploaderPhone?: string; fee?: string }) {
  const e = escapeHtml;
  return wrap(`<h2 style="font-family:system-ui,sans-serif;margin:0 0 12px">New payment receipt to review</h2>
${renderTable({
  reference: input.reference,
  name: input.fullName,
  phone: input.uploaderPhone,
  registeredFor: input.what,
  fee: input.fee,
  file: input.fileName,
})}
<p style="margin-top:16px">Open <strong>Admin → Registrations → Payments to review</strong> to approve or reject it.${input.statusUrl ? ` The registrant can follow progress at ${e(input.statusUrl)}.` : ""}</p>`);
}
