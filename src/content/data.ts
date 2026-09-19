/**
 * ------------------------------------------------------------------
 *  AFRISTEM Content: services, events, news, partners, FAQs,
 *  gallery, testimonials, audiences.
 *  Everything here is editable without touching components.
 * ------------------------------------------------------------------
 */

export type IconName =
  | "graduation"
  | "trophy"
  | "calendar"
  | "microscope"
  | "compass"
  | "users"
  | "school"
  | "wrench"
  | "flask"
  | "sparkles"
  | "heart"
  | "target"
  | "globe"
  | "lightbulb"
  | "handshake"
  | "laptop"
  | "book"
  | "rocket"
  | "megaphone"
  | "shield";

export type Service = {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  icon: IconName;
  image: string;
  bullets: string[];
};

export const services: Service[] = [
  {
    slug: "stem-education-training",
    title: "STEM Education & Training",
    description:
      "We create engaging learning experiences that help students understand and apply STEM concepts beyond traditional classroom teaching.",
    longDescription:
      "We design and deliver engaging STEM learning experiences for children, teenagers, schools and organisations — from short workshops to term-long enrichment programmes.",
    icon: "graduation",
    image: "/images/photos/kids-panel.jpg",
    bullets: ["Hands-on STEM workshops", "Holiday boot camps", "After-school STEM clubs", "Curriculum-aligned enrichment"],
  },
  {
    slug: "stem-competitions",
    title: "STEM Competitions",
    description:
      "We organise and support competitions that encourage academic excellence, creativity, critical thinking and problem-solving.",
    longDescription:
      "We support the development and delivery of STEM competitions, exhibitions, workshops and educational events — from school level to pan-African finals.",
    icon: "trophy",
    image: "/images/photos/championship-winners-2.jpg",
    bullets: ["Competition design & delivery", "Question banks & assessment", "Judging & adjudication", "Awards & recognition"],
  },
  {
    slug: "stem-events-programmes",
    title: "STEM Events & Programmes",
    description:
      "From boot camps and workshops to exhibitions and special STEM programmes, we create opportunities for young people to explore and experience STEM.",
    longDescription:
      "We plan and run boot camps, workshops, science fairs, exhibitions, teacher hangouts and special STEM days that bring learning to life.",
    icon: "calendar",
    image: "/images/photos/bootcamp-team.jpg",
    bullets: ["Boot camps", "Exhibitions & science fairs", "Teacher hangouts", "Special STEM days"],
  },
  {
    slug: "stem-equipment-products",
    title: "STEM Equipment & Educational Products",
    description:
      "We provide STEM equipment, educational kits and learning resources that support practical and hands-on STEM education.",
    longDescription:
      "We can support institutions seeking to establish or improve practical STEM learning environments — from lab equipment to robotics kits and digital learning tools.",
    icon: "microscope",
    image: "/images/photos/robotics.jpg",
    bullets: ["Science lab equipment", "Robotics & coding kits", "Learning resources", "Lab set-up support"],
  },
  {
    slug: "education-consultancy",
    title: "Education Consultancy",
    description:
      "We work with schools and educational organisations to develop and implement effective STEM education initiatives.",
    longDescription:
      "We provide professional guidance to educational institutions and organisations seeking to introduce or strengthen STEM programmes, activities and learning experiences.",
    icon: "compass",
    image: "/images/photos/field-learning.jpg",
    bullets: ["STEM programme design", "School STEM audits", "Implementation support", "Monitoring & evaluation"],
  },
  {
    slug: "professional-development",
    title: "Professional Development",
    description:
      "We create opportunities for educators and STEM professionals to learn, collaborate, mentor and contribute to STEM development.",
    longDescription:
      "We support educators with skills, resources and approaches for effective STEM teaching, and connect STEM professionals with meaningful ways to give back.",
    icon: "users",
    image: "/images/photos/awards-ceremony-2025.jpg",
    bullets: ["Teacher training", "Digital literacy for educators", "Mentor networks", "Facilitator certification"],
  },
];

