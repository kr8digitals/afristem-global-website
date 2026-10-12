/**
 * ------------------------------------------------------------------
 *  AFRISTEM SEO content registry.
 *
 *  One entry per route: keyword-optimised title, meta description,
 *  a curated semantic keyword cluster and a natural-language FAQ
 *  (rendered visibly on the page AND emitted as FAQPage JSON-LD).
 *
 *  Keyword strategy (see /seo/README.md):
 *  - Brand & entity terms: AFRISTEM, AFRISTEM GLOBAL, programme names.
 *  - Core topics: global STEM education, digital science school, coding
 *    and robotics for youth, engineering training, science curricula.
 *  - Intent queries: "best global STEM platforms", "where to study
 *    advanced science and technology online", registration & fees.
 *  - Location queries: STEM programmes in Nigeria / Africa / globally.
 *
 *  Keep keyword lists to ~10-25 high-signal terms per page: a curated
 *  cluster ranks; dumping thousands of terms triggers spam filters.
 *  The full 20,000-term long-tail matrix lives in /seo/keywords/ and is
 *  implemented through this registry, headings, alt text and FAQ copy.
 * ------------------------------------------------------------------
 */

export type FaqItem = { q: string; a: string };

export type PageSeo = {
  /** Page title (rendered through the "%s | AFRISTEM" template). */
  title: string;
  /** Meta description / OG description — one or two natural sentences. */
  description: string;
  /** Curated semantic keyword cluster for this page. */
  keywords: string[];
  /** Natural-language Q&A shown on the page + emitted as FAQPage schema. */
  faqs?: FaqItem[];
  /** Open Graph image override (defaults to the generated brand OG image). */
  ogImage?: string;
  /** schema.org WebPage subtype for the page's JSON-LD. */
  pageType?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "FAQPage" | "ItemPage";
  /** Label used in the BreadcrumbList schema. */
  breadcrumb?: string;
};

