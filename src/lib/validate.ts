/**
 * Cleans and checks what the admin dashboard sends before it is saved.
 *
 * The database enforces the same rules (column sizes, allowed values, unique
 * slugs), but checking here first means the admin gets a clear message such
 * as "Events › “Teachers Hangout”: Start date is required" instead of a
 * database error, and small slips (blank slug, stray empty lines, missing
 * register link) are fixed automatically.
 */
import type { EditableSection } from "@/lib/types";

type Obj = Record<string, unknown>;

type Field =
  | { k: string; t: "str"; max: number; label: string; required?: boolean; def?: string }
  | { k: string; t: "date"; label: string; required?: boolean }
  | { k: string; t: "bool"; def?: boolean }
  | { k: string; t: "enum"; label: string; values: readonly string[]; def: string }
  | { k: string; t: "list"; label: string; maxItem?: number }
  | { k: string; t: "keep" };

/** Long free text ("text" columns) is capped generously, just to stop accidents. */
const TEXT = 20_000;

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

function str(v: unknown): string {
  if (typeof v === "string") return v.replace(/\u0000/g, "").trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

function isRealDate(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160)
    .replace(/-+$/g, "");
}

function randomId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function cleanObject(input: unknown, fields: Field[], where: string): Obj {
  const src = isObj(input) ? input : {};
  const out: Obj = {};
  for (const f of fields) {
    const raw = src[f.k];
    switch (f.t) {
      case "keep":
        if (raw !== undefined) out[f.k] = raw;
        break;
      case "str": {
        const v = str(raw) || f.def || "";
        if (f.required && !v) throw new ValidationError(`${where}: ${f.label} is required.`);
        if (v.length > f.max) throw new ValidationError(`${where}: ${f.label} is too long (${v.length} characters, the limit is ${f.max}).`);
        out[f.k] = v;
        break;
      }
      case "date": {
        const v = str(raw);
        if (!v) {
          if (f.required) throw new ValidationError(`${where}: ${f.label} is required.`);
          out[f.k] = "";
        } else if (!isRealDate(v)) {
          throw new ValidationError(`${where}: ${f.label} must be a real date (YYYY-MM-DD).`);
        } else out[f.k] = v;
        break;
      }
      case "bool":
        out[f.k] = typeof raw === "boolean" ? raw : raw === "true" ? true : raw === "false" ? false : (f.def ?? false);
        break;
      case "enum": {
        const v = str(raw);
        out[f.k] = f.values.includes(v) ? v : v === "" ? f.def : (() => {
          throw new ValidationError(`${where}: ${f.label} must be one of: ${f.values.filter(Boolean).join(", ")}.`);
        })();
        break;
      }
      case "list": {
        const list = (Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split("\n") : []).map(str).filter(Boolean);
        const max = f.maxItem ?? TEXT;
        const long = list.find((x) => x.length > max);
        if (long) throw new ValidationError(`${where}: one line of ${f.label} is too long (limit ${max} characters).`);
        out[f.k] = list;
        break;
      }
    }
  }
  return out;
}

function cleanList(
  input: unknown,
  fields: Field[],
  opts: {
    section: string;
    idPrefix: string;
    title: (item: Obj, index: number) => string;
    slugFrom?: string;
    after?: (item: Obj, where: string) => void;
  },
): Obj[] {
  if (!Array.isArray(input)) throw new ValidationError(`${opts.section}: expected a list.`);
  const ids = new Set<string>();
  const slugs = new Map<string, string>();
  return input.map((raw, i) => {
    const rawObj = isObj(raw) ? raw : {};
    const where = `${opts.section} › “${opts.title(rawObj, i) || `item ${i + 1}`}”`;
    const item = cleanObject(rawObj, fields, where);
    let id = str(rawObj.id);
    if (!id || ids.has(id)) id = randomId(opts.idPrefix);
    if (id.length > 100) throw new ValidationError(`${where}: id is too long.`);
    ids.add(id);
    item.id = id;
    if (opts.slugFrom) {
      const slug = slugify(str(rawObj.slug)) || slugify(str(rawObj[opts.slugFrom]));
      if (!slug) throw new ValidationError(`${where}: give it a ${opts.slugFrom} (used to build its web address).`);
      if (slugs.has(slug)) throw new ValidationError(`${where}: the URL slug “${slug}” is already used by “${slugs.get(slug)}”. Slugs must be unique.`);
      slugs.set(slug, opts.title(rawObj, i) || slug);
      item.slug = slug;
    }
    opts.after?.(item, where);
    return item;
  });
}

