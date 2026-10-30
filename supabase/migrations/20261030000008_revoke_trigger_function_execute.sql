-- Trigger functions are only ever run by their triggers. Nobody needs to call them over the API
-- (/rest/v1/rpc/...), so remove that access. Triggers keep working: EXECUTE is checked when a
-- trigger is created, not each time it fires.

REVOKE EXECUTE ON FUNCTION public.audit_milestone_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_set_actor() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_shipment_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.force_public_submission_defaults() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.keep_one_super_admin() FROM PUBLIC, anon, authenticated;
