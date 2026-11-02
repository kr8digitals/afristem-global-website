import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getContent } from "@/lib/content";

/** Built on request so new programmes and articles appear as soon as they are published. */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || site.url;
  const now = new Date();
  const { programmes, news } = await getContent();
  const statics = ["", "/about", "/programmes", "/services", "/schools", "/educators", "/stem-professionals", "/partners", "/prime-stem-nigeria", "/digital-science-school", "/stem-guide-for-schools", "/events", "/news", "/archive", "/gallery", "/contact", "/register", "/register/status", "/faq", "/privacy", "/terms", "/cookies"];
  return [
    ...statics.map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: (p === "" ? "weekly" : "monthly") as "weekly" | "monthly", priority: p === "" ? 1 : 0.7 })),
    ...programmes.filter((p) => p.slug).map((p) => ({ url: `${base}/programmes/${p.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 })),
    ...news
      .filter((p) => p.slug)
      .map((p) => ({ url: `${base}/news/${p.slug}`, lastModified: p.date ? new Date(`${p.date}T00:00:00Z`) : now, changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
