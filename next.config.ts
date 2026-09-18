import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  poweredByHeader: false,
  allowedDevOrigins: ["*.e2b.app", "*.e2b.dev", "localhost"],
};

export default nextConfig;
