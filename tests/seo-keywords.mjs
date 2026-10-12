import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const file = 'docs/seo/keyword-research-10000.csv';
const before = fs.readFileSync(file, 'utf8');
execFileSync(process.execPath, ['scripts/generate-keywords.mjs']);
assert.equal(fs.readFileSync(file, 'utf8'), before, 'generation must be reproducible');
const lines = before.trimEnd().split('\n');
assert.equal(lines.length, 10001);
const rows = lines.slice(1).map(line => line.slice(1, -1).split('","'));
assert.equal(new Set(rows.map(r => r[0])).size, 10000);
assert.equal(new Set(rows.map(r => r[1])).size, 25);
for (const row of rows) { assert.equal(row.length, 6); assert.ok(row[3].startsWith('/')); assert.ok(row[4].includes('no measured volume')); }
assert.ok(!fs.existsSync('public/keyword-research-10000.csv'));
console.log('PASS: exactly 10,000 unique, reproducible keyword candidates, 25 mapped topics, honest evidence labels; no public keyword dump.');