export const whyAfristem = [
  {
    title: "Practical Learning",
    description: "We move STEM beyond theory by creating opportunities for learners to experiment, build, create and solve problems.",
    icon: "wrench" as IconName,
  },
  {
    title: "Engaging Experiences",
    description: "We make STEM interesting and relatable, particularly for children and teenagers.",
    icon: "sparkles" as IconName,
  },
  {
    title: "Future-Focused Skills",
    description: "Our programmes encourage creativity, critical thinking, collaboration, problem-solving and technological literacy.",
    icon: "rocket" as IconName,
  },
  {
    title: "Inclusive Opportunities",
    description: "We work to make quality STEM opportunities accessible to learners, schools and communities.",
    icon: "heart" as IconName,
  },
  {
    title: "Strong STEM Ecosystem",
    description: "We connect students, schools, educators, STEM professionals and organisations to create meaningful opportunities.",
    icon: "globe" as IconName,
  },
  {
    title: "Innovation",
    description: "We embrace technology and innovative approaches to improve STEM education.",
    icon: "lightbulb" as IconName,
  },
];

export const approach = [
  { title: "Make STEM Interesting", description: "We use engaging activities and experiences to help young people develop a genuine interest in STEM.", icon: "sparkles" as IconName },
  { title: "Make STEM Practical", description: "We encourage learning through experimentation, projects, technology and real-world applications.", icon: "wrench" as IconName },
  { title: "Make STEM Accessible", description: "We seek to create opportunities for learners from different backgrounds and communities.", icon: "heart" as IconName },
  { title: "Connect People", description: "We bring together students, schools, educators, professionals and organisations.", icon: "handshake" as IconName },
  { title: "Encourage Innovation", description: "We encourage learners to move from simply consuming technology to understanding, creating and innovating.", icon: "lightbulb" as IconName },
];

export const beliefs = [
  { title: "Every Child Can Innovate", description: "We believe that every child has the potential to become an innovator." },
  { title: "STEM Should Be Engaging", description: "We believe that STEM should not be intimidating or boring." },
  { title: "Curiosity Drives Learning", description: "We believe children learn better when they are curious, engaged and given opportunities to experiment." },
  { title: "Africa's Future Depends on STEM", description: "We believe Africa's future depends significantly on how effectively we prepare today's young people to understand and create with science and technology." },
];

export type EventItem = {
  slug: string;
  title: string;
  start: string; // ISO date
  end?: string;
  displayDate: string;
  location: string;
  mode: "Physical" | "Virtual" | "Hybrid";
  description: string;
  deadline?: string;
  registerHref: string;
  tag: string;
  image: string;
};

export const events: EventItem[] = [
  {
    slug: "2026-award-distribution-tour",
    title: "2026 SKC / AOCT / ANSC Award Distribution Tour",
    start: "2026-10-19",
    end: "2026-10-30",
    displayDate: "Oct 19 – 30, 2026",
    location: "All 36 States + FCT, Nigeria",
    mode: "Physical",
    description: "Award distribution tour across all states in Nigeria and the FCT, celebrating winners of the STEM Kids Championship, African Organic Chemistry Tournament and Annual National Science Championship.",
    registerHref: "/register?event=award-tour-2026",
    tag: "Awards",
    image: "/images/photos/championship-winners.jpg",
  },
  {
    slug: "international-science-teachers-hangout-2026",
    title: "International Science Teachers Hangout",
    start: "2026-10-31",
    displayDate: "Oct 31, 2026",
    location: "Online (Zoom)",
    mode: "Virtual",
    description: "A virtual hangout for science teachers across Africa and beyond to share ideas, resources and best practices for engaging STEM teaching.",
    deadline: "Oct 28, 2026",
    registerHref: "/register?event=teachers-hangout-2026",
    tag: "Educators",
    image: "/images/photos/awards-ceremony-2025.jpg",
  },
  {
    slug: "skc-international-aoct-exam-2026",
    title: "STEM Kids Championship (Int'l Edition) & African Organic Chemistry Tournament Exam",
    start: "2026-11-14",
    displayDate: "Nov 14, 2026",
    location: "Selected African cities",
    mode: "Physical",
    description: "International STEM championship and organic chemistry tournament exam holding simultaneously across selected African cities.",
    deadline: "Nov 6, 2026",
    registerHref: "/register?programme=stem-kids-championship",
    tag: "Competition",
    image: "/images/photos/exam-hall.jpg",
  },
  {
    slug: "science-teachers-digital-literacy-hangout-2027",
    title: "Science Teachers' Digital Literacy Hangout",
    start: "2027-02-20",
    displayDate: "Feb 20, 2027",
    location: "Online (Zoom)",
    mode: "Virtual",
    description: "A virtual digital literacy hangout equipping science teachers with practical tools and skills for technology-enabled teaching.",
    deadline: "Feb 17, 2027",
    registerHref: "/register?event=digital-literacy-2027",
    tag: "Educators",
    image: "/images/photos/computer-training.jpg",
  },
];

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: "AFRISTEM News" | "STEM Education" | "Innovation" | "STEM Careers" | "Student Stories" | "School Stories" | "Opportunities";
  date: string;
  displayDate: string;
  readTime: string;
  image: string;
  author: string;
  body: string[];
};

