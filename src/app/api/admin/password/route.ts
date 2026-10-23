import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  DEFAULT_ADMIN_PASSWORD,
  SESSION_COOKIE,
  cookieOptions,
  createSessionToken,
  hashPassword,
  newSalt,
  verifyPassword,
} from "@/lib/auth";
import { getAdminUser, setAdminPassword } from "@/lib/store";
import { logDbError, publicError } from "@/lib/db";
import { NO_STORE_HEADERS, requireAdmin } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as { current?: string; next?: string } | null;
  const next = String(body?.next ?? "").normalize("NFC");
  const current = String(body?.current ?? "").normalize("NFC");
  if (next.length < 8) return NextResponse.json({ ok: false, error: "New password must be at least 8 characters" }, { status: 400 });
  if (next.length > 512) return NextResponse.json({ ok: false, error: "New password is too long" }, { status: 400 });

  try {
    const user = await getAdminUser();
    const ok = user
      ? await verifyPassword(current, user)
      : current === (process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD).normalize("NFC");
    if (!ok) return NextResponse.json({ ok: false, error: "Current password is incorrect" }, { status: 401 });

    const salt = newSalt();
    await setAdminPassword(await hashPassword(next, salt), salt, false);
  } catch (error) {
    logDbError("password", error);
    return NextResponse.json({ ok: false, error: publicError(error) }, { status: 500 });
  }

  // keep the current session valid
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSessionToken(), cookieOptions());
  return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
}
