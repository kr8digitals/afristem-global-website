// Run on a fresh disposable local server with mail disabled.
import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3001';
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base) || !process.env.TEST_ADMIN_PASSWORD) throw new Error('Local server and TEST_ADMIN_PASSWORD required');
let cookie = '';
async function req(path, method = 'GET', body) {
  return fetch(base + path, { method, headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: body ? JSON.stringify(body) : undefined });
}
const login = await req('/api/admin/login', 'POST', { password: process.env.TEST_ADMIN_PASSWORD });
assert.equal(login.status, 200); cookie = login.headers.get('set-cookie').split(';')[0];
const original = (await (await req('/api/admin/content')).json()).content.events;
const events = structuredClone(original);
const aoct = events.find(e => e.slug === 'african-organic-chemistry-tournament-2026');
const data = { event: aoct.slug, programme: aoct.programmeSlug, eventForm: 'yes', type: 'individual', fullName: 'Test Adult', email: 'test@example.com', phone: '+2348000000000', school: 'Test School', city: 'Aba, Nigeria', candidates: 'Test Candidate — SSS 2', examMode: 'Online CBT', examLocation: 'Aba, Nigeria', examDate: '2026-11-14', examTime: '11:00 WAT', role: 'Parent', participants: '1', consent: 'yes' };
async function save(value) { assert.equal((await req('/api/admin/content', 'PUT', { section: 'events', value })).status, 200); }
try {
  assert.equal(aoct.registrationStatus, 'open'); assert.equal(aoct.registrationClosure, 'manual'); assert.equal(aoct.registrationCloses, '');
  await save(events);
  let html = await (await req('/events/' + aoct.slug)).text();
  assert.ok(html.includes('name="candidates"')); assert.ok(html.includes('No automatic closing date'));
  assert.ok(!html.includes('Registration closes in'));
  assert.equal((await req('/api/register', 'POST', data)).status, 200);
  aoct.registrationStatus = 'closed'; await save(events);
  assert.equal((await req('/api/register', 'POST', data)).status, 410);
  html = await (await req('/events/' + aoct.slug)).text();
  assert.ok(html.includes('Awaiting results')); assert.ok(!html.includes('name="candidates"'));
  aoct.registrationStatus = 'open'; await save(events);
  assert.equal((await req('/api/register', 'POST', data)).status, 200);
  console.log('PASS: AOCT open without deadline, form visible, submissions accepted, admin closure enforced, manual reopening works.');
} finally { await save(original); }
