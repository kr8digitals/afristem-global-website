import type { Metadata } from "next";
import { AudiencePage } from "@/components/sections/audience-page";

export const metadata: Metadata = { title: "For Schools", description: "Partner your school with AFRISTEM for STEM competitions, clubs, training, boot camps, equipment and consultancy." };

export default function SchoolsPage() {
  return (
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
    />
  );
}
