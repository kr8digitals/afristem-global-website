import type { EventItem, Post } from "@/content/data";
import type { Programme } from "@/content/programmes";
import type { SiteSettings } from "@/lib/store";
import { absoluteUrl, siteOrigin } from "@/lib/seo";
import { site } from "@/content/site";

const organizationId = () => absoluteUrl("/#organization");
export function organizationSchema(settings: SiteSettings) {
  return { "@context": "https://schema.org", "@type": "EducationalOrganization", "@id": organizationId(), name: settings.name, legalName: site.legalName, alternateName: "AFRISTEM Global", url: siteOrigin(), logo: absoluteUrl("/images/brand/logo.png"), description: settings.description, email: settings.email, telephone: settings.primaryPhone,
    sameAs: settings.socials.map((s) => s.href).filter((href) => /^https:\/\//.test(href)),
    address: settings.offices.map((o) => ({ "@type": "PostalAddress", streetAddress: o.address, addressLocality: o.city, addressCountry: "NG" })),
  };
}
export function websiteSchema() {
  return { "@context": "https://schema.org", "@type": "WebSite", "@id": absoluteUrl("/#website"), url: siteOrigin(), name: "AFRISTEM Global", alternateName: "AFRISTEM", inLanguage: "en", publisher: { "@id": organizationId() } };
}
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ name: "Home", path: "/" }, ...items].map((i, index) => ({ "@type": "ListItem", position: index + 1, name: i.name, item: absoluteUrl(i.path) })) };
}
export function eventSchema(e: EventItem) {
  // Registration closing is NOT event cancellation. Do not invent offers,
  // confirmed venue addresses, precise start times, ratings or ticket stock.
  return { "@context": "https://schema.org", "@type": "EducationEvent", "@id": absoluteUrl(`/events/${e.slug}#event`), url: absoluteUrl(`/events/${e.slug}`), name: e.title, description: e.description, startDate: e.start, ...(e.end ? { endDate: e.end } : {}),
    image: [absoluteUrl(e.flyer || e.image)],
    eventAttendanceMode: `https://schema.org/${e.mode === "Virtual" ? "OnlineEventAttendanceMode" : e.mode === "Hybrid" ? "MixedEventAttendanceMode" : "OfflineEventAttendanceMode"}`,
    location: e.mode === "Virtual" ? { "@type": "VirtualLocation", url: absoluteUrl(`/events/${e.slug}`), name: e.location } : { "@type": "Place", name: e.location },
    organizer: e.programmeSlug ? { "@type": "Organization", name: "Prime STEM Nigeria", url: "https://primestemnigeria.afristemglobal.org", ...(e.contactEmail ? { email: e.contactEmail } : {}) } : { "@id": organizationId() },
  };
}
export function articleSchema(p: Post) {
  return { "@context": "https://schema.org", "@type": "Article", "@id": absoluteUrl(`/news/${p.slug}#article`), mainEntityOfPage: absoluteUrl(`/news/${p.slug}`), headline: p.title, description: p.excerpt, image: [absoluteUrl(p.image)], datePublished: p.date, author: { "@type": "Organization", name: p.author }, publisher: { "@id": organizationId() }, articleSection: p.category, inLanguage: "en", articleBody: p.body.join("\n\n") };
}
export function programmeSchema(p: Programme) {
  return { "@context": "https://schema.org", "@type": "EducationalOccupationalProgram", name: p.name, description: p.shortDescription, url: absoluteUrl(`/programmes/${p.slug}`), image: absoluteUrl(p.image), provider: { "@id": organizationId() } };
}
