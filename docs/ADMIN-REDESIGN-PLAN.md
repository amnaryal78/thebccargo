# Admin redesign plan

Branch `admin-redesign`, checkpoint `5e43b9a` (2026-10-30). Source of truth for the `/admin/*` redesign.
Evidence: source traced in `src/features/admin`, `src/pages/admin`, `src/context`, `src/services`, `src/lib`, `supabase/`; live Supabase (`xtipmcthdyyubohspjro`) read with SELECT-only queries on policies, functions, columns, FKs, triggers, indexes, migrations, edge functions. Nothing written to the database.
Full narrative report: https://claude.ai/artifact/GywbnvX8i3w1uFpXvyPmdv

Status: **audit done, no implementation.** Each phase below stops for approval.

---

## 1. Current architecture

- **Entry:** `App.tsx` `/admin/*` → `ProtectedRoute` → `AuthContext.evaluateAuthorization` → RPC `check_admin_authorization`, which reads `user_roles` by `auth.uid()`, then by JWT email, and links `user_id` on first sign-in. Resellers are excluded (`AuthContext.tsx:55`). Sign-in is Google only (7 Google identities live, 0 unconfirmed).
- **Shell:** `features/admin/shell/AdminShell.tsx`: sidebar in 4 groups, mobile top bar and 5-tab bottom bar, `NotificationBell`, chat count polled every 60s and on route change.
- **Routes:** `pages/admin/AdminDashboardPage.tsx`. 15 child routes, **none permission-gated**.
- **Browser permissions:** `features/admin/types.ts` `getRolePermissions(role)` gives 12 flags, merged with custom roles (`mergePermissions`) via `usePermissions.ts`. These only hide menu items and buttons.
- **Database permissions:** RLS uses
  - `is_active_staff()` (any active non-reseller) to read
  - `has_staff_role(text[])` to write
  - `is_admin()` (super_admin, admin)
  - `is_super_admin()`
  - `is_message_staff()` (super_admin, admin, operations, support)

  All are `SECURITY DEFINER` with `search_path=public`, and all match on `user_id = auth.uid() OR lower(email) = jwt email`. **None read custom roles.**
- **Data layer:** `features/admin/services/adminDataService.ts` (673 lines). These bypass it:
  - `bookings/BookingsTab.tsx`
  - `feedback/FeedbackTab.tsx`
  - `notifications/notificationService.ts`
  - `services/chatService.ts` (shared with the public site)
- **Live schema notes:**
  - `audit_logs(id, actor_email text, action, target_entity, metadata jsonb, created_at)` has no actor id and no entity id.
  - `shipment_milestones.timestamp` is **text**, not a timestamp.
  - `shipment_milestones → shipments` is `ON DELETE CASCADE`.
  - `shipments.reseller_id → user_roles`.
  - Triggers: `notify_admin_on_submission` on bookings, inquiries, job_applications and reviews; `force_review_pending` on reviews; `chat_touch_thread`. There are no audit or `updated_at` triggers.
- **Live volumes:** 3 shipments (all `pending`), 11 `international_rates` rows, 6 `user_roles` rows (2 super_admin, 1 admin, 1 editor, 2 reseller), 26 audit rows.
- **Edge functions live:** only `rates` (`verify_jwt=false`). In the repo but not deployed: `submit-booking`, `submit-inquiry` and `submit-job-application` (these do Turnstile `siteverify`), `chat`, `bc-cargo-chat`, `generate-awb`, `create-signed-file-url`, `process-shipment-notification`.
- **Migrations:** live has 15 applied (named differently from repo files). Repo `20261029000000_account_location.sql` is **not applied** (see section 6, U1).

## 2. Current route map

