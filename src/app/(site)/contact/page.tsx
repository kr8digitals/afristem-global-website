export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { ArrowRight, Mail, MapPin, Phone, MessageCircle, Clock } from "lucide-react";
import { PageHero, SectionHeader } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { ContactForm } from "@/components/forms/contact-form";
import { FAQAccordion } from "@/components/sections/faq-accordion";
import { getContent, digits } from "@/lib/content";
import { FacebookIcon, InstagramIcon, LinkedinIcon, XIcon, YoutubeIcon, WhatsAppIcon } from "@/components/ui/brand-icons";

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

export const metadata: Metadata = { title: "Contact Us", description: "Let's connect. Whether you are a student, parent, school, educator, STEM professional, organisation or potential partner, we would love to hear from you." };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const { subject } = await searchParams;
  const { site, faqs } = await getContent();
  const socials = site.socials
    .filter((s) => s.href)
    .map((s) => ({ n: s.label, h: s.href, I: SOCIAL_ICONS[s.icon as keyof typeof SOCIAL_ICONS] ?? ArrowRight }));
  const whatsapp = digits(site.whatsapp);
  const offices = site.offices.filter((o) => o.city || o.address || o.name);
  const mapQuery = offices[0]?.mapQuery || offices[0]?.address || site.address;
  return (
    <>
      <PageHero eyebrow="Contact" title={<>Let&apos;s <span className="text-gradient-sun">Connect</span></>} description="Whether you are a student, parent, school, educator, STEM professional, organisation or potential partner, we would love to hear from you." compact />

      <section className="relative -mt-8 pb-20">
        <div className="container-x">
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "Call us", v: site.primaryPhone, h: `tel:${site.primaryPhone.replace(/[^\d+]/g, "")}`, I: Phone },
              { t: "WhatsApp", v: site.whatsapp, h: whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hello ${site.name}, I'd like to know more about your programmes.`)}` : undefined, I: MessageCircle, ext: true },
              { t: "Email", v: site.email, h: `mailto:${site.email}`, I: Mail },
              { t: "Office hours", v: "Mon – Fri, 9am – 5pm WAT", h: undefined, I: Clock },
            ].map(({ t, v, h, I, ext }) => (
              <StaggerItem key={t}>
                {h ? (
                  <a href={h} target={ext ? "_blank" : undefined} rel={ext ? "noopener noreferrer" : undefined} className="group card card-hover flex h-full items-center gap-4 p-5">
                    <span className="icon-badge"><I className="size-5" /></span>
                    <span><span className="block text-[11px] font-bold uppercase tracking-wider text-navy-800/50">{t}</span><span className="block font-bold text-navy-900">{v}</span></span>
                  </a>
                ) : (
                  <div className="card flex h-full items-center gap-4 p-5">
                    <span className="icon-badge"><I className="size-5" /></span>
                    <span><span className="block text-[11px] font-bold uppercase tracking-wider text-navy-800/50">{t}</span><span className="block font-bold text-navy-900">{v}</span></span>
                  </div>
                )}
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="card p-7 sm:p-10">
              <span className="eyebrow mb-4">Send us a message</span>
              <h2 className="h2 text-navy-900">We&apos;d love to hear from you</h2>
              <p className="mt-3 text-navy-800/70">Fill in the form and the right person on our team will get back to you.</p>
              <div className="mt-8"><ContactForm defaultSubject={subject ?? ""} /></div>
            </div>
          </Reveal>
          <div className="space-y-6 lg:col-span-5">
            <Reveal delay={0.1}>
              <div className="card p-7">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900"><MapPin className="size-5 text-sun-500" /> Our offices</h3>
                <ul className="mt-5 divide-y divide-navy-900/5">
                  {offices.map((o) => (
                    <li key={o.id} className="py-4 first:pt-0 last:pb-0">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-navy-600">{o.name || o.city}</p>
                      <p className="mt-1 text-sm text-navy-800/75">{o.address}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
                        {o.phone ? <a href={`tel:${o.phone.replace(/[^\d+]/g, "")}`} className="text-navy-800 hover:text-navy-600">{o.phone}</a> : null}
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.mapQuery || o.address || o.city)}`} target="_blank" rel="noopener noreferrer" className="link-underline">Get directions</a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="overflow-hidden rounded-3xl border border-navy-900/10 shadow-card">
                <iframe title={`${site.name} head office map`} src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`} className="h-64 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="card p-7">
                <h3 className="font-display text-lg font-bold text-navy-900">Follow us</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {socials.map(({ n, h, I }) => (
                    <a key={n} href={h} target="_blank" rel="noopener noreferrer" aria-label={n} className="inline-flex size-11 items-center justify-center rounded-full bg-navy-50 text-navy-800 transition-all hover:-translate-y-0.5 hover:bg-sun-400"><I className="size-5" /></a>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-navy-50/60 py-20 sm:py-28">
        <div className="container-x">
          <SectionHeader eyebrow="Before you write" title="Quick answers" />
          <div className="mx-auto max-w-3xl"><FAQAccordion items={faqs.slice(0, 5).map((f) => ({ q: f.question, a: f.answer }))} /></div>
        </div>
      </section>
    </>
  );
}
