# Phase 3 — Rate Estimator

**Goal:** the estimated-bill tool with country, weight and liquid / meat / medicine checks.
**Read:** 01_PRD §5.2, 03_ARCHITECTURE §5.

## Tasks
1. Migration `…_estimator_rules.sql`: `handling_rules`, `rate_settings` (schema in ARCHITECTURE §5), RLS, and seed rows flagged `is_placeholder = true` (liquid, meat, medicine, with plausible requirement *text marked placeholder*). **Do not invent legal claims, regulatory agencies or prohibited lists.**
2. `features/estimator/engine.ts`: pure functions, no React or Supabase imports. Reuse `calculateVolumetricWeight` and `getChargeableWeight` from `ratesService`. Table-driven Vitest cases: weight bands, volumetric beats actual, each flag alone and combined, blocked → no price, missing band → "Contact us", the minimum charge, and the range rounding.
3. Data hook with stale-while-revalidate and an offline cache of the last rates.
4. UI built on Phase 1 primitives, styled as a **waybill form** (DESIGN §7):
   - searchable country combobox with flags, weight with a stepper, optional L×W×H, three labelled Yes/No toggles (liquid, meat, medicine), and the national vs international switch.
   - Animated bill **Counter** with a breakdown and the range.
   - Guidance cards per flagged item. Red is used only for restricted / blocked states.
   - The disclaimer, and CTAs: Book (prefilled), WhatsApp (prefilled message), print quote.
5. Embed variants: compact on Home, and the hero DestinationPanel preselects the destination.
6. `/rates` routes get unique `<title>` and description each (`/rates`, `/rates/national`, `/rates/international`, `/rates/rfq`). The existing RFQ and tables are restyled.
7. Admin hook-up lands in Phase 6. For now, a seed script is enough.

## Verify
- Unit tests green. Manual: 0.5 kg to HKG, 5.1 kg to USA with liquid, meat to a blocked country, and medicine on national.
- 360px: one-thumb usable, labels visible, the keyboard does not cover the total.

## Done when
Estimates match the tests, the flag guidance shows, the disclaimer is always visible, and the placeholder warning appears while any placeholder rule applies.
