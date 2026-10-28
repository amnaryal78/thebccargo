# AI Project Worklog

Purpose: durable, low-token project memory for coding-agent sessions. Keep entries concise and factual. Newest entry goes first. Never store secrets, personal data, or raw environment files.

## Latest Entry

### 2026-10-28 - Ponytail audit items 5-6 (Claude Code, local only)
- **Deps:** removed unused `prettier`; moved `@types/three` to devDependencies; lockfile synced with `npm install --package-lock-only` (npm also added optional wasm32 entries). `.prettierrc` kept.
- **Context:** `CLAUDE.md` is now the single rules file (9.7 KB -> 3.1 KB incl. `AGENTS.md` pointer). Added `.claude/settings.json` `permissions.deny` for dist, node_modules, lockfile, docs/archive, public images, sitemap.
- **Checks:** tsc, build, prerender, vitest 240/240 PASS.

### 2026-10-28 - Ponytail audit cuts 1-4 (Claude Code, local only)
- **Removed (git rm, staged):** 6 unused components (AdminChatbotControl, AiBlogFixerModal, AdminCursorControl, RegionalHubsMap, MiniEstimatorSlot, LogisticsMotionGraphicSection) and 8 unused services (admin, analytics, blogImage, faq, partner, policy, service, settings). Zero references found.
- **Docs:** old worklog entries -> `docs/archive/AI_WORKLOG_ARCHIVE.md`; `docs/phases/`, `PHASES.md` -> `docs/archive/`; `docs/02_DESIGN.md` deleted (outdated).
- **Root:** `production_project.zip`, `prompt.md` moved to `../production_project_backups/_removed_root_files/`; `files (10)/` deleted (subset of `docs/qa`).
- **Checks:** tsc, build, prerender, vitest 240/240 PASS. Backup `..\production_project_backups\2026-10-28_20-25-45`. Branch `ponytail-audit`.

### 2026-10-23 - Reseller dashboard LIVE (Claude Code, owner approved)
- **DB:** applied `get_my_reseller_orders()` to live (history `20261023115623 reseller_orders_dashboard`). Read-only checks: anon cannot call; a non-reseller gets 0 rows; the reseller with a linked order sees 1 order, 23 kg, Rs 1,150 pending (= 23 × 50); rule holds for every row. Owner confirmed: earned = delivered, cancelled = 0.
- **Web:** pushed `87f4e31` (dashboard: 6 files) and `0979426` (vercel.json: `/profile`, `/messages`, `/reseller` added to SPA rewrites; they returned the 404 page before, a pre-existing bug). Vercel live in ~20 s each; those pages now 200, unknown pages still 404.
- **Not verified:** the dashboard while signed in as a real reseller (Google sign-in).

### 2026-10-23 - Reseller orders + commission dashboard on /profile (Claude Code, local only)
- **Built:** `src/features/reseller/ResellerDashboard.tsx` (summary cards: orders, weight sent, commission earned/pending; this-month line; month filter; last-6-months bar chart; orders table on desktop, cards on mobile; loading/empty/error states) and `commission.ts` (totals, Nepal-time months, Rs formatting). `ProfilePage.tsx` shows it for resellers (wider layout); customers unchanged. `accountService.fetchMyResellerOrders()`.
- **Server side:** DRAFT migration `20261028000000_reseller_orders_dashboard.sql`: `get_my_reseller_orders()` returns only the caller's own reseller orders (date, tracking, destination, status, weight, commission). Commission = Rs 50 × `gross_weight_kg` computed in SQL; 0 when cancelled; no customer contact fields; anon revoked. **NOT applied to live.** Until applied, the dashboard shows its error state for resellers.
- **Rule used (owner to confirm):** earned = delivered, pending = not yet delivered, cancelled = 0. Weight = the single total weight the shipment editor saves (gross = chargeable).
- **Verified:** tsc, eslint (303, no new), vitest 239/239 (+9 `tests/reseller-commission.test.ts`), build. Browser with sample data via a temporary harness (deleted): numbers correct, month filter, 360 px cards and 1440 px table, no horizontal scroll, empty and error states. **Not verified:** with a real signed-in reseller (needs the migration + Google sign-in). Not deployed.

### 2026-10-23 - Deployed Phase 1 security fixes (Claude Code, owner asked "update the website")
- **Pushed** `2a761f9` to `amnaryal78/thebccargo` main (fast-forward from a2a8827, no force, 16 files only: server.js, vercel.json, 3 client services, 7 Edge Functions, migration, 3 tests). GitHub base matched local base for every file.
- **Vercel:** live in ~30 s; the new CSP (no openrouter.ai) is served; /, /rates, /about, /how-to-ship, /book, /blogs, /admin return 200.
- **Render (/api): NOT redeployed.** Uptime unchanged (~4.7 days); /api/fix-blog still open on the old code. Owner must Manual Deploy on Render and set SUPABASE_URL + SUPABASE_ANON_KEY there. Note: the verification sent one empty POST to the live /api/fix-blog.
- Edge Functions are not deployed (unchanged); only `rates` is live.

