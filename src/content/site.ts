/**
 * ------------------------------------------------------------------
 *  AFRISTEM — Site-wide configuration
 *  Edit contact details, social links and navigation here.
 * ------------------------------------------------------------------
 */

export const site = {
  name: "AFRISTEM",
  legalName: "AFRISTEM GLOBAL",
  rcNumber: "RC 9452641",
  tagline: "Inspiring the Next Generation of African Innovators",
  description:
    "AFRISTEM is an EdTech and STEM-focused organisation making Science, Technology, Engineering and Mathematics exciting, practical and accessible for children, teenagers, schools, educators and STEM professionals across Africa.",
  url: "https://afristemglobal.org",
  /** Languages / locale of the website content. */
  locale: "en_NG",
  alternateLocales: ["en_GH", "en_KE", "en_ZA", "en_GB"],
  /**
   * Entity profile used by JSON-LD structured data, knowledge panels and AI
   * search engines (ChatGPT, Gemini, Perplexity, Google AI Overviews).
   *
   * FOUNDER: this emits a `Person` node linked as `founder` of AFRISTEM
   * GLOBAL and of Prime STEM Nigeria. Adjust `name`/`role` here (or set
   * back to null) to change what the structured data claims.
   */
  founder: {
    name: "Engr. Sam Nwankwo",
    role: "Founder, AFRISTEM Global & Prime STEM Nigeria",
    sameAs: [] as string[],
  },
  /** Short, citable one-liner about the organisation for AI answer engines. */
  entityStatement:
    "AFRISTEM GLOBAL is an African EdTech and STEM education organisation that runs science competitions, coding and robotics programmes, teacher training and an online Digital Science School for learners across Africa and worldwide.",
  /** Topics the organisation is an authority on — feeds schema.org knowsAbout. */
  knowsAbout: [
    "STEM education",
    "Science competitions for schools",
    "Coding and robotics for youth",
    "Online science schooling",
    "Teacher training and professional development",
    "Organic chemistry education",
    "Science spelling bees",
    "WAEC, NECO and JAMB preparation",
    "STEM equipment and school laboratories",
    "Education consultancy",
  ],
  email: "contact@afristemglobal.com",
  phone: "+234 810 554 1242",
  phoneHref: "tel:+2348105541242",
  whatsapp: "+234 810 554 1242",
  whatsappHref: "https://wa.me/2348105541242?text=Hello%20AFRISTEM%2C%20I%27d%20like%20to%20know%20more%20about%20your%20programmes.",
  altPhone: "+234 813 825 8491",
  altPhoneHref: "tel:+2348138258491",
  social: {
    facebook: "https://facebook.com/afristemglobal",
    instagram: "https://instagram.com/afristemglobal",
    linkedin: "https://linkedin.com/company/afristemglobal",
    twitter: "https://twitter.com/afristemglobal",
    youtube: "https://www.youtube.com/@afristemglobal",
  },
  offices: [
    {
      name: "South East Nigeria Office",
      short: "Abakaliki (Head Office)",
      address: [
        "PCN Plaza, Opposite Abakaliki Township Stadium,",
        "Kpirikpiri, Abakaliki,",
        "Ebonyi State, Nigeria.",
      ],
      phone: "+234 813 825 8491",
      phoneHref: "tel:+2348138258491",
      mapQuery: "PCN Plaza, Abakaliki Township Stadium, Kpirikpiri, Abakaliki, Ebonyi State",
    },
    {
      name: "Abuja Liaison Office",
      short: "Abuja",
      address: [
        "Suite 47, Vicbalkon Towers,",
        "Plot C44, Utako District,",
        "Abuja, Nigeria. (C/O Toprofile Foundation)",
      ],
      phone: "+234 810 554 1242",
      phoneHref: "tel:+2348105541242",
      mapQuery: "Vicbalkon Towers, Utako District, Abuja",
    },
    {
      name: "Lagos Liaison Office",
      short: "Lagos",
      address: [
        "Plot 24, Road E, Banana Estate,",
        "Igbe Lara, Ikorodu,",
        "Lagos, Nigeria.",
      ],
      phone: "+234 809 407 4447",
      phoneHref: "tel:+2348094074447",
      mapQuery: "Banana Estate, Igbe Lara, Ikorodu, Lagos",
    },
  ],
} as const;

export type NavItem = {
  label: string;
  href: string;
  description?: string;
  /** opens in a new tab (off-site) */
  external?: boolean;
  children?: NavItem[];
};

