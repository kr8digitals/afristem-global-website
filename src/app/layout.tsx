import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/content/site";
import { safeJsonLd } from "@/lib/utils";

const sans = localFont({ src: "./fonts/plus-jakarta-sans.woff2", variable: "--font-sans", display: "swap", weight: "200 800" });
const display = localFont({ src: "./fonts/sora.woff2", variable: "--font-display", display: "swap", weight: "100 800" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || site.url;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: ["STEM education Africa", "STEM competitions Nigeria", "SciSPELL", "Code Africa", "STEM Kids Championship", "African Organic Chemistry Tournament", "Prime STEM Nigeria", "EdTech Nigeria", "science competition", "coding competition schools"],
  authors: [{ name: site.legalName }],
  creator: site.legalName,
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: site.tagline }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    creator: "@afristemglobal",
  },
  icons: {
    icon: [{ url: "/images/brand/favicon-32.png", sizes: "32x32", type: "image/png" }, { url: "/images/brand/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: "/images/brand/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b2a6f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: site.legalName,
    alternateName: "AFRISTEM",
    url: siteUrl,
    logo: `${siteUrl}/images/brand/logo.png`,
    description: site.description,
    email: site.email,
    telephone: site.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "PCN Plaza, Opposite Abakaliki Township Stadium, Kpirikpiri",
      addressLocality: "Abakaliki",
      addressRegion: "Ebonyi State",
      addressCountry: "NG",
    },
    sameAs: Object.values(site.social),
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
