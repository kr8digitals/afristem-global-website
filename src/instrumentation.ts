/**
 * Boot-time checks. Runs once when the server starts (Node runtime only).
 *
 * These are warnings, never failures: a misconfigured environment should still
 * serve the site rather than take it offline, but the operator should not have
 * to guess why something is not working. Set variables in
 * Vercel → Project → Settings → Environment Variables.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { secretIsFallback } = await import("@/lib/auth");
  const { dbConfigured, keyKind } = await import("@/lib/db");

  if (!dbConfigured()) {
    console.warn(
      "[db] SUPABASE_URL / SUPABASE_SECRET_KEY are not set — pages show the built-in content and forms cannot be saved.",
    );
  } else if (["publishable", "anon"].includes(keyKind())) {
    console.warn("[db] SUPABASE_SECRET_KEY holds a PUBLIC key. Use the project's secret (service_role) key.");
  }

  if (secretIsFallback()) {
    console.warn(
      "[security] ADMIN_SECRET is not set, so admin sessions are signed with the built-in development secret. " +
        "Set ADMIN_SECRET (16+ random characters).",
    );
  }

  if (!process.env.ADMIN_PASSWORD) {
    console.warn(
      "[security] ADMIN_PASSWORD is not set. Until the first sign-in stores a password, the dashboard accepts the " +
        "shipped default — sign in and change it in Admin → Settings.",
    );
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("[mail] RESEND_API_KEY is not set — notification, confirmation and reply emails are not delivered.");
  }
}
