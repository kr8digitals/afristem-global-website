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
