import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { getRolePermissions, type RolePermissions } from '../src/features/admin/types';
import type { UserRoleType } from '../src/services/authService';

// The browser flags only decide what to show. The database (RLS) decides what is allowed.
// These tests keep the two in step: a flag is true exactly for the roles the policy lets write.
const STAFF: UserRoleType[] = ['super_admin', 'admin', 'operations', 'support', 'editor', 'analyst'];
const lockdown = readFileSync('supabase/migrations/20261027000000_rls_lockdown_admin_auth.sql', 'utf8');

/** Role list of the has_staff_role(...) policy on a table, read from the applied migration. */
function policyRoles(table: string, cmd: 'ALL' | 'SELECT' = 'ALL'): string[] {
  const re = new RegExp(`ON public\\.${table}\\s+FOR ${cmd} TO authenticated\\s+USING \\(public\\.has_staff_role\\(ARRAY\\[([^\\]]*)\\]\\)\\)`);
  const m = lockdown.match(re);
  if (!m) throw new Error(`no ${cmd} policy for ${table}`);
  return [...m[1].matchAll(/'([a-z_]+)'/g)].map((x) => x[1]).sort();
}

const rolesWith = (flag: keyof RolePermissions) => STAFF.filter((r) => getRolePermissions(r)[flag]).sort();

describe('browser permissions match database policies', () => {
  const cases: [keyof RolePermissions, string, 'ALL' | 'SELECT'][] = [
    ['canManageShipments', 'shipments', 'ALL'],
    ['canManageMilestones', 'shipment_milestones', 'ALL'],
    ['canManageInquiries', 'inquiries', 'ALL'],
    ['canManageInquiries', 'bookings', 'ALL'],
    ['canManageInquiries', 'reviews', 'ALL'],
    ['canManageBlogs', 'blogs', 'ALL'],
    ['canManageCareers', 'careers', 'ALL'],
    ['canManageCareers', 'job_applications', 'ALL'],
    ['canManageHandlingRules', 'handling_rules', 'ALL'],
    ['canManageRates', 'international_rates', 'ALL'],
    ['canManageSettings', 'site_settings', 'ALL'],
    ['canViewAuditLogs', 'audit_logs', 'SELECT'],
  ];
  it.each(cases)('%s ⇔ %s (%s)', (flag, table, cmd) => {
    expect(rolesWith(flag)).toEqual(policyRoles(table, cmd));
  });

  it('how-to-ship: super_admin, admin, editor (live policy, defined outside the lockdown migration)', () => {
    expect(rolesWith('canManageHowToShip')).toEqual(['admin', 'editor', 'super_admin']);
  });

  it('only super_admin manages staff (migration 20261030000001)', () => {
    expect(rolesWith('canManageUsers')).toEqual(['super_admin']);
    expect(readFileSync('supabase/migrations/20261030000001_user_roles_super_admin_only.sql', 'utf8')).toContain('is_super_admin()');
  });

  it('every role the UI can assign exists in the database user_role enum', () => {
    const enumRoles = ['super_admin', 'admin', 'editor', 'operations', 'support', 'analyst', 'reseller'];
    for (const r of [...STAFF, 'reseller']) expect(enumRoles).toContain(r);
  });

  it('view-only and reseller roles change nothing', () => {
    for (const r of ['analyst', 'reseller'] as UserRoleType[]) {
      const p = getRolePermissions(r);
      expect(Object.entries(p).filter(([k, v]) => k.startsWith('canManage') && v)).toEqual([]);
    }
  });
});

describe('route gates', () => {
  it('each admin URL needs the same permission as its menu entry', async () => {
    const { routeNeeds } = await import('../src/features/admin/shell/AdminShell');
    expect(routeNeeds('/admin')).toBeUndefined();
    expect(routeNeeds('/admin/shipments/abc')).toBeUndefined(); // all staff may read shipments (RLS: is_active_staff)
    expect(routeNeeds('/admin/users')).toBe('canManageUsers');
    expect(routeNeeds('/admin/users/x')).toBe('canManageUsers');
    expect(routeNeeds('/admin/audit')).toBe('canViewAuditLogs');
    expect(routeNeeds('/admin/messages')).toBe('canManageInquiries'); // same roles as is_message_staff()
    expect(routeNeeds('/admin/rates')).toBe('canManageRates');
    expect(routeNeeds('/admin/careers')).toBe('canManageCareers');
    expect(routeNeeds('/admin/ratesx')).toBeUndefined(); // prefix match is per path segment
  });

  it('item catalogue writes and reseller reads follow shipment staff (migration 20261030000006)', () => {
    const s = readFileSync('supabase/migrations/20261030000006_permission_alignment.sql', 'utf8');
    expect(s).toContain('DROP POLICY IF EXISTS "Staff manage item catalog"');
    expect(s).toMatch(/item_catalog\s+FOR ALL TO authenticated\s+USING \(public\.has_staff_role\(ARRAY\['super_admin','admin','operations'\]\)\)/);
    expect(s).toMatch(/role = 'reseller' AND public\.has_staff_role\(ARRAY\['super_admin','admin','operations'\]\)/);
  });
});
