import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";
import { safeJsonLd } from "@/lib/utils";
import { getContent } from "@/lib/store";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["400", "600", "700", "800"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || site.url;

/** Brand details come from the database, so every page is rendered on request. */
export const dynamic = "force-dynamic";

/** Name, tagline and description come from Admin → Brand & contact. */
export async function generateMetadata(): Promise<Metadata> {
  const { site: settings } = await getContent();
  const name = settings.name || site.name;
  const tagline = settings.tagline || site.tagline;
  const description = settings.description || site.description;
  return {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${name} — ${tagline}`,
    template: `%s | ${name}`,
  },
  description,
  keywords: ["STEM education Africa", "STEM competitions Nigeria", "SciSPELL", "Code Africa", "STEM Kids Championship", "African Organic Chemistry Tournament", "Prime STEM Nigeria", "EdTech Nigeria", "science competition", "coding competition schools"],
  authors: [{ name: site.legalName }],
  creator: site.legalName,
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    siteName: name,
    title: `${name} — ${tagline}`,
    description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: tagline }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${name} — ${tagline}`,
    description,
    creator: "@afristemglobal",
  },
  icons: {
    icon: [{ url: "/images/brand/favicon-32.png", sizes: "32x32", type: "image/png" }, { url: "/images/brand/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: "/images/brand/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b2a6f",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { site: settings } = await getContent();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: site.legalName,
    alternateName: "AFRISTEM",
    url: siteUrl,
    logo: `${siteUrl}/images/brand/logo.png`,
    description: settings.description || site.description,
    email: settings.email || site.email,
    telephone: settings.primaryPhone || site.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "PCN Plaza, Opposite Abakaliki Township Stadium, Kpirikpiri",
      addressLocality: "Abakaliki",
      addressRegion: "Ebonyi State",
      addressCountry: "NG",
    },
    sameAs: settings.socials.length ? settings.socials.map((s) => s.href).filter(Boolean) : Object.values(site.social),
  };

  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans">
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      </body>
    </html>
  );
}
