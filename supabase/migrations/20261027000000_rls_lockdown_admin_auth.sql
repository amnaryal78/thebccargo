-- QA Phase 1: close the admin-takeover RPC and replace "any signed-in user = staff" policies.
-- Tested on a structure copy of live (46/46 role probes) and APPLIED to live on 2026-10-23 with
-- owner approval (live history version 20261023112922). Findings: docs/qa/04_FINDINGS.md P1-01..P1-06.
-- Rollback: docs/qa/rollback_20261027_rls_lockdown.sql (re-opens the holes; emergency use only).
--
-- Role groups follow getRolePermissions() in src/features/admin/types.ts:
--   manage-all  super_admin, admin                      (rates, settings, handling rules)
--   shipping    super_admin, admin, operations          (shipments, milestones)
--   customer    super_admin, admin, operations, support (bookings, inquiries, reviews)
--   content     super_admin, admin, editor              (blogs, careers, applicants, services, faqs, policies, partners)
--   audit read  super_admin, admin, operations, analyst
-- Every active non-reseller staff member can still read the operational tables (is_active_staff()).
-- Resellers and customers (signed in, no staff row) get nothing from these tables directly.
-- Custom roles (admin_roles) are still UI-only; DB access follows the base role.
-- Public visitor inserts (bookings, inquiries, job_applications, reviews, analytics) are left as
-- they are, so the live forms keep working until the Phase 4 booking/Turnstile decision (P0-01).

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Role helper used by the policies below
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_staff_role(p_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE (user_id = auth.uid() OR lower(email) = lower(auth.jwt() ->> 'email'))
      AND active = true
      AND role::text = ANY (p_roles)
  );
