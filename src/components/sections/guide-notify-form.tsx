"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

/** Light-background variant of the newsletter capture, used on the STEM Guide page. */
export function GuideNotifyForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const r = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "stem-guide" }),
      });
      if (!r.ok) throw new Error();
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 px-5 py-4">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
        <p className="text-sm font-semibold text-navy-900">
          You&apos;re on the list. We&apos;ll email you the moment the guide is released.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="guide-email">
        Email address
      </label>
      <input
        id="guide-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@school.edu.ng"
        className="h-13 flex-1 rounded-full border border-navy-900/12 bg-white px-6 py-3.5 text-navy-900 placeholder:text-navy-800/40 focus:border-navy-600 focus:outline-none focus:ring-4 focus:ring-navy-600/10"
      />
      <button type="submit" disabled={state === "loading"} className="btn-primary shrink-0 disabled:opacity-70">
        {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : <>Notify me <ArrowRight className="size-4" /></>}
      </button>
      {state === "error" && <p className="text-sm text-rose-600">Something went wrong. Please try again.</p>}
    </form>
  );
}
