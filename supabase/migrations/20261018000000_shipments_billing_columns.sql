-- Admin billing: sender/receiver details and the full bill (boxes, items, charges) per shipment.
-- Additive and nullable. No RLS change: the existing "Staff full access shipments" policy still applies.
alter table public.shipments
  add column if not exists sender_name text,
  add column if not exists sender_phone text,
  add column if not exists sender_email text,
  add column if not exists sender_address text,
  add column if not exists receiver_name text,
  add column if not exists receiver_phone text,
  add column if not exists receiver_email text,
  add column if not exists receiver_address text,
  add column if not exists total_npr numeric(14,2),
  add column if not exists bill jsonb;
