import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, FlaskConical, Cpu, Bot, Calculator, Wrench, Trophy, Users, ClipboardCheck, FileText, Coins, Compass } from "lucide-react";
import { PageHero, SectionHeader } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { GuideNotifyForm } from "@/components/sections/guide-notify-form";

export const metadata: Metadata = pageMetadata("/stem-guide-for-schools", {
  title: "STEM Guide for Schools",
  description:
    "A practical handbook for STEM teachers in basic and secondary schools — lesson plans, activities, robotics, coding and AI projects, competition preparation and low-cost STEM ideas. Coming soon from Prime STEM Nigeria.",
  keywords: [
    "STEM guide for schools",
    "STEM teacher handbook Nigeria",
    "how to run a STEM club",
    "practical STEM activities",
    "STEM lesson planning",
  ],
});

/** The contents list, lifted from the official Prime STEM Nigeria brief. */
const INSIDE = [
  { title: "Practical ways to teach Science", body: "Approaches that move a lesson from notes on a board to something students can see working.", icon: FlaskConical },
  { title: "Mathematics made interesting", body: "Ideas for connecting maths to real problems students already recognise.", icon: Calculator },
  { title: "Coding, digital technology & AI", body: "Activities for teaching computing and artificial intelligence with limited equipment.", icon: Cpu },
  { title: "Robotics & simple engineering", body: "Build projects that demonstrate mechanical and electrical principles.", icon: Bot },
  { title: "Science experiments students can run", body: "Experiments designed around what a Nigerian classroom actually has available.", icon: Wrench },
  { title: "Engineering design & problem-solving", body: "Structured design challenges that build genuine problem-solving habits.", icon: Compass },
  { title: "Preparing students for competitions", body: "How to coach candidates for SciSPELL, STEM Kids Championship, ANSC and AOCT.", icon: Trophy },
  { title: "Starting and running a STEM club", body: "Setup, scheduling, membership, projects and keeping momentum through the term.", icon: Users },
  { title: "Assessing STEM projects", body: "Simple, fair tools for grading practical work and project-based learning.", icon: ClipboardCheck },
  { title: "Lesson-planning & project templates", body: "Ready-to-use templates so teachers are not starting from a blank page.", icon: FileText },
  { title: "Low-cost STEM activities", body: "Project ideas built from everyday, locally available materials.", icon: Coins },
  { title: "Guidance for coordinators", body: "Support for STEM coordinators, heads of department and school administrators.", icon: BookOpen },
];

const FOR_WHO = [
  "STEM teachers",
  "Science teachers",
  "Mathematics teachers",
  "ICT teachers",
  "STEM coordinators",
  "School administrators",
  "Club coordinators",
  "Competition coaches",
];

/** The vivid classroom the brief asks teachers to picture. */
const VISION = [
  "Students are not just copying notes about electricity — they are building circuits.",
  "They don't just read about engineering — they design and build something.",
  "Mathematics is connected to real-life problems.",
  "Science lessons encourage students to ask questions, experiment, make mistakes, try again and find solutions.",
];

