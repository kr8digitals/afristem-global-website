import { FAQAccordion } from "@/components/sections/faq-accordion";
import { SectionHeader } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { faqSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import type { FaqItem } from "@/content/seo";

/**
 * Visible FAQ section + matching FAQPage JSON-LD.
 *
 * Natural-language Q&A sections give conversational AI engines
 * (ChatGPT, Gemini, Perplexity, Google AI Overviews) exact snippets to
 * cite when users ask about AFRISTEM programmes, registration and
 * STEM learning in general.
 */
export function PageFaq({
  items,
  eyebrow = "FAQ",
  title,
  description,
  tone = "tinted",
}: {
  items: readonly FaqItem[] | undefined;
  eyebrow?: string;
  title?: React.ReactNode;
  description?: string;
  /** "tinted" renders on the light-navy background, "white" on white. */
  tone?: "tinted" | "white";
}) {
  if (!items?.length) return null;
  return (
    <>
      <section className={`${tone === "white" ? "bg-white" : "bg-navy-50/60"} py-24 sm:py-28`} aria-label="Frequently asked questions">
        <div className="container-x">
          <SectionHeader
            eyebrow={eyebrow}
            title={title ?? <>Frequently Asked <span className="text-gradient-navy">Questions</span></>}
            description={description}
          />
          <Reveal className="mx-auto max-w-3xl">
            <FAQAccordion items={items.map((f) => ({ q: f.q, a: f.a }))} />
          </Reveal>
        </div>
      </section>
      <JsonLd data={faqSchema(items as FaqItem[])} />
    </>
  );
}
