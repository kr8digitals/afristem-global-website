import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight, Award, BadgeCheck, BookOpenCheck, Brain, CalendarClock,
  ClipboardCheck, Compass, Globe2, GraduationCap, HeartHandshake, Laptop, LineChart,
  Lightbulb, MessagesSquare, MonitorPlay, ShieldCheck, Sparkles, Target, Trophy,
  UserCheck, Users, Video,
} from "lucide-react";
import { PageHero, SectionHeader, Pill } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { DIGITAL_SCHOOL_EMAIL, DIGITAL_SCHOOL_URL, site } from "@/content/site";

export const metadata: Metadata = {
  title: "AFRISTEM Digital Science School",
  description:
    "The AFRISTEM Digital Science School — an online science school delivering structured, engaging and personalised learning with intensive mentorship for Primary 4-6, JSS 1-3, SSS 1-3 and WAEC / NECO / JAMB candidates. Flexible Learning. Intensive Mentorship. Outstanding Results.",
  keywords: [
    "online school Nigeria", "digital science school", "WAEC preparation", "NECO preparation",
    "JAMB preparation", "online science classes", "AFRISTEM Digital Science School",
  ],
};

/* ---------------------------------------------------------------- page data */

const whoWeTeach = [
  {
    tag: "Primary 4 - 6",
    title: "Primary School",
    body: "Build strong foundations in English, Mathematics, Science, Digital Literacy and Coding.",
    icon: BookOpenCheck,
  },
  {
    tag: "JSS 1 - 3",
    title: "Junior Secondary",
    body: "Develop strong academic foundations while introducing learners to technology, digital skills and coding.",
    icon: Lightbulb,
  },
  {
    tag: "SSS 1 - 3",
    title: "Senior Secondary",
    body: "Deepen understanding of Mathematics, Sciences and Digital Technology while preparing learners for higher education.",
    icon: GraduationCap,
  },
  {
    tag: "WAEC / NECO / JAMB",
    title: "Examination Preparation",
    body: "Intensive examination-focused preparation with practice tests, revision and mentorship.",
    icon: Target,
  },
];

const whyChooseUs = [
  { title: "Intensive Mentorship", body: "Students don't just attend classes. They receive guidance, monitoring and academic mentorship.", icon: HeartHandshake },
  { title: "Flexible Online Learning", body: "Students can learn from home without sacrificing structured academic instruction.", icon: MonitorPlay },
  { title: "Experienced Teachers", body: "Qualified and carefully selected teachers deliver engaging lessons and provide academic support.", icon: Users },
  { title: "Audio-Visual Aids", body: "Carefully prepared audio, videos, animation and simulations to enhance speedy assimilation of concepts and revision.", icon: Video },
  { title: "Science-Focused Learning", body: "Strong emphasis on science, mathematics, technology and problem-solving.", icon: Sparkles },
  { title: "Continuous Assessment", body: "Students are regularly assessed to identify strengths, weaknesses and areas requiring improvement.", icon: ClipboardCheck },
  { title: "Digital Skills", body: "Learners develop relevant digital skills alongside their academic education.", icon: Laptop },
  { title: "Critical Thinking", body: "Students are trained to understand concepts, solve problems and apply knowledge rather than simply memorise facts.", icon: Brain },
  { title: "Small-Group Interaction", body: "Where possible, classes maintain manageable student numbers to encourage participation and teacher-student interaction.", icon: MessagesSquare },
];

const programmes = [
  {
    id: "primary",
    band: "Primary 4 - 6",
    name: "Primary School Programme",
    subjects: ["English Language", "Mathematics", "Basic Science and Technology", "Basic Digital Literacy", "Coding"],
    objective:
      "To establish strong academic foundations while introducing young learners to digital technology, computational thinking and problem-solving.",
    approach: [
      "Live online lessons", "Interactive activities", "Assignments", "Quizzes", "Projects",
      "Continuous assessment", "Mentorship", "Parent/guardian progress updates",
    ],
    approachLabel: "Learning approach",
  },
  {
    id: "jss",
    band: "JSS 1 - 3",
    name: "Junior Secondary Programme",
    subjects: ["English Studies", "Mathematics", "Intermediate Science", "Digital Technology", "Coding"],
    objective:
      "To strengthen learners' academic foundations while developing their technological competence, logical reasoning and problem-solving abilities.",
    approach: [
      "Mathematics mastery", "English communication", "Scientific thinking", "Digital literacy",
      "Coding", "Problem-solving", "Examination preparation",
    ],
    approachLabel: "Key areas",
  },
  {
    id: "sss",
    band: "SSS 1 - 3",
    name: "Senior Secondary Programme",
    subjects: ["English Studies", "Mathematics", "Digital Technology", "Biology", "Physics", "Chemistry"],
    objective:
      "To provide students with rigorous academic preparation in core subjects while preparing them for tertiary education and major external examinations.",
    approach: [
      "Concept-based teaching", "Practical demonstrations", "Problem-solving", "Past-question practice",
      "Continuous assessment", "Mock examinations", "Academic mentorship", "Career guidance",
    ],
    approachLabel: "Special features",
  },
  {
    id: "exam-prep",
    band: "WAEC | NECO | JAMB",
    name: "Examination Preparation Programme",
    subjects: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics", "Other approved examination subjects"],
    objective:
      "Intensive examination-focused preparation for candidates sitting WAEC, NECO or JAMB, covering the subjects in their chosen examination combination.",
    approach: [
      "Intensive revision", "Past questions", "Mock examinations", "Performance tracking",
      "Personalised mentorship", "Exam strategies",
    ],
    approachLabel: "What candidates get",
  },
];