/* --------------------------------------------------------------- sections */

const announcementFields: Field[] = [
  { k: "enabled", t: "bool", def: false },
  { k: "tone", t: "enum", label: "Colour", values: ["info", "success", "warning", "urgent"], def: "info" },
  { k: "label", t: "str", max: 60, label: "Badge label" },
  { k: "message", t: "str", max: 500, label: "Message" },
  { k: "href", t: "str", max: 1024, label: "Link destination" },
  { k: "linkLabel", t: "str", max: 80, label: "Link label" },
  { k: "startsAt", t: "date", label: "Hide until" },
  { k: "endsAt", t: "date", label: "Hide after" },
];

const heroFields: Field[] = [
  { k: "badgeLabel", t: "str", max: 60, label: "Badge label" },
  { k: "badgeText", t: "str", max: 255, label: "Badge text" },
  { k: "badgeHref", t: "str", max: 1024, label: "Badge link" },
  { k: "headline", t: "str", max: 500, label: "Headline" },
  { k: "rotatingWords", t: "list", label: "Rotating words", maxItem: 120 },
  { k: "subheading", t: "str", max: TEXT, label: "Sub-heading" },
  { k: "primaryCtaLabel", t: "str", max: 80, label: "Main button label" },
  { k: "primaryCtaHref", t: "str", max: 1024, label: "Main button link" },
  { k: "secondaryCtaLabel", t: "str", max: 80, label: "Second button label" },
  { k: "secondaryCtaHref", t: "str", max: 1024, label: "Second button link" },
  { k: "backgroundImage", t: "str", max: 1024, label: "Background image" },
  { k: "featureImage", t: "str", max: 1024, label: "Main feature image" },
  { k: "featureEyebrow", t: "str", max: 255, label: "Label over the photo" },
  { k: "featureCaption", t: "str", max: 255, label: "Caption under the photo" },
  { k: "secondaryImage", t: "str", max: 1024, label: "Floating image" },
  { k: "secondaryImageCaption", t: "str", max: 255, label: "Floating image caption" },
];

const siteFields: Field[] = [
  { k: "name", t: "str", max: 120, label: "Organisation name" },
  { k: "tagline", t: "str", max: 255, label: "Tagline" },
  { k: "description", t: "str", max: TEXT, label: "Meta description" },
  { k: "email", t: "str", max: 200, label: "Email address" },
  { k: "primaryPhone", t: "str", max: 40, label: "Primary phone" },
  { k: "whatsapp", t: "str", max: 40, label: "WhatsApp number" },
  { k: "secondaryPhone", t: "str", max: 40, label: "Secondary phone" },
  { k: "address", t: "str", max: 500, label: "Head office address" },
  { k: "registrationNote", t: "str", max: TEXT, label: "Registration note" },
  { k: "registrationOpens", t: "date", label: "Registration opens" },
  { k: "registrationCloses", t: "date", label: "Registration closes" },
  { k: "footerNote", t: "str", max: 500, label: "Footer note" },
];

const officeFields: Field[] = [
  { k: "name", t: "str", max: 160, label: "Office name" },
  { k: "city", t: "str", max: 120, label: "City" },
  { k: "address", t: "str", max: 500, label: "Address" },
  { k: "phone", t: "str", max: 40, label: "Phone" },
  { k: "mapQuery", t: "str", max: 500, label: "Map search text" },
];

const socialFields: Field[] = [
  { k: "label", t: "str", max: 80, label: "Label" },
  { k: "href", t: "str", max: 1024, label: "URL" },
  { k: "icon", t: "str", max: 20, label: "Icon", def: "link" },
];

const externalLinkFields: Field[] = [
  { k: "label", t: "str", max: 160, label: "Label" },
  { k: "href", t: "str", max: 1024, label: "URL" },
  { k: "description", t: "str", max: TEXT, label: "Description" },
];

const statFields: Field[] = [
  { k: "value", t: "str", max: 40, label: "Value" },
  { k: "label", t: "str", max: 120, label: "Label" },
  { k: "icon", t: "str", max: 30, label: "Icon", def: "sparkles" },
];

export const PROGRAMME_STATUSES = ["open", "closing-soon", "closed", "coming-soon"] as const;
export const PROGRAMME_PILLARS = ["SCIENCE", "TECHNOLOGY", "STEM", "CHEMISTRY"] as const;
export const PROGRAMME_ACCENTS = ["sun", "sky", "mint", "violet", "coral"] as const;
export const PROGRAMME_ICONS = ["spell", "code", "trophy", "flask"] as const;