export const posts: Post[] = [
  {
    slug: "2025-nigerian-stem-championship-awards",
    title: "Celebrating Excellence: 2025 Nigerian STEM Championship Awards Ceremony",
    excerpt: "Outstanding young scientists, coders and chemists from across Nigeria were celebrated at the 2025 awards ceremony in partnership with Prime STEM Nigeria.",
    category: "AFRISTEM News",
    date: "2025-12-06",
    displayDate: "Dec 6, 2025",
    readTime: "4 min read",
    image: "/images/photos/awards-ceremony-2025.jpg",
    author: "AFRISTEM Team",
    body: [
      "The 2025 Nigerian STEM Championship Awards Ceremony brought together students, parents, teachers, school leaders and partners to celebrate a year of remarkable achievement in Science, Technology, Engineering and Mathematics.",
      "Winners of the STEM Kids Championship, the African Organic Chemistry Tournament and the Annual National Science Championship received certificates, trophies and prizes recognising their dedication and excellence.",
      "\"What we celebrate today is not just knowledge, but curiosity, resilience and the courage to compete,\" the organisers noted during the ceremony. \"These young people represent the future of African innovation.\"",
      "AFRISTEM extends its gratitude to every participating school, every teacher who prepared their students, and our partners whose support made the ceremony possible.",
    ],
  },
  {
    slug: "why-science-spelling-builds-confident-scientists",
    title: "Why Science Spelling Builds Confident Scientists",
    excerpt: "Scientific vocabulary is the language of discovery. Here is how SciSPELL turns intimidating terminology into an exciting, memorable learning experience.",
    category: "STEM Education",
    date: "2026-01-15",
    displayDate: "Jan 15, 2026",
    readTime: "5 min read",
    image: "/images/photos/award-winners-purple.jpg",
    author: "AFRISTEM Team",
    body: [
      "Every scientific discipline has its own language. From 'photosynthesis' to 'mitochondria' to 'electronegativity', the words students encounter in textbooks can feel like barriers — or they can become keys that unlock understanding.",
      "SciSPELL was designed around a simple insight: when students master the vocabulary of science, they gain confidence to engage with the concepts behind the words.",
      "Beyond spelling, participants learn etymology, definitions and context. They stand before an audience, listen carefully, think under pressure and communicate clearly — skills that serve them far beyond the competition stage.",
      "Schools that have taken part report students returning to class more curious, more articulate, and more willing to ask questions. That is exactly the outcome SciSPELL was built to create.",
    ],
  },
  {
    slug: "from-consumers-to-creators-code-africa",
    title: "From Consumers to Creators: The Vision Behind Code Africa",
    excerpt: "Young Africans are among the world's most enthusiastic technology users. Code Africa exists to help them become its builders.",
    category: "Innovation",
    date: "2026-03-02",
    displayDate: "Mar 2, 2026",
    readTime: "6 min read",
    image: "/images/photos/computer-lab.jpg",
    author: "AFRISTEM Team",
    body: [
      "Africa has the youngest population on earth, and its young people are embracing technology at an extraordinary pace. But using technology and creating with it are two very different things.",
      "Code Africa is a pan-African coding competition built to close that gap. It challenges students to think computationally, solve real problems and build working solutions — often for the first time.",
      "Participating schools gain more than a competition entry. They gain a reason to start a coding club, train a teacher, and give students a platform to showcase what they can build.",
      "As the competition grows across borders, it is also building something bigger: a network of young African coders who know each other, learn from each other and will one day build together.",
    ],
  },
  {
    slug: "how-schools-can-start-a-stem-club",
    title: "How Your School Can Start a Thriving STEM Club",
    excerpt: "A practical, step-by-step guide for school leaders and teachers who want to bring hands-on STEM into their school — even on a tight budget.",
    category: "School Stories",
    date: "2026-05-20",
    displayDate: "May 20, 2026",
    readTime: "7 min read",
    image: "/images/photos/robotics.jpg",
    author: "AFRISTEM Team",
    body: [
      "You don't need a state-of-the-art laboratory to start a STEM club. You need a committed teacher, a regular time slot, and a few well-chosen activities that make students want to come back.",
      "Start small: one afternoon a week, a simple challenge (build the tallest paper tower, program a simple game, extract DNA from a strawberry), and a culture where trying and failing is celebrated.",
      "Connect the club to something bigger. Registering for a competition like SciSPELL, Code Africa or the STEM Kids Championship gives students a goal to work toward and a reason to take the club seriously.",
      "AFRISTEM works with schools to introduce or strengthen STEM programmes, activities and learning experiences. If you would like support, reach out through our Schools page.",
    ],
  },
  {
    slug: "stem-careers-africa-needs",
    title: "10 STEM Careers Africa Urgently Needs More Of",
    excerpt: "From renewable-energy engineers to data scientists and biomedical researchers — a look at the STEM careers that will shape Africa's next decade.",
    category: "STEM Careers",
    date: "2026-07-08",
    displayDate: "Jul 8, 2026",
    readTime: "5 min read",
    image: "/images/photos/students-campus.jpg",
    author: "AFRISTEM Team",
    body: [
      "Africa's challenges — in energy, health, agriculture, infrastructure and finance — are also its greatest opportunities. Every one of them needs STEM talent.",
      "Renewable-energy engineers, software developers, data scientists, agricultural scientists, biomedical researchers, cybersecurity specialists, environmental scientists, robotics engineers, chemical engineers and mathematics educators are all in growing demand.",
      "The good news: the foundations for every one of these careers are laid in primary and secondary school. Curiosity, problem-solving and a love of learning matter more than any single subject.",
      "AFRISTEM programmes are designed to spark those foundations early, so that today's competitors become tomorrow's professionals.",
    ],
  },
  {
    slug: "student-story-first-chemistry-tournament",
    title: "Student Story: 'The Tournament Made Me Fall in Love With Chemistry'",
    excerpt: "A senior secondary student shares how preparing for the African Organic Chemistry Tournament changed how she sees science — and her future.",
    category: "Student Stories",
    date: "2026-08-25",
    displayDate: "Aug 25, 2026",
    readTime: "4 min read",
    image: "/images/photos/chemistry-lab.jpg",
    author: "AFRISTEM Team",
    body: [
      "\"Before the tournament, organic chemistry was just diagrams I had to memorise. Preparing for it changed everything — I started to see the logic, the patterns, the beauty in how molecules behave.\"",
      "Months of preparation with her chemistry teacher and classmates turned into hours of focused problem-solving on tournament day. She did not win first place. She says it did not matter.",
      "\"I discovered I could think through a hard problem without panicking. I discovered I actually enjoy it. Now I want to study chemical engineering.\"",
      "Stories like hers are why the African Organic Chemistry Tournament exists: not only to identify the best, but to inspire everyone who takes part.",
    ],
  },
];

