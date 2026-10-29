import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { waitedFor } from '../src/features/admin/overview/AdminOverviewTab';

const sql = readFileSync('supabase/migrations/20261030000007_today_dashboard.sql', 'utf8');

describe('get_today_dashboard', () => {
  it('refuses non-staff and anonymous callers', () => {
    expect(sql).toContain("IF NOT public.is_active_staff() THEN\n    RAISE EXCEPTION 'not authorized'");
    expect(sql).toContain('REVOKE ALL ON FUNCTION public.get_today_dashboard() FROM PUBLIC, anon;');
  });

  it('returns each figure only to roles that may read that data', () => {
    expect(sql).toContain("'chats_waiting', CASE WHEN v_chats THEN");
    expect(sql).toContain("'applications_new', CASE WHEN v_careers THEN");
    expect(sql).toContain("'today', CASE WHEN v_audit THEN");
    expect(sql).toContain("v_audit boolean := public.has_staff_role(ARRAY['super_admin','admin','operations','analyst'])");
  });

  it('counts in the database (no full-table download) and uses the Nepal day', () => {
    expect(sql).toMatch(/SELECT count\(\*\) FROM bookings WHERE status = 'submitted'/);
    expect(sql).toContain("AT TIME ZONE 'Asia/Kathmandu'");
  });
});

describe('waitedFor', () => {
  const now = Date.parse('2026-10-30T12:00:00Z');
  it('says how long something has waited, in words a person reads at a glance', () => {
    expect(waitedFor(null, now)).toBeNull();
    expect(waitedFor('2026-10-30T11:48:00Z', now)).toBe('12 min');
    expect(waitedFor('2026-10-30T09:00:00Z', now)).toBe('3 h');
    expect(waitedFor('2026-10-27T12:00:00Z', now)).toBe('3 days');
    expect(waitedFor('2026-10-30T12:05:00Z', now)).toBe('0 min'); // clock skew never shows a negative wait
  });
});
