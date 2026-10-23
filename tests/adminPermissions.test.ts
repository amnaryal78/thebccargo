import { describe, expect, it } from 'vitest';
import { getRolePermissions, mergePermissions } from '../src/features/admin/types';

describe('mergePermissions', () => {
  it('returns the base role untouched when there are no custom roles', () => {
    const base = getRolePermissions('read_only');
    expect(mergePermissions(base, [])).toBe(base);
  });

  it('adds pages from every custom role and never removes base access', () => {
    const base = getRolePermissions('support');
    const merged = mergePermissions(base, [{ canManageRates: true }, { canManageBlogs: true }]);
    expect(merged.canManageInquiries).toBe(true);
    expect(merged.canManageRates).toBe(true);
    expect(merged.canManageBlogs).toBe(true);
    expect(merged.canManageUsers).toBe(false);
  });

  it('lifts view-only status only when a custom role grants a manage permission', () => {
    const base = getRolePermissions('read_only');
    expect(mergePermissions(base, [{ canViewAuditLogs: true }]).isReadOnly).toBe(true);
    expect(mergePermissions(base, [{ canManageRates: true }]).isReadOnly).toBe(false);
  });

  it('ignores false flags so a custom role cannot take access away', () => {
    const base = getRolePermissions('editor');
    expect(mergePermissions(base, [{ canManageBlogs: false }]).canManageBlogs).toBe(true);
  });
});
