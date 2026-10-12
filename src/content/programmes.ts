/**
 * ------------------------------------------------------------------
 *  AFRISTEM Flagship Programmes
 *  Add / edit programmes here. Each becomes a page at /programmes/[slug]
 * ------------------------------------------------------------------
 */

export type Programme = {
  slug: string;
  name: string;
  subtitle: string;
  tagline: string;
  pillar: "SCIENCE" | "TECHNOLOGY" | "STEM" | "CHEMISTRY";
  pillarBlurb: string;
  shortDescription: string;
  description: string[];
  objectives: string[];
  eligibility: string;
  format: string;
  ageRange: string;
  image: string;
  imageAlt: string;
  accent: "sun" | "sky" | "mint" | "violet" | "coral";
  icon: "spell" | "code" | "trophy" | "flask";
  ctaLabel: string;
  highlights: { label: string; value: string }[];
  /** optional headline prize line, e.g. the AOCT star prize */
  prizeNote?: string;
  /** optional full poster artwork shown beside the prize panel */
  poster?: string;
};

export const programmes: Programme[] = [
  {
    slug: "scispell",
    name: "SciSPELL",
    subtitle: "Science Spelling Bee",
    tagline: "Spell Science. Know Science. Master Science.",
    pillar: "SCIENCE",
    pillarBlurb: "Making science terminology exciting and accessible.",
    shortDescription: "Making scientific vocabulary exciting and memorable.",
    description: [
      "SciSPELL — Science Spelling Bee is an innovative academic competition designed to make science learning more engaging, memorable and exciting.",
      "The programme challenges students to demonstrate their knowledge of scientific terminology while developing vocabulary, confidence, concentration and a deeper appreciation of science.",
      "SciSPELL transforms scientific terms that students often encounter in textbooks and classrooms into an exciting competitive learning experience.",
    ],
    objectives: [
      "Promote interest in science among young learners.",
      "Improve students' understanding of scientific terminology.",
      "Develop confidence and communication skills.",
      "Encourage healthy academic competition.",
      "Make science learning fun and engaging.",
      "Help students develop stronger scientific vocabulary.",
    ],
    eligibility: "Students who meet the eligibility requirements for each edition of the competition.",
    format: "School rounds → Regional finals → Grand finale",
    ageRange: "Primary & Secondary",
    image: "/images/photos/award-winners-purple.jpg",
    imageAlt: "SciSPELL winners holding their certificates",
    accent: "sun",
    icon: "spell",
    ctaLabel: "Explore SciSPELL",
    highlights: [
      { label: "Focus", value: "Scientific vocabulary" },
      { label: "Format", value: "Live spelling rounds" },
      { label: "Level", value: "Primary & Secondary" },
    ],
  },
  {
    slug: "code-africa",
    name: "Code Africa",
    subtitle: "A Pan-African Coding Competition for Schools",
    tagline: "Code. Create. Compete. Change Africa.",
    pillar: "TECHNOLOGY",
    pillarBlurb: "Equipping young Africans to become creators with technology.",
    shortDescription: "Connecting schools and young coders across Africa.",
    description: [
      "Code Africa is a pan-African coding competition designed for schools across Africa.",
      "The competition provides young learners with an opportunity to demonstrate their coding and computational thinking abilities while competing with students from different schools and countries.",
      "Code Africa seeks to move young people beyond simply using technology to becoming creators and problem-solvers through technology.",
    ],
    objectives: [
      "Promote coding and computational thinking.",
      "Encourage technology education in African schools.",
      "Identify and nurture young coding talents.",
      "Develop problem-solving and logical reasoning skills.",
      "Encourage innovation among young people.",
      "Connect learners across African countries through technology.",
    ],
    eligibility: "Schools and eligible students from participating African countries.",
    format: "Online qualifiers → Live hackathon finals",
    ageRange: "Ages 10 – 18",
    image: "/images/photos/computer-lab.jpg",
    imageAlt: "Students coding on computers in a lab",
    accent: "sky",
    icon: "code",
    ctaLabel: "Explore Code Africa",
    highlights: [
      { label: "Focus", value: "Coding & computational thinking" },
      { label: "Format", value: "Hybrid: online + live" },
      { label: "Reach", value: "Pan-African" },
    ],
  },
  {
    slug: "stem-kids-championship",
    name: "STEM Kids Championship",
    subtitle: "Pan-African STEM Competition",
    tagline: "Where Young Minds Compete, Discover and Excel.",
    pillar: "STEM",
    pillarBlurb: "Building early interest and excellence in STEM.",
    shortDescription: "Inspiring young learners through STEM competition and excellence.",
    description: [
      "The STEM Kids Championship — Pan-African Edition is a STEM competition designed to provide young learners across Africa with a platform to demonstrate their knowledge, develop confidence and compete in a stimulating academic environment.",
      "Candidates compete in Mathematics, Basic Science and Computer Technology across three categories: Basic 3–4, Basic 5–6 and JSS 1–3. The 5th Edition is the International Edition, with the exam holding on November 14, 2026 across selected cities in Africa.",
      "Individual registration costs ₦4,000; groups of 10 or more pay ₦3,000 per candidate. Registration closes 12 November 2026. The championship encourages children to develop a strong foundation in STEM while experiencing the excitement of competition and connecting with other young STEM enthusiasts.",
    ],
    objectives: [
      "Encourage early interest in STEM.",
      "Promote academic excellence.",
      "Develop critical thinking and problem-solving skills.",
      "Create opportunities for young STEM enthusiasts across Africa.",
      "Encourage healthy academic competition.",
      "Identify and celebrate outstanding young learners.",
    ],
    eligibility: "Basic 3 – 6 and JSS 1 – 3 learners in primary and secondary schools across Africa.",
    format: "Physical or online examination; choose mode and location at registration",
    ageRange: "Ages 6 – 14",
    image: "/images/posters/2024-skc-winners.jpg",
    imageAlt: "STEM Kids Championship winners with their awards",
    accent: "coral",
    icon: "trophy",
    ctaLabel: "Explore STEM Kids Championship",
    highlights: [
      { label: "Subjects", value: "Maths · Basic Science · Computer Tech" },
      { label: "Categories", value: "Basic 3–6 and JSS 1–3" },
      { label: "Exam date", value: "November 14, 2026" },
      { label: "Registration", value: "₦4,000 individual · ₦3,000 each (10+)" },
    ],
  },
  {
    slug: "african-organic-chemistry-tournament",
    name: "African Organic Chemistry Tournament",
    subtitle: "Interschool Organic Chemistry Olympiad",
    tagline: "Think Chemistry. Master Organic Chemistry.",
    pillar: "CHEMISTRY",
    pillarBlurb: "Challenging students to achieve excellence in advanced chemistry.",
    shortDescription: "Challenging students to think deeply and excel in organic chemistry.",
    description: [
      "The African Organic Chemistry Tournament is an interschool organic chemistry olympiad designed to challenge students' understanding of organic chemistry and encourage excellence in chemical sciences.",
      "The tournament provides a competitive platform for students to apply their knowledge, demonstrate analytical thinking and engage with challenging organic chemistry problems.",
      "It also seeks to inspire students who have an interest in chemistry and encourage them to consider careers in science, engineering, medicine, technology and related fields.",
    ],
    objectives: [
      "Promote excellence in organic chemistry.",
      "Encourage deeper understanding of chemical concepts.",
      "Develop analytical and problem-solving abilities.",
      "Identify and celebrate talented chemistry students.",
      "Encourage interest in chemistry-related careers.",
      "Connect schools and students through academic competition.",
    ],
    eligibility: "SSS 1–3 Chemistry students; individual and school/group entries.",
    format: "Online CBT: preliminary and final stages; 50 objective questions per stage",
    ageRange: "Senior Secondary",
    image: "/images/photos/chemistry-lab.jpg",
    imageAlt: "Students conducting an organic chemistry experiment",
    accent: "mint",
    icon: "flask",
    ctaLabel: "Explore the Tournament",
    highlights: [
      { label: "Edition", value: "2nd Edition" },
      { label: "Eligibility", value: "SSS 1 - 3" },
      { label: "Exam mode", value: "CBT" },
      { label: "Exam date", value: "Nov 14 - 21, 2026" },
      { label: "Star prize", value: "₦500,000 cash + plaque" },
      { label: "Entry", value: "Through your school" },
    ],
    prizeNote: "Star Prize: ₦500,000 cash prize and plaque",
    poster: "/images/posters/aoct-2026-2nd-edition.jpg",
  },
];

