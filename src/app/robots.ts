import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || site.url;
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The dashboard, the API and admin uploads must never be indexed.
        disallow: ["/api/", "/admin", "/admin/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
