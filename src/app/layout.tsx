import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";
import { homeSeo } from "@/content/seo";
import { siteUrl, organizationSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [...homeSeo.keywords],
  authors: [{ name: site.legalName, url: siteUrl }],
  creator: site.legalName,
  publisher: site.legalName,
  applicationName: site.name,
  category: "Education",
  formatDetection: { telephone: false },
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    locale: site.locale,
    alternateLocale: [...site.alternateLocales],
    url: siteUrl,
    siteName: `${site.name} — ${site.tagline}`,
    title: `${site.legalName} — ${site.tagline}`,
    description: site.description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: site.tagline }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.legalName} — ${site.tagline}`,
    description: site.description,
    site: "@afristemglobal",
    creator: "@afristemglobal",
  },
  icons: {
    icon: [{ url: "/images/brand/favicon-32.png", sizes: "32x32", type: "image/png" }, { url: "/images/brand/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: "/images/brand/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  // Search-console ownership verification codes go here when available:
  // verification: { google: "…", other: { "msvalidate.01": "…" } },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#0b2a6f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans">
        {children}
        {/*
          Organisation entity graph: EducationalOrganization + NGO, WebSite
          and homepage nodes — parsed by search engines and AI answer engines
          to resolve the AFRISTEM brand, its founder, programmes and reach.
        */}
        <JsonLd data={organizationSchema()} />
      </body>
    </html>
  );
}
