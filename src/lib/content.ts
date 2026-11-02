/**
 * Page-facing content helpers.
 *
 * Server components call `await getContent()` (memoised per request, so a
 * page that needs several sections still makes one database round trip) and
 * use the helpers below to turn stored records into what the pages render.
 */
import "server-only";
import { getContent, getContentResult } from "@/lib/store";
import type { Programme } from "@/content/programmes";
import type { Announcement, EventRecord, PostRecord, ProgrammeEdit, ProgrammeStatus } from "@/lib/types";
import { isUpcoming } from "@/lib/utils";
import { ARCHIVED_POST_SLUGS, ARCHIVED_VIDEO_IDS } from "@/content/archive";

export { getContent, getContentResult };

/** Used wherever an admin left an image blank, so a page never breaks on a missing picture. */
export const FALLBACK_IMAGE = "/images/photos/exam-hall.jpg";

export function imageOr(src: string | undefined | null, fallback = FALLBACK_IMAGE): string {
  const s = (src ?? "").trim();
  return s || fallback;
}

/* ------------------------------------------------------------ programmes */

export type ProgrammeView = Programme & {
  id: string;
  status: ProgrammeStatus;
  featured: boolean;
  registerHref: string;
  /** students and schools must pay before the registration is confirmed */
  requiresPayment: boolean;
  /** free-text fee, e.g. "₦7,000 per candidate" */
  fee: string;
  /** bank, account number, account name */
  paymentInstructions: string;
};

const PILLARS = ["SCIENCE", "TECHNOLOGY", "STEM", "CHEMISTRY"] as const;
const ACCENTS = ["sun", "sky", "mint", "violet", "coral"] as const;
const ICONS = ["spell", "code", "trophy", "flask"] as const;
const pick = <T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T =>
  (allowed as readonly string[]).includes(value ?? "") ? (value as T) : fallback;

/** "Label: Value" per line -> [{label, value}] (same rule as the database). */
export function parseHighlights(text: string): { label: string; value: string }[] {
  return (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf(":");
      return i === -1 ? { label: line, value: "" } : { label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() };
    });
}

/** Turns a stored programme into everything its card and page need, with safe fallbacks. */
export function toProgramme(p: ProgrammeEdit): ProgrammeView {
  const description = (p.description ?? []).filter(Boolean);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle,
    tagline: p.tagline,
    pillar: pick(p.pillar, PILLARS, "STEM"),
    pillarBlurb: p.pillarBlurb || p.shortDescription || p.tagline,
    shortDescription: p.shortDescription,
    description: description.length ? description : [p.shortDescription].filter(Boolean),
    objectives: (p.objectives ?? []).filter(Boolean),
    eligibility: p.eligibility,
    format: p.format,
    ageRange: p.ageRange,
    image: imageOr(p.image),
    imageAlt: p.imageAlt || p.name,
    accent: pick(p.accent, ACCENTS, "sun"),
    icon: pick(p.icon, ICONS, "trophy"),
    ctaLabel: p.ctaLabel || `Explore ${p.name}`,
    highlights: parseHighlights(p.highlights),
    prizeNote: p.prizeNote || undefined,
    poster: p.poster || undefined,
    status: p.status ?? "open",
    featured: p.featured !== false,
    registerHref: p.registerHref || `/register?programme=${p.slug}`,
    requiresPayment: p.requiresPayment === true,
    fee: p.fee ?? "",
    paymentInstructions: p.paymentInstructions ?? "",
  };
}

export function programmesFrom(list: ProgrammeEdit[]): ProgrammeView[] {
  return list.filter((p) => p.slug && p.name).map(toProgramme);
}

/** The programmes the admin chose to show on the homepage (all of them if none is ticked). */
export function featuredProgrammes(list: ProgrammeView[]): ProgrammeView[] {
  const featured = list.filter((p) => p.featured);
  return featured.length ? featured : list;
}

export const STATUS_LABEL: Record<ProgrammeStatus, string> = {
  open: "Registration open",
  "closing-soon": "Closing soon",
  closed: "Registration closed",
  "coming-soon": "Coming soon",
};

export const registrationOpen = (p: { status: ProgrammeStatus }) => p.status !== "closed";

/* ----------------------------------------------------------- announcement */

/** The bar shows when enabled and today (UTC) is inside the optional date window. */
export function visibleAnnouncement(a: Announcement | null | undefined, now = new Date()): Announcement | null {
  if (!a?.enabled || !(a.message || a.label)) return null;
  const today = now.toISOString().slice(0, 10);
  if (a.startsAt && a.startsAt > today) return null;
  if (a.endsAt && a.endsAt < today) return null;
  return a;
}

/* ------------------------------------------------------------------ lists */

export function upcomingEvents(events: EventRecord[]): EventRecord[] {
  return events.filter((e) => e.start && isUpcoming(e.end ?? e.start)).sort((a, b) => a.start.localeCompare(b.start));
}

export function pastEvents(events: EventRecord[]): EventRecord[] {
  return events.filter((e) => e.start && !isUpcoming(e.end ?? e.start)).sort((a, b) => b.start.localeCompare(a.start));
}

export function newestFirst(news: PostRecord[]): PostRecord[] {
  return [...news].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

/** Stories that still belong on the live news feed (archived ones live at /archive). */
export const isArchivedPost = (slug: string) => ARCHIVED_POST_SLUGS.has(slug);

export function activePosts(news: PostRecord[]): PostRecord[] {
  return newestFirst(news).filter((p) => !isArchivedPost(p.slug));
}

export function archivedPosts(news: PostRecord[]): PostRecord[] {
  return newestFirst(news).filter((p) => isArchivedPost(p.slug));
}

/** Videos from earlier editions are listed on /archive instead of the live gallery. */
export const isArchivedVideo = (id: string) => ARCHIVED_VIDEO_IDS.has(id);

/** Upcoming events that belong to a programme (linked by register link, or by name). */
export function relatedEvents(events: EventRecord[], p: { slug: string; name: string }): EventRecord[] {
  const firstWord = p.name.toLowerCase().split(" ")[0] ?? "";
  return upcomingEvents(events).filter(
    (e) => e.registerHref.includes(`programme=${p.slug}`) || (firstWord.length > 2 && e.title.toLowerCase().includes(firstWord)),
  );
}

/** Initials for a testimonial avatar when the admin left them blank. */
export function initialsOf(name: string, given?: string): string {
  if (given) return given.slice(0, 2).toUpperCase();
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Digits-only number for wa.me / tel: links. */
export const digits = (phone: string) => (phone ?? "").replace(/[^\d]/g, "");
