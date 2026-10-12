"use client";

import { useCallback, useState } from "react";
import { eventStatusLabel } from "@/lib/events";
import { Field, Repeater, SectionCard, SaveBar, type FieldDef } from "@/components/admin/fields";
import type { Announcement, FaqItem, HeroContent, ProgrammeEdit, SiteSettings, StatItem, Store, Testimonial, VideoItem } from "@/lib/store";
import type { EventRecord, GalleryRecord, PartnerRecord, PostRecord } from "@/lib/store";

export type SectionKey =
  | "announcement"
  | "hero"
  | "site"
  | "stats"
  | "programmes"
  | "events"
  | "news"
  | "gallery"
  | "videos"
  | "faqs"
  | "testimonials"
  | "partners";

export type SectionProps = {
  content: Store;
  save: (section: SectionKey, value: unknown) => Promise<void>;
  reset: (section: SectionKey) => Promise<unknown>;
};

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;
const now = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

/** Local draft state with dirty/save bookkeeping. */
function useDraft<T>(initial: T, commit: (value: T) => Promise<void>, resetTo?: () => Promise<unknown>) {
  const [value, setValue] = useState<T>(initial);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState("");

  const update = useCallback((next: T) => {
    setValue(next);
    setDirty(true);
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      await commit(value);
      setDirty(false);
      setSavedAt(now());
    } catch (error) {
      alert((error as Error).message || "Could not save");
    } finally {
      setSaving(false);
    }
  }, [commit, value]);

  const reset = useCallback(async () => {
    if (!resetTo) return;
    const next = (await resetTo()) as T;
    setValue(next);
    setDirty(false);
    setSavedAt(now());
  }, [resetTo]);

  return { value, update, dirty, saving, savedAt, save, reset };
}

/* ------------------------------------------------------------------- shells */

function FormShell({
  title,
  description,
  fields,
  draft,
}: {
  title: string;
  description: string;
  fields: FieldDef[];
  draft: ReturnType<typeof useDraft<Record<string, unknown>>>;
}) {
  return (
    <div className="space-y-5">
      <SectionCard title={title} description={description}>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className={f.span === 2 || f.type === "textarea" || f.type === "list" ? "sm:col-span-2" : undefined}>
              <Field def={f} value={draft.value[f.key]} onChange={(v) => draft.update({ ...draft.value, [f.key]: v })} />
            </div>
          ))}
        </div>
      </SectionCard>
      <SaveBar dirty={draft.dirty} saving={draft.saving} savedAt={draft.savedAt} onSave={() => void draft.save()} onReset={() => void draft.reset()} />
    </div>
  );
}

function CollectionShell<T extends { id: string }>({
  title,
  description,
  items,
  setItems,
  draft,
  addLabel,
  itemTitle,
  itemSubtitle,
  fields,
  blank,
}: {
  title: string;
  description: string;
  items: T[];
  setItems: (v: T[]) => void;
  draft: ReturnType<typeof useDraft<T[]>>;
  addLabel: string;
  itemTitle: (item: T, i: number) => string;
  itemSubtitle?: (item: T) => string;
  fields: FieldDef[];
  blank: () => T;
}) {
  return (
    <div className="space-y-5">
      <SectionCard title={title} description={description}>
        <Repeater
          items={items}
          onChange={setItems}
          addLabel={addLabel}
          itemTitle={itemTitle}
          itemSubtitle={itemSubtitle}
          fields={fields}
          blank={blank}
        />
      </SectionCard>
      <SaveBar dirty={draft.dirty} saving={draft.saving} savedAt={draft.savedAt} onSave={() => void draft.save()} onReset={() => void draft.reset()} />
    </div>
  );
}

/* -------------------------------------------------------------- singletons */

