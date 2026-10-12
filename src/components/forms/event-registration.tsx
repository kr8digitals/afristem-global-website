"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { EventItem } from "@/content/data";
import { eventState, eventStatusLabel, registrationCutoff, safeEventUrl } from "@/lib/events";
import { Countdown } from "@/components/sections/countdown";

const input = "mt-2 w-full rounded-xl border border-navy-900/20 bg-white p-3 text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-600";
export function EventRegistration({ event: initial, renderedAt }: { event: EventItem; renderedAt: number }) {
  const [event, setEvent] = useState(initial);
  const [now, setNow] = useState(renderedAt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [kind, setKind] = useState("individual");
  const [count, setCount] = useState("1");
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const refresh = async () => {
      try { const r = await fetch(`/api/events/${initial.slug}`, { cache: "no-store" });
        if (r.status === 404) { setEvent((e) => ({ ...e, registrationStatus: "closed" })); return; }
        if (r.ok) { const data = await r.json(); setEvent(data.event); }
      } catch { /* The submission endpoint always checks the authoritative state. */ }
    };
    void refresh();
    const poll = setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    return () => { clearInterval(tick); clearInterval(poll); window.removeEventListener("focus", refresh); };
  }, [initial.slug]);
  const state = eventState(event, now);
  const cutoff = event.registrationClosure === "manual" ? null : registrationCutoff(event.registrationCloses);
  const aoct = event.programmeSlug === "african-organic-chemistry-tournament";
  const results = safeEventUrl(event.resultsUrl);
  return <section id="registration" className="scroll-mt-32 rounded-3xl border border-navy-900/10 bg-white p-6 shadow-card sm:p-9">
    <p className="eyebrow">Registration desk</p>
    <h2 className="mt-3 text-2xl font-extrabold text-navy-900">{eventStatusLabel(event, now)}</h2>
    {state === "closed" && <p className="mt-4 text-navy-800/75" role="status">Registration has closed. Awaiting results. Please return here for the organisers’ verified results announcement.</p>}
    {state === "results" && <div className="mt-4"><p className="whitespace-pre-line">{event.resultsMessage || "The organisers have published the official results."}</p>{results && <a href={results} className="btn-navy mt-4">View official results</a>}</div>}
    {state === "pending" && <p className="mt-4 text-navy-800/75">The online form is not accepting entries yet. Please contact the organisers to confirm the registration schedule. Event information and official documents remain available below.</p>}
    {state === "open" && <>
      {cutoff !== null ? <div className="my-6 rounded-2xl bg-navy-950 p-5 text-white"><Countdown to={new Date(cutoff).toISOString()} label="Registration closes in" /><p className="mt-4 text-sm text-white/75">Deadline: {event.registrationCloses} · end of day, Africa/Lagos (WAT).</p></div> : <p className="my-6 rounded-2xl bg-sun-50 p-5 text-navy-900">Registration is open until the organisers close it. No automatic closing date is set.</p>}
      {reference ? <div role="status" className="rounded-2xl bg-emerald-50 p-6"><h3 className="text-xl font-bold">Registration request received</h3><p className="mt-3">Your reference: <strong>{reference}</strong></p><p className="mt-3">Keep this reference. The organisers will verify your entry and payment before issuing candidate codes and confirming your examination arrangements. This is not a payment receipt.</p></div> : <form className="grid gap-5 sm:grid-cols-2" onSubmit={async (e) => {
        e.preventDefault(); setBusy(true); setError("");
        const values = Object.fromEntries(new FormData(e.currentTarget));
        try {
          const r = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, event: event.slug, programme: event.programmeSlug || "", eventForm: "yes" }) });
          const result = await r.json();
          if (!r.ok) { if (result.state) setEvent((old) => ({ ...old, registrationStatus: result.state === "open" ? "open" : result.state === "pending" ? "pending" : "closed" })); throw new Error(result.error || "Could not submit. Please try again."); }
          setReference(result.reference);
        } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
      }}>
        <p className="sm:col-span-2 text-sm text-navy-800/75">To be completed by a parent, guardian or authorised school coordinator. Required fields are marked *. Send payment evidence through the official contact channel; do not enter bank card details here.</p>
        <label className="text-sm font-bold">Entry type *<select name="type" className={input} value={kind} onChange={(e) => { setKind(e.target.value); setCount(e.target.value === "individual" ? "1" : "10"); }}><option value="individual">Individual candidate (adult representative)</option><option value="school">School / group</option></select></label>
        <label className="text-sm font-bold">Number of candidates *<input name="participants" type="number" min="1" max="500" required readOnly={kind === "individual"} className={input} value={count} onChange={(e) => setCount(e.target.value)} /></label>
        <label className="text-sm font-bold">Adult contact full name *<input name="fullName" autoComplete="name" required maxLength={120} className={input} /></label>
        <label className="text-sm font-bold">Role *<select name="role" required className={input}><option value="">Select role</option><option>Parent</option><option>Guardian</option><option>School coordinator</option></select></label>
        <label className="text-sm font-bold">Contact email *<input name="email" type="email" autoComplete="email" required maxLength={200} className={input} /></label>
        <label className="text-sm font-bold">Contact phone *<input name="phone" type="tel" autoComplete="tel" required maxLength={40} className={input} /></label>
        <label className="text-sm font-bold">School name *<input name="school" required maxLength={160} className={input} /></label>
        <label className="text-sm font-bold">City, state and country *<input name="city" required maxLength={160} className={input} /></label>
        <label className="text-sm font-bold sm:col-span-2">Candidate list: one full name and class per line *<textarea name="candidates" required rows={5} maxLength={12000} className={input} placeholder={aoct ? "Full name — SSS 1, SSS 2 or SSS 3" : "Full name — Basic 3, Basic 4, Basic 5, Basic 6, JSS 1, JSS 2 or JSS 3"} /><span className="font-normal text-xs">Only enter eligible candidates. For a group with different locations or sittings, submit separate requests.</span></label>
        <label className="text-sm font-bold">Exam mode *<select name="examMode" required className={input}>{aoct ? <option>Online CBT</option> : <><option value="">Select mode</option><option>Physical</option><option>Online</option></>}</select></label>
        <label className="text-sm font-bold">Exam location (city / country) *<input name="examLocation" required maxLength={160} className={input} placeholder="Required for online and physical entries" /></label>
        {aoct && <><label className="text-sm font-bold">Preferred exam date *<input name="examDate" type="date" min={event.start} max={event.end || event.start} required className={input} /></label><label className="text-sm font-bold">Preferred time and time zone *<input name="examTime" required maxLength={100} className={input} placeholder="e.g. 11:00 WAT — subject to confirmation" /></label></>}
        <label className="text-sm font-bold sm:col-span-2">Candidate code / payment reference, if already issued<input name="paymentReference" maxLength={160} className={input} /></label>
        <label className="text-sm font-bold sm:col-span-2">Notes<textarea name="notes" maxLength={3000} rows={3} className={input} /></label>
        <label className="sm:col-span-2 flex items-start gap-3 text-sm"><input name="consent" value="yes" type="checkbox" required className="mt-1" /><span>I am a parent, guardian or authorised school coordinator with permission to submit these candidate details. I confirm they are accurate, and agree to the <Link href="/privacy" className="underline">Privacy Policy</Link> and <Link href="/terms" className="underline">Terms</Link>. *</span></label>
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        {error && <p role="alert" className="sm:col-span-2 text-red-700">{error}</p>}
        <button disabled={busy || state !== "open"} className="btn-navy sm:col-span-2 disabled:opacity-50">{busy ? "Submitting…" : "Submit registration request"}</button>
      </form>}
    </>}
  </section>;
}
