-- F1 (CRITICAL): only super_admin may create, change, deactivate or delete staff.
-- Before: "Admins manage user roles" FOR ALL USING is_admin(), and is_admin() includes 'admin',
-- so an admin could promote themselves to super_admin through the API.
-- Reads are unchanged: own row for everyone, every row for super_admin/admin.
-- check_admin_authorization (SECURITY DEFINER) still links user_id on first sign-in.

BEGIN;

DROP POLICY IF EXISTS "Admins manage user roles" ON public.user_roles;

CREATE POLICY "Admins read user roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Super admins insert user roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admins update user roles" ON public.user_roles
  FOR UPDATE TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admins delete user roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.is_super_admin());

-- Never leave the company without an active super_admin (stops an accidental self-demotion lockout).
CREATE OR REPLACE FUNCTION public.keep_one_super_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role = 'super_admin' AND OLD.active
     AND (TG_OP = 'DELETE' OR NEW.role <> 'super_admin' OR NOT NEW.active)
     AND NOT EXISTS (
       SELECT 1 FROM public.user_roles
       WHERE id <> OLD.id AND role = 'super_admin' AND active
     ) THEN
    RAISE EXCEPTION 'At least one active super admin must remain.' USING ERRCODE = '23514';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_keep_one_super_admin ON public.user_roles;
CREATE TRIGGER trg_keep_one_super_admin
  BEFORE UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.keep_one_super_admin();

COMMIT;
