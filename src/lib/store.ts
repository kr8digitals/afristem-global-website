/**
 * AFRISTEM content store.
 *
 * Everything the site displays and every form submission lives in a single
 * JSON document so the admin dashboard can edit it without a database.
 * Content is seeded from the TypeScript defaults in `src/content/*`, then any
 * admin edits in `data/store.json` are layered on top.
 *
 * Server-only: uses node:fs. Reads are cached in memory and invalidated by the
 * file's mtime, so edits made in the admin appear on the very next request.
 */
import "server-only";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import { site as defaultSite, stats as defaultStats } from "@/content/site";
import {
  events as defaultEvents,
  posts as defaultPosts,
  gallery as defaultGallery,
  videos as defaultVideos,
  faqs as defaultFaqs,
  testimonials as defaultTestimonials,
  partners as defaultPartners,
  type EventItem,
  type Post,
  type GalleryItem,
  type Partner,
} from "@/content/data";
import { programmes as defaultProgrammes, primeStemProgrammes } from "@/content/programmes";

/* ------------------------------------------------------------------ types */

export type AdminUser = { passwordHash: string; salt: string; updatedAt: string };

export type Announcement = {
  enabled: boolean;
  tone: "info" | "success" | "warning" | "urgent";
  label: string;
  message: string;
  href: string;
  linkLabel: string;
  /** ISO dates — announcement hides itself outside this window when set */
  startsAt: string;
  endsAt: string;
};

export type VideoItem = {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  thumb: string;
  category: string;
  featured: boolean;
};

export type FaqItem = { id: string; question: string; answer: string; category: string };

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  org: string;
  image: string;
  /** shown in the avatar circle; derived from the name when left blank */
  initials: string;
  featured: boolean;
};

export type StatItem = { id: string; value: string; label: string; icon: string };

/** Editable content records — the shipped types plus a stable id for the admin UI. */
export type WithId<T> = T & { id: string };
export type EventRecord = WithId<EventItem>;
export type PostRecord = WithId<Post>;
export type GalleryRecord = WithId<GalleryItem>;
export type PartnerRecord = WithId<Partner>;

/** Editable overlay for a programme page. */
export type ProgrammeEdit = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  tagline: string;
  shortDescription: string;
  eligibility: string;
  format: string;
  ageRange: string;
  image: string;
  imageAlt: string;
  pillar: string;
  ctaLabel: string;
  /** "Label: Value" per line */
  highlights: string;
  registerHref: string;
  featured: boolean;
  status: "open" | "closing-soon" | "closed" | "coming-soon";
};

export type SiteSettings = {
  name: string;
  tagline: string;
  description: string;
  email: string;
  primaryPhone: string;
  whatsapp: string;
  secondaryPhone: string;
  address: string;
  registrationNote: string;
  registrationOpens: string;
  registrationCloses: string;
  footerNote: string;
  offices: { id: string; city: string; address: string; phone: string }[];
  socials: { id: string; label: string; href: string; icon: string }[];
  externalLinks: { id: string; label: string; href: string; description: string }[];
};

export type HeroContent = {
  badgeLabel: string;
  badgeText: string;
  badgeHref: string;
  headline: string;
  rotatingWords: string[];
  subheading: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  backgroundImage: string;
  featureImage: string;
  /** small eyebrow label printed over the hero photo */
  featureEyebrow: string;
  /** line printed under the hero photo */
  featureCaption: string;
  secondaryImage: string;
  secondaryImageCaption: string;
};

export type ContactSubmission = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  subject: string;
  message: string;
  status: "new" | "in-progress" | "replied" | "closed";
  notes: { at: string; text: string; by: string }[];
};

export type RegistrationSubmission = {
  id: string;
  createdAt: string;
  reference: string;
  type: string;
  programme: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  school: string;
  state: string;
  city: string;
  role: string;
  participants: string;
  notes: string;
  status: "new" | "contacted" | "confirmed" | "waitlist" | "declined";
  thread: { at: string; text: string; by: string }[];
};

export type NewsletterSubmission = {
  id: string;
  createdAt: string;
  email: string;
  status: "subscribed" | "unsubscribed";
};

export type Store = {
  version: number;
  updatedAt: string;
  announcement: Announcement;
  hero: HeroContent;
  site: SiteSettings;
  stats: StatItem[];
  programmes: ProgrammeEdit[];
  events: EventRecord[];
  news: PostRecord[];
  gallery: GalleryRecord[];
  videos: VideoItem[];
  faqs: FaqItem[];
  testimonials: Testimonial[];
  partners: PartnerRecord[];
  submissions: {
    contact: ContactSubmission[];
    register: RegistrationSubmission[];
    newsletter: NewsletterSubmission[];
  };
  admin: { user: AdminUser | null };
};

