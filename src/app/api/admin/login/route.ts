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
import { dbConfigured, getAdminUser, setAdminPassword } from "@/lib/store";
import { logDbError } from "@/lib/db";
import { NO_STORE_HEADERS, clientIp, rateLimit, resetRateLimit, tooManyRequests } from "@/lib/security";

export const dynamic = "force-dynamic";

/** 8 attempts per IP per 10 minutes, on top of the per-attempt delay below. */
const LOGIN_LIMIT = 8;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;

const sameText = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

export async function POST(req: Request) {
  const ip = clientIp(req);
  const gate = rateLimit(`login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!gate.ok) return tooManyRequests(gate.retryAfter);

  const body = (await req.json().catch(() => null)) as { password?: string } | null;
  const password = String(body?.password ?? "").normalize("NFC").slice(0, 512);
  if (!password) {
    return NextResponse.json({ ok: false, error: "Password required" }, { status: 400, headers: NO_STORE_HEADERS });
  }

  // Before the first login there is no stored hash: accept ADMIN_PASSWORD (or the shipped default).
  const initialPassword = (process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD).normalize("NFC");

  let valid = false;
  if (!dbConfigured()) {
    // local development without a database: nothing can be saved, but the dashboard can be viewed
    valid = sameText(password, initialPassword);
  } else {
    let user;
    try {
      user = await getAdminUser();
    } catch (error) {
      // never fall back to the initial password when the real one cannot be checked
      logDbError("login", error);
      return NextResponse.json(
        { ok: false, error: "The database is not reachable right now, so sign-in is unavailable. Please try again shortly." },
        { status: 503, headers: NO_STORE_HEADERS },
      );
    }
    if (user) {
      valid = await verifyPassword(password, user);
    } else {
      valid = sameText(password, initialPassword);
      if (valid) {
        // first successful login pins a hash so the password can be changed later
        try {
          const salt = newSalt();
          await setAdminPassword(await hashPassword(password, salt), salt, true);
        } catch (error) {
          logDbError("login (pin password)", error);
        }
      }
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
