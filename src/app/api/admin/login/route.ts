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
import { readStore, updateStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { password?: string } | null;
  const password = (body?.password ?? "").normalize("NFC");
  if (!password) return NextResponse.json({ ok: false, error: "Password required" }, { status: 400 });

  const store = readStore();
  const user = store.admin.user;

  let valid = false;
  if (user) {
    valid = await verifyPassword(password, user);
  } else {
    // no password set yet → compare against env or the shipped default
    const expected = (process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD).normalize("NFC");
    valid = password === expected;
    if (valid) {
      // first successful login pins a hash so the password can be changed later
      const salt = newSalt();
      const passwordHash = await hashPassword(password, salt);
      updateStore((s) => {
        s.admin.user = { passwordHash, salt, updatedAt: new Date().toISOString() };
      });
    }
  }

  if (!valid) {
    await new Promise((r) => setTimeout(r, 350)); // slow down brute force
    return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
  }

  const token = await createSessionToken();
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, cookieOptions());
  return NextResponse.json({ ok: true });
}
