import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * CORS middleware.
 *
 * The site is fully public content, so allowing any origin is safe. This keeps
 * Next.js client-side navigation (which fetches RSC payloads) working when the
 * site is embedded in a sandboxed iframe — e.g. a hosting preview pane or a
 * client review widget — where the page origin is opaque ("null").
 */
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, Accept-Version, RSC, Next-Url, Next-Action, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch",
  "Access-Control-Max-Age": "86400",
  "Cross-Origin-Resource-Policy": "cross-origin",
};

export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
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
