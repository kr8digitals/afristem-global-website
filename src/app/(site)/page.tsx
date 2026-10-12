import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("/", { title: { absolute: "AFRISTEM Global | STEM Education & Competitions in Africa" }, description: "Explore AFRISTEM STEM competitions, school programmes, coding, teacher training and science learning in Nigeria and across Africa. Find events and registration details." });
export const dynamic = "force-dynamic";

import { Hero } from "@/components/sections/hero";
import {
  MarqueeStrip,
  WhoWeAre,
  WhatWeDo,
  FeaturedProgrammes,
  PillarsStrip,
  WhyAfristem,
  UpcomingEvents,
  PrimeStemSection,
  PartnersSection,
  TestimonialsSection,
  LatestNews,
  FAQTeaser,
} from "@/components/sections/home-sections";
import { CTABand } from "@/components/ui/primitives";
import { content } from "@/lib/content";

export default function HomePage() {
  const { hero, stats } = content();
  return (
    <>
      <Hero hero={hero} stats={stats} />
      <MarqueeStrip />
      <WhoWeAre />
      <WhatWeDo />
      <FeaturedProgrammes />
      <section className="container-x py-8"><div className="rounded-3xl bg-sun-50 p-8"><h2 className="h3">Looking for STEM competitions or learning opportunities?</h2><p className="mt-3">Compare programmes, check current event registration, and find support for your school or teaching practice.</p><Link href="/explore" className="btn-navy mt-5">Find your STEM opportunity</Link></div></section>
      <PillarsStrip />
      <WhyAfristem />
      <UpcomingEvents />
      <PrimeStemSection />
      <TestimonialsSection />
      <PartnersSection />
      <LatestNews />
      <FAQTeaser />
      <CTABand />
    </>
  );
}