const programmeFields: Field[] = [
  { k: "name", t: "str", max: 200, label: "Programme name", required: true },
  { k: "subtitle", t: "str", max: 255, label: "Subtitle" },
  { k: "tagline", t: "str", max: 255, label: "Tagline" },
  { k: "shortDescription", t: "str", max: TEXT, label: "Short description" },
  { k: "eligibility", t: "str", max: TEXT, label: "Eligibility" },
  { k: "format", t: "str", max: 255, label: "Format" },
  { k: "ageRange", t: "str", max: 120, label: "Age / class range" },
  { k: "image", t: "str", max: 1024, label: "Image" },
  { k: "imageAlt", t: "str", max: 255, label: "Image alt text" },
  { k: "pillar", t: "enum", label: "Pillar", values: PROGRAMME_PILLARS, def: "STEM" },
  { k: "ctaLabel", t: "str", max: 120, label: "Button label", def: "Register interest" },
  { k: "highlights", t: "str", max: TEXT, label: "Key facts" },
  { k: "prizeNote", t: "str", max: 500, label: "Headline prize" },
  { k: "poster", t: "str", max: 1024, label: "Poster" },
  { k: "registerHref", t: "str", max: 1024, label: "Button link" },
  { k: "featured", t: "bool", def: true },
  { k: "status", t: "enum", label: "Registration status", values: PROGRAMME_STATUSES, def: "open" },
  { k: "pillarBlurb", t: "str", max: 255, label: "Pillar blurb" },
  { k: "description", t: "list", label: "Description" },
  { k: "objectives", t: "list", label: "Objectives" },
  { k: "accent", t: "enum", label: "Colour theme", values: PROGRAMME_ACCENTS, def: "sun" },
  { k: "icon", t: "enum", label: "Icon", values: PROGRAMME_ICONS, def: "trophy" },
];

const eventFields: Field[] = [
  { k: "title", t: "str", max: 255, label: "Event title", required: true },
  { k: "start", t: "date", label: "Start date", required: true },
  { k: "end", t: "date", label: "End date" },
  { k: "displayDate", t: "str", max: 120, label: "Displayed date" },
  { k: "location", t: "str", max: 255, label: "Venue / location" },
  { k: "mode", t: "enum", label: "Mode", values: ["Physical", "Virtual", "Hybrid"], def: "Physical" },
  { k: "description", t: "str", max: TEXT, label: "Description" },
  { k: "deadline", t: "str", max: 120, label: "Registration deadline" },
  { k: "registerHref", t: "str", max: 1024, label: "Register link" },
  { k: "tag", t: "str", max: 80, label: "Tag" },
  { k: "image", t: "str", max: 1024, label: "Image" },
];

const newsFields: Field[] = [
  { k: "title", t: "str", max: 300, label: "Headline", required: true },
  { k: "excerpt", t: "str", max: TEXT, label: "Excerpt" },
  { k: "category", t: "str", max: 60, label: "Category", def: "AFRISTEM News" },
  { k: "date", t: "date", label: "Date", required: true },
  { k: "displayDate", t: "str", max: 120, label: "Displayed date" },
  { k: "readTime", t: "str", max: 40, label: "Reading time", def: "3 min read" },
  { k: "image", t: "str", max: 1024, label: "Cover image" },
  { k: "author", t: "str", max: 120, label: "Author", def: "AFRISTEM Team" },
  { k: "body", t: "list", label: "Article body" },
];

const galleryFields: Field[] = [
  { k: "src", t: "str", max: 1024, label: "Image", required: true },
  { k: "alt", t: "str", max: 500, label: "Alt text" },
  { k: "caption", t: "str", max: 255, label: "Caption" },
  { k: "category", t: "str", max: 60, label: "Category", def: "Events" },
  { k: "span", t: "enum", label: "Tile shape", values: ["", "wide", "tall"], def: "" },
];

const videoFields: Field[] = [
  { k: "title", t: "str", max: 255, label: "Video title" },
  { k: "description", t: "str", max: TEXT, label: "Description" },
  { k: "youtubeId", t: "str", max: 255, label: "YouTube link or ID" },
  { k: "thumb", t: "str", max: 1024, label: "Thumbnail" },
  { k: "category", t: "str", max: 80, label: "Category", def: "Highlights" },
  { k: "featured", t: "bool", def: false },
];

const faqFields: Field[] = [
  { k: "question", t: "str", max: 500, label: "Question" },
  { k: "answer", t: "str", max: TEXT, label: "Answer" },
  { k: "category", t: "str", max: 80, label: "Category", def: "General" },
];

