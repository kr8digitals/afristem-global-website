export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { ContentImage as Image } from "@/components/ui/content-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Trophy, Users } from "lucide-react";
import { STATUS_LABEL, getContent, imageOr, programmesFrom, registrationOpen, relatedEvents } from "@/lib/content";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { CheckList, CTABand, Pill, SectionHeader } from "@/components/ui/primitives";
import { ProgrammeCard } from "@/components/sections/programme-card";
import { FAQAccordion } from "@/components/sections/faq-accordion";
import { cn } from "@/lib/utils";

/** The African Organic Chemistry Tournament publishes its awards, fees and payment details. */
const AOCT_SLUG = "african-organic-chemistry-tournament";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = programmesFrom((await getContent()).programmes).find((x) => x.slug === slug);
  if (!p) return {};
  return { title: p.subtitle ? `${p.name} — ${p.subtitle}` : p.name, description: p.description[0] || p.shortDescription, openGraph: { images: [imageOr(p.image)] } };
}

const accentBg = { sun: "from-sun-400/30", sky: "from-sky-400/30", mint: "from-teal-400/30", violet: "from-violet-400/30", coral: "from-rose-400/30" };

export default async function ProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { programmes, events, faqs, site } = await getContent();
  const all = programmesFrom(programmes);
  const p = all.find((x) => x.slug === slug);
  if (!p) notFound();
  const others = all.filter((x) => x.slug !== p.slug);
  const related = relatedEvents(events, p).slice(0, 2);
  const open = registrationOpen(p);
  const studentHref = p.registerHref.startsWith("/register")
    ? `${p.registerHref}${p.registerHref.includes("?") ? "&" : "?"}type=student`
    : p.registerHref;
  const askHref = `/contact?subject=${encodeURIComponent(`${p.name} enquiry`)}`;
  const external = /^https?:\/\//.test(p.registerHref);
  const faqItems = [faqs[0], faqs[2], faqs[3], faqs[8]].filter(Boolean).map((f) => ({ q: f.question, a: f.answer }));
  const steps = p.format.split(/→|->/).map((x) => x.trim()).filter(Boolean);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 pt-[calc(var(--header-h,13rem)+2rem)] text-white noise">
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
                {p.ageRange ? <Pill tone="white">{p.ageRange}</Pill> : null}
                {p.status !== "open" ? <Pill tone={p.status === "closed" ? "white" : "coral"}>{STATUS_LABEL[p.status]}</Pill> : null}
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
                {open ? (
                  <Link href={p.registerHref} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="btn-primary btn-lg">
                    {p.status === "coming-soon" ? "Register Interest" : "Register Your School"} <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <Link href={askHref} className="btn-primary btn-lg">Registration closed — ask about the next edition <ArrowRight className="size-4" /></Link>
                )}
                <Link href={askHref} className="btn-ghost-light btn-lg">Ask a question</Link>
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
      {p.highlights.length > 0 && (
      <section className="relative border-b border-navy-900/5 bg-white">
        <div className="container-x">
          <Stagger className="grid gap-x-6 gap-y-1 py-2 sm:grid-cols-2 lg:grid-cols-3">
            {p.highlights.map((h) => (
              <StaggerItem key={h.label} className="border-b border-navy-900/5 py-5 sm:border-0">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-sun-600">{h.label}</p>
                <p className="mt-1 font-display text-lg font-bold text-navy-900">{h.value}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
      )}

      {/* Prize & poster band — programmes that publish artwork and prizes */}
      {(p.prizeNote || p.poster) && (
        <section className="bg-navy-50/60 py-16 sm:py-20">
          <div className="container-x grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <Reveal className="lg:col-span-5">
              {p.prizeNote && (
                <>
                  <Pill tone="sun">Prizes &amp; awards</Pill>
                  <h2 className="h2 mt-5 text-navy-900">
                    <span className="text-gradient-sun">{p.prizeNote}</span>
                  </h2>
                </>
              )}
              {p.slug === AOCT_SLUG && (
              <>
              <ul className="mt-7 space-y-3.5">
                {[
                  "Overall best school — chemistry laboratory set",
                  "Overall best teacher — laptop and plaque",
                  "Top 50 overall best candidates — medal, certificate of excellence and CHEM-50 Hall of Fame membership",
                ].map((award) => (
                  <li key={award} className="flex items-start gap-3 text-[15.5px] leading-relaxed text-navy-800/80">
                    <Trophy className="mt-0.5 size-4 shrink-0 text-sun-500" />
                    {award}
                  </li>
                ))}
              </ul>
              {p.requiresPayment && p.fee ? (
                <p className="mt-8 text-sm font-semibold text-navy-800/70">Entry fee: {p.fee}</p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3">
                {open && (
                  <Link href={p.registerHref} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="btn-navy">
                    Register your school <ArrowRight className="size-4" />
                  </Link>
                )}
                <a href="https://selar.com/855695835a" target="_blank" rel="noopener noreferrer" className="btn-outline">
                  Preparatory handbook
                </a>
              </div>
              {p.requiresPayment ? (
                <p className="mt-5 text-sm leading-relaxed text-navy-800/60">
                  Registration: pay to <strong className="font-semibold">{p.paymentInstructions || "the account shown on your confirmation screen"}</strong>,
                  then upload your receipt after registering{(site.whatsapp || site.primaryPhone) ? <> — or send it on WhatsApp to <strong className="font-semibold">{site.whatsapp || site.primaryPhone}</strong></> : null}.
                </p>
              ) : null}
              </>
              )}
              {p.slug !== AOCT_SLUG && open && (
                <div className="mt-8">
                  <Link href={p.registerHref} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="btn-navy">
                    Register <ArrowRight className="size-4" />
                  </Link>
                </div>
              )}
            </Reveal>
            {p.poster && (
              <Reveal delay={0.1} className="lg:col-span-7">
                <figure className="overflow-hidden rounded-[2rem] border border-navy-900/10 bg-white shadow-card-lg">
                  <Image
                    src={p.poster}
                    alt={`${p.name} poster`}
                    width={900}
                    height={1125}
                    sizes="(min-width:1024px) 55vw, 92vw"
                    className="h-auto w-full"
                  />
                </figure>
              </Reveal>
            )}
          </div>
        </section>
      )}

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

            {p.objectives.length > 0 && (
            <Reveal className="mt-14">
              <h3 className="h3 text-navy-900">Key objectives</h3>
              <CheckList items={p.objectives} columns={2} className="mt-6" />
            </Reveal>
            )}

            {steps.length > 0 && (
            <Reveal className="mt-14">
              <h3 className="h3 text-navy-900">How it works</h3>
              <ol className="mt-6 grid gap-3 sm:grid-cols-3">
                {steps.map((step, i) => (
                  <li key={step} className="relative rounded-2xl border border-navy-900/10 bg-navy-50/60 p-5">
                    <span className="font-display text-3xl font-extrabold text-sun-500">{String(i + 1).padStart(2, "0")}</span>
                    <p className="mt-2 font-bold text-navy-900">{step}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
            )}
          </div>

          <aside className="space-y-6 lg:col-span-5">
            <Reveal delay={0.1}>
              <div className="card p-7">
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-sun-400 text-navy-950"><Users className="size-6" /></span>
                <h3 className="mt-5 font-display text-xl font-bold text-navy-900">Who can participate?</h3>
                <p className="mt-2 text-navy-800/70">{p.eligibility || "Contact us to find out whether this programme is right for you."}</p>
                <div className="mt-6 flex flex-col gap-3">
                  {open ? (
                    <>
                      <Link href={p.registerHref} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="btn-navy w-full">Register Your School <ArrowRight className="size-4" /></Link>
                      <Link href={studentHref} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="btn-outline w-full">Register as a Student</Link>
                    </>
                  ) : (
                    <>
                      <p className="rounded-2xl bg-navy-50 px-4 py-3 text-sm font-semibold text-navy-800">{STATUS_LABEL[p.status]}. Ask us about the next edition.</p>
                      <Link href={askHref} className="btn-navy w-full">Contact us <ArrowRight className="size-4" /></Link>
                    </>
                  )}
                </div>
              </div>
            </Reveal>

            {p.requiresPayment ? (
              <Reveal delay={0.12}>
                <div className="card border-sun-300 p-7">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-sun-400 text-navy-950"><Trophy className="size-6" /></span>
                  <h3 className="mt-5 font-display text-xl font-bold text-navy-900">Fees &amp; payment</h3>
                  {p.fee ? <p className="mt-2 font-display text-lg font-bold text-navy-900">{p.fee}</p> : null}
                  {p.paymentInstructions ? <p className="mt-2 text-sm leading-relaxed text-navy-800/75">{p.paymentInstructions}</p> : null}
                  <p className="mt-3 text-xs leading-relaxed text-navy-800/60">
                    Pay, then upload a photo or PDF of your receipt after registering. Your place is confirmed once our team
                    has checked it — you will get a registration number to bring on the day.
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <Link href="/register/status" className="btn-outline w-full">Check my registration</Link>
                    {(site.whatsapp || site.primaryPhone) ? (
                      <a
                        href={`https://wa.me/${(site.whatsapp || site.primaryPhone).replace(/\D/g, "").replace(/^0+/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center text-xs font-bold text-navy-700 underline underline-offset-4 hover:text-navy-900"
                      >
                        Questions about payment? WhatsApp {site.whatsapp || site.primaryPhone}
                      </a>
                    ) : null}
                  </div>
                </div>
              </Reveal>
            ) : null}

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
      {faqItems.length > 0 && (
      <section className="bg-navy-50/60 py-20 sm:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <span className="eyebrow mb-5">Questions</span>
            <h2 className="h2 text-navy-900">Good to know</h2>
            <p className="lead mt-4">Can&apos;t find what you need? <Link href="/contact" className="link-underline">Contact us</Link>.</p>
          </Reveal>
          <div className="lg:col-span-8"><FAQAccordion items={faqItems} /></div>
        </div>
      </section>
      )}

      {/* Other programmes */}
      {others.length > 0 && (
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
      )}

      <CTABand
        title={`Ready to join ${p.name}?`}
        description={p.pillarBlurb}
        primary={open ? { label: p.status === "coming-soon" ? "Register Interest" : "Register Now", href: p.registerHref } : { label: "Ask about the next edition", href: askHref }}
        secondary={{ label: "Talk to us", href: "/contact" }}
      />
    </>
  );
}
