-- Phase 4: everything the Today page shows, counted in the database in one call, instead of the
-- browser downloading whole tables. Each figure is returned only to roles whose RLS lets them read
-- that data (null otherwise), so this SECURITY DEFINER function shows nothing a role could not see.
-- "Today" is the Nepal calendar day (Asia/Kathmandu).

BEGIN;

CREATE OR REPLACE FUNCTION public.get_today_dashboard()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_day_start timestamptz := date_trunc('day', now() AT TIME ZONE 'Asia/Kathmandu') AT TIME ZONE 'Asia/Kathmandu';
  v_chats boolean := public.is_message_staff();
  v_careers boolean := public.has_staff_role(ARRAY['super_admin','admin','editor']);
  v_audit boolean := public.has_staff_role(ARRAY['super_admin','admin','operations','analyst']);
BEGIN
  IF NOT public.is_active_staff() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  RETURN jsonb_build_object(
    'generated_at', now(),
    'needs_action', jsonb_build_object(
      'bookings_new', (SELECT count(*) FROM bookings WHERE status = 'submitted'),
      'bookings_oldest', (SELECT min(created_at) FROM bookings WHERE status = 'submitted'),
      'chats_waiting', CASE WHEN v_chats THEN (SELECT count(*) FROM chat_threads WHERE needs_reply) END,
      'chats_oldest', CASE WHEN v_chats THEN (SELECT min(last_message_at) FROM chat_threads WHERE needs_reply) END,
      'inquiries_new', (SELECT count(*) FROM inquiries WHERE status = 'new' AND service_mode IS DISTINCT FROM 'partner'),
      'partners_new', (SELECT count(*) FROM inquiries WHERE status = 'new' AND service_mode = 'partner'),
      'reviews_pending', (SELECT count(*) FROM reviews WHERE NOT approved),
      'applications_new', CASE WHEN v_careers THEN (SELECT count(*) FROM job_applications WHERE status IN ('received', 'new')) END,
      -- open shipment with no change and no tracking update for 3 days
      'shipments_stale', (
        SELECT count(*) FROM shipments s
        WHERE lower(s.status) NOT IN ('delivered', 'cancelled')
          AND greatest(s.updated_at, coalesce((SELECT max(m.created_at) FROM shipment_milestones m WHERE m.shipment_id = s.id), s.created_at))
              < now() - interval '3 days'
      ),
      'shipments_open', (SELECT count(*) FROM shipments WHERE lower(status) NOT IN ('delivered', 'cancelled'))
    ),
    'today', CASE WHEN v_audit THEN jsonb_build_object(
      'shipments_created', (SELECT count(*) FROM audit_logs WHERE action = 'shipment.insert' AND created_at >= v_day_start),
      'tracking_updates', (SELECT count(*) FROM audit_logs WHERE action = 'tracking.insert' AND created_at >= v_day_start),
      'delivered', (SELECT count(*) FROM audit_logs WHERE action = 'shipment.update' AND metadata ->> 'status_to' = 'delivered' AND created_at >= v_day_start),
      'activity', coalesce((
        SELECT jsonb_agg(a ORDER BY a.created_at DESC) FROM (
          SELECT created_at, actor_email, action, target_entity
          FROM audit_logs WHERE created_at >= v_day_start
          ORDER BY created_at DESC LIMIT 8
        ) a
      ), '[]'::jsonb)
    ) END,
    'pricing', (SELECT jsonb_build_object('updated_at', updated_at, 'row_count', row_count, 'source', source)
                FROM sheet_rates_cache ORDER BY updated_at DESC LIMIT 1)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_today_dashboard() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_today_dashboard() TO authenticated;

COMMIT;
