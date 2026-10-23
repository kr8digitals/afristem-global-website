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