export const postCategories = [
  { name: "AFRISTEM News", description: "Updates about the organisation and its activities." },
  { name: "STEM Education", description: "Articles about STEM learning and education." },
  { name: "Innovation", description: "Stories about technology, inventions and innovation." },
  { name: "STEM Careers", description: "Information about STEM careers and opportunities." },
  { name: "Student Stories", description: "Highlighting student achievements and experiences." },
  { name: "School Stories", description: "Showcasing schools making an impact through STEM." },
  { name: "Opportunities", description: "Scholarships, competitions, training and other opportunities." },
];

export type Partner = {
  slug: string;
  name: string;
  logo: string;
  type: string;
  description: string[];
  href: string;
  ctaLabel: string;
  external?: boolean;
  country?: string;
};

export const partners: Partner[] = [
  {
    slug: "prime-stem-nigeria",
    name: "Prime STEM Nigeria",
    logo: "/images/partners/prime-stem-nigeria.png",
    type: "Ecosystem Partner",
    country: "Nigeria",
    description: [
      "Prime STEM Nigeria is a key partner within the AFRISTEM STEM education ecosystem.",
      "Prime STEM Nigeria is focused on advancing STEM education and creating opportunities for young people through national STEM programmes, competitions and educational initiatives.",
      "Through this relationship, AFRISTEM is connected to programmes that provide additional opportunities for students and schools.",
    ],
    href: "/prime-stem-nigeria",
    ctaLabel: "Explore Prime STEM Nigeria",
  },
  {
    slug: "njfp",
    name: "Nigeria Jubilee Fellows Programme",
    logo: "/images/partners/njfp.png",
    type: "Strategic Partner",
    country: "Nigeria",
    description: [
      "The Nigeria Jubilee Fellows Programme (NJFP) is one of AFRISTEM's strategic partners.",
      "The partnership reflects AFRISTEM's commitment to creating meaningful opportunities that connect education, skills development, technology and youth empowerment.",
    ],
    href: "https://njfp.ng",
    ctaLabel: "Learn More",
    external: true,
  },
  {
    slug: "linguafront",
    name: "Linguafront",
    logo: "/images/partners/linguafront.png",
    type: "Education Partner",
    description: [
      "Linguafront is an AFRISTEM partner supporting opportunities at the intersection of education, language and global engagement.",
      "The partnership strengthens AFRISTEM's ability to connect learners and educational stakeholders with broader opportunities for learning and development.",
    ],
    href: "/contact?subject=Linguafront",
    ctaLabel: "Learn More",
  },
  {
    slug: "sylcoutech",
    name: "SYLCOUTECH Ltd",
    logo: "/images/partners/sylcoutech.png",
    type: "International Partner",
    country: "Zimbabwe",
    description: [
      "SYLCOUTECH Ltd, Zimbabwe is an international partner contributing to AFRISTEM's vision of expanding STEM opportunities beyond national boundaries.",
      "The partnership strengthens AFRISTEM's Pan-African outlook and supports collaboration across African countries in education, technology and youth development.",
    ],
    href: "/contact?subject=SYLCOUTECH",
    ctaLabel: "Learn More",
  },
];

