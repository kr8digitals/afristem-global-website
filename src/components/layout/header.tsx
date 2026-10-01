"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowRight, ChevronDown, ExternalLink, Menu, Megaphone, Phone, X } from "lucide-react";
import { navigation } from "@/content/site";
import { cn } from "@/lib/utils";
import type { Announcement } from "@/lib/store";

const TONE: Record<Announcement["tone"], string> = {
  info: "bg-navy-900 text-white",
  success: "bg-emerald-600 text-white",
  warning: "bg-sun-400 text-navy-950",
  urgent: "bg-rose-600 text-white",
};

export function Header({
  announcement,
  contact,
}: {
  announcement?: Announcement | null;
  contact?: { phone: string; whatsapp: string };
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const phone = contact?.phone ?? "+234 813 825 8491";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // every page opens with a dark navy hero, so the header starts in "light" mode
  const heroDark = true;

  // Close the mobile menu whenever the route changes
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

  // Publish the header's real rendered height as --header-h so hero sections can
  // clear it exactly. The announcement strip wraps to two or three lines on a
  // phone, so any hardcoded value is wrong on some device.
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const publish = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--header-h", `${Math.ceil(h)}px`);
    };
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    window.addEventListener("resize", publish);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", publish);
      document.documentElement.style.removeProperty("--header-h");
    };
  }, [announcement]);

  const light = !scrolled && heroDark && !open;
  const isActive = (href: string, children?: { href: string }[]) =>
    href === "/"
      ? pathname === "/"
      : (!href.startsWith("http") && pathname.startsWith(href.split("#")[0])) ||
        Boolean(children?.some((c) => !c.href.startsWith("http") && pathname.startsWith(c.href.split("#")[0])));

  return (
    <>
      <motion.div
        className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-sun-400 via-sun-300 to-sun-500"
        style={{ scaleX: progress }}
        aria-hidden
      />

      <header ref={headerRef} className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-500", scrolled ? "pb-2.5" : "pb-4 sm:pb-5")}>
        {/* Announcement strip — editable in the admin dashboard */}
        {announcement ? (
          <div className={cn("relative text-[12.5px] font-semibold", TONE[announcement.tone] ?? TONE.info)}>
            <div className="container-x flex min-h-[38px] flex-wrap items-center justify-center gap-x-2 gap-y-0.5 py-1.5 text-center">
              <Megaphone className="hidden size-3.5 shrink-0 sm:block" aria-hidden />
              {announcement.label ? (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                  {announcement.label}
                </span>
              ) : null}
              <span className="leading-snug">{announcement.message}</span>
              {announcement.href && announcement.linkLabel ? (
                <Link href={announcement.href} className="inline-flex items-center gap-1 font-bold underline decoration-2 underline-offset-2 hover:no-underline">
                  {announcement.linkLabel} <ArrowRight className="size-3" />
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className={cn("container-x pt-3", scrolled && "pt-2.5")}>
          <div
            className={cn(
              "flex items-center justify-between gap-4 rounded-full px-3 pl-4 transition-all duration-500 sm:pl-5",
              scrolled
                ? "border border-navy-900/[0.07] bg-white/95 shadow-[0_10px_40px_-12px_rgb(7_28_77/0.28)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/85 py-1.5 sm:py-2"
                : "py-1.5",
            )}
          >
            <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="AFRISTEM home">
              <div className={cn("relative rounded-2xl p-1 transition-all duration-500", light ? "bg-white" : "bg-transparent")}>
                <Image
                  src="/images/brand/logo.png"
                  alt="AFRISTEM"
                  width={150}
                  height={92}
                  priority
                  className={cn("h-auto transition-all duration-500", scrolled ? "w-[100px] sm:w-[112px]" : "w-[112px] sm:w-[132px]")}
                />
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
              {navigation.map((item) => {
                const active = isActive(item.href, item.children);
                const linkClass = cn(
                  "relative inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-semibold transition-colors duration-300",
                  light ? "text-white/85 hover:text-white" : "text-navy-800 hover:text-navy-600",
                  active && (light ? "text-sun-300" : "text-navy-600"),
                );
                const underline = active ? (
                  <span className={cn("absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full", light ? "bg-sun-400" : "bg-sun-500")} />
                ) : null;

                return (
                  <div key={item.label} className="group/nav relative">
                    {item.external ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                        {item.label}
                        <ExternalLink className="size-3" />
                        {item.children && <ChevronDown className="size-3.5 transition-transform duration-300 group-hover/nav:rotate-180" />}
                      </a>
                    ) : (
                      <Link href={item.href} className={linkClass}>
                        {item.label}
                        {item.children && <ChevronDown className="size-3.5 transition-transform duration-300 group-hover/nav:rotate-180" />}
                        {underline}
                      </Link>
                    )}

                    {item.children ? (
                      <div className="pointer-events-none absolute left-1/2 top-full z-50 -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition-all duration-300 group-hover/nav:pointer-events-auto group-hover/nav:translate-y-0 group-hover/nav:opacity-100 group-focus-within/nav:pointer-events-auto group-focus-within/nav:translate-y-0 group-focus-within/nav:opacity-100">
                        <div className="w-[22rem] overflow-hidden rounded-3xl border border-navy-900/5 bg-white p-2 shadow-card-lg">
                          {item.children.map((c) =>
                            c.external ? (
                              <a
                                key={c.label}
                                href={c.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group/item flex items-start gap-3 rounded-2xl px-3.5 py-3 transition-colors hover:bg-navy-50"
                              >
                                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-sun-400 transition-transform group-hover/item:scale-150" />
                                <span>
                                  <span className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
                                    {c.label} <ExternalLink className="size-3 text-navy-400" />
                                  </span>
                                  {c.description ? <span className="block text-xs text-navy-800/60">{c.description}</span> : null}
                                </span>
                                <ArrowRight className="ml-auto mt-1 size-4 shrink-0 -translate-x-1 text-navy-300 opacity-0 transition-all group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                              </a>
                            ) : (
                              <Link
                                key={c.href}
                                href={c.href}
                                className="group/item flex items-start gap-3 rounded-2xl px-3.5 py-3 transition-colors hover:bg-navy-50"
                              >
                                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-sun-400 transition-transform group-hover/item:scale-150" />
                                <span>
                                  <span className="block text-sm font-bold text-navy-900">{c.label}</span>
                                  {c.description ? <span className="block text-xs text-navy-800/60">{c.description}</span> : null}
                                </span>
                                <ArrowRight className="ml-auto mt-1 size-4 shrink-0 -translate-x-1 text-navy-300 opacity-0 transition-all group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                              </Link>
                            ),
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </nav>

            {/* CTA + burger */}
            <div className="flex items-center gap-2">
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className={cn(
                  "hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition-colors lg:inline-flex xl:hidden 2xl:inline-flex",
                  light ? "text-white/85 hover:text-white" : "text-navy-800 hover:text-navy-600",
                )}
              >
                <Phone className="size-3.5" /> <span className="hidden sm:inline">{phone}</span>
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
                className={cn(
                  "inline-flex size-11 items-center justify-center rounded-full transition-colors xl:hidden",
                  light ? "bg-white/10 text-white hover:bg-white/20" : "bg-navy-50 text-navy-900 hover:bg-navy-100",
                )}
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open ? (
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
              className="relative flex h-full flex-col overflow-y-auto px-5 pb-10 pt-[6.5rem] sm:px-6"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
              aria-label="Mobile"
            >
              {navigation.map((item) => (
                <motion.div
                  key={item.label}
                  variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                  className="border-b border-white/10"
                >
                  {item.children ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setMobileExpanded((v) => (v === item.label ? null : item.label))}
                        className="flex w-full items-center justify-between py-4 text-left font-display text-xl font-bold sm:text-2xl"
                        aria-expanded={mobileExpanded === item.label}
                      >
                        {item.label}
                        <ChevronDown className={cn("size-5 transition-transform", mobileExpanded === item.label && "rotate-180")} />
                      </button>
                      <AnimatePresence initial={false}>
                        {mobileExpanded === item.label ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-1 pb-4 pl-3">
                              {item.children.map((c) =>
                                c.external ? (
                                  <a
                                    key={c.label}
                                    href={c.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-base text-white/80 hover:bg-white/10 hover:text-white"
                                  >
                                    {c.label} <ExternalLink className="size-3.5 text-sun-300" />
                                  </a>
                                ) : (
                                  <Link
                                    key={c.href}
                                    href={c.href}
                                    className="rounded-xl px-3 py-2.5 text-base text-white/80 hover:bg-white/10 hover:text-white"
                                  >
                                    {c.label}
                                  </Link>
                                ),
                              )}
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </>
                  ) : item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 py-4 font-display text-xl font-bold sm:text-2xl"
                    >
                      {item.label} <ExternalLink className="size-4 text-sun-300" />
                    </a>
                  ) : (
                    <Link href={item.href} className="block py-4 font-display text-xl font-bold sm:text-2xl">
                      {item.label}
                    </Link>
                  )}
                </motion.div>
              ))}
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="mt-8 flex flex-col gap-3">
                <Link href="/register" className="btn-primary btn-lg w-full">
                  Register Now <ArrowRight className="size-4" />
                </Link>
                <a
                  href={`https://wa.me/${(contact?.whatsapp ?? "+2348105541242").replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost-light w-full"
                >
                  Chat on WhatsApp
                </a>
              </motion.div>
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
