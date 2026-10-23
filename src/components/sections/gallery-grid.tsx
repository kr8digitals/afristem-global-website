"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ContentImage as Image } from "@/components/ui/content-image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, X, ZoomIn } from "lucide-react";
import { galleryCategories, type GalleryItem } from "@/content/data";
import { cn } from "@/lib/utils";

export function GalleryGrid({ items, categories }: { items: (GalleryItem & { id?: string })[]; categories?: string[] }) {
  // filter buttons: the admin's category list, limited to categories that have photos
  const used = new Set(items.map((g) => g.category));
  const filters = ["All", ...(categories?.length ? categories : galleryCategories.filter((c) => c !== "All")).filter((c) => used.has(c))];
  const [cat, setCat] = useState<string>("All");
  const [open, setOpen] = useState<number | null>(null);
  const list = useMemo(() => items.filter((g) => cat === "All" || g.category === cat), [items, cat]);

  const next = useCallback(() => setOpen((i) => (i === null ? null : (i + 1) % list.length)), [list.length]);
  const prev = useCallback(() => setOpen((i) => (i === null ? null : (i - 1 + list.length) % list.length)), [list.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, next, prev]);

  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-2">
        {filters.map((c) => (
          <button key={c} type="button" onClick={() => { setCat(c); setOpen(null); }} className={cn("rounded-full border px-4 py-2 text-xs font-bold transition-all", cat === c ? "border-navy-800 bg-navy-800 text-white" : "border-navy-900/10 text-navy-800 hover:border-navy-800")}>{c}</button>
        ))}
      </div>

      <motion.div layout className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] md:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {list.map((g, i) => (
            <motion.button
              type="button"
              key={g.id ?? g.src}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={() => setOpen(i)}
              className={cn("group relative overflow-hidden rounded-2xl bg-navy-100 text-left", g.span === "wide" && "col-span-2", g.span === "tall" && "row-span-2")}
              aria-label={`Open ${g.caption}`}
            >
              <Image src={g.src} alt={g.alt} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute inset-x-4 bottom-4 flex translate-y-2 items-end justify-between opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-sun-300">{g.category}</span>
                  <span className="block text-sm font-bold text-white">{g.caption}</span>
                </span>
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur"><ZoomIn className="size-4" /></span>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {open !== null && list[open] && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-navy-950/95 p-4 backdrop-blur-sm" onClick={() => setOpen(null)} role="dialog" aria-modal>
            <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="absolute right-5 top-5 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"><X className="size-5" /></button>
            <button type="button" aria-label="Previous" onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-3 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"><ChevronLeft className="size-6" /></button>
            <button type="button" aria-label="Next" onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-3 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"><ChevronRight className="size-6" /></button>
            <motion.figure key={list[open].src} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative max-h-[85vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl">
                <Image src={list[open].src} alt={list[open].alt} fill sizes="100vw" className="object-contain" priority />
              </div>
              <figcaption className="mt-4 text-center text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-sun-300">{list[open].category}</span>
                <p className="font-display text-lg font-bold">{list[open].caption}</p>
                <p className="text-xs text-white/50">{open + 1} / {list.length}</p>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Accepts a bare video id or any YouTube URL pasted into the admin dashboard. */
export function youtubeIdFrom(value: string): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (/^[-\w]{11}$/.test(trimmed)) return trimmed;
  const patterns = [/[?&]v=([-\w]{11})/, /youtu\.be\/([-\w]{11})/, /\/embed\/([-\w]{11})/, /\/shorts\/([-\w]{11})/];
  for (const re of patterns) {
    const m = re.exec(trimmed);
    if (m) return m[1];
  }
  return "";
}

export function VideoCard({
  v,
}: {
  v: { title: string; description: string; thumb: string; youtubeId: string; category?: string };
}) {
  const [play, setPlay] = useState(false);
  const id = youtubeIdFrom(v.youtubeId);
  return (
    <div className="group card card-hover overflow-hidden">
      <div className="relative aspect-video overflow-hidden bg-navy-900">
        {play && id ? (
          <iframe className="absolute inset-0 size-full" src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title={v.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        ) : (
          <button type="button" onClick={() => id && setPlay(true)} className="absolute inset-0" aria-label={`Play ${v.title}`}>
            <Image
              src={v.thumb || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "/images/videos/bootcamp-2023.jpg")}
              alt=""
              fill
              sizes="(min-width:1024px) 30vw, 90vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-navy-950/30" />
            <span className="absolute left-1/2 top-1/2 inline-flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-sun-400 text-navy-950 shadow-glow transition-transform group-hover:scale-110"><Play className="ml-1 size-7 fill-current" /></span>
            {v.category ? (
              <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-navy-900">
                {v.category}
              </span>
            ) : null}
          </button>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-bold text-navy-900">{v.title}</h3>
        <p className="mt-1 text-sm text-navy-800/65">{v.description}</p>
      </div>
    </div>
  );
}
