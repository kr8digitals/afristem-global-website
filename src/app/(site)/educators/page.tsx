import type { Metadata } from "next";
import { AudiencePage } from "@/components/sections/audience-page";

export const metadata: Metadata = { title: "For Educators", description: "Join the AFRISTEM educator network: training, resources, hangouts and opportunities to facilitate, judge and mentor." };

export default function EducatorsPage() {
  return (
    <AudiencePage
      slug="educators"
      servicesSlugs={["professional-development", "stem-education-training", "stem-events-programmes"]}
      highlights={[
        { title: "Practical training", description: "Workshops and hangouts built around what actually works in African classrooms.", icon: "graduation" },
        { title: "Digital literacy", description: "Hands-on sessions on tools and techniques for technology-enabled teaching.", icon: "laptop" },
        { title: "A professional network", description: "Connect with science and technology teachers across Africa and beyond.", icon: "globe" },
        { title: "Facilitate & judge", description: "Serve as a facilitator, judge or coordinator at AFRISTEM competitions and events.", icon: "shield" },
        { title: "Resources", description: "Access question banks, activity guides and STEM club materials.", icon: "book" },
        { title: "Recognition", description: "Be celebrated as a STEM advocate shaping the next generation.", icon: "megaphone" },
      ]}
    />
  );
}
