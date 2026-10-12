import { content } from "@/lib/content";
import { absoluteUrl, xmlEscape } from "@/lib/seo";
export const dynamic = "force-dynamic";
export function GET() {
  const { news, site } = content();
  const items = [...news].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 50).map((p) => {
    const url = xmlEscape(absoluteUrl(`/news/${p.slug}`));
    const published = new Date(p.date);
    return `<item><title>${xmlEscape(p.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><description>${xmlEscape(p.excerpt)}</description><category>${xmlEscape(p.category)}</category>${Number.isFinite(published.getTime()) ? `<pubDate>${published.toUTCString()}</pubDate>` : ""}</item>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xmlEscape(site.name)} News</title><link>${xmlEscape(absoluteUrl("/news"))}</link><description>${xmlEscape(site.description)}</description><language>en</language><atom:link href="${xmlEscape(absoluteUrl("/feed.xml"))}" rel="self" type="application/rss+xml"/>${items.join("")}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=300" } });
}
