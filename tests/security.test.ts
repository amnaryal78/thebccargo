import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('Security & Secrets Hygiene Auditing', () => {
  test('verifies .env.example contains zero real secrets', () => {
    const envExamplePath = path.join(projectRoot, '.env.example');
    assert.ok(fs.existsSync(envExamplePath), '.env.example must exist');
    const content = fs.readFileSync(envExamplePath, 'utf8');

    // Forbidden patterns that look like real keys
    assert.strictEqual(content.includes('sk-or-v1-'), false, 'Must not contain real OpenRouter key');
    assert.strictEqual(content.includes('eyJhbGci'), false, 'Must not contain real Supabase JWT');
    assert.strictEqual(content.includes('AQ.Ab8RN'), false, 'Must not contain real Gemini key');
  });

  test('verifies server.js does not contain hardcoded API keys', () => {
    const serverPath = path.join(projectRoot, 'server.js');
    assert.ok(fs.existsSync(serverPath), 'server.js must exist');
    const content = fs.readFileSync(serverPath, 'utf8');

    assert.strictEqual(content.includes('sk-or-v1-'), false, 'server.js must not contain hardcoded OpenRouter key');
  });

  test('verifies aiBlogFixerService does not contain client-side secrets', () => {
    const fixerPath = path.join(projectRoot, 'src', 'services', 'aiBlogFixerService.ts');
    assert.ok(fs.existsSync(fixerPath), 'aiBlogFixerService.ts must exist');
    const content = fs.readFileSync(fixerPath, 'utf8');

    assert.strictEqual(content.includes('sk-or-v1-'), false, 'aiBlogFixerService.ts must not contain hardcoded API key');
  });

  test('verifies bc-cargo-chat Edge Function does not contain hardcoded keys', () => {
    const fnPath = path.join(projectRoot, 'supabase', 'functions', 'bc-cargo-chat', 'index.ts');
    assert.ok(fs.existsSync(fnPath), 'bc-cargo-chat/index.ts must exist');
    const content = fs.readFileSync(fnPath, 'utf8');

    assert.strictEqual(content.includes('sk-or-v1-'), false, 'Edge Function must not contain hardcoded key');
  });
});
