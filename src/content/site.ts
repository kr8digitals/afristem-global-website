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
  children?: NavItem[];
};

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
    href: "/prime-stem-nigeria",
    children: [
      { label: "About Prime STEM Nigeria", href: "/prime-stem-nigeria", description: "Our strategic ecosystem partner" },
      { label: "Annual National Science Championship", href: "/prime-stem-nigeria#ansc", description: "ANSC — national science competition" },
      { label: "Laptop for Schools Project", href: "/prime-stem-nigeria#laptop-for-schools", description: "Digital access for schools" },
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
