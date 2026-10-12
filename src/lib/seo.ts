import type { Metadata } from "next";
import { site } from "@/content/site";

/** One canonical origin, independent of incoming Host/preview headers. */
export function siteOrigin(): string {
  const url = new URL(process.env.NEXT_PUBLIC_SITE_URL || site.url);
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTP(S) URL");
  return url.origin;
}
export const indexingEnabled = () => process.env.SITE_INDEXING_ENABLED !== "false";
export function absoluteUrl(path: string): string { return new URL(path, siteOrigin()).href; }
export function pageMetadata(path: string, metadata: Metadata): Metadata {
  const title = typeof metadata.title === "string" ? metadata.title : metadata.title && "absolute" in metadata.title ? metadata.title.absolute : site.name;
  const description = metadata.description || site.description;
  const image = absoluteUrl("/opengraph-image");
  return {
    ...metadata,
    alternates: { ...metadata.alternates, canonical: absoluteUrl(path), types: { "application/rss+xml": absoluteUrl("/feed.xml"), ...metadata.alternates?.types } },
    openGraph: { type: "website", locale: "en_NG", siteName: site.name, title, description, images: [{ url: image, width: 1200, height: 630 }], ...metadata.openGraph, url: absoluteUrl(path) },
    twitter: { card: "summary_large_image", title, description, images: [image], ...metadata.twitter },
    robots: indexingEnabled() ? metadata.robots : { index: false, follow: false },
  };
}
export const publicPages = ["/", "/about", "/programmes", "/services", "/schools", "/educators", "/stem-professionals", "/partners", "/prime-stem-nigeria", "/digital-science-school", "/stem-guide-for-schools", "/events", "/news", "/gallery", "/contact", "/faq", "/explore"];
export function xmlEscape(value: string): string {
  return value.replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char]!);
}
