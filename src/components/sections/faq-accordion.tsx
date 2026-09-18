"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function FAQAccordion({ items, className }: { items: { q: string; a: string }[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className={cn("divide-y divide-navy-900/10 rounded-3xl border border-navy-900/10 bg-white shadow-card", className)}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`faq-${i}`}
              className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors hover:bg-navy-50/60 sm:px-8"
            >
              <span className={cn("font-display text-base font-bold sm:text-lg", isOpen ? "text-navy-600" : "text-navy-900")}>{it.q}</span>
              <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-300", isOpen ? "rotate-45 bg-sun-400 text-navy-950" : "bg-navy-50 text-navy-800")}>
                <Plus className="size-4" />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div id={`faq-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                  <p className="px-6 pb-6 leading-relaxed text-navy-800/70 sm:px-8">{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
