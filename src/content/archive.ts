/**
 * ------------------------------------------------------------------
 *  AFRISTEM Archive
 *  Past editions, retired flyers and stories that no longer belong on
 *  the live programme, events or news pages.
 *
 *  Nothing here is deleted — the record stays available at /archive.
 *  To archive something new:
 *    · past events are detected automatically from their dates
 *    · add a story slug to ARCHIVED_POST_SLUGS
 *    · add a video id to ARCHIVED_VIDEO_IDS
 *    · add an edition or a poster to the lists below
 * ------------------------------------------------------------------
 */
import type { GalleryItem } from "@/content/data";

export type ArchivedEdition = {
  id: string;
  title: string;
  programme: string;
  year: string;
  kind: "Programme edition" | "Awards" | "Boot camp" | "Tour";
  summary: string;
  facts: { label: string; value: string }[];
  image: string;
  imageAlt: string;
  /** where to read or see more about this edition */
  link?: { label: string; href: string };
  /** a downloadable/viewable original document, e.g. the retired flyer */
  file?: { label: string; href: string };
};

/**
 * Editions and moments that have closed. These are shown on /archive only —
 * the live programme pages describe the current edition.
 */
export const archivedEditions: ArchivedEdition[] = [
  {
    id: "skc-2023-2nd-edition",
    title: "STEM Kids Championship — 2nd Edition",
    programme: "STEM Kids Championship",
    year: "2023",
    kind: "Programme edition",
    summary:
      "The 2nd Edition exam held on April 1, 2023 for primary school candidates, with cash prizes, trophies and medals awarded per state. Its flyer and results have been retired from the live programme page.",
    facts: [
      { label: "Exam date", value: "April 1, 2023" },
      { label: "Eligibility", value: "Primary 4 – 6 or under 12 by April 1, 2023" },
      { label: "Status", value: "Archived — 2023 season" },
      { label: "Top prize", value: "₦300,000 + trophy" },
    ],
    image: "/images/archive/skc-2023-2nd-edition-flyer.jpg",
    imageAlt: "The retired 2nd Edition STEM Kids Championship flyer from 2023",
    file: {
      label: "View the 2023 flyer",
      href: "/images/archive/skc-2023-2nd-edition-flyer.jpg",
    },
  },
  {
    id: "skc-2024-4th-edition",
    title: "STEM Kids Championship — 4th Edition",
    programme: "STEM Kids Championship",
    year: "2024",
    kind: "Programme edition",
    summary:
      "The 2024 championship brought learners from across Nigeria together for the written assessment and practical rounds, ending with the annual prize presentation.",
    facts: [
      { label: "Edition", value: "4th Edition" },
      { label: "Categories", value: "Basic 3 – 6 and JSS 1 – 3" },
      { label: "Subjects", value: "Maths · Basic Science · Computer Technology" },
      { label: "Outcome", value: "Winners celebrated at the awards ceremony" },
    ],
    image: "/images/posters/2024-skc-winners.jpg",
    imageAlt: "2024 STEM Kids Championship winners with their awards",
    link: { label: "See photos in the gallery", href: "/gallery" },
  },
  {
    id: "2025-nigerian-stem-championship",
    title: "2025 Nigerian STEM Championship Awards",
    programme: "AFRISTEM / Prime STEM Nigeria",
    year: "2025",
    kind: "Awards",
    summary:
      "The 2025 awards ceremony celebrated winners of the STEM Kids Championship, African Organic Chemistry Tournament and Annual National Science Championship.",
    facts: [
      { label: "Ceremony", value: "December 6, 2025" },
      { label: "Programmes", value: "SKC · AOCT · ANSC" },
      { label: "Recognition", value: "Certificates, trophies and cash prizes" },
      { label: "Status", value: "Archived — 2025 season" },
    ],
    image: "/images/photos/awards-ceremony-2025.jpg",
    imageAlt: "Students and guests at the 2025 Nigerian STEM Championship awards",
    link: {
      label: "Read the archived story",
      href: "/news/2025-nigerian-stem-championship-awards",
    },
  },
  {
    id: "2023-international-stem-boot-camp",
    title: "International STEM Boot Camp — 2023",
    programme: "STEM Boot Camp",
    year: "2023",
    kind: "Boot camp",
    summary:
      "Four weeks of coding, robotics, drone flying and project defence with international facilitators at Imo State University.",
    facts: [
      { label: "Year", value: "2023" },
      { label: "Host", value: "Imo State University" },
      { label: "Focus", value: "Coding · Robotics · Engineering design" },
      { label: "Finish", value: "Team project defence" },
    ],
    image: "/images/bootcamp/group-1.jpg",
    imageAlt: "Boot camp cohort assembled at the university",
    link: { label: "Watch the highlights", href: "/archive#videos" },
  },
  {
    id: "2023-interstate-tour",
    title: "2023 Inter-State Tour & Awards",
    programme: "STEM Kids Championship",
    year: "2023",
    kind: "Tour",
    summary:
      "The championship trophy travelled across states to meet schools, celebrate candidates and present awards from the 2023 season.",
    facts: [
      { label: "Year", value: "2023" },
      { label: "Scope", value: "Inter-state school tour" },
      { label: "Focus", value: "Award presentations and school visits" },
      { label: "Status", value: "Archived" },
    ],
    image: "/images/posters/2023-interstate-tour.jpg",
    imageAlt: "2023 STEM Kids inter-state tour and awards poster",
    link: { label: "See the 2023 photos", href: "/gallery" },
  },
  {
    id: "2024-national-science-championship",
    title: "National Science Championship — 2024",
    programme: "Annual National Science Championship",
    year: "2024",
    kind: "Awards",
    summary:
      "The 2024 National Science Championship recognised outstanding science learners from schools across Nigeria through Prime STEM Nigeria.",
    facts: [
      { label: "Year", value: "2024" },
      { label: "Partner", value: "Prime STEM Nigeria" },
      { label: "Focus", value: "National science assessment" },
      { label: "Status", value: "Archived — 2024 season" },
    ],
    image: "/images/posters/2024-nsc-winners.jpg",
    imageAlt: "2024 National Science Championship winners",
    link: { label: "See the 2024 photos", href: "/gallery" },
  },
  {
    id: "2023-best-candidates",
    title: "2023 Best Candidates",
    programme: "STEM Kids Championship",
    year: "2023",
    kind: "Programme edition",
    summary:
      "The candidates whose 2023 results placed them at the top of their categories, recognised with certificates, medals and prizes.",
    facts: [
      { label: "Year", value: "2023" },
      { label: "Recognition", value: "Certificates and medals" },
      { label: "Categories", value: "Primary and junior secondary" },
      { label: "Status", value: "Archived" },
    ],
    image: "/images/posters/2023-best-candidates.jpg",
    imageAlt: "2023 best candidates poster",
  },
];

