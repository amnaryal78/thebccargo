-- Item names staff have used on shipment bills, so the form can suggest them next time.
-- The large built-in list ships with the app (src/features/admin/shipments/catalog); this table holds
-- names added by staff and how often each was used.

create table if not exists public.item_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  name_key text not null unique,
  category text,
  unit text,
  uses integer not null default 1,
  created_at timestamptz not null default now(),
  last_used_at timestamptz not null default now()
);

alter table public.item_catalog enable row level security;

-- Any active staff member (a row in user_roles) can read and write; the public cannot.
create policy "Staff manage item catalog" on public.item_catalog
  for all to authenticated
  using (exists (
    select 1 from public.user_roles
    where active = true and (user_id = auth.uid() or lower(email) = lower(auth.jwt() ->> 'email'))
  ))
  with check (exists (
    select 1 from public.user_roles
    where active = true and (user_id = auth.uid() or lower(email) = lower(auth.jwt() ->> 'email'))
  ));

-- Count one use for every name on a saved bill. Runs as the caller, so the policy above applies.
create or replace function public.record_item_usage(p_items jsonb)
returns void
language sql
security invoker
set search_path = public
as $$
  insert into public.item_catalog (name, name_key, category, unit)
  select distinct on (k) left(trim(n), 120), k, c, u
  from (
    select
      trim(x ->> 'name') as n,
      lower(regexp_replace(trim(x ->> 'name'), '\s+', ' ', 'g')) as k,
      nullif(x ->> 'category', '') as c,
      nullif(x ->> 'unit', '') as u
    from jsonb_array_elements(p_items) x
  ) s
  where n <> ''
  on conflict (name_key) do update
    set uses = public.item_catalog.uses + 1,
        last_used_at = now(),
        unit = coalesce(excluded.unit, public.item_catalog.unit);
$$;

revoke all on function public.record_item_usage(jsonb) from public, anon;
grant execute on function public.record_item_usage(jsonb) to authenticated;
