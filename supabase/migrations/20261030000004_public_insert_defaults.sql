-- F3: the database decides how a public submission starts. Anonymous/customer inserts into
-- bookings, inquiries and job_applications can no longer set a staff-only state such as
-- 'confirmed', internal notes, or a back-dated time. Mirrors the existing force_review_pending.
-- Also a basic flood limit per email address, because Turnstile is not verified on any server yet
-- (the submit-* edge functions that would verify it are not deployed).
-- shortcut: per-email limit only, a bot that rotates emails is not stopped; upgrade = deploy submit-* functions.

BEGIN;

CREATE OR REPLACE FUNCTION public.force_public_submission_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_recent int;
BEGIN
  IF public.is_active_staff() THEN
    RETURN NEW; -- staff entering a record by hand keep full control
  END IF;

  NEW.created_at := now();

  IF TG_TABLE_NAME = 'bookings' THEN
    NEW.status := 'submitted';
    NEW.updated_at := now();
    v_email := lower(NEW.sender_email);
    SELECT count(*) INTO v_recent FROM public.bookings
      WHERE lower(sender_email) = v_email AND created_at > now() - interval '1 hour';
  ELSIF TG_TABLE_NAME = 'inquiries' THEN
    NEW.status := 'new';
    NEW.internal_notes := NULL;
    v_email := lower(NEW.email);
    SELECT count(*) INTO v_recent FROM public.inquiries
      WHERE lower(email) = v_email AND created_at > now() - interval '1 hour';
  ELSIF TG_TABLE_NAME = 'job_applications' THEN
    NEW.status := 'received';
    v_email := lower(NEW.email);
    SELECT count(*) INTO v_recent FROM public.job_applications
      WHERE lower(email) = v_email AND created_at > now() - interval '1 hour';
  END IF;

  IF v_email IS NOT NULL AND v_recent >= 5 THEN
    RAISE EXCEPTION 'Too many submissions from this email. Please try again later or call us.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_public_defaults_bookings ON public.bookings;
CREATE TRIGGER trg_public_defaults_bookings
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.force_public_submission_defaults();

DROP TRIGGER IF EXISTS trg_public_defaults_inquiries ON public.inquiries;
CREATE TRIGGER trg_public_defaults_inquiries
  BEFORE INSERT ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.force_public_submission_defaults();

DROP TRIGGER IF EXISTS trg_public_defaults_job_applications ON public.job_applications;
CREATE TRIGGER trg_public_defaults_job_applications
  BEFORE INSERT ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.force_public_submission_defaults();

COMMIT;
