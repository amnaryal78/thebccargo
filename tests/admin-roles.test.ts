import { describe, it, expect } from 'vitest';
import { getRolePermissions } from '../src/features/admin/types';

describe('Phase 6 — Admin RBAC Role Matrix & Access Control', () => {
  it('denies all administrative permissions to anonymous / unauthenticated users (null role)', () => {
    const permissions = getRolePermissions(null);

    expect(permissions.canViewDashboard).toBe(false);
    expect(permissions.canManageShipments).toBe(false);
    expect(permissions.canManageMilestones).toBe(false);
    expect(permissions.canManageInquiries).toBe(false);
    expect(permissions.canManageHandlingRules).toBe(false);
    expect(permissions.canManageRates).toBe(false);
    expect(permissions.canManageBlogs).toBe(false);
    expect(permissions.canManageCareers).toBe(false);
    expect(permissions.canManageUsers).toBe(false);
    expect(permissions.canManageSettings).toBe(false);
    expect(permissions.isReadOnly).toBe(true);
  });

  it('restricts the view-only (analyst) role to observation only: no mutating actions allowed', () => {
    const permissions = getRolePermissions('analyst');

    expect(permissions.canViewDashboard).toBe(true);
    expect(permissions.isReadOnly).toBe(true);
    expect(permissions.canManageShipments).toBe(false);
    expect(permissions.canManageMilestones).toBe(false);
    expect(permissions.canManageInquiries).toBe(false);
    expect(permissions.canManageHandlingRules).toBe(false);
    expect(permissions.canManageRates).toBe(false);
    expect(permissions.canManageBlogs).toBe(false);
    expect(permissions.canManageCareers).toBe(false);
    expect(permissions.canManageUsers).toBe(false);
    expect(permissions.canManageSettings).toBe(false);
  });

  it('allows operations role to manage consignments, milestones, and inquiries, but not tariffs or users', () => {
    const permissions = getRolePermissions('operations');

    expect(permissions.canViewDashboard).toBe(true);
    expect(permissions.isReadOnly).toBe(false);
    expect(permissions.canManageShipments).toBe(true);
    expect(permissions.canManageMilestones).toBe(true);
    expect(permissions.canManageInquiries).toBe(true);
    expect(permissions.canManageHandlingRules).toBe(false);
    expect(permissions.canManageRates).toBe(false);
    expect(permissions.canManageUsers).toBe(false);
    expect(permissions.canManageSettings).toBe(false);
  });

  it('allows editor role to manage blogs and career postings only', () => {
    const permissions = getRolePermissions('editor');

    expect(permissions.canViewDashboard).toBe(true);
    expect(permissions.canManageBlogs).toBe(true);
    expect(permissions.canManageCareers).toBe(true);
    expect(permissions.canManageShipments).toBe(false);
    expect(permissions.canManageRates).toBe(false);
    expect(permissions.canManageUsers).toBe(false);
  });

  it('allows admin role full operational and tariff management, but preserves super_admin exclusivity for user roles', () => {
    const permissions = getRolePermissions('admin');

    expect(permissions.canViewDashboard).toBe(true);
    expect(permissions.canManageShipments).toBe(true);
    expect(permissions.canManageHandlingRules).toBe(true);
    expect(permissions.canManageRates).toBe(true);
    expect(permissions.canManageBlogs).toBe(true);
    expect(permissions.canManageCareers).toBe(true);
    expect(permissions.canManageSettings).toBe(true);
    expect(permissions.canManageUsers).toBe(false); // only super_admin manages allowlist
  });

  it('grants super_admin role full unrestricted access across all modules', () => {
    const permissions = getRolePermissions('super_admin');

    expect(permissions.canViewDashboard).toBe(true);
    expect(permissions.canManageShipments).toBe(true);
    expect(permissions.canManageHandlingRules).toBe(true);
    expect(permissions.canManageRates).toBe(true);
    expect(permissions.canManageBlogs).toBe(true);
    expect(permissions.canManageCareers).toBe(true);
    expect(permissions.canManageUsers).toBe(true);
    expect(permissions.canManageSettings).toBe(true);
    expect(permissions.canViewAuditLogs).toBe(true);
    expect(permissions.isReadOnly).toBe(false);
  });
});
