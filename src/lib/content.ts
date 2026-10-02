/**
 * Page-facing content accessors.
 *
 * Pages call these synchronously inside server components. Content pages are
 * rendered dynamically (see `export const dynamic = "force-dynamic"` in the
 * site layout) so admin edits appear on the very next request. Reads are cheap:
 * the store is cached in memory and invalidated by the file's mtime.
 */
import { readStore, getAnnouncement } from "@/lib/store";
import type { ProgrammeEdit, Store } from "@/lib/store";
import { programmes as staticProgrammes, type Programme } from "@/content/programmes";

export function content(): Store {
  return readStore();
}

/**
 * Overlays admin edits (name, dates, imagery, CTA, status…) onto the full
 * programme definitions that power the detail pages.
 */
export function mergeProgrammes(edits: ProgrammeEdit[]): Programme[] {
  return staticProgrammes.map((base) => {
    const edit = edits.find((e) => e.slug === base.slug);
    if (!edit) return base;
    return {
      ...base,
      name: edit.name || base.name,
      subtitle: edit.subtitle || base.subtitle,
      tagline: edit.tagline || base.tagline,
      shortDescription: edit.shortDescription || base.shortDescription,
      eligibility: edit.eligibility || base.eligibility,
      format: edit.format || base.format,
      ageRange: edit.ageRange || base.ageRange,
      image: edit.image || base.image,
      imageAlt: edit.imageAlt || base.imageAlt,
      ctaLabel: edit.ctaLabel || base.ctaLabel,
      highlights: edit.highlights
        ? edit.highlights
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
              const [label, ...rest] = line.split(":");
              return { label: label.trim(), value: rest.join(":").trim() };
            })
        : base.highlights,
      // these two are optional: an empty admin value falls back to the shipped one
      prizeNote: edit.prizeNote || base.prizeNote,
      poster: edit.poster || base.poster,
    };
  });
}

/** Programmes the admin has chosen to feature, else everything. */
export function featuredProgrammes(edits: ProgrammeEdit[]): Programme[] {
  const featured = edits.filter((e) => e.featured);
  return mergeProgrammes(featured.length ? featured : edits);
}

export function programmeEdit(edits: ProgrammeEdit[], slug: string): ProgrammeEdit | undefined {
  return edits.find((e) => e.slug === slug);
}

export { getAnnouncement };
export type { Store };