export const faqs = [
  { q: "Who can participate in AFRISTEM programmes?", a: "AFRISTEM programmes vary by age and category. Each programme page clearly states its eligibility requirements — from primary school learners in the STEM Kids Championship to senior secondary students in the African Organic Chemistry Tournament." },
  { q: "How do I register for an AFRISTEM programme?", a: "Visit the Registration page and complete the relevant form. Some programmes may have specific registration requirements or windows, which are stated on each programme page." },
  { q: "Can schools register their students?", a: "Yes. Where applicable, schools can register students for AFRISTEM programmes and competitions. Bulk school registration is available on the Registration page." },
  { q: "Are AFRISTEM programmes available online?", a: "Some programmes may be offered online, physically or in hybrid formats depending on the programme. Our teacher hangouts, for example, are fully virtual." },
  { q: "Can my school partner with AFRISTEM?", a: "Yes. AFRISTEM welcomes partnerships with schools and educational institutions for competitions, STEM clubs, training, boot camps, equipment and consultancy." },
  { q: "Can educators participate?", a: "Yes. Educators can participate in teacher training, workshops, professional development, and can serve as facilitators, judges, mentors and programme coordinators." },
  { q: "Can STEM professionals volunteer?", a: "Yes. STEM professionals can participate as mentors, facilitators, trainers, speakers, judges, consultants, project advisers or industry partners." },
  { q: "Does AFRISTEM sell STEM equipment?", a: "Yes. AFRISTEM provides STEM equipment, educational kits and learning resources, and can support institutions in setting up practical STEM learning environments." },
  { q: "Does AFRISTEM provide certificates?", a: "Certificates are provided for programmes where certification is applicable. Details are stated on the individual programme page." },
  { q: "Can organisations partner with AFRISTEM?", a: "Yes. We welcome partnerships with organisations that share our commitment to STEM education, innovation, technology and youth development." },
  { q: "How can I contact AFRISTEM?", a: "You can reach us through the Contact page using the enquiry form, by phone or WhatsApp, or via the official contact channels listed on this website." },
];

