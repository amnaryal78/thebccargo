-- Migration: staff profiles, custom roles and multiple roles per person
-- STATUS: DRAFT FOR REVIEW. Not applied to live Supabase. Apply only with explicit approval.
--
-- Design notes
--  * user_roles.role stays the person's BASE role (enum user_role). Existing RLS policies,
--    check_admin_authorization() and the create-signed-file-url edge function keep working unchanged.
--  * Custom roles live in admin_roles with a JSON permission map (same keys as RolePermissions in the app).
--  * A person can hold any number of custom roles (user_role_assignments). Effective access in the admin UI
--    is the union of the base role and every assigned custom role.
--  * LIMITATION: custom-role permissions are enforced by the admin UI and routes. Database RLS still keys
--    off the base enum role. Give custom-role-only staff the base role read_only so the database stays
--    restrictive; the custom role only widens what the admin pages show and allow in the app.
--  * Everything is idempotent (IF NOT EXISTS / DROP POLICY IF EXISTS).

-- 1. Profile fields on user_roles ------------------------------------------------------------
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS full_name  TEXT;
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS phone      TEXT;
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS job_title  TEXT;
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS notes      TEXT;

ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_full_name_len;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_full_name_len CHECK (full_name IS NULL OR char_length(full_name) <= 120);
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_phone_len;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_phone_len CHECK (phone IS NULL OR char_length(phone) <= 32);
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_notes_len;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_notes_len CHECK (notes IS NULL OR char_length(notes) <= 1000);

-- 2. Helper: super admin check (SECURITY DEFINER avoids RLS recursion on user_roles) ---------
CREATE OR REPLACE FUNCTION public.is_super_admin()
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
      AND role = 'super_admin'
  );
$$;
REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- Any active staff member (any role except reseller)
CREATE OR REPLACE FUNCTION public.is_active_staff()
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
      AND role::text <> 'reseller'
  );
$$;
REVOKE ALL ON FUNCTION public.is_active_staff() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_active_staff() TO authenticated;

-- 3. Custom roles --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 60),
    description TEXT CHECK (description IS NULL OR char_length(description) <= 300),
    -- keys mirror RolePermissions in src/features/admin/types.ts, e.g. {"canManageBlogs": true}
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(permissions) = 'object'),
    created_by  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS admin_roles_name_lower_key ON public.admin_roles (lower(name));

-- 4. Many roles per person -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_role_assignments (
    user_role_id UUID NOT NULL REFERENCES public.user_roles(id) ON DELETE CASCADE,
    role_id      UUID NOT NULL REFERENCES public.admin_roles(id) ON DELETE CASCADE,
    assigned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_role_id, role_id)
);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_role ON public.user_role_assignments (role_id);

-- 5. RLS -----------------------------------------------------------------------------------
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff read admin_roles" ON public.admin_roles;
CREATE POLICY "Staff read admin_roles" ON public.admin_roles
    FOR SELECT TO authenticated USING (public.is_active_staff());

DROP POLICY IF EXISTS "Super admins manage admin_roles" ON public.admin_roles;
CREATE POLICY "Super admins manage admin_roles" ON public.admin_roles
    FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Staff read own assignments" ON public.user_role_assignments;
CREATE POLICY "Staff read own assignments" ON public.user_role_assignments
    FOR SELECT TO authenticated USING (
        public.is_super_admin() OR public.is_admin() OR EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.id = user_role_assignments.user_role_id
              AND (ur.user_id = auth.uid() OR lower(ur.email) = lower(auth.jwt() ->> 'email'))
        )
    );

DROP POLICY IF EXISTS "Super admins manage assignments" ON public.user_role_assignments;
CREATE POLICY "Super admins manage assignments" ON public.user_role_assignments
    FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- 6. Effective access for the signed-in person (used by the admin app after sign-in) ----------
