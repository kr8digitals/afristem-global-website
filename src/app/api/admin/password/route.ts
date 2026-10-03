import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, cookieOptions, createSessionToken, hashPassword, newSalt, verifyPassword } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/store";
import { requireAdmin } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as { current?: string; next?: string } | null;
  const next = (body?.next ?? "").normalize("NFC");
  const current = (body?.current ?? "").normalize("NFC");
  if (next.length < 8) return NextResponse.json({ ok: false, error: "New password must be at least 8 characters" }, { status: 400 });

  const user = readStore().admin.user;
  if (user) {
    const ok = await verifyPassword(current, user);
    if (!ok) return NextResponse.json({ ok: false, error: "Current password is incorrect" }, { status: 401 });
  }

  const salt = newSalt();
  const passwordHash = await hashPassword(next, salt);
  updateStore((s) => {
    s.admin.user = { passwordHash, salt, updatedAt: new Date().toISOString() };
  });

  // keep the current session valid
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSessionToken(), cookieOptions());
  return NextResponse.json({ ok: true });
}
