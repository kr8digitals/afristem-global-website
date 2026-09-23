/**
 * Admin authentication.
 *
 * Deliberately dependency-free: PBKDF2 for password hashing and HMAC-SHA256
 * signed session cookies, both via Web Crypto so the same code runs in the
 * middleware (edge) and in Node route handlers.
 */

export const SESSION_COOKIE = "afristem_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

/** Used when neither the store nor ADMIN_SECRET provides a secret. */
const FALLBACK_SECRET = "afristem-global-admin-session-secret-v1";

/** The shipped dashboard password. Change it from Admin → Settings. */
export const DEFAULT_ADMIN_PASSWORD = "Afr!@Ad?nàccess";

function secret(): string {
  return process.env.ADMIN_SECRET || FALLBACK_SECRET;
}

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(str: string): Uint8Array {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const s = atob(str.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return b64url(sig);
}

/* --------------------------------------------------------------- sessions */

export async function createSessionToken(now = Date.now()): Promise<string> {
  const exp = Math.floor(now / 1000) + SESSION_TTL_SECONDS;
  const payload = b64url(enc.encode(JSON.stringify({ exp, v: 1 })));
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token || !token.includes(".")) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = await hmac(payload);
  // constant-time-ish comparison
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  if (diff !== 0) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as { exp: number };
    return typeof data.exp === "number" && data.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------- passwords */

export function newSalt(): string {
  return b64url(crypto.getRandomValues(new Uint8Array(16)));
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode(salt), iterations: 120_000, hash: "SHA-256" },
    key,
    256,
  );
  return b64url(bits);
}

export async function verifyPassword(password: string, stored: { passwordHash: string; salt: string }): Promise<boolean> {
  const hash = await hashPassword(password, stored.salt);
  if (hash.length !== stored.passwordHash.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) diff |= hash.charCodeAt(i) ^ stored.passwordHash.charCodeAt(i);
  return diff === 0;
}

export function cookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
