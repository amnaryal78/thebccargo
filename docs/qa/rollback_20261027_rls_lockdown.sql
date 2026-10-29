-- ROLLBACK for supabase/migrations/20261027000000_rls_lockdown_admin_auth.sql
-- Restores the live policies/functions exactly as read on 2026-10-23 before the apply
-- (policy fingerprint ad573d2673633bac6e422c1d0802211f). This RE-OPENS the security holes
-- in docs/qa/04_FINDINGS.md (P1-01..P1-06). Use only if the lockdown breaks something critical,
-- and re-apply a fixed lockdown as soon as possible. Kept outside supabase/migrations on purpose.

BEGIN;

-- New policies added by the lockdown
DROP POLICY IF EXISTS "Staff read shipments" ON public.shipments;
DROP POLICY IF EXISTS "Shipping staff manage shipments" ON public.shipments;
DROP POLICY IF EXISTS "Staff read shipment_milestones" ON public.shipment_milestones;
DROP POLICY IF EXISTS "Shipping staff manage shipment_milestones" ON public.shipment_milestones;
DROP POLICY IF EXISTS "Staff read bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customer staff manage bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff read inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Customer staff manage inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Staff read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Customer staff manage reviews" ON public.reviews;
DROP POLICY IF EXISTS "Content staff manage job_applications" ON public.job_applications;
DROP POLICY IF EXISTS "Staff append audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Auditors read audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Staff read blogs" ON public.blogs;
DROP POLICY IF EXISTS "Content staff manage blogs" ON public.blogs;
DROP POLICY IF EXISTS "Staff read careers" ON public.careers;
DROP POLICY IF EXISTS "Content staff manage careers" ON public.careers;
DROP POLICY IF EXISTS "Staff read services" ON public.services;
DROP POLICY IF EXISTS "Content staff manage services" ON public.services;
DROP POLICY IF EXISTS "Staff read faqs" ON public.faqs;
DROP POLICY IF EXISTS "Content staff manage faqs" ON public.faqs;
DROP POLICY IF EXISTS "Staff read policies" ON public.policies;
DROP POLICY IF EXISTS "Content staff manage policies" ON public.policies;
DROP POLICY IF EXISTS "Staff read partners" ON public.partners;
DROP POLICY IF EXISTS "Content staff manage partners" ON public.partners;
DROP POLICY IF EXISTS "Admins manage site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins manage international_rates" ON public.international_rates;
DROP POLICY IF EXISTS "Admins manage national_rates" ON public.national_rates;
DROP POLICY IF EXISTS "Admins manage handling_rules" ON public.handling_rules;
DROP POLICY IF EXISTS "Admins manage rate_settings" ON public.rate_settings;
DROP POLICY IF EXISTS "Staff manage item catalog" ON public.item_catalog;

-- Old policies, verbatim from live
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['audit_logs','blogs','bookings','careers','faqs','inquiries','international_rates','job_applications','national_rates','partners','policies','reviews','services','shipment_milestones','shipments','site_settings'] LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I AS PERMISSIVE FOR ALL TO public USING (((auth.role() = ''authenticated''::text) OR (auth.role() = ''service_role''::text)))', 'Staff full access ' || t, t);
  END LOOP; END $$;
CREATE POLICY "Allow public all blogs" ON public.blogs AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow write sheet_rates_cache" ON public.sheet_rates_cache AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Staff manage item catalog" ON public.item_catalog AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1 FROM user_roles WHERE ((user_roles.active = true) AND ((user_roles.user_id = auth.uid()) OR (lower(user_roles.email) = lower((auth.jwt() ->> 'email'::text)))))))) WITH CHECK ((EXISTS ( SELECT 1 FROM user_roles WHERE ((user_roles.active = true) AND ((user_roles.user_id = auth.uid()) OR (lower(user_roles.email) = lower((auth.jwt() ->> 'email'::text))))))));

-- Old functions, verbatim from live
CREATE OR REPLACE FUNCTION public.check_admin_authorization(p_user_id uuid, p_email text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $function$
DECLARE
    v_role_row RECORD;
    v_clean_email TEXT;
BEGIN
    v_clean_email := LOWER(TRIM(COALESCE(p_email, '')));
    IF p_user_id IS NOT NULL THEN
        SELECT * INTO v_role_row FROM user_roles WHERE user_id = p_user_id LIMIT 1;
    END IF;
    IF v_role_row IS NULL AND v_clean_email <> '' THEN
        SELECT * INTO v_role_row FROM user_roles WHERE LOWER(email) = v_clean_email LIMIT 1;
        IF v_role_row IS NOT NULL AND p_user_id IS NOT NULL AND (v_role_row.user_id IS NULL OR v_role_row.user_id <> p_user_id) THEN
            UPDATE user_roles SET user_id = p_user_id, updated_at = NOW() WHERE id = v_role_row.id;
        END IF;
    END IF;
    IF v_role_row IS NULL THEN
        RETURN jsonb_build_object('is_authorized', false, 'reason', 'not_found', 'role', null, 'active', false);
    END IF;
    RETURN jsonb_build_object('is_authorized', (v_role_row.active = true), 'reason', CASE WHEN v_role_row.active THEN 'authorized' ELSE 'deactivated' END,
        'role', v_role_row.role, 'active', v_role_row.active, 'email', v_role_row.email, 'user_id', p_user_id);
END;
$function$;
ALTER FUNCTION public.check_admin_authorization(uuid, text) RESET search_path;
GRANT EXECUTE ON FUNCTION public.check_admin_authorization(uuid, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_metrics() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $function$
DECLARE v_total_shipments INT; v_in_transit INT; v_delivered INT; v_new_bookings INT; v_new_inquiries INT; v_published_blogs INT; v_active_jobs INT;
BEGIN
    SELECT COUNT(*) INTO v_total_shipments FROM shipments;
    SELECT COUNT(*) INTO v_in_transit FROM shipments WHERE status ILIKE '%transit%';
    SELECT COUNT(*) INTO v_delivered FROM shipments WHERE status ILIKE '%delivered%';
    SELECT COUNT(*) INTO v_new_bookings FROM bookings WHERE status = 'submitted';
    SELECT COUNT(*) INTO v_new_inquiries FROM inquiries WHERE status = 'new';
    SELECT COUNT(*) INTO v_published_blogs FROM blogs WHERE published = true;
    SELECT COUNT(*) INTO v_active_jobs FROM careers WHERE published = true;
    RETURN jsonb_build_object('total_shipments', v_total_shipments, 'in_transit', v_in_transit, 'delivered', v_delivered,
        'new_bookings', v_new_bookings, 'new_inquiries', v_new_inquiries, 'published_blogs', v_published_blogs, 'active_jobs', v_active_jobs);
END;
$function$;
ALTER FUNCTION public.get_admin_dashboard_metrics() RESET search_path;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_metrics() TO anon, authenticated;

ALTER FUNCTION public.get_public_shipment(text) RESET search_path;
DROP FUNCTION IF EXISTS public.has_staff_role(text[]);

COMMIT;
