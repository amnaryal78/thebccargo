# Phase 4 — Services, About, Careers, Blogs, Contact, Track, Book

**Goal:** every inner page uses the same section system as Home, with its own dynamic components.
**Read:** 01_PRD §5.3–5.7, 02_DESIGN §7.

## Tasks
1. **Services:** overview with a 2-way compare tool, plus `/services/:slug` detail pages (carry / don't carry, process timeline, preselected mini estimator, FAQs). Add `slug`, `seo_title`, `seo_description` and `faq` to `services` if missing.
2. **About:** scroll timeline (pinned on desktop, vertical on mobile), hubs map, values, team, and real licence badges only (from `site_settings`). Where photos are missing, use an honest illustrated treatment and list the missing assets in the report.
3. **Careers:** filters, expanding cards, the apply **stepper** (details → CV → submit, with file validation and Turnstile), a success state, and `JobPosting` schema.
4. **Blogs:** category chips, search, reading time, sticky TOC (desktop), a progress bar, share, related posts. Keep the CMS and AI fixer working.
5. **Contact:** hub selector that drives the map, an "open now" badge computed in `Asia/Kathmandu`, inline-validated form, and one-tap call, WhatsApp and directions.
6. **Track (no API):** reads `shipments` and `shipment_milestones` only. Show a milestone timeline when found. When not found, show a clear message plus Call and WhatsApp. **No sample AWBs and no "Live" labels.**
7. **Book:** restyle `BookingSystem` (592 lines) as a stepper. Accept prefill from the estimator.
8. Policies and FAQ pages use the new system. FAQ search is instant.

## Verify
Each page at 360px and 1440px, light and dark. Each page has one H1. Forms work end to end against Supabase (test project) or the edge functions.

## Done when
No page has its own layout language, and every section on every page has a real interaction.
