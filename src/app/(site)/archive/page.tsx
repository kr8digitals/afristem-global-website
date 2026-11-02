export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Archive, CalendarDays, Download, FileText, MapPin, PlayCircle } from "lucide-react";
import { ContentImage } from "@/components/ui/content-image";
import { CTABand, PageHero, Pill, SectionHeader } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { GalleryGrid, VideoCard } from "@/components/sections/gallery-grid";
import { archiveCategories, archivedEditions, archivedPosters } from "@/content/archive";
import { archivedPosts, getContent, imageOr, isArchivedVideo, pastEvents } from "@/lib/content";

export const metadata: Metadata = {
  title: "Archive — Past Editions, Results & Retired Material",
  description:
    "The AFRISTEM archive keeps past programme editions, results, awards ceremonies, old flyers and earlier videos on the record while the live site stays focused on what is current.",
};

export default async function ArchivePage() {
  const { events, news, videos } = await getContent();
  const past = pastEvents(events);
  const stories = archivedPosts(news);
  const oldVideos = videos.filter((v) => isArchivedVideo(v.id));
  const years = [...new Set(archivedEditions.map((e) => e.year))].sort((a, b) => b.localeCompare(a));

  const stats = [
    { value: String(archivedEditions.length), label: "Archived editions & moments" },
    { value: String(past.length), label: "Past events on record" },
    { value: String(stories.length), label: "Archived stories" },
    { value: String(archivedPosters.length), label: "Retired flyers & posters" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Archive"
        title={<>The AFRISTEM <span className="text-gradient-sun">Archive</span></>}
        description="Past editions, results, awards ceremonies, retired flyers and earlier videos stay here on the record. The live programme, events and news pages carry only what is current."
        image="/images/photos/trophies.jpg"
        compact
      >
        <Link href="/programmes" className="btn-primary">See current programmes <ArrowRight className="size-4" /></Link>
        <Link href="#editions" className="btn-ghost-light">Browse the archive</Link>
      </PageHero>

      {/* Counts + how it works */}
      <section className="border-b border-navy-900/5 bg-white py-10">
        <div className="container-x grid gap-8 lg:grid-cols-12 lg:items-center">
          <Stagger className="grid grid-cols-2 gap-6 lg:col-span-7 lg:grid-cols-4">
            {stats.map((s) => (
              <StaggerItem key={s.label}>
                <p className="font-display text-4xl font-extrabold leading-none text-navy-900">{s.value}</p>
                <p className="mt-2 text-xs font-bold uppercase leading-snug tracking-wider text-navy-800/50">{s.label}</p>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="lg:col-span-5">
            <div className="rounded-2xl border border-navy-900/10 bg-navy-50/60 p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-navy-900"><Archive className="size-4 text-sun-500" /> Nothing is deleted</p>
              <p className="mt-2 text-sm leading-relaxed text-navy-800/70">
                When an edition closes, its flyer or story moves here. Current information lives on the{" "}
                <Link href="/programmes" className="link-underline">programme pages</Link>,{" "}
                <Link href="/events" className="link-underline">events</Link> and{" "}
                <Link href="/news" className="link-underline">news</Link>.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Editions */}
      <section id="editions" className="scroll-mt-24 py-20 sm:py-28">
        <div className="container-x">
          <SectionHeader
            align="left"
            eyebrow={`Past editions · ${years[years.length - 1]}–${years[0]}`}
            title={<>Programmes & moments <span className="text-gradient-navy">on the record</span></>}
            description="Every edition below has closed. It stays here with its results, photographs and — where one exists — its original flyer."
          />
          <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {archivedEditions.map((edition, i) => (
              <StaggerItem key={edition.id}>
                <article className="card card-hover flex h-full flex-col overflow-hidden">
                  <div className="relative aspect-[16/10]">
                    <ContentImage src={edition.image} alt={edition.imageAlt} fill sizes="(min-width:1024px) 33vw, 90vw" priority={i < 3} className="object-cover" />
                    <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
                      <Pill tone="sun">{edition.year}</Pill>
                      <Pill tone="white" className="backdrop-blur">{edition.kind}</Pill>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-navy-800/40">{edition.programme}</p>
                    <h3 className="mt-2 font-display text-xl font-bold leading-snug text-navy-900">{edition.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-800/65">{edition.summary}</p>
                    <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-navy-900/5 pt-5">
                      {edition.facts.map((f) => (
                        <div key={f.label}>
                          <dt className="text-[10px] font-extrabold uppercase tracking-wider text-navy-800/40">{f.label}</dt>
                          <dd className="mt-0.5 text-xs font-semibold leading-snug text-navy-900">{f.value}</dd>
                        </div>
                      ))}
                    </dl>
                    {(edition.file || edition.link) && (
                      <div className="mt-5 flex flex-wrap gap-3">
                        {edition.link && (
                          <Link href={edition.link.href} className="inline-flex items-center gap-1.5 text-sm font-bold text-navy-800 hover:text-navy-600">
                            {edition.link.label} <ArrowRight className="size-3.5" />
                          </Link>
                        )}
                        {edition.file && (
                          <a href={edition.file.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-navy-800/60 hover:text-navy-800">
                            <FileText className="size-3.5" /> {edition.file.label}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Past events */}
      <section id="past-events" className="scroll-mt-24 bg-navy-50/60 py-20 sm:py-28">
        <div className="container-x">
          <SectionHeader
            align="left"
            eyebrow="Past events"
            title={<>Dates that have <span className="text-gradient-navy">already happened</span></>}
            description="These events have taken place and no longer accept registrations. The live events page only lists what is coming next."
          />
          {past.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-navy-900/15 p-10 text-center text-navy-800/60">No past events are on record yet.</p>
          ) : (
            <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {past.map((e) => (
                <StaggerItem key={e.slug}>
                  <article className="card flex h-full gap-4 p-5">
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-navy-900 text-white">
                      <span className="font-display text-2xl font-extrabold leading-none">{new Date(e.start).getUTCDate()}</span>
                      <span className="mt-1 text-[9px] font-bold uppercase tracking-wider">{new Date(e.start).toLocaleString("en", { month: "short", timeZone: "UTC" })} {new Date(e.start).getUTCFullYear()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-navy-800/40">
                        <span className="inline-flex items-center gap-1"><CalendarDays className="size-3" /> {e.displayDate}</span>
                        <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {e.location}</span>
                      </p>
                      <h3 className="mt-1.5 font-display text-base font-bold leading-snug text-navy-900">{e.title}</h3>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-navy-800/60">{e.description}</p>
                      <Pill className="mt-3">Archived · {e.tag}</Pill>
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
          )}
          <div className="mt-8">
            <Link href="/events" className="btn-outline">See upcoming events <ArrowRight className="size-4" /></Link>
          </div>
        </div>
      </section>

      {/* Archived stories */}
      {stories.length > 0 && (
        <section id="stories" className="scroll-mt-24 py-20 sm:py-28">
          <div className="container-x">
            <SectionHeader
              align="left"
              eyebrow="Archived news"
              title={<>Stories from <span className="text-gradient-navy">past seasons</span></>}
              description="Published stories that describe a past edition or ceremony. They stay readable here rather than in the live news feed."
            />
            <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {stories.map((p) => (
                <StaggerItem key={p.slug}>
                  <Link href={`/news/${p.slug}`} className="group card card-hover flex h-full flex-col overflow-hidden">
                    <div className="relative aspect-[16/10]">
                      <ContentImage src={imageOr(p.image)} alt="" fill sizes="(min-width:1024px) 33vw, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      <span className="absolute left-4 top-4"><Pill tone="white" className="backdrop-blur">Archived</Pill></span>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-xs font-semibold text-navy-800/50">{p.displayDate} · {p.category}</p>
                      <h3 className="mt-2 font-display text-xl font-bold leading-snug text-navy-900 group-hover:text-navy-600">{p.title}</h3>
                      <p className="mt-2 line-clamp-3 flex-1 text-sm text-navy-800/65">{p.excerpt}</p>
                      <span className="mt-4 text-sm font-bold text-navy-800">Read the archived story →</span>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* Retired posters */}
      <section id="posters" className="scroll-mt-24 bg-navy-50/60 py-20 sm:py-28">
        <div className="container-x">
          <SectionHeader
            align="left"
            eyebrow="Retired flyers & posters"
            title={<>The artwork that <span className="text-gradient-navy">started it</span></>}
            description="Old flyers, result posters and ceremony artwork — including the 2023 STEM Kids Championship flyer that has been replaced by the 5th Edition design."
          />
          <GalleryGrid items={archivedPosters} categories={archiveCategories} />
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-navy-800/55">
            Looking for the current flyer? Download the{" "}
            <a href="/images/posters/skc-2026-5th-edition-cutoff.png" download className="font-bold text-navy-800 underline underline-offset-4">
              5th Edition flyer (PNG)
            </a>{" "}
            or the{" "}
            <a href="/downloads/skc-2026-5th-edition-cutoff-flyer.pdf" download className="font-bold text-navy-800 underline underline-offset-4">
              print-ready PDF
            </a>.
          </p>
        </div>
      </section>

      {/* Archived videos */}
      {oldVideos.length > 0 && (
        <section id="videos" className="scroll-mt-24 py-20 sm:py-28">
          <div className="container-x">
            <SectionHeader
              align="left"
              eyebrow="Earlier videos"
              title={<>Highlights from <span className="text-gradient-navy">earlier editions</span></>}
              description="Video from past championships and boot camps. Newer highlights stay on the live gallery."
            />
            <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {oldVideos.map((v) => (
                <StaggerItem key={v.id}><VideoCard v={v} /></StaggerItem>
              ))}
            </Stagger>
            <div className="mt-8">
              <Link href="/gallery#videos" className="btn-outline"><PlayCircle className="size-4" /> Watch current highlights</Link>
            </div>
          </div>
        </section>
      )}

      <section className="container-x py-6">
        <div className="flex flex-col items-start gap-4 rounded-[2rem] border border-sun-300 bg-sun-50 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="flex items-start gap-4">
            <span className="icon-badge shrink-0"><Download className="size-5" /></span>
            <div>
              <h2 className="font-display text-xl font-extrabold text-navy-900">Need something from the archive?</h2>
              <p className="mt-1 text-sm text-navy-800/70">Certificates, result sheets and school records from a past edition can be requested from the team.</p>
            </div>
          </div>
          <Link href="/contact?subject=Archive%20request" className="btn-navy shrink-0">Ask the archive <ArrowRight className="size-4" /></Link>
        </div>
      </section>

      <CTABand />
    </>
  );
}
