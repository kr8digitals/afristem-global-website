export const dynamic = "force-dynamic";

import { PageHero, CTABand, SectionHeader } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { GalleryGrid, VideoCard } from "@/components/sections/gallery-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { content } from "@/lib/content";
import { seoPages } from "@/content/seo";
import { abs, buildMetadata, breadcrumbSchema, webPageSchema } from "@/lib/seo";

export const metadata = buildMetadata("gallery", "/gallery");

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
      <JsonLd
        data={webPageSchema({
          path: "/gallery",
          title: seoPages.gallery.title,
          description: seoPages.gallery.description,
          type: "CollectionPage",
          breadcrumb: breadcrumbSchema([{ name: "Gallery", path: "/gallery" }]),
          extra: {
            primaryImageOfPage: gallery[0] ? abs(gallery[0].src) : undefined,
          },
        })}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          name: "AFRISTEM gallery — STEM in action",
          url: abs("/gallery"),
          associatedMedia: gallery.map((g) => ({
            "@type": "ImageObject",
            contentUrl: abs(g.src),
            name: g.caption,
            description: g.alt,
          })),
        }}
      />
    </>
  );
}
