# CLAUDE.md — The BC Cargo & Courier

Read `AGENTS.md` first (project contract; still in force). This file is the short repeat-use summary. Details: `docs/AI_ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/QA.md`. Log work in `docs/AI_WORKLOG.md` (newest first, no secrets).

## Identity
International-only courier/cargo site, Nepal -> world (HQ Hetauda). No domestic courier features. `national_rates` table exists but is dormant; do not revive it. Supabase is the single source of truth (no local DB; browser localStorage is cache only).

## Stack
Vite 8 + React 19 + TS + React Router 7 + Tailwind 4 + Framer Motion + three.js. `server.js` = zero-dep Node server (static `dist/`, `/api/health`, `/api/chat`, `/api/fix-blog` OpenRouter proxy, CSP). Supabase: Postgres+RLS, Auth (Google OAuth + `user_roles` allowlist), Edge Functions in `supabase/functions/`.

## Commands (run via `node node_modules/...`; path contains `&`, `.bin` shims break on Windows)
`npm run dev` (port 3000) | `typecheck` | `lint` (eslint) | `test` (vitest) | `build` (vite + prerender) | `budget` | `sitemap`
Order before finishing: targeted test -> typecheck -> test -> build.

## Where things are
- Routes: `src/App.tsx`; admin routes `src/pages/admin/AdminDashboardPage.tsx`; admin features `src/features/admin/*`
- Data layer: `src/services/*` (only place that talks to Supabase); client `src/lib/supabase.ts`
- Estimator engine `src/features/estimator/engine.ts`; rates `src/services/ratesService.ts`
- Design: `src/design/tokens.css`, `src/design/primitives/`, `src/components/ui/` (Card3D, spotlight), `src/index.css`
- Tests `tests/*.test.ts`; scripts `scripts/` (prerender, sitemap, contrast, bundle budget)

## Rules (highlights)
- Never print/read `.env` values. Never put service-role/OpenRouter keys in `src/`.
- No schema/RLS/auth changes, deploys or migrations applied to live Supabase without explicit approval. Repo migrations must stay in sync with live (see AI_ARCHITECTURE drift list).
- Do not weaken/skip tests. Do not run git reset/checkout/clean/rebase/force-push.
- Brand: Oxford blue `#002147` + golden yellow `#F2B705`, Claymorphism (soft molded radius, inset highlight/shade, top-left light). Use tokens, not new colours. `docs/02_DESIGN.md` is OUTDATED (describes flat/hard-shadow style); `tokens.css` is truth.
- UI changes: check light/dark, mobile/desktop, hover/focus/disabled, reduced motion.

## Git
Branch `phase-0-cleanup`, ~176 uncommitted changes (incl. deletions of `bc-cargo-docs/docs/*`, some `ui/*`). Checkpoint-commit only when the user asks.

## Android direction
Plan for a native app on the same Supabase backend: auth, tracking (`get_public_shipment` RPC), rates, bookings via typed contracts/Edge Functions. Do not couple to web UI code. See AI_ARCHITECTURE "Android readiness".

## Known open risks (see AI_ARCHITECTURE)
Live RLS: anon write on `blogs` and `sheet_rates_cache`; "staff" policies = any authenticated user; anon-executable SECURITY DEFINER RPCs. Only edge function `rates` deployed.
