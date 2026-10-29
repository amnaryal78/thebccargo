-- Reseller dashboard: the signed-in reseller's own orders with weight and commission.
-- Commission is computed here (server side), never in the browser: Rs 50 x total weight (kg).
-- Shipments store one total weight (gross_weight_kg = chargeable_weight_kg, see billing/persist.ts).
-- Cancelled orders earn 0. Earned vs pending (delivered or not) is decided in the UI from status.
-- No receiver/sender names, phones or addresses are returned.
-- DRAFT: needs owner approval before it is applied to live.

CREATE OR REPLACE FUNCTION public.get_my_reseller_orders()
RETURNS TABLE (
  id uuid,
  tracking_number text,
  created_at timestamptz,
  destination text,
  status text,
  weight_kg numeric,
  commission_npr numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (
    SELECT ur.id
    FROM public.user_roles ur
    WHERE ur.role::text = 'reseller'
      AND ur.active = true
      AND (ur.user_id = auth.uid() OR lower(ur.email) = lower(auth.jwt() ->> 'email'))
    LIMIT 1
  ),
  rate AS (SELECT 50::numeric AS npr_per_kg)  -- the one place the commission rate lives
  SELECT s.id,
         s.tracking_number,
         s.created_at,
         s.destination,
         s.status,
         round(coalesce(s.gross_weight_kg, 0), 2) AS weight_kg,
         CASE WHEN lower(s.status) = 'cancelled' THEN 0
              ELSE round(coalesce(s.gross_weight_kg, 0) * (SELECT npr_per_kg FROM rate), 2)
         END AS commission_npr
  FROM public.shipments s
  JOIN me ON s.reseller_id = me.id
  ORDER BY s.created_at DESC
  LIMIT 2000;
$$;

REVOKE ALL ON FUNCTION public.get_my_reseller_orders() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_reseller_orders() TO authenticated;
