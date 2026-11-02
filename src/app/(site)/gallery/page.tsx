export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, CTABand, SectionHeader } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { GalleryGrid, VideoCard } from "@/components/sections/gallery-grid";
import { getContent, isArchivedVideo } from "@/lib/content";

export const metadata: Metadata = { title: "Gallery — STEM in Action", description: "Explore moments from AFRISTEM programmes, competitions, training sessions, workshops, exhibitions and other activities." };

export default async function GalleryPage() {
  const { gallery, videos, galleryCategories } = await getContent();
  const liveVideos = videos.filter((v) => !isArchivedVideo(v.id));
  return (
    <>
      <PageHero eyebrow="Media & gallery" title={<>STEM in <span className="text-gradient-sun">Action</span></>} description="Explore moments from AFRISTEM programmes, competitions, training sessions, workshops, exhibitions and other activities." compact />
      <section className="py-16 sm:py-24">
        <div className="container-x"><GalleryGrid items={gallery.filter((g) => g.src)} categories={galleryCategories} /></div>
      </section>
      {liveVideos.length > 0 && (
      <section id="videos" className="scroll-mt-24 bg-navy-50/60 py-20 sm:py-28">
        <div className="container-x">
          <SectionHeader align="left" eyebrow="Videos" title={<>Programme highlights & <span className="text-gradient-navy">educational content</span></>} />
          <Stagger className="grid gap-6 md:grid-cols-3">
            {liveVideos.map((v) => (
              <StaggerItem key={v.id}><VideoCard v={v} /></StaggerItem>
            ))}
          </Stagger>
          <p className="mt-8 text-sm text-navy-800/60">
            Videos from earlier editions now live in the{" "}
            <Link href="/archive#videos" className="font-bold text-navy-800 underline underline-offset-4">archive</Link>.
          </p>
        </div>
      </section>
      )}
      <CTABand title="Want to see your school here?" description="Register for an AFRISTEM programme and become part of the story." />
    </>
  );
}
