"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Atom, Binary, FlaskConical, Play, Sigma, Sparkles, Trophy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SplitWords, Magnetic } from "@/components/ui/motion";
import { stats } from "@/content/site";
import { cn } from "@/lib/utils";

const rotating = ["Scientists", "Engineers", "Technologists", "Innovators", "Coders", "Problem-Solvers"];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yImg = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % rotating.length), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-navy-950 text-white noise">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgb(36_80_216/0.55),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgb(255_196_45/0.22),transparent_50%)]" aria-hidden />
      <div className="absolute inset-0 bg-grid opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" aria-hidden />
      <div className="pointer-events-none absolute -left-40 top-24 size-[36rem] rounded-full bg-navy-500/40 blur-[130px] animate-blob" aria-hidden />
      <div className="pointer-events-none absolute -right-32 top-1/3 size-[30rem] rounded-full bg-sun-400/25 blur-[130px] animate-blob [animation-delay:-5s]" aria-hidden />

      {/* Floating STEM glyphs */}
      {!reduce && (
        <>
          <FloatingGlyph className="left-[4%] top-[30%] hidden xl:flex" delay={0}><Atom className="size-6" /></FloatingGlyph>
          <FloatingGlyph className="left-[3%] top-[62%] hidden xl:flex" delay={1.2} tone="sun"><Sigma className="size-6" /></FloatingGlyph>
          <FloatingGlyph className="right-[8%] top-[18%] hidden lg:flex" delay={0.6} tone="sun"><Binary className="size-6" /></FloatingGlyph>
          <FloatingGlyph className="right-[42%] bottom-[10%] hidden xl:flex" delay={1.8}><FlaskConical className="size-6" /></FloatingGlyph>
        </>
      )}

      <div className="container-x relative grid min-h-[100svh] items-center gap-12 pb-20 pt-36 lg:grid-cols-12 lg:gap-8 lg:pb-28 lg:pt-44">
        {/* Copy */}
        <motion.div style={{ y: reduce ? 0 : yText, opacity }} className="relative z-10 lg:col-span-7">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1.5 pl-1.5 pr-4 text-xs font-semibold backdrop-blur">
            <span className="inline-flex items-center gap-1 rounded-full bg-sun-400 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-navy-950">
              <Sparkles className="size-3" /> New
            </span>
            <span className="text-white/85">STEM Kids Championship Int&apos;l Edition · Nov 14, 2026</span>
            <Link href="/events" className="text-sun-300 hover:text-sun-200">Details →</Link>
          </motion.div>

          <h1 className="h-display text-balance">
            <SplitWords text="Inspiring Africa's Next Generation of" delay={0.15} />
            <span className="mt-1 block h-[1.15em] overflow-hidden">
              <motion.span key={idx} initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-100%", opacity: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="text-gradient-sun inline-block">
                {rotating[idx]}.
              </motion.span>
            </span>
          </h1>

          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.7 }} className="lead mt-7 max-w-xl text-white/75">
            AFRISTEM creates exciting opportunities for young people to learn, compete, build and innovate through STEM education, competitions, technology, training and strategic partnerships.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.85 }} className="mt-10 flex flex-wrap items-center gap-4">
            <Magnetic>
              <Link href="/programmes" className="btn-primary btn-lg">
                Explore Our Programmes <ArrowRight className="size-4" />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/partners" className="btn-ghost-light btn-lg">
                Partner With Us
              </Link>
            </Magnetic>
          </motion.div>

          {/* Mini social proof */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.1 }} className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-white/60">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {["bg-sun-400", "bg-coral-400", "bg-mint-400", "bg-violet-400"].map((c, i) => (
                  <span key={i} className={cn("inline-flex size-8 items-center justify-center rounded-full border-2 border-navy-950 text-[10px] font-black text-navy-950", c)}>
                    {["S", "T", "E", "M"][i]}
                  </span>
                ))}
              </div>
              <span><strong className="text-white">{stats[0].value.toLocaleString()}+</strong> students reached</span>
            </div>
            <div className="hidden h-4 w-px bg-white/15 sm:block" />
            <span><strong className="text-white">{stats[1].value}+</strong> schools across Africa</span>
            <div className="hidden h-4 w-px bg-white/15 sm:block" />
            <span className="inline-flex items-center gap-1.5"><Trophy className="size-4 text-sun-400" /> 4 flagship competitions</span>
          </motion.div>
        </motion.div>

        {/* Visual collage */}
        <motion.div style={{ y: reduce ? 0 : yImg }} className="relative lg:col-span-5">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[30rem]">
            {/* Main image */}
            <motion.div initial={{ opacity: 0, scale: 0.92, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-x-6 top-0 bottom-16 overflow-hidden rounded-[2rem] border border-white/10 shadow-card-lg">
              <Image src="/images/photos/chemistry-lab.jpg" alt="Students conducting a chemistry experiment at an AFRISTEM programme" fill priority sizes="(min-width:1024px) 40vw, 90vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-[42%] flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-sun-300">African Organic Chemistry Tournament</p>
                  <p className="mt-1 font-display text-lg font-bold">Hands-on. Head-first.</p>
                </div>
              </div>
            </motion.div>

            {/* Secondary image */}
            <motion.div initial={{ opacity: 0, x: 40, y: 20 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }} className="absolute -right-2 bottom-0 w-[58%] overflow-hidden rounded-3xl border-4 border-navy-950 shadow-card-lg sm:-right-6 animate-float-slow">
              <div className="relative aspect-[4/3]">
                <Image src="/images/photos/championship-winners.jpg" alt="STEM Kids Championship winners" fill sizes="(min-width:1024px) 25vw, 60vw" className="object-cover" />
              </div>
            </motion.div>

            {/* Floating stat card */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.9 }} className="absolute -left-2 top-[18%] flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 text-navy-950 shadow-card-lg sm:-left-8 animate-float">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-sun-400">
                <Trophy className="size-5" />
              </span>
              <div>
                <p className="font-display text-xl font-extrabold leading-none">840+</p>
                <p className="text-[11px] font-semibold text-navy-800/60">Schools competing</p>
              </div>
            </motion.div>

            {/* Play badge */}
            <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 1.2, type: "spring" }} className="absolute left-[36%] top-[42%]">
              <Link href="/gallery#videos" aria-label="Watch programme highlights" className="group relative inline-flex size-16 items-center justify-center rounded-full bg-white/90 text-navy-950 shadow-card-lg backdrop-blur transition-transform hover:scale-110">
                <span className="absolute inset-0 rounded-full bg-white animate-pulse-ring" aria-hidden />
                <Play className="relative ml-0.5 size-6 fill-current" />
              </Link>
            </motion.div>

            {/* Decorative ring */}
            <div className="pointer-events-none absolute -bottom-16 -left-16 -z-10 size-40 rounded-full border-[14px] border-dashed border-sun-400/30 animate-spin-slow" aria-hidden />
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div style={{ opacity }} className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 lg:flex">
        Scroll
        <span className="relative h-10 w-px overflow-hidden bg-white/15">
          <motion.span className="absolute inset-x-0 top-0 h-4 bg-sun-400" animate={{ y: [-16, 40] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
        </span>
      </motion.div>

      {/* Bottom curve into next section */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-white [clip-path:ellipse(60%_100%_at_50%_100%)]" aria-hidden />
    </section>
  );
}

function FloatingGlyph({ children, className, delay = 0, tone = "navy" }: { children: React.ReactNode; className?: string; delay?: number; tone?: "navy" | "sun" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 1.2 + delay }}
      className={cn("pointer-events-none absolute z-10 items-center justify-center rounded-2xl border backdrop-blur-sm animate-float", tone === "sun" ? "border-sun-400/40 bg-sun-400/15 text-sun-300" : "border-white/15 bg-white/10 text-white/80", className)}
      style={{ width: 56, height: 56, animationDelay: `${delay}s` }}
      aria-hidden
    >
      {children}
    </motion.div>
  );
}