const seoPageData = {
  about: {
    title: "About AFRISTEM — Who We Are, Vision & Mission",
    description:
      "AFRISTEM GLOBAL is an EdTech and STEM education organisation transforming how Science, Technology, Engineering and Mathematics are taught across Africa — through competitions, training, technology and an online Digital Science School.",
    keywords: [
      "about AFRISTEM",
      "AFRISTEM GLOBAL organisation",
      "STEM education organisation Africa",
      "EdTech company Nigeria",
      "African STEM initiative",
      "STEM NGO Africa",
      "science education non-profit Nigeria",
      "AFRISTEM vision and mission",
      "who runs AFRISTEM",
      "AFRISTEM Abakaliki headquarters",
      "youth STEM development Africa",
    ],
    pageType: "AboutPage",
    breadcrumb: "About",
    faqs: [
      {
        q: "What is AFRISTEM?",
        a: "AFRISTEM (AFRISTEM GLOBAL) is an EdTech and STEM-focused organisation that makes Science, Technology, Engineering and Mathematics exciting, practical and accessible for children, teenagers, schools, educators and STEM professionals across Africa.",
      },
      {
        q: "Where is AFRISTEM located?",
        a: "AFRISTEM's head office is in Abakaliki, Ebonyi State, Nigeria, with liaison offices in Abuja and Lagos. Its programmes and online school reach learners across Africa and worldwide.",
      },
      {
        q: "What does AFRISTEM do?",
        a: "AFRISTEM organises STEM competitions (SciSPELL, Code Africa, STEM Kids Championship, African Organic Chemistry Tournament), runs boot camps and teacher training, supplies STEM equipment, provides education consultancy and operates the AFRISTEM Digital Science School.",
      },
      {
        q: "Who does AFRISTEM serve?",
        a: "AFRISTEM serves primary and secondary school learners, teenagers, schools, teachers and educators, STEM professionals, and partner organisations working to advance STEM education.",
      },
    ],
  },

  programmes: {
    title: "STEM Programmes & Competitions for Schools and Students",
    description:
      "Explore AFRISTEM's flagship STEM programmes: SciSPELL Science Spelling Bee, Code Africa coding competition, STEM Kids Championship and the African Organic Chemistry Tournament — open to schools across Africa.",
    keywords: [
      "STEM programmes Africa",
      "science competitions for schools",
      "STEM competitions Nigeria",
      "SciSPELL science spelling bee",
      "Code Africa coding competition",
      "STEM Kids Championship",
      "African Organic Chemistry Tournament",
      "interschool science olympiad Africa",
      "coding competition for secondary school students",
      "academic competitions for primary schools",
      "pan-African STEM events",
      "best science competitions for students Africa",
    ],
    pageType: "CollectionPage",
    breadcrumb: "Programmes",
    faqs: [
      {
        q: "Which STEM competitions does AFRISTEM organise?",
        a: "AFRISTEM organises four flagship programmes: SciSPELL (a science spelling bee), Code Africa (a pan-African coding competition), the STEM Kids Championship (maths, basic science and computer technology), and the African Organic Chemistry Tournament (an interschool chemistry olympiad).",
      },
      {
        q: "Who can participate in AFRISTEM programmes?",
        a: "Eligibility varies by programme — from primary school learners (Basic 3-6) in the STEM Kids Championship to senior secondary chemistry students in the African Organic Chemistry Tournament. Each programme page states its exact requirements.",
      },
      {
        q: "How do schools register students for AFRISTEM competitions?",
        a: "Schools can register students through the AFRISTEM registration page. Bulk registration is available, and some programmes offer early-bird fees for schools registering larger numbers of candidates.",
      },
      {
        q: "Are AFRISTEM competitions held online or in person?",
        a: "Formats vary: some rounds are online, others take place in selected cities across Africa, and several editions use a hybrid format. Details are published on each programme page and in the events calendar.",
      },
    ],
  },

  digitalScienceSchool: {
    title: "AFRISTEM Digital Science School — Online Science Classes & Exam Prep",
    description:
      "The AFRISTEM Digital Science School is an online science school for Primary 4-6, JSS and SSS students and WAEC/NECO/JAMB candidates — flexible learning with intensive mentorship and outstanding results.",
    keywords: [
      "digital science school",
      "online science school Nigeria",
      "online school for WAEC",
      "NECO preparation online",
      "JAMB tutorial online",
      "online science classes Africa",
      "virtual school Nigeria",
      "online secondary school WAEC",
      "science and technology curricula online",
      "where to study advanced science and technology online",
      "online coding classes for Nigerian students",
      "Primary 4-6 online lessons",
      "JSS SSS online lessons",
      "best online science school in Nigeria",
    ],
    pageType: "WebPage",
    breadcrumb: "Digital Science School",
    ogImage: "/images/photos/computer-training.jpg",
    faqs: [
      {
        q: "What is the AFRISTEM Digital Science School?",
        a: "The AFRISTEM Digital Science School is an online science school delivering structured, engaging and personalised learning with intensive mentorship for Primary 4-6, JSS 1-3, SSS 1-3 and WAEC / NECO / JAMB candidates.",
      },
      {
        q: "Who can enrol in the Digital Science School?",
        a: "Learners from Primary 4 through Senior Secondary 3 can enrol, along with candidates preparing for WAEC, NECO and JAMB examinations. Students can learn from anywhere with an internet connection.",
      },
      {
        q: "How are online classes delivered?",
        a: "Classes combine live online lessons, audio-visual aids, animations and simulations, assignments, quizzes, projects, continuous assessment and regular progress reports to parents and guardians.",
      },
      {
        q: "Does the Digital Science School prepare students for WAEC, NECO and JAMB?",
        a: "Yes. There is a dedicated examination preparation track with intensive practice tests, revision and one-to-one mentorship for WAEC, NECO and JAMB candidates.",
      },
      {
        q: "How do I register as a student or apply as a teacher?",
        a: "Visit the Digital Science School website to register as a student or apply to teach — links are available on this page, or contact the AFRISTEM team for guidance.",
      },
    ],
  },

  primeStemNigeria: {
    title: "Prime STEM Nigeria — ANSC & Laptop for Schools Project",
    description:
      "Prime STEM Nigeria advances STEM education for young Nigerians through the Annual National Science Championship (ANSC) and the Laptop for Schools Project, in partnership with AFRISTEM.",
    keywords: [
      "Prime STEM Nigeria",
      "Annual National Science Championship",
      "ANSC Nigeria",
      "Laptop for Schools Project Nigeria",
      "national science competition Nigeria",
      "STEM boot camps Nigeria",
      "science championship for secondary schools",
      "digital access for Nigerian schools",
      "STEM Kids Championship registration",
      "school technology donations Nigeria",
    ],
    pageType: "WebPage",
    breadcrumb: "Prime STEM Nigeria",
    ogImage: "/images/photos/exam-hall.jpg",
    faqs: [
      {
        q: "What is Prime STEM Nigeria?",
        a: "Prime STEM Nigeria is a leading STEM education organisation that promotes Science, Technology, Engineering and Mathematics among young Nigerians through competitions, boot camps and student-focused programmes, in partnership with AFRISTEM.",
      },
      {
        q: "What is the Annual National Science Championship (ANSC)?",
        a: "The ANSC is a national science competition that brings together young science minds from all 36 Nigerian states and the FCT, with multiple student categories, awards and prizes.",
      },
      {
        q: "What is the Laptop for Schools Project?",
        a: "The Laptop for Schools Project supports Nigerian schools with access to digital technology, improving opportunities for technology-enabled learning and digital literacy among students.",
      },
      {
        q: "How can my school join Prime STEM Nigeria programmes?",
        a: "Schools can register interest through the AFRISTEM registration page or contact the team directly — we will connect you with the right opportunity for your students.",
      },
    ],
  },

  services: {
    title: "STEM Services — Training, Equipment, Consultancy & Events",
    description:
      "AFRISTEM delivers STEM education and training, competitions, boot camps, STEM equipment and robotics kits, education consultancy and teacher professional development for schools and organisations.",
    keywords: [
      "STEM education services",
      "STEM training for schools",
      "teacher training Nigeria",
      "STEM equipment suppliers Africa",
      "robotics kits for schools",
      "science lab equipment Nigeria",
      "education consultancy Nigeria",
      "STEM boot camps for students",
      "science fair organisers Africa",
      "STEM club setup for schools",
      "professional development for science teachers",
      "STEM workshop facilitators",
    ],
    pageType: "CollectionPage",
    breadcrumb: "Services",
    ogImage: "/images/photos/robotics.jpg",
    faqs: [
      {
        q: "What services does AFRISTEM offer schools?",
        a: "AFRISTEM offers STEM education and training, competition design and delivery, boot camps and science fairs, STEM equipment and robotics kits, education consultancy and professional development for teachers.",
      },
      {
        q: "Can AFRISTEM help set up a STEM lab or club at my school?",
        a: "Yes. AFRISTEM supplies science lab equipment, robotics and coding kits and learning resources, and supports institutions through lab set-up, club launch and ongoing coaching.",
      },
      {
        q: "Does AFRISTEM provide teacher training?",
        a: "Yes. AFRISTEM runs teacher training, digital literacy hangouts, facilitator certification and professional development programmes for educators and STEM professionals.",
      },
      {
        q: "How do organisations engage AFRISTEM?",
        a: "Organisations can request a proposal through the contact page. AFRISTEM starts with a discovery call, then designs a tailored proposal covering plan, timeline and budget.",
      },
    ],
  },

  schools: {
    title: "STEM Partnerships for Schools — Competitions, Clubs & Training",
    description:
      "Partner your school with AFRISTEM for STEM competitions, STEM clubs, teacher training, boot camps, equipment and education consultancy — build a thriving STEM culture in your school.",
    keywords: [
      "STEM partnerships for schools",
      "school STEM programmes Nigeria",
      "STEM club for schools",
      "interschool competitions registration",
      "school science competitions Africa",
      "STEM training for private schools",
      "how to start a STEM club in school",
      "STEM equipment for schools Nigeria",
      "school STEM consultancy",
      "best STEM programmes for schools in Nigeria",
    ],
    pageType: "WebPage",
    breadcrumb: "For Schools",
    ogImage: "/images/photos/school-assembly.jpg",
    faqs: [
      {
        q: "How can my school partner with AFRISTEM?",
        a: "Schools can partner with AFRISTEM for STEM competitions, STEM clubs, training programmes, boot camps, STEM projects, teacher development, STEM equipment, educational consultancy and special STEM events.",
      },
      {
        q: "Can AFRISTEM register our students for competitions in bulk?",
        a: "Yes. Schools can register students in bulk for AFRISTEM competitions through the registration page, with early-bird pricing available on eligible programmes.",
      },
      {
        q: "Does AFRISTEM work with both primary and secondary schools?",
        a: "Yes. AFRISTEM programmes cover primary (Basic 3-6) and secondary (JSS and SSS) learners, so both school levels can participate in competitions, clubs and training.",
      },
    ],
  },

  educators: {
    title: "For Educators — Training, Resources & STEM Opportunities",
    description:
      "Join the AFRISTEM educator network: teacher training, digital literacy hangouts, STEM resources and opportunities to facilitate, judge, mentor and coordinate STEM programmes across Africa.",
    keywords: [
      "STEM teacher training Africa",
      "professional development for science teachers",
      "teacher hangout Nigeria",
      "digital literacy training for teachers",
      "STEM educator network",
      "become a STEM facilitator",
      "judge science competitions",
      "science teaching resources Africa",
      "STEM mentor for students",
      "teacher workshops Nigeria",
    ],
    pageType: "WebPage",
    breadcrumb: "For Educators",
    ogImage: "/images/awards/certificate-lineup.jpg",
    faqs: [
      {
        q: "How can educators participate in AFRISTEM?",
        a: "Educators can join as teachers, facilitators, trainers, mentors, judges, programme coordinators and STEM advocates, and can access training, hangouts and teaching resources.",
      },
      {
        q: "What teacher training does AFRISTEM offer?",
        a: "AFRISTEM runs teacher training, digital literacy hangouts, international science teachers' hangouts and facilitator certification — most are delivered online so teachers anywhere can join.",
      },
      {
        q: "Do educators receive certificates?",
        a: "Certificates are provided for programmes where certification applies; details are stated on each programme or training page.",
      },
    ],
  },

  stemProfessionals: {
    title: "For STEM Professionals — Mentor, Train, Judge & Inspire",
    description:
      "Share your expertise with the next generation: join the AFRISTEM STEM professional network as a mentor, trainer, speaker, judge, consultant or industry partner.",
    keywords: [
      "STEM mentorship Africa",
      "volunteer as STEM mentor",
      "mentor young scientists Nigeria",
      "STEM professionals giving back",
      "judge student competitions",
      "speak at STEM events Africa",
      "STEM career guidance for students",
      "industry partnership STEM education",
      "engineering mentorship programmes Africa",
    ],
    pageType: "WebPage",
    breadcrumb: "For STEM Professionals",
    ogImage: "/images/photos/kids-panel.jpg",
    faqs: [
      {
        q: "How can STEM professionals get involved with AFRISTEM?",
        a: "STEM professionals can participate as mentors, trainers, facilitators, speakers, judges, consultants, project advisers or industry partners across AFRISTEM programmes and events.",
      },
      {
        q: "What time commitment is required?",
        a: "Commitments range from one-off judging or speaking sessions to ongoing mentorship — you choose the role and level of involvement that fits your schedule.",
      },
      {
        q: "Can professionals outside Africa participate?",
        a: "Yes. Many AFRISTEM activities — hangouts, training and mentorship — run online, so professionals anywhere in the world can contribute.",
      },
    ],
  },

  partners: {
    title: "Partners — Organisations Advancing STEM Education With Us",
    description:
      "AFRISTEM collaborates with organisations that share our commitment to STEM education, innovation and youth development — including Prime STEM Nigeria, NJFP, Linguafront and SYLCOUTECH.",
    keywords: [
      "STEM education partners",
      "sponsor STEM competitions Africa",
      "corporate partnership STEM Nigeria",
      "NGO partnerships education Africa",
      "become an AFRISTEM partner",
      "sponsor student competitions",
      "CSR education partnerships Nigeria",
      "STEM grant organisations Africa",
    ],
    pageType: "CollectionPage",
    breadcrumb: "Partners",
    faqs: [
      {
        q: "Who are AFRISTEM's partners?",
        a: "AFRISTEM partners with organisations including Prime STEM Nigeria, the Nigeria Jubilee Fellows Programme (NJFP), Linguafront and SYLCOUTECH, and welcomes new partnerships aligned with STEM education and youth development.",
      },
      {
        q: "How can my organisation partner with AFRISTEM?",
        a: "Organisations can partner through sponsorship, co-delivery of programmes, equipment support, media partnerships or grants. Use the contact page or registration form to start the conversation.",
      },
      {
        q: "What do partners gain?",
        a: "Partners gain visibility at events and across AFRISTEM channels, impact reporting, association with measurable STEM outcomes and a direct role in developing Africa's next generation of innovators.",
      },
    ],
  },

  events: {
    title: "STEM Events 2026-2027 — Competitions, Boot Camps & Hangouts",
    description:
      "Upcoming AFRISTEM events: award tours, International Science Teachers Hangout, STEM Kids Championship international exam, STEMx Boot Camp, ANSC and SciSPELL — with dates and registration links.",
    keywords: [
      "STEM events Africa 2026",
      "science competitions 2027",
      "STEM boot camp registration",
      "teachers hangout Zoom",
      "STEM Kids Championship exam date",
      "African Organic Chemistry Tournament date",
      "science teachers conference online",
      "STEMx boot camp",
      "award ceremony STEM Nigeria",
      "upcoming science events Nigeria",
    ],
    pageType: "CollectionPage",
    breadcrumb: "Events",
    ogImage: "/images/photos/students-crowd.jpg",
    faqs: [
      {
        q: "What are AFRISTEM's upcoming events?",
        a: "The events calendar lists competitions, award tours, teacher hangouts, boot camps and exams — including the International STEMx Boot Camp 5.0 and the Annual National Science Championship. Each listing shows dates, venue and a registration link.",
      },
      {
        q: "How do I register for an AFRISTEM event?",
        a: "Every event card links to the registration page with the event pre-selected. Complete the form and you will receive confirmation and next steps by email.",
      },
      {
        q: "Are AFRISTEM events open to participants outside Nigeria?",
        a: "Several programmes — including the STEM Kids Championship International Edition and Code Africa — are open across Africa, and virtual events such as teacher hangouts welcome participants worldwide.",
      },
    ],
  },

  news: {
    title: "News & Insights — STEM Stories, Updates & Opportunities",
    description:
      "STEM news and insights from AFRISTEM: programme updates, championship announcements, student and school stories, innovation, STEM careers and opportunities for learners across Africa.",
    keywords: [
      "AFRISTEM news",
      "STEM education news Nigeria",
      "science competition results",
      "STEM opportunities for students",
      "scholarships and STEM careers",
      "STEM Kids Championship updates",
      "education innovation Africa",
      "student success stories Nigeria",
    ],
    pageType: "CollectionPage",
    breadcrumb: "News",
    faqs: [
      {
        q: "What kind of stories does the AFRISTEM news section publish?",
        a: "The news section publishes programme announcements, competition results, student and school stories, innovation features, STEM career guidance and opportunities for learners and educators.",
      },
      {
        q: "How can I stay updated on AFRISTEM programmes?",
        a: "Subscribe to the newsletter from any page footer, follow AFRISTEM on social media, or check the events calendar for upcoming deadlines.",
      },
    ],
  },

  gallery: {
    title: "Gallery — Photos & Videos From AFRISTEM Programmes",
    description:
      "Explore photos and videos from AFRISTEM STEM competitions, boot camps, coding and robotics sessions, chemistry practicals, award ceremonies and school programmes across Africa.",
    keywords: [
      "AFRISTEM photos",
      "STEM boot camp pictures",
      "science competition gallery",
      "robotics students photos",
      "STEM Kids Championship winners",
      "coding class Nigeria photos",
      "STEM awards ceremony videos",
      "chemistry practicals students",
    ],
    pageType: "CollectionPage",
    breadcrumb: "Gallery",
  },

  contact: {
    title: "Contact AFRISTEM — Offices in Abakaliki, Abuja & Lagos",
    description:
      "Contact AFRISTEM by form, phone or WhatsApp. Head office: Abakaliki, Ebonyi State; liaison offices in Abuja and Lagos. We serve students, parents, schools, educators and partners worldwide.",
    keywords: [
      "contact AFRISTEM",
      "AFRISTEM phone number",
      "AFRISTEM Abakaliki office",
      "AFRISTEM Abuja office",
      "AFRISTEM Lagos office",
      "STEM education enquiry Nigeria",
      "AFRISTEM WhatsApp",
      "email AFRISTEM",
      "afristemglobal contact",
    ],
    pageType: "ContactPage",
    breadcrumb: "Contact",
    faqs: [
      {
        q: "How can I contact AFRISTEM?",
        a: "You can reach AFRISTEM through the contact form, by phone on +234 810 554 1242, by WhatsApp, or by email at contact@afristemglobal.com. Offices are located in Abakaliki (head office), Abuja and Lagos.",
      },
      {
        q: "How quickly does AFRISTEM respond?",
        a: "The team typically responds within 1-2 working days. Registration and event enquiries are prioritised around published deadlines.",
      },
      {
        q: "Can I contact AFRISTEM from outside Nigeria?",
        a: "Yes — email, WhatsApp and the contact form work worldwide, and many AFRISTEM programmes and all virtual events are open to international participants.",
      },
    ],
  },

  register: {
    title: "Register — Students, Schools, Educators & Partners",
    description:
      "Register for AFRISTEM STEM programmes and events: students, schools (bulk registration), educators, STEM professionals and partner organisations. Complete the form to get started.",
    keywords: [
      "register for STEM competition",
      "AFRISTEM registration",
      "STEM Kids Championship register",
      "register school for science competition",
      "sign up for coding competition Africa",
      "join STEM boot camp",
      "bulk school registration STEM",
      "become AFRISTEM volunteer",
      "chemistry tournament registration",
    ],
    pageType: "WebPage",
    breadcrumb: "Register",
    faqs: [
      {
        q: "Who can register on this page?",
        a: "Students and participants, schools registering students in bulk, educators, STEM professionals and organisations or partners can all register through this page.",
      },
      {
        q: "What happens after I submit the registration form?",
        a: "You receive a confirmation and follow-up details for the specific programme or event, including payment guidance where applicable and preparation materials.",
      },
      {
        q: "Is there a registration fee?",
        a: "Fees vary by programme and are stated on each programme or event page. Some programmes offer early-bird rates for schools registering multiple candidates.",
      },
      {
        q: "Can I register for more than one programme?",
        a: "Yes. Submit a separate registration for each programme or event, or contact the team for guidance on combining participation.",
      },
    ],
  },

  faq: {
    title: "FAQ — AFRISTEM Programmes, Registration & Partnerships",
    description:
      "Answers to common questions about AFRISTEM: programmes, registration, school partnerships, educator participation, STEM professionals, equipment, certificates and contact options.",
    keywords: [
      "AFRISTEM FAQ",
      "how to join AFRISTEM",
      "AFRISTEM registration questions",
      "STEM competition eligibility",
      "does AFRISTEM sell equipment",
      "AFRISTEM certificates",
      "partner with AFRISTEM",
    ],
    pageType: "FAQPage",
    breadcrumb: "FAQ",
  },

  stemGuide: {
    title: "STEM Guide for Schools — Practical Handbook for Teachers",
    description:
      "A practical handbook for STEM teachers in basic and secondary schools — lesson plans, activities, robotics, coding and AI projects, competition preparation and low-cost STEM ideas. Coming soon from Prime STEM Nigeria.",
    keywords: [
      "STEM guide for schools",
      "STEM teacher handbook Nigeria",
      "STEM teaching handbook",
      "how to run a STEM club",
      "practical STEM activities",
      "STEM lesson planning",
      "STEM activities for teachers",
      "how to teach STEM in Nigeria",
      "STEM curriculum guide Africa",
      "teacher STEM resources",
      "low-cost STEM projects",
    ],
    pageType: "WebPage",
    breadcrumb: "STEM Guide for Schools",
    faqs: [
      {
        q: "What is the STEM Guide for Schools?",
        a: "The STEM Guide for Schools is a practical handbook being developed by AFRISTEM to help teachers run engaging STEM activities, lessons and clubs in primary and secondary schools.",
      },
      {
        q: "When will the STEM Guide be available?",
        a: "The guide is coming soon. Join the notification list on this page and we will email you the moment it launches.",
      },
      {
        q: "Who is the STEM Guide for?",
        a: "The guide is written for teachers, school leaders and STEM club coordinators in primary and secondary schools, particularly those introducing hands-on STEM for the first time.",
      },
    ],
  },

  privacy: { title: "Privacy Policy", description: "How AFRISTEM collects, uses and protects your personal data.", keywords: ["AFRISTEM privacy policy"], breadcrumb: "Privacy Policy" },

  terms: { title: "Terms & Conditions", description: "Terms and conditions for using the AFRISTEM website and programmes.", keywords: ["AFRISTEM terms and conditions"], breadcrumb: "Terms & Conditions" },
  cookies: { title: "Cookie Policy", description: "How AFRISTEM uses cookies and similar technologies on this website.", keywords: ["AFRISTEM cookie policy"], breadcrumb: "Cookie Policy" },
} as const satisfies Record<string, PageSeo>;