export function AnnouncementSection({ content, save, reset }: SectionProps) {
  const draft = useDraft<Record<string, unknown>>(
    content.announcement as unknown as Record<string, unknown>,
    (v) => save("announcement", v as unknown as Announcement),
    () => reset("announcement"),
  );
  return (
    <FormShell
      title="Announcement bar"
      description="The strip at the very top of every page. Switch it off, or set a date window so it disappears on its own."
      draft={draft}
      fields={[
        { key: "enabled", label: "Show on site", type: "boolean" },
        { key: "tone", label: "Colour", type: "select", options: ["info", "success", "warning", "urgent"] },
        { key: "label", label: "Badge label", placeholder: "New" },
        { key: "message", label: "Message", span: 2 },
        { key: "linkLabel", label: "Link label", placeholder: "Register now" },
        { key: "href", label: "Link destination", placeholder: "/register" },
        { key: "startsAt", label: "Hide until", type: "date", help: "optional" },
        { key: "endsAt", label: "Hide after", type: "date", help: "optional" },
      ]}
    />
  );
}

export function HeroSection({ content, save, reset }: SectionProps) {
  const draft = useDraft<Record<string, unknown>>(
    content.hero as unknown as Record<string, unknown>,
    (v) => save("hero", v as unknown as HeroContent),
    () => reset("hero"),
  );
  return (
    <FormShell
      title="Homepage hero"
      description="Headline, rotating words, buttons and the images that appear at the top of the homepage."
      draft={draft}
      fields={[
        { key: "headline", label: "Headline (first part)", span: 2 },
        { key: "rotatingWords", label: "Rotating words", type: "list", help: "one per line — these animate" },
        { key: "subheading", label: "Sub-heading", type: "textarea" },
        { key: "badgeLabel", label: "Badge label" },
        { key: "badgeText", label: "Badge text" },
        { key: "badgeHref", label: "Badge links to" },
        { key: "primaryCtaLabel", label: "Main button label" },
        { key: "primaryCtaHref", label: "Main button link" },
        { key: "secondaryCtaLabel", label: "Second button label" },
        { key: "secondaryCtaHref", label: "Second button link" },
        { key: "backgroundImage", label: "Background image", type: "image" },
        { key: "featureImage", label: "Main feature image", type: "image" },
        { key: "featureEyebrow", label: "Small label over the photo", help: "e.g. 2025 Nigerian STEM Championship" },
        { key: "featureCaption", label: "Caption under the photo", help: "shown on the photo and in the ribbon beneath it" },
        { key: "secondaryImage", label: "Floating image (desktop)", type: "image" },
        { key: "secondaryImageCaption", label: "Floating image caption (desktop)" },
      ]}
    />
  );
}

export function SiteSection({ content, save, reset }: SectionProps) {
  const draft = useDraft<SiteSettings>(content.site, (v) => save("site", v), () => reset("site") as Promise<SiteSettings>);
  const set = (patch: Partial<SiteSettings>) => draft.update({ ...draft.value, ...patch });

  return (
    <div className="space-y-5">
      <SectionCard title="Brand & contact details" description="Used in the header, footer, contact page and every automated email.">
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              { key: "name", label: "Organisation name" },
              { key: "tagline", label: "Tagline" },
              { key: "description", label: "Meta description", span: 2 },
              { key: "email", label: "Email address" },
              { key: "primaryPhone", label: "Primary phone" },
              { key: "whatsapp", label: "WhatsApp number" },
              { key: "secondaryPhone", label: "Secondary phone" },
              { key: "address", label: "Head office address", span: 2 },
              { key: "registrationNote", label: "Note on the registration page", type: "textarea" },
              { key: "registrationOpens", label: "Registration opens", type: "date" },
              { key: "registrationCloses", label: "Registration closes", type: "date" },
              { key: "footerNote", label: "Footer note", span: 2 },
            ] as FieldDef[]
          ).map((f) => (
            <div key={f.key} className={f.span === 2 || f.type === "textarea" ? "sm:col-span-2" : undefined}>
              <Field
                def={f}
                value={(draft.value as unknown as Record<string, unknown>)[f.key]}
                onChange={(v) => set({ [f.key]: v } as Partial<SiteSettings>)}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Offices" description="Shown on the contact page and in the footer.">
        <Repeater
          items={draft.value.offices}
          onChange={(offices) => set({ offices })}
          addLabel="Add office"
          itemTitle={(o) => o.city || "New office"}
          itemSubtitle={(o) => o.address}
          blank={() => ({ id: uid("office"), city: "", address: "", phone: "" })}
          fields={[
            { key: "city", label: "City" },
            { key: "phone", label: "Phone" },
            { key: "address", label: "Address", span: 2 },
          ]}
        />
      </SectionCard>

      <SectionCard title="Social links" description="Footer and contact page icons.">
        <Repeater
          items={draft.value.socials}
          onChange={(socials) => set({ socials })}
          addLabel="Add social link"
          itemTitle={(s) => s.label || "New link"}
          itemSubtitle={(s) => s.href}
          blank={() => ({ id: uid("social"), label: "", href: "", icon: "link" })}
          fields={[
            { key: "label", label: "Label" },
            {
              key: "icon",
              label: "Icon",
              type: "select",
              options: ["facebook", "instagram", "x", "youtube", "linkedin", "tiktok", "whatsapp", "link"],
            },
            { key: "href", label: "URL", span: 2 },
          ]}
        />
      </SectionCard>

      <SectionCard title="External sites" description="Sister sites such as Prime STEM Nigeria. These open in a new tab from the navigation.">
        <Repeater
          items={draft.value.externalLinks}
          onChange={(externalLinks) => set({ externalLinks })}
          addLabel="Add link"
          itemTitle={(l) => l.label || "New link"}
          itemSubtitle={(l) => l.href}
          blank={() => ({ id: uid("ext"), label: "", href: "", description: "" })}
          fields={[
            { key: "label", label: "Label" },
            { key: "href", label: "URL" },
            { key: "description", label: "Description", type: "textarea" },
          ]}
        />
      </SectionCard>

      <SaveBar dirty={draft.dirty} saving={draft.saving} savedAt={draft.savedAt} onSave={() => void draft.save()} onReset={() => void draft.reset()} />
    </div>
  );
}