| Route | Component | Purpose | Menu flag | Data | Main problems |
|---|---|---|---|---|---|
| `/admin` | `overview/AdminOverviewTab` | Totals + recent lists | none | 4 full-table selects + all shipments + all inquiries | Downloads whole tables to count; counts dormant `national_rates`; no bookings/chats |
| `/admin/shipments` | `shipments/ShipmentsTab` | List, search, delete, add tracking update | none | `select *` incl. `bill` JSON, no paging | `confirm()` delete; tracking in a modal; client-side search |
| `/admin/shipments/:id` (`new`) | `shipments/ShipmentEditorPage` (1,077 lines) | Bill editor | `canManageShipments` for edit | row + `bill` | last-write-wins; bill no = tracking no; mode fixed `air` |
| `/admin/bookings` | `bookings/BookingsTab` | Website pickup requests | none | direct `supabase.from('bookings')` | no detail, no convert, no audit |
| `/admin/notifications` | `notifications/NotificationsTab` | Feed | none | `notifications` | RLS lets only super_admin/admin read → empty for others |
| `/admin/messages` | `features/messages/MessagesInbox` | Customer chat | none | `chat_*` | polling |
| `/admin/inquiries` | `inquiries/InquiriesTab` | Contact + partner forms | none | `inquiries` | mixed types, `confirm()` |
| `/admin/feedback` | `feedback/FeedbackTab` | Approve reviews | none | direct `supabase.from('reviews')` | no audit |
| `/admin/rates` | `rates/RatesTab`, `CsvImporterSection`, `SheetRatesGrid` | Legacy rates, CSV, live sheet view | `canManageRates` | `international_rates`, sheet | edits fallback only; unsafe CSV |
| `/admin/handling-rules` | `handling-rules/HandlingRulesTab` | Liquids/food/restricted rules | `canManageHandlingRules` | `handling_rules` | table only |
| `/admin/how-to-ship` | `how-to-ship/HowToShipAdminTab` | Public guide | `canManageHowToShip` | `how_to_ship` | — |
| `/admin/blogs` | `blogs/BlogsTab`, `BlogEditorModal` | Posts + AI fixer | `canManageBlogs` | `blogs`, `/api/fix-blog` | 5 browser dialogs |
| `/admin/careers` | `careers/CareersTab` | Jobs + applicants | `canManageCareers` | `careers`, `job_applications` | 4 browser dialogs |
| `/admin/users` | `users/UsersTab`, `PersonDialog`, `CustomRolesPanel`, `RequestsPanel` | Staff, roles, requests | `canManageUsers` | `user_roles`, `admin_roles`, `user_role_assignments` | role escalation (F1) |
| `/admin/profile` | `users/MyProfilePage` | Own profile, change requests | none | `profile_change_requests`, storage `admin-avatars` | — |
| `/admin/audit` | `audit/AuditLogTab` | Audit viewer | `canViewAuditLogs` | `audit_logs` | read_only gets nothing |

## 3. Current permission map (browser flags, `types.ts`)

| Flag | super_admin | admin | operations | editor | support | read_only | reseller |
|---|---|---|---|---|---|---|---|
| canManageShipments / Milestones | ✓ | ✓ | ✓ | – | – | – | – |
| canManageInquiries | ✓ | ✓ | ✓ | – | ✓ | – | – |
| canManageHandlingRules / Rates | ✓ | ✓ | – | – | – | – | – |
| canManageBlogs / HowToShip / Careers | ✓ | ✓ | – | ✓ | – | – | – |
| canManageUsers | ✓ | – | – | – | – | – | – |
| canManageSettings | ✓ | ✓ | – | – | – | – | – |
| canViewAuditLogs | ✓ | ✓ | ✓ | – | – | ✓ | – |
| isReadOnly | – | – | – | – | – | ✓ | ✓ |

Custom roles: any flag set in any assigned `admin_roles.permissions` is OR-ed in (browser only).

## 4. Current database authorization (live `pg_policies`)

| Table | Read | Write |
|---|---|---|
| shipments, shipment_milestones | active staff | super_admin, admin, operations |
| bookings, inquiries, reviews | active staff | super_admin, admin, operations, support |
| bookings, inquiries, job_applications, reviews (public) | – | **anon INSERT `WITH CHECK true`** |
| blogs, careers, services, faqs, policies, partners | active staff + public if published | super_admin, admin, editor |
| job_applications | super_admin, admin, editor | same |
| how_to_ship | public if published | super_admin, admin, editor (via `is_admin()` OR inline role check) |
| international_rates, national_rates, handling_rules, rate_settings, site_settings | public | super_admin, admin |
| sheet_rates_cache | public | none for clients (edge function uses service role) |
| item_catalog | active staff | **active staff incl. read_only** |
| audit_logs | super_admin, admin, operations, `analyst` | **INSERT: any active staff, any content**; no UPDATE/DELETE |
| notifications | **is_admin() only** | UPDATE/DELETE is_admin(); INSERT by trigger |
| **user_roles** | own row; | **ALL: `is_admin()` = super_admin AND admin** ← F1 |
| admin_roles, user_role_assignments | active staff / own | super_admin |
| profile_change_requests | own + super_admin | insert own pending; decide super_admin |
| chat_threads/messages, customer_messages | own + message staff | own / message staff |