/** Fully-typed view (optional PageSeo fields accessible on every entry). */
export const seoPages = seoPageData as Record<keyof typeof seoPageData, PageSeo>;

export type SeoPageKey = keyof typeof seoPageData;

/** Keyword clusters for /programmes/[slug] pages. */
export const programmeKeywords: Record<string, string[]> = {
  scispell: [
    "SciSPELL",
    "science spelling bee",
    "SciSPELL registration",
    "science spelling competition Nigeria",
    "spelling bee for science terms",
    "science vocabulary competition",
    "interschool spelling bee Africa",
    "science quiz for primary schools",
    "AFRISTEM SciSPELL",
  ],
  "code-africa": [
    "Code Africa",
    "coding competition Africa",
    "coding competition for secondary school students",
    "pan-African hackathon for schools",
    "kids coding competition Nigeria",
    "computational thinking competition",
    "school coding challenge Africa",
    "young coders competition",
    "AFRISTEM Code Africa",
  ],
  "stem-kids-championship": [
    "STEM Kids Championship",
    "STEM competition for kids",
    "science competition for primary schools",
    "maths competition Nigeria",
    "basic science competition",
    "STEM quiz for JSS students",
    "children science championship Africa",
    "STEM Kids Championship registration",
    "STEM Kids Championship past questions",
    "AFRISTEM STEM Kids Championship",
  ],
  "african-organic-chemistry-tournament": [
    "African Organic Chemistry Tournament",
    "AOCT",
    "chemistry olympiad Africa",
    "interschool chemistry competition",
    "organic chemistry competition Nigeria",
    "chemistry contest for SSS students",
    "science olympiad secondary schools Africa",
    "AOCT registration",
    "AOCT past questions",
    "AFRISTEM chemistry tournament",
  ],
};

