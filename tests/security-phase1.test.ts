import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const sql = (name: string) => readFileSync(`supabase/migrations/${name}.sql`, 'utf8');

describe('Phase 1 security migrations', () => {
  it('only super_admin can write user_roles, and the last super_admin cannot be removed', () => {
    const s = sql('20261030000001_user_roles_super_admin_only');
    expect(s).toContain('DROP POLICY IF EXISTS "Admins manage user roles"');
    for (const op of ['INSERT', 'UPDATE', 'DELETE']) expect(s).toMatch(new RegExp(`FOR ${op} TO authenticated[\\s\\S]*?is_super_admin\\(\\)`));
    expect(s).not.toMatch(/CREATE POLICY[^;]*FOR (ALL|INSERT|UPDATE|DELETE)[^;]*is_admin\(\)/);
    expect(s).toContain('At least one active super admin must remain');
  });

  it('audit actor comes from the session, not the browser', () => {
    const s = sql('20261030000002_audit_logs_server_actor');
    expect(s).toContain('NEW.actor_id := auth.uid()');
    expect(s).toContain("NEW.actor_email := lower(coalesce(auth.jwt() ->> 'email'");
    expect(s).toContain('BEFORE INSERT ON public.audit_logs');
  });

  it('shipment audit stores column names, not personal data', () => {
    const s = sql('20261030000003_audit_shipments_trigger');
    expect(s).toContain("jsonb_build_object('changed', v_changed)");
    expect(s).not.toMatch(/(sender|receiver)_(name|phone|address|email)/);
  });

  it('public submissions start in the database-chosen state', () => {
    const s = sql('20261030000004_public_insert_defaults');
    expect(s).toContain("NEW.status := 'submitted'");
    expect(s).toContain("NEW.status := 'new'");
    expect(s).toContain("NEW.status := 'received'");
    expect(s).toContain('NEW.internal_notes := NULL');
    for (const t of ['bookings', 'inquiries', 'job_applications']) expect(s).toContain(`BEFORE INSERT ON public.${t}`);
  });

  it('operations and support can read the notifications for work they handle', () => {
    const s = sql('20261030000005_notifications_visibility');
    expect(s).toContain('public.is_message_staff()');
    expect(s).not.toContain('USING (public.is_admin())');
  });
});
