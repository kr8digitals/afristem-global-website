import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero, CheckList, CTABand, SectionHeader } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { audiences, services } from "@/content/data";
import { programmes } from "@/content/programmes";
import { ProgrammeCard } from "@/components/sections/programme-card";
import { Icon } from "@/lib/icons";

export function AudiencePage({ slug, highlights, servicesSlugs }: { slug: string; highlights: { title: string; description: string; icon: Parameters<typeof Icon>[0]["name"] }[]; servicesSlugs: string[] }) {
  const a = audiences.find((x) => x.slug === slug)!;
  const svc = services.filter((s) => servicesSlugs.includes(s.slug));
  return (
    <>
      <PageHero eyebrow={`For ${a.title}`} title={a.heading} description={a.intro} image={a.image}>
        <Link href={a.ctaHref} className="btn-primary">{a.cta} <ArrowRight className="size-4" /></Link>
        <Link href="/contact" className="btn-ghost-light">Talk to us</Link>
      </PageHero>

      <section className="py-24 sm:py-32">
        <div className="container-x grid items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow mb-5">Opportunities</span>
            <h2 className="h2 text-navy-900">{a.listLabel}</h2>
            <CheckList items={a.items} columns={2} className="mt-8" />
            <Link href={a.ctaHref} className="btn-navy mt-10">{a.cta} <ArrowRight className="size-4" /></Link>
          </Reveal>
          <Reveal x={30} y={0}>
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-card-lg">
                <Image src={a.image} alt="" fill sizes="(min-width:1024px) 45vw, 90vw" className="object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 rounded-2xl bg-sun-400 p-5 text-navy-950 shadow-card-lg animate-float">
                <Icon name={a.icon} className="size-8" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-navy-50/60 py-24 sm:py-32">
        <div className="container-x">
          <SectionHeader eyebrow="Why AFRISTEM" title={<>What you <span className="text-gradient-navy">get</span></>} />
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((h) => (
              <StaggerItem key={h.title}>
                <div className="group card card-hover h-full p-7">
                  <span className="icon-badge"><Icon name={h.icon} className="size-6" /></span>
                  <h3 className="h3 mt-5 text-navy-900">{h.title}</h3>
                  <p className="mt-2 text-navy-800/70 leading-relaxed">{h.description}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {svc.length > 0 && (
        <section className="py-24 sm:py-32">
          <div className="container-x">
            <SectionHeader align="left" eyebrow="Relevant services" title="How we can support you" />
            <Stagger className="grid gap-5 md:grid-cols-3">
              {svc.map((s) => (
                <StaggerItem key={s.slug}>
                  <Link href={`/services#${s.slug}`} className="group card card-hover flex h-full flex-col overflow-hidden">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image src={s.image} alt="" fill sizes="30vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-display text-lg font-bold text-navy-900">{s.title}</h3>
                      <p className="mt-2 flex-1 text-sm text-navy-800/70">{s.longDescription}</p>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-navy-800">Learn more <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      <section className="bg-navy-50/60 py-24 sm:py-32">
        <div className="container-x">
          <SectionHeader align="left" eyebrow="Programmes" title="Programmes to get involved in" />
          <Stagger className="grid gap-6 md:grid-cols-2">
            {programmes.map((p) => (
              <StaggerItem key={p.slug}><ProgrammeCard programme={p} /></StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <CTABand title={a.heading} description={a.intro} primary={{ label: a.cta, href: a.ctaHref }} secondary={{ label: "Contact Us", href: "/contact" }} />
    </>
  );
}
