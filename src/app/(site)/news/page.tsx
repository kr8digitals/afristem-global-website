export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { ContentImage } from "@/components/ui/content-image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero, CTABand, Pill } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { NewsGrid } from "@/components/sections/news-grid";
import { getContent, imageOr, newestFirst } from "@/lib/content";

export const metadata: Metadata = { title: "News & Insights", description: "STEM news, stories and insights from AFRISTEM: programme updates, student stories, school stories, innovation, careers and opportunities." };

export default async function NewsPage() {
  const { news, newsCategories } = await getContent();
  const sorted = newestFirst(news);
  const featured = sorted[0];
  return (
    <>
      <PageHero eyebrow="News & blog" title={<>STEM News, Stories <span className="text-gradient-sun">& Insights</span></>} description="Stay informed about AFRISTEM programmes, events, competitions, educational opportunities and developments in STEM." compact />

      {featured && (
      <section className="py-16 sm:py-20">
        <div className="container-x">
          <Reveal>
            <Link href={`/news/${featured.slug}`} className="group card card-hover grid overflow-hidden lg:grid-cols-2">
              <div className="relative aspect-[16/10] lg:aspect-auto">
                <ContentImage src={imageOr(featured.image)} alt="" fill priority sizes="(min-width:1024px) 50vw, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-12">
                <div className="flex items-center gap-2"><Pill tone="sun">Featured</Pill><Pill>{featured.category}</Pill></div>
                <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight text-navy-900 sm:text-4xl">{featured.title}</h2>
                <p className="mt-4 text-lg text-navy-800/70">{featured.excerpt}</p>
                <p className="mt-6 text-sm font-semibold text-navy-800/50">{featured.displayDate} · {featured.readTime}</p>
                <span className="mt-6 inline-flex items-center gap-2 font-bold text-navy-800">Read the story <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>
      )}

      <section className={featured ? "pb-24" : "py-20"}>
        <div className="container-x">
          <NewsGrid posts={sorted} categories={newsCategories.map((c) => c.name)} />
        </div>
      </section>

      <section className="bg-navy-50/60 py-20">
        <div className="container-x">
          <h2 className="h3 mb-8 text-navy-900">Content categories</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {newsCategories.map((c) => (
              <div key={c.name} className="rounded-2xl border border-navy-900/10 bg-white p-5">
                <p className="font-bold text-navy-900">{c.name}</p>
                <p className="mt-1 text-sm text-navy-800/65">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CTABand />
    </>
  );
}