const steps = [
  { n: "01", title: "Register", body: "Parents, guardians or students complete the online registration form." },
  { n: "02", title: "Assessment", body: "The school may conduct a placement or diagnostic assessment where applicable." },
  { n: "03", title: "Orientation", body: "Students receive information about their classes, timetable, learning platform and expectations." },
  { n: "04", title: "Learn", body: "Students attend scheduled online lessons and participate in assignments, quizzes and activities." },
  { n: "05", title: "Grow & Excel", body: "Teachers monitor performance while mentors provide guidance, with regular assessments and feedback." },
];

const values = [
  { name: "Excellence", body: "We pursue high standards in teaching, learning and student development.", icon: Trophy },
  { name: "Integrity", body: "We promote honesty, responsibility and ethical conduct.", icon: ShieldCheck },
  { name: "Innovation", body: "We embrace technology and innovative approaches to education.", icon: Lightbulb },
  { name: "Mentorship", body: "We believe learners need guidance, encouragement and accountability — not just lessons.", icon: HeartHandshake },
  { name: "Inclusiveness", body: "Every learner deserves an opportunity to learn, grow and succeed.", icon: Globe2 },
  { name: "Discipline", body: "We encourage commitment, punctuality, consistency and personal responsibility.", icon: CalendarClock },
  { name: "Curiosity", body: "We encourage learners to ask questions, explore ideas and discover solutions.", icon: Compass },
];

const freeLearning = [
  "Free science lessons",
  "Free mathematics quizzes",
  "Free coding tutorials",
  "Free examination tips",
  "Free JAMB / WAEC practice questions",
  "Free study guides",
];

const safeguarding = [
  "Protection of children",
  "Appropriate teacher-student communication",
  "Online class conduct",
  "Photography and video consent",
  "Data protection",
  "Reporting inappropriate behaviour",
  "Teacher background and credential verification",
  "Parent and guardian involvement",
  "Responsible use of student information",
];

/* ------------------------------------------------------------------- page */

