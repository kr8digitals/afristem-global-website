// Disposable local store ONLY. Exercises a version-4 -> version-5 upgrade.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const root = path.resolve(process.env.TEST_DATA_DIR || '.cache/event-test-data');
if (!root.startsWith(path.resolve('.cache') + path.sep) || !/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base)) throw new Error('Isolated local .cache test store required');
const file = path.join(root, 'store.json');
const original = fs.readFileSync(file, 'utf8');
try {
  const old = JSON.parse(original);
  old.version = 4;
  old.events = old.events.filter(e => !e.registrationStatus);
  old.events.push({ id: 'event-skc-international-aoct-exam-2026', slug: 'skc-international-aoct-exam-2026', title: 'Old combined listing' });
  old.news = old.news.filter(n => !n.eventSlug);
  old.site.footerNote = 'Custom footer to retain';
  old.announcement.message = 'STEM Kids Championship registration is open — ₦2,000 early-bird per candidate for schools entering 10 or more';
  fs.writeFileSync(file, JSON.stringify(old));
  assert.equal((await fetch(base + '/events')).status, 200);
  const upgraded = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(upgraded.version, 5);
  assert.equal(upgraded.events.filter(e => e.registrationStatus).length, 2);
  assert.ok(!upgraded.events.some(e => e.slug === 'skc-international-aoct-exam-2026'));
  assert.equal(upgraded.news.filter(n => n.eventSlug).length, 2);
  assert.equal(upgraded.site.footerNote, old.site.footerNote);
  assert.deepEqual(upgraded.submissions, old.submissions);
  assert.deepEqual(upgraded.admin, old.admin);
  assert.ok(upgraded.announcement.message.includes('November competitions'));
  console.log('PASS: v4 migration adds both events/news and preserves custom settings, credentials and submissions.');
} finally { fs.writeFileSync(file, original); }
