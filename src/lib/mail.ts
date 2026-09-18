/**
 * Lightweight email dispatcher.
 * Set RESEND_API_KEY (https://resend.com – free tier) and CONTACT_TO_EMAIL in .env
 * to receive form submissions by email. Without a key, submissions are logged
 * to the server console so nothing breaks in development or preview.
 */
export async function sendMail({ subject, html, replyTo }: { subject: string; html: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || "contact@afristemglobal.com";
  const from = process.env.MAIL_FROM || "AFRISTEM Website <onboarding@resend.dev>";

  if (!key) {
    console.log(`[mail:dev] To: ${to}\nSubject: ${subject}\n${html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}`);
    return { ok: true, dev: true };
  }

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html, reply_to: replyTo }),
  });
  if (!r.ok) {
    console.error("[mail] failed", await r.text());
    return { ok: false };
  }
  return { ok: true };
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

export function renderTable(data: Record<string, string>, skip: string[] = []) {
  const rows = Object.entries(data)
    .filter(([k, v]) => !skip.includes(k) && v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;border:1px solid #e5e7eb;font-weight:600;text-transform:capitalize">${escapeHtml(k.replace(/([A-Z])/g, " $1"))}</td><td style="padding:6px 12px;border:1px solid #e5e7eb">${escapeHtml(v)}</td></tr>`)
    .join("");
  return `<table style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:14px">${rows}</table>`;
}
