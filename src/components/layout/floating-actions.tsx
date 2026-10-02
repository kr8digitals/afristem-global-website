"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { cn } from "@/lib/utils";

const DEFAULT_WHATSAPP = "+2348105541242";
const digits = (v: string) => v.replace(/[^0-9]/g, "");
const DEFAULT_PHONE = "+234 813 825 8491";

export function FloatingActions({ whatsapp = DEFAULT_WHATSAPP, phone = DEFAULT_PHONE }: { whatsapp?: string; phone?: string }) {
  const [showTop, setShowTop] = useState(false);
  const [visible, setVisible] = useState(false);
  const waHref = `https://wa.me/${digits(whatsapp)}`;
  const [hint, setHint] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 600);
      // keep the hero completely clean — the quick-contact buttons fade in as
      // soon as the visitor starts scrolling past the call-to-action buttons
      setVisible(window.scrollY > 90);
    };
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
    <div
      className={cn(
        "fixed bottom-5 right-4 z-40 flex flex-col items-end gap-2.5 transition-all duration-500 sm:bottom-7 sm:right-7 sm:gap-3",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
      aria-hidden={!visible}
    >
      <span className="sr-only">Quick contact</span>
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

      {/* quick call button — mobile first */}
      <a
        href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
        aria-label={`Call AFRISTEM on ${phone}`}
        className="inline-flex size-10 items-center justify-center rounded-full border border-navy-900/10 bg-white text-navy-900 shadow-card transition-colors hover:bg-navy-50 sm:size-11 lg:hidden"
      >
        <Phone className="size-4" />
      </a>

      <div className="relative flex items-center gap-3">
        <AnimatePresence>
          {hint && (
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="hidden rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 shadow-card-lg sm:block">
              Questions? Chat with us 👋
            </motion.div>
          )}
        </AnimatePresence>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with AFRISTEM on WhatsApp"
          className="group relative inline-flex size-[3.25rem] items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgb(37_211_102/0.7)] transition-transform hover:scale-110 sm:size-14"
        >
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse-ring" aria-hidden />
          <WhatsAppIcon className="relative size-6 sm:size-7" />
        </a>
      </div>
    </div>
  );
}
