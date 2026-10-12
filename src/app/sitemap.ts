import type { MetadataRoute } from "next";
import { programmes } from "@/content/programmes";
import { posts } from "@/content/data";
import { siteUrl } from "@/lib/seo";

/**
 * sitemap.xml — every public URL with priorities tuned to the content
 * strategy: programme and school-facing pages rank highest, legal pages
 * lowest. Kept error-free and in sync with the route tree.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: Array<[string, number, MetadataRoute.Sitemap[number]["changeFrequency"]]> = [
    ["", 1.0, "weekly"],
    ["/programmes", 0.9, "weekly"],
    ["/digital-science-school", 0.9, "weekly"],
    ["/prime-stem-nigeria", 0.9, "weekly"],
    ["/services", 0.8, "monthly"],
    ["/events", 0.8, "daily"],
    ["/news", 0.8, "daily"],
    ["/register", 0.8, "monthly"],
    ["/contact", 0.7, "monthly"],
    ["/schools", 0.7, "monthly"],
    ["/educators", 0.7, "monthly"],
    ["/stem-professionals", 0.7, "monthly"],
    ["/faq", 0.7, "monthly"],
    ["/about", 0.7, "monthly"],
    ["/partners", 0.6, "monthly"],
    ["/stem-guide-for-schools", 0.6, "monthly"],
    ["/gallery", 0.5, "monthly"],
    ["/privacy", 0.2, "yearly"],
    ["/terms", 0.2, "yearly"],
    ["/cookies", 0.2, "yearly"],
  ];

  return [
    ...pages.map(([path, priority, changeFrequency]) => ({
      url: `${siteUrl}${path}`,
      lastModified: now,
      changeFrequency: changeFrequency as "weekly" | "monthly" | "daily" | "yearly",
      priority,
    })),
    ...programmes.map((p) => ({
      url: `${siteUrl}/programmes/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...posts.map((p) => ({
      url: `${siteUrl}/news/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
