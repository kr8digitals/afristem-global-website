"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { FacebookIcon, LinkedinIcon, WhatsAppIcon, XIcon } from "@/components/ui/brand-icons";

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const enc = encodeURIComponent;
  const links = [
    { n: "WhatsApp", h: `https://wa.me/?text=${enc(title + " " + url)}`, I: WhatsAppIcon },
    { n: "X", h: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`, I: XIcon },
    { n: "Facebook", h: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, I: FacebookIcon },
    { n: "LinkedIn", h: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`, I: LinkedinIcon },
  ];
  return (
    <div className="card p-6">
      <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-navy-800/50">Share this story</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {links.map(({ n, h, I }) => (
          <a key={n} href={h} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${n}`} className="inline-flex size-10 items-center justify-center rounded-full bg-navy-50 text-navy-800 transition-all hover:-translate-y-0.5 hover:bg-sun-400"><I className="size-4" /></a>
        ))}
        <button type="button" aria-label="Copy link" onClick={() => { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="inline-flex size-10 items-center justify-center rounded-full bg-navy-50 text-navy-800 transition-all hover:-translate-y-0.5 hover:bg-sun-400">
          {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
        </button>
      </div>
    </div>
  );
}
