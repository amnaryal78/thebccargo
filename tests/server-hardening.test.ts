import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// QA Phase 1 (docs/qa/04_FINDINGS.md P1-12..P1-16). server.js runs from a temp copy so it never
// loads the project's .env, and with no AI or Supabase keys, so nothing leaves the machine.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 3071;
let dir = '';
let child: ChildProcess;

function request(urlPath: string, opts: { method?: string; body?: string | Buffer; headers?: Record<string, string> } = {}) {
  return new Promise<{ status: number; body: string }>((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port: PORT, path: urlPath, method: opts.method || 'GET', headers: opts.headers }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode || 0, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

beforeAll(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bc-server-'));
  fs.copyFileSync(path.join(root, 'server.js'), path.join(dir, 'server.js'));
  fs.writeFileSync(path.join(dir, 'package.json'), '{"type":"module"}');
  fs.mkdirSync(path.join(dir, 'dist'));
  fs.writeFileSync(path.join(dir, 'dist', 'index.html'), '<!doctype html><title>ok</title>');
  fs.mkdirSync(path.join(dir, 'dist-private'));
  fs.writeFileSync(path.join(dir, 'dist-private', 'secret.txt'), 'should-not-be-served');

  const env: NodeJS.ProcessEnv = { ...process.env, PORT: String(PORT), HOST: '127.0.0.1' };
  for (const k of ['OPENROUTER_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'DEFAULT_AI_MODEL']) delete env[k];
  child = spawn(process.execPath, ['server.js'], { cwd: dir, env, stdio: 'ignore' });

  for (let i = 0; i < 50; i++) {
    try {
      if ((await request('/api/health')).status === 200) return;
    } catch {
      /* not listening yet */
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('server.js did not start');
}, 15000);

afterAll(async () => {
  if (child && child.exitCode === null) {
    const exited = new Promise((r) => child.once('exit', r));
    child.kill();
    await exited;
  }
  // Windows can hold the folder for a moment after the process exits.
  if (dir) fs.rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
});

describe('server.js hardening', () => {
  test('a malformed URL escape returns 400 and does not crash the server', async () => {
    expect((await request('/%E0%A4%A')).status).toBe(400);
    expect((await request('/api/health')).status).toBe(200);
  });

  test('sibling folders that share the dist prefix are not served', async () => {
    const res = await request('/..%2Fdist-private%2Fsecret.txt');
    expect(res.body).not.toContain('should-not-be-served');
  });

  test('/api/fix-blog refuses requests without a staff session', async () => {
    const body = JSON.stringify({ title: 't', excerpt: 'e', content: 'c' });
    const headers = { 'Content-Type': 'application/json' };
    expect((await request('/api/fix-blog', { method: 'POST', body, headers })).status).toBe(401);
    const forged = await request('/api/fix-blog', { method: 'POST', body, headers: { ...headers, Authorization: 'Bearer abc.def.ghi' } });
    expect(forged.status).toBe(401);
  });

  test('/api/chat rejects oversized and malformed bodies', async () => {
    const headers = { 'Content-Type': 'application/json' };
    const big = JSON.stringify({ message: 'x'.repeat(40 * 1024) });
    expect((await request('/api/chat', { method: 'POST', body: big, headers })).status).toBe(413);
    expect((await request('/api/chat', { method: 'POST', body: '{not json', headers })).status).toBe(400);
    expect((await request('/api/chat', { method: 'POST', body: '[1,2]', headers })).status).toBe(400);
  });

  test('/api/chat still answers normal questions and errors stay generic', async () => {
    const res = await request('/api/chat', { method: 'POST', body: JSON.stringify({ message: 'what is the price', history: 'nope', settings: { model: 'openai/gpt-5', maxTokens: 999999 } }), headers: { 'Content-Type': 'application/json' } });
    expect(res.status).toBe(200);
    expect(JSON.parse(res.body).reply).toMatch(/live rates/i);
  });

  test('only free models are allowed and openrouter/auto is gone', () => {
    const src = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
    expect(src).not.toMatch(/'openrouter\/auto'\s*[,\]]/);
    expect(src).toMatch(/pickModel\(settings\.model\)/);
    expect(src).toMatch(/pickModel\(payload\.model\)/);
    for (const m of src.match(/ALLOWED_AI_MODELS = new Set\(\[([\s\S]*?)\]\)/)![1].matchAll(/'([^']+)'/g)) {
      expect(m[1] === 'openrouter/free' || m[1].endsWith(':free'), m[1]).toBe(true);
    }
  });
});
