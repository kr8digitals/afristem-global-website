"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, X, Phone } from "lucide-react";
import { navigation, site } from "@/content/site";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  // Every page opens with a dark navy hero, so the header starts in "light" (white text) mode
  const heroDark = true;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes (derived-state pattern)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const light = !scrolled && heroDark && !open;

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-sun-400 via-sun-300 to-sun-500" style={{ scaleX: progress }} aria-hidden />

      <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-500", scrolled ? "py-2.5" : "py-4 sm:py-5")}>
        <div className="container-x">
          <div
            className={cn(
              "flex items-center justify-between gap-4 rounded-full px-3 pl-4 transition-all duration-500 sm:pl-5",
              scrolled ? "glass shadow-card border border-white/60 py-2" : "py-1.5",
            )}
          >
            {/* Logo */}
            <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="AFRISTEM home">
              <div className={cn("relative rounded-2xl p-1 transition-all duration-500", light ? "bg-white" : "bg-transparent")}>
                <Image src="/images/brand/logo.png" alt="AFRISTEM" width={150} height={92} priority className={cn("h-auto transition-all duration-500", scrolled ? "w-[104px] sm:w-[116px]" : "w-[118px] sm:w-[140px]")} />
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
              {navigation.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.split("#")[0]) || item.children?.some((c) => pathname.startsWith(c.href.split("#")[0]) && c.href !== "/");
                return (
                  <div key={item.label} className="group/nav relative">
                    <Link
                      href={item.href}
                      className={cn(
                        "relative inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-semibold transition-colors duration-300",
                        light ? "text-white/85 hover:text-white" : "text-navy-800 hover:text-navy-600",
                        active && (light ? "text-sun-300" : "text-navy-600"),
                      )}
                    >
                      {item.label}
                      {item.children && <ChevronDown className="size-3.5 transition-transform duration-300 group-hover/nav:rotate-180" />}
                      {active && <span className={cn("absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full", light ? "bg-sun-400" : "bg-sun-500")} />}
                    </Link>

                    {item.children && (
                      <div className="pointer-events-none absolute left-1/2 top-full z-50 pt-3 opacity-0 transition-all duration-300 -translate-x-1/2 translate-y-2 group-hover/nav:pointer-events-auto group-hover/nav:translate-y-0 group-hover/nav:opacity-100 group-focus-within/nav:pointer-events-auto group-focus-within/nav:translate-y-0 group-focus-within/nav:opacity-100">
                        <div className="w-[22rem] overflow-hidden rounded-3xl border border-navy-900/5 bg-white p-2 shadow-card-lg">
                          {item.children.map((c) => (
                            <Link key={c.href} href={c.href} className="group/item flex items-start gap-3 rounded-2xl px-3.5 py-3 transition-colors hover:bg-navy-50">
                              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-sun-400 transition-transform group-hover/item:scale-150" />
                              <span>
                                <span className="block text-sm font-bold text-navy-900">{c.label}</span>
                                {c.description && <span className="block text-xs text-navy-800/60">{c.description}</span>}
                              </span>
                              <ArrowRight className="ml-auto mt-1 size-4 shrink-0 -translate-x-1 text-navy-300 opacity-0 transition-all group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* CTA + burger */}
            <div className="flex items-center gap-2">
              <a href={site.phoneHref} className={cn("hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition-colors lg:inline-flex xl:hidden 2xl:inline-flex", light ? "text-white/85 hover:text-white" : "text-navy-800 hover:text-navy-600")}>
                <Phone className="size-3.5" /> {site.phone}
              </a>
              <Link href="/register" className="btn-primary btn-sm hidden whitespace-nowrap sm:inline-flex">
                Register Now <ArrowRight className="size-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                className={cn("inline-flex size-11 items-center justify-center rounded-full transition-colors xl:hidden", light ? "bg-white/10 text-white hover:bg-white/20" : "bg-navy-50 text-navy-900 hover:bg-navy-100")}
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-navy-950/95 text-white backdrop-blur-xl xl:hidden"
          >
            <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
            <div className="pointer-events-none absolute -right-24 top-20 size-72 rounded-full bg-sun-400/25 blur-[90px]" aria-hidden />
            <motion.nav
              className="relative flex h-full flex-col overflow-y-auto px-6 pb-10 pt-28"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
              aria-label="Mobile"
            >
              {navigation.map((item) => (
                <motion.div key={item.label} variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }} className="border-b border-white/10">
                  {item.children ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setMobileExpanded((v) => (v === item.label ? null : item.label))}
                        className="flex w-full items-center justify-between py-4 text-left font-display text-2xl font-bold"
                        aria-expanded={mobileExpanded === item.label}
                      >
                        {item.label}
                        <ChevronDown className={cn("size-5 transition-transform", mobileExpanded === item.label && "rotate-180")} />
                      </button>
                      <AnimatePresence initial={false}>
                        {mobileExpanded === item.label && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="flex flex-col gap-1 pb-4 pl-3">
                              {item.children.map((c) => (
                                <Link key={c.href} href={c.href} className="rounded-xl px-3 py-2.5 text-base text-white/80 hover:bg-white/10 hover:text-white">
                                  {c.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link href={item.href} className="block py-4 font-display text-2xl font-bold">
                      {item.label}
                    </Link>
                  )}
                </motion.div>
              ))}
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="mt-8 flex flex-col gap-3">
                <Link href="/register" className="btn-primary btn-lg w-full">
                  Register Now <ArrowRight className="size-4" />
                </Link>
                <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-ghost-light w-full">
                  Chat on WhatsApp
                </a>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
