-- Migration: Fix infinite recursion in user_roles RLS policy
-- Creates is_admin() SECURITY DEFINER helper function and alters Admins manage user roles policy

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE (user_id = auth.uid() OR lower(email) = lower(auth.jwt() ->> 'email'))
      AND active = true
      AND role IN ('super_admin', 'admin')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

ALTER POLICY "Admins manage user roles" ON public.user_roles
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
