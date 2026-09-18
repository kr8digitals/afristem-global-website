import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  poweredByHeader: false,
  allowedDevOrigins: ["*.e2b.app", "*.e2b.dev", "localhost"],
  async headers() {
    // Allow static assets (notably the self-hosted brand fonts) to load when the
    // site is embedded in a sandboxed iframe, where the page origin is "null".
    return [
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
};

export default nextConfig;
