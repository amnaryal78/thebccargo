# Phase 0 — Baseline and cleanup

**Goal:** a known-good, buildable, tested starting point. No visual work yet.
**Read:** 00_AUDIT, 03_ARCHITECTURE §2, §7.

## Tasks
1. `npm ci`, `npm run build`, `npx tsc --noEmit`. Record every error in `docs/phases/phase-0-report.md`. Fix them.
2. Create a git repo (if there is none) and commit the baseline. Confirm `.env` is in `.gitignore` and `.dockerignore`. Delete `.env` from the working tree if it holds anything real.
3. Replace `node --test` with **Vitest**. Make the existing 3 test files pass (fixes `ERR_MODULE_NOT_FOUND`).
4. Add ESLint (typescript-eslint, react-hooks, jsx-a11y) and Prettier. Fix auto-fixable issues only.
5. Remove demo production data: `INITIAL_SHIPMENTS` seeding in `App.tsx` and the mock MFA return in `authService.ts`. Admin must hard-fail with a clear message when Supabase is not configured.
6. Create the folder structure from ARCHITECTURE §2. Move files **without behaviour changes**, then re-run the build.
7. **VERIFY** the admin tabs from the audit: for each of the 11 nav ids, write down whether a render branch exists. Put the result in the report.

## Done when
- Build, typecheck and tests are all green.
- No demo shipments or mock MFA remain.
- The report lists the remaining known issues.

**Stop and report** to the owner before Phase 1.
