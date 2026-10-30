# AI Project Worklog

Purpose: durable, low-token project memory for coding-agent sessions. Keep entries concise and factual. Newest entry goes first. Never store secrets, personal data, or raw environment files.


## 2026-10-30 Network-driven loading (no fixed loading screen)
- Removed the #bc-boot overlay, src/boot/*, RouteLoader and tests/boot-progress.test.ts. index.html now has a static #bc-shell skeleton that fades in only after 500ms and is removed on React's first commit; if the entry script fails or 15s pass it shows a Reload message.
- Route Suspense fallback is RouteSkeleton (shape chosen by routeSkeletonKind) behind a keyed RouteErrorBoundary; skeletons wait 300ms before showing (SkeletonGroup). Page spinners/"Loading..." text replaced with skeletons; LoadingState is now skeleton rows.
- Fewer requests: blog list and public careers cached 60s and shared; estimator queries run in parallel; AuthContext skips the duplicate INITIAL_SESSION run.
- Checked on the production build (port 3100, port 3000 held by another session): warm cache shows no skeleton on 12 routes; slow/flaky runs and a blocked entry script behave. tests/loading-shell.test.ts added.
- 5 new migrations (user_roles super_admin-only + last-super-admin guard, server-set audit actor, shipment/tracking audit triggers, public insert defaults + per-email flood limit, notifications by role). Verified in rolled-back transactions, then APPLIED to live on owner approval (22/22 post-apply checks pass). Client shipment audit calls removed (triggers replace them). tests/security-phase1.test.ts added.

## 2026-10-30 Design foundation (brand #0B2D63 / #F2B632)
- tokens.css rebuilt: new ox/gd scales, navy-tinted text, status + shipment-stage tokens, type/layout/radius/z tokens, .container-page/.section-y/.code-text. All #002147/#F2B705 hex in src, index.html, manifest, scripts replaced (bracket classes -> bg-ox-900 etc.). contrast-check synced, 32/32 pass.
- Primitives: Button sentence case + same-colour hover; Input/Select/Textarea unified; all-caps removed from primitive labels; new Badge, StatusBadge(stageOf), Container/Section/PageHeader, Spinner/LoadingState/ErrorState. Deleted unused components/ui Button/Card/Input/Textarea/Dialog.
- Fixed: .clay-inset border-color and an unlayered input bg rule were overriding component classes (error borders never showed, field fills ignored).
- Brand images: og-banner re-shot from the current homepage on #0B2D63, icon-maskable = logo on #0B2D63 (rendered with Playwright; generate-brand-images.mjs NOT used, it draws placeholder shapes over the real logo). SW cache bumped to v4.
- Not done: page-level all-caps labels remain until each page is redesigned.

## 2026-10-30 QA gap pass (browser-verified)
- Booking: full 4-step flow with worst-case data to review at 360px + desktop, no overflow; not submitted (would write live). Pickup City got maxLength 120. Step change now moves focus to the new step heading (was dropped to body).
- Contact + Partner: maxLength on all free-text fields (name 120, company 160, email 254, phone 30, url 300, message 2000); long-input visuals OK at 360 + desktop.
- Network: tracking RPC 15s timeout -> "not reachable" state (was infinite loading); rates edge fn + cache query 10s timeouts -> hero shows "rates not available" (was infinite placeholder). Verified via Playwright context.route (page.route misses SW-proxied requests).
- Prod build served by server.js: /track?fixture=* shows normal empty state, no fixture data in loaded JS.
## 2026-10-30 Break-UI pass
- Dev-only worst-case fixtures: src/dev/trackingFixtures.ts, /track?fixture=demo|worst|empty (import.meta.env.DEV; not in dist). Regression test in tests/tracking-ui.test.ts.
- Fixed: tracking route row overflow (stacked From/mode/To on phones), unbreakable tracking number, status pill blob + empty pill, date-only checkpoint shown with invented 05:45, raw invalid lastUpdated, empty ETA/meta lines, error echo of long input (+ maxLength 64); hero weight field clamped per keystroke (clear+type 3 gave 0.53) -> clamp on blur; booking review long values + maxLength on free-text fields; Nepali headings line-height 1.3; skip-to-content link.
- Checks: tsc, vitest 282/282, build+prerender 65, seo-check, css-vars.

