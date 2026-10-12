import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base)) throw new Error('Use a local production build');
const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://afristemglobal.org';
const decode = text => text.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&#x27;', "'");
async function get(path) { const r = await fetch(base + path, { headers: { 'User-Agent': 'Googlebot' }, redirect: 'manual' }); assert.equal(r.status, 200, path); return r.text(); }
const sitemap = await get('/sitemap.xml');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => decode(m[1]));
assert.ok(urls.length > 20); assert.equal(new Set(urls).size, urls.length); assert.ok(!sitemap.includes('<lastmod>'));
for (const required of ['/digital-science-school', '/stem-guide-for-schools', '/explore', '/events/african-organic-chemistry-tournament-2026']) assert.ok(urls.includes(origin + required));
assert.ok(!urls.some(u => /\/admin|\/api\/|\/register/.test(u)));
for (const url of urls) {
  const path = new URL(url).pathname;
  const html = await get(path);
  const canonical = [...html.matchAll(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"[^>]*>/g)];
  assert.equal(canonical.length, 1, `${path}: one canonical`);
  assert.equal(new URL(decode(canonical[0][1])).href, new URL(url).href, `${path}: self canonical`);
  const ogUrl = html.match(/property="og:url" content="([^"]+)"/);
  assert.ok(ogUrl); assert.equal(new URL(decode(ogUrl[1])).href, new URL(url).href, `${path}: page-specific sharing URL`);
  assert.ok(html.includes('application/rss+xml'), `${path}: feed discovery`);
  for (const script of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(script[1]);
}
const eventPath = '/events/african-organic-chemistry-tournament-2026';
const event = await get(eventPath + '?utm_source=test');
assert.ok(event.includes('"@type":"EducationEvent"')); assert.ok(event.includes('"@type":"BreadcrumbList"'));
assert.ok(event.includes('property="og:image" content="' + origin + '/images/events/aoct-2026-flyer.jpeg"'));
assert.ok(event.includes('name="twitter:image" content="' + origin + '/images/events/aoct-2026-flyer.jpeg"'));
assert.ok(!event.includes('"eventStatus":"https://schema.org/EventCancelled"'));
const newsUrl = urls.find(u => u.includes('/news/'));
assert.ok((await get(new URL(newsUrl).pathname)).includes('"@type":"Article"'));
assert.ok((await get('/programmes/stem-kids-championship')).includes('"@type":"EducationalOccupationalProgram"'));
const form = await get('/register'); assert.match(form, /name="robots" content="noindex, follow"/);
const robots = await get('/robots.txt'); assert.ok(robots.includes('Allow: /')); assert.ok(robots.includes('Disallow: /admin')); assert.ok(robots.includes(origin + '/sitemap.xml'));
const rss = await get('/feed.xml'); assert.ok(rss.startsWith('<?xml')); assert.ok(rss.includes('<item>')); assert.ok(!rss.includes('<script'));
const llms = await get('/llms.txt'); assert.ok(llms.includes(origin + eventPath)); assert.ok(!llms.includes('passwordHash')); assert.ok(!llms.includes('registrationDetails'));
assert.equal((await fetch(base + '/seo-page-that-does-not-exist')).status, 404);
console.log(`PASS: ${urls.length} sitemap pages return 200 with unique clean canonicals, social URLs and parseable schema; event/article/programme schema, flyers, form noindex, robots, RSS, public AI directory and 404 checked.`);