/* ------------------------------------------------------------- collections */

export function StatsSection({ content, save, reset }: SectionProps) {
  const draft = useDraft<StatItem[]>(content.stats, (v) => save("stats", v), () => reset("stats") as Promise<StatItem[]>);
  return (
    <CollectionShell<StatItem>
      title="Impact statistics"
      description="The big numbers shown on the homepage and about page."
      items={draft.value}
      setItems={draft.update}
      draft={draft}
      addLabel="Add statistic"
      itemTitle={(s) => `${s.value} — ${s.label}`}
      blank={() => ({ id: uid("stat"), value: "", label: "", icon: "sparkles" })}
      fields={[
        { key: "value", label: "Value", placeholder: "5,867+" },
        { key: "label", label: "Label", placeholder: "Students reached" },
        { key: "icon", label: "Icon", type: "select", options: ["sparkles", "users", "school", "trophy", "flask", "cpu", "globe", "star"] },
      ]}
    />
  );
}

export function ProgrammesSection({ content, save, reset }: SectionProps) {
  const draft = useDraft<ProgrammeEdit[]>(content.programmes, (v) => save("programmes", v), () => reset("programmes") as Promise<ProgrammeEdit[]>);
  return (
    <CollectionShell<ProgrammeEdit>
      title="Programmes"
      description="What each programme is, who it is for, when it runs and where its buttons lead."
      items={draft.value}
      setItems={draft.update}
      draft={draft}
      addLabel="Add programme"
      itemTitle={(p) => p.name || "New programme"}
      itemSubtitle={(p) => `${p.subtitle || p.pillar} · ${p.status}`}
      blank={() => ({
        id: uid("prog"),
        slug: "",
        name: "",
        subtitle: "",
        tagline: "",
        shortDescription: "",
        eligibility: "",
        format: "",
        ageRange: "",
        image: "",
        imageAlt: "",
        pillar: "STEM",
        ctaLabel: "Register interest",
        highlights: "",
        prizeNote: "",
        poster: "",
        registerHref: "/register",
        featured: true,
        status: "open" as const,
      })}
      fields={[
        { key: "name", label: "Programme name" },
        { key: "subtitle", label: "Subtitle" },
        { key: "slug", label: "URL slug", help: "e.g. scispell" },
        { key: "status", label: "Registration status", type: "select", options: ["open", "closing-soon", "closed", "coming-soon"] },
        { key: "tagline", label: "Tagline", span: 2 },
        { key: "shortDescription", label: "Short description", type: "textarea", rows: 3 },
        { key: "pillar", label: "Pillar", type: "select", options: ["SCIENCE", "TECHNOLOGY", "STEM", "CHEMISTRY"] },
        { key: "ageRange", label: "Age / class range" },
        { key: "eligibility", label: "Eligibility", span: 2 },
        { key: "format", label: "Format / structure", span: 2 },
        { key: "highlights", label: "Key facts", type: "list", rows: 4, help: "one \"Label: Value\" per line" },
        { key: "ctaLabel", label: "Button label" },
        { key: "registerHref", label: "Button links to" },
        { key: "prizeNote", label: "Headline prize (optional)", span: 2, help: "shown as a highlighted band, e.g. Star Prize: ₦500,000 cash prize and plaque" },
        { key: "poster", label: "Full poster artwork (optional)", type: "image" },
        { key: "featured", label: "Show on homepage", type: "boolean" },
        { key: "image", label: "Image", type: "image" },
        { key: "imageAlt", label: "Image alt text" },
      ]}
    />
  );
}

