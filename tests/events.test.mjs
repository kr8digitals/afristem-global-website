import test from 'node:test';
import assert from 'node:assert/strict';
import { registrationCutoff, eventState, safeEventUrl } from '../src/lib/events.ts';
const event = { registrationStatus: 'open', registrationCloses: '2026-11-12' };
test('date-only deadline includes all of November 12 in Lagos', () => {
  const cutoff = registrationCutoff(event.registrationCloses);
  assert.equal(new Date(cutoff).toISOString(), '2026-11-12T23:00:00.000Z');
  assert.equal(eventState(event, cutoff - 1), 'open');
  assert.equal(eventState(event, cutoff), 'closed');
  assert.equal(eventState(event, cutoff + 1), 'closed');
});
test('manual closure, pending deadline and verified results', () => {
  const before = Date.parse('2026-10-12T00:00:00Z');
  assert.equal(eventState({ ...event, registrationStatus: 'closed' }, before), 'closed');
  assert.equal(eventState({ ...event, registrationCloses: '' }, before), 'pending');
  assert.equal(eventState({ ...event, registrationCloses: 'invalid' }, before), 'pending');
  assert.equal(eventState({ ...event, registrationStatus: 'pending' }, before), 'pending');
  assert.equal(eventState({ ...event, registrationStatus: 'results' }, before), 'results');
});
test('explicit timestamp and safe document URLs', () => {
  assert.equal(registrationCutoff('2026-11-12T11:00:00+01:00'), Date.parse('2026-11-12T10:00:00Z'));
  assert.equal(safeEventUrl('javascript:alert(1)'), undefined);
  assert.equal(safeEventUrl('//evil.test'), undefined);
  assert.equal(safeEventUrl('/documents/events/skc-2026-handbook.pdf'), '/documents/events/skc-2026-handbook.pdf');
  assert.equal(safeEventUrl('https://selar.com/k484f98wdl'), 'https://selar.com/k484f98wdl');
});
test('manual mode stays open indefinitely, but admin closure/results win', () => {
  const manual = { ...event, registrationClosure: 'manual', registrationCloses: '' };
  const future = Date.parse('2099-01-01T00:00:00Z');
  assert.equal(eventState(manual, future), 'open');
  assert.equal(eventState({ ...manual, registrationCloses: '2020-01-01' }, future), 'open');
  assert.equal(eventState({ ...manual, registrationStatus: 'closed' }, future), 'closed');
  assert.equal(eventState({ ...manual, registrationStatus: 'results' }, future), 'results');
  assert.equal(eventState({ ...manual, registrationStatus: 'pending' }, future), 'pending');
});
