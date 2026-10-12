import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero, CheckList, CTABand, SectionHeader, Pill } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { primeStemProgrammes } from "@/content/programmes";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata("/prime-stem-nigeria", { title: "Prime STEM Nigeria", description: "Prime STEM Nigeria — advancing STEM education and opportunities for young Nigerians through the Annual National Science Championship and the Laptop for Schools Project." });

export default function PrimeStemPage() {
  return (
    <>
      <PageHero eyebrow="Ecosystem partner" title={<>Prime STEM <span className="text-gradient-sun">Nigeria</span></>} description="Advancing STEM Education and Opportunities for Young Nigerians." image="/images/photos/exam-hall.jpg">
        <Link href="#ansc" className="btn-primary">Explore ANSC <ArrowRight className="size-4" /></Link>
        <Link href="#laptop-for-schools" className="btn-ghost-light">Laptop for Schools</Link>
      </PageHero>

      <section className="relative overflow-x-clip py-24 sm:py-32">
        <div className="container-x grid items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <div className="inline-flex items-center gap-3 rounded-2xl border border-navy-900/10 bg-white px-5 py-3 shadow-card">
              <Image src="/images/partners/prime-stem-nigeria.png" alt="Prime STEM Nigeria" width={140} height={78} className="h-12 w-auto" />
            </div>
            <h2 className="h2 mt-8 text-navy-900">A leading STEM education organisation</h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-navy-800/75">
              <p>Prime STEM Nigeria is a leading STEM education organisation committed to promoting Science, Technology, Engineering and Mathematics among young people.</p>
              <p>Through competitions, educational initiatives and student-focused programmes, Prime STEM Nigeria creates opportunities for learners to develop their knowledge, demonstrate their abilities and cultivate a lasting interest in STEM.</p>
              <p>AFRISTEM works with Prime STEM Nigeria as part of a broader ecosystem dedicated to strengthening STEM education and opportunities for young people.</p>
            </div>
          </Reveal>
          <Reveal x={30} y={0}>
            <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4">
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-card-lg"><Image src="/images/posters/skc-trophy-team.jpg" alt="Trophies" fill sizes="(min-width:1024px) 25vw, 40vw" className="object-cover" /></div>
              <div className="relative mt-10 aspect-[3/4] overflow-hidden rounded-3xl shadow-card-lg"><Image src="/images/awards/blue-group.jpg" alt="Awards ceremony" fill sizes="(min-width:1024px) 25vw, 40vw" className="object-cover" /></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-navy-50/60 py-24 sm:py-32">
        <div className="container-x">
          <SectionHeader eyebrow="Programmes under Prime STEM Nigeria" title={<>Major <span className="text-gradient-navy">programmes</span></>} description="These programmes are administered by Prime STEM Nigeria. Through the AFRISTEM partnership, learners and schools gain access to these additional opportunities." />
          <div className="space-y-10">
            {primeStemProgrammes.map((p, i) => (
              <div key={p.id} id={p.id} className="scroll-mt-32">
                <Reveal>
                  <article className="card grid overflow-hidden lg:grid-cols-2">
                    <div className={cn("relative aspect-[16/10] lg:aspect-auto", i % 2 && "lg:order-2")}>
                      <Image src={p.image} alt="" fill sizes="(min-width:1024px) 50vw, 90vw" className="object-cover" />
                    </div>
                    <div className="p-8 sm:p-12">
                      <Pill tone="sun">Prime STEM Nigeria</Pill>
                      <h3 className="h2 mt-4 text-navy-900">{p.name}</h3>
                      <div className="mt-5 space-y-3 text-navy-800/75 leading-relaxed">{p.description.map((d) => <p key={d}>{d}</p>)}</div>
                      <h4 className="mt-8 text-xs font-extrabold uppercase tracking-[0.25em] text-navy-600">{p.pointsLabel}</h4>
                      <CheckList items={p.points} columns={2} className="mt-4" />
                      <Link href={`/register?event=${p.id}`} className="btn-navy mt-8">{p.cta} <ArrowRight className="size-4" /></Link>
                    </div>
                  </article>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABand title="Interested in Prime STEM Nigeria programmes?" description="Reach out and we'll connect you with the right opportunity for your students or school." primary={{ label: "Register Interest", href: "/register?event=ansc" }} secondary={{ label: "Contact Us", href: "/contact" }} />
    </>
  );
}