Mismatches between browser flags and the database:
- **admin can manage users in the database but not in the UI** (F1).
- **read_only:** the UI shows the audit log, but the database denies it.
- **operations and support:** no notifications in the database.
- **custom roles:** the UI grants them, but the database ignores them.
- **bookings and feedback:** these screens have no gate in the UI. The database allows support to write, so it is consistent today, but only by accident.
- **editor on how-to-ship:** consistent (the earlier audit said it was a mismatch; this was wrong and is corrected here).

## 5. Business-critical logic (preserve)

- **Bill pricing:**
  - `shipments/billing/model.ts`: `computeBill`, box/liquid rates, `BOX_LIMIT_KG`, `generateBillNo`, `validateBill`
  - `billing/issues.ts`: blocking problems and warnings
- **Bill persistence:** `billing/persist.ts`: `toShipmentRow` / `fromShipmentRow` (versioned `bill` JSON, `BILL_SCHEMA_VERSION=1`; must keep reopening old rows).
- **Printing:** `billing/print.ts` (customer-facing layout).
- **Public tracking:**
  - RPC `get_public_shipment` (anon; returns no personal data; used by the planned Android app)
  - `services/trackingService.ts` `mapStatus`
- **Website pricing:** `features/estimator/engine.ts` + `services/ratesService.ts`.
  - Primary source: the Google Sheet via the `rates` edge function.
  - Fallback: `sheet_rates_cache`, then localStorage, then `international_rates` (legacy) in the estimator.
- **Notifications:** DB trigger `notify_admin_on_submission`.
- **Item catalogue learning:** RPC `record_item_usage`.
- **Reseller referral:** `shipments.reseller_id`, RPC `get_reseller_stats`.

## 6. Security risks

| ID | Risk | Level | Phase |
|---|---|---|---|
| F1 | `admin` can write `user_roles` (self-promote to super_admin, add/remove staff) | CRITICAL | 1 |
| F2 | Audit log forgeable (`actor_email` from browser, any staff inserts any row), fails silently, misses most actions | HIGH | 1 |
| F3 | Public INSERT accepts any `status`/fields on bookings, inquiries, job_applications; Turnstile token dropped client-side, verifying edge functions not deployed | HIGH | 1 |
| F4 | Every staff role (incl. editor, read_only) reads all customer personal data | MEDIUM | 2 (document) / later |
| F5 | Admin routes not gated | MEDIUM | 2 |
| F6 | Tracking numbers guessable (676 combinations/day, anon RPC, no rate limit; no personal data exposed) | MEDIUM | 5 |
| F7 | Staff matched by email too; safe only while Google is the sole provider. **VERIFY in Supabase dashboard:** Email and Anonymous providers disabled | MEDIUM | 1 (verify) |
| F8 | `item_catalog` writable by read_only | LOW | 2 |
| F9 | `is_admin()` executable by anon (returns false) | LOW | 1 |
| F10 | Session token only obfuscated (`secureStorage` XOR) | LOW | not planned |

Unrelated bugs found (record, do not fix in this branch unless blocking):
- **U1:** `20261029000000_account_location.sql` is not applied live, but `services/accountService.ts` reads `account_profiles`, so customer location save/load fails in production.
- **U2:** `trackingService.mapStatus` shows `cancelled` as "Order Placed" (fixed in phase 5, per brief).
- **U3:** Duplicate indexes: `bookings.booking_ref` and `shipments.tracking_number` each have two.
- **U4:** `billing/print.ts` uses `info@thebccargo.com` (flagged earlier; owner to confirm).

## 7. UX problems

- No "what needs me now" view.
- The shipment is split across screens: bill in the editor, tracking in a list modal, history in the global audit.
- Status (6 values) and tracking updates are unrelated.
- "Rates & CSV" edits a fallback the website rarely uses.
- 21 browser dialogs:
  - Blogs 5, Careers 4, Shipments list 3, Inquiries 2, Rates 2, Editor 2
  - Feedback, Handling rules, How-to-ship: 1 each
- 0 of 31 admin screens use `src/design/primitives`.
- 8 tables have no phone layout: audit, blogs, careers, handling rules, rates, CSV preview, sheet grid, (print).
- 134 all-caps labels, 58 raw colour codes, 64× 10px and 2× 9px text.
- Raw database errors are shown to staff.
- Mobile bottom bar buries Bookings.