/** Sister site maintained by the same team — opens in a new tab. */
export const PRIME_STEM_URL = "https://primestemnigeria.afristemglobal.org";
export const DIGITAL_SCHOOL_URL = "https://digitalschool.afristemglobal.org";
export const DIGITAL_SCHOOL_EMAIL = "info@afristemschools.org";

export const navigation: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Programmes",
    href: "/programmes",
    children: [
      { label: "All Programmes", href: "/programmes", description: "Our four flagship STEM competitions" },
      { label: "SciSPELL", href: "/programmes/scispell", description: "Science Spelling Bee" },
      { label: "Code Africa", href: "/programmes/code-africa", description: "Pan-African Coding Competition" },
      { label: "STEM Kids Championship", href: "/programmes/stem-kids-championship", description: "Pan-African Edition" },
      { label: "African Organic Chemistry Tournament", href: "/programmes/african-organic-chemistry-tournament", description: "Interschool Organic Chemistry Olympiad" },
    ],
  },
  {
    label: "Prime STEM Nigeria",
    href: PRIME_STEM_URL,
    external: true,
    children: [
      { label: "Visit Prime STEM Nigeria", href: PRIME_STEM_URL, description: "Opens in a new tab — competitions, boot camps & training", external: true },
      { label: "About Prime STEM Nigeria", href: "/prime-stem-nigeria", description: "What we run together in Nigeria" },
      { label: "Annual National Science Championship", href: "/prime-stem-nigeria#ansc", description: "ANSC — national science competition" },
      { label: "Laptop for Schools Project", href: "/prime-stem-nigeria#laptop-for-schools", description: "Digital access for schools" },
    ],
  },
  {
    // Mirrors the Prime STEM Nigeria entry: the label opens the sister site in a
    // new tab, and the dropdown mixes that site with our own landing page.
    label: "Digital Science School",
    href: DIGITAL_SCHOOL_URL,
    external: true,
    children: [
      { label: "Visit Digital Science School", href: DIGITAL_SCHOOL_URL, description: "Opens in a new tab — the online school platform", external: true },
      { label: "About Digital Science School", href: "/digital-science-school", description: "Flexible online learning with intensive mentorship" },
      { label: "Programmes & Classes", href: "/digital-science-school#programmes", description: "Primary 4–6, JSS, SSS and WAEC / NECO / JAMB" },
      { label: "Register as a Student", href: DIGITAL_SCHOOL_URL + "/register", description: "Opens in a new tab — admissions and placement", external: true },
      { label: "Apply as a Teacher", href: DIGITAL_SCHOOL_URL + "/apply-to-teach", description: "Opens in a new tab — join the teaching team", external: true },
    ],
  },
  {
    label: "Get Involved",
    href: "/schools",
    children: [
      { label: "Schools", href: "/schools", description: "Partner your school with AFRISTEM" },
      { label: "Educators", href: "/educators", description: "Join the educator network" },
      { label: "STEM Professionals", href: "/stem-professionals", description: "Mentor, train, judge, speak" },
      { label: "Partners", href: "/partners", description: "Together, we can do more" },
      { label: "Services", href: "/services", description: "STEM solutions for institutions" },
      { label: "STEM Guide for Schools", href: "/stem-guide-for-schools", description: "Coming soon — practical handbook for teachers" },
    ],
  },
  { label: "Events", href: "/events" },
  { label: "News", href: "/news" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export const footerLinks = {
  quick: [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Programmes", href: "/programmes" },
    { label: "Services", href: "/services" },
    { label: "Partners", href: "/partners" },
    { label: "Prime STEM Nigeria", href: "/prime-stem-nigeria" },
    { label: "Digital Science School", href: "/digital-science-school" },
    { label: "Events", href: "/events" },
    { label: "News", href: "/news" },
    { label: "Gallery", href: "/gallery" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact Us", href: "/contact" },
  ],
  users: [
    { label: "Students", href: "/register" },
    { label: "Schools", href: "/schools" },
    { label: "Educators", href: "/educators" },
    { label: "STEM Professionals", href: "/stem-professionals" },
    { label: "STEM Guide for Schools", href: "/stem-guide-for-schools" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export const stats = [
  { value: 5867, suffix: "+", label: "Students Reached" },
  { value: 840, suffix: "+", label: "Schools Across Africa" },
  { value: 10, suffix: "+", label: "Organisation Partners" },
  { value: 100, suffix: "M+", label: "Future Learners Targeted" },
];
