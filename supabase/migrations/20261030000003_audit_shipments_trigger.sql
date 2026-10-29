-- F2 (part 2): shipments and their tracking updates are audited by the database, so an entry
-- can neither be skipped nor fail silently. Needs 20261030000002 (actor columns + actor trigger).
-- Metadata holds column NAMES and status values only, never personal data (names, phones, addresses).
-- Other tables move to database auditing in later phases, one migration each.

BEGIN;

CREATE OR REPLACE FUNCTION public.audit_shipment_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_changed text[];
BEGIN
  IF TG_OP = 'UPDATE' THEN
    SELECT coalesce(array_agg(n.key ORDER BY n.key), '{}') INTO v_changed
    FROM jsonb_each(to_jsonb(NEW)) n
    WHERE n.key NOT IN ('updated_at')
      AND n.value IS DISTINCT FROM (to_jsonb(OLD) -> n.key);
    IF cardinality(v_changed) = 0 THEN
      RETURN NEW; -- a save with no real change is not an event
    END IF;
  END IF;

  INSERT INTO public.audit_logs (action, target_entity, entity_id, metadata)
  VALUES (
    'shipment.' || lower(TG_OP),
    'shipments:' || coalesce(NEW.tracking_number, OLD.tracking_number),
    coalesce(NEW.id, OLD.id)::text,
    CASE TG_OP
      WHEN 'UPDATE' THEN jsonb_build_object('changed', v_changed)
        || CASE WHEN NEW.status IS DISTINCT FROM OLD.status
             THEN jsonb_build_object('status_from', OLD.status, 'status_to', NEW.status) ELSE '{}'::jsonb END
      WHEN 'INSERT' THEN jsonb_build_object('status', NEW.status, 'destination', NEW.destination)
      ELSE jsonb_build_object('status', OLD.status)
    END
  );
  RETURN coalesce(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_milestone_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.shipment_milestones := coalesce(NEW, OLD);
  v_tracking text;
BEGIN
  SELECT tracking_number INTO v_tracking FROM public.shipments WHERE id = v_row.shipment_id;
  INSERT INTO public.audit_logs (action, target_entity, entity_id, metadata)
  VALUES (
    'tracking.' || lower(TG_OP),
    'shipments:' || coalesce(v_tracking, v_row.shipment_id::text),
    v_row.shipment_id::text,
    jsonb_build_object('milestone_id', v_row.id, 'title', v_row.title, 'status', v_row.status)
  );
  RETURN coalesce(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_shipments ON public.shipments;
CREATE TRIGGER trg_audit_shipments
  AFTER INSERT OR UPDATE OR DELETE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.audit_shipment_change();

DROP TRIGGER IF EXISTS trg_audit_shipment_milestones ON public.shipment_milestones;
CREATE TRIGGER trg_audit_shipment_milestones
  AFTER INSERT OR UPDATE OR DELETE ON public.shipment_milestones
  FOR EACH ROW EXECUTE FUNCTION public.audit_milestone_change();

COMMIT;
