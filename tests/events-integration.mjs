// Run ONLY against a disposable local server with DATA_DIR isolated and mail disabled.
import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base)) throw new Error('Local test server only');
if (!process.env.TEST_ADMIN_PASSWORD) throw new Error('TEST_ADMIN_PASSWORD required');
let cookie = '';
async function request(path, method = 'GET', body) {
  return fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: body ? JSON.stringify(body) : undefined, redirect: 'manual' });
}
assert.equal((await request('/api/admin/content')).status, 401);
const login = await request('/api/admin/login', 'POST', { password: process.env.TEST_ADMIN_PASSWORD });
assert.equal(login.status, 200); cookie = login.headers.get('set-cookie').split(';')[0];
const original = (await (await request('/api/admin/content')).json()).content;
let events = structuredClone(original.events);
const skc = events.find(e => e.slug === 'stem-kids-championship-2026');
const aoct = events.find(e => e.slug === 'african-organic-chemistry-tournament-2026');
async function save() { const r = await request('/api/admin/content', 'PUT', { section: 'events', value: events }); assert.equal(r.status, 200, await r.text()); }
const data = { event: skc.slug, programme: skc.programmeSlug, eventForm: 'yes', type: 'individual', fullName: 'Test Adult', email: 'test@example.com', phone: '+2348000000000', school: 'Test School', city: 'Aba, Abia, Nigeria', candidates: 'Test Candidate — Basic 3', examMode: 'Online', examLocation: 'Aba, Nigeria', role: 'Parent', participants: '1', consent: 'yes' };
try {
  for (const e of [skc, aoct]) {
    const page = await request(`/events/${e.slug}`); assert.equal(page.status, 200);
    const html = await page.text(); assert.ok(html.includes(e.title.replaceAll('&', '&amp;')));
    for (const url of [e.handbookUrl, e.memorandumUrl, e.flyer]) assert.equal((await request(url)).status, 200);
  }
  assert.equal((await request('/register?programme=' + skc.programmeSlug)).status, 307);
  assert.equal((await request('/events/not-a-real-event')).status, 404);
  // Admin cannot accidentally open an event without a deadline.
  aoct.registrationStatus = 'open'; aoct.registrationClosure = 'deadline';
  assert.equal((await request('/api/admin/content', 'PUT', { section: 'events', value: events })).status, 400);
  aoct.registrationStatus = 'pending';
  skc.registrationCloses = '2099-11-12'; await save();
  const success = await request('/api/register', 'POST', data); assert.equal(success.status, 200);
  const receipt = await success.json(); assert.ok(receipt.reference);
  const stored = (await (await request('/api/admin/content')).json()).content.submissions.register.find(r => r.reference === receipt.reference);
  assert.equal(stored.event, skc.slug); assert.equal(stored.registrationDetails.candidates, data.candidates); assert.equal(stored.school, 'Test School');
  assert.equal((await request('/api/register', 'POST', { ...data, event: aoct.slug, programme: aoct.programmeSlug })).status, 410);
  assert.equal((await request('/api/register', 'POST', { ...data, candidates: 'Not an eligible class' })).status, 400);
  skc.registrationStatus = 'closed'; await save();
  assert.equal((await request('/api/register', 'POST', data)).status, 410);
  let page = await (await request(`/events/${skc.slug}`)).text(); assert.ok(page.includes('Awaiting results')); assert.ok(!page.includes('name="candidates"'));
  skc.registrationStatus = 'open'; skc.registrationCloses = '2020-01-01'; await save();
  assert.equal((await request('/api/register', 'POST', data)).status, 410);
  // Legacy form submissions cannot bypass expiry either.
  assert.equal((await request('/api/register', 'POST', { ...data, eventForm: undefined, event: '' })).status, 410);
  skc.registrationStatus = 'results'; skc.resultsMessage = 'Verified test results are available.'; await save();
  page = await (await request(`/events/${skc.slug}`)).text(); assert.ok(page.includes(skc.resultsMessage)); assert.ok(!page.includes('name="candidates"'));
  const pdf = new FormData(); pdf.append('file', new Blob(['%PDF-1.4\n%%EOF'], { type: 'application/pdf' }), 'test.pdf');
  const upload = await fetch(base + '/api/admin/upload', { method: 'POST', headers: { Cookie: cookie }, body: pdf }); assert.equal(upload.status, 200);
  const asset = await request((await upload.json()).url); assert.equal(asset.headers.get('content-type'), 'application/pdf');
  const csv = await (await request('/api/admin/export?type=register')).text(); assert.ok(csv.includes('Test Candidate')); assert.ok(csv.includes(skc.slug));
  console.log('PASS: routes, all 4 PDFs + 2 flyers, admin auth, deadline validation, registration persistence/export, invalid entries, manual closure, expired/legacy forms, results, PDF upload.');
} finally {
  events = original.events; await save();
}
