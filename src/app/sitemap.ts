import type { MetadataRoute } from "next";
import { programmes } from "@/content/programmes";
import { content } from "@/lib/content";
import { absoluteUrl, publicPages } from "@/lib/seo";
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const { news, events } = content();
  // No fabricated lastModified=now: the store timestamp also changes on form
  // submissions, which is not evidence that a public page changed.
  const paths = [...publicPages, ...programmes.map((p) => `/programmes/${p.slug}`), ...events.filter((e) => e.slug !== "skc-international-aoct-exam-2026").map((e) => `/events/${e.slug}`), ...news.map((p) => `/news/${p.slug}`)];
  return [...new Set(paths)].map((path) => ({ url: absoluteUrl(path) }));
}
