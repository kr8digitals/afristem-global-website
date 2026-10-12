import type { MetadataRoute } from "next";
import { programmes } from "@/content/programmes";
import { content } from "@/lib/content";
export const dynamic = "force-dynamic";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const { news: posts, events } = content();
  const base = process.env.NEXT_PUBLIC_SITE_URL || site.url;
  const now = new Date();
  const statics = ["", "/about", "/programmes", "/services", "/schools", "/educators", "/stem-professionals", "/partners", "/prime-stem-nigeria", "/events", "/news", "/gallery", "/contact", "/register", "/faq", "/privacy", "/terms", "/cookies"];
  return [
    ...statics.map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: (p === "" ? "weekly" : "monthly") as "weekly" | "monthly", priority: p === "" ? 1 : 0.7 })),
    ...programmes.map((p) => ({ url: `${base}/programmes/${p.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 })),
    ...events.map((e) => ({ url: `${base}/events/${e.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...posts.map((p) => ({ url: `${base}/news/${p.slug}`, lastModified: new Date(p.date), changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