## 2026-10-30 Mobile UX audit (mobile-native)
- Swept 18 public routes at 360/768 (overflow, touch targets, input sizes) and 15 at 430 (overflow). No horizontal overflow at any width.
- Fixed: touch inputs < 16px at >=640px (iOS zoom) via pointer-coarse rule; Button sm drops to 38px only with a fine pointer; 44px touch targets for guide lang/breadcrumb, LimitedText toggle, chatbot chips, policies email, tracking Book link; overlays vh->dvh (BottomSheet, Dialog, shipment editor modal); safe-area top on fixed header + main + mobile menu, bottom on sheet content; floating bars hide while a field is focused on touch; hero route line wraps long names (UAE was truncated); tracking inputs enterKeyHint=search, autocapitalize characters; policies email info@thebccargo.com -> BUSINESS.email.
- Flagged, not changed: billing/print.ts company email info@thebccargo.com; FAQ category "Delivery across Nepal" (DB content).
- tests/sticky-buttons.test.ts fails on bottom-20: StickyContactButtons changed to a safe-area calc before this session (see backup 2026-10-30_00-06-44), not by this pass.

## 2026-10-29 Motion/interaction pass (apple-design)
- BottomSheet: drag-to-dismiss on handle/title (1:1 pointer tracking from live position, momentum projection, rubber-band upward, settle/exit same path, backdrop follows); imperative positioning so renders never fight gestures; exit animation; no rAF dependency.
- Header: More/account dropdowns + mobile menu stay mounted with reversible CSS transitions (origin at trigger, inert when closed); press feedback on nav items/rows.
- Global touch-action: manipulation; tracking checkpoints/rail reveal in order; design/useTweenedNumber for hero + estimator totals (interruptible, skips first value, sr-only final). Reduced motion: global rule + explicit fallbacks.
- Checks: tsc, vitest 281/281, build+prerender 65, seo-check; browser drag test 390px.

## 2026-10-29 Redesign phase 6: admin/account pass
- index.css @theme: Tailwind slate-50..950 -> ink scale (warm greys; contrast up, e.g. 500 on white 4.76 -> 5.51), radius lg/xl/2xl/3xl -> 12/16/20/28 token scale. Affects admin (523 slate uses) and booking. No admin component code changed.
- Admin not visually checked: needs Google sign-in. Verified /admin, /admin/login, /profile still redirect to /login when signed out.
- Checks: tsc, vitest 281/281, build+prerender 65, seo-check, check-css-vars.

## 2026-10-29 Redesign phase 5: content pages
- Cta3D flattened site-wide (cta3d.css; dead tilt/edge/shine code removed). Blog list, FAQ, Careers, Policies headers moved to SectionHeading classes.
- Claims removed: FAQ in-house ASYCUDA team, TIA packaging stations/e-seal, ECTS seals, regional logistics counters (pickup answer now from estimator/pickup.ts); country landing "certified on electronic scales / IATA", UK "certified compliance", USA "FDA prior notice". About page kept (real team + story).
- Checks: tsc, vitest 281/281, build+prerender 65, seo-check, check-css-vars; one h1 and no overflow on 6 content routes.

