import { eventStatusLabel } from "@/lib/events";
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import { PageHero, CTABand, Pill, SectionHeader } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { Countdown } from "@/components/sections/countdown";
import type { EventRecord } from "@/lib/store";
import { isUpcoming } from "@/lib/utils";
import { content } from "@/lib/content";

export const metadata: Metadata = { title: "Events", description: "Upcoming AFRISTEM competitions, boot camps, teacher hangouts, award tours and STEM events." };

export default function EventsPage() {
  const { events } = content();
  const upcoming = events.filter((e) => isUpcoming(e.end ?? e.start)).sort((a, b) => a.start.localeCompare(b.start));
  const past = events.filter((e) => !isUpcoming(e.end ?? e.start)).sort((a, b) => b.start.localeCompare(a.start));
  const next = upcoming[0];

  return (
    <>
      <PageHero eyebrow="Events" title={<>What&apos;s Happening at <span className="text-gradient-sun">AFRISTEM?</span></>} description="Stay updated with our upcoming competitions, training programmes, boot camps, workshops, exhibitions and other STEM events." image="/images/photos/students-crowd.jpg" compact>
        {next && (
          <div className="w-full max-w-md">
            <Countdown to={next.start} label={`Next up: ${next.title}`} />
          </div>
        )}
      </PageHero>

      <section className="py-20 sm:py-28">
        <div className="container-x">
          <SectionHeader align="left" eyebrow="Upcoming" title={<>Mark your <span className="text-gradient-navy">calendar</span></>} />
          <Stagger className="grid gap-6">
            {upcoming.map((e, i) => {
              const d = new Date(e.start);
              return (
                <StaggerItem key={e.slug}>
                  <article className="group card card-hover grid overflow-hidden lg:grid-cols-12">
                    <div className="relative aspect-[16/9] lg:col-span-4 lg:aspect-auto">
                      <Image src={e.image} alt="" fill sizes="(min-width:1024px) 33vw, 90vw" priority={i === 0} className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute left-4 top-4 flex flex-col items-center rounded-2xl bg-white px-4 py-2.5 text-navy-950 shadow-card">
                        <span className="font-display text-3xl font-extrabold leading-none">{d.getDate()}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{d.toLocaleString("en", { month: "short" })} {d.getFullYear()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col p-7 lg:col-span-8 lg:p-9">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone={e.mode === "Virtual" ? "sky" : "sun"}>{e.mode}</Pill>
                        <Pill>{e.tag}</Pill>
                        {e.registrationStatus && <Pill>{eventStatusLabel(e)}</Pill>}
                        {i === 0 && <Pill tone="coral">Next event</Pill>}
                      </div>
                      <h2 className="mt-4 font-display text-2xl font-extrabold leading-tight text-navy-900 sm:text-3xl">{e.title}</h2>
                      <p className="mt-3 text-navy-800/70 leading-relaxed">{e.description}</p>
                      <dl className="mt-6 grid gap-3 text-sm font-semibold text-navy-800/70 sm:grid-cols-3">
                        <div className="flex items-center gap-2"><CalendarDays className="size-4 text-sun-500" /> {e.displayDate}</div>
                        <div className="flex items-center gap-2"><MapPin className="size-4 text-sun-500" /> {e.location}</div>
                        {(e.registrationCloses || e.deadline) && <div className="flex items-center gap-2"><Clock className="size-4 text-sun-500" /> Register by {e.registrationCloses || e.deadline}</div>}
                      </dl>
                      <div className="mt-auto flex flex-wrap gap-3 pt-7">
                        <Link href={e.registrationStatus ? `/events/${e.slug}` : e.registerHref} className="btn-navy">{e.registrationStatus ? "View event & status" : "Register"} <ArrowRight className="size-4" /></Link>
                        <AddToCalendar e={e} />
                      </div>
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {past.length > 0 && (
        <section className="bg-navy-50/60 py-20 sm:py-28">
          <div className="container-x">
            <SectionHeader align="left" eyebrow="Past events" title="Recent highlights" />
            <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {past.map((e) => (
                <StaggerItem key={e.slug}>
                  <article className="card h-full overflow-hidden opacity-90">
                    <div className="relative aspect-[16/10]"><Image src={e.image} alt="" fill sizes="30vw" className="object-cover grayscale" /></div>
                    <div className="p-6">
                      <p className="text-xs font-bold uppercase tracking-wider text-navy-800/50">{e.displayDate}</p>
                      <h3 className="mt-2 font-display text-lg font-bold text-navy-900">{e.title}</h3><Link href={`/events/${e.slug}`} className="btn-outline mt-4">{e.registrationStatus ? eventStatusLabel(e) : "View event"}</Link>
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      <Reveal>
        <section className="container-x py-10">
          <div className="rounded-[2rem] border border-sun-300 bg-sun-50 p-8 text-center sm:p-12">
            <h2 className="h3 text-navy-900">Want AFRISTEM at your school or city?</h2>
            <p className="mx-auto mt-3 max-w-xl text-navy-800/70">We organise boot camps, workshops, exhibitions and special STEM days on request.</p>
            <Link href="/contact?subject=Host%20an%20event" className="btn-navy mt-6">Host an event <ArrowRight className="size-4" /></Link>
          </div>
        </section>
      </Reveal>
      <CTABand />
    </>
  );
}

function AddToCalendar({ e }: { e: EventRecord }) {
  const fmt = (d: string) => d.slice(0, 10).replace(/-/g, "");
  const endDate = new Date(`${e.end || e.start}T00:00:00Z`);
  endDate.setUTCDate(endDate.getUTCDate() + 1);
  const endNext = fmt(endDate.toISOString());
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.title)}&dates=${fmt(e.start)}/${endNext}&details=${encodeURIComponent(e.description)}&location=${encodeURIComponent(e.location)}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="btn-outline">
      <CalendarDays className="size-4" /> Add to calendar
    </a>
  );
}
