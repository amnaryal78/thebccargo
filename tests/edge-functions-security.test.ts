import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// QA Phase 1 (docs/qa/04_FINDINGS.md P1-17..P1-21). Static guards: there is no Deno runtime in
// the repo to execute the functions, so these lock in the source-level fixes.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fnDir = path.join(root, 'supabase', 'functions');
const fn = (name: string) => fs.readFileSync(path.join(fnDir, name, 'index.ts'), 'utf8');
const allFunctions = fs.readdirSync(fnDir).filter((d) => fs.existsSync(path.join(fnDir, d, 'index.ts')));

describe('Edge Function security', () => {
  test('no hard-coded bypass tokens remain in functions or the chat client', () => {
    for (const name of allFunctions) {
      const src = fn(name).replace(/^\s*\/\/.*$/gm, '');
      expect(src, name).not.toContain('dev_admin_session');
      expect(src, name).not.toContain("'dev_bypass_token'");
    }
    const client = fs.readFileSync(path.join(root, 'src', 'services', 'chatbotService.ts'), 'utf8');
    expect(client).not.toContain("'dev_bypass_token'");
  });

  test('create-signed-file-url only serves active staff', () => {
    expect(fn('create-signed-file-url')).toMatch(/roleRow\.active === true/);
  });

  test.each(['submit-booking', 'submit-inquiry', 'submit-job-application'])('%s rejects when the Turnstile secret is missing', (name) => {
    const src = fn(name);
    const block = src.slice(src.indexOf('if (!secretKey)'), src.indexOf('try {', src.indexOf('if (!secretKey)')));
    expect(block).toMatch(/ALLOW_TURNSTILE_DEV_BYPASS'\) !== 'true'\) \{\s*console\.error\([^)]*\);\s*return false;/);
  });

  test.each(['generate-awb', 'process-shipment-notification'])('%s checks the caller before reading the request', (name) => {
    const src = fn(name);
    const guard = src.indexOf('if (!(await isShippingStaff(req)))');
    expect(guard).toBeGreaterThan(0);
    expect(guard).toBeLessThan(src.indexOf('await req.json()'));
    expect(src).toMatch(/roleRow\.active === true && \['super_admin', 'admin', 'operations'\]/);
  });

  test('chat function only uses free models and caps history', () => {
    const src = fn('chat');
    expect(src).not.toMatch(/'openrouter\/auto'/);
    expect(src).toMatch(/freeModels\.includes\(settings\?\.model\)/);
    expect(src).toMatch(/\.slice\(-10\)/);
  });
});
