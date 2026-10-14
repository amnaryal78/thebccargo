-- Migration: 20260923000001_auth_admin_allowlist_schema.sql

-- 1. Ensure user_roles table has email, active, and updated_at
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE user_roles ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add unique constraint on email if not already present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_email_key'
    ) THEN
        ALTER TABLE user_roles ADD CONSTRAINT user_roles_email_key UNIQUE (email);
    END IF;
END $$;

-- 3. Create index on lower(email)
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON user_roles (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles (user_id);

-- 4. Seed initial super_admin email pre-authorization
INSERT INTO user_roles (email, role, active)
VALUES ('thebcargo@gmail.com', 'super_admin', true)
ON CONFLICT (email) 
DO UPDATE SET role = 'super_admin', active = true;

-- 5. Helper Function: Check if user_id or email is authorized admin
CREATE OR REPLACE FUNCTION check_admin_authorization(p_user_id UUID, p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_role_row RECORD;
    v_clean_email TEXT;
BEGIN
    v_clean_email := LOWER(TRIM(COALESCE(p_email, '')));

    -- First try matching by user_id
    IF p_user_id IS NOT NULL THEN
        SELECT * INTO v_role_row 
        FROM user_roles 
        WHERE user_id = p_user_id 
        LIMIT 1;
    END IF;

    -- If not found by user_id, try matching by email
    IF v_role_row IS NULL AND v_clean_email <> '' THEN
        SELECT * INTO v_role_row 
        FROM user_roles 
        WHERE LOWER(email) = v_clean_email 
        LIMIT 1;

        -- If found by email and user_id was missing or changed, link user_id
        IF v_role_row IS NOT NULL AND p_user_id IS NOT NULL AND (v_role_row.user_id IS NULL OR v_role_row.user_id <> p_user_id) THEN
            UPDATE user_roles 
            SET user_id = p_user_id, updated_at = NOW() 
            WHERE id = v_role_row.id;
        END IF;
    END IF;

    IF v_role_row IS NULL THEN
        RETURN jsonb_build_object(
            'is_authorized', false,
            'reason', 'not_found',
            'role', null,
            'active', false
        );
    END IF;

    RETURN jsonb_build_object(
        'is_authorized', (v_role_row.active = true),
        'reason', CASE WHEN v_role_row.active THEN 'authorized' ELSE 'deactivated' END,
        'role', v_role_row.role,
        'active', v_role_row.active,
        'email', v_role_row.email,
        'user_id', p_user_id
    );
END;
$$;

-- 6. RLS Policies on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own role" ON user_roles;
CREATE POLICY "Users read own role" ON user_roles 
FOR SELECT 
USING (
    auth.role() = 'service_role' OR 
    user_id = auth.uid() OR 
    LOWER(email) = LOWER(auth.jwt() ->> 'email')
);

DROP POLICY IF EXISTS "Admins manage user roles" ON user_roles;
CREATE POLICY "Admins manage user roles" ON user_roles 
FOR ALL 
USING (
    auth.role() = 'service_role' OR 
    EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur.user_id = auth.uid() 
          AND ur.active = true 
          AND ur.role IN ('super_admin', 'admin')
    )
);

GRANT EXECUTE ON FUNCTION check_admin_authorization(UUID, TEXT) TO anon, authenticated, service_role;