/* ------------------------------------------------------------------ paths */

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

/* --------------------------------------------------------------- defaults */

function defaultAnnouncement(): Announcement {
  return {
    enabled: true,
    tone: "info",
    label: "New",
    message: "STEM Kids Championship International Edition — registration closes Nov 14, 2026",
    href: "/register?programme=stem-kids-championship",
    linkLabel: "Register now",
    startsAt: "",
    endsAt: "",
  };
}

function defaultHero(): HeroContent {
  return {
    badgeLabel: "New",
    badgeText: "STEM Kids Championship Int'l Edition · Nov 14, 2026",
    badgeHref: "/events",
    headline: "Inspiring Africa's Next Generation of",
    rotatingWords: ["Engineers", "Technologists", "Scientists", "Innovators", "Problem Solvers"],
    subheading:
      "AFRISTEM creates exciting opportunities for young people to learn, compete, build and innovate through STEM education, competitions, technology, training and strategic partnerships.",
    primaryCtaLabel: "Explore Our Programmes",
    primaryCtaHref: "/programmes",
    secondaryCtaLabel: "Partner With Us",
    secondaryCtaHref: "/partners",
    backgroundImage: "/images/awards/group-winners.jpg",
    featureImage: "/images/awards/trio-medals.jpg",
    secondaryImage: "/images/awards/certificate-lineup.jpg",
    featureEyebrow: "2025 Nigerian STEM Championship",
    featureCaption: "Winners of the 2025 Nigerian STEM Championship",
    secondaryImageCaption: "2025 Nigerian STEM Championship Awards",
  };
}

function defaultSiteSettings(): SiteSettings {
  return {
    name: defaultSite.name,
    tagline: defaultSite.tagline,
    description: defaultSite.description,
    email: defaultSite.email,
    primaryPhone: defaultSite.phone,
    whatsapp: defaultSite.whatsapp,
    secondaryPhone: defaultSite.offices[0].phone,
    address: defaultSite.offices[0].address.filter(Boolean).join(" "),
    registrationNote:
      "Registration takes about 3 minutes. You'll get an automatic confirmation by email, and our team will contact you with next steps.",
    registrationOpens: "",
    registrationCloses: "2026-11-14",
    footerNote: "AFRISTEM Global — advancing STEM education across Africa.",
    offices: [
      { id: "abakaliki", city: "Abakaliki", address: "Abakaliki, Ebonyi State, Nigeria", phone: "+234 813 825 8491" },
      { id: "abuja", city: "Abuja", address: "Vicbalkon Towers, Utako, Abuja, Nigeria", phone: "+234 810 554 1242" },
      { id: "lagos", city: "Lagos", address: "Ikorodu, Lagos State, Nigeria", phone: "+234 809 407 4447" },
    ],
    socials: [
      { id: "facebook", label: "Facebook", href: defaultSite.social.facebook, icon: "facebook" },
      { id: "instagram", label: "Instagram", href: defaultSite.social.instagram, icon: "instagram" },
      { id: "linkedin", label: "LinkedIn", href: defaultSite.social.linkedin, icon: "linkedin" },
      { id: "x", label: "X (Twitter)", href: defaultSite.social.twitter, icon: "x" },
      { id: "youtube", label: "YouTube", href: defaultSite.social.youtube, icon: "youtube" },
    ],
    externalLinks: [
      {
        id: "prime-stem",
        label: "Prime STEM Nigeria",
        href: "https://primestemnigeria.afristemglobal.org",
        description: "Our flagship STEM education initiative — competitions, bootcamps and teacher training.",
      },
    ],
  };
}

function defaultStatsList(): StatItem[] {
  return defaultStats.map((s, i) => ({
    id: `stat-${i + 1}`,
    value: `${s.value.toLocaleString()}${s.suffix}`,
    label: s.label,
    icon: "sparkles",
  }));
}

export { parseStat } from "@/lib/utils";

function defaultProgrammeEdits(): ProgrammeEdit[] {
  return defaultProgrammes.map((p) => ({
    id: p.slug,
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle,
    tagline: p.tagline,
    shortDescription: p.shortDescription,
    eligibility: p.eligibility,
    format: p.format,
    ageRange: p.ageRange,
    image: p.image,
    imageAlt: p.imageAlt,
    pillar: p.pillar,
    ctaLabel: p.ctaLabel,
    highlights: p.highlights.map((h) => `${h.label}: ${h.value}`).join("\n"),
    registerHref: `/register?programme=${p.slug}`,
    featured: true,
    status: "open" as const,
  }));
}

