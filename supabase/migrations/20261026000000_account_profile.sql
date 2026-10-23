-- Migration: profile + order counts for ANY signed-in person (customers, resellers, staff)
-- STATUS: DRAFT FOR REVIEW. Not applied to live Supabase. Apply only with explicit approval.
-- REQUIRES 20261024 (profile columns) and 20261025 (shipments.reseller_id) first.
--
-- Rules
--  * "My orders" = shipments whose sender_email matches the signed-in email, plus (for resellers)
--    shipments referred by them (shipments.reseller_id).
--  * Completed = status 'delivered'. This month = Asia/Kathmandu calendar month.
--  * Name/phone come from the user_roles profile when there is one, else from the latest bill sent by this email.
--  * SECURITY DEFINER, returns only the caller's own data; no table access is granted.
--  * Idempotent.

CREATE OR REPLACE FUNCTION public.get_my_account_profile()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH me AS (
    SELECT auth.uid() AS uid, lower(auth.jwt() ->> 'email') AS em
  ),
  ur AS (
    SELECT u.id, u.role, u.full_name, u.phone, u.avatar_url
    FROM public.user_roles u, me
    WHERE u.active = true AND (u.user_id = me.uid OR lower(u.email) = me.em)
    LIMIT 1
  ),
  mine AS (
    SELECT s.status, s.created_at, s.sender_email, s.sender_name, s.sender_phone
    FROM public.shipments s, me
    WHERE lower(s.sender_email) = me.em
       OR s.reseller_id = (SELECT id FROM ur WHERE role::text = 'reseller')
  ),
  last_sender AS (
    SELECT sender_name, sender_phone FROM mine
    WHERE lower(sender_email) = (SELECT em FROM me)
    ORDER BY created_at DESC LIMIT 1
  )
  SELECT CASE WHEN (SELECT em FROM me) IS NULL THEN NULL ELSE jsonb_build_object(
    'email',      (SELECT em FROM me),
    'role',       (SELECT role::text FROM ur),
    'full_name',  COALESCE((SELECT full_name FROM ur), (SELECT sender_name FROM last_sender)),
    'phone',      COALESCE((SELECT phone FROM ur), (SELECT sender_phone FROM last_sender)),
    'avatar_url', (SELECT avatar_url FROM ur),
    'started_at', (SELECT created_at FROM auth.users WHERE id = (SELECT uid FROM me)),
    'total_orders',      (SELECT count(*) FROM mine),
    'completed_orders',  (SELECT count(*) FROM mine WHERE lower(status) = 'delivered'),
    'orders_this_month', (SELECT count(*) FROM mine
                          WHERE created_at >= date_trunc('month', now() AT TIME ZONE 'Asia/Kathmandu') AT TIME ZONE 'Asia/Kathmandu')
  ) END;
$$;
REVOKE ALL ON FUNCTION public.get_my_account_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_account_profile() TO authenticated;

-- Rollback (manual): DROP FUNCTION public.get_my_account_profile();
