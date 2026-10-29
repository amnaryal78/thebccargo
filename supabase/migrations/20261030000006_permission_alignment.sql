-- Phase 2: the database grants exactly what the admin screens offer.
-- 1. item_catalog: only staff who save shipments may add or change item suggestions
--    (before: any active staff, including view-only). Everyone on staff can still read it.
--    record_item_usage() runs as the caller, so it keeps working for shipment staff.
-- 2. user_roles: shipment staff can read reseller rows for the "referred by" picker on a bill
--    (before: only super_admin/admin, so the picker was empty for operations).

BEGIN;

DROP POLICY IF EXISTS "Staff manage item catalog" ON public.item_catalog;

CREATE POLICY "Staff read item catalog" ON public.item_catalog
  FOR SELECT TO authenticated USING (public.is_active_staff());

CREATE POLICY "Shipping staff write item catalog" ON public.item_catalog
  FOR ALL TO authenticated
  USING (public.has_staff_role(ARRAY['super_admin','admin','operations']))
  WITH CHECK (public.has_staff_role(ARRAY['super_admin','admin','operations']));

CREATE POLICY "Shipping staff read resellers" ON public.user_roles
  FOR SELECT TO authenticated
  USING (role = 'reseller' AND public.has_staff_role(ARRAY['super_admin','admin','operations']));

COMMIT;