/**
 * Programme-specific natural-language FAQs — rendered on each
 * /programmes/[slug] page and emitted as FAQPage JSON-LD so AI answer
 * engines can cite exact responses about each competition.
 */
export const programmeFaqs: Record<string, FaqItem[]> = {
  scispell: [
    {
      q: "What is SciSPELL?",
      a: "SciSPELL — the Science Spelling Bee — is an academic competition by AFRISTEM that challenges students to master scientific terminology through live spelling rounds, building vocabulary, confidence and a deeper appreciation of science.",
    },
    {
      q: "Who can participate in the SciSPELL Science Spelling Bee?",
      a: "SciSPELL is open to primary and secondary school learners who meet the eligibility requirements published for each edition. Schools register their candidates through the AFRISTEM registration page.",
    },
    {
      q: "How does the SciSPELL competition work?",
      a: "The competition runs in stages: school rounds, then regional finals, then a grand finale. Students spell and define scientific terms in live rounds, and winners are recognised with awards and certificates.",
    },
    {
      q: "Why should my school enter SciSPELL?",
      a: "SciSPELL makes science vocabulary exciting, improves students' command of scientific language, develops confidence and public-speaking skills, and encourages healthy academic competition between schools.",
    },
  ],
  "code-africa": [
    {
      q: "What is Code Africa?",
      a: "Code Africa is a pan-African coding competition for schools organised by AFRISTEM, giving young coders a platform to demonstrate coding and computational thinking while competing with peers across African countries.",
    },
    {
      q: "Who can join the Code Africa coding competition?",
      a: "Schools and eligible students aged roughly 10-18 from participating African countries can join. Registration is through the AFRISTEM registration page.",
    },
    {
      q: "How is Code Africa structured?",
      a: "Code Africa runs online qualifying rounds followed by live hackathon finals, moving young people from simply using technology to creating and problem-solving with it.",
    },
    {
      q: "What skills do students gain from Code Africa?",
      a: "Participants develop coding skills, computational thinking, logical reasoning, teamwork and innovation — and connect with learners from other schools and countries.",
    },
  ],
  "stem-kids-championship": [
    {
      q: "What is the STEM Kids Championship?",
      a: "The STEM Kids Championship is a pan-African STEM competition by AFRISTEM where young learners compete in Mathematics, Basic Science and Computer Technology, developing confidence and a strong STEM foundation.",
    },
    {
      q: "Who is eligible for the STEM Kids Championship?",
      a: "The championship is open to learners in Basic 3-6 and JSS 1-3 (ages roughly 6-14) in primary and secondary schools across Africa.",
    },
    {
      q: "When is the next STEM Kids Championship exam?",
      a: "The 5th (International) Edition exam holds on November 14, 2026 across selected African cities. Dates for future editions are published on the AFRISTEM events page.",
    },
    {
      q: "How much does STEM Kids Championship registration cost?",
      a: "Registration fees vary by edition; schools registering 10 candidates or more qualify for the early-bird fee of ₦2,000 per candidate. Payment details are provided during registration.",
    },
    {
      q: "Is there a preparation guide for the championship?",
      a: "Yes. AFRISTEM publishes a Master Preparatory Guide with study topics, strategies and four years of past questions and answers to help candidates prepare with confidence.",
    },
  ],
  "african-organic-chemistry-tournament": [
    {
      q: "What is the African Organic Chemistry Tournament?",
      a: "The African Organic Chemistry Tournament (AOCT) is an interschool organic chemistry olympiad organised by AFRISTEM, challenging senior secondary students to apply and deepen their chemistry knowledge.",
    },
    {
      q: "Who can enter the African Organic Chemistry Tournament?",
      a: "Senior secondary students (SSS 1-3) studying chemistry can enter through their schools. The tournament uses a computer-based test (CBT) format.",
    },
    {
      q: "What are the prizes for the AOCT?",
      a: "The star prize is ₦500,000 cash plus a plaque, alongside other awards for top-performing students and schools.",
    },
    {
      q: "When does the AOCT hold?",
      a: "The 2nd Edition exam window runs November 14-21, 2026. Future editions are announced on the AFRISTEM events page.",
    },
    {
      q: "Why should students participate in the AOCT?",
      a: "The tournament sharpens analytical and problem-solving skills, celebrates chemistry excellence, and inspires interest in science, engineering, medicine and technology careers.",
    },
  ],
};

