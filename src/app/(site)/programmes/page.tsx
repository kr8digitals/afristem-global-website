export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Compass, GraduationCap, Lightbulb, Trophy } from "lucide-react";
import { PageHero, SectionHeader, CTABand, Pill } from "@/components/ui/primitives";
import { Stagger, StaggerItem, Tilt } from "@/components/ui/motion";
import { content, mergeProgrammes } from "@/lib/content";
import { ProgrammeCard } from "@/components/sections/programme-card";
import { PageFaq } from "@/components/sections/page-faq";
import { JsonLd } from "@/components/seo/json-ld";
import { primeStemProgrammes } from "@/content/programmes";
import { audiences } from "@/content/data";
import { seoPages } from "@/content/seo";
import { buildMetadata, breadcrumbSchema, itemListSchema, programmeSchema, webPageSchema } from "@/lib/seo";
import { Icon } from "@/lib/icons";

export const metadata = buildMetadata("programmes", "/programmes");

const journey = [
  { t: "Discover", d: "Develop curiosity and discover new possibilities in STEM.", I: Compass },
  { t: "Learn", d: "Build knowledge and practical skills through engaging experiences.", I: GraduationCap },
  { t: "Compete", d: "Challenge yourself, demonstrate your abilities and learn through healthy competition.", I: Trophy },
  { t: "Innovate", d: "Move beyond consuming technology to understanding, creating and innovating.", I: Lightbulb },
];

export default function ProgrammesPage() {
  const programmes = mergeProgrammes(content().programmes);
  return (
    <>
      <PageHero eyebrow="Programmes" title={<>Learn. Compete. <span className="text-gradient-sun">Create. Excel.</span></>} description="At AFRISTEM, we believe that the best way to inspire young people to embrace STEM is to give them opportunities to learn, compete, create and excel. From science and coding to organic chemistry, AFRISTEM creates platforms that connect learners and schools across Africa." image="/images/photos/exam-hall.jpg">
        <Link href="/register" className="btn-primary">Register Now <ArrowRight className="size-4" /></Link>
        <Link href="#flagship" className="btn-ghost-light">See the programmes</Link>
      </PageHero>

      {/* Flagship programmes */}
      <section id="flagship" className="relative scroll-mt-24 py-24 sm:py-32">
        <div className="container-x">
          <SectionHeader align="left" eyebrow="AFRISTEM flagship programmes" title={<>Four flagship <span className="text-gradient-navy">competitions</span></>} description="Our programmes are designed to make STEM education engaging while challenging learners to apply their knowledge, develop confidence and discover their potential." />
          <Stagger className="grid gap-6 md:grid-cols-2">
            {programmes.map((p, i) => (
              <StaggerItem key={p.slug}>
                <Tilt className="h-full"><ProgrammeCard programme={p} index={i} /></Tilt>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Ecosystem distinction */}
      <section className="relative bg-navy-50/60 py-24 sm:py-32">
        <div className="container-x">
          <SectionHeader eyebrow="Programme ecosystem" title={<>Through the <span className="text-gradient-navy">Prime STEM Nigeria</span> partnership</>} description="The programmes below are administered by our ecosystem partner Prime STEM Nigeria. Through our partnership, AFRISTEM learners and schools can access these additional opportunities." />
          <Stagger className="grid gap-5 md:grid-cols-2">
            {primeStemProgrammes.map((p) => (
              <StaggerItem key={p.id}>
                <Link href={`/prime-stem-nigeria#${p.id}`} className="group card card-hover flex h-full flex-col overflow-hidden sm:flex-row">
                  <div className="relative aspect-[16/10] sm:aspect-auto sm:w-2/5">
                    <Image src={p.image} alt="" fill sizes="30vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <Pill tone="sun" className="self-start">Partner programme</Pill>
                    <h3 className="mt-3 font-display text-xl font-bold text-navy-900">{p.name}</h3>
                    <p className="mt-2 flex-1 text-sm text-navy-800/70">{p.blurb}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-navy-800">{p.cta} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Why programmes matter — journey */}
      <section className="relative overflow-hidden bg-navy-900 py-24 text-white noise sm:py-32">
        <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
        <div className="pointer-events-none absolute -right-40 top-0 size-[30rem] rounded-full bg-sun-400/20 blur-[120px]" aria-hidden />
        <div className="container-x relative">
          <SectionHeader dark eyebrow="Why our programmes matter" title="Beyond theory. Into practice." description="Through competitions, practical learning, technology, training and real-world experience, we give young people opportunities to experiment, solve problems, collaborate and develop their potential." />
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {journey.map(({ t, d, I }, i) => (
              <StaggerItem key={t}>
                <div className="group relative h-full rounded-3xl border border-white/10 bg-white/5 p-7 transition-all hover:-translate-y-1 hover:border-sun-400/50 hover:bg-white/10">
                  <span className="absolute right-6 top-5 font-display text-5xl font-extrabold text-white/10">{i + 1}</span>
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-sun-400 text-navy-950 transition-transform group-hover:rotate-6 group-hover:scale-110"><I className="size-6" /></span>
                  <h3 className="mt-6 font-display text-2xl font-extrabold uppercase tracking-wide">{t}</h3>
                  <p className="mt-2 text-white/65">{d}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Who can participate */}
      <section className="py-24 sm:py-32">
        <div className="container-x">
          <SectionHeader eyebrow="Who can participate?" title={<>Programmes vary by <span className="text-gradient-navy">age and category</span></>} description="Each programme page clearly states its eligibility requirements." />
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[{ slug: "register", title: "Students", blurb: "Explore opportunities to learn, compete and build.", icon: "graduation" as const }, ...audiences].map((a) => (
              <StaggerItem key={a.slug}>
                <Link href={`/${a.slug}`} className="group card card-hover flex h-full flex-col p-6">
                  <span className="icon-badge"><Icon name={a.icon} className="size-6" /></span>
                  <h3 className="mt-5 font-display text-lg font-extrabold uppercase tracking-wide text-navy-900">{a.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-navy-800/70">{a.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-navy-800">Explore <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <PageFaq
        items={seoPages.programmes.faqs}
        description="Everything students, parents and schools ask about AFRISTEM competitions — eligibility, registration, formats and dates."
      />
      <CTABand />
      <JsonLd
        data={webPageSchema({
          path: "/programmes",
          title: seoPages.programmes.title,
          description: seoPages.programmes.description,
          type: "CollectionPage",
          breadcrumb: breadcrumbSchema([{ name: "Programmes", path: "/programmes" }]),
        })}
      />
      <JsonLd
        data={itemListSchema(
          programmes.map((p) =>
            programmeSchema({
              slug: p.slug,
              name: p.name,
              subtitle: p.subtitle,
              description: p.shortDescription,
              ageRange: p.ageRange,
              eligibility: p.eligibility,
              image: p.image,
            }),
          ),
          { url: "/programmes", name: "AFRISTEM flagship STEM programmes" },
        )}
      />
    </>
  );
}
