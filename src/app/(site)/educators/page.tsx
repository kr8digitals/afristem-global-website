import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { AudiencePage } from "@/components/sections/audience-page";
import { ResourceSpotlight } from "@/components/sections/resource-spotlight";

export const metadata: Metadata = pageMetadata("/educators", { title: "STEM Teacher Training & Educator Opportunities", description: "Join the AFRISTEM educator network: training, resources, hangouts and opportunities to facilitate, judge and mentor." });

export default function EducatorsPage() {
  return (
    <>
    <AudiencePage
      slug="educators"
      servicesSlugs={["professional-development", "stem-education-training", "stem-events-programmes"]}
      highlights={[
        { title: "Practical training", description: "Workshops and hangouts built around what actually works in African classrooms.", icon: "graduation" },
        { title: "Digital literacy", description: "Hands-on sessions on tools and techniques for technology-enabled teaching.", icon: "laptop" },
        { title: "A professional network", description: "Connect with science and technology teachers across Africa and beyond.", icon: "globe" },
        { title: "Facilitate & judge", description: "Serve as a facilitator, judge or coordinator at AFRISTEM competitions and events.", icon: "shield" },
        { title: "STEM Guide for Schools", description: "Our forthcoming handbook for basic and secondary teachers — arriving soon.", icon: "book" },
        { title: "Recognition", description: "Be celebrated as a STEM advocate shaping the next generation.", icon: "megaphone" },
      ]}
      after={
        <ResourceSpotlight
          eyebrow="Free resource for teachers"
          title="The STEM Guide for Schools"
          intro="A practical handbook for STEM teachers in basic and secondary schools. Not another book that sits quietly on a shelf — a companion you open when planning a lesson, preparing an activity, starting a STEM club or training students for competition."
          bullets={[
            "Practical ways to teach science — and make mathematics interesting",
            "Coding, digital technology and AI activities",
            "Robotics and simple engineering projects",
            "Experiments students can actually carry out",
            "Tips for preparing students for STEM competitions",
            "How to establish and run a STEM club in your school",
            "Lesson-planning and project templates",
            "Low-cost STEM activities and project ideas",
          ]}
          goal='To help teachers move from "teaching STEM" to actually getting students to DO STEM.'
          image="/images/awards/duo-certificates.jpg"
          ctaLabel="Learn more about the guide"
          ctaHref="/stem-guide-for-schools"
        />
      }
    />
    </>
  );
}
