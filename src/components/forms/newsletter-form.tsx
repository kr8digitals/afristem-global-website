"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const r = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (!r.ok) throw new Error();
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-sun-400/40 bg-sun-400/10 px-5 py-4 text-sun-200">
        <CheckCircle2 className="size-5 shrink-0" />
        <p className="text-sm font-semibold">You&apos;re on the list! Watch your inbox for STEM opportunities.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="newsletter-email">Email address</label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@school.edu.ng"
        className="h-14 flex-1 rounded-full border border-white/15 bg-white/10 px-6 text-white placeholder:text-white/40 focus:border-sun-400 focus:bg-white/15 focus:outline-none"
      />
      <button type="submit" disabled={state === "loading"} className="btn-primary h-14 shrink-0 disabled:opacity-70">
        {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : <>Subscribe <ArrowRight className="size-4" /></>}
      </button>
      {state === "error" && <p className="text-sm text-rose-300 sm:absolute sm:mt-16">Something went wrong. Please try again.</p>}
    </form>
  );
}
