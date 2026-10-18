# Phase 9: International cargo only

Goal: BC Cargo is presented only as an international cargo company. Nothing about domestic (national, inside-Nepal) courier remains in the interface, the data the public can see, the estimator, the SEO, or the chatbot, and the pages still look complete and well balanced afterwards.
Evidence: `docs/QA_FINDINGS.md` section 4. Depends on Phase 8 (use the shared primitives and tokens).
Size: L.

## Scope decisions (made for you, change only if I say so)
- **In:** air freight, ocean freight, cross-border road freight to India and other countries, customs clearance, and **pickup as an add-on for an international shipment** (a checkbox on the booking and the estimator, never a service on its own and never "delivery inside Nepal").
- **Out:** every domestic/national service, rate, route, option, filter, tab, FAQ, blog topic, policy section, chatbot answer, seed shipment and SEO page. This includes `srv-nat-express`, `courier-nat`, `haulage-nat`, "Nepal National Express", "Nepal Domestic Surface/Freight", "Hub-to-Hub", "National & Regional", `/rates/national`.
- **Mixed content** (for example "Surface & Overland Freight", which currently covers both): keep only the cross-border part and rewrite it as international. If nothing international is left in an item, delete it.
- **Nepal locations stay** as origin offices, drop-off points and gateways (Kathmandu, Hetauda, and any branch the owner lists). They are addresses, not a national courier service. Do not describe them as a way to send parcels within Nepal.
- **Do not drop database tables or data.** `national_rates` and similar stay in Supabase, unused; the app stops reading and writing them. Tell me in the report that dropping them needs my approval and a backup.
- A booking is valid only if the destination country is not Nepal, enforced in the UI **and** in the `submit-booking` Edge Function.

## Tasks
- [ ] **9.1 Inventory first.** Run: `grep -rniE '\bnational\b|\bdomestic\b|courier-nat|haulage-nat|nat-express|\binland\b|within nepal|hub-to-hub|nepal-wide' src supabase scripts tests server.js index.html`. Use the word boundary on purpose: "International" contains "national". Today this finds about 166 lines in 47 files. Save the list in `docs/AI_WORKLOG.md` and tick files off as you go. Also search by meaning, not only by word: "Kathmandu Valley delivery", "same day", "city courier", "Pokhara corridor", NPR-only prices, "Rs", "per kg within".
- [ ] **9.2 Estimator.** Remove the service-type switch and the whole domestic branch from `src/features/estimator/` (`engine.ts`, `constants.ts`, `useEstimatorData.ts`, `RateEstimator.tsx`) and from `MiniEstimatorSlot`. The input order becomes: destination country, weight, size (optional), contents checks (liquid, meat/food, medicine), pickup add-on. Keep the engine pure and tested; delete domestic tests and replace them with international ones. The result still shows NPR as the main currency.
- [ ] **9.3 Rates page.** Tabs become: Estimator, Rates by country, Request a quote (3 instead of 4). Remove the national table, national search and the `Hub-to-Hub` and `Nepal Domestic Surface` buttons. Remove `/rates/national`, `/rates/calculator` aliases that point to domestic content; redirect the old URLs to `/rates` (client route and `server.js`, status 301).
- [ ] **9.4 Services.** Keep air, ocean, road (cross-border) and customs. Delete the national express/haulage entries from `servicesData.ts`, the seed SQL and the services SEO migration data. Remove the "Nepal National" filter chip and the "National & Regional" tag. Redirect `/services/courier-nat` and `/services/haulage-nat` to `/services`. Re-lay out the cards (see 9.8).
- [ ] **9.5 Home.** `RouteTableHero` and `RouteTable2D`: replace the "National Freight" filter and "Nepal National Express" chip with transport filters (All, Air, Road, Sea). Corridor counts must come from the data, not typed numbers. Update `HomeServicePicker`, `DestinationPanel`, `HowItWorksTimeline` and the stats row so that no copy says "both", "either", "domestic or international".
- [ ] **9.6 Booking, tracking, admin.** Booking step 1 loses the Domestic card; the mode choice is Air / Road / Sea. Tracking keeps `ServiceMode` as air, overland, ocean; remove domestic seed shipments from `initialData.ts` and the tests. Admin: remove the national rates editor and CSV importer, the domestic filters on inquiries and shipments, and domestic widgets on the overview; update `features/admin/types.ts`. Keep reading old rows safely: if the database still contains a domestic record, admin shows it as "Legacy" instead of crashing.
- [ ] **9.7 Content and SEO.** Update About, Contact, FAQ, Policies, Careers copy, blog categories and any domestic blog posts or seeds, footer links, `chatbotData.ts`, the `bc-cargo-chat` knowledge, the chatbot suggestion chips, `index.html`, `manifest.json`, JSON-LD (`Service`, `LocalBusiness` descriptions), `scripts/prerender.mjs` and `scripts/generate-sitemap.mjs` (remove deleted routes; sitemap must have no 404s), and the policy page restricted-goods text. Titles and descriptions must describe international cargo from Nepal.
- [ ] **9.8 No broken layout.** After every removal check 360, 412, 768 and 1440 px, light and dark. Fix: grids sized for 4 items that now have 3 (use 3 columns or 2+1 with a deliberate wide card, never an empty slot); tab rows with fewer tabs; hero filter row; stat cards; counters; paragraphs that referenced the removed option; empty vertical gaps; "Compare" tables with a missing column; mobile sheets and the More menu. Remove the leftover section instead of showing an empty one. The page must look intentional, with no dead space.
- [ ] **9.9 Scope guard test.** Add `tests/international-only.test.ts`: scans `src/**`, `supabase/functions/**`, `public/**`, `scripts/**` and `server.js` and fails if `\b(national|domestic)\b`, `courier-nat`, `haulage-nat`, `nat-express`, `hub-to-hub`, `within nepal`, `nepal-wide` appear (case-insensitive). Allow-list only: (a) the single data-layer file that names the dormant `national_rates` table, (b) migrations, (c) the test file itself. Keep the allow-list in the test with a comment per entry.
- [ ] **9.10 Booking validation.** Client and `supabase/functions/submit-booking`: reject destination country = Nepal with a clear message ("We ship from Nepal to other countries."). Add tests.

## Gate
```
npm run typecheck && npm test && npm run build
npm run qa:ui   # both themes; hard checks 0
```
`tests/international-only.test.ts` passes. Manual checklist (do it yourself and tick in the report): open `/`, `/rates`, `/services`, `/book`, `/track`, `/about`, `/contact`, `/faq`, `/policies`, `/blogs`, the More menu and the chatbot; use the browser find box for "national", "domestic", "Nepal-wide", "same day"; there must be zero hits. Old URLs redirect. Sitemap lists no removed route.

## Exit criteria
Zero domestic references reachable by a visitor; estimator and rates are international only; layouts re-balanced at all four widths with no gaps; redirects in place; DB tables untouched; hard QA checks 0; report lists every ambiguous call you made.

## Not in this phase
Rewriting copy for readability and text-fit fixes (Phase 10), except where a removal needs new text.
