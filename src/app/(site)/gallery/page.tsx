import { pageMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { PageHero, CTABand, SectionHeader } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { GalleryGrid, VideoCard } from "@/components/sections/gallery-grid";
import { content } from "@/lib/content";

export const metadata: Metadata = pageMetadata("/gallery", { title: "Gallery — STEM in Action", description: "Explore moments from AFRISTEM programmes, competitions, training sessions, workshops, exhibitions and other activities." });

export default function GalleryPage() {
  const { gallery, videos } = content();
  return (
    <>
      <PageHero eyebrow="Media & gallery" title={<>STEM in <span className="text-gradient-sun">Action</span></>} description="Explore moments from AFRISTEM programmes, competitions, training sessions, workshops, exhibitions and other activities." compact />
      <section className="py-16 sm:py-24">
        <div className="container-x"><GalleryGrid items={gallery} /></div>
      </section>
      <section id="videos" className="scroll-mt-24 bg-navy-50/60 py-20 sm:py-28">
        <div className="container-x">
          <SectionHeader align="left" eyebrow="Videos" title={<>Programme highlights & <span className="text-gradient-navy">educational content</span></>} />
          <Stagger className="grid gap-6 md:grid-cols-3">
            {videos.map((v) => (
              <StaggerItem key={v.id}><VideoCard v={v} /></StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
      <CTABand title="Want to see your school here?" description="Register for an AFRISTEM programme and become part of the story." />
    </>
  );
}
