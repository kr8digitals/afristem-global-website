import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/legal-page";
export const metadata: Metadata = { title: "Terms & Conditions" };
export default function Page() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="September 2026"
      sections={[
        { h: "Use of this website", p: ["By using afristemglobal.org you agree to these terms. Content is provided for information about AFRISTEM programmes and services and may be updated at any time."] },
        { h: "Programme registration", p: ["Submitting a registration form expresses interest in a programme or event. Places are confirmed by AFRISTEM in writing. Eligibility requirements, dates, fees (where applicable) and rules are stated for each programme and may change with notice."] },
        { h: "Intellectual property", p: ["The AFRISTEM name, logo, programme names and website content are the property of AFRISTEM GLOBAL and may not be reproduced without permission."] },
        { h: "Partner programmes", p: ["Programmes delivered through partners, including Prime STEM Nigeria's Annual National Science Championship and Laptop for Schools Project, are administered by those partners under their own terms."] },
        { h: "Liability", p: ["AFRISTEM takes reasonable care to ensure website content is accurate but accepts no liability for loss arising from reliance on it."] },
        { h: "Governing law", p: ["These terms are governed by the laws of the Federal Republic of Nigeria."] },
      ]}
    />
  );
}
