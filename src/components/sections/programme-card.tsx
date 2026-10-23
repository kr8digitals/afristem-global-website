import Link from "next/link";
import { ContentImage as Image } from "@/components/ui/content-image";
import { ArrowRight, Code2, FlaskConical, SpellCheck, Trophy } from "lucide-react";
import type { Programme } from "@/content/programmes";
import type { ProgrammeStatus } from "@/lib/types";

const STATUS_CHIP: Record<ProgrammeStatus, { label: string; cls: string } | null> = {
  open: null,
  "closing-soon": { label: "Closing soon", cls: "bg-amber-400 text-navy-950" },
  closed: { label: "Registration closed", cls: "bg-slate-200 text-slate-700" },
  "coming-soon": { label: "Coming soon", cls: "bg-sky-200 text-navy-950" },
};
import { cn } from "@/lib/utils";

const accentMap = {
  sun: { ring: "group-hover:border-sun-400", glow: "bg-sun-300", chip: "bg-sun-400 text-navy-950", text: "text-sun-600" },
  sky: { ring: "group-hover:border-sky-400", glow: "bg-sky-300", chip: "bg-sky-400 text-navy-950", text: "text-sky-600" },
  mint: { ring: "group-hover:border-teal-400", glow: "bg-teal-300", chip: "bg-teal-400 text-navy-950", text: "text-teal-600" },
  violet: { ring: "group-hover:border-violet-400", glow: "bg-violet-300", chip: "bg-violet-400 text-white", text: "text-violet-600" },
  coral: { ring: "group-hover:border-rose-400", glow: "bg-rose-300", chip: "bg-rose-400 text-white", text: "text-rose-600" },
};

const icons = { spell: SpellCheck, code: Code2, trophy: Trophy, flask: FlaskConical };

export function ProgrammeCard({ programme: p, index = 0 }: { programme: Programme & { status?: ProgrammeStatus }; index?: number }) {
  const a = accentMap[p.accent] ?? accentMap.sun;
  const Ico = icons[p.icon] ?? Trophy;
  const chip = p.status ? STATUS_CHIP[p.status] : null;
  return (
    <Link href={`/programmes/${p.slug}`} className={cn("group card relative flex h-full flex-col overflow-hidden border-2 border-transparent transition-all duration-500 hover:-translate-y-1.5 hover:shadow-card-lg", a.ring)}>
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image src={p.image} alt={p.imageAlt} fill sizes="(min-width:768px) 45vw, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-110" priority={index < 2} />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/10 to-transparent" />
        <div className="absolute left-5 top-5 flex items-center gap-2">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider shadow-card", a.chip)}>
            <Ico className="size-3.5" /> {p.pillar}
          </span>
          {chip ? <span className={cn("rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider shadow-card", chip.cls)}>{chip.label}</span> : null}
        </div>
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <h3 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">{p.name}</h3>
          <p className="mt-1 text-sm font-semibold text-white/80">{p.subtitle}</p>
        </div>
      </div>
      <div className="relative flex flex-1 flex-col p-6">
        <div className={cn("pointer-events-none absolute -right-12 -top-12 size-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-60", a.glow)} aria-hidden />
        <p className={cn("relative text-sm font-bold italic", a.text)}>&ldquo;{p.tagline}&rdquo;</p>
        <p className="relative mt-3 flex-1 text-navy-800/70 leading-relaxed">{p.shortDescription}{p.description[0] && p.description[0] !== p.shortDescription ? ` ${p.description[0]}` : ""}</p>
        <div className="relative mt-6 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {p.highlights.slice(0, 2).map((h) => (
              <span key={h.label} className="rounded-full bg-navy-50 px-2.5 py-1 text-[11px] font-bold text-navy-800">{h.value}</span>
            ))}
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-bold text-navy-900">
            Explore <span className="inline-flex size-8 items-center justify-center rounded-full bg-navy-50 transition-all group-hover:translate-x-1 group-hover:bg-sun-400"><ArrowRight className="size-4" /></span>
          </span>
        </div>
      </div>
    </Link>
  );
}
