/**
 * ------------------------------------------------------------------
 *  AFRISTEM SEO toolkit: metadata builder + schema.org JSON-LD.
 *
 *  Every public page gets:
 *   - a unique, keyword-optimised <title> and meta description
 *   - canonical URL, Open Graph and Twitter Card tags
 *   - structured data (JSON-LD) tailored to the page type
 *
 *  The organisation entity graph (EducationalOrganization + NGO,
 *  WebSite, founder, sub-organisations, contact points, areas served)
 *  is emitted once in the root layout so every page carries the full
 *  brand entity for search engines and AI answer engines.
 * ------------------------------------------------------------------
 */
import type { Metadata } from "next";
import { site, PRIME_STEM_URL, DIGITAL_SCHOOL_URL } from "@/content/site";
import { seoPages, homeSeo, type FaqItem, type SeoPageKey } from "@/content/seo";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || site.url;

export const abs = (path: string) => `${siteUrl}${path === "/" ? "" : path}`;

/* ---------------------------------------------------------------- metadata */

/**
 * Builds complete per-page metadata: title, description, keywords,
 * canonical URL, Open Graph and Twitter Card tags.
 */
export function buildMetadata(key: SeoPageKey, path: string, overrides: Partial<Metadata> = {}): Metadata {
  const cfg = seoPages[key];
  const url = abs(path);
  const title = cfg.title;
  const description = cfg.description;
  return {
    title,
    description,
    keywords: cfg.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: `${site.name} — ${site.tagline}`,
      locale: site.locale,
      title: typeof title === "string" ? `${title} | ${site.name}` : `${site.legalName} — ${site.tagline}`,
      description,
      ...(cfg.ogImage
        ? { images: [{ url: cfg.ogImage, alt: typeof title === "string" ? title : site.tagline }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: typeof title === "string" ? `${title} | ${site.name}` : `${site.legalName} — ${site.tagline}`,
      description,
      site: "@afristemglobal",
      creator: "@afristemglobal",
      ...(cfg.ogImage ? { images: [cfg.ogImage] } : {}),
    },
    ...overrides,
  };
}

/** Metadata for dynamic article / programme pages (OG article type). */
export function buildDynamicMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
  type?: "article" | "website";
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata {
  const url = abs(opts.path);
  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: opts.type ?? "website",
      url,
      siteName: `${site.name} — ${site.tagline}`,
      locale: site.locale,
      title: `${opts.title} | ${site.name}`,
      description: opts.description,
      ...(opts.image ? { images: [{ url: opts.image, alt: opts.title }] } : {}),
      ...(opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
      ...(opts.modifiedTime ? { modifiedTime: opts.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${opts.title} | ${site.name}`,
      description: opts.description,
      site: "@afristemglobal",
      creator: "@afristemglobal",
      ...(opts.image ? { images: [opts.image] } : {}),
    },
  };
}

/** Home-page metadata (absolute title, broadest keyword set). */
export function homeMetadata(): Metadata {
  return {
    title: homeSeo.title,
    description: homeSeo.description,
    keywords: [...homeSeo.keywords],
    alternates: { canonical: siteUrl },
    openGraph: {
      type: "website",
      url: siteUrl,
      siteName: `${site.name} — ${site.tagline}`,
      locale: site.locale,
      title: homeSeo.title.absolute,
      description: homeSeo.description,
    },
    twitter: {
      card: "summary_large_image",
      title: homeSeo.title.absolute,
      description: homeSeo.description,
      site: "@afristemglobal",
      creator: "@afristemglobal",
    },
  };
}

/* ----------------------------------------------------------------- schemas */

type JsonLdValue = Record<string, unknown>;

const withContext = (value: JsonLdValue | JsonLdValue[]): JsonLdValue => ({
  "@context": "https://schema.org",
  ...(Array.isArray(value) ? { "@graph": value } : value),
});

/** The full organisation entity graph, emitted once in the root layout. */
export function organizationSchema(): JsonLdValue {
  const org: JsonLdValue = {
    "@type": ["EducationalOrganization", "NGO"],
    "@id": `${siteUrl}/#organization`,
    name: site.legalName,
    alternateName: [site.name, "AFRISTEM", "Afristem Global", "afristemglobal.org"],
    legalName: site.legalName,
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/images/brand/logo.png`,
      width: 512,
      height: 512,
    },
    image: `${siteUrl}/images/brand/logo.png`,
    description: site.description,
    slogan: site.tagline,
    email: site.email,
    telephone: site.phone,
    identifier: {
      "@type": "PropertyValue",
      propertyID: "CAC Registration (Nigeria)",
      value: site.rcNumber,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "PCN Plaza, Opposite Abakaliki Township Stadium, Kpirikpiri",
      addressLocality: "Abakaliki",
      addressRegion: "Ebonyi State",
      addressCountry: "NG",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: site.phone,
        contactType: "customer service",
        email: site.email,
        availableLanguage: ["English"],
        areaServed: "Worldwide",
      },
      {
        "@type": "ContactPoint",
        telephone: site.altPhone,
        contactType: "admissions",
        availableLanguage: ["English"],
        areaServed: ["NG", "Africa"],
      },
    ],
    areaServed: [
      { "@type": "AdministrativeArea", name: "Nigeria" },
      { "@type": "AdministrativeArea", name: "Africa" },
      { "@type": "Place", name: "Worldwide (online programmes)" },
    ],
    sameAs: [
      ...Object.values(site.social),
      PRIME_STEM_URL,
      DIGITAL_SCHOOL_URL,
    ],
    knowsAbout: [...site.knowsAbout],
    subOrganization: [
      {
        "@type": "Organization",
        "@id": `${PRIME_STEM_URL}/#organization`,
        name: "Prime STEM Nigeria",
        url: PRIME_STEM_URL,
        description:
          "Nigerian STEM education organisation running the Annual National Science Championship (ANSC), STEM boot camps and the Laptop for Schools Project.",
      },
      {
        "@type": "EducationalOrganization",
        "@id": `${DIGITAL_SCHOOL_URL}/#organization`,
        name: "AFRISTEM Digital Science School",
        alternateName: "Digital Science School",
        url: DIGITAL_SCHOOL_URL,
        email: "info@afristemschools.org",
        description:
          "Online science school for Primary 4-6, JSS, SSS and WAEC/NECO/JAMB candidates, with flexible learning and intensive mentorship.",
        parentOrganization: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  // Founder Person entity — emitted only when configured (see site.ts).
  const founderNodes: JsonLdValue[] = [];
  if (site.founder?.name) {
    const founderId = `${siteUrl}/#founder`;
    founderNodes.push({
      "@type": "Person",
      "@id": founderId,
      name: site.founder.name,
      ...(site.founder.role ? { jobTitle: site.founder.role } : {}),
      ...(site.founder.sameAs?.length ? { sameAs: site.founder.sameAs } : {}),
    });
    org.founder = { "@id": founderId };
    // Also link the founder to Prime STEM Nigeria (its own entity id).
    founderNodes.push({
      "@type": "Organization",
      "@id": `${PRIME_STEM_URL}/#organization`,
      founder: { "@id": founderId },
    });
  }

  const website: JsonLdValue = {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: site.name,
    alternateName: site.legalName,
    description: site.description,
    inLanguage: "en",
    publisher: { "@id": `${siteUrl}/#organization` },
  };

  const homepage: JsonLdValue = {
    "@type": "WebPage",
    "@id": `${siteUrl}/#webpage`,
    url: siteUrl,
    name: homeSeo.title.absolute,
    description: homeSeo.description,
    isPartOf: { "@id": `${siteUrl}/#website` },
    about: { "@id": `${siteUrl}/#organization` },
    inLanguage: "en",
  };

  return withContext([org, ...founderNodes, website, homepage]);
}

/** WebPage (or subtype) schema for individual pages. */
export function webPageSchema(opts: {
  path: string;
  title: string;
  description: string;
  type?: string;
  breadcrumb?: JsonLdValue;
  extra?: JsonLdValue;
}): JsonLdValue {
  const url = abs(opts.path);
  const page: JsonLdValue = {
    "@type": opts.type ?? "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: opts.title,
    description: opts.description,
    isPartOf: { "@id": `${siteUrl}/#website` },
    about: { "@id": `${siteUrl}/#organization` },
    inLanguage: "en",
    ...(opts.extra ?? {}),
  };
  const graph: JsonLdValue[] = [page];
  if (opts.breadcrumb) graph.push(opts.breadcrumb);
  return withContext(graph);
}

/** BreadcrumbList schema. `trail` excludes the Home crumb (added automatically). */
export function breadcrumbSchema(trail: { name: string; path: string }[]): JsonLdValue {
  return {
    "@type": "BreadcrumbList",
    "@id": `${abs(trail[trail.length - 1]?.path ?? "/")}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      ...trail.map((t, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: t.name,
        item: abs(t.path),
      })),
    ],
  };
}

/** FAQPage schema. Must mirror the FAQs visible on the page. */
export function faqSchema(items: FaqItem[]): JsonLdValue {
  return withContext({
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });
}

/** schema.org Event for AFRISTEM events. */
export function eventSchema(e: {
  title: string;
  description: string;
  start: string;
  end?: string;
  location: string;
  mode: "Physical" | "Virtual" | "Hybrid";
  image: string;
  registerHref: string;
}): JsonLdValue {
  const mode =
    e.mode === "Virtual"
      ? "https://schema.org/OnlineEventAttendanceMode"
      : e.mode === "Hybrid"
        ? "https://schema.org/MixedEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode";
  return {
    "@type": "Event",
    name: e.title,
    description: e.description,
    startDate: e.start,
    ...(e.end ? { endDate: e.end } : {}),
    eventAttendanceMode: mode,
    eventStatus: "https://schema.org/EventScheduled",
    image: abs(e.image),
    location:
      e.mode === "Virtual"
        ? { "@type": "VirtualLocation", url: abs(e.registerHref) }
        : { "@type": "Place", name: e.location, address: e.location },
    organizer: { "@id": `${siteUrl}/#organization` },
    ...(e.mode !== "Virtual" ? { locationNote: e.location } : {}),
    offers: {
      "@type": "Offer",
      url: abs(e.registerHref),
      availability: "https://schema.org/InStock",
      category: "Registration",
    },
  };
}

/** ItemList wrapper. */
export function itemListSchema(items: JsonLdValue[], opts: { url: string; name: string }): JsonLdValue {
  return withContext({
    "@type": "ItemList",
    url: abs(opts.url),
    name: opts.name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item,
    })),
  });
}

/** Article schema for news posts. */
export function articleSchema(p: {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  author: string;
}): JsonLdValue {
  const url = abs(`/news/${p.slug}`);
  return withContext({
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: p.title,
    description: p.excerpt,
    image: abs(p.image),
    datePublished: p.date,
    dateModified: p.date,
    author: { "@type": "Organization", name: p.author },
    publisher: {
      "@type": "Organization",
      name: site.legalName,
      logo: { "@type": "ImageObject", url: `${siteUrl}/images/brand/logo.png` },
    },
    isPartOf: { "@id": `${siteUrl}/#website` },
  });
}

/**
 * EducationalOccupationalProgram schema for flagship programmes — the
 * entity AI engines resolve when asked about the competition itself.
 */
export function programmeSchema(p: {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  ageRange: string;
  eligibility: string;
  image: string;
}): JsonLdValue {
  const url = abs(`/programmes/${p.slug}`);
  return {
    "@type": "EducationalOccupationalProgram",
    "@id": `${url}#program`,
    name: p.name,
    alternateName: p.subtitle,
    description: p.description,
    url,
    image: abs(p.image),
    provider: { "@id": `${siteUrl}/#organization` },
    areaServed: { "@type": "AdministrativeArea", name: "Africa" },
    educationalProgramType: "Competition and enrichment programme",
    audience: { "@type": "EducationalAudience", educationalRole: "student", suggestedMinAge: 6 },
    about: { "@type": "Thing", name: "STEM education" },
    inLanguage: "en",
    ...(p.ageRange ? { typicalAgeRange: p.ageRange } : {}),
    ...(p.eligibility ? { applicationContact: { "@type": "ContactPoint", url: abs("/register") } } : {}),
  };
}

/** Course schema for the Digital Science School tracks. */
export function courseSchema(c: {
  name: string;
  description: string;
  pagePath: string;
  audience?: string;
}): JsonLdValue {
  return {
    "@type": "Course",
    name: c.name,
    description: c.description,
    url: abs(c.pagePath),
    provider: { "@id": `${DIGITAL_SCHOOL_URL}/#organization` },
    inLanguage: "en",
    courseMode: "online",
    ...(c.audience ? { audience: { "@type": "EducationalAudience", educationalRole: c.audience } } : {}),
  };
}

/** Service schema for the services page. */
export function serviceSchema(s: { slug: string; title: string; description: string }): JsonLdValue {
  return {
    "@type": "Service",
    name: s.title,
    description: s.description,
    url: abs(`/services#${s.slug}`),
    provider: { "@id": `${siteUrl}/#organization` },
    areaServed: ["Nigeria", "Africa"],
    serviceType: s.title,
  };
}
