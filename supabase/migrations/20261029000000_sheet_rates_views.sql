-- Read-only, always-in-sync views over the one-row JSON cache (sheet_rates_cache). Nothing is copied or changed;
-- the estimator and the rates function keep using sheet_rates_cache as before.

create or replace view public.sheet_rates_rows with (security_invoker = true) as
select
  r->>'rate_group'                          as rate_group,
  r->>'display_name'                        as display_name,
  r->>'weight_tier'                         as weight_tier,
  (r->>'weight_kg')::numeric                as weight_kg,
  (r->>'price_npr')::numeric                as price_npr,
  r->>'currency'                            as currency,
  coalesce((r->>'active')::boolean, true)   as active,
  array(select jsonb_array_elements_text(r->'supported_countries')) as supported_countries,
  c.updated_at
from public.sheet_rates_cache c, jsonb_array_elements(c.rates) r
where c.id = 'latest'
order by r->>'rate_group',
         case r->>'weight_tier' when 'standard' then 1 when '10_plus' then 2 else 3 end,
         (r->>'weight_kg')::numeric;

create or replace view public.sheet_rates_grid with (security_invoker = true) as
select
  rate_group,
  max(display_name) as display_name,
  max(price_npr) filter (where weight_tier = 'standard' and weight_kg = 1.0) as kg_1_0,
  max(price_npr) filter (where weight_tier = 'standard' and weight_kg = 1.5) as kg_1_5,
  max(price_npr) filter (where weight_tier = 'standard' and weight_kg = 2.0) as kg_2_0,
  max(price_npr) filter (where weight_tier = 'standard' and weight_kg = 2.5) as kg_2_5,
  max(price_npr) filter (where weight_tier = 'standard' and weight_kg = 3.0) as kg_3_0,
  max(price_npr) filter (where weight_tier = 'standard' and weight_kg = 3.5) as kg_3_5,
  max(price_npr) filter (where weight_tier = 'standard' and weight_kg = 4.0) as kg_4_0,
  max(price_npr) filter (where weight_tier = 'standard' and weight_kg = 4.5) as kg_4_5,
  max(price_npr) filter (where weight_tier = 'standard' and weight_kg = 5.0) as kg_5_0,
  max(price_npr) filter (where weight_tier = 'standard' and weight_kg = 5.5) as kg_5_5,
  max(price_npr) filter (where weight_tier = 'standard' and weight_kg = 6.0) as kg_6_0,
  max(price_npr) filter (where weight_tier = 'standard' and weight_kg = 6.5) as kg_6_5,
  max(price_npr) filter (where weight_tier = 'standard' and weight_kg = 7.0) as kg_7_0,
  max(price_npr) filter (where weight_tier = 'standard' and weight_kg = 7.5) as kg_7_5,
  max(price_npr) filter (where weight_tier = 'standard' and weight_kg = 8.0) as kg_8_0,
  max(price_npr) filter (where weight_tier = 'standard' and weight_kg = 8.5) as kg_8_5,
  max(price_npr) filter (where weight_tier = 'standard' and weight_kg = 9.0) as kg_9_0,
  max(price_npr) filter (where weight_tier = 'standard' and weight_kg = 9.5) as kg_9_5,
  max(price_npr) filter (where weight_tier = '10_plus') as per_kg_10_plus,
  max(price_npr) filter (where weight_tier = '20_plus') as per_kg_20_plus,
  max(updated_at) as updated_at
from public.sheet_rates_rows
where active
group by rate_group
order by rate_group;

grant select on public.sheet_rates_rows, public.sheet_rates_grid to anon, authenticated;
