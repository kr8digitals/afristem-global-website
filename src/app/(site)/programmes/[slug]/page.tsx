export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Users } from "lucide-react";
import { mergeProgrammes } from "@/lib/content";
import { content } from "@/lib/content";
import { events, faqs } from "@/content/data";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { CheckList, CTABand, Pill, SectionHeader } from "@/components/ui/primitives";
import { ProgrammeCard } from "@/components/sections/programme-card";
import { FAQAccordion } from "@/components/sections/faq-accordion";
import { cn, isUpcoming } from "@/lib/utils";

export function generateStaticParams() {
  return content().programmes.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const all = mergeProgrammes(content().programmes);
  const p = all.find((x) => x.slug === slug);
  if (!p) return {};
  return { title: `${p.name} — ${p.subtitle}`, description: p.description[0], openGraph: { images: [p.image] } };
}

const accentBg = { sun: "from-sun-400/30", sky: "from-sky-400/30", mint: "from-teal-400/30", violet: "from-violet-400/30", coral: "from-rose-400/30" };

export default async function ProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const all = mergeProgrammes(content().programmes);
  const p = all.find((x) => x.slug === slug);
  if (!p) notFound();
  const others = all.filter((x) => x.slug !== p.slug);
  const related = events.filter((e) => isUpcoming(e.end ?? e.start) && (e.registerHref.includes(p.slug) || e.title.toLowerCase().includes(p.name.toLowerCase().split(" ")[0]))).slice(0, 2);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 pt-32 text-white noise sm:pt-40">
        <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
        <div className={cn("pointer-events-none absolute -right-40 -top-40 size-[36rem] rounded-full bg-gradient-to-br to-transparent blur-[100px]", accentBg[p.accent])} aria-hidden />
        <div className="container-x relative grid items-end gap-12 pb-0 lg:grid-cols-12">
          <div className="pb-16 lg:col-span-7 lg:pb-24">
            <Reveal>
              <Link href="/programmes" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white"><ArrowLeft className="size-4" /> All programmes</Link>
            </Reveal>
            <Reveal delay={0.05}>
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="sun">{p.pillar}</Pill>
                <Pill tone="white">{p.ageRange}</Pill>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="h1 mt-5 text-balance">{p.name}</h1>
              <p className="mt-3 font-display text-xl font-semibold text-white/80 sm:text-2xl">{p.subtitle}</p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 font-display text-lg italic text-sun-300">&ldquo;{p.tagline}&rdquo;</p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link href={`/register?programme=${p.slug}`} className="btn-primary btn-lg">Register Your School <ArrowRight className="size-4" /></Link>
                <Link href="/contact?subject=Programme%20enquiry" className="btn-ghost-light btn-lg">Ask a question</Link>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.2} className="relative lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-t-[2rem] shadow-card-lg lg:aspect-[4/4.2]">
              <Image src={p.image} alt={p.imageAlt} fill priority sizes="(min-width:1024px) 40vw, 90vw" className="object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Highlights bar */}
      <section className="relative border-b border-navy-900/5 bg-white">
        <div className="container-x">
          <Stagger className="grid divide-y divide-navy-900/5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {p.highlights.map((h) => (
              <StaggerItem key={h.label} className="px-2 py-6 sm:px-8">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-sun-600">{h.label}</p>
                <p className="mt-1 font-display text-lg font-bold text-navy-900">{h.value}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Body */}
      <section className="py-20 sm:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <span className="eyebrow mb-5">About the programme</span>
              <h2 className="h2 text-navy-900">What is {p.name}?</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-6 space-y-5 text-lg leading-relaxed text-navy-800/75">
                {p.description.map((d) => <p key={d}>{d}</p>)}
              </div>
            </Reveal>

            <Reveal className="mt-14">
              <h3 className="h3 text-navy-900">Key objectives</h3>
              <CheckList items={p.objectives} columns={2} className="mt-6" />
            </Reveal>

            <Reveal className="mt-14">
              <h3 className="h3 text-navy-900">How it works</h3>
              <ol className="mt-6 grid gap-3 sm:grid-cols-3">
                {p.format.split("→").map((step, i) => (
                  <li key={step} className="relative rounded-2xl border border-navy-900/10 bg-navy-50/60 p-5">
                    <span className="font-display text-3xl font-extrabold text-sun-500">{String(i + 1).padStart(2, "0")}</span>
                    <p className="mt-2 font-bold text-navy-900">{step.trim()}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>

          <aside className="space-y-6 lg:col-span-5">
            <Reveal delay={0.1}>
              <div className="card p-7">
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-sun-400 text-navy-950"><Users className="size-6" /></span>
                <h3 className="mt-5 font-display text-xl font-bold text-navy-900">Who can participate?</h3>
                <p className="mt-2 text-navy-800/70">{p.eligibility}</p>
                <div className="mt-6 flex flex-col gap-3">
                  <Link href={`/register?programme=${p.slug}`} className="btn-navy w-full">Register Your School <ArrowRight className="size-4" /></Link>
                  <Link href={`/register?programme=${p.slug}&type=student`} className="btn-outline w-full">Register as a Student</Link>
                </div>
              </div>
            </Reveal>

            {related.length > 0 && (
              <Reveal delay={0.15}>
                <div className="card p-7">
                  <h3 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900"><CalendarDays className="size-5 text-sun-500" /> Related events</h3>
                  <ul className="mt-4 space-y-4">
                    {related.map((e) => (
                      <li key={e.slug} className="border-l-2 border-sun-400 pl-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-navy-800/50">{e.displayDate}</p>
                        <Link href="/events" className="mt-1 block font-semibold text-navy-900 hover:text-navy-600">{e.title}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}

            <Reveal delay={0.2}>
              <div className="relative overflow-hidden rounded-3xl bg-navy-900 p-7 text-white noise">
                <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
                <h3 className="relative font-display text-lg font-bold">What participants gain</h3>
                <ul className="relative mt-4 space-y-3 text-sm text-white/75">
                  {["Certificates of participation & achievement", "Recognition for outstanding performance", "A network of peers across Africa", "Confidence, skills and a love for STEM"].map((g) => (
                    <li key={g} className="flex items-start gap-2.5"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sun-400" /> {g}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-navy-50/60 py-20 sm:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <span className="eyebrow mb-5">Questions</span>
            <h2 className="h2 text-navy-900">Good to know</h2>
            <p className="lead mt-4">Can&apos;t find what you need? <Link href="/contact" className="link-underline">Contact us</Link>.</p>
          </Reveal>
          <div className="lg:col-span-8"><FAQAccordion items={[faqs[0], faqs[2], faqs[3], faqs[8]]} /></div>
        </div>
      </section>

      {/* Other programmes */}
      <section className="py-20 sm:py-28">
        <div className="container-x">
          <SectionHeader align="left" eyebrow="More programmes" title="Explore other AFRISTEM programmes" />
          <Stagger className="grid gap-6 md:grid-cols-3">
            {others.map((o) => (
              <StaggerItem key={o.slug}><ProgrammeCard programme={o} /></StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <CTABand title={`Ready to join ${p.name}?`} description={p.pillarBlurb} primary={{ label: "Register Now", href: `/register?programme=${p.slug}` }} secondary={{ label: "Talk to us", href: "/contact" }} />
    </>
  );
}
