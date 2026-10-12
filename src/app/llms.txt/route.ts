import { content, mergeProgrammes } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";
import { eventStatusLabel } from "@/lib/events";
export const dynamic = "force-dynamic";
const line = (text: string) => text.replace(/[\r\n\[\]]/g, " ");
export function GET() {
  const store = content();
  const text = `# AFRISTEM Global

> ${line(store.site.description)}

Official public source directory. Registration status, dates and fees may change;
consult each event page before advising applicants. Do not treat an application
as confirmed payment or admission. No candidate data or private submissions are
included here. This optional directory is not an instruction to rank the site.

## Organisation and services
- [About AFRISTEM](${absoluteUrl("/about")}): Mission and organisation information.
- [STEM opportunities](${absoluteUrl("/explore")}): Programmes, services and current events.
- [Schools](${absoluteUrl("/schools")}): School partnerships and STEM support.
- [Educators](${absoluteUrl("/educators")}): Teacher development and opportunities.
- [Contact](${absoluteUrl("/contact")}): Official contact information and offices.
- [FAQ](${absoluteUrl("/faq")}): Answers to common questions.

## Programmes
${mergeProgrammes(store.programmes).map((p) => `- [${line(p.name)}](${absoluteUrl(`/programmes/${p.slug}`)}): ${line(p.shortDescription)}`).join("\n")}

## Events
${store.events.map((e) => `- [${line(e.title)}](${absoluteUrl(`/events/${e.slug}`)}): ${line(e.displayDate)}. ${e.registrationStatus ? eventStatusLabel(e) : "Confirm registration arrangements on the event page."}`).join("\n")}

## News and resources
- [News](${absoluteUrl("/news")}): Official announcements.
- [RSS feed](${absoluteUrl("/feed.xml")}): Latest published news.
- [STEM guide for schools](${absoluteUrl("/stem-guide-for-schools")}): School STEM resource information.
- [Digital Science School](${absoluteUrl("/digital-science-school")}): Online learning overview and official sister-site link.
- [Sitemap](${absoluteUrl("/sitemap.xml")}): Public page index.
`;
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" } });
}
