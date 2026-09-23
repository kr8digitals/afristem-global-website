import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * Middleware does two jobs:
 *
 * 1. CORS — the site is public content, so allowing any origin keeps Next.js
 *    client-side navigation (RSC fetches) working when the site is embedded in
 *    a sandboxed iframe, e.g. a hosting preview pane or a client review widget.
 * 2. Auth — everything under /admin and /api/admin requires an admin session.
 */
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, Accept-Version, RSC, Next-Url, Next-Action, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch",
  "Access-Control-Max-Age": "86400",
  "Cross-Origin-Resource-Policy": "cross-origin",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }

  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isAuthEntry = pathname === "/admin/login" || pathname === "/api/admin/login" || pathname === "/api/admin/logout";

  if ((isAdminPage || isAdminApi) && !isAuthEntry) {
    const ok = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (!ok) {
      if (isAdminApi) {
        return NextResponse.json({ ok: false, error: "Unauthorised" }, { status: 401, headers: CORS_HEADERS });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|images/|favicon).*)"],
};