export function EventsSection({ content, save, reset }: SectionProps) {
  const draft = useDraft<EventRecord[]>(content.events, (v) => save("events", v), () => reset("events") as Promise<EventRecord[]>);
  return (
    <CollectionShell<EventRecord>
      title="Events"
      description="Edition pages, original flyers, documents, registration deadlines and results. Date-only deadlines close at the end of that day in Africa/Lagos (WAT). AOCT needs a confirmed deadline before opening. Submissions are in Inbox → Registrations."
      items={draft.value}
      setItems={draft.update}
      draft={draft}
      addLabel="Add event"
      itemTitle={(e) => e.title || "New event"}
      itemSubtitle={(e) => `${e.displayDate} · ${e.registrationStatus ? eventStatusLabel(e) : e.location}`}
      blank={() => ({
        id: uid("event"),
        slug: uid("event"),
        title: "",
        start: new Date().toISOString().slice(0, 10),
        displayDate: "",
        location: "",
        mode: "Physical",
        description: "",
        registerHref: "/register",
        tag: "Programme",
        image: "",
      })}
      fields={[
        { key: "title", label: "Event title", span: 2 },
        { key: "slug", label: "Event URL slug", help: "Keep stable after publishing: /events/your-slug" },
        { key: "programmeSlug", label: "Linked programme slug" },
        { key: "registrationStatus", label: "Registration / results status", type: "select", options: ["pending", "open", "closed", "results"], help: "Open requires a closing date. Closed shows Awaiting results immediately; a passed deadline always closes registration." },
        { key: "registrationCloses", label: "Registration closing date (WAT)", type: "date", help: "Includes the full selected day, ending at midnight WAT. Extend the date and select open to reopen." },
        { key: "eligibility", label: "Eligible classes / candidates", type: "textarea" },
        { key: "fees", label: "Registration fees", type: "textarea" },
        { key: "awards", label: "Awards and conditions", type: "textarea" },
        { key: "instructions", label: "Exam and registration instructions", type: "textarea" },
        { key: "paymentInstructions", label: "Payment and verification instructions", type: "textarea" },
        { key: "contactEmail", label: "Organiser email" },
        { key: "contactPhone", label: "Organiser phone" },
        { key: "flyer", label: "Official flyer", type: "image" },
        { key: "documentCover", label: "Handbook cover", type: "image" },
        { key: "memorandumUrl", label: "Official memorandum PDF", type: "document" },
        { key: "handbookUrl", label: "Official handbook PDF", type: "document" },
        { key: "preparationUrl", label: "Preparatory guide purchase URL" },
        { key: "preparationLabel", label: "Preparatory guide description and price" },
        { key: "resultsUrl", label: "Verified results PDF / URL", type: "document" },
        { key: "resultsMessage", label: "Results announcement", type: "textarea", help: "Shown when status is results. Publish only verified results." },
        { key: "displayDate", label: "Displayed date", placeholder: "Oct 19 – 30, 2026" },
        { key: "start", label: "Start date", type: "date" },
        { key: "end", label: "End date", type: "date" },
        { key: "location", label: "Venue / location" },
        { key: "mode", label: "Mode", type: "select", options: ["Physical", "Virtual", "Hybrid"] },
        { key: "tag", label: "Tag", placeholder: "Awards" },
        { key: "registerHref", label: "Register button links to" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "image", label: "Image", type: "image" },
      ]}
    />
  );
}

