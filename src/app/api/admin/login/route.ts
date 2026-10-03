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
import {
  NO_STORE_HEADERS,
  clientIp,
  rateLimit,
  resetRateLimit,
  tooManyRequests,
} from "@/lib/security";

export const dynamic = "force-dynamic";

/** 8 attempts per IP per 10 minutes, on top of the per-attempt delay below. */
const LOGIN_LIMIT = 8;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  const ip = clientIp(req);
  const gate = rateLimit(`login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!gate.ok) return tooManyRequests(gate.retryAfter);

  const body = (await req.json().catch(() => null)) as { password?: string } | null;
  const password = (body?.password ?? "").normalize("NFC").slice(0, 512);
  if (!password) {
    return NextResponse.json({ ok: false, error: "Password required" }, { status: 400, headers: NO_STORE_HEADERS });
  }

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
    return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401, headers: NO_STORE_HEADERS });
  }

  resetRateLimit(`login:${ip}`);
  const token = await createSessionToken();
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, cookieOptions());
  return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
}