const testimonialFields: Field[] = [
  { k: "quote", t: "str", max: TEXT, label: "Quote" },
  { k: "name", t: "str", max: 120, label: "Name" },
  { k: "role", t: "str", max: 160, label: "Role" },
  { k: "org", t: "str", max: 160, label: "School / organisation" },
  { k: "image", t: "str", max: 1024, label: "Photo" },
  { k: "initials", t: "str", max: 10, label: "Avatar initials" },
  { k: "featured", t: "bool", def: false },
];

const partnerFields: Field[] = [
  { k: "name", t: "str", max: 200, label: "Organisation name", required: true },
  { k: "logo", t: "str", max: 1024, label: "Logo" },
  { k: "type", t: "str", max: 80, label: "Type", def: "Partner" },
  { k: "description", t: "list", label: "Description" },
  { k: "href", t: "str", max: 1024, label: "Website or page" },
  { k: "ctaLabel", t: "str", max: 80, label: "Button label", def: "Learn more" },
  { k: "external", t: "bool", def: false },
  { k: "country", t: "str", max: 80, label: "Country" },
];

/** Drops optional keys that are empty, matching what the database returns. */
function omitEmpty(item: Obj, keys: string[]) {
  for (const k of keys) if (item[k] === "" || item[k] === false || item[k] === undefined) delete item[k];
}

/**
 * Returns the cleaned value for a section, or throws ValidationError with a
 * message the admin can act on.
 */
export function normaliseSection(section: EditableSection, value: unknown): unknown {
  switch (section) {
    case "announcement":
      return cleanObject(value, announcementFields, "Announcement");
    case "hero": {
      const hero = cleanObject(value, heroFields, "Homepage hero");
      return hero;
    }
    case "site": {
      const src = isObj(value) ? value : {};
      const site = cleanObject(src, siteFields, "Brand & contact");
      if (site.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(site.email))) {
        throw new ValidationError("Brand & contact: the email address does not look right.");
      }
      site.offices = cleanList(src.offices ?? [], officeFields, { section: "Offices", idPrefix: "office", title: (o) => str(o.city) });
      site.socials = cleanList(src.socials ?? [], socialFields, { section: "Social links", idPrefix: "social", title: (o) => str(o.label) });
      site.externalLinks = cleanList(src.externalLinks ?? [], externalLinkFields, { section: "External sites", idPrefix: "ext", title: (o) => str(o.label) });
      return site;
    }
    case "stats":
      return cleanList(value, statFields, { section: "Statistics", idPrefix: "stat", title: (o) => str(o.label) });
    case "programmes":
      return cleanList(value, programmeFields, {
        section: "Programmes",
        idPrefix: "prog",
        title: (o) => str(o.name),
        slugFrom: "name",
        after: (p) => {
          if (!p.registerHref) p.registerHref = `/register?programme=${p.slug}`;
        },
      });
    case "events":
      return cleanList(value, eventFields, {
        section: "Events",
        idPrefix: "event",
        title: (o) => str(o.title),
        slugFrom: "title",
        after: (e, where) => {
          if (!e.registerHref) e.registerHref = `/register?event=${e.slug}`;
          if (e.end && String(e.end) < String(e.start)) throw new ValidationError(`${where}: the end date is before the start date.`);
          omitEmpty(e, ["end", "deadline"]);
        },
      });
    case "news":
      return cleanList(value, newsFields, { section: "News", idPrefix: "post", title: (o) => str(o.title), slugFrom: "title" });
    case "gallery":
      return cleanList(value, galleryFields, {
        section: "Gallery",
        idPrefix: "photo",
        title: (o, i) => str(o.caption) || `photo ${i + 1}`,
        after: (g) => omitEmpty(g, ["span"]),
      });
    case "videos":
      return cleanList(value, videoFields, { section: "Videos", idPrefix: "video", title: (o) => str(o.title) });
    case "faqs":
      return cleanList(value, faqFields, { section: "FAQs", idPrefix: "faq", title: (o) => str(o.question).slice(0, 60) });
    case "testimonials":
      return cleanList(value, testimonialFields, { section: "Testimonials", idPrefix: "t", title: (o) => str(o.name) });
    case "partners":
      return cleanList(value, partnerFields, {
        section: "Partners",
        idPrefix: "partner",
        title: (o) => str(o.name),
        slugFrom: "name",
        after: (p) => omitEmpty(p, ["external", "country"]),
      });
  }
}
