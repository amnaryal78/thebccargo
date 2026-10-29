import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Static guards for QA Phase 1 (docs/qa/04_FINDINGS.md P1-01..P1-05). Behaviour was also probed
// against a stub of the live schema in PGlite; that harness is not part of the repo.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const migrationsDir = path.join(root, 'supabase', 'migrations');
const LOCKDOWN = '20261027000000_rls_lockdown_admin_auth.sql';

const migrations = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
const read = (f: string) => fs.readFileSync(path.join(migrationsDir, f), 'utf8');
const lockdown = read(LOCKDOWN);

/** Body of the last CREATE [OR REPLACE] FUNCTION <name> across all migrations, in apply order. */
function latestFunction(name: string): string {
  let body = '';
  const re = new RegExp(`CREATE\\s+(OR\\s+REPLACE\\s+)?FUNCTION\\s+(public\\.)?${name}\\s*\\(([\\s\\S]*?)\\$\\$([\\s\\S]*?)\\$\\$`, 'gi');
  for (const f of migrations) {
    for (const m of read(f).matchAll(re)) body = m[0];
  }
  return body;
}

describe('RLS lockdown migration', () => {
  test('check_admin_authorization reads the session, never caller-supplied ids', () => {
    const fn = latestFunction('check_admin_authorization');
    expect(fn).toMatch(/auth\.uid\(\)/);
    expect(fn).toMatch(/SET\s+search_path\s*=\s*public/i);
    // the old takeover: UPDATE user_roles SET user_id = p_user_id
    expect(fn).not.toMatch(/SET\s+user_id\s*=\s*p_user_id/i);
    // only unlinked rows may be claimed
    expect(fn).toMatch(/user_id\s+IS\s+NULL/i);
  });

  test('admin RPCs are not executable by anonymous visitors', () => {
    expect(lockdown).toMatch(/REVOKE ALL ON FUNCTION public\.check_admin_authorization\(uuid, text\) FROM PUBLIC, anon/);
    expect(lockdown).toMatch(/REVOKE ALL ON FUNCTION public\.get_admin_dashboard_metrics\(\) FROM PUBLIC, anon/);
    expect(latestFunction('get_admin_dashboard_metrics')).toMatch(/is_active_staff\(\)/);
  });

  test('anonymous write policies on blogs and the rates cache are dropped', () => {
    expect(lockdown).toContain('DROP POLICY IF EXISTS "Allow public all blogs" ON public.blogs;');
    expect(lockdown).toContain('DROP POLICY IF EXISTS "Allow write sheet_rates_cache" ON public.sheet_rates_cache;');
  });

  test('every "Staff full access" policy is dropped and none is recreated', () => {
    const tables = new Set<string>();
    for (const f of migrations) {
      for (const m of read(f).matchAll(/CREATE POLICY "Staff full access (\w+)"/g)) tables.add(m[1]);
    }
    expect(tables.size).toBeGreaterThan(10);
    for (const t of tables) {
      expect(lockdown, t).toContain(`DROP POLICY IF EXISTS "Staff full access ${t}"`);
    }
    for (const f of migrations.filter((x) => x >= LOCKDOWN)) {
      expect(read(f), f).not.toMatch(/CREATE POLICY "Staff full access/);
    }
  });

  test('no policy in or after the lockdown grants access just for being signed in', () => {
    for (const f of migrations.filter((x) => x >= LOCKDOWN)) {
      expect(read(f), f).not.toMatch(/auth\.role\(\)\s*=\s*'authenticated'/);
    }
  });

  test('public form inserts are left in place (P0-01 decision pending)', () => {
    expect(lockdown).not.toMatch(/DROP POLICY IF EXISTS "Public insert/);
  });
});

describe('client admin check', () => {
  test('signed-out callers are rejected before the RPC', () => {
    const src = fs.readFileSync(path.join(root, 'src', 'services', 'authService.ts'), 'utf8');
    expect(src).toMatch(/if \(!isSupabaseConfigured \|\| !userId\)/);
    // the fallback must not look up someone else's row by email
    expect(src).not.toMatch(/from\('user_roles'\)\.select\('\*'\)[\s\S]{0,80}\.eq\('email'/);
  });
});