export default function DigitalScienceSchoolPage() {
  return (
    <>
      <PageHero
        eyebrow="AFRISTEM Schools"
        title={<>Digital <span className="text-gradient-sun">Science School</span></>}
        description="Flexible Learning. Intensive Mentorship. Outstanding Results. Our online science school provides structured, engaging and personalised learning experiences for learners in Primary, Junior Secondary and Senior Secondary classes, as well as candidates preparing for WAEC, NECO and JAMB."
        image="/images/bootcamp/students.jpg"
      >
        <a href={DIGITAL_SCHOOL_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
          Register a Student <ArrowUpRight className="size-4" />
        </a>
        <a href={DIGITAL_SCHOOL_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost-light">
          Apply to Teach
        </a>
      </PageHero>

      {/* ------------------------------------------------ value proposition */}
      <section className="relative overflow-x-clip py-20 sm:py-28">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <Pill tone="sun">Our promise</Pill>
            <h2 className="h2 mt-5 text-navy-900">
              We don&apos;t just teach students. <span className="text-gradient-sun">We mentor them.</span>
            </h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-navy-800/75">
              <p>
                Classes are conducted online with experienced teachers, structured learning schedules, assessments and
                continuous mentorship.
              </p>
              <p>
                Our approach combines quality teaching, flexible online learning, continuous assessment and intensive
                mentorship to help learners understand concepts, develop confidence, improve their academic performance
                and prepare for the future.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={DIGITAL_SCHOOL_URL} target="_blank" rel="noopener noreferrer" className="btn-navy">
                Visit the school <ArrowUpRight className="size-4" />
              </a>
              <Link href="#programmes" className="btn-outline">
                See our programmes
              </Link>
            </div>
          </Reveal>

          <Reveal x={30} y={0}>
            <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4">
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-card-lg">
                <Image src="/images/bootcamp/group-1.jpg" alt="Learners studying together" fill sizes="(min-width:1024px) 25vw, 40vw" className="object-cover" />
              </div>
              <div className="relative mt-10 aspect-[3/4] overflow-hidden rounded-3xl shadow-card-lg">
                <Image src="/images/awards/awardee-girl-1.jpg" alt="A confident young learner" fill sizes="(min-width:1024px) 25vw, 40vw" className="object-cover" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------ who we teach */}
      <section className="bg-navy-50/60 py-20 sm:py-28">
        <div className="container-x">
          <SectionHeader
            eyebrow="Who we teach"
            title={<>Four pathways, <span className="text-gradient-navy">one standard of excellence</span></>}
            description="From the foundations of primary school to intensive external examination preparation."
          />
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whoWeTeach.map((w) => (
              <StaggerItem key={w.tag} className="h-full">
                <article className="card h-full p-7">
                  <span className="icon-badge"><w.icon className="size-6" /></span>
                  <p className="mt-5 font-display text-lg font-extrabold text-navy-900">{w.tag}</p>
                  <p className="mt-1 text-sm font-bold uppercase tracking-wider text-navy-600">{w.title}</p>
                  <p className="mt-4 leading-relaxed text-navy-800/70">{w.body}</p>
                  <a
                    href={DIGITAL_SCHOOL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-navy-800 hover:text-navy-600"
                  >
                    Learn more <ArrowUpRight className="size-4" />
                  </a>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ----------------------------------------------------- why choose us */}
      <section className="relative overflow-x-clip py-20 sm:py-28">
        <div className="container-x">
          <SectionHeader
            eyebrow="Why choose us"
            title={<>Built for parents who want <span className="text-gradient-sun">more than lessons</span></>}
            description="Nine things that make the Digital Science School different from a typical online lesson platform."
          />
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {whyChooseUs.map((f) => (
              <StaggerItem key={f.title} className="h-full">
                <div className="card h-full p-7">
                  <span className="icon-badge"><f.icon className="size-6" /></span>
                  <h3 className="mt-5 font-display text-lg font-bold text-navy-900">{f.title}</h3>
                  <p className="mt-3 leading-relaxed text-navy-800/70">{f.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* --------------------------------------------------------- programmes */}
      <section id="programmes" className="scroll-mt-32 bg-navy-950 py-20 text-white noise sm:py-28">
        <div className="container-x">
          <SectionHeader
            dark
            eyebrow="Programmes"
            title={<>Our <span className="text-gradient-sun">programmes</span></>}
            description="Four structured pathways. Every programme combines live teaching, practice, assessment and mentorship."
          />
          <div className="space-y-8">
            {programmes.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.05}>
                <article
                  id={p.id}
                  className="scroll-mt-32 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm sm:p-10"
                >
                  <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
                    <div className="lg:col-span-5">
                      <span className="inline-flex items-center gap-2 rounded-full bg-sun-400 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-navy-950">
                        <GraduationCap className="size-3.5" /> {p.band}
                      </span>
                      <h3 className="h3 mt-5">{p.name}</h3>
                      <p className="mt-4 leading-relaxed text-white/70">{p.objective}</p>

                      <p className="mt-7 text-[11px] font-extrabold uppercase tracking-[0.25em] text-sun-300">Subjects</p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {p.subjects.map((sub) => (
                          <li key={sub} className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[12.5px] font-semibold text-white/85">
                            {sub}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="lg:col-span-7">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-sun-300">{p.approachLabel}</p>
                      <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                        {p.approach.map((a) => (
                          <li key={a} className="flex items-start gap-2.5 text-[15px] text-white/80">
                            <BadgeCheck className="mt-0.5 size-4 shrink-0 text-sun-400" />
                            {a}
                          </li>
                        ))}
                      </ul>
                      <a
                        href={DIGITAL_SCHOOL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary mt-8"
                      >
                        Register for this programme <ArrowUpRight className="size-4" />
                      </a>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- how it works */}
      <section className="relative overflow-x-clip py-20 sm:py-28">
        <div className="container-x">
          <SectionHeader
            eyebrow="How it works"
            title={<>From registration to <span className="text-gradient-sun">results</span></>}
            description="A simple five-step journey — designed so that nothing is left to chance."
          />
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((s) => (
              <StaggerItem key={s.n} className="h-full">
                <div className="card h-full p-6">
                  <span className="font-display text-3xl font-extrabold text-sun-400">{s.n}</span>
                  <h3 className="mt-3 font-display text-lg font-bold text-navy-900">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-navy-800/70">{s.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ------------------------------------------- beyond the classroom */}
      <section className="relative overflow-x-clip bg-navy-50/60 py-20 sm:py-28">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-card-lg">
              <Image src="/images/awards/certificate-lineup.jpg" alt="Students holding their certificates" fill sizes="(min-width:1024px) 45vw, 90vw" className="object-cover" />
            </div>
          </Reveal>
          <Reveal x={30} y={0} delay={0.08}>
            <Pill tone="mint">Mentorship</Pill>
            <h2 className="h2 mt-5 text-navy-900">Beyond the classroom</h2>
            <p className="mt-4 text-lg leading-relaxed text-navy-800/75">
              Education is more than attending classes. Every learner is connected with mentors who help them:
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Set academic goals",
                "Develop good study habits",
                "Identify weaknesses",
                "Build confidence",
                "Make better academic decisions",
                "Prepare for examinations",
                "Explore careers",
                "Develop digital skills",
                "Stay accountable",
              ].map((m) => (
                <li key={m} className="flex items-start gap-2.5 text-[15px] font-medium text-navy-800/85">
                  <UserCheck className="mt-0.5 size-4 shrink-0 text-navy-600" />
                  {m}
                </li>
              ))}
            </ul>
            <p className="mt-7 rounded-2xl border border-navy-900/10 bg-white p-5 text-[15px] font-semibold text-navy-800 shadow-card">
              This is what differentiates the school from a typical online lesson platform.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------- vision and values */}
      <section className="relative overflow-x-clip py-20 sm:py-28">
        <div className="container-x">
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-[2rem] border border-navy-900/10 bg-white p-8 shadow-card sm:p-10">
                <span className="icon-badge"><Compass className="size-6" /></span>
                <h2 className="h3 mt-5 text-navy-900">Our vision</h2>
                <p className="mt-4 leading-relaxed text-navy-800/75">
                  To create a flexible but highly impactful learning platform where every learner can access quality
                  education, receive intensive mentorship, develop confidence and acquire the knowledge and skills needed
                  to excel academically and thrive in a rapidly changing world.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="h-full rounded-[2rem] border border-navy-900/10 bg-white p-8 shadow-card sm:p-10">
                <span className="icon-badge"><Target className="size-6" /></span>
                <h2 className="h3 mt-5 text-navy-900">Our mission</h2>
                <p className="mt-4 leading-relaxed text-navy-800/75">
                  To provide accessible, structured and engaging online education through excellent teaching, intensive
                  mentorship, continuous assessment, technology-driven learning and a strong culture of academic excellence.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="mt-14">
            <SectionHeader eyebrow="Core values" title={<>What we <span className="text-gradient-sun">stand for</span></>} />
            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v) => (
                <StaggerItem key={v.name} className="h-full">
                  <div className="card h-full p-6">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-sun-400/15 text-navy-700">
                      <v.icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-display text-base font-bold text-navy-900">{v.name}</h3>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-navy-800/70">{v.body}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ free learning */}
      <section className="bg-navy-900 py-20 text-white noise sm:py-28">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <Pill tone="sun">Start free</Pill>
            <h2 className="h2 mt-5">Learn something free</h2>
            <p className="mt-4 text-lg leading-relaxed text-white/75">
              Not ready to enrol? Try the school first. A growing library of free lessons and practice material is open
              to everyone.
            </p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {freeLearning.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[15px] text-white/85">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-sun-400" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-9 rounded-2xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-sm">
              <p className="font-display text-lg font-bold">Enjoyed this lesson? Join our full programme.</p>
              <a href={DIGITAL_SCHOOL_URL} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4">
                Register now <ArrowUpRight className="size-4" />
              </a>
            </div>
          </Reveal>
          <Reveal x={30} y={0}>
            <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4">
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-white/10 shadow-card-lg">
                <Image src="/images/videos/maths-1.jpg" alt="A learner in an online class" fill sizes="(min-width:1024px) 25vw, 40vw" className="object-cover" />
              </div>
              <div className="relative mt-10 aspect-[3/4] overflow-hidden rounded-3xl border border-white/10 shadow-card-lg">
                <Image src="/images/bootcamp/group-3.jpg" alt="Students working on a project" fill sizes="(min-width:1024px) 25vw, 40vw" className="object-cover" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------- child safeguarding */}
      <section className="relative overflow-x-clip py-20 sm:py-28">
        <div className="container-x">
          <div className="overflow-hidden rounded-[2rem] border border-navy-900/10 bg-white shadow-card">
            <div className="grid gap-0 lg:grid-cols-5">
              <div className="bg-navy-50/70 p-8 sm:p-10 lg:col-span-2">
                <span className="icon-badge"><ShieldCheck className="size-6" /></span>
                <h2 className="h3 mt-5 text-navy-900">Child safeguarding</h2>
                <p className="mt-4 leading-relaxed text-navy-800/75">
                  We take the safety of every learner seriously. The school operates a child safeguarding policy that
                  parents and guardians can rely on.
                </p>
                <a
                  href={DIGITAL_SCHOOL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-navy mt-7"
                >
                  Read the policy <ArrowUpRight className="size-4" />
                </a>
              </div>
              <div className="p-8 sm:p-10 lg:col-span-3">
                <ul className="grid gap-3 sm:grid-cols-2">
                  {safeguarding.map((s) => (
                    <li key={s} className="flex items-start gap-2.5 text-[15px] text-navy-800/80">
                      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- contact */}
      <section className="bg-navy-50/60 py-20 sm:py-28">
        <div className="container-x">
          <SectionHeader
            eyebrow="Contact the school"
            title={<>Speak to our <span className="text-gradient-navy">admissions team</span></>}
            description="Admission form is ₦1,000. Tuition varies with class — contact us for more information on the fees."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a href={site.phoneHref} className="card p-6 transition-shadow hover:shadow-card-lg">
              <LineChart className="size-5 text-navy-600" />
              <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-navy-600">Phone</p>
              <p className="mt-1 font-bold text-navy-900">{site.phone}</p>
            </a>
            <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="card p-6 transition-shadow hover:shadow-card-lg">
              <MessagesSquare className="size-5 text-emerald-600" />
              <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-navy-600">WhatsApp</p>
              <p className="mt-1 font-bold text-navy-900">{site.whatsapp}</p>
            </a>
            <a href={`mailto:${DIGITAL_SCHOOL_EMAIL}`} className="card p-6 transition-shadow hover:shadow-card-lg">
              <Award className="size-5 text-navy-600" />
              <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-navy-600">Email</p>
              <p className="mt-1 break-words font-bold text-navy-900">{DIGITAL_SCHOOL_EMAIL}</p>
            </a>
            <div className="card p-6">
              <CalendarClock className="size-5 text-navy-600" />
              <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-navy-600">Office hours</p>
              <p className="mt-1 font-bold text-navy-900">Mon - Fri, 9am - 5pm</p>
            </div>
          </div>

          <Reveal className="mt-10">
            <div className="rounded-[2rem] bg-navy-950 p-8 text-white sm:p-10">
              <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-sun-300">Our address</p>
              <p className="mt-3 font-display text-xl font-bold leading-snug sm:text-2xl">
                AFRISTEM, PCN Plaza, Opposite Stadium, Kpirikpiri Abakaliki, Ebonyi State.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={DIGITAL_SCHOOL_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Register a Student <ArrowUpRight className="size-4" />
                </a>
                <a href={DIGITAL_SCHOOL_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost-light">
                  Apply to Teach
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------- closing CTA */}
      <section className="container-x py-14 sm:py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-navy-900 px-6 py-16 text-center text-white noise sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-sun-400/20 blur-3xl" aria-hidden />
            <div className="relative mx-auto max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-wider backdrop-blur">
                <Sparkles className="size-3.5 text-sun-300" /> AFRISTEM Digital Science School
              </span>
              <h2 className="h2 mt-6">
                Give your child more than lessons. <span className="text-gradient-sun">Give them guidance, confidence and a path to excellence.</span>
              </h2>
              <p className="mt-5 text-lg text-white/75">
                Are you passionate about teaching and mentoring young minds? We are always looking for excellent teachers
                and subject specialists.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href={DIGITAL_SCHOOL_URL} target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center sm:w-auto">
                  Register your child today <ArrowUpRight className="size-4" />
                </a>
                <a href={DIGITAL_SCHOOL_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost-light w-full justify-center sm:w-auto">
                  Apply to teach
                </a>
              </div>
              <p className="mt-6 text-sm text-white/60">
                Both buttons open <span className="font-semibold text-white/80">digitalschool.afristemglobal.org</span> in a new tab.
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
