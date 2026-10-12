import type { MetadataRoute } from "next";
import { absoluteUrl, indexingEnabled } from "@/lib/seo";
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: indexingEnabled() ? "/" : undefined, disallow: indexingEnabled() ? ["/api/", "/admin", "/admin/"] : "/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