## 8. Performance problems

1. The overview downloads 6 tables in full to count rows and show 5 items. Use `get_admin_dashboard_metrics` (exists, staff-only).
2. The shipment list uses `select *` including `bill` JSON, with no paging or server search.
3. Polling: notifications every 60s, chats every 60s and on route change. Fine at today's volume.
4. `ShipmentEditorPage` runs `structuredClone` of the draft on every change, plus Framer Motion. Acceptable now; it splits naturally in phase 5.
5. Missing indexes:
   - `audit_logs(created_at)`
   - `shipments(created_at)` for paging
   - `shipments(status, updated_at)` for "no update in 3 days"

## 9. Components that can be reused

`src/design/primitives`:
- **Controls:** Button, Input, Select, Textarea, Toggle, Chip, Tabs, Accordion, Card
- **Status:** Badge, StatusBadge (+`stageOf`)
- **Layout:** Container/Section/PageHeader, SectionHeading
- **States:** Spinner/LoadingState, Skeleton, EmptyState, ErrorState
- **Overlays:** Modal, BottomSheet, Toast
- **Progress:** Stepper, Timeline, Counter

Admin pieces worth keeping:
- `ShipmentMobileCard`
- `catalog/ItemNameInput` + `useItemCatalog`
- `NotificationBell`, `NotificationsContext`
- `users/Avatar`
- `billing/*`

## 10. Components that need extraction (create only these)

- **`AdminPage`:** header (title, one-line purpose, primary action) and width. Wraps `PageHeader`.
- **`AdminTable`:** columns config, loading/empty/error rows, sort, server paging, card layout under 768px. Replaces 12 hand tables.
- **`AdminFilterBar`:** search + filter chips; opens in a `BottomSheet` on phones.
- **`AdminConfirmDialog`:** on `Modal`; names the record and its consequence; optional typed confirmation. Replaces 21 browser dialogs.
- **`AdminPermissionGate`** + a route wrapper: reads the single permission source (section 12, phase 2).
- **`adminStatus.ts`:** one status→tone map per entity, rendered with the existing `Badge`/`StatusBadge` (no new component).

Not creating:
- `AdminCard` (Card)
- `AdminDrawer` (Modal on desktop, BottomSheet on phone, composed in place)
- `AdminFormSection` (a `<fieldset>` + heading pattern; extract only if repeated 3+ times)
- `AdminStatCard` (only the Today page uses it; keep it local)
- `AdminPageHeader` (part of `AdminPage`)

The brief allows these; I'm skipping them to avoid component proliferation.

## 11. Files that must not be modified (without explicit reason, stated in the phase report)

- `src/features/admin/shipments/billing/model.ts`, `issues.ts`, `persist.ts`, `print.ts`
- `src/features/estimator/engine.ts`, `src/services/ratesService.ts`, `supabase/functions/rates/*`
- RPC `get_public_shipment` (definition)
- `src/lib/supabase.ts`, `src/lib/secureStorage.ts`, `src/components/ProtectedRoute.tsx`
- Every file in `supabase/migrations/` that exists today (new migrations only)

## 12. Proposed implementation phases

Each phase ends with a report (completed, files, database changes, tests, preserved logic, risks, remaining, screens) and **stops for approval**. No live database change without showing the SQL first.

### Phase 1: Security (database)
New migrations, one concern each, so a failure is isolated:
1. `user_roles_super_admin_only`
   - Drop `Admins manage user roles`.
   - `INSERT/UPDATE/DELETE` only `is_super_admin()`.
   - Keep `SELECT` for own row + `is_admin()`.
   - Add a trigger refusing to deactivate or demote the last active super_admin.

   Risk: MEDIUM.
2. `audit_logs_server_actor`
   - Add `actor_id uuid default auth.uid()`, `entity_id text`.
   - `BEFORE INSERT` trigger overwrites `actor_id`/`actor_email` from `auth.uid()`/JWT, so the client can't impersonate.
   - Add a `created_at` index.
   - Client `logAction` keeps working.

   Risk: LOW.
3. `audit_triggers_shipments`
   - `AFTER INSERT/UPDATE/DELETE` audit trigger on `shipments` and `shipment_milestones` only, with changed column names (no personal-data values).
   - Other tables follow in later phases, one per migration.

   Risk: HIGH (blocks saves if broken). Test before and after on a branch database.
