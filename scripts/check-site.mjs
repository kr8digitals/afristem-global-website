/** Production-build regression runner. No real data or outbound mail is used. */
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const cacheRoot = path.resolve('.cache');
await fs.mkdir(cacheRoot, { recursive: true });
const root = await fs.mkdtemp(path.join(cacheRoot, 'site-check-'));
const password = randomBytes(24).toString('hex');
const secret = randomBytes(32).toString('hex');
let server;
let activeTest;
let logs = '';

async function stop(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise(resolve => child.once('exit', resolve));
  child.kill('SIGTERM');
  await Promise.race([exited, delay(3000)]);
  if (child.exitCode === null && child.signalCode === null) { child.kill('SIGKILL'); await exited; }
}
async function cleanup() {
  await stop(activeTest); await stop(server);
  await fs.rm(root, { recursive: true, force: true });
}
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { void cleanup().finally(() => process.exit(1)); });

async function freePort() {
  const socket = net.createServer();
  await new Promise((resolve, reject) => { socket.once('error', reject); socket.listen(0, '127.0.0.1', resolve); });
  const port = socket.address().port;
  await new Promise((resolve, reject) => socket.close(error => error ? reject(error) : resolve()));
  return port;
}
async function start(env, port) {
  logs = '';
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '0.0.0.0', '-p', String(port)], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server did not become ready in 60 seconds')), 60000);
    function capture(chunk) {
      logs = (logs + chunk.toString()).slice(-20000);
      if (/Ready in/.test(logs)) { clearTimeout(timeout); resolve(); }
    }
    server.stdout.on('data', capture); server.stderr.on('data', capture);
    server.once('error', error => { clearTimeout(timeout); reject(error); });
    server.once('exit', code => { clearTimeout(timeout); reject(new Error(`Server exited (${code})`)); });
  });
  const response = await fetch(`http://127.0.0.1:${port}/robots.txt`, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Server readiness HTTP ${response.status}`);
}
async function runTest(file, env) {
  console.log(`\nRunning ${file}`);
  activeTest = spawn(process.execPath, [file], { env, stdio: 'inherit' });
  const child = activeTest;
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { child.kill('SIGTERM'); reject(new Error(`${file} exceeded 120 seconds`)); }, 120000);
    child.once('error', error => { clearTimeout(timeout); reject(error); });
    child.once('exit', code => { clearTimeout(timeout); code === 0 ? resolve() : reject(new Error(`${file} failed (${code})`)); });
  });
  activeTest = undefined;
}
const groups = [
  { name: 'seo-and-registration', indexing: 'true', tests: ['tests/seo-integration.mjs', 'tests/events-integration.mjs', 'tests/events-migration.mjs'] },
  // Fresh process also resets the normal registration rate limiter.
  { name: 'aoct-manual', indexing: 'true', tests: ['tests/aoct-manual-integration.mjs'] },
  { name: 'preview-noindex', indexing: 'false', tests: ['tests/seo-preview.mjs'] },
];
try {
  for (const group of groups) {
    const port = await freePort();
    const dataDir = path.join(root, group.name);
    const env = { ...process.env, NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1', DATA_DIR: dataDir, TEST_DATA_DIR: dataDir, ADMIN_PASSWORD: password, TEST_ADMIN_PASSWORD: password, ADMIN_SECRET: secret, RESEND_API_KEY: '', SITE_INDEXING_ENABLED: group.indexing, TEST_BASE_URL: `http://127.0.0.1:${port}` };
    await start(env, port);
    for (const test of group.tests) await runTest(test, env);
    await stop(server); server = undefined;
  }
  console.log('\nPASS: production-build regression checks completed; disposable records removed.');
} catch (error) {
  console.error(logs); console.error(error); process.exitCode = 1;
} finally { await cleanup(); }