export const galleryCategories = ["All", "Programmes", "Competitions", "Training", "Workshops", "Students", "Schools", "STEM Projects", "Events"] as const;
export type GalleryCategory = (typeof galleryCategories)[number];

export type GalleryItem = { src: string; alt: string; category: Exclude<GalleryCategory, "All">; caption: string; span?: "tall" | "wide" };

export const gallery: GalleryItem[] = [
  { src: "/images/photos/championship-winners.jpg", alt: "STEM Kids Championship winners", category: "Competitions", caption: "STEM Kids Championship winners", span: "wide" },
  { src: "/images/photos/chemistry-lab.jpg", alt: "Students in the chemistry lab", category: "STEM Projects", caption: "Organic chemistry practical" },
  { src: "/images/photos/robotics.jpg", alt: "Robotics session", category: "STEM Projects", caption: "Robotics and coding club" },
  { src: "/images/photos/bootcamp-team.jpg", alt: "Bootcamp team", category: "Training", caption: "International STEM Boot Camp", span: "tall" },
  { src: "/images/photos/awards-ceremony-2025.jpg", alt: "Awards ceremony 2025", category: "Events", caption: "2025 Awards Ceremony", span: "wide" },
  { src: "/images/photos/computer-lab.jpg", alt: "Coding class", category: "Programmes", caption: "Code Africa training" },
  { src: "/images/photos/exam-hall.jpg", alt: "Exam hall", category: "Competitions", caption: "Championship exam day" },
  { src: "/images/photos/school-assembly.jpg", alt: "School assembly", category: "Schools", caption: "Partner school assembly", span: "wide" },
  { src: "/images/photos/award-winners-purple.jpg", alt: "Award winners", category: "Students", caption: "SciSPELL finalists" },
  { src: "/images/photos/students-balcony.jpg", alt: "Students at school", category: "Students", caption: "Learners at a partner school" },
  { src: "/images/photos/trophies.jpg", alt: "Trophies", category: "Events", caption: "Trophy presentation" },
  { src: "/images/photos/students-crowd.jpg", alt: "Students gathered", category: "Schools", caption: "STEM outreach day" },
  { src: "/images/photos/kids-panel.jpg", alt: "Kids panel", category: "Workshops", caption: "Young innovators panel", span: "wide" },
  { src: "/images/photos/field-learning.jpg", alt: "Field learning", category: "Workshops", caption: "Outdoor science workshop" },
  { src: "/images/photos/computer-training.jpg", alt: "Computer training", category: "Training", caption: "Digital literacy training" },
  { src: "/images/photos/students-campus.jpg", alt: "Students on campus", category: "Events", caption: "STEM day at a partner school" },
  { src: "/images/photos/championship-winners-2.jpg", alt: "Championship winners", category: "Competitions", caption: "Regional champions" },
].map((g) => ({ ...g, src: g.src.endsWith(".jpg") ? g.src : `${g.src}.jpg` })) as GalleryItem[];