4. `public_insert_defaults`
   - `BEFORE INSERT` triggers on `bookings`, `inquiries`, `job_applications`: for non-staff, force `status` to the initial value, null staff-only fields (`internal_notes`), and set `created_at = now()`.
   - Mirrors the existing `force_review_pending`.

   Risk: MEDIUM.
5. `notifications_visibility`: `SELECT/UPDATE` for `is_message_staff()` plus editor for `job_application` kind. Risk: LOW.
6. Revoke anon `EXECUTE` on `is_admin()`. Risk: LOW.

Bot protection: deploy `submit-booking`/`submit-inquiry`/`submit-job-application` and switch the client to them, **or** keep direct inserts + triggers + a database rate limit (per email per hour).
- **Decision needed.** Deploying functions needs the `TURNSTILE_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` secrets set by you.

### Phase 2: Permissions
- One permission source: a `get_my_admin_access` RPC (exists) returns flags computed from the same role lists the policies use. `types.ts` becomes a fallback only.
- `AdminPermissionGate` + route wrapper on all 15 routes.
- Fix read_only/audit (give read_only audit read in the database, or drop the flag), item_catalog write to shipping staff.
- **Custom roles: propose removal.** Making RLS honour them means a `has_permission(key)` function across ~20 policies for 6 staff, so it's not justified. Removal keeps the tables (data intact) and hides the panel. **Decision needed.**

### Phase 3: Foundation
Shell (sidebar ≤ 240px, groups per section 8 of the brief, breadcrumbs on detail pages, global search box, profile menu, mobile bar Today / Requests / Shipments / Search / More) + section 10 components. No data changes.

### Phase 4: Today
Extend `get_admin_dashboard_metrics` (new migration) with:
- the needs-action counts
- today's activity from `audit_logs`
- pricing health from `sheet_rates_cache.updated_at`

One call. Every tile links to a filtered list.

### Phase 5: Shipments
- **List:** narrow column select, server paging, search, filters and sort (`range()` + `ilike`/`or`), new indexes.
- **Detail** with Overview / Bill / Tracking / History tabs.
- **Bill editor** restructured into sections (the brief asks for a 7-step wizard; see the decision below), with `model.ts` untouched.
- **Version-checked save:** `.update(...).eq('updated_at', loaded)` returns 0 rows on conflict, which shows the conflict dialog.
- **Tracking timeline** inside the shipment: stage list, edit, back-date, order by a parsed timestamp. Needs a migration adding `occurred_at timestamptz` + `stage`, backfilled from text `timestamp`; `get_public_shipment` keeps its output shape.
- **`mapStatus`:** add `cancelled`.
- **Tracking numbers:** keep `generateBillNo` for now, add a retry on unique conflict. Database-generated numbers are deferred (HIGH; printed bills and Android depend on the format). **Decision needed.**

### Phase 6: Requests
- Inbox over bookings, inquiries (incl. partner), chats.
- Booking → shipment RPC `convert_booking_to_shipment(booking_id)`:
  - one transaction
  - adds `shipments.booking_id uuid null`
  - sets the booking to `converted`
- Reviews stay a separate tab.

### Phase 7: Pricing
- Live sheet panel: source, last sync, row count, "Sync now".
- Fallback: proposal to **retire the `international_rates` CSV importer** and rely on the last-good `sheet_rates_cache` (already the second fallback).
  - If you keep it: a real CSV parser, all-or-nothing validation, an add/change/remove/unchanged preview, a transaction RPC, audit.
  - **Decision needed.**
- Handling rules restyled with confirm-before-save.
- Before/after quotes for 10 sample countries must match.

### Phase 8: Content and admin screens
Blogs, how-to-ship, careers and applicants, reviews, users, profile and audit moved onto the foundation. The remaining browser dialogs go here, and every table gets a phone layout.

### Phase 9: Final QA
Security, permission, mobile, accessibility, performance, routes, visual, RLS, public tracking, billing and pricing regression, done adversarially.

### Decisions needed before or during the phases

1. Bot protection: deploy edge functions (needs your secrets) or triggers + rate limit only.
2. Custom roles: remove (recommended) or make them database-enforced.
3. Shipment creation: sections on one page (recommended; less risk to billing) or a 7-step wizard.
4. Tracking numbers: keep the current format with a retry (recommended now) or database-generated for new shipments.
5. Fallback rates: retire the CSV importer (recommended) or rebuild it safely.
6. Requests: unified inbox (brief) or separate tabs with counts plus booking conversion (smaller).

