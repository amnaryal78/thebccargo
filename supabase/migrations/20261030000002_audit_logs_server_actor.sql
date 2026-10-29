-- F2 (part 1): the database, not the browser, says who did something.
-- A BEFORE INSERT trigger overwrites actor_id/actor_email from the signed-in session, so a client
-- can no longer write an entry in someone else's name. Existing client inserts keep working.
-- Rows stay append-only for clients: there are no UPDATE or DELETE policies on audit_logs.

BEGIN;

ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS actor_id uuid,
  ADD COLUMN IF NOT EXISTS entity_id text;

CREATE OR REPLACE FUNCTION public.audit_set_actor()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Server-side writers without a user session (service role, triggers run by the system) keep their values.
  IF auth.uid() IS NOT NULL THEN
    NEW.actor_id := auth.uid();
    NEW.actor_email := lower(coalesce(auth.jwt() ->> 'email', NEW.actor_email));
  END IF;
  NEW.created_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_set_actor ON public.audit_logs;
CREATE TRIGGER trg_audit_set_actor
  BEFORE INSERT ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.audit_set_actor();

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs (entity_id, created_at DESC);

COMMIT;
