import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { AudiencePage } from "@/components/sections/audience-page";

export const metadata: Metadata = pageMetadata("/stem-professionals", { title: "For STEM Professionals", description: "Mentor, train, speak, judge or advise. Join the AFRISTEM STEM professional network and inspire the next generation." });

export default function ProfessionalsPage() {
  return (
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
    />
  );
}
