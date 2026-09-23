export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, Target } from "lucide-react";
import { PageHero, SectionHeader, CTABand } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem, Counter } from "@/components/ui/motion";
import { Icon } from "@/lib/icons";
import { approach, beliefs, whyAfristem, audiences } from "@/content/data";
import { stats } from "@/content/site";
import { PartnersSection } from "@/components/sections/home-sections";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About AFRISTEM",
  description: "AFRISTEM is an EdTech and STEM-focused organisation committed to transforming the way Science, Technology, Engineering and Mathematics are taught, experienced and understood across Africa.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About us" title={<>Empowering young minds through <span className="text-gradient-sun">STEM education</span>, innovation and opportunity.</>} description="AFRISTEM is an EdTech and STEM-focused organisation committed to transforming the way Science, Technology, Engineering and Mathematics are taught, experienced and understood." image="/images/photos/students-campus.jpg">
        <Link href="/programmes" className="btn-primary">Explore Programmes <ArrowRight className="size-4" /></Link>
        <Link href="/partners" className="btn-ghost-light">Partner With Us</Link>
      </PageHero>

      {/* Who we are */}
      <section className="relative overflow-x-clip py-24 sm:py-32">
        <div className="container-x grid items-center gap-16 lg:grid-cols-2">
          <div>
            <Reveal>
              <span className="eyebrow mb-5">Who we are</span>
              <h2 className="h2 text-balance text-navy-900">More than academic <span className="text-gradient-navy">achievement.</span></h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-6 space-y-4 text-navy-800/75 leading-relaxed">
                <p className="text-lg">We create opportunities for learners to discover STEM through practical activities, competitions, training, technology, educational resources and real-world experiences.</p>
                <p>Our focus extends beyond academic achievement. We want young people to develop the confidence, creativity, curiosity and problem-solving abilities required to navigate the future.</p>
                <p>We believe STEM is not just about what students learn. It is about what they can imagine, create and solve.</p>
              </div>
            </Reveal>
            <Stagger className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((s) => (
                <StaggerItem key={s.label}>
                  <p className="font-display text-3xl font-extrabold text-navy-900"><Counter value={s.value} suffix={s.suffix} /></p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-navy-800/55">{s.label}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
          <Reveal x={30} y={0} className="relative min-w-0">
            <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4">
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-card-lg">
                <Image src="/images/awards/duo-certificates.jpg" alt="SciSPELL winners" fill sizes="(min-width:1024px) 25vw, 40vw" className="object-cover" />
              </div>
              <div className="relative mt-10 aspect-[3/4] overflow-hidden rounded-3xl shadow-card-lg">
                <Image src="/images/bootcamp/students.jpg" alt="Coding class" fill sizes="(min-width:1024px) 25vw, 40vw" className="object-cover" />
              </div>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-2xl bg-navy-900 px-6 py-4 text-center text-white shadow-card-lg">
              <p className="font-display text-sm font-bold">The African STEM Experience</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="relative bg-navy-50/60 py-24 sm:py-32">
        <div className="container-x">
          <Stagger className="grid gap-6 lg:grid-cols-2">
            <StaggerItem>
              <div className="relative h-full overflow-hidden rounded-[2rem] bg-navy-900 p-10 text-white noise sm:p-12">
                <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
                <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-sun-400/30 blur-3xl" aria-hidden />
                <span className="relative inline-flex size-14 items-center justify-center rounded-2xl bg-sun-400 text-navy-950"><Eye className="size-7" /></span>
                <h3 className="relative mt-6 text-xs font-extrabold uppercase tracking-[0.3em] text-sun-300">Our Vision</h3>
                <p className="relative mt-4 font-display text-2xl font-bold leading-snug sm:text-3xl">To inspire and equip a generation of innovative African problem-solvers through accessible, engaging and practical STEM education.</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="relative h-full overflow-hidden rounded-[2rem] border border-navy-900/5 bg-white p-10 shadow-card sm:p-12">
                <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-navy-100 blur-3xl" aria-hidden />
                <span className="relative inline-flex size-14 items-center justify-center rounded-2xl bg-navy-800 text-white"><Target className="size-7" /></span>
                <h3 className="relative mt-6 text-xs font-extrabold uppercase tracking-[0.3em] text-navy-600">Our Mission</h3>
                <p className="relative mt-4 font-display text-2xl font-bold leading-snug text-navy-900 sm:text-3xl">To make STEM education attractive, practical and accessible by connecting learners, educators, schools and STEM professionals with quality educational programmes, technology, resources and opportunities.</p>
              </div>
            </StaggerItem>
          </Stagger>

          <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Learners", "Discover and develop STEM potential.", "graduation"],
              ["Schools", "Create stronger STEM learning experiences.", "school"],
              ["Educators", "Build skills and access resources.", "book"],
              ["STEM Professionals", "Share knowledge, expertise and opportunities.", "users"],
            ].map(([t, d, ic]) => (
              <StaggerItem key={t}>
                <div className="group card card-hover h-full p-6">
                  <span className="icon-badge"><Icon name={ic as "graduation"} className="size-6" /></span>
                  <h4 className="mt-4 font-display text-lg font-bold text-navy-900">{t}</h4>
                  <p className="mt-1 text-sm text-navy-800/65">{d}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Beliefs */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="pointer-events-none absolute -left-40 top-1/3 size-[28rem] rounded-full bg-sun-100 blur-[120px]" aria-hidden />
        <div className="container-x relative grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <span className="eyebrow mb-5">Our belief</span>
            <h2 className="h2 text-balance text-navy-900">What we <span className="text-gradient-navy">believe</span></h2>
            <p className="lead mt-5">Africa&apos;s future depends significantly on how effectively we prepare today&apos;s young people to understand and create with science and technology.</p>
          </Reveal>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:col-span-8" as="ol">
            {beliefs.map((b, i) => (
              <StaggerItem key={b.title} as="li">
                <div className="group card card-hover relative h-full overflow-hidden p-7">
                  <span className="absolute -right-3 -top-6 font-display text-[7rem] font-extrabold leading-none text-navy-50 transition-colors group-hover:text-sun-100">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="relative font-display text-xl font-bold text-navy-900">{b.title}</h3>
                  <p className="relative mt-3 text-navy-800/70 leading-relaxed">{b.description}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Approach — timeline */}
      <section className="relative bg-navy-900 py-24 text-white noise sm:py-32">
        <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
        <div className="container-x relative">
          <SectionHeader dark eyebrow="Our approach" title="How we make STEM come alive" description="Five commitments that shape every AFRISTEM programme, product and partnership." />
          <ol className="relative mx-auto max-w-4xl">
            <div className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-sun-400 via-white/20 to-transparent sm:left-1/2" aria-hidden />
            {approach.map((a, i) => (
              <Reveal key={a.title} as="li" x={i % 2 === 0 ? -20 : 20} y={0} className={cn("relative mb-10 flex gap-6 pl-16 sm:w-1/2 sm:pl-0", i % 2 === 0 ? "sm:pr-14 sm:text-right" : "sm:ml-auto sm:pl-14")}>
                <span className={cn("absolute left-0 top-0 inline-flex size-12 items-center justify-center rounded-2xl bg-sun-400 text-navy-950 shadow-glow sm:left-auto", i % 2 === 0 ? "sm:-right-6" : "sm:-left-6")}>
                  <Icon name={a.icon} className="size-5" />
                </span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-sun-300">Step {i + 1}</span>
                  <h3 className="mt-1 font-display text-2xl font-bold">{a.title}</h3>
                  <p className="mt-2 text-white/65 leading-relaxed">{a.description}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Why this approach matters */}
      <section className="py-24 sm:py-32">
        <div className="container-x">
          <SectionHeader eyebrow="Why this approach matters" title={<>Built for <span className="text-gradient-navy">real impact</span></>} />
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {whyAfristem.map((w) => (
              <StaggerItem key={w.title}>
                <div className="group card card-hover h-full p-7">
                  <span className="icon-badge"><Icon name={w.icon} className="size-6" /></span>
                  <h3 className="h3 mt-5 text-navy-900">{w.title}</h3>
                  <p className="mt-2 text-navy-800/70 leading-relaxed">{w.description}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Who we serve */}
      <section className="bg-navy-50/60 py-24 sm:py-32">
        <div className="container-x">
          <SectionHeader eyebrow="Who we serve" title={<>There&apos;s a place for you in the <span className="text-gradient-navy">AFRISTEM ecosystem</span></>} />
          <Stagger className="grid gap-5 md:grid-cols-3">
            {audiences.map((a) => (
              <StaggerItem key={a.slug}>
                <Link href={`/${a.slug}`} className="group card card-hover flex h-full flex-col overflow-hidden">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image src={a.image} alt="" fill sizes="30vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
                    <h3 className="absolute bottom-4 left-5 font-display text-2xl font-extrabold text-white">{a.title}</h3>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="flex-1 text-navy-800/70">{a.blurb}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-navy-800">Learn more <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <PartnersSection compact />
      <CTABand title="Be Part of Africa's STEM Future" description="Whether you are a learner, school, educator, STEM professional or organisation, there is a place for you in the AFRISTEM ecosystem." primary={{ label: "Partner With Us", href: "/contact?subject=Partnership%20enquiry" }} secondary={{ label: "Explore Programmes", href: "/programmes" }} />
    </>
  );
}
