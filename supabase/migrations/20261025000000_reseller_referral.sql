-- Migration: reseller referral on shipments + reseller profile/stats
-- STATUS: DRAFT FOR REVIEW. Not applied to live Supabase. Apply only with explicit approval.
-- REQUIRES 20261024000000_staff_profiles_custom_roles.sql first (full_name, phone, avatar_url, is_active_staff()).
--
-- Rules
--  * Completed order  = shipment whose status is 'delivered' (case-insensitive).
--  * This month       = current calendar month in Asia/Kathmandu.
--  * shipments.reseller_id NULL = independent (no reseller).
--  * No new table policies: staff write reseller_id through the existing shipments staff policy.
--    Resellers get NO direct read on shipments/user_roles; they only call get_my_reseller_profile().
--  * Idempotent.

-- 1. Link a shipment to the reseller who referred it. Deleting a reseller keeps the shipment.
ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS reseller_id UUID REFERENCES public.user_roles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_shipments_reseller ON public.shipments (reseller_id, created_at DESC);

-- 2. The signed-in reseller's own profile and numbers.
CREATE OR REPLACE FUNCTION public.get_my_reseller_profile()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT jsonb_build_object(
    'id', ur.id,
    'email', ur.email,
    'full_name', ur.full_name,
    'phone', ur.phone,
    'avatar_url', ur.avatar_url,
    'started_at', ur.created_at,
    'total_orders',      (SELECT count(*) FROM public.shipments s WHERE s.reseller_id = ur.id),
    'completed_orders',  (SELECT count(*) FROM public.shipments s WHERE s.reseller_id = ur.id AND lower(s.status) = 'delivered'),
    'orders_this_month', (SELECT count(*) FROM public.shipments s
                          WHERE s.reseller_id = ur.id
                            AND s.created_at >= date_trunc('month', now() AT TIME ZONE 'Asia/Kathmandu') AT TIME ZONE 'Asia/Kathmandu')
  )
  FROM public.user_roles ur
  WHERE ur.role::text = 'reseller'
    AND ur.active = true
    AND (ur.user_id = auth.uid() OR lower(ur.email) = lower(auth.jwt() ->> 'email'))
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.get_my_reseller_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_reseller_profile() TO authenticated;

-- 3. Same numbers for staff, one row per reseller (Users page and shipment picker).
CREATE OR REPLACE FUNCTION public.get_reseller_stats()
RETURNS TABLE (reseller_id uuid, total_orders bigint, completed_orders bigint, orders_this_month bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT s.reseller_id,
         count(*),
         count(*) FILTER (WHERE lower(s.status) = 'delivered'),
         count(*) FILTER (WHERE s.created_at >= date_trunc('month', now() AT TIME ZONE 'Asia/Kathmandu') AT TIME ZONE 'Asia/Kathmandu')
  FROM public.shipments s
  WHERE s.reseller_id IS NOT NULL
    AND public.is_active_staff()
  GROUP BY s.reseller_id;
$$;
REVOKE ALL ON FUNCTION public.get_reseller_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_reseller_stats() TO authenticated;

-- Rollback (manual):
--   DROP FUNCTION public.get_reseller_stats();
--   DROP FUNCTION public.get_my_reseller_profile();
--   DROP INDEX public.idx_shipments_reseller;
--   ALTER TABLE public.shipments DROP COLUMN reseller_id;
