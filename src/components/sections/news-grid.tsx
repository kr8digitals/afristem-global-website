"use client";

import { useMemo, useState } from "react";
import { ContentImage as Image } from "@/components/ui/content-image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import type { Post } from "@/content/data";
import { postCategories } from "@/content/data";
import { Pill } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function NewsGrid({ posts, categories }: { posts: Post[]; categories?: string[] }) {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const list = useMemo(
    () => posts.filter((p) => (cat === "All" || p.category === cat) && (q.trim() === "" || `${p.title} ${p.excerpt}`.toLowerCase().includes(q.toLowerCase()))).sort((a, b) => b.date.localeCompare(a.date)),
    [posts, cat, q],
  );
  // the admin's categories that actually have stories (in the admin's order)
  const used = new Set(posts.map((p) => p.category));
  const cats = ["All", ...(categories?.length ? categories : postCategories.map((c) => c.name)).filter((c) => used.has(c))];

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button key={c} type="button" onClick={() => setCat(c)} className={cn("rounded-full border px-4 py-2 text-xs font-bold transition-all", cat === c ? "border-navy-800 bg-navy-800 text-white" : "border-navy-900/10 text-navy-800 hover:border-navy-800")}>{c}</button>
          ))}
        </div>
        <label className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-navy-800/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search stories…" className="h-11 w-full rounded-full border border-navy-900/10 bg-white pl-11 pr-4 text-sm focus:border-navy-500 focus:outline-none focus:ring-4 focus:ring-navy-500/10 lg:w-72" />
        </label>
      </div>

      <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <motion.article key={p.slug} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
              <Link href={`/news/${p.slug}`} className="group card card-hover flex h-full flex-col overflow-hidden">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={p.image || "/images/photos/exam-hall.jpg"} alt="" fill sizes="(min-width:1024px) 30vw, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute left-4 top-4"><Pill tone="sun">{p.category}</Pill></span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-semibold text-navy-800/50">{p.displayDate} · {p.readTime}</p>
                  <h3 className="mt-2 font-display text-xl font-bold leading-snug text-navy-900 transition-colors group-hover:text-navy-600">{p.title}</h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-navy-800/65">{p.excerpt}</p>
                  <span className="mt-4 text-sm font-bold text-navy-800">Read story →</span>
                </div>
              </Link>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && <p className="py-20 text-center text-navy-800/60">No stories match your search yet.</p>}
    </div>
  );
}