/** News stories whose moment has passed. They stay published, but leave the live news feed. */
export const ARCHIVED_POST_SLUGS = new Set<string>(["2025-nigerian-stem-championship-awards"]);

/** Videos from earlier editions — kept on /archive, out of the live gallery playlist. */
export const ARCHIVED_VIDEO_IDS = new Set<string>(["bootcamp-2023", "skc-2023", "skc-registration"]);

/** Retired flyers and posters, shown in the archive lightbox. */
export const archivedPosters: GalleryItem[] = [
  {
    src: "/images/archive/skc-2023-2nd-edition-flyer.jpg",
    alt: "Retired 2023 STEM Kids Championship 2nd Edition flyer",
    caption: "SKC 2nd Edition flyer (2023)",
    category: "Flyers",
    span: "tall",
  },
  {
    src: "/images/posters/2023-interstate-tour.jpg",
    alt: "2023 inter-state tour and awards poster",
    caption: "2023 inter-state tour",
    category: "Results",
    span: "wide",
  },
  {
    src: "/images/posters/2023-best-candidates.jpg",
    alt: "2023 best candidates poster",
    caption: "2023 best candidates",
    category: "Results",
  },
  {
    src: "/images/posters/2024-skc-winners.jpg",
    alt: "2024 STEM Kids Championship winners poster",
    caption: "SKC 4th Edition winners (2024)",
    category: "Results",
    span: "tall",
  },
  {
    src: "/images/posters/2024-nsc-winners.jpg",
    alt: "2024 National Science Championship winners poster",
    caption: "2024 National Science Championship",
    category: "Results",
  },
  {
    src: "/images/posters/2025-awards-ceremony.jpg",
    alt: "2025 awards ceremony poster",
    caption: "2025 awards ceremony",
    category: "Awards",
    span: "wide",
  },
  {
    src: "/images/photos/awards-ceremony-2025.jpg",
    alt: "Students at the 2025 awards ceremony",
    caption: "2025 awards ceremony",
    category: "Awards",
  },
  {
    src: "/images/posters/prize-giving.jpg",
    alt: "Prize giving moment",
    caption: "Prize giving",
    category: "Awards",
  },
  {
    src: "/images/posters/skc-trophy-team.jpg",
    alt: "Team holding the championship trophy",
    caption: "Championship trophy",
    category: "Awards",
  },
];

export const archiveCategories = ["Flyers", "Results", "Awards"];
