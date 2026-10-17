# Phase 0 Report — Baseline and Cleanup

## 1. Summary
Phase 0 established a verified, reliable, typechecked, and fully tested development baseline for **The BC Cargo & Courier** repository. All initial build, type, and test failures identified in the initial audit were diagnosed, root-caused, and resolved. Fake production shipments and mock MFA security backdoors were removed, and the 11 admin tabs were audited.

---

## 2. Initial Errors & Root Causes

| Error / Issue | Root Cause | Resolution |
|---|---|---|
| `'...-Courier\production_project\node_modules\.bin\' is not recognized` on `npm run typecheck` & `npm run lint` | The project path contains an ampersand (`&` in `The-BC-Cargo-&-Courier`). On Windows, npm calls `.bin\*.cmd` batch scripts without quotes around `%~dp0`, causing cmd.exe to split the command at the ampersand. | Updated `package.json` scripts (`typecheck`, `lint`, `test`) to invoke their entrypoints directly via `node node_modules/...`, matching the existing pattern in `dev` and `build`. |
| `Cannot find module 'node:fs'` (and `path`, `url`, `test`) in `tests/*.test.ts` during `tsc --noEmit` | `tsconfig.json` had `"types": ["vite/client"]`, which disabled default ambient `@types` discovery, preventing `@types/node` from loading. | Added `"node"` to `"types"` array in `tsconfig.json` (`"types": ["vite/client", "node"]`). |
| `ERR_MODULE_NOT_FOUND` in `tests/rates.test.ts` and `tests/tracking.test.ts` under `node --test` | Node's experimental native ESM runner requires explicit `.ts` extensions on relative imports (`../lib/supabase`), failing on bundler-style imports. | Migrated test runner to **Vitest 5**, adding `vitest.config.ts` with `@` path alias resolution. |
| Fake demo shipments in production | `App.tsx` imported `INITIAL_SHIPMENTS` and seeded `bc_cargo_shipments` into `localStorage`, presenting demo consignments as real shipments. | Removed `INITIAL_SHIPMENTS` seeding from `App.tsx`; tracking state initializes empty and queries only the real backend. |
| Hardcoded mock MFA secret | `authService.ts` returned hardcoded secret `JBSWY3DPEHPK3PXP` and bypassed verification for code `123456` when Supabase was unconfigured. | Removed mock secret and mock verification logic. Functions now return explicit errors when Supabase is not configured. |
| Admin failed to protect against unconfigured backend | Accessing admin without configured Supabase could silently stall or display empty states without explanation. | Added explicit hard-fail screen in `ProtectedRoute.tsx` informing operators that Supabase environment configuration (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) is required. |

---

## 3. Changes Made

1. **Git Repository Baseline:**
   - Initialized git repository.
   - Verified that `.env` and `.env.*` are excluded by `.gitignore` and `.dockerignore`.
   - Committed clean baseline (`50e8161`).

2. **Testing (Vitest):**
   - Installed `vitest` dev dependency.
   - Created `vitest.config.ts` configured for node environment with path aliases.
   - Migrated all three test suites: `tests/rates.test.ts`, `tests/security.test.ts`, and `tests/tracking.test.ts`.
   - Verified: **12 / 12 unit tests passing**.

3. **Tooling & Linting:**
   - Installed `eslint`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, and `prettier`.
   - Created `eslint.config.js` with TypeScript, React Hooks, and JSX a11y rules.
   - Created `.prettierrc`.
   - Applied auto-fixes across codebase; legacy style warnings marked for systematic resolution in upcoming feature phases.

4. **Security & Production Data Cleanup:**
   - `src/App.tsx`: Removed `INITIAL_SHIPMENTS` seeding into `localStorage`.
   - `src/components/TrackingSection.tsx`: Supported nullable initial shipment, guarded sample chips to only render if local user shipments exist.
   - `src/services/authService.ts`: Removed `mock-factor-id`, `JBSWY3DPEHPK3PXP`, and `123456` bypass.
   - `src/components/ProtectedRoute.tsx`: Added hard-fail screen when `!isSupabaseConfigured`.

5. **Architecture Scaffolding:**
   - Created directory structure matching `03_ARCHITECTURE.md §2`:
     - `src/app/`
     - `src/design/`
     - `src/features/hero/`
     - `src/features/estimator/`
     - `src/features/services/`
     - `src/features/rates/`
     - `src/features/tracking/`
     - `src/features/booking/`
     - `src/features/blog/`
     - `src/features/careers/`
     - `src/features/contact/`
     - `src/features/about/`
     - `src/features/chatbot/`
     - `src/features/admin/{shell, shipments, inquiries, rates, handling-rules, blogs, careers, users, settings, audit}/`
     - `src/server/`

