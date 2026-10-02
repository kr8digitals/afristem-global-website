export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, User } from "lucide-react";
import { content } from "@/lib/content";
import { Pill, CTABand } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { ShareButtons } from "@/components/sections/share-buttons";

export function generateStaticParams() {
  return content().news.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { news } = content();
  const p = news.find((x) => x.slug === slug);
  if (!p) return {};
  return { title: p.title, description: p.excerpt, openGraph: { type: "article", publishedTime: p.date, images: [p.image] } };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { news } = content();
  const p = news.find((x) => x.slug === slug);
  if (!p) notFound();
  const more = news.filter((x) => x.slug !== p.slug).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  return (
    <>
      <article>
        <header className="relative overflow-hidden bg-navy-950 pt-[calc(var(--header-h,13rem)+2rem)] text-white noise">
          <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
          <div className="container-x relative">
            <Reveal>
              <Link href="/news" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white"><ArrowLeft className="size-4" /> All stories</Link>
            </Reveal>
            <Reveal delay={0.05} className="max-w-4xl">
              <Pill tone="sun">{p.category}</Pill>
              <h1 className="h1 mt-5 text-balance">{p.title}</h1>
              <p className="lead mt-6 text-white/75">{p.excerpt}</p>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-white/60">
                <span className="inline-flex items-center gap-2"><User className="size-4 text-sun-400" /> {p.author}</span>
                <span className="inline-flex items-center gap-2"><Clock className="size-4 text-sun-400" /> {p.displayDate} · {p.readTime}</span>
              </div>
            </Reveal>
            <Reveal delay={0.15} className="mt-12">
              <div className="relative aspect-[21/9] overflow-hidden rounded-t-[2rem]">
                <Image src={p.image} alt="" fill priority sizes="100vw" className="object-cover" />
              </div>
            </Reveal>
          </div>
        </header>

        <div className="container-x grid gap-12 py-16 lg:grid-cols-12">
          <div className="prose-afristem lg:col-span-8">
            {p.body.map((para, i) => (
              <p key={i} className={i === 0 ? "text-xl leading-relaxed text-navy-900 first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:font-extrabold first-letter:leading-none first-letter:text-sun-500" : "text-lg leading-relaxed text-navy-800/80"}>
                {para}
              </p>
            ))}
          </div>
          <aside className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <ShareButtons title={p.title} />
              <div className="card p-6">
                <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-sun-600">Get involved</p>
                <p className="mt-2 font-display text-lg font-bold text-navy-900">Register for an AFRISTEM programme</p>
                <Link href="/register" className="btn-navy mt-4 w-full">Register Now <ArrowRight className="size-4" /></Link>
              </div>
            </div>
          </aside>
        </div>
      </article>

      <section className="bg-navy-50/60 py-20">
        <div className="container-x">
          <h2 className="h2 mb-10 text-navy-900">More stories</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {more.map((m) => (
              <Link key={m.slug} href={`/news/${m.slug}`} className="group card card-hover overflow-hidden">
                <div className="relative aspect-[16/10] overflow-hidden"><Image src={m.image} alt="" fill sizes="30vw" className="object-cover transition-transform duration-700 group-hover:scale-105" /></div>
                <div className="p-6">
                  <p className="text-xs font-semibold text-navy-800/50">{m.displayDate}</p>
                  <h3 className="mt-2 font-display text-lg font-bold leading-snug text-navy-900">{m.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CTABand />
    </>
  );
}
