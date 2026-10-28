# Phase 7 — QA and launch

## Tasks
1. Full Playwright e2e: estimator, booking, inquiry, job application, admin login guard, and the tracking found and not-found paths.
2. Device matrix: Chrome Android emulation (360×800, 4G throttle, 4× CPU slowdown), iOS Safari viewport, 1440 and 1920 desktop, light and dark, and reduced-motion.
3. Accessibility: axe on every route, keyboard-only pass, and a screen-reader check of the globe's list view and the estimator.
4. Anti-template review against 02_DESIGN §3. Produce a screenshot sheet and tick each rule.
5. Content check against PRD §8: list everything still placeholder (rules, phones, licences, photos) in `docs/launch-checklist.md`. **Launch is blocked until the owner confirms the placeholder handling rules.**
6. Security checklist: no secrets in the repo or the bundle (grep the `dist/`), the CSP clean, RLS tests passing, and the Docker image without `.env`.
7. Final Lighthouse CI report and a short `CHANGELOG`.

## Done when
All checks pass or are listed as owner actions in the launch checklist.