## 2026-10-29 Redesign phase 4: core journeys
- Tracking: new UI (empty/loading/invalid/not-found/unavailable/result), timeline from real milestones only; trackingService adds `reason` and stops faking lastUpdated; public page no longer shows the service placeholders (15 kg, "Logistics Hub") or prints a waybill from them. New tests/tracking-ui.test.ts (SSR render).
- Services catalog rewritten to plain checkable copy (removed GPS, E-seal, tonnage, pallets, Birgunj team, bonded storage, direct links, ASYCUDA, legal tenders); CargoJourney steps and Hong Kong "direct flights" softened; homepage service cards drop "every country"/"licensed agents".
- Rates + Contact use SectionHeading; Contact gets Call/WhatsApp primary actions. How to ship left as is.
- Owner to confirm: How-to-ship says meat Europe-only but engine also allows UK/Hong Kong.
- Checks: tsc, vitest 281/281, build+prerender 65, seo-check; browser 390/1440.

## 2026-10-29 Redesign phase 3: homepage
- New HomeHero (replaces RouteTableHero/RouteJourney/DestinationPanel, deleted): headline, track field, live quote card (country guide list + useGuideRates + calculateSheetShipmentQuote; same total as /rates). Benefits strip (claims backed elsewhere only), order hero > benefits > destinations > how it works > services > assistant > blog > FAQ > reviews > light final CTA.
- Added primitives/SectionHeading. Fixed: App.handleQuickTrack now navigates /track?awb=<code> so quick-track runs the lookup (was dropping the code).
- Checks: tsc, vitest 279/279, build+prerender 65, seo-check, bundle budget; browser 390/1440, quote = /rates total (Rs 6,400 Korea 5 kg), track not-found state.

## 2026-10-29 Redesign phase 2: shell
- Header: nav Home/Rates/Services/Track/Destinations(/blogs)/How to ship/About + More; "Get a quote" CTA (/rates); new mobile/tablet menu (<xl) with Escape/outside-click/route close. Footer: navy, crawlable <Link>s, contacts from business.ts. Bottom nav: About->Track, tokens.
- Removed unverified licence claims everywhere (B-409, IATA/CAAN/TEPC, "Authorized Carrier", footer "Government Authorized"); ServiceCompare "Licences" row and HERO_METRICS dropped; copy-limits test now guards against their return.
- Checks: tsc, vitest 279/279, build+prerender 65, seo-check pass; browser 360/390/1440 no overflow.

## 2026-10-29 Redesign phase 0-1
- Removed PartnerSlider (unproven carrier logos), dead initialData.ts (fake hubs/SLAs), placeholder job postings, and careers fake-success fallback; tests updated to assert honest behaviour.
- tokens.css: warm ivory canvas, soft flat cards (clay insets removed), radius md 20 / lg 28, spacing scale tokens. Checks: tsc, vitest 279/279, build+prerender 65 pages.

## Latest Entry

### 2026-10-29 - apple-design page pass: plain copy, fewer mono labels, touch targets (local, not pushed)
- Mono font removed from UI labels/buttons (kept for data: tracking numbers, addresses, weights) on Header, home, blogs, booking, tracking, FAQ, country pages, careers detail, policies, login.
- Plain-language copy: /track hero, /book hero, policies §3 (no internal RPC name), login footer (no vendor/RBAC text), access-check loader.
- Touch targets via `pointer-coarse:` on footer links, CargoJourney segments, FAQ pills, blog "Read Guide".
- Live Supabase how-to-ship content has a corrupted Korean word (고यु부호); repo default is correct; not changed.
- Checks: typecheck clean, 279 tests pass. Admin pages not restyled.

### 2026-10-29 - apple-design pass, global CSS only (local, not pushed)
- `src/index.css`: instant `:active` press feedback on touch (`hover: none`) for interactive cards/buttons; `prefers-reduced-transparency` drops all `backdrop-blur*`; h4-h6 tracking -0.01em (h1-h3 stay -0.02em).
- Audit found reduced-motion already handled globally (tokens.css) and per component; no root `MotionConfig` added to keep framer-motion out of the entry chunk.
- Checks: vite build OK, dev on :3000 serves the new CSS. Not run: typecheck, vitest, prerender, visual light/dark and mobile review of each page. No git/Supabase changes.

