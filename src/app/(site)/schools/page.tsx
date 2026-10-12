import { AudiencePage } from "@/components/sections/audience-page";
import { PageFaq } from "@/components/sections/page-faq";
import { JsonLd } from "@/components/seo/json-ld";
import { seoPages } from "@/content/seo";
import { buildMetadata, breadcrumbSchema, webPageSchema } from "@/lib/seo";

export const metadata = buildMetadata("schools", "/schools");

export default function SchoolsPage() {
  return (
    <>
      <AudiencePage
        slug="schools"
        servicesSlugs={["stem-education-training", "stem-equipment-products", "education-consultancy"]}
        highlights={[
          { title: "Competition-ready students", description: "Give your students a platform to compete at state, national and pan-African level across four flagship programmes.", icon: "trophy" },
          { title: "A thriving STEM club", description: "We help you launch or strengthen a STEM club with activities, resources and coaching for teachers.", icon: "sparkles" },
          { title: "Trained teachers", description: "Professional development, digital-literacy hangouts and practical training for your science and technology staff.", icon: "book" },
          { title: "Equipment & kits", description: "Robotics kits, lab equipment and learning resources that make hands-on STEM possible on any budget.", icon: "microscope" },
          { title: "Visibility & recognition", description: "Your school's achievements celebrated at award ceremonies, in our news and across our channels.", icon: "megaphone" },
          { title: "Expert guidance", description: "Education consultancy to design, implement and evaluate an effective whole-school STEM strategy.", icon: "compass" },
        ]}
        after={
          <PageFaq
            items={seoPages.schools.faqs}
            tone="white"
            eyebrow="FAQ for schools"
            title={<>Partnering with AFRISTEM — <span className="text-gradient-navy">school questions</span></>}
          />
        }
      />
      <JsonLd
        data={webPageSchema({
          path: "/schools",
          title: seoPages.schools.title,
          description: seoPages.schools.description,
          type: "WebPage",
          breadcrumb: breadcrumbSchema([{ name: "For Schools", path: "/schools" }]),
        })}
      />
    </>
  );
}
