-- Migration: customer chat (threads + messages). Applied to live Supabase 2026-10-23.
-- One thread per customer. Signed-in customers use RLS; guests use a secret token through
-- SECURITY DEFINER functions (only the token's SHA-256 hash is stored).

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  guest_token_hash TEXT UNIQUE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  phone TEXT NOT NULL CHECK (char_length(phone) BETWEEN 5 AND 30),
  needs_reply BOOLEAN NOT NULL DEFAULT FALSE,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (user_id IS NOT NULL OR guest_token_hash IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_chat_threads_recent ON public.chat_threads (needs_reply DESC, last_message_at DESC);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('customer', 'staff')),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  staff_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON public.chat_messages (thread_id, created_at);

-- Keep the thread's "needs reply" flag and ordering in step with its latest message.
CREATE OR REPLACE FUNCTION public.chat_touch_thread()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.chat_threads
     SET last_message_at = NEW.created_at,
         needs_reply = (NEW.sender = 'customer')
   WHERE id = NEW.thread_id;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_chat_touch_thread ON public.chat_messages;
CREATE TRIGGER trg_chat_touch_thread AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.chat_touch_thread();

ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Signed-in customers: their own thread only
DROP POLICY IF EXISTS "Customer reads own thread" ON public.chat_threads;
CREATE POLICY "Customer reads own thread" ON public.chat_threads FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_message_staff());
DROP POLICY IF EXISTS "Customer opens own thread" ON public.chat_threads;
CREATE POLICY "Customer opens own thread" ON public.chat_threads FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND guest_token_hash IS NULL);
DROP POLICY IF EXISTS "Customer updates own contact" ON public.chat_threads;
CREATE POLICY "Customer updates own contact" ON public.chat_threads FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_message_staff())
  WITH CHECK (user_id = auth.uid() OR public.is_message_staff());

DROP POLICY IF EXISTS "Read messages of own thread" ON public.chat_messages;
CREATE POLICY "Read messages of own thread" ON public.chat_messages FOR SELECT TO authenticated
  USING (
    public.is_message_staff()
    OR EXISTS (SELECT 1 FROM public.chat_threads t WHERE t.id = thread_id AND t.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "Customer writes to own thread" ON public.chat_messages;
CREATE POLICY "Customer writes to own thread" ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (
    (sender = 'customer' AND staff_email IS NULL
      AND EXISTS (SELECT 1 FROM public.chat_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()))
    OR (sender = 'staff' AND public.is_message_staff())
  );

-- Guests: everything goes through these functions, keyed by the token's hash.
CREATE OR REPLACE FUNCTION public.chat_guest_open(p_token TEXT, p_name TEXT, p_phone TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE v_hash TEXT; v_id UUID;
BEGIN
  IF p_token IS NULL OR char_length(p_token) < 32 THEN RAISE EXCEPTION 'invalid token'; END IF;
  v_hash := encode(digest(p_token, 'sha256'), 'hex');
  INSERT INTO public.chat_threads (guest_token_hash, name, phone)
  VALUES (v_hash, trim(p_name), trim(p_phone))
  ON CONFLICT (guest_token_hash) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone
  RETURNING id INTO v_id;
  RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION public.chat_guest_fetch(p_token TEXT)
RETURNS TABLE (id UUID, sender TEXT, body TEXT, created_at TIMESTAMPTZ)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, extensions AS $$
  SELECT m.id, m.sender, m.body, m.created_at
    FROM public.chat_messages m
    JOIN public.chat_threads t ON t.id = m.thread_id
   WHERE t.guest_token_hash = encode(digest(p_token, 'sha256'), 'hex')
   ORDER BY m.created_at
   LIMIT 500;
$$;

CREATE OR REPLACE FUNCTION public.chat_guest_send(p_token TEXT, p_body TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE v_thread UUID; v_id UUID;
BEGIN
  SELECT id INTO v_thread FROM public.chat_threads
   WHERE guest_token_hash = encode(digest(p_token, 'sha256'), 'hex');
  IF v_thread IS NULL THEN RAISE EXCEPTION 'chat not found'; END IF;
  -- simple flood guard: at most 20 messages a minute per thread
  IF (SELECT count(*) FROM public.chat_messages
       WHERE thread_id = v_thread AND created_at > NOW() - INTERVAL '1 minute') >= 20 THEN
    RAISE EXCEPTION 'too many messages, please wait a minute';
  END IF;
  INSERT INTO public.chat_messages (thread_id, sender, body) VALUES (v_thread, 'customer', trim(p_body))
  RETURNING id INTO v_id;
  RETURN v_id;
END $$;

REVOKE ALL ON FUNCTION public.chat_guest_open(TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.chat_guest_fetch(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.chat_guest_send(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.chat_touch_thread() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.chat_guest_open(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.chat_guest_fetch(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.chat_guest_send(TEXT, TEXT) TO anon, authenticated;

-- Realtime for signed-in customers and staff (RLS still applies to what each client receives).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;
END $$;