export const videos = [
  { id: "afristem-highlights", title: "AFRISTEM Programme Highlights", description: "A look at what happens when young minds meet hands-on STEM.", thumb: "/images/photos/bootcamp-team.jpg", youtubeId: "" },
  { id: "skc-2025", title: "STEM Kids Championship 2025 Recap", description: "Moments from the Pan-African edition.", thumb: "/images/photos/championship-winners.jpg", youtubeId: "" },
  { id: "teachers-hangout", title: "Science Teachers Hangout", description: "Educators sharing what works in the STEM classroom.", thumb: "/images/photos/awards-ceremony-2025.jpg", youtubeId: "" },
];

export const testimonials = [
  {
    quote: "Our students came back from the STEM Kids Championship more confident and more curious than we have ever seen them. AFRISTEM made science feel like an adventure.",
    name: "Head Teacher",
    role: "Partner School, Ebonyi State",
    initials: "HT",
  },
  {
    quote: "The teacher hangout gave me practical tools I used in class the very next day. It is rare to find professional development that is this relevant.",
    name: "Science Teacher",
    role: "Secondary School, Abuja",
    initials: "ST",
  },
  {
    quote: "Preparing for the African Organic Chemistry Tournament made me fall in love with chemistry. Now I want to study chemical engineering.",
    name: "Tournament Participant",
    role: "SS3 Student",
    initials: "TP",
  },
  {
    quote: "AFRISTEM's team understood exactly what our school needed to launch a coding club — and helped us make it happen on a modest budget.",
    name: "School Proprietor",
    role: "Private School, Lagos",
    initials: "SP",
  },
];

export const audiences = [
  {
    slug: "schools",
    title: "Schools",
    heading: "Let's Build the Future of STEM Education Together",
    intro: "AFRISTEM works with schools to provide students with meaningful opportunities to learn, compete, create and innovate.",
    listLabel: "Schools can partner with AFRISTEM for:",
    items: ["STEM competitions", "STEM clubs", "Training programmes", "Boot camps", "STEM projects", "Teacher development", "STEM equipment", "Educational consultancy", "Special STEM events"],
    cta: "Partner Your School With AFRISTEM",
    ctaHref: "/register?type=school",
    image: "/images/photos/school-assembly.jpg",
    icon: "school" as IconName,
    blurb: "Register students and explore STEM opportunities for your school.",
  },
  {
    slug: "educators",
    title: "Educators",
    heading: "Empowering the People Who Inspire Learners",
    intro: "Educators play a critical role in developing the next generation of STEM thinkers and innovators. AFRISTEM provides opportunities for teachers and educators to develop their skills, access STEM resources and participate in STEM initiatives.",
    listLabel: "Educators can participate as:",
    items: ["Teachers", "Facilitators", "Trainers", "Mentors", "Judges", "Programme coordinators", "STEM advocates"],
    cta: "Join the AFRISTEM Educator Network",
    ctaHref: "/register?type=educator",
    image: "/images/photos/awards-ceremony-2025.jpg",
    icon: "book" as IconName,
    blurb: "Discover training, resources and professional development opportunities.",
  },
  {
    slug: "stem-professionals",
    title: "STEM Professionals",
    heading: "Your Knowledge Can Inspire the Next Generation",
    intro: "Africa's STEM future requires professionals who are willing to share their knowledge, experience and expertise with young people. AFRISTEM provides opportunities for STEM professionals to contribute to STEM education and youth development.",
    listLabel: "Get involved as a:",
    items: ["Mentor", "Trainer", "Facilitator", "Speaker", "Judge", "Consultant", "Project adviser", "Industry partner"],
    cta: "Join Our STEM Professional Network",
    ctaHref: "/register?type=professional",
    image: "/images/photos/kids-panel.jpg",
    icon: "users" as IconName,
    blurb: "Join as a mentor, facilitator, trainer, speaker, judge or consultant.",
  },
];

export const registrationTypes = [
  { value: "student", label: "Student / Participant" },
  { value: "school", label: "School (bulk registration)" },
  { value: "educator", label: "Educator" },
  { value: "professional", label: "STEM Professional" },
  { value: "partner", label: "Organisation / Partner" },
];

export const contactCategories = ["Student", "Parent", "School", "Educator", "STEM Professional", "Organization", "Partner", "General Enquiry"];
