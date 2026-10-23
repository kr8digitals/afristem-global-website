export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { RegistrationForm, type FormEvent, type FormProgramme } from "@/components/forms/registration-form";
import { Reveal } from "@/components/ui/motion";
import { STATUS_LABEL, getContent, programmesFrom, upcomingEvents } from "@/lib/content";
import { mailConfigured } from "@/lib/mail";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Register", description: "Join an AFRISTEM programme. Ready to learn, compete, build and innovate? Complete the registration form for the programme or event you are interested in." };

/** Short codes used by older event links and posters → the event's real slug. */
const LEGACY_EVENT_CODES: Record<string, string> = {
  "award-tour-2026": "2026-award-distribution-tour",
  "teachers-hangout-2026": "international-science-teachers-hangout-2026",
  "digital-literacy-2027": "science-teachers-digital-literacy-hangout-2027",
  "ansc-2027": "annual-national-science-championship-2027",
  "scispell-2027": "sci-spell-1-0-2027",
  "stemx-bootcamp-2027": "international-stemx-bootcamp-5-2027",
};

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ type?: string; programme?: string; event?: string }> }) {
  const sp = await searchParams;
  const { programmes, events, site } = await getContent();

  const programmeOptions: FormProgramme[] = programmesFrom(programmes).map((p) => ({
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle,
    closed: p.status === "closed",
    statusLabel: p.status === "open" ? "" : STATUS_LABEL[p.status],
  }));
  const eventOptions: FormEvent[] = upcomingEvents(events).map((e) => ({ slug: e.slug, title: e.title, displayDate: e.displayDate }));

  const requestedEvent = sp.event ? (LEGACY_EVENT_CODES[sp.event] ?? sp.event) : "";
  const defaultEvent = eventOptions.some((e) => e.slug === requestedEvent) ? requestedEvent : "";
  const selected = programmeOptions.find((p) => p.slug === sp.programme);
  const defaultProgramme = selected && !selected.closed ? selected.slug : "";
  const selectedEvent = eventOptions.find((e) => e.slug === defaultEvent);

  const today = new Date().toISOString().slice(0, 10);
  const closes = site.registrationCloses && site.registrationCloses >= today ? site.registrationCloses : "";
  const opens = site.registrationOpens && site.registrationOpens > today ? site.registrationOpens : "";
  const emailOn = mailConfigured();

  return (
    <section className="relative overflow-hidden bg-navy-950 pb-24 pt-[calc(var(--header-h,12rem)+1.75rem)] noise">
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
      <div className="pointer-events-none absolute -right-40 -top-40 size-[30rem] rounded-full bg-sun-400/25 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute -left-40 bottom-0 size-[30rem] rounded-full bg-navy-500/40 blur-[120px]" aria-hidden />
      <div className="container-x relative grid gap-10 lg:grid-cols-12">
        <div className="text-white lg:col-span-4">
          <Reveal>
            <span className="eyebrow-dark mb-5">Registration</span>
            <h1 className="h1">Join an AFRISTEM <span className="text-gradient-sun">Programme</span></h1>
            <p className="lead mt-5 text-white/75">Ready to learn, compete, build and innovate? Complete the registration form for the programme or event you are interested in.</p>
            {site.registrationNote ? <p className="mt-4 text-sm leading-relaxed text-white/65">{site.registrationNote}</p> : null}
          </Reveal>
          {(closes || opens) && (
            <Reveal delay={0.05}>
              <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-sun-400/40 bg-sun-400/10 px-4 py-2 text-sm font-semibold text-sun-200">
                <CalendarDays className="size-4" />
                {opens ? `Registration opens ${formatDate(opens)}` : `Registration closes ${formatDate(closes)}`}
              </p>
            </Reveal>
          )}
          <Reveal delay={0.1}>
            <ul className="mt-8 space-y-3 text-sm text-white/80">
              {["Takes about 3 minutes", emailOn ? "Automated confirmation by email" : "Instant registration reference", "Schools can register multiple students", "Your data is protected"].map((t) => (
                <li key={t} className="flex items-center gap-3"><CheckCircle2 className="size-4 text-sun-400" /> {t}</li>
              ))}
            </ul>
          </Reveal>
          {(selected || selectedEvent) && (
            <Reveal delay={0.15}>
              <div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <p className="text-[11px] font-bold uppercase tracking-widest text-sun-300">Registering for</p>
                {selected ? (
                  <>
                    <p className="mt-1 font-display text-xl font-bold">{selected.name}</p>
                    <p className="text-sm text-white/70">{selected.closed ? `${selected.statusLabel} — choose another programme or ask us about the next edition.` : selected.subtitle}</p>
                    <Link href={`/programmes/${selected.slug}`} className="mt-3 inline-block text-sm font-bold text-sun-300 hover:text-sun-200">About this programme →</Link>
                  </>
                ) : selectedEvent ? (
                  <>
                    <p className="mt-1 font-display text-xl font-bold">{selectedEvent.title}</p>
                    <p className="text-sm text-white/70">{selectedEvent.displayDate}</p>
                    <Link href="/events" className="mt-3 inline-block text-sm font-bold text-sun-300 hover:text-sun-200">All events →</Link>
                  </>
                ) : null}
              </div>
            </Reveal>
          )}
        </div>
        <Reveal delay={0.1} className="lg:col-span-8">
          <div className="card p-6 sm:p-10">
            <RegistrationForm
              programmes={programmeOptions}
              events={eventOptions}
              defaultType={sp.type ?? ""}
              defaultProgramme={defaultProgramme}
              defaultEvent={defaultEvent}
            />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-white/60">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-sun-400" /> Secure & private</span>
            <span className="inline-flex items-center gap-2"><Sparkles className="size-4 text-sun-400" /> No payment required to submit</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
