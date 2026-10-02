import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Check } from "lucide-react";

type Props = {
  eyebrow: string;
  title: string;
  intro: string;
  bullets: string[];
  goal?: string;
  note?: string;
  image?: string;
  ctaLabel?: string;
  ctaHref?: string;
  reverse?: boolean;
};

/**
 * Editorial feature used to spotlight a resource (currently the STEM Guide for
 * Schools). Keeps long-form announcement copy readable instead of burying it in
 * a paragraph block.
 */
export function ResourceSpotlight({
  eyebrow,
  title,
  intro,
  bullets,
  goal,
  note,
  image = "/images/awards/duo-certificates.jpg",
  ctaLabel = "Find out more",
  ctaHref = "/contact",
  reverse = false,
}: Props) {
  return (
    <section className="relative overflow-x-clip bg-navy-50/60 py-16 sm:py-24">
      <div className="container-x">
        <div className={cnGrid(reverse)}>
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-sun-400/25 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-navy-800">
              <BookOpen className="size-3.5" />
              {eyebrow}
            </span>
            <h2 className="h2 mt-4 text-navy-950">{title}</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-navy-800/75 sm:text-base">{intro}</p>

            <ul className="mt-6 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-[14.5px] leading-snug text-navy-900/85">
                  <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-sun-400 text-navy-950">
                    <Check className="size-2.5" strokeWidth={3.5} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            {goal && (
              <p className="mt-6 rounded-2xl border-l-4 border-sun-400 bg-white px-5 py-4 font-display text-[15px] font-bold italic leading-snug text-navy-900 shadow-card sm:text-base">
                {goal}
              </p>
            )}

            {note && <p className="mt-4 text-sm leading-relaxed text-navy-800/65">{note}</p>}

            <Link href={ctaHref} className="btn-primary mt-7 inline-flex">
              {ctaLabel} <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="relative mt-10 min-w-0 lg:mt-0">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-card-lg">
              <Image src={image} alt={title} fill sizes="(min-width:1024px) 40vw, 90vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-4 left-4 right-4 rounded-2xl bg-navy-900 px-5 py-3.5 text-white shadow-card-lg">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-sun-300">Compiled by</p>
              <p className="font-display text-sm font-bold">Prime STEM Nigeria</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function cnGrid(reverse: boolean) {
  return `grid items-center gap-10 lg:grid-cols-2 lg:gap-14 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`;
}
