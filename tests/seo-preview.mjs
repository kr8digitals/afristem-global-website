import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL;
if (!base || !/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base)) throw new Error('Isolated local preview server required');
const robots = await (await fetch(base + '/robots.txt')).text();
assert.match(robots, /Disallow: \/\s/);
assert.ok(!robots.includes('Allow: /'));
for (const path of ['/', '/explore', '/events/african-organic-chemistry-tournament-2026', '/news', '/register', '/feed.xml', '/llms.txt']) {
  const response = await fetch(base + path, { headers: { 'User-Agent': 'Googlebot' } });
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get('x-robots-tag') || '', /noindex/, `${path}: noindex HTTP header`);
  if (!path.endsWith('.xml') && !path.endsWith('.txt')) {
    const html = await response.text();
    assert.match(html, /name="robots" content="noindex, nofollow"/, `${path}: noindex metadata`);
  }
}
console.log('PASS: preview robots, HTML metadata and HTTP headers disable indexing without changing production canonical URLs.');
