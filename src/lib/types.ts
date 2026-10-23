/**
 * Shapes of everything the site displays and every form submission.
 *
 * These are plain types (no runtime code), so client components can import
 * them freely. The database functions in docs/database/postgres/04-supabase-api.sql
 * read and write exactly these JSON shapes.
 */
import type { EventItem, Post, GalleryItem, Partner } from "@/content/data";

export type AdminUser = { passwordHash: string; salt: string; updatedAt: string };

export type Announcement = {
  enabled: boolean;
  tone: "info" | "success" | "warning" | "urgent";
  label: string;
  message: string;
  href: string;
  linkLabel: string;
  /** ISO dates (YYYY-MM-DD) — the bar hides itself outside this window when set; "" = no limit */
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

export type ProgrammeStatus = "open" | "closing-soon" | "closed" | "coming-soon";
export type ProgrammePillar = "SCIENCE" | "TECHNOLOGY" | "STEM" | "CHEMISTRY";
export type ProgrammeAccent = "sun" | "sky" | "mint" | "violet" | "coral";
export type ProgrammeIcon = "spell" | "code" | "trophy" | "flask";

/** A programme as stored in the database and edited in the admin. */
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
  /** optional headline prize line shown on the programme page */
  prizeNote?: string;
  /** optional full poster artwork shown beside the prize panel */
  poster?: string;
  registerHref: string;
  featured: boolean;
  status: ProgrammeStatus;
  /** one line describing the STEM pillar */
  pillarBlurb?: string;
  /** long description paragraphs for the programme page */
  description?: string[];
  /** bullet list of objectives */
  objectives?: string[];
  /** colour theme of the programme page */
  accent?: string;
  /** icon on the programme card */
  icon?: string;
};

export type Office = { id: string; city: string; address: string; phone: string; name?: string; mapQuery?: string };
export type SocialLink = { id: string; label: string; href: string; icon: string };
export type ExternalLink = { id: string; label: string; href: string; description: string };

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
  offices: Office[];
  socials: SocialLink[];
  externalLinks: ExternalLink[];
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

/** One entry in a submission's timeline (internal note or email reply). */
export type TimelineEntry = {
  at: string;
  text: string;
  by: string;
  kind?: "note" | "reply";
  subject?: string;
  emailStatus?: "sent" | "logged_only" | "failed" | null;
  /** the note or reply text without the "Reply sent: …" heading */
  body?: string;
};

export type ContactSubmission = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  organisation?: string;
  category: string;
  subject: string;
  message: string;
  status: "new" | "in-progress" | "replied" | "closed";
  notes: TimelineEntry[];
};

export type RegistrationType = "student" | "school" | "educator" | "professional" | "partner";

export type RegistrationSubmission = {
  id: string;
  createdAt: string;
  reference: string;
  type: string;
  /** programme slug */
  programme: string;
  programmeName?: string;
  /** event slug (or the code a link sent) */
  event?: string;
  eventTitle?: string;
  category?: string;
  format?: string;
  fullName?: string;
  firstName: string;
  lastName: string;
  /** YYYY-MM-DD or "" */
  dob?: string;
  gender?: string;
  email: string;
  phone: string;
  /** school name */
  school: string;
  grade?: string;
  schoolLocation?: string;
  state: string;
  city: string;
  role: string;
  organisation?: string;
  participants: string;
  /** free-text notes from the applicant */
  notes: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelationship?: string;
  consent?: boolean;
  consentAt?: string | null;
  status: "new" | "contacted" | "confirmed" | "waitlist" | "declined";
  thread: TimelineEntry[];
};

export type NewsletterSubmission = {
  id: string;
  createdAt: string;
  email: string;
  status: "subscribed" | "unsubscribed";
  source?: string;
  unsubscribedAt?: string | null;
};

export type NewsCategory = { name: string; description: string };

/** Everything the public pages display. */
export type SiteContent = {
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
  newsCategories: NewsCategory[];
  galleryCategories: string[];
};

export type Submissions = {
  contact: ContactSubmission[];
  register: RegistrationSubmission[];
  newsletter: NewsletterSubmission[];
};

/** What the admin dashboard works with: content + inbox + account metadata. */
export type Store = SiteContent & {
  submissions: Submissions;
  admin: { user: AdminUser | null };
  /** where the data came from — "database", or "defaults" when the database is not reachable */
  source?: "database" | "defaults";
  /** set when the database could not be reached */
  dbError?: string;
};

export const EDITABLE_SECTIONS = [
  "announcement",
  "hero",
  "site",
  "stats",
  "programmes",
  "events",
  "news",
  "gallery",
  "videos",
  "faqs",
  "testimonials",
  "partners",
] as const;
export type EditableSection = (typeof EDITABLE_SECTIONS)[number];