### 2026-10-29 - Rate page: liquid per bottle, meat 800, medicine on request, share link (pushed to origin main, 74e6d98)
- Engine: `LIQUID_FEE_PER_BOTTLE_NPR = 700` (input `liquidBottleCount`, default 1, max 999; result `liquidBottles`). Medicine has no fee: `medicineCharge` 0, `medicineOnRequest` flag, shown as "Contact us". `MEAT_FEE_EUROPE_UK_PER_KG = 800` (Hong Kong stays 1,100). Admin bill default liquid rate 700.
- RateEstimator: bottle stepper, medicine note, Share button. `src/features/estimator/share.ts` builds `/rates?dest&weight&liq&meat&med&pickup`, reads it back (clamped, pickup must be a known area), shares bill PDF + text + link via Web Share, falls back to copying to the clipboard.
- About: Ayush's duties rewritten as real IT-head work. Country landing copy updated to the new prices.
- Tests updated to the new prices; new `tests/share-quote.test.ts`. 279 pass, typecheck, build OK.
- Pushed 10 src files incl. `pickup.ts` (2026-10-23 free-area rule, user approved). Tests not pushed (origin test files are older). Exact tree verified in a temp worktree: vite build + prerender OK; tsc shows the same 40 pre-existing errors as origin (old AdminChatbotControl / chatbot.test on origin), none new.

### 2026-10-29 - Homepage section reorder (pushed to amnaryal78/thebccargo main, 2e10146)
- Order: hero, where can we ship, assistant, shipping guide (HowItWorksTimeline), blog, services, carriers, FAQ, reviews, CTA.
- `HomeCountryGuides` split out of `BlogSection.tsx`; blog heading now "Latest from our blog". Steps are separated cards. `divide-y` lines between home sections. Assistant wrapper reserves height (IdleMount, mid-page).
- Checks: typecheck, build+prerender, 275 tests pass. Pushed 4 files via plumbing on origin/main (no force).

### 2026-10-28 - Assistant rebuilt: server gate + real services (local only, not pushed)
- New `server/ai/` (config, domainGuard, intentRouter, openrouterClient, responseGenerator, chatHandler, rateLimit); `server.js` /api/chat is now a thin wrapper with its own 20/min/IP limit. Dockerfile copies `server/`.
- Flow: server gates scope + extracts intent -> browser runs real services (`chatbotTools.ts`: rates + estimator engine, tracking RPC, how-to-ship, services catalog, BUSINESS) -> server words the facts with OpenRouter free models and validates numbers/emails against the facts.
- Models via `OPENROUTER_PRIMARY_MODEL` / `OPENROUTER_FALLBACK_MODELS` (free only). Local .env `DEFAULT_AI_MODEL` still overrides the primary. OpenRouter key is on the free tier (no credits): daily free-model cap applies.
- Removed `chatbotData.ts`, admin-less localStorage rules/knowledge/tools, hardcoded prompt facts. Exported `COUNTRY_NAME_ALIASES` from engine.ts (additive). Engine substring quirk ("ukraine" matches UK) is guarded in `resolveDestination`, engine unchanged.
- Tests: `tests/ai-server.test.ts`, rewritten `tests/chatbot.test.ts`, updated `tests/server-hardening.test.ts`.

### 2026-10-28 - Chatbot made real AI (pushed to origin/main 8825866)
- Removed keyword-canned answers (meat/pickup/booking/rates/contact) from `chatbotService.ts` and `server.js`; facts live in the system prompt. Scope check is now a blocklist only.
- Price questions: model replies with a `get_quote` JSON request, `server.js` returns `toolCall`, browser runs `runQuoteTool` (live rates + `calculateSheetShipmentQuote`), calls `/api/chat` again with `toolResult`.
- AI down / no key -> honest "not available" reply. Client no longer calls the undeployed `chat` edge function (its file is unchanged and still has old shortcuts).
- Needs `OPENROUTER_API_KEY` set on the Render service behind `/api/*`.

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
