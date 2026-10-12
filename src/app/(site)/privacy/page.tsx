import { LegalPage } from "@/components/sections/legal-page";
import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata("privacy", "/privacy");
export default function Page() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="September 2026"
      sections={[
        { h: "Who we are", p: ["AFRISTEM GLOBAL (RC 9452641) operates afristemglobal.org. This policy explains how we collect, use and protect personal information submitted through this website."] },
        { h: "Information we collect", p: ["When you register for a programme, contact us or subscribe to our newsletter we collect the details you provide, such as name, email address, phone number, school or organisation, and, for minors, parent/guardian contact details.", "We also collect standard technical information (browser type, pages visited) to keep the site secure and improve it."] },
        { h: "How we use information", p: ["To process programme and event registrations, respond to enquiries, send confirmations and important programme updates, and — where you have opted in — send our newsletter.", "We do not sell personal information."] },
        { h: "Children's information", p: ["Registrations for participants under 18 require a parent/guardian's details and consent. We use children's information only to administer the programme they are registered for."] },
        { h: "Sharing", p: ["We share information only with service providers who help us run the website and programmes (e.g. email delivery), and with partner organisations where necessary to deliver a programme you have registered for."] },
        { h: "Your rights", p: ["You may request access to, correction of, or deletion of your personal information at any time by emailing contact@afristemglobal.com."] },
        { h: "Contact", p: ["Questions about this policy can be sent to contact@afristemglobal.com."] },
      ]}
    />
  );
}