---

## 4. Verification of the 11 Admin Tabs

In `src/pages/admin/AdminDashboardPage.tsx`, the 11 navigation tab IDs were audited for active render branches:

| # | Nav Tab ID | Label | State & Handlers Present? | JSX Render Branch Exists? | Status |
|---|---|---|---|---|---|
| 1 | `overview` | System Overview | Yes (`inquiries`, `shipments`, etc.) | **Yes** (`{activeTab === 'overview' && ...}`) | **Functional** |
| 2 | `shipments` | Waybills & Shipments | Yes (`shipments`, `milestones`, modal) | **Yes** (`{activeTab === 'shipments' && ...}`) | **Functional** |
| 3 | `inquiries` | Customer Inquiries | Yes (`handleInquiryStatusChange`, `handleDeleteInquiry`) | **NO** | ⚠️ **DEAD TAB** (Clicks yield blank screen; handlers were unused) |
| 4 | `chatbot` | AI Knowledge & Rules | Yes (`<AdminChatbotControl />`) | **Yes** (`{activeTab === 'chatbot' && ...}`) | **Functional** |
| 5 | `national-rates` | National Tariffs | Yes (`handleSaveNationalRate`, `handleDeleteNationalRate`) | **NO** | ⚠️ **DEAD TAB** (Clicks yield blank screen; handlers were unused) |
| 6 | `international-rates` | Worldwide Tariffs | Yes (`handleSaveIntlRate`, `handleDeleteIntlRate`) | **NO** | ⚠️ **DEAD TAB** (Clicks yield blank screen; handlers were unused) |
| 7 | `blogs` | Blog CMS & AI Polish | Yes (full editor, AI fixer modal) | **Yes** (`{activeTab === 'blogs' && ...}`) | **Functional** |
| 8 | `careers` | Careers & Candidates | Yes (`handleSaveJob`, `handleApplicationStatusChange`) | **NO** | ⚠️ **DEAD TAB** (Clicks yield blank screen; handlers were unused) |
| 9 | `users` | Access Control & RBAC | Yes (MFA, role assignment) | **Yes** (`{activeTab === 'users' && ...}`) | **Functional** |
| 10 | `cursor-messages` | Brand Ribbon | Yes (text list management) | **Yes** (`{activeTab === 'cursor-messages' && ...}`) | **Functional** |
| 11 | `settings` | Platform Settings | Yes (metadata, emergency mode) | **Yes** (`{activeTab === 'settings' && ...}`) | **Functional** |

**Conclusion:** 4 out of 11 tabs (`inquiries`, `national-rates`, `international-rates`, `careers`) have complete data and handler logic in the component but lacked conditional render blocks in the JSX. Phase 6 will split `AdminDashboardPage.tsx` into modular sub-routes (`/admin/inquiries`, `/admin/rates`, etc.) and restore all 4 missing views.

---

## 5. Automated Verification Results

All commands executed and verified green:
1. `npm run typecheck`
   - Command: `node node_modules/typescript/bin/tsc --noEmit`
   - Result: **PASS** (0 errors)
2. `npm test`
   - Command: `node node_modules/vitest/vitest.mjs run`
   - Result: **PASS** (3/3 test files, 12/12 tests passed in 347ms)
3. `npm run build`
   - Command: `node node_modules/vite/bin/vite.js build`
   - Result: **PASS** (2296 modules transformed, built in ~860ms)
4. `npm run lint -- --quiet`
   - Command: `node node_modules/eslint/bin/eslint.js . --quiet`
   - Result: **PASS** (0 errors)

---

## 6. Remaining Known Issues / Open Risks
1. **Admin tabs missing UI:** 4 tabs confirmed dead in monolithic `AdminDashboardPage.tsx` (addressed in Phase 6).
2. **Design system transition:** 334+ instances of `#0B5ED7` and gradients remain on public pages (will be migrated to Oxford Blue / Golden Yellow in Phase 1-4).
3. **Bundle size:** `index.js` is ~1.25 MB; chunk code-splitting and dynamic imports for 3D/heavy components needed (Phases 2 & 5).
4. **Prerendering & SEO:** Static HTML generation and dynamic sitemap generation needed (Phase 5).

---

## 7. Next Step
Phase 0 is complete and verified. Ready to proceed to **Phase 1 (Design System & Tokens)** upon owner "continue".