### 2026-10-23 - RLS lockdown APPLIED to live Supabase (Claude Code, owner approved)
- **Applied:** `20261027000000_rls_lockdown_admin_auth.sql` to `xtipmcthdyyubohspjro` (live history `20261023112922`). Pre-apply fingerprint matched the tested copy. Rollback saved at `docs/qa/rollback_20261027_rls_lockdown.sql`.
- **Verified on live (read-only):** 72 policies, no "Staff full access" or anon-write policies left; anon and customer see no shipments, bookings, audit log or staff rows; super_admin keeps full access and metrics; public blogs, services, rates and tracking still work; advisor search_path warnings 3 → 0, anon definer functions 7 → 5 (intended).
- **Not verified:** staff writes via the admin UI (Google sign-in). **Owner:** test one shipment/blog/handling-rule save in /admin; enable leaked-password protection; delete the paused `bc-qa-rls-test` project.

### 2026-10-23 - QA Phase 1 part 3: RLS migration tested on a Supabase copy (Claude Code)
- **Done:** branching refused (needs Pro; no charge). Created free test project `bc-qa-rls-test` (`zsdagnzhyeucmbhfnkgo`, $0) with owner approval, copied live structure read-only (30 tables, 60 policies, 18 functions, 6 triggers; policy fingerprint identical to live), seeded fake example.com users, ran 46 role probes. Before the migration: 21 pass / 25 fail. After `20261027000000_rls_lockdown_admin_auth.sql`: 46/46. Takeover blocked; public forms, tracking, chat and profile still work.
- **Correction:** P1-01 is latent (row-level `IS NOT NULL` quirk): exploitable only for fully-filled `user_roles` rows; live has 0 of 6. Also the old function never linked user_id (5 of 6 rows unlinked). P1-02 confirmed exploitable.
- **Live:** read-only queries only; migration list unchanged. **Owner:** delete the paused test project in the dashboard (MCP has no delete); approve applying the migration to live.

### 2026-10-23 - QA Phase 1 part 2: security fixes (Claude Code, repo only, nothing applied or deployed)
- **Changed:** new DRAFT migration `supabase/migrations/20261027000000_rls_lockdown_admin_auth.sql` (admin-takeover RPC fixed, "Staff full access" policies replaced by role-based ones, anon blog/rates-cache writes dropped, dashboard RPC staff-only). `server.js` (staff auth on /api/fix-blog, free-model allowlist, body/token/history caps, malformed-URL crash fix, path check, generic errors, CSP). `vercel.json` CSP. `src/services/authService.ts` (no RPC when signed out, own-row fallback), `aiBlogFixerService.ts` (sends session token), `chatbotService.ts` (no placeholder Turnstile token). Edge Functions: create-signed-file-url (dev bypass removed), generate-awb + process-shipment-notification (staff check), submit-* (Turnstile fail-closed), chat (model allowlist, caps, bypass token removed). Tests: `rls-lockdown`, `server-hardening`, `edge-functions-security`.
- **Verified:** tsc, eslint 0 errors (303 warnings unchanged), vitest 230/230, build + prerender 65, budget, seo:check. Migration probed in PGlite against a stub of the live schema: 53/53 (31 fail without it). Local browser: chat works, fix-blog 401 without session, malformed URL 400. Secrets: none real in tree, dist (anon key only) or git history.
- **Not verified:** migration on a real Supabase project; Edge Functions executed (no Deno); blog fixer with a real staff session.
- **Owner actions:** approve/apply migration; redeploy Render + Vercel together with SUPABASE_URL/ANON on Render; TURNSTILE_SECRET_KEY before deploying functions; Auth settings. Details: `docs/qa/04_FINDINGS.md` Phase 1 part 2.

### 2026-10-23 - QA Phase 1 part 1: live DB read-only audit (Claude Code)
- **Done:** with owner permission, read-only queries on live `xtipmcthdyyubohspjro` (migrations, tables, policies, function grants, advisors, buckets, realtime). No writes, no RPC calls, no code changes. Results in `docs/qa/04_FINDINGS.md` "Phase 1 (part 1)".
- **Critical:** `check_admin_authorization` (anon-executable SECURITY DEFINER) re-links an admin `user_roles` row to any caller-supplied uid, giving admin to anyone who knows an admin email. "Staff full access" policies let any signed-in user read/edit all shipments, bookings, inquiries, audit logs.
- **Drift:** live history has 12 migrations; 6 repo files missing; 20260924 never applied (4 tables absent, anon inserts still open). Live has 30 tables.
- **Next:** owner approval for fix migrations; rest of Phase 1 (secrets, server.js, Edge Functions) not started.