export function NewsSection({ content, save, reset }: SectionProps) {
  const draft = useDraft<PostRecord[]>(content.news, (v) => save("news", v), () => reset("news") as Promise<PostRecord[]>);
  return (
    <CollectionShell<PostRecord>
      title="News & insights"
      description="Articles shown on the news page. Put each paragraph of the body on its own line."
      items={draft.value}
      setItems={draft.update}
      draft={draft}
      addLabel="Write article"
      itemTitle={(p) => p.title || "Untitled"}
      itemSubtitle={(p) => `${p.category} · ${p.displayDate}`}
      blank={() =>
        ({
          id: uid("post"),
          slug: uid("post"),
          title: "",
          excerpt: "",
          body: [],
          category: "AFRISTEM News",
          date: new Date().toISOString().slice(0, 10),
          displayDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
          author: "AFRISTEM Team",
          image: "",
          readTime: "3 min read",
        }) as PostRecord
      }
      fields={[
        { key: "eventSlug", label: "Related event slug (optional)", help: "Links this announcement to its live event page and registration status" },
        { key: "title", label: "Headline", span: 2 },
        {
          key: "category",
          label: "Category",
          type: "select",
          options: ["AFRISTEM News", "STEM Education", "Innovation", "STEM Careers", "Student Stories", "School Stories", "Opportunities"],
        },
        { key: "date", label: "Date", type: "date" },
        { key: "displayDate", label: "Displayed date" },
        { key: "author", label: "Author" },
        { key: "slug", label: "URL slug" },
        { key: "readTime", label: "Reading time", placeholder: "4 min read" },
        { key: "excerpt", label: "Excerpt", type: "textarea", rows: 3 },
        { key: "body", label: "Article body", type: "list", rows: 10, help: "one paragraph per line" },
        { key: "image", label: "Cover image", type: "image" },
      ]}
    />
  );
}

export function GallerySection({ content, save, reset }: SectionProps) {
  const draft = useDraft<GalleryRecord[]>(content.gallery, (v) => save("gallery", v), () => reset("gallery") as Promise<GalleryRecord[]>);
  return (
    <CollectionShell<GalleryRecord>
      title="Gallery"
      description="Photos across the site. Upload new ones or pick from the library, then choose a tile shape to build a varied mosaic."
      items={draft.value}
      setItems={draft.update}
      draft={draft}
      addLabel="Add photo"
      itemTitle={(g) => g.caption || g.src || "New photo"}
      itemSubtitle={(g) => g.category}
      blank={() => ({ id: uid("photo"), src: "", alt: "", caption: "", category: "Events" }) as GalleryRecord}
      fields={[
        { key: "src", label: "Image", type: "image", span: 2 },
        { key: "caption", label: "Caption" },
        { key: "alt", label: "Alt text", help: "describes the photo for screen readers" },
        {
          key: "category",
          label: "Category",
          type: "select",
          options: ["Programmes", "Competitions", "Training", "Workshops", "Students", "Schools", "STEM Projects", "Events"],
        },
        { key: "span", label: "Tile shape", type: "select", options: ["", "wide", "tall"], help: "wide spans two columns" },
      ]}
    />
  );
}