export default function StemGuidePage() {
  return (
    <>
      <PageHero
        eyebrow="Coming soon"
        title="STEM Guide for Schools"
        description="A practical handbook for STEM teachers in basic and secondary schools. Not another book that sits quietly on a shelf — a companion you open while planning a lesson, preparing an activity or training students for a competition."
        image="/images/bootcamp/students.jpg"
      >
        <a href="#notify" className="btn-primary">
          Notify me when it launches <ArrowRight className="size-4" />
        </a>
        <Link href="/educators" className="btn-ghost-light">
          Explore educator programmes
        </Link>
      </PageHero>

      {/* ---------------------------------------------------------------- why */}
      <section className="py-20 sm:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <span className="eyebrow mb-5">Why we wrote it</span>
            <h2 className="h2 text-navy-900">Teaching STEM is not always as easy as it looks.</h2>
            <div className="mt-7 space-y-5 text-[17px] leading-relaxed text-navy-800/75">
              <p>
                Sometimes you know exactly what you want your students to learn — but the bigger question is how to make
                them understand it. How do you make it practical? What activities can you give them? How do you hold
                their interest? And how do you build students who can actually solve problems, not just pass
                examinations?
              </p>
              <p className="font-semibold text-navy-900">
                That is precisely the gap this guide is being written to close.
              </p>
            </div>
          </Reveal>

          <Reveal x={30} y={0}>
            <div className="relative rounded-[2rem] bg-navy-900 p-8 text-white noise sm:p-10">
              <span className="eyebrow-dark mb-5">The goal</span>
              <p className="font-display text-2xl font-extrabold leading-snug sm:text-[1.75rem]">
                To help teachers move from <span className="text-sun-300">teaching STEM</span> to actually getting
                students to <span className="text-sun-300">do STEM</span>.
              </p>
              <ul className="mt-8 space-y-4 border-t border-white/10 pt-8">
                {VISION.map((v) => (
                  <li key={v} className="flex gap-3 text-[15px] leading-relaxed text-white/80">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sun-400" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------- inside */}
      <section className="bg-navy-50/60 py-20 sm:py-28">
        <div className="container-x">
          <SectionHeader
            eyebrow="What's inside"
            title="Twelve practical chapters. Nothing theoretical."
            description="Every section is written to be used in a real classroom on a real Monday morning."
            align="center"
          />
          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {INSIDE.map((item) => (
              <StaggerItem key={item.title}>
                <div className="card card-hover h-full p-6">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-navy-900 text-sun-400">
                    <item.icon className="size-5" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold leading-snug text-navy-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-800/70">{item.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* -------------------------------------------------------------- for whom */}
      <section className="py-20 sm:py-28">
        <div className="container-x">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
            <Reveal>
              <span className="eyebrow mb-5">Who it&apos;s for</span>
              <h2 className="h2 text-navy-900">Written with you in mind.</h2>
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-navy-800/75">
                If you care about giving your students a more practical, engaging and meaningful STEM experience, this
                is one guide you will want to have.
              </p>
              <div className="mt-8 flex flex-wrap gap-2.5">
                {FOR_WHO.map((w) => (
                  <span
                    key={w}
                    className="inline-flex items-center rounded-full border border-navy-900/10 bg-white px-4 py-2 text-sm font-semibold text-navy-800 shadow-[0_1px_0_rgb(0_0_0/0.02)]"
                  >
                    {w}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal x={30} y={0}>
              <div className="card overflow-hidden p-0">
                <div className="bg-navy-900 px-7 py-6 text-white">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-sun-300">In production</p>
                  <p className="mt-1.5 font-display text-xl font-extrabold">We&apos;re putting the finishing touches to it</p>
                </div>
                <div className="space-y-5 p-7">
                  <p className="text-[15px] leading-relaxed text-navy-800/75">
                    The official release and ordering details will be announced soon. Leave your email and we will tell
                    you the moment it is available — before it goes public.
                  </p>
                  <ul className="space-y-3 border-y border-navy-900/8 py-5 text-sm font-semibold text-navy-800">
                    <li className="flex items-center gap-2.5">
                      <span className="size-1.5 rounded-full bg-sun-400" /> Early access for the educator network
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="size-1.5 rounded-full bg-sun-400" /> Bulk rates for schools and groups
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="size-1.5 rounded-full bg-sun-400" /> Compiled by Prime STEM Nigeria
                    </li>
                  </ul>
                  <div id="notify" className="scroll-mt-32">
                    <GuideNotifyForm />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- CTA */}
      <section className="pb-24 sm:pb-32">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-[2rem] bg-navy-950 px-8 py-12 text-white noise sm:px-14 sm:py-16">
            <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-sun-400/20 blur-[100px]" aria-hidden />
            <div className="relative max-w-2xl">
              <h2 className="h2">Preparing students for a competition this term?</h2>
              <p className="lead mt-5 text-white/75">
                Until the guide lands, our team can help directly — competition question banks, coaching guidance and
                classroom activity ideas for your teachers.
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link href="/contact" className="btn-primary">
                  Talk to our team <ArrowRight className="size-4" />
                </Link>
                <Link href="/register" className="btn-ghost-light">
                  Register your school
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