function defaultVideoList(): VideoItem[] {
  const existing = defaultVideos as unknown as { youtubeId?: string; title: string; description: string; thumb: string }[];
  const curated: VideoItem[] = [
    {
      id: "bootcamp-2023",
      title: "2023 International STEM Boot Camp",
      description:
        "Students from across Nigeria and international facilitators at the IMO State University boot camp — coding, robotics and project defence.",
      youtubeId: "VDHLgiAvm1E",
      thumb: "/images/videos/bootcamp-2023.jpg",
      category: "Bootcamp",
      featured: true,
    },
    {
      id: "skc-2023",
      title: "2023 STEM Kids Championship",
      description: "Highlights from the championship that brings thousands of pupils together to compete in science, maths and technology.",
      youtubeId: "ItKzkb2MEeU",
      thumb: "/images/videos/skc-2023.jpg",
      category: "Competition",
      featured: true,
    },
    {
      id: "drone-kids",
      title: "Kids flying drones at the Boot Camp",
      description: "Hands-on technology sessions where learners pilot drones and get a first taste of engineering.",
      youtubeId: "QIetBYsW7aU",
      thumb: "/images/videos/drone-kids.jpg",
      category: "Bootcamp",
      featured: true,
    },
    {
      id: "director-bootcamp",
      title: "Director of Prime STEM Nigeria on the Boot Camp",
      description: "Why we bring international facilitators into Nigerian classrooms every August.",
      youtubeId: "yOoTqvOiEYs",
      thumb: "/images/videos/director-bootcamp.jpg",
      category: "Inside AFRISTEM",
      featured: false,
    },
    {
      id: "skc-promo",
      title: "STEM Kids Championship is back",
      description: "Bigger and better — how schools and parents can get learners registered.",
      youtubeId: "9BulkVNr44M",
      thumb: "/images/videos/skc-promo.jpg",
      category: "Competition",
      featured: false,
    },
    {
      id: "brain-league-winner",
      title: "STEM Kids Brain League winner",
      description: "A champion receives the prize — the moment every learner works towards.",
      youtubeId: "WiflgV-hF70",
      thumb: "/images/videos/brain-league-winner.jpg",
      category: "Competition",
      featured: false,
    },
    {
      id: "project-defence",
      title: "Boot Camp project defence",
      description: "Teams present the projects they built during the international boot camp.",
      youtubeId: "7XRXbK3xgyc",
      thumb: "/images/videos/project-defence.jpg",
      category: "Bootcamp",
      featured: false,
    },
    {
      id: "skc-registration",
      title: "STEM Kids Championship registration",
      description: "Registration guidance for schools entering learners into the championship.",
      youtubeId: "ErkcnBtHFyA",
      thumb: "/images/videos/skc-registration.jpg",
      category: "Competition",
      featured: false,
    },
  ];
  if (existing.length) {
    // keep any legacy entries that already had real YouTube IDs
    for (const v of existing) {
      if (v.youtubeId && !curated.some((c) => c.youtubeId === v.youtubeId)) {
        curated.push({
          id: `legacy-${v.youtubeId}`,
          title: v.title,
          description: v.description,
          youtubeId: v.youtubeId,
          thumb: v.thumb,
          category: "Highlights",
          featured: false,
        });
      }
    }
  }
  return curated;
}

function defaultFaqList(): FaqItem[] {
  return (defaultFaqs as unknown as { q: string; a: string }[]).map((f, i) => ({
    id: `faq-${i + 1}`,
    question: f.q,
    answer: f.a,
    category: "General",
  }));
}

function defaultTestimonialList(): Testimonial[] {
  return (defaultTestimonials as unknown as { quote: string; name: string; role: string; initials?: string }[]).map((t, i) => ({
    id: `testimonial-${i + 1}`,
    quote: t.quote,
    name: t.name,
    role: t.role,
    org: "",
    image: "",
    initials: t.initials ?? "",
    featured: i < 3,
  }));
}

/**
 * Bump this whenever collections in the seed gain new items that should reach
 * sites that are already running. Existing entries the client has edited are
 * never overwritten — only genuinely new items are appended.
 */
export const SEED_VERSION = 3;

/** The seeded collections that can gain items in a later release. */
function seededCollections(d: Store) {
  return {
    events: d.events,
    news: d.news,
    gallery: d.gallery,
    videos: d.videos,
    faqs: d.faqs,
    testimonials: d.testimonials,
    partners: d.partners,
    programmes: d.programmes,
  } as const;
}

const keyOf = (item: unknown): string => {
  const o = item as Record<string, unknown>;
  return String(o.id ?? o.slug ?? "");
};

/**
 * Fold newly shipped seed items into a store written by an older release.
 * Runs on every read; it is a no-op once the stored version matches.
 */