export const getProgramme = (slug: string) => programmes.find((p) => p.slug === slug);

/** Programmes accessible through the Prime STEM Nigeria partnership */
export const primeStemProgrammes = [
  {
    id: "ansc",
    name: "Annual National Science Championship",
    short: "ANSC",
    blurb: "A national science championship connecting learners and schools across Nigeria.",
    description: [
      "The Annual National Science Championship (ANSC) is a national science competition designed for learners across Nigeria.",
      "The championship provides students with an opportunity to test their science knowledge, compete with peers from across the country and demonstrate academic excellence.",
      "The programme also provides a platform for identifying, recognising and celebrating outstanding young science learners.",
    ],
    points: [
      "National participation",
      "Multiple student categories",
      "School participation",
      "Competitive science assessment",
      "Recognition of outstanding candidates",
      "Awards and prizes",
      "Opportunities for academic excellence",
    ],
    pointsLabel: "Key Features",
    image: "/images/photos/exam-hall.jpg",
    cta: "Explore ANSC",
  },
  {
    id: "laptop-for-schools",
    name: "Laptop for Schools Project",
    short: "Laptop for Schools",
    blurb: "Supporting schools with access to technology and digital learning opportunities.",
    description: [
      "The Laptop for Schools Project is an initiative focused on supporting schools with access to digital technology and improving opportunities for technology-enabled learning.",
      "The project recognises the importance of digital access in modern education and seeks to help schools provide learners with the tools needed to participate effectively in an increasingly technology-driven world.",
    ],
    points: [
      "Improve access to digital learning.",
      "Support technology-enabled education.",
      "Promote digital literacy among students.",
      "Help schools integrate technology into learning.",
      "Support the development of future-ready learners.",
    ],
    pointsLabel: "Key Objectives",
    image: "/images/photos/computer-training.jpg",
    cta: "Learn More About the Project",
  },
];
