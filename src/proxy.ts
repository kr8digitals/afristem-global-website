import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * Request proxy (Next 16's replacement for middleware.ts).
 *
 * It does three jobs:
 *
 * 1. Auth — everything under /admin and /api/admin needs an admin session.
 * 2. CORS — the public content endpoints stay readable from any origin so the
 *    site keeps working when it is embedded in a preview pane (where the page
 *    origin is "null"). That allowance is scoped to public URLs only: admin
 *    routes never receive a wildcard origin.
 * 3. Headers — admin responses are marked no-store and noindex, and admin
 *    pages are made un-frameable (clickjacking protection).
 */

/** Wildcard CORS is fine for public content and public form endpoints. */
const PUBLIC_CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Accept-Version, RSC, Next-Url, Next-Action, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch",
  "Access-Control-Max-Age": "86400",
  "Cross-Origin-Resource-Policy": "cross-origin",
  Vary: "Origin",
};

/** Never cached, never indexed, never framed. */
const ADMIN_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Content-Security-Policy": "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
};

const isAdminPath = (p: string) => p === "/admin" || p.startsWith("/admin/") || p === "/api/admin" || p.startsWith("/api/admin/");

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const admin = isAdminPath(pathname);

  if (request.method === "OPTIONS") {
    // Only public endpoints advertise a preflight; admin failures stay opaque.
    return new NextResponse(null, { status: admin ? 405 : 204, headers: admin ? ADMIN_HEADERS : PUBLIC_CORS });
  }

  const isAuthEntry =
    pathname === "/admin/login" || pathname === "/api/admin/login" || pathname === "/api/admin/logout";

  if (admin && !isAuthEntry) {
    const ok = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (!ok) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ ok: false, error: "Unauthorised" }, { status: 401, headers: ADMIN_HEADERS });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      const res = NextResponse.redirect(url);
      for (const [k, v] of Object.entries(ADMIN_HEADERS)) res.headers.set(k, v);
      return res;
    }
  }

  const response = NextResponse.next();
  if (process.env.SITE_INDEXING_ENABLED === "false") {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  if (admin) {
    for (const [k, v] of Object.entries(ADMIN_HEADERS)) response.headers.set(k, v);
  } else if (pathname.startsWith("/api/")) {
    for (const [k, v] of Object.entries(PUBLIC_CORS)) response.headers.set(k, v);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|images/|favicon).*)"],
};
