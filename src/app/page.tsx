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

export default function HomePage() {
  return (
    <>
      <Hero />
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
