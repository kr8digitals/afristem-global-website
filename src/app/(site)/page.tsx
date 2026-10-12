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
import { homeSeo } from "@/content/seo";
import { homeMetadata, faqSchema, webPageSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata = homeMetadata();

export default function HomePage() {
  const { hero, stats, faqs } = content();
  // FAQPage schema must mirror the FAQs rendered by <FAQTeaser/> below.
  const teaserFaqs = faqs.slice(0, 6).map((f) => ({ q: f.question, a: f.answer }));

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
      <JsonLd
        data={webPageSchema({
          path: "/",
          title: homeSeo.title.absolute,
          description: homeSeo.description,
          type: "WebPage",
        })}
      />
      <JsonLd data={faqSchema(teaserFaqs)} />
    </>
  );
}
