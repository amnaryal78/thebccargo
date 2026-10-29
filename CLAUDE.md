# The BC Cargo & Courier

International-only courier site, Nepal -> world (HQ Hetauda). No domestic features; `national_rates` is dormant, do not revive. Supabase is the single source of truth (localStorage = cache only).

## Stack
Vite 8, React 19, TS, React Router 7, Tailwind 4, Framer Motion, three.js. `server.js` = zero-dep Node server (static `dist/`, `/api/health`, `/api/chat`, `/api/fix-blog` OpenRouter proxy, CSP). Supabase: Postgres+RLS, Auth (Google OAuth + `user_roles` allowlist), Edge Functions in `supabase/functions/` (only `rates` deployed).

## Commands
Run via `node node_modules/...` (path contains `&`; `.bin` shims break on Windows). Scripts: `dev` (port 3000), `typecheck`, `lint` (eslint), `test` (vitest), `build` (vite + prerender), `budget`, `sitemap`.
Before finishing: targeted test, typecheck, test, build. `tests/prerender.test.ts` needs a fresh `dist/` (run build first).

## Where things are
- Routes `src/App.tsx`; admin `src/pages/admin/AdminDashboardPage.tsx`, `src/features/admin/*`
- Data layer `src/services/*` (only place that talks to Supabase); client `src/lib/supabase.ts`
- Estimator `src/features/estimator/engine.ts`; rates `src/services/ratesService.ts`
- Design `src/design/tokens.css` (truth), `src/design/primitives/`, `src/components/ui/`
- Tests `tests/*.test.ts`; scripts `scripts/`
- Details: `docs/AI_ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/QA.md`. History: `docs/archive/`.

## Rules
- Never print/read `.env` values. No service-role/OpenRouter keys in `src/`.
- No schema/RLS/auth changes, deploys, or migrations on live Supabase without explicit approval. Repo migrations must match live (see AI_ARCHITECTURE drift list).
- Never weaken/skip tests. Never run git reset/checkout/clean/rebase/force-push. Commit only when asked.
- Brand: Oxford blue `#0B2D63`, golden yellow `#F2B632` (changed 2026-10-30), soft flat cards (border + subtle shadow, warm ivory canvas). Use tokens and primitives, not new colours or duplicate components.
- UI changes: check light/dark, mobile/desktop, hover/focus/disabled, reduced motion.
- Fix root cause, keep existing behavior, search all callers before changing shared code. No new dependency for what current tools do.
- Report only what ran: list checks run, failed, and not run.

## Backup and cleanup
- Before changing any file in a task, run `backup.bat` once (`& "<project>\backup.bat"`; quote it, path has `&`). Copies source to `..\production_project_backups\<timestamp>`, keeps newest 10. Skip for read-only tasks.
- Scratch files go in the session scratchpad. Delete temp artifacts you created when done; never delete files you did not create without asking.
- After meaningful work add a short entry (no secrets) to the top of `docs/AI_WORKLOG.md`.

## Android
Native app planned on the same Supabase backend (auth, `get_public_shipment` RPC, rates, bookings via typed contracts/Edge Functions). Do not couple to web UI code.

## Open risks (live RLS)
Anon write on `blogs` and `sheet_rates_cache`; "staff" policies = any authenticated user; anon-executable SECURITY DEFINER RPCs.
