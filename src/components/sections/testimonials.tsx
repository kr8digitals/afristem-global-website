"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

type T = { quote: string; name: string; role: string; initials: string };

export function Testimonials({ items }: { items: T[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [paused, items.length]);

  const t = items[i];
  return (
    <div className="mx-auto max-w-4xl" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative min-h-[16rem] rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur sm:p-12">
        <Quote className="absolute right-8 top-8 size-16 text-sun-400/20" aria-hidden />
        <AnimatePresence mode="wait">
          <motion.figure key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.45 }}>
            <blockquote className="font-display text-xl font-semibold leading-relaxed sm:text-2xl lg:text-[1.7rem]">&ldquo;{t.quote}&rdquo;</blockquote>
            <figcaption className="mt-8 flex items-center gap-4">
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-sun-400 font-display text-sm font-extrabold text-navy-950">{t.initials}</span>
              <span>
                <span className="block font-bold">{t.name}</span>
                <span className="block text-sm text-white/60">{t.role}</span>
              </span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-2">
          {items.map((_, k) => (
            <button key={k} type="button" aria-label={`Show testimonial ${k + 1}`} onClick={() => setI(k)} className={cn("h-2 rounded-full transition-all duration-300", k === i ? "w-8 bg-sun-400" : "w-2 bg-white/25 hover:bg-white/50")} />
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" aria-label="Previous" onClick={() => setI((v) => (v - 1 + items.length) % items.length)} className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-white/10"><ChevronLeft className="size-5" /></button>
          <button type="button" aria-label="Next" onClick={() => setI((v) => (v + 1) % items.length)} className="inline-flex size-11 items-center justify-center rounded-full bg-sun-400 text-navy-950 transition-colors hover:bg-sun-300"><ChevronRight className="size-5" /></button>
        </div>
      </div>
    </div>
  );
}
