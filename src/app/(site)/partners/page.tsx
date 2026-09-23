export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageHero, CTABand, SectionHeader, Pill } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { partners } from "@/content/data";
import { Icon } from "@/lib/icons";

export const metadata: Metadata = { title: "Our Partners", description: "AFRISTEM believes meaningful STEM development requires collaboration. Meet our partners: Prime STEM Nigeria, NJFP, Linguafront and SYLCOUTECH." };

const ways = [
  { t: "Programme sponsorship", d: "Sponsor a competition, boot camp or award tour and reach thousands of students and schools.", icon: "trophy" as const },
  { t: "Technology & equipment", d: "Provide devices, kits or platforms that power practical STEM learning.", icon: "laptop" as const },
  { t: "Expertise & mentoring", d: "Contribute your people's time as mentors, judges, trainers and speakers.", icon: "users" as const },
  { t: "Cross-border collaboration", d: "Co-deliver programmes across African countries with local partners.", icon: "globe" as const },
];

export default function PartnersPage() {
  return (
    <>
      <PageHero eyebrow="Partners" title={<>Together, We Can <span className="text-gradient-sun">Do More</span></>} description="AFRISTEM believes that meaningful STEM development requires collaboration. We welcome partnerships with organisations that share our commitment to education, innovation, technology and youth development." image="/images/photos/awards-ceremony-2025.jpg">
        <Link href="/contact?subject=Partnership%20enquiry" className="btn-primary">Partner With AFRISTEM <ArrowRight className="size-4" /></Link>
      </PageHero>

      <section className="py-24 sm:py-32">
        <div className="container-x">
          <SectionHeader eyebrow="Our partners" title={<>A growing <span className="text-gradient-navy">ecosystem</span></>} description="Our partners contribute to a growing ecosystem that creates opportunities for learners, schools, educators and STEM professionals." />
          <Stagger className="grid gap-6 md:grid-cols-2">
            {partners.map((p) => (
              <StaggerItem key={p.slug}>
                <article className="group card card-hover flex h-full flex-col p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-20 items-center rounded-2xl bg-navy-50/70 px-5">
                      <Image src={p.logo} alt={p.name} width={180} height={90} className="max-h-12 w-auto object-contain" />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Pill tone="sun">{p.type}</Pill>
                      {p.country && <span className="text-xs font-semibold text-navy-800/50">{p.country}</span>}
                    </div>
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-bold text-navy-900">{p.name}</h3>
                  <div className="mt-3 flex-1 space-y-3 text-navy-800/70 leading-relaxed">
                    {p.description.map((d) => <p key={d}>{d}</p>)}
                  </div>
                  <Link href={p.href} target={p.external ? "_blank" : undefined} rel={p.external ? "noopener noreferrer" : undefined} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-navy-800">
                    {p.ctaLabel} <span className="inline-flex size-8 items-center justify-center rounded-full bg-navy-50 transition-all group-hover:bg-sun-400">{p.external ? <ArrowUpRight className="size-4" /> : <ArrowRight className="size-4" />}</span>
                  </Link>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-navy-50/60 py-24 sm:py-32">
        <div className="container-x">
          <SectionHeader eyebrow="Ways to partner" title={<>How organisations <span className="text-gradient-navy">work with us</span></>} />
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ways.map((w) => (
              <StaggerItem key={w.t}>
                <div className="group card card-hover h-full p-7">
                  <span className="icon-badge"><Icon name={w.icon} className="size-6" /></span>
                  <h3 className="h3 mt-5 text-navy-900">{w.t}</h3>
                  <p className="mt-2 text-navy-800/70">{w.d}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-10 text-center">
            <Link href="/contact?subject=Partnership%20enquiry" className="btn-navy btn-lg">Start a conversation <ArrowRight className="size-4" /></Link>
          </Reveal>
        </div>
      </section>

      <CTABand title="Let's build Africa's STEM future together" description="We'd love to hear how your organisation can collaborate with AFRISTEM." primary={{ label: "Partner With Us", href: "/contact?subject=Partnership%20enquiry" }} secondary={{ label: "Explore Programmes", href: "/programmes" }} />
    </>
  );
}
