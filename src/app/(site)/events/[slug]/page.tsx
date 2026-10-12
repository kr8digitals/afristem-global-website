import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { content } from "@/lib/content";
import { safeEventUrl } from "@/lib/events";
import { EventRegistration } from "@/components/forms/event-registration";
import { Countdown } from "@/components/sections/countdown";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const e = content().events.find((e) => e.slug === slug);
  return { title: e?.title || "Event not found", description: e?.description };
}
export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  if (slug === "skc-international-aoct-exam-2026") redirect("/events");
  const event = content().events.find((e) => e.slug === slug);
  if (!event) notFound();
  // Dynamic server render: send one clock snapshot to hydrate the countdown consistently.
  // eslint-disable-next-line react-hooks/purity
  const renderedAt = Date.now();
  const flyer = safeEventUrl(event.flyer);
  return <>
    <section className="bg-navy-950 pb-16 pt-[calc(var(--header-h,13rem)+2rem)] text-white">
      <div className="container-x grid items-center gap-10 lg:grid-cols-2"><div>
        <Link href="/events" className="text-sm text-sun-300">← All events</Link>
        <p className="mt-8 text-sm font-bold uppercase tracking-widest text-sun-300">{event.tag} · {event.mode}</p>
        <h1 className="h1 mt-4">{event.title}</h1><p className="mt-5 text-lg text-white/80">{event.description}</p>
        <p className="mt-6 font-bold">{event.displayDate}</p><p className="mt-2 text-white/75">{event.location}</p>
        <a href="#registration" className="btn-primary mt-7">Registration &amp; status</a>
        {Date.parse(`${event.start}T00:00:00+01:00`) > renderedAt && <div className="mt-8 max-w-md"><Countdown to={`${event.start}T00:00:00+01:00`} label="Days until the examination date" /><p className="mt-3 text-xs text-white/60">Countdown to the calendar date in WAT, not your assigned exam start time. Confirm your sitting with the organisers.</p></div>}
      </div>{flyer && <a href={flyer} target="_blank" rel="noopener noreferrer" className="mx-auto block max-w-md"><Image src={flyer} width={864} height={1080} alt={`Official ${event.title} flyer`} priority className="h-auto w-full rounded-2xl shadow-xl" /><span className="mt-3 block text-center text-sm text-sun-300">Open / download the original flyer ↗</span></a>}</div>
    </section>
    <div className="container-x grid items-start gap-10 py-16 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-8">
        {[ ["Who can enter", event.eligibility], ["Registration fees", event.fees], ["Exam arrangements", event.instructions], ["Awards & recognition", event.awards], ["Payment & confirmation", event.paymentInstructions] ].map(([title, text]) => text && <section key={title} className="card p-6"><h2 className="text-xl font-bold text-navy-900">{title}</h2><p className="mt-3 whitespace-pre-line leading-relaxed text-navy-800/75">{text}</p></section>)}
        <section className="card p-6"><h2 className="text-xl font-bold">Official documents & preparation</h2>{safeEventUrl(event.documentCover) && <Image src={safeEventUrl(event.documentCover)!} alt={`${event.title} handbook cover`} width={306} height={396} className="mx-auto mt-5 h-auto w-40 rounded-lg border border-navy-900/10" />}<p className="mt-3 text-sm text-navy-800/70">Read and share the original organiser documents. Preparatory guides are separate purchases.</p><div className="mt-5 flex flex-col gap-3">{[["School invitation / memorandum (PDF)", event.memorandumUrl], ["All you need to know — handbook (PDF)", event.handbookUrl], [event.preparationLabel || "Preparatory guide", event.preparationUrl]].map(([label, url]) => safeEventUrl(url) && <a key={url} href={safeEventUrl(url)} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-navy-900/10 p-4 text-sm font-bold text-navy-900 hover:bg-sun-50">{label} ↗</a>)}</div></section>
        <section className="card p-6"><h2 className="text-xl font-bold">Need help?</h2>{event.contactEmail && <a className="mt-3 block break-all underline" href={`mailto:${event.contactEmail}`}>{event.contactEmail}</a>}{event.contactPhone && <a className="mt-3 block underline" href={`tel:${event.contactPhone}`}>{event.contactPhone}</a>}{event.programmeSlug && <Link href={`/programmes/${event.programmeSlug}`} className="mt-4 block text-sm font-bold">Explore the programme →</Link>}</section>
      </div>
      {event.registrationStatus ? <EventRegistration event={event} renderedAt={renderedAt} /> : <section id="registration" className="card p-8"><h2 className="text-2xl font-bold">Event registration</h2><Link href={safeEventUrl(event.registerHref) || "/contact"} className="btn-navy mt-5">Registration enquiries</Link></section>}
    </div>
  </>;
}
