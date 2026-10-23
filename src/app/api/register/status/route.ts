import { NextResponse } from "next/server";
import { logDbError, publicError } from "@/lib/db";
import { clientIp, rateLimit, tooManyRequests, txt } from "@/lib/security";
import { getContent, getRegistrationStatus } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * 10 lookups per IP per 10 minutes. A person checking their own registration
 * needs one or two; this stops anyone using the page to guess references.
 */
const LIMIT = 10;
const WINDOW_MS = 10 * 60 * 1000;

const NOT_FOUND = {
  found: false,
  message:
    "We could not find a registration with that reference and email address. Check both and try again — the reference looks like AFR-2026-1F4C9.",
};

/**
 * GET /api/register/status?reference=AFR-…&email=…
 *
 * A reference and an email must BOTH match. When either is wrong the answer is
 * identical, so this endpoint can never be used to discover which references
 * exist.
 */
export async function GET(req: Request) {
  const gate = rateLimit(`status:${clientIp(req)}`, LIMIT, WINDOW_MS);
  if (!gate.ok) return tooManyRequests(gate.retryAfter);

  try {
    const url = new URL(req.url);
    const reference = txt(url.searchParams.get("reference"), 40).toUpperCase();
    const email = txt(url.searchParams.get("email"), 200).toLowerCase();
    if (!reference || !email) {
      return NextResponse.json(
        { found: false, message: "Enter both your registration reference and the email address you used." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const result = await getRegistrationStatus(reference, email);
    if (!result.found) {
      return NextResponse.json(NOT_FOUND, { headers: { "Cache-Control": "no-store" } });
    }

    // The WhatsApp number comes from Admin → Brand & contact.
    const { site } = await getContent();
    return NextResponse.json(
      {
        ...result,
        whatsapp: site.whatsapp || site.primaryPhone || "",
        orgName: site.name || "AFRISTEM",
        orgEmail: site.email || "",
        orgPhone: site.primaryPhone || "",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    logDbError("registration status", error);
    return NextResponse.json({ found: false, error: publicError(error) }, { status: 500 });
  }
}
