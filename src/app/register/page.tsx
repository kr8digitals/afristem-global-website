import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { RegistrationForm } from "@/components/forms/registration-form";
import { Reveal } from "@/components/ui/motion";
import { programmes } from "@/content/programmes";

export const metadata: Metadata = { title: "Register", description: "Join an AFRISTEM programme. Ready to learn, compete, build and innovate? Complete the registration form for the programme or event you are interested in." };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ type?: string; programme?: string; event?: string }> }) {
  const sp = await searchParams;
  const selected = programmes.find((p) => p.slug === sp.programme);
  return (
    <section className="relative overflow-hidden bg-navy-950 pb-24 pt-28 noise sm:pt-36">
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
      <div className="pointer-events-none absolute -right-40 -top-40 size-[30rem] rounded-full bg-sun-400/25 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute -left-40 bottom-0 size-[30rem] rounded-full bg-navy-500/40 blur-[120px]" aria-hidden />
      <div className="container-x relative grid gap-10 lg:grid-cols-12">
        <div className="text-white lg:col-span-4">
          <Reveal>
            <span className="eyebrow-dark mb-5">Registration</span>
            <h1 className="h1">Join an AFRISTEM <span className="text-gradient-sun">Programme</span></h1>
            <p className="lead mt-5 text-white/75">Ready to learn, compete, build and innovate? Complete the registration form for the programme or event you are interested in.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="mt-8 space-y-3 text-sm text-white/80">
              {["Takes about 3 minutes", "Automated confirmation by email", "Schools can register multiple students", "Your data is protected"].map((t) => (
                <li key={t} className="flex items-center gap-3"><CheckCircle2 className="size-4 text-sun-400" /> {t}</li>
              ))}
            </ul>
          </Reveal>
          {selected && (
            <Reveal delay={0.15}>
              <div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <p className="text-[11px] font-bold uppercase tracking-widest text-sun-300">Registering for</p>
                <p className="mt-1 font-display text-xl font-bold">{selected.name}</p>
                <p className="text-sm text-white/70">{selected.subtitle}</p>
                <Link href={`/programmes/${selected.slug}`} className="mt-3 inline-block text-sm font-bold text-sun-300 hover:text-sun-200">About this programme →</Link>
              </div>
            </Reveal>
          )}
        </div>
        <Reveal delay={0.1} className="lg:col-span-8">
          <div className="card p-6 sm:p-10">
            <RegistrationForm defaultType={sp.type ?? ""} defaultProgramme={sp.programme ?? ""} defaultEvent={sp.event ?? ""} />
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
