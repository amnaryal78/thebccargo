-- Admin notifications: every public submission (inquiry, partner request, booking,
-- feedback, job application) creates one unread notification for the admin desk.

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kind TEXT NOT NULL CHECK (kind IN ('inquiry', 'partner', 'booking', 'review', 'job_application')),
    title TEXT NOT NULL,
    body TEXT,
    link TEXT,
    ref_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications (is_read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Admins only. Visitors cannot read or write notifications; rows are created by the triggers below.
DROP POLICY IF EXISTS "Admins read notifications" ON public.notifications;
CREATE POLICY "Admins read notifications" ON public.notifications FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins update notifications" ON public.notifications;
CREATE POLICY "Admins update notifications" ON public.notifications FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins delete notifications" ON public.notifications;
CREATE POLICY "Admins delete notifications" ON public.notifications FOR DELETE USING (public.is_admin());

-- Trigger function: build a notification from the new row.
CREATE OR REPLACE FUNCTION public.notify_admin_on_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_TABLE_NAME = 'inquiries' THEN
        IF NEW.service_mode = 'partner' THEN
            INSERT INTO notifications (kind, title, body, link, ref_id)
            VALUES ('partner', 'New partner request', COALESCE(NEW.subject, NEW.name), '/admin/inquiries', NEW.id);
        ELSE
            INSERT INTO notifications (kind, title, body, link, ref_id)
            VALUES ('inquiry', 'New inquiry from ' || NEW.name, COALESCE(NEW.subject, left(NEW.message, 120)), '/admin/inquiries', NEW.id);
        END IF;
    ELSIF TG_TABLE_NAME = 'bookings' THEN
        INSERT INTO notifications (kind, title, body, link, ref_id)
        VALUES ('booking', 'New booking ' || NEW.booking_ref, NEW.sender_name || ' to ' || NEW.destination, '/admin/bookings', NEW.id);
    ELSIF TG_TABLE_NAME = 'reviews' THEN
        INSERT INTO notifications (kind, title, body, link, ref_id)
        VALUES ('review', 'New feedback from ' || NEW.customer_name, NEW.rating || ' stars: ' || left(NEW.comment, 100), '/admin/feedback', NEW.id);
    ELSIF TG_TABLE_NAME = 'job_applications' THEN
        INSERT INTO notifications (kind, title, body, link, ref_id)
        VALUES ('job_application', 'New job application', NEW.applicant_name || ' for ' || COALESCE(NEW.job_title, 'a role'), '/admin/careers', NEW.id);
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_admin_on_submission() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_notify_inquiries ON public.inquiries;
CREATE TRIGGER trg_notify_inquiries AFTER INSERT ON public.inquiries FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_submission();
DROP TRIGGER IF EXISTS trg_notify_bookings ON public.bookings;
CREATE TRIGGER trg_notify_bookings AFTER INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_submission();
DROP TRIGGER IF EXISTS trg_notify_reviews ON public.reviews;
CREATE TRIGGER trg_notify_reviews AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_submission();
DROP TRIGGER IF EXISTS trg_notify_job_applications ON public.job_applications;
CREATE TRIGGER trg_notify_job_applications AFTER INSERT ON public.job_applications FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_submission();

-- Public feedback must never publish itself: only an admin approves a review.
CREATE OR REPLACE FUNCTION public.force_review_pending()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        NEW.approved := FALSE;
        NEW.verified := FALSE;
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.force_review_pending() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_reviews_pending ON public.reviews;
CREATE TRIGGER trg_reviews_pending BEFORE INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.force_review_pending();

-- Live updates for the bell in the admin header.
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
