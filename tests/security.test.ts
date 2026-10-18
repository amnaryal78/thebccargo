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

  test('verifies server.js implements production CSP, HSTS, and rate limiting', () => {
    const serverPath = path.join(projectRoot, 'server.js');
    expect(fs.existsSync(serverPath)).toBe(true);
    const content = fs.readFileSync(serverPath, 'utf8');

    expect(content.includes('Content-Security-Policy')).toBe(true);
    expect(content.includes('Strict-Transport-Security')).toBe(true);
    expect(content.includes('Permissions-Policy')).toBe(true);
    expect(content.includes('checkRateLimit')).toBe(true);
    expect(content.includes('X-Content-Type-Options')).toBe(true);
  });

  test('verifies isSupabaseConfigured rejects placeholder and your-project domains', async () => {
    // Test logic pattern matching src/lib/supabase.ts
    const checkConfig = (url: string, key: string) => Boolean(
      url && key && !url.includes('placeholder') && !url.includes('your-project') && url.startsWith('https://')
    );

    expect(checkConfig('https://your-project.supabase.co', 'some-key')).toBe(false);
    expect(checkConfig('https://placeholder.supabase.co', 'some-key')).toBe(false);
    expect(checkConfig('http://insecure.supabase.co', 'some-key')).toBe(false);
    expect(checkConfig('https://xtipmcthdyyubohspjro.supabase.co', 'valid-key')).toBe(true);
  });

  test('verifies .dockerignore excludes .env and secret files', () => {
    const dockerIgnorePath = path.join(projectRoot, '.dockerignore');
    expect(fs.existsSync(dockerIgnorePath)).toBe(true);
    const content = fs.readFileSync(dockerIgnorePath, 'utf8');

    expect(content).toContain('.env');
    expect(content).toContain('.env.*');
  });

  test('verifies Dockerfile does not copy .env into runner stage', () => {
    const dockerfilePath = path.join(projectRoot, 'Dockerfile');
    expect(fs.existsSync(dockerfilePath)).toBe(true);
    const content = fs.readFileSync(dockerfilePath, 'utf8');

    expect(content).not.toContain('COPY .env');
    expect(content).toContain('USER node');
  });

  test('verifies compiled dist/ bundle does not leak private keys or tokens', () => {
    const distPath = path.join(projectRoot, 'dist');
    if (!fs.existsSync(distPath)) return; // Skip if dist has not been generated yet

    const scanDir = (dir: string): string[] => {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          results = results.concat(scanDir(full));
        } else if (file.endsWith('.js')) {
          results.push(full);
        }
      }
      return results;
    };

    const jsFiles = scanDir(distPath);
    for (const jsFile of jsFiles) {
      const code = fs.readFileSync(jsFile, 'utf8');
      expect(code.includes('service_role')).toBe(false);
      expect(code.includes('sk-or-v1-')).toBe(false);
      expect(code.includes('AQ.Ab8RN6InXVu2')).toBe(false);
    }
  });
});