### 2026-10-23 - QA pack Phase 0: baseline + inventory (Claude Code, read-only)
- **Done:** backup `production_project_backups/2026-10-23_16-33-42`; copied QA pack `files (10)/*` to `docs/qa/`; wrote `docs/qa/04_FINDINGS.md` (baseline, routes/services/tables/RPCs/migrations inventory, 15 findings). No source code changed. Live Supabase not queried.
- **Baseline:** typecheck 0 errors; eslint 0 errors / 303 warnings; vitest 29 files 209/209; build + prerender 65 pages (Globe3D chunk >500 KB warning); budget pass (but only measures the 2 KB entry); seo:check pass, 2 warnings.
- **Top findings:** public booking/inquiry/job forms insert with the anon key, but repo migration 20260924 blocks anon inserts (repo vs live drift; forms break if it is applied); Turnstile token never verified; live-only blogs ALL-true policy; "staff" policies = any signed-in user.
- **Needs owner:** dev Supabase project or read-only live access; FIX_LIST decisions 1-6; OK to move `prompt.md`/zip. **Next:** Phase 1 (security), not started.

### 2026-10-23 - Profile page for every signed-in user + mobile header (Claude Code)
- **Done:** `/profile` (`pages/ProfilePage.tsx`, `services/accountService.ts`) shows photo, name, phone, email, member-since and order counts for any signed-in user; `/reseller` redirects to it. Header: Sign in button (signed out), Profile link in Account menu, compact tap targets at 360px. Replaced the earlier reseller-only page/service.
- **Applied to live Supabase (project xtipmcthdyyubohspjro):** `20261024` staff profiles, `20261025` reseller referral, `20261026` `get_my_account_profile()` (authenticated only). Repo files match.
- **Pushed:** origin/main c54f6d1 then a61f23e (no force). **Verified:** tsc, 209/209 tests, build + prerender, header at 360px. **Not verified:** signed-in flows on live.

### 2026-10-23 - Safer user actions, reseller profile + referral, share image, backup.bat (Claude Code, local only)
- **Done:** `backup.bat` + CLAUDE.md backup/cleanup rules. `og-banner.png` replaced (1200x630, letterboxed) and og:image size/alt tags in `scripts/prerender.mjs`. `UsersTab`: inline role dropdown removed (role changes only in `PersonDialog`, type-email confirm), Pause has a confirm dialog, Remove needs the typed email, reseller rows show order counts. New `/reseller` page (`ResellerProfilePage`, `services/resellerService.ts`) linked from the Account menu for resellers. Shipment editor has "Referred by" (Independent or an active reseller); `reseller_id` is only sent when set, so saving works before the migration.
- **Migration DRAFT, NOT applied:** `supabase/migrations/20261025000000_reseller_referral.sql` (`shipments.reseller_id`, `get_my_reseller_profile()`, `get_reseller_stats()`). Needs `20261024` applied first. Completed = status delivered; this month = Asia/Kathmandu calendar month.
- **Verified:** tsc clean, 209/209 tests, vite build. **Not verified:** browser flows (Google sign-in), SQL on a real database.

Older entries: `docs/archive/AI_WORKLOG_ARCHIVE.md`.

## Current baseline (2026-10-12)
- Project archive reviewed structurally; no application changes have been made as part of this workflow setup.
- Stack from `package.json`: React 19, TypeScript, Vite 8, React Router 7, Supabase JS, Tailwind CSS 4, Framer Motion.
- Available package scripts: `dev`, `build`, `start`, `preview`, `typecheck`, `lint`, `test`.
- `lint` currently runs `tsc --noEmit`; it is not a dedicated ESLint/formatting pass.
- Existing test files: `tests/rates.test.ts`, `tests/security.test.ts`, `tests/tracking.test.ts`.
- Project contains `.env.example` and an `.env` file was present in the supplied archive. The safe setup package excludes `.env`; retain real credentials only in a local untracked `.env` or deployment secret manager. If the archived `.env` contained real keys and was shared beyond a trusted environment, rotate those credentials.
- No test/build commands were run during this documentation setup. Baseline test status is unknown.

## Newest task entry template
### YYYY-MM-DD — Short task title
- **Request / acceptance:** ...
- **Evidence / root cause:** ...
- **Changed:** ...
- **Checks:** `command` — PASS/FAIL/NOT RUN (short reason).
- **Manual test:** ...
- **Deployment / rollback:** ...
- **Next step / open risk:** ...
