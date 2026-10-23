import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon, LinkedinIcon, XIcon, YoutubeIcon, WhatsAppIcon } from "@/components/ui/brand-icons";
import { footerLinks, site, DIGITAL_SCHOOL_URL, PRIME_STEM_URL } from "@/content/site";
import { NewsletterForm } from "@/components/forms/newsletter-form";

const SOCIAL_ICONS = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  x: XIcon,
  youtube: YoutubeIcon,
  tiktok: XIcon,
  whatsapp: WhatsAppIcon,
  link: ArrowRight,
} as const;

export type FooterSettings = {
  email: string;
  phone: string;
  whatsapp?: string;
  /** head office address (Admin → Brand & contact) */
  address?: string;
  /** programme links (Admin → Programmes) */
  programmes?: { name: string; slug: string }[];
  footerNote: string;
  socials: { id: string; label: string; href: string; icon: string }[];
  offices: { id: string; city: string; address: string; phone: string }[];
  externalLinks: { id: string; label: string; href: string }[];
};

export const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  email: site.email,
  phone: site.phone,
  footerNote: "AFRISTEM Global — advancing STEM education across Africa.",
  socials: [
    { id: "facebook", label: "Facebook", href: site.social.facebook, icon: "facebook" },
    { id: "instagram", label: "Instagram", href: site.social.instagram, icon: "instagram" },
    { id: "linkedin", label: "LinkedIn", href: site.social.linkedin, icon: "linkedin" },
    { id: "x", label: "X (Twitter)", href: site.social.twitter, icon: "x" },
    { id: "youtube", label: "YouTube", href: site.social.youtube, icon: "youtube" },
  ],
  offices: [{ id: "hq", city: "Abakaliki", address: site.offices[0].address.join(" "), phone: site.phone }],
  externalLinks: [
    { id: "prime-stem", label: "Prime STEM Nigeria", href: PRIME_STEM_URL },
    { id: "digital-school", label: "Digital Science School", href: DIGITAL_SCHOOL_URL },
  ],
};

export function Footer({ settings = DEFAULT_FOOTER_SETTINGS }: { settings?: FooterSettings }) {
  return (
    <footer className="relative mt-10 overflow-hidden bg-navy-950 text-white noise">
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
      <div className="pointer-events-none absolute -left-32 top-0 size-96 rounded-full bg-navy-500/30 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute -right-32 bottom-0 size-96 rounded-full bg-sun-400/15 blur-[120px]" aria-hidden />

      {/* Newsletter band */}
      <div className="container-x relative">
        <div className="-mt-0 grid gap-8 border-b border-white/10 py-14 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="eyebrow-dark mb-4">Stay in the loop</span>
            <h3 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Get STEM opportunities in your inbox.</h3>
            <p className="mt-3 max-w-lg text-white/65">Competitions, boot camps, teacher hangouts and scholarships — once or twice a month, never spam.</p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      <div className="container-x relative grid gap-12 py-16 lg:grid-cols-12">
        {/* Brand */}
        <div className="lg:col-span-4">
          <div className="inline-block rounded-2xl bg-white p-3">
            <Image src="/images/brand/logo.png" alt="AFRISTEM" width={170} height={104} className="h-auto w-[150px]" />
          </div>
          <p className="mt-6 font-display text-lg font-bold text-sun-300">Inspiring the Next Generation of African Innovators.</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/65">Making STEM education attractive, practical, exciting and accessible for children, teenagers, schools, educators and STEM professionals.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {settings.socials.map((s2) => {
              const Icon = SOCIAL_ICONS[(s2.icon as keyof typeof SOCIAL_ICONS) ?? "link"] ?? ArrowRight;
              return (
                <a key={s2.id} href={s2.href} target="_blank" rel="noopener noreferrer" aria-label={s2.label} className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-all hover:-translate-y-0.5 hover:border-sun-400 hover:bg-sun-400 hover:text-navy-950">
                  <Icon className="size-4" />
                </a>
              );
            })}
            <a href={`https://wa.me/${(settings.whatsapp || settings.phone).replace(/[^\d]/g, "")}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-all hover:-translate-y-0.5 hover:border-sun-400 hover:bg-sun-400 hover:text-navy-950">
              <WhatsAppIcon className="size-4" />
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="grid gap-10 sm:grid-cols-3 lg:col-span-5">
          <FooterCol title="Quick Links" links={footerLinks.quick} />
          <FooterCol title="For You" links={footerLinks.users} />
          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-sun-300">Programmes</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ...(settings.programmes?.length
                  ? settings.programmes.map((p) => [p.name, `/programmes/${p.slug}`])
                  : [
                      ["SciSPELL", "/programmes/scispell"],
                      ["Code Africa", "/programmes/code-africa"],
                      ["STEM Kids Championship", "/programmes/stem-kids-championship"],
                      ["Organic Chemistry Tournament", "/programmes/african-organic-chemistry-tournament"],
                    ]),
                ["ANSC (Prime STEM)", "/prime-stem-nigeria#ansc"],
                ["Laptop for Schools", "/prime-stem-nigeria#laptop-for-schools"],
              ].map(([l, h]) => (
                <li key={h}>
                  <Link href={h} className="group inline-flex items-center gap-1.5 text-white/70 transition-colors hover:text-white">
                    <span className="h-px w-0 bg-sun-400 transition-all duration-300 group-hover:w-3" />
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2.5 border-t border-white/10 pt-5">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-sun-300">Elsewhere</h4>
              {settings.externalLinks.map((l) => (
                <a key={l.id} href={l.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white">
                  {l.label}
                  <ExternalLink className="size-3.5 text-sun-400" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="lg:col-span-3">
          <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-sun-300">Contact</h4>
          <ul className="space-y-4 text-sm text-white/75">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-sun-400" />
              <span>{settings.address || settings.offices[0]?.address || site.offices[0].address.join(" ")}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-sun-400" />
              <span className="flex flex-col">
                <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="hover:text-white">{settings.phone}</a>
                {settings.offices.slice(1).map((o) => (
                  <a key={o.id} href={`tel:${o.phone.replace(/[^\d+]/g, "")}`} className="hover:text-white">
                    {o.phone} <span className="text-white/40">({o.city})</span>
                  </a>
                ))}
              </span>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-sun-400" />
              <a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a>
            </li>
          </ul>
          <Link href="/contact" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-sun-300 hover:text-sun-200">
            All offices & map <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="container-x relative flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-xs text-white/50 sm:flex-row">
        <p>
          © {new Date().getFullYear()} {site.legalName} ({site.rcNumber}). All rights reserved.
          <span className="mt-1 block text-white/40">{settings.footerNote}</span>
        </p>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {footerLinks.legal.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:text-white">{l.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-sun-300">{title}</h4>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="group inline-flex items-center gap-1.5 text-white/70 transition-colors hover:text-white">
              <span className="h-px w-0 bg-sun-400 transition-all duration-300 group-hover:w-3" />
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
