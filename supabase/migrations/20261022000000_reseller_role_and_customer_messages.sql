-- Migration: reseller role + customer messaging (applied to live Supabase 2026-10-22)

-- 1. Reseller role. user_roles.role may be the user_role enum or plain text depending on drift.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'reseller';
  END IF;
END $$;
-- is_admin() only matches super_admin/admin, so resellers never gain admin access.

-- 2. Customer messages: one row = customer message + optional staff reply.
CREATE TABLE IF NOT EXISTS public.customer_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  phone TEXT NOT NULL CHECK (char_length(phone) BETWEEN 5 AND 30),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'replied')),
  reply TEXT CHECK (reply IS NULL OR char_length(reply) <= 2000),
  replied_by TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_customer_messages_user ON public.customer_messages (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_messages_status ON public.customer_messages (status, created_at DESC);

CREATE OR REPLACE FUNCTION public.is_message_staff()
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
      AND role::text IN ('super_admin', 'admin', 'operations', 'support')
  );
$$;
REVOKE EXECUTE ON FUNCTION public.is_message_staff() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_message_staff() TO authenticated;

ALTER TABLE public.customer_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can send a message" ON public.customer_messages;
CREATE POLICY "Anyone can send a message" ON public.customer_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new' AND reply IS NULL AND (user_id IS NULL OR user_id = auth.uid()));

DROP POLICY IF EXISTS "Customers read own, staff read all" ON public.customer_messages;
CREATE POLICY "Customers read own, staff read all" ON public.customer_messages
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_message_staff());

DROP POLICY IF EXISTS "Staff reply to messages" ON public.customer_messages;
CREATE POLICY "Staff reply to messages" ON public.customer_messages
  FOR UPDATE TO authenticated
  USING (public.is_message_staff())
  WITH CHECK (public.is_message_staff());
