import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * Deliberately conservative: only directives that cannot break asset loading are
 * set globally. A full `script-src`/`style-src` policy would need per-request
 * nonces, and `frame-ancestors` is intentionally NOT global — the site has to
 * stay embeddable in a hosting preview pane. Clickjacking protection is applied
 * to /admin instead (see src/proxy.ts), which is the surface that matters.
 */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  // Ignored over plain HTTP; harmless while the site is served over HTTPS.
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "Content-Security-Policy", value: "object-src 'none'; base-uri 'self'; form-action 'self'" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  poweredByHeader: false,
  allowedDevOrigins: ["*.e2b.app", "*.e2b.dev", "localhost"],
  async headers() {
    return [
      {
        // Everything except the paths handled below.
        source: "/((?!_next/static|_next/image|images/|favicon).*)",
        headers: SECURITY_HEADERS,
      },
      {
        // Static assets must stay loadable when the page origin is "null"
        // (sandboxed preview iframes), so no restrictive headers here.
        source: "/_next/static/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
