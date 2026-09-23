import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion";
import type { ReactNode } from "react";

/* ---------- Section header ---------- */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  dark = false,
  className,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  dark?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Reveal className={cn("mb-12 sm:mb-16", align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl", className)}>
      {eyebrow && <span className={cn("mb-5", dark ? "eyebrow-dark" : "eyebrow")}>{eyebrow}</span>}
      <h2 className={cn("h2 text-balance", dark ? "text-white" : "text-navy-900")}>{title}</h2>
      {description && <p className={cn("lead mt-5", dark && "text-white/70")}>{description}</p>}
      {children}
    </Reveal>
  );
}

/* ---------- Page hero (inner pages) ---------- */
export function PageHero({
  eyebrow,
  title,
  description,
  image,
  children,
  compact = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  image?: string;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={cn("relative overflow-hidden bg-navy-900 text-white noise", compact ? "pb-16 pt-[calc(9.5rem+var(--ann-h,0px))] sm:pb-20 sm:pt-[calc(11rem+var(--ann-h,0px))]" : "pb-20 pt-[calc(9.5rem+var(--ann-h,0px))] sm:pb-28 sm:pt-[calc(12rem+var(--ann-h,0px))]")}>
      <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
      {image && (
        <div className="absolute inset-0" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="size-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-900/85 to-navy-900/40" />
        </div>
      )}
      <div className="pointer-events-none absolute -right-40 -top-40 size-[34rem] rounded-full bg-sun-400/20 blur-[120px] animate-blob" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 -left-20 size-[28rem] rounded-full bg-navy-400/30 blur-[120px] animate-blob [animation-delay:-6s]" aria-hidden />
      <div className="container-x relative">
        <div className="max-w-3xl">
          {eyebrow && (
            <Reveal delay={0.05}>
              <span className="eyebrow-dark mb-6">{eyebrow}</span>
            </Reveal>
          )}
          <Reveal delay={0.12}>
            <h1 className="h1 text-balance">{title}</h1>
          </Reveal>
          {description && (
            <Reveal delay={0.22}>
              <p className="lead mt-6 text-white/75">{description}</p>
            </Reveal>
          )}
          {children && (
            <Reveal delay={0.32}>
              <div className="mt-9 flex flex-wrap gap-4">{children}</div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- Arrow link ---------- */
export function ArrowLink({ href, children, className, external = false, light = false }: { href: string; children: ReactNode; className?: string; external?: boolean; light?: boolean }) {
  const Ico = external ? ArrowUpRight : ArrowRight;
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn("group/link inline-flex items-center gap-2 text-sm font-bold", light ? "text-sun-300 hover:text-sun-200" : "text-navy-800 hover:text-navy-600", className)}
    >
      {children}
      <span className={cn("inline-flex size-7 items-center justify-center rounded-full transition-all duration-300 group-hover/link:translate-x-1", light ? "bg-white/10" : "bg-navy-50 group-hover/link:bg-sun-400")}>
        <Ico className="size-3.5" />
      </span>
    </Link>
  );
}

/* ---------- Big CTA band ---------- */
export function CTABand({
  title = "Ready to Learn, Compete, Build and Innovate?",
  description = "Whether you are a learner, school, educator, STEM professional or organisation, there is a place for you in the AFRISTEM ecosystem.",
  primary = { label: "Register Now", href: "/register" },
  secondary = { label: "Partner With Us", href: "/partners" },
}: {
  title?: string;
  description?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="container-x py-10 sm:py-16">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-navy-900 px-6 py-16 text-center text-white sm:px-12 sm:py-20 noise">
          <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
          <div className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-sun-400/30 blur-[100px] animate-blob" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-navy-400/40 blur-[100px] animate-blob [animation-delay:-7s]" aria-hidden />
          {/* floating shapes */}
          <div className="pointer-events-none absolute left-[8%] top-[18%] hidden size-14 rotate-12 rounded-2xl border-2 border-sun-400/50 animate-float lg:block" aria-hidden />
          <div className="pointer-events-none absolute right-[10%] top-[22%] hidden size-8 rounded-full bg-sun-400 animate-float-slow lg:block" aria-hidden />
          <div className="pointer-events-none absolute bottom-[20%] left-[16%] hidden size-6 rounded-full border-2 border-white/40 animate-float-slow lg:block" aria-hidden />
          <div className="pointer-events-none absolute bottom-[16%] right-[18%] hidden size-16 rounded-full border-2 border-white/20 animate-float lg:block" aria-hidden />
          <div className="relative mx-auto max-w-3xl">
            <h2 className="h2 text-balance">{title}</h2>
            <p className="lead mx-auto mt-5 max-w-2xl text-white/70">{description}</p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link href={primary.href} className="btn-primary btn-lg">
                {primary.label} <ArrowRight className="size-4" />
              </Link>
              <Link href={secondary.href} className="btn-ghost-light btn-lg">
                {secondary.label}
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- Pill / tag ---------- */
export function Pill({ children, className, tone = "navy" }: { children: ReactNode; className?: string; tone?: "navy" | "sun" | "white" | "mint" | "coral" | "sky" | "violet" }) {
  const tones = {
    navy: "bg-navy-50 text-navy-800 border-navy-100",
    sun: "bg-sun-100 text-sun-700 border-sun-200",
    white: "bg-white/15 text-white border-white/20",
    mint: "bg-teal-50 text-teal-700 border-teal-100",
    coral: "bg-rose-50 text-rose-700 border-rose-100",
    sky: "bg-sky-50 text-sky-700 border-sky-100",
    violet: "bg-violet-50 text-violet-700 border-violet-100",
  };
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider", tones[tone], className)}>{children}</span>;
}

/* ---------- Check list ---------- */
export function CheckList({ items, className, columns = 1 }: { items: readonly string[]; className?: string; columns?: 1 | 2 | 3 }) {
  return (
    <ul className={cn("grid gap-3", columns === 2 && "sm:grid-cols-2", columns === 3 && "sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((it) => (
        <li key={it} className="flex items-start gap-3 text-navy-800/85">
          <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-sun-400 text-navy-950">
            <svg viewBox="0 0 20 20" fill="none" className="size-3.5" aria-hidden>
              <path d="M5 10.5l3 3 7-7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="leading-relaxed">{it}</span>
        </li>
      ))}
    </ul>
  );
}