/**
 * Home page metadata — handled separately because its title is absolute
 * (no "| AFRISTEM" suffix) and it carries the broadest keyword set.
 */
export const homeSeo = {
  title: {
    absolute:
      "AFRISTEM Global | STEM Education, Science Competitions & Online Science School in Africa",
  },
  description:
    "AFRISTEM GLOBAL is a leading STEM education platform running science competitions, coding and robotics programmes, teacher training and an online Digital Science School — inspiring the next generation of African innovators.",
  keywords: [
    "AFRISTEM",
    "AFRISTEM GLOBAL",
    "afristemglobal.org",
    "STEM education Africa",
    "global STEM education platform",
    "science and technology curricula",
    "digital science school",
    "engineering training for youth",
    "coding and robotics for youth",
    "advanced STEM programmes",
    "best global STEM platforms",
    "STEM competitions Nigeria",
    "SciSPELL",
    "Code Africa",
    "STEM Kids Championship",
    "African Organic Chemistry Tournament",
    "Prime STEM Nigeria",
    "online science school Africa",
    "science spelling bee Nigeria",
    "coding competition for schools Africa",
    "STEM boot camps Africa",
    "teacher training Nigeria",
    "WAEC NECO JAMB online preparation",
    "where to study advanced science and technology online",
    "STEM education programmes Nigeria",
  ],
} as const;
