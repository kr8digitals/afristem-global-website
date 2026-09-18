"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { site } from "@/content/site";
import { WhatsAppIcon } from "@/components/ui/brand-icons";

export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    const t = setTimeout(() => setHint(true), 6000);
    const t2 = setTimeout(() => setHint(false), 14000);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
      <AnimatePresence>
        {showTop && (
          <motion.button
            key="top"
            type="button"
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 10 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="inline-flex size-11 items-center justify-center rounded-full border border-navy-900/10 bg-white text-navy-900 shadow-card transition-colors hover:bg-navy-50"
          >
            <ArrowUp className="size-4" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="relative flex items-center gap-3">
        <AnimatePresence>
          {hint && (
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="hidden rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 shadow-card-lg sm:block">
              Questions? Chat with us 👋
            </motion.div>
          )}
        </AnimatePresence>
        <a
          href={site.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with AFRISTEM on WhatsApp"
          className="group relative inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgb(37_211_102/0.7)] transition-transform hover:scale-110"
        >
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse-ring" aria-hidden />
          <WhatsAppIcon className="relative size-7" />
        </a>
      </div>
    </div>
  );
}
