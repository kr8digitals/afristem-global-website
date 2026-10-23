"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { contactCategories } from "@/content/data";
import { cn } from "@/lib/utils";

const inputCls = "h-13 w-full rounded-2xl border border-navy-900/10 bg-white px-4 py-3.5 text-navy-900 placeholder:text-navy-800/40 transition-all focus:border-navy-500 focus:outline-none focus:ring-4 focus:ring-navy-500/10";
const labelCls = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy-800/70";

export function ContactForm({ defaultSubject = "" }: { defaultSubject?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    organisation: "",
    category: "",
    subject: defaultSubject,
    message: "",
    website: "", // honeypot
  });

  function set<K extends keyof typeof values>(k: K, v: string) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) throw new Error(data.error || "");
      setState("done");
    } catch (err) {
      setError((err as Error).message);
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-14 text-center">
        <span className="inline-flex size-16 items-center justify-center rounded-full bg-emerald-500 text-white">
          <CheckCircle2 className="size-8" />
        </span>
        <h3 className="font-display text-2xl font-bold text-navy-900">Message sent!</h3>
        <p className="max-w-md text-navy-800/70">Thank you, {values.name.split(" ")[0]}. The AFRISTEM team will get back to you within 1–2 working days.</p>
        <button type="button" className="btn-outline btn-sm mt-2" onClick={() => { setState("idle"); setValues((v) => ({ ...v, message: "", subject: "" })); }}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
      <div>
        <label className={labelCls} htmlFor="c-name">Full name *</label>
        <input id="c-name" required className={inputCls} placeholder="Adaeze Okafor" value={values.name} onChange={(e) => set("name", e.target.value)} />
      </div>
      <div>
        <label className={labelCls} htmlFor="c-email">Email address *</label>
        <input id="c-email" type="email" required className={inputCls} placeholder="you@example.com" value={values.email} onChange={(e) => set("email", e.target.value)} />
      </div>
      <div>
        <label className={labelCls} htmlFor="c-phone">Phone number</label>
        <input id="c-phone" type="tel" className={inputCls} placeholder="+234 800 000 0000" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
      </div>
      <div>
        <label className={labelCls} htmlFor="c-org">Organisation / School</label>
        <input id="c-org" className={inputCls} placeholder="Bright Future Academy" value={values.organisation} onChange={(e) => set("organisation", e.target.value)} />
      </div>
      <div>
        <label className={labelCls} htmlFor="c-cat">I am a… *</label>
        <select id="c-cat" required className={cn(inputCls, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%230b2a6f%22 stroke-width=%222.5%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10")} value={values.category} onChange={(e) => set("category", e.target.value)}>
          <option value="" disabled>Select a category</option>
          {contactCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls} htmlFor="c-subject">Subject *</label>
        <input id="c-subject" required className={inputCls} placeholder="How can we help?" value={values.subject} onChange={(e) => set("subject", e.target.value)} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls} htmlFor="c-message">Message *</label>
        <textarea id="c-message" required rows={5} className={cn(inputCls, "h-auto resize-y")} placeholder="Tell us a little about what you have in mind…" value={values.message} onChange={(e) => set("message", e.target.value)} />
      </div>
      {/* Honeypot */}
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" value={values.website} onChange={(e) => set("website", e.target.value)} aria-hidden />
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={state === "loading"} className="btn-navy btn-lg disabled:opacity-70">
          {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : <>Send Message <ArrowRight className="size-4" /></>}
        </button>
        {state === "error" && <p className="text-sm font-semibold text-rose-600">{error || "Something went wrong. Please try again or email us directly."}</p>}
        <p className="text-xs text-navy-800/50">We reply within 1–2 working days.</p>
      </div>
    </form>
  );
}
