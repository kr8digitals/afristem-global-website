export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero, CTABand } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { FAQAccordion } from "@/components/sections/faq-accordion";
import { JsonLd } from "@/components/seo/json-ld";
import { content } from "@/lib/content";
import { seoPages } from "@/content/seo";
import { buildMetadata, breadcrumbSchema, faqSchema, webPageSchema } from "@/lib/seo";

export const metadata = buildMetadata("faq", "/faq");

export default function FAQPage() {
  const { faqs } = content();
  const items = faqs.map((f) => ({ q: f.question, a: f.answer }));
  return (
    <>
      <PageHero eyebrow="FAQ" title={<>Frequently Asked <span className="text-gradient-sun">Questions</span></>} description="Everything you need to know about participating, registering and partnering with AFRISTEM." compact />
      <section className="py-20">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8"><FAQAccordion items={items} /></div>
          <Reveal className="lg:col-span-4">
            <div className="sticky top-32 rounded-3xl bg-navy-900 p-8 text-white noise">
              <h2 className="font-display text-2xl font-bold">Still have questions?</h2>
              <p className="mt-3 text-white/70">We&apos;re here to help. Contact the AFRISTEM team and we&apos;ll be happy to assist you.</p>
              <Link href="/contact" className="btn-primary mt-6 w-full">Contact Us <ArrowRight className="size-4" /></Link>
            </div>
          </Reveal>
        </div>
      </section>
      <CTABand />
      <JsonLd data={faqSchema(items)} />
      <JsonLd
        data={webPageSchema({
          path: "/faq",
          title: seoPages.faq.title,
          description: seoPages.faq.description,
          type: "FAQPage",
          breadcrumb: breadcrumbSchema([{ name: "FAQ", path: "/faq" }]),
        })}
      />
    </>
  );
}
