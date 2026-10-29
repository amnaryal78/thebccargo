-- Notifications follow the same roles as the work they point to. Before, only super_admin/admin
-- could read them, so operations and support saw an empty bell for bookings and inquiries they
-- are allowed to handle. Job-application alerts go to the content team that manages careers.
-- Deleting notifications stays admin-only.

BEGIN;

DROP POLICY IF EXISTS "Admins read notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins update notifications" ON public.notifications;

CREATE POLICY "Staff read their notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (
    CASE kind
      WHEN 'job_application' THEN public.has_staff_role(ARRAY['super_admin','admin','editor'])
      ELSE public.is_message_staff()
    END
  );

CREATE POLICY "Staff mark their notifications read" ON public.notifications
  FOR UPDATE TO authenticated
  USING (
    CASE kind
      WHEN 'job_application' THEN public.has_staff_role(ARRAY['super_admin','admin','editor'])
      ELSE public.is_message_staff()
    END
  )
  WITH CHECK (
    CASE kind
      WHEN 'job_application' THEN public.has_staff_role(ARRAY['super_admin','admin','editor'])
      ELSE public.is_message_staff()
    END
  );

COMMIT;
