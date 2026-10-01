"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Atom, Binary, FlaskConical, Sigma, Sparkles, Trophy, Award } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SplitWords, Magnetic } from "@/components/ui/motion";
import { stats as fallbackStats } from "@/content/site";
import type { HeroContent, StatItem } from "@/lib/store";
import { parseStat } from "@/lib/utils";
import { cn } from "@/lib/utils";

const DEFAULT_ROTATING = ["Scientists", "Engineers", "Technologists", "Innovators", "Coders", "Problem-Solvers"];

/** Below this width the hero switches to its single-column, no-parallax layout. */
const DESKTOP_QUERY = "(min-width: 1024px)";

export function Hero({ hero, stats: liveStats }: { hero?: HeroContent; stats?: StatItem[] }) {
  const rotating = hero?.rotatingWords?.length ? hero.rotatingWords : DEFAULT_ROTATING;
  const stats = liveStats?.length
    ? liveStats.map((s) => ({ display: s.value, ...parseStat(s.value) }))
    : fallbackStats.map((s) => ({ display: `${s.value.toLocaleString()}${s.suffix}`, count: s.value, suffix: s.suffix }));
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yImg = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [idx, setIdx] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % rotating.length), 2400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Parallax is a desktop flourish. On phones it slides the copy and the picture
  // apart while you scroll, which reads as broken — so it stays off there.
  const parallax = isDesktop && !reduce;

  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-navy-950 text-white noise">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgb(36_80_216/0.55),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgb(255_196_45/0.22),transparent_50%)]" aria-hidden />
      <div className="absolute inset-0 bg-grid opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" aria-hidden />
      <div className="pointer-events-none absolute -left-40 top-24 size-[36rem] rounded-full bg-navy-500/40 blur-[130px] animate-blob" aria-hidden />
      <div className="pointer-events-none absolute -right-32 top-1/3 size-[30rem] rounded-full bg-sun-400/25 blur-[130px] animate-blob [animation-delay:-5s]" aria-hidden />

      {/* Floating STEM glyphs — desktop only, they crowd the phone layout */}
      {!reduce && (
        <>
          <FloatingGlyph className="left-[4%] top-[30%] hidden xl:flex" delay={0}><Atom className="size-6" /></FloatingGlyph>
          <FloatingGlyph className="left-[3%] top-[62%] hidden xl:flex" delay={1.2} tone="sun"><Sigma className="size-6" /></FloatingGlyph>
          <FloatingGlyph className="right-[8%] top-[18%] hidden lg:flex" delay={0.6} tone="sun"><Binary className="size-6" /></FloatingGlyph>
          <FloatingGlyph className="right-[42%] bottom-[10%] hidden xl:flex" delay={1.8}><FlaskConical className="size-6" /></FloatingGlyph>
        </>
      )}

      <div className="container-x relative flex flex-col gap-9 pb-16 pt-[calc(var(--header-h,13rem)+1.5rem)] sm:gap-12 sm:pb-20 sm:pt-[calc(var(--header-h,13rem)+2rem)] lg:grid lg:min-h-[100svh] lg:grid-cols-12 lg:items-center lg:gap-8 lg:pb-28 lg:pt-[calc(var(--header-h,13rem)+2.5rem)]">
        {/* ---------------------------------------------------------------- copy */}
        <motion.div style={parallax ? { y: yText, opacity } : undefined} className="relative z-10 lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1.5 pl-1.5 pr-3 text-[13px] font-semibold backdrop-blur sm:mb-7 sm:pr-4"
          >
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sun-400 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-navy-950 sm:text-[11px]">
              <Sparkles className="size-3" /> {hero?.badgeLabel ?? "New"}
            </span>
            <span className="min-w-0 truncate text-white/85 sm:whitespace-normal">{hero?.badgeText ?? "STEM Kids Championship Int'l Edition · Nov 14, 2026"}</span>
            <Link href="/events" className="hidden shrink-0 whitespace-nowrap text-sun-300 hover:text-sun-200 sm:inline">Details →</Link>
          </motion.div>

          <h1 className="h-display-hero text-balance">
            <SplitWords text={hero?.headline ?? "Inspiring Africa's Next Generation of"} delay={0.15} />
            <span className="mt-0.5 block h-[1.1em] overflow-hidden lg:mt-1">
              <motion.span
                key={idx}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="text-gradient-sun inline-block"
              >
                {rotating[idx]}.
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="lead-hero mt-5 max-w-xl text-white/80 sm:mt-7"
          >
            AFRISTEM creates exciting opportunities for young people to learn, compete, build and innovate through STEM education, competitions, technology, training and strategic partnerships.
          </motion.p>

          {/* CTAs — full width and thumb-sized on phones */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="mt-7 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
          >
            <Magnetic className="w-full sm:w-auto">
              <Link href={hero?.primaryCtaHref ?? "/programmes"} className="btn-primary btn-lg w-full sm:w-auto">
                {hero?.primaryCtaLabel ?? "Explore Our Programmes"} <ArrowRight className="size-4" />
              </Link>
            </Magnetic>
            <Magnetic className="w-full sm:w-auto">
              <Link href={hero?.secondaryCtaHref ?? "/partners"} className="btn-ghost-light btn-lg w-full sm:w-auto">
                {hero?.secondaryCtaLabel ?? "Partner With Us"}
              </Link>
            </Magnetic>
          </motion.div>

          {/* Trust strip — the visual bridge between the copy and the picture */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-[13px] text-white/70 sm:mt-12 sm:gap-x-8 sm:text-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2.5">
                {["bg-sun-400", "bg-coral-400", "bg-mint-400", "bg-violet-400"].map((c, i) => (
                  <span key={i} className={cn("inline-flex size-8 items-center justify-center rounded-full border-2 border-navy-950 text-[10px] font-black text-navy-950", c)}>
                    {["S", "T", "E", "M"][i]}
                  </span>
                ))}
              </div>
              <span><strong className="font-bold text-white">{stats[0]?.display ?? ""}</strong> students reached</span>
            </div>
            <div className="hidden h-4 w-px bg-white/15 sm:block" />
            <span><strong className="font-bold text-white">{stats[1]?.display ?? ""}</strong> schools across Africa</span>
            <div className="hidden h-4 w-px bg-white/15 sm:block" />
            <span className="inline-flex items-center gap-1.5"><Trophy className="size-4 text-sun-400" /> 4 flagship competitions</span>
          </motion.div>
        </motion.div>

        {/* ------------------------------------------------------------ visual */}
        <motion.div style={parallax ? { y: yImg } : undefined} className="relative lg:col-span-5">
          {/* ---- phone & tablet: one clean full-bleed panel, nothing floating over it ---- */}
          <div className="lg:hidden">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative -mx-5 overflow-hidden rounded-none border-y border-white/10 shadow-card-lg sm:mx-0 sm:rounded-[2rem] sm:border sm:border-white/10"
            >
              <div className="relative aspect-[6/5] w-full sm:aspect-[16/11]">
                <Image
                  src={hero?.featureImage ?? "/images/awards/trio-medals.jpg"}
                  alt="Students celebrating at an AFRISTEM awards ceremony"
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/45 to-transparent" />
              </div>

              {/* caption bar pinned inside the image, sized to read on a phone */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sun-300">
                    {hero?.featureEyebrow ?? "AFRISTEM Awards"}
                  </p>
                  <p className="mt-1 font-display text-[19px] font-extrabold leading-tight sm:text-2xl">
                    {hero?.featureCaption ?? "Celebrating Africa's brightest young minds"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ribbon: gives the picture somewhere to belong */}
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-sm sm:mt-5">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-sun-400 text-navy-950">
                <Award className="size-5" />
              </span>
              <p className="text-[13px] leading-snug text-white/75">
                <span className="font-bold text-white">{hero?.featureCaption ?? "Winners of the 2025 Nigerian STEM Championship"}</span>{" "}
                celebrate in Abuja.
              </p>
            </div>
          </div>

          {/* ---- desktop: layered collage as before ---- */}
          <div className="relative hidden lg:block">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[30rem]">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-6 bottom-16 top-0 overflow-hidden rounded-[2rem] border border-white/10 shadow-card-lg"
              >
                <Image src={hero?.featureImage ?? "/images/awards/trio-medals.jpg"} alt="Students celebrating at an AFRISTEM awards ceremony" fill priority sizes="40vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-navy-950/85 via-navy-950/10 to-navy-950/45" />
                <div className="absolute left-5 right-5 top-5 rounded-2xl bg-navy-950/45 p-4 ring-1 ring-inset ring-white/12 backdrop-blur-md">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sun-300">{hero?.featureEyebrow ?? "AFRISTEM Awards"}</p>
                  <p className="mt-1 font-display text-base font-bold leading-snug">{hero?.featureCaption ?? "Celebrating Africa's brightest young minds"}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -right-2 bottom-0 w-[58%] overflow-hidden rounded-3xl border-4 border-navy-950 shadow-card-lg animate-float-slow sm:-right-6"
              >
                <div className="relative aspect-[4/3]">
                  <Image src={hero?.secondaryImage ?? "/images/awards/certificate-lineup.jpg"} alt="STEM Kids Championship winners" fill sizes="25vw" className="object-cover" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="absolute -left-2 top-[42%] flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 text-navy-950 shadow-card-lg animate-float sm:-left-8"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-sun-400">
                  <Trophy className="size-5" />
                </span>
                <div>
                  <p className="font-display text-xl font-extrabold leading-none">840+</p>
                  <p className="text-[11px] font-semibold text-navy-800/60">Schools competing</p>
                </div>
              </motion.div>

              <div className="pointer-events-none absolute -bottom-16 -left-16 -z-10 size-40 rounded-full border-[14px] border-dashed border-sun-400/30 animate-spin-slow" aria-hidden />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue — desktop only */}
      <motion.div style={parallax ? { opacity } : undefined} className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 lg:flex">
        Scroll
        <span className="relative h-10 w-px overflow-hidden bg-white/15">
          <motion.span className="absolute inset-x-0 top-0 h-4 bg-sun-400" animate={{ y: [-16, 40] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
        </span>
      </motion.div>
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
