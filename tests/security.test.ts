import { test, describe, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('Security & Secrets Hygiene Auditing', () => {
  test('verifies .env.example contains zero real secrets', () => {
    const envExamplePath = path.join(projectRoot, '.env.example');
    expect(fs.existsSync(envExamplePath)).toBe(true);
    const content = fs.readFileSync(envExamplePath, 'utf8');

    // Forbidden patterns that look like real keys
    expect(content.includes('sk-or-v1-')).toBe(false);
    expect(content.includes('eyJhbGci')).toBe(false);
    expect(content.includes('AQ.Ab8RN')).toBe(false);
  });

  test('verifies server.js does not contain hardcoded API keys', () => {
    const serverPath = path.join(projectRoot, 'server.js');
    expect(fs.existsSync(serverPath)).toBe(true);
    const content = fs.readFileSync(serverPath, 'utf8');

    expect(content.includes('sk-or-v1-')).toBe(false);
  });

  test('verifies aiBlogFixerService does not contain client-side secrets', () => {
    const fixerPath = path.join(projectRoot, 'src', 'services', 'aiBlogFixerService.ts');
    expect(fs.existsSync(fixerPath)).toBe(true);
    const content = fs.readFileSync(fixerPath, 'utf8');

    expect(content.includes('sk-or-v1-')).toBe(false);
  });

  test('verifies bc-cargo-chat Edge Function does not contain hardcoded keys', () => {
    const fnPath = path.join(projectRoot, 'supabase', 'functions', 'bc-cargo-chat', 'index.ts');
    expect(fs.existsSync(fnPath)).toBe(true);
    const content = fs.readFileSync(fnPath, 'utf8');

    expect(content.includes('sk-or-v1-')).toBe(false);
  });
});