$$;
REVOKE ALL ON FUNCTION public.has_staff_role(text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_staff_role(text[]) TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. P1-01: check_admin_authorization trusted caller-supplied ids and re-linked rows.
--    Now it only looks at the caller's own session. Parameters are kept so deployed
--    clients keep working, but they are ignored. A row is linked only while unlinked.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_admin_authorization(p_user_id uuid, p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid uuid := auth.uid();
    v_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
    v_role_row public.user_roles%ROWTYPE;
BEGIN
    IF v_uid IS NULL THEN
        RETURN jsonb_build_object('is_authorized', false, 'reason', 'not_found', 'role', null, 'active', false);
    END IF;

    SELECT * INTO v_role_row FROM public.user_roles WHERE user_id = v_uid LIMIT 1;

    IF NOT FOUND AND v_email <> '' THEN
        SELECT * INTO v_role_row FROM public.user_roles WHERE lower(email) = v_email LIMIT 1;
        -- First sign-in of an allow-listed email: claim the row, never take over a linked one.
        IF FOUND AND v_role_row.user_id IS NULL THEN
            UPDATE public.user_roles SET user_id = v_uid, updated_at = now() WHERE id = v_role_row.id;
        END IF;
    END IF;

    IF v_role_row.id IS NULL THEN
        RETURN jsonb_build_object('is_authorized', false, 'reason', 'not_found', 'role', null, 'active', false);
    END IF;

    RETURN jsonb_build_object(
        'is_authorized', (v_role_row.active = true),
        'reason', CASE WHEN v_role_row.active THEN 'authorized' ELSE 'deactivated' END,
        'role', v_role_row.role,
        'active', v_role_row.active,
        'email', v_role_row.email,
        'user_id', v_uid
    );
END;
$$;
REVOKE ALL ON FUNCTION public.check_admin_authorization(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_admin_authorization(uuid, text) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 3. P1-05 / P1-06: dashboard metrics staff-only; fixed search_path on public tracking
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_active_staff() THEN
        RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
    END IF;

    RETURN jsonb_build_object(
        'total_shipments', (SELECT count(*) FROM public.shipments),
        'in_transit', (SELECT count(*) FROM public.shipments WHERE status ILIKE '%transit%'),
        'delivered', (SELECT count(*) FROM public.shipments WHERE status ILIKE '%delivered%'),
        'new_bookings', (SELECT count(*) FROM public.bookings WHERE status = 'submitted'),
        'new_inquiries', (SELECT count(*) FROM public.inquiries WHERE status = 'new'),
        'published_blogs', (SELECT count(*) FROM public.blogs WHERE published = true),
        'active_jobs', (SELECT count(*) FROM public.careers WHERE published = true)
    );
END;
$$;
REVOKE ALL ON FUNCTION public.get_admin_dashboard_metrics() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_metrics() TO authenticated;

ALTER FUNCTION public.get_public_shipment(text) SET search_path = public;

-- ---------------------------------------------------------------------------
-- 4. P1-03 / P1-04: anonymous write policies
--    sheet_rates_cache is written by the `rates` Edge Function with the service role (bypasses RLS).
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public all blogs" ON public.blogs;
DROP POLICY IF EXISTS "Allow write sheet_rates_cache" ON public.sheet_rates_cache;

-- ---------------------------------------------------------------------------
-- 5. P1-02: replace "Staff full access <table>" (they let any signed-in user in)
-- ---------------------------------------------------------------------------

-- Shipments and tracking milestones
DROP POLICY IF EXISTS "Staff full access shipments" ON public.shipments;
DROP POLICY IF EXISTS "Staff read shipments" ON public.shipments;
DROP POLICY IF EXISTS "Shipping staff manage shipments" ON public.shipments;
CREATE POLICY "Staff read shipments" ON public.shipments
  FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "Shipping staff manage shipments" ON public.shipments
  FOR ALL TO authenticated
  USING (public.has_staff_role(ARRAY['super_admin','admin','operations']))
  WITH CHECK (public.has_staff_role(ARRAY['super_admin','admin','operations']));

DROP POLICY IF EXISTS "Staff full access shipment_milestones" ON public.shipment_milestones;
DROP POLICY IF EXISTS "Staff read shipment_milestones" ON public.shipment_milestones;
DROP POLICY IF EXISTS "Shipping staff manage shipment_milestones" ON public.shipment_milestones;
CREATE POLICY "Staff read shipment_milestones" ON public.shipment_milestones
  FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "Shipping staff manage shipment_milestones" ON public.shipment_milestones
  FOR ALL TO authenticated
  USING (public.has_staff_role(ARRAY['super_admin','admin','operations']))
  WITH CHECK (public.has_staff_role(ARRAY['super_admin','admin','operations']));

-- Customer-facing queues (public insert policies stay)
DROP POLICY IF EXISTS "Staff full access bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff read bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customer staff manage bookings" ON public.bookings;
CREATE POLICY "Staff read bookings" ON public.bookings
  FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "Customer staff manage bookings" ON public.bookings
  FOR ALL TO authenticated
  USING (public.has_staff_role(ARRAY['super_admin','admin','operations','support']))
  WITH CHECK (public.has_staff_role(ARRAY['super_admin','admin','operations','support']));

DROP POLICY IF EXISTS "Staff full access inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Staff read inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Customer staff manage inquiries" ON public.inquiries;
CREATE POLICY "Staff read inquiries" ON public.inquiries
  FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "Customer staff manage inquiries" ON public.inquiries
  FOR ALL TO authenticated
  USING (public.has_staff_role(ARRAY['super_admin','admin','operations','support']))
  WITH CHECK (public.has_staff_role(ARRAY['super_admin','admin','operations','support']));

DROP POLICY IF EXISTS "Staff full access reviews" ON public.reviews;
DROP POLICY IF EXISTS "Staff read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Customer staff manage reviews" ON public.reviews;
CREATE POLICY "Staff read reviews" ON public.reviews
  FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "Customer staff manage reviews" ON public.reviews
  FOR ALL TO authenticated
  USING (public.has_staff_role(ARRAY['super_admin','admin','operations','support']))
  WITH CHECK (public.has_staff_role(ARRAY['super_admin','admin','operations','support']));

-- Job applications hold CVs and contact details: careers managers only
DROP POLICY IF EXISTS "Staff full access job_applications" ON public.job_applications;
DROP POLICY IF EXISTS "Content staff manage job_applications" ON public.job_applications;
CREATE POLICY "Content staff manage job_applications" ON public.job_applications
  FOR ALL TO authenticated
  USING (public.has_staff_role(ARRAY['super_admin','admin','editor']))
  WITH CHECK (public.has_staff_role(ARRAY['super_admin','admin','editor']));

-- Audit log: any staff member can append, selected roles can read, nobody edits
DROP POLICY IF EXISTS "Staff full access audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Staff append audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Auditors read audit_logs" ON public.audit_logs;
CREATE POLICY "Staff append audit_logs" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (public.is_active_staff());
CREATE POLICY "Auditors read audit_logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.has_staff_role(ARRAY['super_admin','admin','operations','analyst']));

-- Content tables (public read of published rows stays)
DROP POLICY IF EXISTS "Staff full access blogs" ON public.blogs;
DROP POLICY IF EXISTS "Staff read blogs" ON public.blogs;
DROP POLICY IF EXISTS "Content staff manage blogs" ON public.blogs;
CREATE POLICY "Staff read blogs" ON public.blogs
  FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "Content staff manage blogs" ON public.blogs
  FOR ALL TO authenticated
  USING (public.has_staff_role(ARRAY['super_admin','admin','editor']))
  WITH CHECK (public.has_staff_role(ARRAY['super_admin','admin','editor']));

DROP POLICY IF EXISTS "Staff full access careers" ON public.careers;
DROP POLICY IF EXISTS "Staff read careers" ON public.careers;
DROP POLICY IF EXISTS "Content staff manage careers" ON public.careers;
CREATE POLICY "Staff read careers" ON public.careers
  FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "Content staff manage careers" ON public.careers
  FOR ALL TO authenticated
  USING (public.has_staff_role(ARRAY['super_admin','admin','editor']))
  WITH CHECK (public.has_staff_role(ARRAY['super_admin','admin','editor']));

DROP POLICY IF EXISTS "Staff full access services" ON public.services;
DROP POLICY IF EXISTS "Staff read services" ON public.services;
DROP POLICY IF EXISTS "Content staff manage services" ON public.services;
CREATE POLICY "Staff read services" ON public.services
  FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "Content staff manage services" ON public.services
  FOR ALL TO authenticated
  USING (public.has_staff_role(ARRAY['super_admin','admin','editor']))
  WITH CHECK (public.has_staff_role(ARRAY['super_admin','admin','editor']));

DROP POLICY IF EXISTS "Staff full access faqs" ON public.faqs;
DROP POLICY IF EXISTS "Staff read faqs" ON public.faqs;
DROP POLICY IF EXISTS "Content staff manage faqs" ON public.faqs;
CREATE POLICY "Staff read faqs" ON public.faqs
  FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "Content staff manage faqs" ON public.faqs
  FOR ALL TO authenticated
  USING (public.has_staff_role(ARRAY['super_admin','admin','editor']))
  WITH CHECK (public.has_staff_role(ARRAY['super_admin','admin','editor']));

DROP POLICY IF EXISTS "Staff full access policies" ON public.policies;
DROP POLICY IF EXISTS "Staff read policies" ON public.policies;
DROP POLICY IF EXISTS "Content staff manage policies" ON public.policies;
CREATE POLICY "Staff read policies" ON public.policies
  FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "Content staff manage policies" ON public.policies
  FOR ALL TO authenticated
  USING (public.has_staff_role(ARRAY['super_admin','admin','editor']))
  WITH CHECK (public.has_staff_role(ARRAY['super_admin','admin','editor']));

DROP POLICY IF EXISTS "Staff full access partners" ON public.partners;
DROP POLICY IF EXISTS "Staff read partners" ON public.partners;
DROP POLICY IF EXISTS "Content staff manage partners" ON public.partners;
CREATE POLICY "Staff read partners" ON public.partners
  FOR SELECT TO authenticated USING (public.is_active_staff());
CREATE POLICY "Content staff manage partners" ON public.partners
  FOR ALL TO authenticated
  USING (public.has_staff_role(ARRAY['super_admin','admin','editor']))
  WITH CHECK (public.has_staff_role(ARRAY['super_admin','admin','editor']));

-- Prices and settings (public read stays): admins only
DROP POLICY IF EXISTS "Staff full access site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins manage site_settings" ON public.site_settings;
CREATE POLICY "Admins manage site_settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_staff_role(ARRAY['super_admin','admin']))
  WITH CHECK (public.has_staff_role(ARRAY['super_admin','admin']));

DROP POLICY IF EXISTS "Staff full access international_rates" ON public.international_rates;
DROP POLICY IF EXISTS "Admins manage international_rates" ON public.international_rates;
CREATE POLICY "Admins manage international_rates" ON public.international_rates
  FOR ALL TO authenticated
  USING (public.has_staff_role(ARRAY['super_admin','admin']))
  WITH CHECK (public.has_staff_role(ARRAY['super_admin','admin']));

-- national_rates is dormant (international-only site); keep it read-only for everyone but admins.
DROP POLICY IF EXISTS "Staff full access national_rates" ON public.national_rates;
DROP POLICY IF EXISTS "Admins manage national_rates" ON public.national_rates;
CREATE POLICY "Admins manage national_rates" ON public.national_rates
  FOR ALL TO authenticated
  USING (public.has_staff_role(ARRAY['super_admin','admin']))
  WITH CHECK (public.has_staff_role(ARRAY['super_admin','admin']));

-- Estimator rules: repo 20261014 defined admin write policies that are missing on live,
-- so the Handling rules tab cannot save there today.
DROP POLICY IF EXISTS "Admins full access handling_rules" ON public.handling_rules;
DROP POLICY IF EXISTS "Admins manage handling_rules" ON public.handling_rules;
CREATE POLICY "Admins manage handling_rules" ON public.handling_rules
  FOR ALL TO authenticated
  USING (public.has_staff_role(ARRAY['super_admin','admin']))
  WITH CHECK (public.has_staff_role(ARRAY['super_admin','admin']));

DROP POLICY IF EXISTS "Admins full access rate_settings" ON public.rate_settings;
DROP POLICY IF EXISTS "Admins manage rate_settings" ON public.rate_settings;
CREATE POLICY "Admins manage rate_settings" ON public.rate_settings
  FOR ALL TO authenticated
  USING (public.has_staff_role(ARRAY['super_admin','admin']))
  WITH CHECK (public.has_staff_role(ARRAY['super_admin','admin']));

-- Item catalog: any active user_roles row (resellers included) could edit it
DROP POLICY IF EXISTS "Staff manage item catalog" ON public.item_catalog;
CREATE POLICY "Staff manage item catalog" ON public.item_catalog
  FOR ALL TO authenticated
  USING (public.is_active_staff())
  WITH CHECK (public.is_active_staff());

COMMIT;
