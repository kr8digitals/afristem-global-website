import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { AudiencePage } from "@/components/sections/audience-page";

export const metadata: Metadata = { title: "For Educators", description: "Join the AFRISTEM educator network: training, resources, hangouts and opportunities to facilitate, judge and mentor." };

function StemGuidePromo() {
  return (
    <section className="pb-24 sm:pb-32">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[2rem] bg-navy-950 px-8 py-11 text-white noise sm:px-12 sm:py-14">
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-sun-400/20 blur-[90px]" aria-hidden />
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="eyebrow-dark mb-4">Coming soon</span>
              <h2 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">
                STEM Guide for Schools
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-white/75">
                A practical handbook for STEM teachers — lesson plans, low-cost activities, robotics and coding
                projects, competition preparation and everything you need to move students from learning STEM to doing
                it. Leave your email and we&apos;ll tell you first.
              </p>
            </div>
            <div className="shrink-0">
              <Link href="/stem-guide-for-schools" className="btn-primary">
                <BookOpen className="size-4" /> Learn more <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function EducatorsPage() {
  return (
    <>
    <AudiencePage
      slug="educators"
      servicesSlugs={["professional-development", "stem-education-training", "stem-events-programmes"]}
      highlights={[
        { title: "Practical training", description: "Workshops and hangouts built around what actually works in African classrooms.", icon: "graduation" },
        { title: "Digital literacy", description: "Hands-on sessions on tools and techniques for technology-enabled teaching.", icon: "laptop" },
        { title: "A professional network", description: "Connect with science and technology teachers across Africa and beyond.", icon: "globe" },
        { title: "Facilitate & judge", description: "Serve as a facilitator, judge or coordinator at AFRISTEM competitions and events.", icon: "shield" },
        { title: "Resources", description: "Access question banks, activity guides and STEM club materials.", icon: "book" },
        { title: "Recognition", description: "Be celebrated as a STEM advocate shaping the next generation.", icon: "megaphone" },
      ]}
    />
    <StemGuidePromo />
    </>
  );
}
