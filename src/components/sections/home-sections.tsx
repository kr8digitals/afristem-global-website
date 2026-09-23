import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, CalendarDays, Clock, MapPin, Quote } from "lucide-react";
import { Counter, Reveal, Stagger, StaggerItem, Tilt } from "@/components/ui/motion";
import { ArrowLink, Pill, SectionHeader } from "@/components/ui/primitives";
import { Icon } from "@/lib/icons";
import { services, whyAfristem } from "@/content/data";
import { content, mergeProgrammes } from "@/lib/content";
import { parseStat } from "@/lib/utils";
import { primeStemProgrammes } from "@/content/programmes";
import { ProgrammeCard } from "@/components/sections/programme-card";
import { cn, isUpcoming } from "@/lib/utils";
import { FAQAccordion } from "@/components/sections/faq-accordion";
import { Testimonials } from "@/components/sections/testimonials";

/** Renders an editable statistic: animates when it starts with a number, otherwise prints as-is. */
function StatValue({ value }: { value: string }) {
  const { count, suffix } = parseStat(value);
  return count === null ? <>{value}</> : <Counter value={count} suffix={suffix} />;
}

/* ============ MARQUEE STRIP ============ */
export function MarqueeStrip() {
  const items = ["Science", "Technology", "Engineering", "Mathematics", "SciSPELL", "Code Africa", "STEM Kids Championship", "Organic Chemistry Tournament", "Pan-African", "Practical Learning"];
  return (
    <div className="relative -mt-px overflow-hidden border-y border-navy-900/5 bg-white py-5 mask-fade-x" aria-hidden>
      <div className="marquee">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap font-display text-sm font-bold uppercase tracking-[0.25em] text-navy-800/50">
            {t}
            <span className="size-2 rounded-full bg-sun-400" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============ WHO WE ARE + STATS ============ */
export function WhoWeAre() {
  const { stats } = content();
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 bg-dots opacity-60 [mask-image:radial-gradient(ellipse_at_left,black,transparent_70%)]" aria-hidden />
      <div className="container-x relative grid items-center gap-16 lg:grid-cols-2">
        <Reveal x={-30} y={0} className="relative">
          <div className="relative">
            <div className="relative aspect-[4/5] max-w-md overflow-hidden rounded-[2.5rem] shadow-card-lg sm:aspect-[5/6]">
              <Image src="/images/photos/bootcamp-team.jpg" alt="Students at the International STEM Boot Camp" fill sizes="(min-width:1024px) 45vw, 90vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-8 -right-4 w-[55%] overflow-hidden rounded-3xl border-8 border-white shadow-card-lg sm:-right-10">
              <div className="relative aspect-[4/3]">
                <Image src="/images/photos/robotics.jpg" alt="Robotics session" fill sizes="30vw" className="object-cover" />
              </div>
            </div>
            <div className="absolute -left-4 top-8 rounded-2xl bg-sun-400 px-5 py-4 text-navy-950 shadow-card-lg sm:-left-8 animate-float">
              <p className="font-display text-3xl font-extrabold leading-none">10+</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider">Years of impact</p>
            </div>
            <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-navy-100 blur-2xl" aria-hidden />
          </div>
        </Reveal>

        <div>
          <Reveal>
            <span className="eyebrow mb-5">Who we are</span>
            <h2 className="h2 text-balance text-navy-900">
              Building Africa&apos;s Future <span className="text-gradient-navy">Through STEM</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-6 space-y-4 text-navy-800/75 leading-relaxed">
              <p className="text-lg">AFRISTEM is committed to transforming the way young people learn and experience Science, Technology, Engineering and Mathematics.</p>
              <p>We believe STEM should be more than classroom theory. It should inspire curiosity, creativity, innovation and problem-solving.</p>
              <p>Through practical learning experiences, competitions, training programmes, educational technology, STEM equipment, consultancy and partnerships, AFRISTEM connects young people with the knowledge and opportunities they need to become tomorrow&apos;s scientists, engineers, technologists, innovators and entrepreneurs.</p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/about" className="btn-navy">
                Learn More About AFRISTEM <ArrowRight className="size-4" />
              </Link>
              <Link href="/gallery" className="btn-outline">See STEM in Action</Link>
            </div>
          </Reveal>

          <Stagger className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-navy-900/10 pt-10 sm:grid-cols-4">
            {stats.map((s) => (
              <StaggerItem key={s.label}>
                <p className="font-display text-3xl font-extrabold text-navy-900 sm:text-4xl">
                  <StatValue value={s.value} />
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-navy-800/55">{s.label}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

/* ============ WHAT WE DO ============ */
export function WhatWeDo() {
  return (
    <section className="relative bg-navy-50/60 py-24 sm:py-32">
      <div className="container-x">
        <SectionHeader eyebrow="What we do" title={<>STEM Education <span className="text-gradient-navy">Beyond the Classroom</span></>} description="AFRISTEM provides a growing range of STEM-focused programmes and services designed to make learning engaging, practical and relevant." />
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <StaggerItem key={s.slug}>
              <Link href={`/services#${s.slug}`} className="group card card-hover relative flex h-full flex-col overflow-hidden p-7">
                <div className={cn("absolute -right-10 -top-10 size-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100", ["bg-sun-300", "bg-sky-200", "bg-rose-200", "bg-teal-200", "bg-violet-200", "bg-amber-200"][i % 6])} aria-hidden />
                <span className="icon-badge relative">
                  <Icon name={s.icon} className="size-6" />
                </span>
                <h3 className="h3 relative mt-6 text-navy-900">{s.title}</h3>
                <p className="relative mt-3 flex-1 text-navy-800/70 leading-relaxed">{s.description}</p>
                <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-bold text-navy-800">
                  Learn more <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ============ FEATURED PROGRAMMES ============ */
export function FeaturedProgrammes() {
  const programmes = mergeProgrammes(content().programmes);
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute -right-40 top-20 size-[30rem] rounded-full bg-sun-100 blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <div className="mb-12 flex flex-col gap-6 sm:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl">
            <span className="eyebrow mb-5">Flagship programmes</span>
            <h2 className="h2 text-balance text-navy-900">Our Flagship <span className="text-gradient-navy">STEM Programmes</span></h2>
            <p className="lead mt-5">From science spelling and coding to STEM competitions and organic chemistry, AFRISTEM creates opportunities for young people to discover their potential and compete on bigger platforms.</p>
          </Reveal>
          <Reveal delay={0.15}>
            <Link href="/programmes" className="btn-outline">View All Programmes <ArrowRight className="size-4" /></Link>
          </Reveal>
        </div>
        <Stagger className="grid gap-6 md:grid-cols-2">
          {programmes.map((p, i) => (
            <StaggerItem key={p.slug}>
              <Tilt className="h-full">
                <ProgrammeCard programme={p} index={i} />
              </Tilt>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ============ PILLARS STRIP (Science / Technology / STEM / Chemistry) ============ */
export function PillarsStrip() {
  const programmes = mergeProgrammes(content().programmes);
  return (
    <section className="relative overflow-hidden bg-navy-900 py-20 text-white noise">
      <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
      <div className="container-x relative">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <span className="eyebrow-dark mb-5">Programme positioning</span>
          <h2 className="h2">Four ideas. One mission.</h2>
        </Reveal>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {programmes.map((p) => (
            <StaggerItem key={p.slug}>
              <Link href={`/programmes/${p.slug}`} className="group flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sun-400/50 hover:bg-white/10">
                <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-sun-300">{p.pillar}</span>
                <span className="mt-3 font-display text-xl font-bold">{p.name}</span>
                <span className="mt-2 flex-1 text-sm text-white/65">{p.pillarBlurb}</span>
                <span className="mt-5 inline-flex size-9 items-center justify-center rounded-full bg-white/10 transition-all group-hover:bg-sun-400 group-hover:text-navy-950">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ============ WHY AFRISTEM ============ */
export function WhyAfristem() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="container-x grid items-start gap-14 lg:grid-cols-12">
        <div className="lg:sticky lg:top-32 lg:col-span-5">
          <Reveal>
            <span className="eyebrow mb-5">Why AFRISTEM?</span>
            <h2 className="h2 text-balance text-navy-900">Why Choose <span className="text-gradient-navy">AFRISTEM?</span></h2>
            <p className="lead mt-5">We believe STEM is not just about what students learn. It is about what they can imagine, create and solve.</p>
          </Reveal>
          <Reveal delay={0.15} className="relative mt-10">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-card-lg">
              <Image src="/images/photos/kids-panel.jpg" alt="Young innovators panel" fill sizes="(min-width:1024px) 40vw, 90vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
              <blockquote className="absolute bottom-6 left-6 right-6 text-white">
                <Quote className="mb-2 size-6 text-sun-400" />
                <p className="font-display text-lg font-semibold leading-snug">&ldquo;STEM should inspire curiosity, creativity, innovation and problem-solving.&rdquo;</p>
              </blockquote>
            </div>
          </Reveal>
        </div>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
          {whyAfristem.map((w, i) => (
            <StaggerItem key={w.title}>
              <div className={cn("group card card-hover h-full p-6", i === 0 && "sm:col-span-2 bg-gradient-to-br from-navy-900 to-navy-800 text-white border-transparent")}>
                <span className={cn("icon-badge", i === 0 && "bg-white/10 text-sun-300")}>
                  <Icon name={w.icon} className="size-6" />
                </span>
                <h3 className={cn("h3 mt-5", i === 0 ? "text-white" : "text-navy-900")}>{w.title}</h3>
                <p className={cn("mt-2 leading-relaxed", i === 0 ? "text-white/70" : "text-navy-800/70")}>{w.description}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ============ UPCOMING EVENTS ============ */
export function UpcomingEvents() {
  const { events } = content();
  const upcoming = events.filter((e) => isUpcoming(e.end ?? e.start)).slice(0, 4);
  return (
    <section className="relative bg-navy-50/60 py-24 sm:py-32">
      <div className="container-x">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl">
            <span className="eyebrow mb-5">Upcoming events</span>
            <h2 className="h2 text-balance text-navy-900">What&apos;s Happening at <span className="text-gradient-navy">AFRISTEM?</span></h2>
            <p className="lead mt-5">Stay updated with our upcoming competitions, training programmes, boot camps, workshops, exhibitions and other STEM events.</p>
          </Reveal>
          <Reveal delay={0.15}>
            <Link href="/events" className="btn-outline">View All Events <ArrowRight className="size-4" /></Link>
          </Reveal>
        </div>
        <Stagger className="grid gap-5 lg:grid-cols-2">
          {upcoming.map((e) => {
            const d = new Date(e.start);
            return (
              <StaggerItem key={e.slug}>
                <article className="group card card-hover flex h-full flex-col gap-5 overflow-hidden p-5 sm:flex-row">
                  <div className="relative shrink-0 overflow-hidden rounded-2xl sm:w-44">
                    <div className="relative aspect-[16/10] sm:aspect-auto sm:h-full">
                      <Image src={e.image} alt="" fill sizes="(min-width:640px) 176px, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="absolute left-3 top-3 flex flex-col items-center rounded-xl bg-white px-3 py-2 text-navy-950 shadow-card">
                      <span className="font-display text-2xl font-extrabold leading-none">{d.getDate()}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{d.toLocaleString("en", { month: "short" })}</span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={e.mode === "Virtual" ? "sky" : "sun"}>{e.mode}</Pill>
                      <Pill>{e.tag}</Pill>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-bold leading-snug text-navy-900">{e.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-navy-800/70">{e.description}</p>
                    <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-semibold text-navy-800/60">
                      <div className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5 text-sun-500" /> {e.displayDate}</div>
                      <div className="inline-flex items-center gap-1.5"><MapPin className="size-3.5 text-sun-500" /> {e.location}</div>
                      {e.deadline && <div className="inline-flex items-center gap-1.5"><Clock className="size-3.5 text-sun-500" /> Deadline: {e.deadline}</div>}
                    </dl>
                    <div className="mt-auto pt-5">
                      <Link href={e.registerHref} className="btn-navy btn-sm">Register <ArrowRight className="size-3.5" /></Link>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

/* ============ PRIME STEM NIGERIA ============ */
export function PrimeStemSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-navy-900/5 bg-gradient-to-br from-white via-navy-50 to-sun-50 p-8 shadow-card sm:p-12 lg:p-16">
            <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-sun-300/40 blur-3xl" aria-hidden />
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="mb-6 inline-flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5 shadow-card">
                  <Image src="/images/partners/prime-stem-nigeria.png" alt="Prime STEM Nigeria" width={110} height={62} className="h-9 w-auto" />
                  <span className="text-xs font-bold uppercase tracking-widest text-navy-800/60">Ecosystem partner</span>
                </div>
                <h2 className="h2 text-balance text-navy-900">In Partnership With <span className="text-gradient-navy">Prime STEM Nigeria</span></h2>
                <p className="lead mt-5">Through our partnership with Prime STEM Nigeria, learners and schools can access additional STEM education opportunities, competitions and initiatives designed to promote academic excellence, digital literacy and interest in STEM.</p>
                <Link href="/prime-stem-nigeria" className="btn-navy mt-8">Explore Prime STEM Nigeria <ArrowRight className="size-4" /></Link>
              </div>
              <div className="grid gap-4">
                {primeStemProgrammes.map((p) => (
                  <Link key={p.id} href={`/prime-stem-nigeria#${p.id}`} className="group card card-hover flex items-center gap-5 p-4">
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl">
                      <Image src={p.image} alt="" fill sizes="96px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-sun-600">{p.short}</span>
                      <h3 className="mt-1 font-display text-lg font-bold leading-snug text-navy-900">{p.name}</h3>
                      <p className="mt-1 text-sm text-navy-800/65">{p.blurb}</p>
                    </div>
                    <ArrowRight className="size-5 shrink-0 text-navy-300 transition-all group-hover:translate-x-1 group-hover:text-navy-800" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ PARTNERS ============ */
export function PartnersSection({ compact = false }: { compact?: boolean }) {
  const { partners } = content();
  return (
    <section className={cn("relative", compact ? "py-16" : "py-24 sm:py-32")}>
      <div className="container-x">
        <SectionHeader eyebrow="Our strategic partners" title={<>Together, We Can <span className="text-gradient-navy">Do More</span></>} description="We are proud to collaborate with organisations that share our commitment to education, innovation, technology and youth development across Africa." />
        <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {partners.map((p) => (
            <StaggerItem key={p.slug}>
              <Link href={p.href} target={p.external ? "_blank" : undefined} rel={p.external ? "noopener noreferrer" : undefined} className="group card card-hover flex h-36 items-center justify-center p-6 grayscale transition-all duration-500 hover:grayscale-0 sm:h-40">
                <Image src={p.logo} alt={p.name} width={200} height={110} className="max-h-16 w-auto object-contain transition-transform duration-500 group-hover:scale-110 sm:max-h-20" />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
        {!compact && (
          <Reveal className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/partners" className="btn-outline">View All Partners</Link>
            <Link href="/contact?subject=Partnership%20enquiry" className="btn-primary">Partner With AFRISTEM <ArrowRight className="size-4" /></Link>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ============ TESTIMONIALS ============ */
export function TestimonialsSection() {
  const { testimonials } = content();
  return (
    <section className="relative overflow-hidden bg-navy-900 py-24 text-white noise sm:py-32">
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
      <div className="pointer-events-none absolute -left-40 bottom-0 size-[30rem] rounded-full bg-sun-400/15 blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <SectionHeader dark eyebrow="Voices from the ecosystem" title="What schools, teachers and students say" />
        <Testimonials
          items={testimonials.map((t) => ({
            quote: t.quote,
            name: t.name,
            role: [t.role, t.org].filter(Boolean).join(", "),
            initials:
              t.initials ||
              t.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase() ?? "")
                .join(""),
          }))}
        />
      </div>
    </section>
  );
}

/* ============ LATEST NEWS ============ */
export function LatestNews() {
  const { news } = content();
  const latest = [...news].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  return (
    <section className="relative py-24 sm:py-32">
      <div className="container-x">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl">
            <span className="eyebrow mb-5">News & insights</span>
            <h2 className="h2 text-balance text-navy-900">STEM News, Stories <span className="text-gradient-navy">& Insights</span></h2>
          </Reveal>
          <Reveal delay={0.15}>
            <ArrowLink href="/news">Read all stories</ArrowLink>
          </Reveal>
        </div>
        <Stagger className="grid gap-6 md:grid-cols-3">
          {latest.map((p) => (
            <StaggerItem key={p.slug} as="article">
              <Link href={`/news/${p.slug}`} className="group flex h-full flex-col">
                <div className="relative aspect-[16/11] overflow-hidden rounded-3xl">
                  <Image src={p.image} alt="" fill sizes="(min-width:768px) 30vw, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute left-4 top-4"><Pill tone="sun">{p.category}</Pill></span>
                </div>
                <div className="flex flex-1 flex-col pt-5">
                  <p className="text-xs font-semibold text-navy-800/50">{p.displayDate} · {p.readTime}</p>
                  <h3 className="mt-2 font-display text-xl font-bold leading-snug text-navy-900 transition-colors group-hover:text-navy-600">{p.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-navy-800/65">{p.excerpt}</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ============ FAQ (home teaser) ============ */
export function FAQTeaser() {
  const { faqs } = content();
  return (
    <section className="relative bg-navy-50/60 py-24 sm:py-32">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <span className="eyebrow mb-5">FAQ</span>
          <h2 className="h2 text-balance text-navy-900">Frequently Asked <span className="text-gradient-navy">Questions</span></h2>
          <p className="lead mt-5">Still have questions? We&apos;re here to help.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/faq" className="btn-outline">All FAQs</Link>
            <Link href="/contact" className="btn-navy">Contact Us</Link>
          </div>
        </Reveal>
        <div className="lg:col-span-8">
          <FAQAccordion items={faqs.slice(0, 6).map((f) => ({ q: f.question, a: f.answer }))} />
        </div>
      </div>
    </section>
  );
}
