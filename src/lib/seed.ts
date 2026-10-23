/**
 * The shipped starting content.
 *
 * This is what docs/database/postgres/02-seed.sql puts in a new database, what
 * "Reset to defaults" in the admin restores, and what the public pages fall
 * back to if the database cannot be reached. Pure data — safe to import
 * anywhere.
 */
import { site as defaultSite, stats as defaultStats } from "@/content/site";
import {
  events as defaultEvents,
  posts as defaultPosts,
  gallery as defaultGallery,
  videos as defaultVideos,
  faqs as defaultFaqs,
  testimonials as defaultTestimonials,
  partners as defaultPartners,
  postCategories,
  galleryCategories,
} from "@/content/data";
import { programmes as defaultProgrammes } from "@/content/programmes";
import type {
  Announcement,
  EditableSection,
  FaqItem,
  HeroContent,
  ProgrammeEdit,
  SiteContent,
  SiteSettings,
  StatItem,
  Testimonial,
  VideoItem,
} from "@/lib/types";

/** Fixed timestamp so the seed is reproducible (matches docs/database/data/seed-data.json). */
export const SEED_TIMESTAMP = "2026-10-21T00:00:00.000Z";

export function defaultAnnouncement(): Announcement {
  return {
    enabled: true,
    tone: "info",
    label: "5th Edition",
    message: "STEM Kids Championship registration is open — ₦2,000 early-bird per candidate for schools entering 10 or more",
    href: "/programmes/stem-kids-championship",
    linkLabel: "Register your school",
    startsAt: "",
    endsAt: "",
  };
}

export function defaultHero(): HeroContent {
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
    featureEyebrow: "2025 Nigerian STEM Championship",
    featureCaption: "Winners of the 2025 Nigerian STEM Championship",
    secondaryImage: "/images/awards/certificate-lineup.jpg",
    secondaryImageCaption: "2025 Nigerian STEM Championship Awards",
  };
}

export function defaultSiteSettings(): SiteSettings {
  const [southEast, abuja, lagos] = defaultSite.offices;
  return {
    name: defaultSite.name,
    tagline: defaultSite.tagline,
    description: defaultSite.description,
    email: defaultSite.email,
    primaryPhone: defaultSite.phone,
    whatsapp: defaultSite.whatsapp,
    secondaryPhone: southEast.phone,
    address: southEast.address.filter(Boolean).join(" "),
    registrationNote:
      "Registration takes about 3 minutes. You'll get an automatic confirmation by email, and our team will contact you with next steps.",
    registrationOpens: "",
    registrationCloses: "2026-11-14",
    footerNote: "AFRISTEM Global — advancing STEM education across Africa.",
    offices: [
      { id: "abakaliki", name: southEast.name, city: "Abakaliki", address: "Abakaliki, Ebonyi State, Nigeria", phone: "+234 813 825 8491", mapQuery: southEast.mapQuery },
      { id: "abuja", name: abuja.name, city: "Abuja", address: "Vicbalkon Towers, Utako, Abuja, Nigeria", phone: "+234 810 554 1242", mapQuery: abuja.mapQuery },
      { id: "lagos", name: lagos.name, city: "Lagos", address: "Ikorodu, Lagos State, Nigeria", phone: "+234 809 407 4447", mapQuery: lagos.mapQuery },
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
      {
        id: "digital-school",
        label: "AFRISTEM Digital Science School",
        href: "https://digitalschool.afristemglobal.org",
        description: "Our online school — flexible learning, intensive mentorship, outstanding results. Opens in a new tab.",
      },
    ],
  };
}

function defaultStatsList(): StatItem[] {
  return defaultStats.map((s, i) => ({
    id: `stat-${i + 1}`,
    value: `${s.value.toLocaleString("en-US")}${s.suffix}`,
    label: s.label,
    icon: "sparkles",
  }));
}

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
    prizeNote: p.prizeNote ?? "",
    poster: p.poster ?? "",
    registerHref: `/register?programme=${p.slug}`,
    featured: true,
    status: "open" as const,
    pillarBlurb: p.pillarBlurb,
    description: [...p.description],
    objectives: [...p.objectives],
    accent: p.accent,
    icon: p.icon,
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

/** The complete starting content. */
export function seedContent(): SiteContent {
  return {
    updatedAt: SEED_TIMESTAMP,
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
    newsCategories: postCategories.map((c) => ({ name: c.name, description: c.description })),
    galleryCategories: galleryCategories.filter((c) => c !== "All"),
  };
}

/** The shipped value of one editable section (used by "Reset to defaults"). */
export function seedSection(section: EditableSection): unknown {
  return seedContent()[section];
}
