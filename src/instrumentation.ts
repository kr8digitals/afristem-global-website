/**
 * Boot-time checks. Runs once when the server starts (Node runtime only).
 *
 * These are warnings, never failures: a misconfigured environment should still
 * serve the site rather than take it offline, but the operator should not have
 * to guess why something is not working.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { secretIsFallback } = await import("@/lib/auth");

  if (secretIsFallback()) {
    console.warn(
      "[security] ADMIN_SECRET is not set, so admin sessions are signed with the " +
        "built-in development secret. Set ADMIN_SECRET (16+ random characters) in " +
        "Hostinger → Environment Variables.",
    );
  }

  if (!process.env.ADMIN_PASSWORD) {
    console.warn(
      "[security] ADMIN_PASSWORD is not set. The dashboard falls back to the shipped " +
        "default password until you change it in Admin → Settings.",
    );
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("[mail] RESEND_API_KEY is not set — form notification emails will not be delivered.");
  }
}