## 13. Tests required for each phase

All phases: `node node_modules/typescript/bin/tsc --noEmit -p .`, `vitest run`, `eslint .`, `npm run build` (then `tests/prerender.test.ts`), `scripts/seo-check.mjs`.

| Phase | Additional tests |
|---|---|
| 1 | SQL policy tests run as each role via `set local role authenticated; set local request.jwt.claims = …` on a Supabase **branch** first: super_admin can insert/update/delete `user_roles`; admin, operations, support, editor and read_only cannot; last super_admin cannot be demoted; audit insert with a forged `actor_email` is stored with the real actor; anon booking with `status='confirmed'` is stored as `submitted`; real booking, inquiry and job application from the site still succeed; ops/support see notifications. Extend `tests/rls-lockdown.test.ts` for the migration text. |
| 2 | Unit: flags for each role equal the database role lists; route gate redirects per role; every hidden action has a matching RLS denial (one test per table). |
| 3 | Render tests: AdminTable (loading, empty, error, 360px cards, long tracking numbers), AdminConfirmDialog (Escape, focus restore), gate. Mobile pass 360/390/430/768. |
| 4 | Metrics RPC returns counts only and refuses non-staff; tiles link to the right filters; zero/one/many. |
| 5 | `tests/bill.test.ts`, `tests/shipment-bill.test.ts` unchanged and passing; the 3 live bills reopen with identical totals; print snapshot unchanged; conflict test; tracking order by time; public tracking output shape unchanged; `cancelled` wording. |
| 6 | Conversion copies fields, links both, rolls back fully on failure; notifications. |
| 7 | Quotes for 10 countries × 3 weights identical before/after; if CSV import stays: parser cases (quoted commas, blanks, bad numbers, duplicates, bad dates) rejected, never defaulted. |
| 8 | No `alert/confirm/prompt` left in `src/features/admin` (grep test); every table has a phone layout; keyboard pass. |
| 9 | Full adversarial pass across all of the above. |

---

## Phase 1 log (2026-10-30)

Migrations written, **not yet applied to live** (awaiting approval):
`20261030000001_user_roles_super_admin_only`, `…02_audit_logs_server_actor`, `…03_audit_shipments_trigger`, `…04_public_insert_defaults`, `…05_notifications_visibility`.

Tested on live inside a transaction that always rolls back (approved method). The script applies all five, runs 48 checks as test staff/anon, then raises to abort. A later read confirmed no test rows, policies or triggers persisted. Key results:
- **user_roles:** before the fix an admin could promote a user (rows=1). After it, admin, operations, support and editor all get 0 rows or an RLS error; super_admin can insert and update; demoting the last super_admin raises.
- **audit_logs:** a forged `actor_email` is stored as the real session email with `actor_id`; staff cannot UPDATE or DELETE.
- **shipments:** the trigger logs changed column names only; a no-op save is not logged; tracking adds are logged; editors are still blocked; `get_public_shipment` still works.
- **public forms:** anon `confirmed`/back-dated booking is stored `submitted`/now; inquiry `resolved` + notes is stored `new` with no notes; application `hired` is stored `received`; the 6th booking per email per hour is refused; staff keep full control.
- **notifications:** operations and support see bookings/inquiries; editor sees job applications, operations does not.

Decided during phase 1:
- **F9 dropped:** revoking anon EXECUTE on `is_admin()` would break anonymous reads of `how_to_ship` (its ALL policy targets `public` and calls `is_admin()`).
- **Bot protection** is a per-email flood limit only. Real Turnstile verification still needs the `submit-*` edge functions deployed with `TURNSTILE_SECRET_KEY` (owner action).
- **New finding for phase 2:** the `user_role` enum has no `read_only`; the UI role cannot exist in the database. Also the shipment editor's reseller picker reads `user_roles`, which only super_admin/admin can, so it is empty for operations (pre-existing).

**Applied to live 2026-10-30** (owner approved). Live history versions `20261029195052`–`20261029195127` (UTC stamps; repo files are `20261030000001`–`…05`). Post-apply role checks on live, in a rolled-back transaction, 22/22 as expected; no test rows left; 2 super_admins active.
