# AI Project Worklog

Purpose: durable, low-token project memory for coding-agent sessions. Keep entries concise and factual. Newest entry goes first. Never store secrets, personal data, or raw environment files.

## Latest Entry

### 2026-10-12 — Initial Production Project Audit
- **Request / acceptance:** Establish baseline architecture, test results, security review, and risk roadmap for The BC Cargo & Courier.
- **Evidence / root cause:**
  - Architecture: Vite 8 + React 19 SPA frontend with Tailwind 4; standalone Node.js `server.js` acting as static file server, health check (`/api/health`), and secure AI backend proxy (`/api/chat`, `/api/fix-blog`) with OpenRouter integration; Supabase (PostgreSQL + RLS + 7 Edge Functions) for database, auth, and async workflows; Dockerfile with multi-stage build.
  - Baseline commands:
    - `npm run build`: PASS (Vite bundles client assets into `./dist` in 686ms; note: main bundle is ~1.25MB).
    - `npm test`: FAIL (4/6 tests passed). `tests/security.test.ts` passed 4/4. `tests/rates.test.ts` and `tests/tracking.test.ts` failed with `ERR_MODULE_NOT_FOUND` because Node's native ESM test runner requires explicit `.ts` extensions on internal imports (`../lib/supabase`).
    - `npm run typecheck`: FAIL. On Windows host, path containing ampersand `&` (`The-BC-Cargo-&-Courier`) breaks `.bin\tsc.cmd` execution. When invoked directly via Node (`node node_modules/typescript/bin/tsc --project tsconfig.json --noEmit`), fails with 9 errors in `tests/*.test.ts` due to `tsconfig.json` defining `"types": ["vite/client"]` without `"node"` types. `src/` itself has 0 type errors.
  - Security posture: Server secrets (OpenRouter, Supabase service role) are kept out of frontend; `src/` only accesses `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TURNSTILE_SITE_KEY`. Identified risks: `get_admin_dashboard_metrics` RPC has `GRANT EXECUTE TO anon` in migration 20260923000000; `secureStorage.ts` uses static XOR obfuscation; public form endpoints have silent fake success fallbacks on service failure.
  - CI status: No `.github/` workflows directory exists; project folder is not currently a git repo.
- **Changed:** `docs/AI_WORKLOG.md` (audit documentation).
- **Checks:**
  - `npm run build` — PASS.
  - `npm test` — FAIL (2 failed tests due to Node ESM extensionless imports; 4 security hygiene tests passed).
  - `npm run typecheck` — FAIL (Windows path ampersand in npm `.bin` wrapper + missing `@types/node` in `tsconfig.json` types).
  - `npm run dev` — PASS (dev server tested and responsive on port 3000).
- **Manual test:** Local server booted on port 3000; verified Vite dev server serving SPA.
- **Deployment / rollback:** None (audit phase).
- **Next step / open risk:** Await approval to apply first targeted fixes: (1) add `"node"` to `tsconfig.json` types, (2) fix ESM imports in test files / services, (3) address Windows path ampersand in script invocations.

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
