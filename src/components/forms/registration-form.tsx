"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, PartyPopper } from "lucide-react";
import { programmes } from "@/content/programmes";
import { events, registrationTypes } from "@/content/data";
import { cn } from "@/lib/utils";

const inputCls = "w-full rounded-2xl border border-navy-900/10 bg-white px-4 py-3.5 text-navy-900 placeholder:text-navy-800/40 transition-all focus:border-navy-500 focus:outline-none focus:ring-4 focus:ring-navy-500/10";
const labelCls = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy-800/70";
const selectCls = cn(inputCls, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%230b2a6f%22 stroke-width=%222.5%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10");

type Values = Record<string, string>;

const steps = ["Who you are", "Programme", "Your details", "Review"];

export function RegistrationForm({ defaultType = "", defaultProgramme = "", defaultEvent = "" }: { defaultType?: string; defaultProgramme?: string; defaultEvent?: string }) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [v, setV] = useState<Values>({
    type: defaultType || "student",
    programme: defaultProgramme,
    event: defaultEvent,
    category: "",
    format: "",
    fullName: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    schoolName: "",
    grade: "",
    schoolLocation: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    guardianRelationship: "",
    role: "",
    organisation: "",
    notes: "",
    consent: "",
    website: "",
  });
  const set = (k: string, val: string) => setV((s) => ({ ...s, [k]: val }));

  const isStudent = v.type === "student";
  const isSchool = v.type === "school";
  const needsProgramme = isStudent || isSchool;
  const [today] = useState(() => Date.now());
  const isMinor = useMemo(() => {
    if (!v.dob) return isStudent;
    const age = (today - new Date(v.dob).getTime()) / (365.25 * 24 * 3600 * 1000);
    return age < 18;
  }, [v.dob, isStudent, today]);

  function validStep(): boolean {
    if (step === 0) return !!v.type;
    if (step === 1) return needsProgramme ? !!v.programme || !!v.event : true;
    if (step === 2) {
      const base = v.fullName && v.phone && v.email;
      if (isStudent) return !!(base && v.schoolName && v.grade && (!isMinor || (v.guardianName && v.guardianPhone)));
      if (isSchool) return !!(base && v.schoolName && v.schoolLocation);
      return !!(base && v.role);
    }
    return v.consent === "yes";
  }

  async function submit() {
    setState("loading");
    try {
      const r = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) });
      if (!r.ok) throw new Error();
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-sun-300 bg-gradient-to-br from-sun-50 to-white px-6 py-16 text-center">
        <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-sun-400/30 blur-3xl" aria-hidden />
        <span className="inline-flex size-20 items-center justify-center rounded-full bg-sun-400 text-navy-950 shadow-glow">
          <PartyPopper className="size-9" />
        </span>
        <h3 className="mt-6 font-display text-3xl font-extrabold text-navy-900">You&apos;re registered!</h3>
        <p className="mx-auto mt-3 max-w-md text-navy-800/70">
          Thank you, {v.fullName.split(" ")[0]}. A confirmation has been sent to <strong>{v.email}</strong>. Our team will be in touch with next steps{v.programme ? ` for ${programmes.find((p) => p.slug === v.programme)?.name ?? "your programme"}` : ""}.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/programmes" className="btn-navy">Explore more programmes</Link>
          <Link href="/events" className="btn-outline">See upcoming events</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stepper */}
      <ol className="mb-10 grid grid-cols-4 gap-2" aria-label="Registration progress">
        {steps.map((s, i) => (
          <li key={s} className="flex flex-col gap-2">
            <div className={cn("h-1.5 rounded-full transition-all duration-500", i <= step ? "bg-sun-400" : "bg-navy-100")} />
            <span className={cn("text-[11px] font-bold uppercase tracking-wider sm:text-xs", i === step ? "text-navy-900" : "text-navy-800/45")}>
              {i + 1}. {s}
            </span>
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
          {step === 0 && (
            <fieldset>
              <legend className="h3 mb-6 text-navy-900">I am registering as a…</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {registrationTypes.map((t) => (
                  <label key={t.value} className={cn("group flex cursor-pointer items-center gap-4 rounded-2xl border-2 px-5 py-4 transition-all", v.type === t.value ? "border-navy-800 bg-navy-50 shadow-card" : "border-navy-900/10 hover:border-navy-300")}>
                    <input type="radio" name="type" value={t.value} checked={v.type === t.value} onChange={() => set("type", t.value)} className="sr-only" />
                    <span className={cn("flex size-6 items-center justify-center rounded-full border-2 transition-all", v.type === t.value ? "border-navy-800 bg-navy-800" : "border-navy-300")}>
                      {v.type === t.value && <span className="size-2.5 rounded-full bg-sun-400" />}
                    </span>
                    <span className="font-semibold text-navy-900">{t.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {step === 1 && (
            <fieldset className="grid gap-5">
              <legend className="h3 mb-2 text-navy-900">{needsProgramme ? "Which programme or event?" : "What are you interested in?"}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {programmes.map((p) => (
                  <label key={p.slug} className={cn("flex cursor-pointer flex-col gap-1 rounded-2xl border-2 px-5 py-4 transition-all", v.programme === p.slug ? "border-navy-800 bg-navy-50 shadow-card" : "border-navy-900/10 hover:border-navy-300")}>
                    <input type="radio" name="programme" value={p.slug} checked={v.programme === p.slug} onChange={() => { set("programme", p.slug); set("event", ""); }} className="sr-only" />
                    <span className="font-bold text-navy-900">{p.name}</span>
                    <span className="text-xs text-navy-800/60">{p.subtitle}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className={labelCls} htmlFor="r-event">…or an upcoming event</label>
                <select id="r-event" className={selectCls} value={v.event} onChange={(e) => { set("event", e.target.value); if (e.target.value) set("programme", ""); }}>
                  <option value="">Select an event (optional)</option>
                  {events.map((e) => (
                    <option key={e.slug} value={e.slug}>{e.title} — {e.displayDate}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelCls} htmlFor="r-cat">Category</label>
                  <select id="r-cat" className={selectCls} value={v.category} onChange={(e) => set("category", e.target.value)}>
                    <option value="">Select category</option>
                    <option>Primary (Junior)</option>
                    <option>Primary (Senior)</option>
                    <option>Junior Secondary</option>
                    <option>Senior Secondary</option>
                    <option>Educator / Adult</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="r-format">Preferred format</label>
                  <select id="r-format" className={selectCls} value={v.format} onChange={(e) => set("format", e.target.value)}>
                    <option value="">Select format</option>
                    <option>Physical</option>
                    <option>Online</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <div className="grid gap-8">
              <fieldset className="grid gap-5 sm:grid-cols-2">
                <legend className="h3 mb-4 text-navy-900">{isSchool ? "School contact person" : "Your information"}</legend>
                <div className="sm:col-span-2">
                  <label className={labelCls} htmlFor="r-name">Full name *</label>
                  <input id="r-name" required className={inputCls} value={v.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Full name" />
                </div>
                {isStudent && (
                  <>
                    <div>
                      <label className={labelCls} htmlFor="r-dob">Date of birth *</label>
                      <input id="r-dob" type="date" className={inputCls} value={v.dob} onChange={(e) => set("dob", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="r-gender">Gender</label>
                      <select id="r-gender" className={selectCls} value={v.gender} onChange={(e) => set("gender", e.target.value)}>
                        <option value="">Prefer not to say</option>
                        <option>Female</option>
                        <option>Male</option>
                      </select>
                    </div>
                  </>
                )}
                <div>
                  <label className={labelCls} htmlFor="r-phone">Phone number *</label>
                  <input id="r-phone" type="tel" required className={inputCls} value={v.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+234…" />
                </div>
                <div>
                  <label className={labelCls} htmlFor="r-email">Email *</label>
                  <input id="r-email" type="email" required className={inputCls} value={v.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
                </div>
                {!isStudent && !isSchool && (
                  <>
                    <div>
                      <label className={labelCls} htmlFor="r-role">Role / Profession *</label>
                      <input id="r-role" className={inputCls} value={v.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. Chemistry Teacher, Software Engineer" />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="r-org">Organisation</label>
                      <input id="r-org" className={inputCls} value={v.organisation} onChange={(e) => set("organisation", e.target.value)} placeholder="Organisation or school" />
                    </div>
                  </>
                )}
              </fieldset>

              {(isStudent || isSchool) && (
                <fieldset className="grid gap-5 sm:grid-cols-2">
                  <legend className="h3 mb-4 text-navy-900">School information</legend>
                  <div className="sm:col-span-2">
                    <label className={labelCls} htmlFor="r-school">School name *</label>
                    <input id="r-school" className={inputCls} value={v.schoolName} onChange={(e) => set("schoolName", e.target.value)} placeholder="School name" />
                  </div>
                  {isStudent && (
                    <div>
                      <label className={labelCls} htmlFor="r-grade">Class / Grade *</label>
                      <input id="r-grade" className={inputCls} value={v.grade} onChange={(e) => set("grade", e.target.value)} placeholder="e.g. JSS 2, Primary 5" />
                    </div>
                  )}
                  <div className={isSchool ? "sm:col-span-2" : ""}>
                    <label className={labelCls} htmlFor="r-loc">School location {isSchool && "*"}</label>
                    <input id="r-loc" className={inputCls} value={v.schoolLocation} onChange={(e) => set("schoolLocation", e.target.value)} placeholder="City, State, Country" />
                  </div>
                  {isSchool && (
                    <div className="sm:col-span-2">
                      <label className={labelCls} htmlFor="r-notes">Estimated number of students & any notes</label>
                      <textarea id="r-notes" rows={3} className={cn(inputCls, "resize-y")} value={v.notes} onChange={(e) => set("notes", e.target.value)} placeholder="e.g. 25 students across JSS1–SS2" />
                    </div>
                  )}
                </fieldset>
              )}

              {isStudent && isMinor && (
                <fieldset className="grid gap-5 rounded-3xl border border-sun-300 bg-sun-50/60 p-5 sm:grid-cols-2 sm:p-6">
                  <legend className="h3 mb-2 px-2 text-navy-900">Parent / Guardian</legend>
                  <div>
                    <label className={labelCls} htmlFor="r-gname">Parent/Guardian name *</label>
                    <input id="r-gname" className={inputCls} value={v.guardianName} onChange={(e) => set("guardianName", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="r-gphone">Phone number *</label>
                    <input id="r-gphone" type="tel" className={inputCls} value={v.guardianPhone} onChange={(e) => set("guardianPhone", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="r-gemail">Email</label>
                    <input id="r-gemail" type="email" className={inputCls} value={v.guardianEmail} onChange={(e) => set("guardianEmail", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="r-grel">Relationship to participant</label>
                    <select id="r-grel" className={selectCls} value={v.guardianRelationship} onChange={(e) => set("guardianRelationship", e.target.value)}>
                      <option value="">Select</option>
                      <option>Mother</option>
                      <option>Father</option>
                      <option>Guardian</option>
                      <option>Teacher</option>
                      <option>Other</option>
                    </select>
                  </div>
                </fieldset>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-6">
              <h3 className="h3 text-navy-900">Review & confirm</h3>
              <dl className="grid gap-x-8 gap-y-3 rounded-3xl border border-navy-900/10 bg-navy-50/50 p-6 text-sm sm:grid-cols-2">
                {[
                  ["Registering as", registrationTypes.find((t) => t.value === v.type)?.label],
                  ["Programme", programmes.find((p) => p.slug === v.programme)?.name || "—"],
                  ["Event", events.find((e) => e.slug === v.event)?.title || "—"],
                  ["Category", v.category || "—"],
                  ["Format", v.format || "—"],
                  ["Name", v.fullName],
                  ["Email", v.email],
                  ["Phone", v.phone],
                  ["School", v.schoolName || "—"],
                  ["Class / Grade", v.grade || "—"],
                  ["Guardian", v.guardianName ? `${v.guardianName} (${v.guardianPhone})` : "—"],
                  ["Role", v.role || "—"],
                ].map(([k, val]) => (
                  <div key={k as string} className="flex flex-col border-b border-navy-900/5 pb-2">
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-navy-800/50">{k}</dt>
                    <dd className="font-semibold text-navy-900">{val}</dd>
                  </div>
                ))}
              </dl>
              <div className="rounded-3xl border border-navy-900/10 p-5">
                <p className="text-sm font-bold text-navy-900">Payment</p>
                <p className="mt-1 text-sm text-navy-800/70">Where a registration fee applies, payment details and instructions will be included in your confirmation email. No payment is required to submit this form.</p>
              </div>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-navy-800/80">
                <input type="checkbox" checked={v.consent === "yes"} onChange={(e) => set("consent", e.target.checked ? "yes" : "")} className="mt-1 size-4 accent-navy-800" />
                <span>I confirm the information provided is accurate and I agree to AFRISTEM&apos;s <Link className="link-underline" href="/privacy">Privacy Policy</Link> and <Link className="link-underline" href="/terms">Terms &amp; Conditions</Link>. *</span>
              </label>
              <input type="text" tabIndex={-1} autoComplete="off" className="hidden" value={v.website} onChange={(e) => set("website", e.target.value)} aria-hidden />
              {state === "error" && <p className="text-sm font-semibold text-rose-600">Something went wrong. Please try again.</p>}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Nav buttons */}
      <div className="mt-10 flex items-center justify-between gap-4 border-t border-navy-900/10 pt-6">
        <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="btn-outline btn-sm disabled:opacity-40">
          <ArrowLeft className="size-4" /> Back
        </button>
        {step < steps.length - 1 ? (
          <button type="button" onClick={() => validStep() && setStep((s) => s + 1)} disabled={!validStep()} className="btn-navy disabled:cursor-not-allowed disabled:opacity-50">
            Continue <ArrowRight className="size-4" />
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={!validStep() || state === "loading"} className="btn-primary btn-lg disabled:cursor-not-allowed disabled:opacity-50">
            {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : <><CheckCircle2 className="size-4" /> Submit Registration</>}
          </button>
        )}
      </div>
    </div>
  );
}
