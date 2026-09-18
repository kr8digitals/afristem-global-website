import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero, CTABand } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { FAQAccordion } from "@/components/sections/faq-accordion";
import { faqs } from "@/content/data";

export const metadata: Metadata = { title: "Frequently Asked Questions", description: "Answers to common questions about AFRISTEM programmes, registration, schools, educators, STEM professionals, equipment and certificates." };

export default function FAQPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <>
      <PageHero eyebrow="FAQ" title={<>Frequently Asked <span className="text-gradient-sun">Questions</span></>} description="Everything you need to know about participating, registering and partnering with AFRISTEM." compact />
      <section className="py-20">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8"><FAQAccordion items={faqs} /></div>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
