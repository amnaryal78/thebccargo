# AI Coding Agent Rules — The BC Cargo & Courier

This file is the persistent project contract for Antigravity and other coding agents. Read it before every task.

## Project facts
- Product: The BC Cargo & Courier production web application.
- Stack visible in this repository: React 19, TypeScript, Vite 8, React Router 7, Supabase JS, Tailwind CSS 4, Framer Motion.
- Existing commands in `package.json`: `npm run dev`, `npm run build`, `npm run typecheck`, `npm run lint`, `npm test`, `npm start`.
- Current architecture includes a Vite frontend, `server.js` standalone server/AI proxy, and `supabase/` functions/config. Do not assume every backend capability runs in `server.js`; trace the actual implementation before editing.
- Treat the current checked-in code as source of truth. Do not assume undocumented fixes or deployment settings exist.

## Non-negotiable workflow
1. **Inspect before editing.** Trace the requested feature through routes, components, services, state, database/RLS, Edge Functions, and config as applicable. Search for all callers/usages before changing a shared component.
2. **Write a short plan.** Identify root-cause hypothesis, files likely involved, risks, and the smallest safe change. For small tasks, keep this to a few bullets.
3. **Fix root cause, not symptoms.** Avoid duplicate implementations, broad rewrites, fake data, hidden fallbacks, and unrelated refactors.
4. **Preserve existing behavior.** Do not remove working features, routes, accessibility, responsive layouts, or security checks without explicit approval.
5. **Security first.** Never expose secrets, service-role keys, private tokens, or server-only environment variables in browser code. Never print `.env` values in logs, reports, prompts, or chat. Use `.env.example` for names/placeholders only. Validate inputs server-side; preserve authorization and Supabase RLS.
6. **No destructive changes without approval.** Do not drop tables, reset production data, weaken RLS/auth, rotate credentials, change billing, or deploy to production unless explicitly authorized.
7. **Minimal token and tool use.** Read only the relevant files and callers. Prefer focused searches and targeted diffs over dumping the entire repository. Do not repeatedly re-read unchanged files. Avoid installing dependencies unless required.
8. **Do not claim work you did not do.** Distinguish code changed, tests actually run, tests not run, and manual checks still needed.
9. **No fake passing tests.** Tests must assert real behavior. Never delete, skip, loosen, or rewrite tests just to obtain a green result.
10. **Keep project memory in files.** Update `docs/AI_WORKLOG.md` after meaningful tasks with concise facts, decisions, changed files, commands/results, remaining risks, and next step. Do not put secrets or huge logs in it.

## Required task workflow
### A. Before changes
- Restate the observed issue/acceptance criteria in one sentence.
- Inspect the relevant implementation and tests.
- Identify likely root cause from evidence; if uncertain, state the uncertainty and gather the smallest useful diagnostic.
- List intended files and a minimal plan.

### B. During changes
- Make the smallest cohesive change.
- Add or update regression tests for bug fixes and behavior changes.
- Keep types strict and error messages actionable.
- For UI changes, verify loading, empty, error, success, mobile, keyboard/focus, and reduced-motion behavior where applicable.
- For database/API/security changes, verify auth, authorization, input validation, failure cases, and RLS/secret boundaries.
- Do not silently change API contracts, database schema, environment variable names, or deployment assumptions.

### C. Before finishing
Run the relevant checks in this priority order, stopping to diagnose failures instead of blindly changing unrelated code:
1. Targeted regression test(s).
2. `npm run typecheck`
3. `npm test`
4. `npm run build`
5. `npm run lint` (currently configured as `tsc --noEmit`, so it is a typecheck alias, not a real style linter).
6. Relevant manual smoke tests in the browser/local app.

If dependencies/runtime are unavailable, report that and provide exact commands for the user. Never say a check passed unless it ran successfully. For large changes, run the full available suite. For tiny documentation-only changes, tests may be unnecessary; say so.

### D. Required final report
Every completed coding task must end with:
- **Root cause:** evidence-based explanation (or what remains unconfirmed).
- **Implementation:** behavior changed and important design decisions.
- **Files changed:** concise list.
- **Verification:** exact commands and real results, including failures/not-run checks.
- **User test checklist:** numbered reproduction and expected result.
- **Deployment notes:** env vars/migrations/build/restart/rollback if relevant; say “none” if none.
- **Remaining risks / next step:** only real outstanding items.

## Coding standards
- Prefer existing patterns and dependencies over introducing new ones.
- Use reusable components and typed service boundaries; keep UI separate from business/data logic.
- Handle async states explicitly; prevent stale requests/race conditions where relevant.
- Keep components focused and avoid unnecessary re-renders.
- Use accessible labels, semantic HTML, keyboard support, and visible focus states.
- Ensure responsive behavior for small mobile, tablet, laptop, and wide screens.
- Do not add a dependency for a problem solvable cleanly with current tools.
- Update `.env.example`, docs, and tests when a real configuration contract changes; never put real values there.
- Keep changes reviewable. No whole-file rewrites unless necessary.

## If the task is ambiguous
Do not interrogate the user with a long questionnaire. Make safe assumptions explicit and proceed with inspection. Ask one concise question only if the missing decision blocks a safe implementation.
