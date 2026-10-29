-- Profile location: every signed-in person (customer, reseller, staff) can save their own
-- city/area (e.g. "Hetauda-4, Makwanpur"). Owner decision 2026-10-23: one short text field.
-- Each person reads and writes only their own row; active staff can read all (for pickups).
-- No deletes from the browser. Needs owner approval before it is applied to live.

CREATE TABLE IF NOT EXISTS public.account_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  location text CHECK (location IS NULL OR char_length(btrim(location)) BETWEEN 2 AND 120),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.account_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read own profile, staff read all" ON public.account_profiles;
CREATE POLICY "Read own profile, staff read all" ON public.account_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_active_staff());

DROP POLICY IF EXISTS "Create own profile" ON public.account_profiles;
CREATE POLICY "Create own profile" ON public.account_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Update own profile" ON public.account_profiles;
CREATE POLICY "Update own profile" ON public.account_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

REVOKE ALL ON public.account_profiles FROM anon;
