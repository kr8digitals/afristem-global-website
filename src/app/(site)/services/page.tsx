import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero, CheckList, CTABand, SectionHeader } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { services } from "@/content/data";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Services", description: "STEM solutions for schools, organisations and communities: education & training, school STEM solutions, consultancy, teacher training, lab & equipment support, competitions & events." };

const process = [
  { t: "Discovery call", d: "We listen to your goals, context and constraints." },
  { t: "Tailored proposal", d: "A clear plan, timeline and budget designed for you." },
  { t: "Delivery", d: "Our team delivers with your staff, on-site or online." },
  { t: "Review & grow", d: "We measure impact together and plan the next step." },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="Services" title={<>STEM Solutions for Schools, Organisations <span className="text-gradient-sun">and Communities</span></>} description="AFRISTEM provides education and STEM-related services designed to help schools and organisations create stronger learning experiences." image="/images/photos/robotics.jpg">
        <Link href="/contact?subject=Service%20enquiry" className="btn-primary">Request a proposal <ArrowRight className="size-4" /></Link>
        <Link href="#services" className="btn-ghost-light">Browse services</Link>
      </PageHero>

      {/* quick nav */}
      <div className="sticky top-[72px] z-30 border-b border-navy-900/5 bg-white/85 backdrop-blur">
        <div className="container-x flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]">
          {services.map((s) => (
            <a key={s.slug} href={`#${s.slug}`} className="shrink-0 rounded-full border border-navy-900/10 px-4 py-2 text-xs font-bold text-navy-800 transition-colors hover:border-navy-800 hover:bg-navy-50">{s.title}</a>
          ))}
        </div>
      </div>

      <section id="services" className="py-20 sm:py-28">
        <div className="container-x space-y-24">
          {services.map((s, i) => (
            <div key={s.slug} id={s.slug} className="grid scroll-mt-40 items-center gap-12 lg:grid-cols-2">
              <Reveal x={i % 2 ? 30 : -30} y={0} className={cn(i % 2 && "lg:order-2")}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-card-lg">
                  <Image src={s.image} alt="" fill sizes="(min-width:1024px) 45vw, 90vw" className="object-cover" />
                  <span className="absolute left-5 top-5 inline-flex size-12 items-center justify-center rounded-2xl bg-sun-400 text-navy-950 shadow-card"><Icon name={s.icon} className="size-6" /></span>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <span className="eyebrow mb-4">Service {String(i + 1).padStart(2, "0")}</span>
                <h2 className="h2 text-navy-900">{s.title}</h2>
                <p className="lead mt-4">{s.longDescription}</p>
                <CheckList items={s.bullets} columns={2} className="mt-6" />
                <Link href={`/contact?subject=${encodeURIComponent(s.title)}`} className="btn-navy mt-8">Enquire about this service <ArrowRight className="size-4" /></Link>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy-900 py-24 text-white noise sm:py-32">
        <div className="container-x">
          <SectionHeader dark eyebrow="How we work" title="Simple, collaborative, measurable" />
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((p, i) => (
              <StaggerItem key={p.t}>
                <div className="relative h-full rounded-3xl border border-white/10 bg-white/5 p-7">
                  <span className="font-display text-4xl font-extrabold text-sun-400">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 font-display text-xl font-bold">{p.t}</h3>
                  <p className="mt-2 text-white/65">{p.d}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <CTABand title="Let's design something great for your learners" description="Tell us about your school or organisation and we'll come back with a tailored proposal." primary={{ label: "Request a Proposal", href: "/contact?subject=Service%20enquiry" }} secondary={{ label: "See Programmes", href: "/programmes" }} />
    </>
  );
}
