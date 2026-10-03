import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Serialises structured data for a <script type="application/ld+json"> tag.
 *
 * JSON.stringify does not escape "<", so a value containing "</script>" would
 * end the tag early and let the rest be parsed as HTML. Escaping the three
 * dangerous characters keeps the payload inert without changing its meaning —
 * "\u003c" is still a valid "<" inside a JSON string.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function isUpcoming(iso: string) {
  return new Date(iso).getTime() >= Date.now() - 24 * 60 * 60 * 1000;
}

/** Splits "5,867+" into a countable number and its suffix (for count-up animations). */
export function parseStat(value: string): { count: number | null; suffix: string } {
  const match = /^\s*([\d][\d,]*)(.*)$/.exec(value ?? "");
  if (!match) return { count: null, suffix: "" };
  const count = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(count) ? { count, suffix: match[2] } : { count: null, suffix: "" };
}