export function VideosSection({ content, save, reset }: SectionProps) {
  const draft = useDraft<VideoItem[]>(content.videos, (v) => save("videos", v), () => reset("videos") as Promise<VideoItem[]>);
  return (
    <CollectionShell<VideoItem>
      title="Videos"
      description="Paste a YouTube link or ID. Leave the thumbnail blank and the site uses YouTube's own preview image."
      items={draft.value}
      setItems={draft.update}
      draft={draft}
      addLabel="Add video"
      itemTitle={(v) => v.title || "New video"}
      itemSubtitle={(v) => `${v.category} · ${v.youtubeId || "no ID yet"}`}
      blank={() => ({ id: uid("video"), title: "", description: "", youtubeId: "", thumb: "", category: "Highlights", featured: false })}
      fields={[
        { key: "title", label: "Video title", span: 2 },
        { key: "youtubeId", label: "YouTube link or ID", placeholder: "https://youtu.be/…" },
        { key: "category", label: "Category" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "thumb", label: "Thumbnail", type: "image", help: "optional" },
        { key: "featured", label: "Feature on homepage", type: "boolean" },
      ]}
    />
  );
}

export function FaqsSection({ content, save, reset }: SectionProps) {
  const draft = useDraft<FaqItem[]>(content.faqs, (v) => save("faqs", v), () => reset("faqs") as Promise<FaqItem[]>);
  return (
    <CollectionShell<FaqItem>
      title="FAQs"
      description="Questions and answers in the FAQ accordion and on the contact page."
      items={draft.value}
      setItems={draft.update}
      draft={draft}
      addLabel="Add question"
      itemTitle={(f) => f.question || "New question"}
      itemSubtitle={(f) => f.category}
      blank={() => ({ id: uid("faq"), question: "", answer: "", category: "General" })}
      fields={[
        { key: "question", label: "Question", span: 2 },
        { key: "answer", label: "Answer", type: "textarea", rows: 5 },
        { key: "category", label: "Category" },
      ]}
    />
  );
}

export function TestimonialsSection({ content, save, reset }: SectionProps) {
  const draft = useDraft<Testimonial[]>(content.testimonials, (v) => save("testimonials", v), () => reset("testimonials") as Promise<Testimonial[]>);
  return (
    <CollectionShell<Testimonial>
      title="Testimonials"
      description="Quotes from students, teachers, school leaders and partners."
      items={draft.value}
      setItems={draft.update}
      draft={draft}
      addLabel="Add testimonial"
      itemTitle={(t) => t.name || "New testimonial"}
      itemSubtitle={(t) => t.role}
      blank={() => ({ id: uid("t"), quote: "", name: "", role: "", org: "", image: "", initials: "", featured: false })}
      fields={[
        { key: "quote", label: "Quote", type: "textarea", rows: 4 },
        { key: "name", label: "Name" },
        { key: "role", label: "Role" },
        { key: "org", label: "School / organisation" },
        { key: "initials", label: "Avatar initials", help: "up to 2 letters — generated from the name if blank" },
        { key: "image", label: "Photo", type: "image" },
        { key: "featured", label: "Feature", type: "boolean" },
      ]}
    />
  );
}

export function PartnersSection({ content, save, reset }: SectionProps) {
  const draft = useDraft<PartnerRecord[]>(content.partners, (v) => save("partners", v), () => reset("partners") as Promise<PartnerRecord[]>);
  return (
    <CollectionShell<PartnerRecord>
      title="Partners & sponsors"
      description="Logos and descriptions shown on the partners page and the homepage strip."
      items={draft.value}
      setItems={draft.update}
      draft={draft}
      addLabel="Add partner"
      itemTitle={(p) => p.name || "New partner"}
      itemSubtitle={(p) => p.type}
      blank={() =>
        ({
          id: uid("partner"),
          slug: uid("partner"),
          name: "",
          logo: "",
          type: "Partner",
          description: [],
          href: "",
          ctaLabel: "Learn more",
        }) as PartnerRecord
      }
      fields={[
        { key: "name", label: "Organisation name" },
        { key: "type", label: "Type", placeholder: "Ecosystem Partner" },
        { key: "slug", label: "URL slug" },
        { key: "country", label: "Country" },
        { key: "href", label: "Website or page", placeholder: "https://" },
        { key: "ctaLabel", label: "Button label", placeholder: "Learn more" },
        { key: "external", label: "Opens in a new tab", type: "boolean" },
        { key: "description", label: "Description", type: "list", rows: 4, help: "one paragraph per line" },
        { key: "logo", label: "Logo", type: "image", span: 2 },
      ]}
    />
  );
}
