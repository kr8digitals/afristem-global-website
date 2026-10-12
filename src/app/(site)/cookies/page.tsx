import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/legal-page";
export const metadata: Metadata = pageMetadata("/cookies", { title: "Cookie Policy" });
export default function Page() {
  return (
    <LegalPage
      title="Cookie Policy"
      updated="September 2026"
      sections={[
        { h: "What are cookies?", p: ["Cookies are small text files stored on your device by websites you visit. They help websites function and remember your preferences."] },
        { h: "How we use cookies", p: ["This website uses only strictly necessary cookies required for it to function. Embedded third-party content (such as Google Maps or YouTube videos) may set their own cookies when you interact with it."] },
        { h: "Managing cookies", p: ["You can control and delete cookies through your browser settings. Disabling cookies may affect some features of embedded content."] },
      ]}
    />
  );
}
