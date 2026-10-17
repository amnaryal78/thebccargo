# AI_ARCHITECTURE (recon 2026-10-17; V=verified, I=inferred, U=unknown)

## Runtime
- V: SPA (Vite) + prerender (`scripts/prerender.mjs`, 33 pages) + `server.js` + Dockerfile (node:22-alpine, healthcheck `/api/health`). No `.github/` CI.
- V: Env names: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TURNSTILE_SITE_KEY` (browser); `OPENROUTER_API_KEY`, `DEFAULT_AI_MODEL`, `PORT`, `HOST` (server.js); `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`, email/SMS keys (edge secrets). `.env` is gitignored; only `.env.example` tracked. No service key in `src/`; `scripts/seed-estimator-rules.ts` reads it from env.
- V: PWA: `public/sw.js`, `manifest.json`, `offline.html`. Auth tokens stored via `src/lib/secureStorage.ts` (XOR obfuscation, not real encryption).

## Supabase project `xtipmcthdyyubohspjro` ("BC-billing-website", ap-northeast-1, ACTIVE)
Other projects in the account (INACTIVE): two unrelated, one "BC-billing-android".
Tables (22, RLS on all): user_roles, shipments, shipment_milestones, bookings, national_rates(dormant), international_rates, blogs, services, faqs, reviews, partners, careers, job_applications, inquiries, policies, site_settings, analytics_events, audit_logs, handling_rules, rate_settings, sheet_rates_cache, how_to_ship.
Data: user_roles 3 rows, services 4, handling_rules 5, rate_settings 4, blogs 1, reviews 1, how_to_ship 1, sheet_rates_cache 1; shipments/bookings/rates empty.
RPCs (all SECURITY DEFINER, executable by anon): check_admin_authorization, is_admin, get_public_shipment, get_admin_dashboard_metrics.
Realtime: only `how_to_ship`. Storage buckets: none exist live (migration 20260924 expects storage; U whether needed).
Edge functions live: only `rates` (verify_jwt=false). In repo but NOT deployed: chat, bc-cargo-chat, submit-booking, submit-inquiry, submit-job-application, generate-awb, create-signed-file-url, process-shipment-notification. Client services fall back to direct DB/localStorage.

## Auth/RBAC
Google OAuth -> `ProtectedRoute` -> RPC `check_admin_authorization` (fallback table query) against `user_roles` (roles incl. admin, super_admin). Admin shell tabs: overview, shipments, inquiries, handling-rules, how-to-ship, rates, blogs, careers, users, settings, audit.

## RISKS (V, live DB, 2026-10-17; no changes made)
1. `blogs`: policy "Allow public all blogs" (ALL, true/true) = anonymous can insert/update/delete. Not in repo migrations (live-only drift).
2. `sheet_rates_cache`: "Allow write sheet_rates_cache" ALL true = anonymous can overwrite cached rates (defined in migration 20261015000000).
3. "Staff full access *" policies use `auth.role()='authenticated'`, not `is_admin()`: any signed-in user (if Auth signups are open — U) can read/write shipments, bookings, inquiries, applications, settings, audit_logs, rates, services, careers.
4. Anon-executable SECURITY DEFINER RPCs; three lack fixed search_path; `get_admin_dashboard_metrics` callable by anon.
5. Leaked-password protection off. Public INSERT policies are `with check true` (bookings, inquiries, job_applications, reviews, analytics) — no rate limit besides edge functions, which are mostly undeployed.
6. Migration history drift: live lists only 3 of 9 repo migrations (estimator_rules, services_seo_faq, sheet_rates_cache; different version stamps). Others applied by hand. Verify before any `db push`.
7. `docs/AI_WORKLOG` 2026-10-17 entry claims anon writes blocked on several tables and "17 tables"; live has 22 and anon writes are open on blogs/sheet_rates_cache.

## Admin features: functional status
U for per-button tracing (not done in recon). Phase 0 audit noted inquiries/national-rates/international-rates/careers tabs once lacked render branches; routes now exist for inquiries, careers, rates. Trace before trusting.

## Android readiness
Good: single Supabase backend, RLS, `get_public_shipment` RPC (sanitised tracking), Edge Function `rates`, typed services in `src/services`, `src/types`. Gaps: business rules (estimator engine, handling rules) live in TS in the web app — extract or expose via Edge Function; submit-* functions undeployed; RLS holes above must be fixed before shipping a mobile client with anon key; no generated DB types file; no API contract doc. Existing "BC-billing-android" Supabase project is separate and INACTIVE (purpose U). `AndroidBottomNav.tsx` is a web mobile nav only.
