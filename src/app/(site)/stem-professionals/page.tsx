import { AudiencePage } from "@/components/sections/audience-page";
import { PageFaq } from "@/components/sections/page-faq";
import { JsonLd } from "@/components/seo/json-ld";
import { seoPages } from "@/content/seo";
import { buildMetadata, breadcrumbSchema, webPageSchema } from "@/lib/seo";

export const metadata = buildMetadata("stemProfessionals", "/stem-professionals");

export default function ProfessionalsPage() {
  return (
    <>
      <AudiencePage
        slug="stem-professionals"
        servicesSlugs={["professional-development", "stem-competitions", "stem-events-programmes"]}
        highlights={[
          { title: "Mentor young talent", description: "Guide students preparing for competitions and exploring STEM careers.", icon: "heart" },
          { title: "Speak & inspire", description: "Share your journey at boot camps, school visits and award ceremonies.", icon: "megaphone" },
          { title: "Judge competitions", description: "Bring your expertise to adjudicating SciSPELL, Code Africa and more.", icon: "trophy" },
          { title: "Advise projects", description: "Support student STEM projects and school programme design as an adviser.", icon: "compass" },
          { title: "Industry partnership", description: "Connect your organisation to a pipeline of Africa's brightest young minds.", icon: "handshake" },
          { title: "Give back with impact", description: "Flexible, meaningful ways to contribute your time and expertise.", icon: "sparkles" },
        ]}
        after={
          <PageFaq
            items={seoPages.stemProfessionals.faqs}
            tone="white"
            eyebrow="FAQ for professionals"
            title={<>Mentoring & volunteering — <span className="text-gradient-navy">professional questions</span></>}
          />
        }
      />
      <JsonLd
        data={webPageSchema({
          path: "/stem-professionals",
          title: seoPages.stemProfessionals.title,
          description: seoPages.stemProfessionals.description,
          type: "WebPage",
          breadcrumb: breadcrumbSchema([{ name: "For STEM Professionals", path: "/stem-professionals" }]),
        })}
      />
    </>
  );
}