function applySeedUpgrades(merged: Store, raw: Partial<Store>): boolean {
  const storedVersion = typeof raw.version === "number" ? raw.version : 0;
  if (storedVersion >= SEED_VERSION) return false;

  const seed = seedStore();
  const seedCols = seededCollections(seed);
  const liveCols = seededCollections(merged);
  let changed = false;

  for (const key of Object.keys(seedCols) as (keyof ReturnType<typeof seededCollections>)[]) {
    const incoming = seedCols[key] as unknown as { id?: string; slug?: string }[];
    const current = liveCols[key] as unknown as { id?: string; slug?: string }[];
    if (!Array.isArray(incoming) || !Array.isArray(current)) continue;
    const existing = new Set(current.map(keyOf));
    const additions = incoming.filter((item) => {
      const k = keyOf(item);
      return k !== "" && !existing.has(k);
    });
    if (additions.length) {
      // write through to the store — `liveCols` is only a view over it
      (merged as unknown as Record<string, unknown>)[key] = [...current, ...additions];
      changed = true;
    }
  }

  merged.version = SEED_VERSION;
  return true;
}

export function seedStore(): Store {
  return {
    version: SEED_VERSION,
    updatedAt: new Date().toISOString(),
    announcement: defaultAnnouncement(),
    hero: defaultHero(),
    site: defaultSiteSettings(),
    stats: defaultStatsList(),
    programmes: defaultProgrammeEdits(),
    events: defaultEvents.map((e) => ({ ...e, id: e.id ?? `event-${e.slug}` })),
    news: defaultPosts.map((p) => ({ ...p, id: p.id ?? `post-${p.slug}` })),
    gallery: defaultGallery.map((g, i) => ({ ...g, id: g.id ?? `photo-${i + 1}` })),
    videos: defaultVideoList(),
    faqs: defaultFaqList(),
    testimonials: defaultTestimonialList(),
    partners: defaultPartners.map((p, i) => ({ ...p, id: p.id ?? `partner-${i + 1}` })),
    submissions: { contact: [], register: [], newsletter: [] },
    admin: { user: null },
  };
}

/* --------------------------------------------------------------- reading */

let cache: { mtimeMs: number; data: Store } | null = null;

function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (Array.isArray(base)) return (Array.isArray(override) ? override : base) as T;
  if (typeof base === "object" && base !== null && typeof override === "object" && !Array.isArray(override)) {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [k, v] of Object.entries(override as Record<string, unknown>)) {
      out[k] = k in (base as Record<string, unknown>)
        ? deepMerge((base as Record<string, unknown>)[k], v)
        : v;
    }
    return out as T;
  }
  return (typeof override === "string" || typeof override === "number" || typeof override === "boolean"
    ? override
    : base) as T;
}

export function readStore(): Store {
  const seed = seedStore();
  try {
    const stat = fs.statSync(STORE_PATH);
    if (cache && cache.mtimeMs === stat.mtimeMs) return cache.data;
    const raw = JSON.parse(fs.readFileSync(STORE_PATH, "utf8")) as Partial<Store>;
    // merge so that fields added in later releases always have a value
    const merged = deepMerge(seed, raw);
    merged.submissions = {
      contact: raw.submissions?.contact ?? [],
      register: raw.submissions?.register ?? [],
      newsletter: raw.submissions?.newsletter ?? [],
    };
    merged.admin = { user: raw.admin?.user ?? null };
    merged.updatedAt = raw.updatedAt ?? seed.updatedAt;
    merged.version = raw.version ?? seed.version;

    // pull in any content added by a newer release
    if (applySeedUpgrades(merged, raw)) {
      const written = writeStore(merged);
      return written;
    }

    cache = { mtimeMs: stat.mtimeMs, data: merged };
    return merged;
  } catch {
    return seed;
  }
}

export function writeStore(next: Store): Store {
  const data: Store = { ...next, updatedAt: new Date().toISOString() };
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${STORE_PATH}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, STORE_PATH);
  cache = { mtimeMs: fs.statSync(STORE_PATH).mtimeMs, data };
  return data;
}

/** Read-modify-write helper. */
export function updateStore(mutate: (draft: Store) => void): Store {
  const draft: Store = JSON.parse(JSON.stringify(readStore())) as Store;
  mutate(draft);
  return writeStore(draft);
}

/* ------------------------------------------------------------- accessors */

export function getAnnouncement(): Announcement | null {
  const a = readStore().announcement;
  if (!a?.enabled) return null;
  const now = Date.now();
  if (a.startsAt && new Date(a.startsAt).getTime() > now) return null;
  if (a.endsAt && new Date(a.endsAt).getTime() + 86_400_000 < now) return null;
  return a;
}

export const COLLECTIONS = [
  "events",
  "news",
  "gallery",
  "videos",
  "faqs",
  "testimonials",
  "partners",
  "stats",
  "programmes",
] as const;
export type CollectionName = (typeof COLLECTIONS)[number];

export function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${crypto.randomBytes(2).toString("hex")}`;
}