CREATE OR REPLACE FUNCTION public.get_my_admin_access()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (
      SELECT jsonb_build_object(
        'base_role', ur.role,
        'full_name', ur.full_name,
        'avatar_url', ur.avatar_url,
        'custom_roles', COALESCE((
            SELECT jsonb_agg(jsonb_build_object('id', r.id, 'name', r.name, 'permissions', r.permissions))
            FROM public.user_role_assignments a
            JOIN public.admin_roles r ON r.id = a.role_id
            WHERE a.user_role_id = ur.id
        ), '[]'::jsonb)
      )
      FROM public.user_roles ur
      WHERE (ur.user_id = auth.uid() OR lower(ur.email) = lower(auth.jwt() ->> 'email'))
        AND ur.active = true
      LIMIT 1
    ),
    'null'::jsonb
  );
$$;
REVOKE ALL ON FUNCTION public.get_my_admin_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_admin_access() TO authenticated;

-- 7. Profile photos ------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('admin-avatars', 'admin-avatars', true, 2097152, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE
    SET file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Super admins write admin avatars" ON storage.objects;
CREATE POLICY "Super admins write admin avatars" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'admin-avatars' AND public.is_super_admin())
    WITH CHECK (bucket_id = 'admin-avatars' AND public.is_super_admin());

-- 8. Profile change requests ---------------------------------------------------------------
-- Profiles are set by an admin. Staff cannot edit their own row; they send a request and a super admin approves it.
CREATE TABLE IF NOT EXISTS public.profile_change_requests (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_role_id   UUID NOT NULL REFERENCES public.user_roles(id) ON DELETE CASCADE,
    requester_email TEXT,
    field          TEXT NOT NULL CHECK (field IN ('full_name','phone','job_title','department','avatar_url')),
    new_value      TEXT NOT NULL CHECK (char_length(new_value) BETWEEN 1 AND 500),
    note           TEXT CHECK (note IS NULL OR char_length(note) <= 500),
    status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','declined')),
    decided_by     TEXT,
    decided_at     TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_profile_change_requests_status ON public.profile_change_requests (status, created_at DESC);

ALTER TABLE public.profile_change_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff read own requests" ON public.profile_change_requests;
CREATE POLICY "Staff read own requests" ON public.profile_change_requests
    FOR SELECT TO authenticated USING (
        public.is_super_admin() OR EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.id = profile_change_requests.user_role_id
              AND (ur.user_id = auth.uid() OR lower(ur.email) = lower(auth.jwt() ->> 'email'))
        )
    );

-- Staff may only file a pending request for their own row.
DROP POLICY IF EXISTS "Staff file own requests" ON public.profile_change_requests;
CREATE POLICY "Staff file own requests" ON public.profile_change_requests
    FOR INSERT TO authenticated WITH CHECK (
        status = 'pending' AND EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.id = profile_change_requests.user_role_id
              AND ur.active = true
              AND (ur.user_id = auth.uid() OR lower(ur.email) = lower(auth.jwt() ->> 'email'))
        )
    );

DROP POLICY IF EXISTS "Super admins decide requests" ON public.profile_change_requests;
CREATE POLICY "Super admins decide requests" ON public.profile_change_requests
    FOR UPDATE TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Super admins delete requests" ON public.profile_change_requests;
CREATE POLICY "Super admins delete requests" ON public.profile_change_requests
    FOR DELETE TO authenticated USING (public.is_super_admin());

-- Staff may upload a proposed photo only into their own pending folder: pending/<auth uid>/<file>
DROP POLICY IF EXISTS "Staff upload pending avatar" ON storage.objects;
CREATE POLICY "Staff upload pending avatar" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (
        bucket_id = 'admin-avatars'
        AND (storage.foldername(name))[1] = 'pending'
        AND (storage.foldername(name))[2] = auth.uid()::text
        AND public.is_active_staff()
    );

-- Rollback (manual):
--   DROP TABLE public.profile_change_requests;
--   DROP FUNCTION public.get_my_admin_access(); DROP TABLE public.user_role_assignments; DROP TABLE public.admin_roles;
--   DROP FUNCTION public.is_active_staff(); DROP FUNCTION public.is_super_admin();
--   ALTER TABLE public.user_roles DROP COLUMN full_name, DROP COLUMN phone, DROP COLUMN job_title,
--     DROP COLUMN department, DROP COLUMN avatar_url, DROP COLUMN notes;
