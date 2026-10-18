# QA
Commands: `npm run typecheck`, `npm test` (vitest, 20 files ~130 tests per last worklog; not re-run in recon), `npm run build` (+prerender), `npm run budget`, `npm run lint` (eslint). Scripts: `scripts/qa-ui.mjs`, `audit-ui-interactions.mjs`, `test-server-security.mjs`, `contrast-check.ts`.
Tests cover: admin-roles, bill, chatbot, contrast, copy-limits, country-seo, css-vars, device-capability, e2e-workflows, estimator, final-check, globe, how-to-ship, international-only, prerender, pwa, rates, security, sticky-buttons, tracking. No RLS test against live DB; no Playwright suite in repo (prerender uses Chromium).
Windows note: folder name contains `&`; always `node node_modules/<pkg>/...`.
No CI (.github absent). Never skip/weaken tests.
