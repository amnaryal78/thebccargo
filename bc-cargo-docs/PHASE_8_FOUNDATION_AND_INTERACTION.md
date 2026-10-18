# Phase 8: Repair the foundation, visible states, hover, cursor

Goal: nothing is invisible, every interactive thing reacts correctly to the pointer, and the design system is one system. This phase comes first because its root cause (undefined CSS variables) is spread across the whole app, and the next two phases would otherwise be built on top of it.
Evidence: `docs/QA_FINDINGS.md` sections 2, 3, 5. Size: L.

## Root cause (verified, do not re-diagnose)
Components use CSS variables that are **never defined** anywhere in `src/`: `--oxford-deep` (151 uses), `--gold` (241), `--gold-dark` (71), `--surface-muted` (90), `--text-secondary` (89), `--surface-subtle` (10), `--green-mid` (25), plus `--green-dark`, `--green-subtle`, `--r-xs`, `--t-normal`. An undefined variable makes the property fall back to nothing, so `bg-[var(--oxford-deep)] text-white` becomes white text on a transparent (white) background. That is exactly the "selected state matches the background and disappears" bug (e.g. the "All Corridors" chip, the active segment in the home estimator, the estimator option cards). 80 files also hard-code hex colours instead of tokens, and there are 890 `dark:` overrides, which is how light and dark drift apart.

## Tasks
- [ ] **8.0 Restore `public/`.** The zip had no `public/` folder, so `tests/pwa.test.ts` fails (4 tests: manifest.json, sw.js, offline.html, PNG icons/og-banner) and `/sw.js` returns 404. If your real repo has `public/`, make sure it is committed. If it is really missing, regenerate: `node scripts/generate-brand-images.mjs`, recreate `manifest.json`, `sw.js`, `offline.html`, `favicon.svg`, then `npm run sitemap`. All 93 tests must pass before moving on.
- [ ] **8.1 QA tool + baseline.** Copy `tools/qa-ui.mjs` to `scripts/qa-ui.mjs`. `npm i -D playwright && npx playwright install chromium`. Add `"qa:ui": "node scripts/qa-ui.mjs --base http://127.0.0.1:3000"` to `package.json`. Run `npm run build`, start `node server.js`, run `npm run qa:ui`, save the output as `docs/qa/baseline.md`. This is the number you must drive to zero.
- [ ] **8.2 Fix every undefined variable.** Do not alias them away. Define the missing semantic tokens in `src/design/tokens.css` only where a real role is missing, and replace the rest with existing tokens:
  | Used | Replace with |
  |---|---|
  | `--oxford-deep` | `--brand` / `--surface-oxford` (`--ox-900`) by role |
  | `--gold` | `--accent` (`--gd-500`) |
  | `--gold-dark` | `--accent-text` (`--gd-700`) for text on light; for hover backgrounds follow 8.6 instead |
  | `--surface-muted`, `--surface-subtle` | `--surface-2` |
  | `--text-secondary` | new token `--text-secondary` between `--text` and `--text-muted`, AA on `--surface` and `--surface-2` in both themes |
  | `--r-xs` | add `--r-xs: 2px` to the radius scale |
  | `--t-normal` | add `--t-normal: 240ms` next to `--t-fast` |
  | `--green-*` | remove. The brand palette has no green. Success = oxford fill + check icon; "live/OK" dots use oxford or gold. |
  Use a scripted codemod for the mechanical replacements, then review the diff by area. Add `scripts/check-css-vars.mjs`: scans `src/**` for `var(--x)` without a fallback and fails if `--x` is not defined in `tokens.css` or `index.css`. Run it in `npm test` (as a vitest test) and before `build`.
- [ ] **8.3 Remove hard-coded hex.** Replace `#002147`, `#F2B705`, `#071A33`, `#001A38`, `#0B2445`, `#F6F6F4`, `#16A34A`, `#10B981` etc. in `.tsx/.ts` with tokens. Hex is allowed only in `tokens.css`, generated brand images and the SVG logo. Add a lint test that fails on hex or on `bg-gradient`/`linear-gradient`/`radial-gradient` in `src/`.
- [ ] **8.4 Selected / checked / disabled states.** Every control that can be selected must stay visible in light and dark, and must not rely on colour alone. Spec: selected = filled background + readable text (>= 4.5:1) + border or check icon; unselected = clearly different (>= 3:1 against the selected one); disabled = reduced contrast but still readable (>= 3:1) with `cursor: not-allowed`. Fix at least: route filter tabs (`RouteTable2D`), home mini-estimator segments (`MiniEstimatorSlot`), estimator option cards (`RateEstimator`, they are `div role="checkbox"` with a white background), booking route/service/mode cards, services filter chips, blog category chips, FAQ accordion, admin tabs and switches. Move all of them onto the shared `Tabs`, `Chip`, `Toggle`, `Card` primitives so there is one implementation. Add a test that renders each primitive in both themes and asserts contrast for selected vs unselected vs surface.
- [ ] **8.5 One UI kit.** There are two: `src/components/ui/*` and `src/design/primitives/*`. Keep `design/primitives`. Search all callers of the old kit, migrate them, delete the old files only after zero callers remain. Do not leave a re-export shim.
- [ ] **8.6 Hover, press, focus system.** Implement once in the primitives (and a small `src/design/interaction.css` for non-React elements), then convert raw `<button className=...>` and button-like `<a>` to the primitives. Rule: **blue things go golden on hover, yellow things go oxford on hover.** Wrap every hover style in `@media (hover: hover)` so touch devices never get a stuck hover; touch gets a short `:active` press only.
  | Element | Rest | Hover | Pressed |
  |---|---|---|---|
  | Primary (gold fill, oxford text) | `--gd-500` | `--ox-800` fill, `--gd-300` text | `--ox-900` fill |
  | Oxford button / chip / selected tab | `--ox-800` fill, white text | `--gd-500` fill, `--ox-900` text | `--gd-600` fill |
  | Secondary (white/paper) | white, oxford text, line border | `--ox-50` fill, `--ox-700` border (dark theme: `--ox-800` fill, `--gd-500` border) | `--ox-100` |
  | Text link on light | `--ox-800` | `--ox-600` + underline, offset 3px | `--ox-900` |
  | Text link on dark band | white | `--gd-300` + underline | `--gd-400` |
  | Nav item | oxford text | `--ox-50` fill; active page has a 3px gold bar and heavier weight | |
  | Card (clickable) | surface + line | lift 2px, border `--gd-500` on oxford cards, `--ox-700` on light cards | lift 0 |
  | Table row, list row | none | `--ox-50` | |
  | Icon button | line border | border + icon swap to `--gd-600` on light, `--gd-300` on dark | |
  Focus ring: 3px solid, `--gd-500` on oxford surfaces, `--ox-800` on light/gold surfaces, offset 2px; never removed. Timing: colour 150ms, transform 240ms, `--ease-out`. Add a global rule so all of these show a pointer: `button,[role=button],[role=tab],a[href],summary,select,label[for],input[type=checkbox],input[type=radio]{cursor:pointer}` and `:disabled{cursor:not-allowed}`. Text inputs keep the text cursor. Every interactive element, including the logo, must visibly change something on hover.
- [ ] **8.7 Magnetic buttons (limited).** `MagneticButton.tsx` exists but nothing uses it. Fold it into the `Button` primitive as an opt-in `magnetic` prop and turn it on only for primary calls to action: hero Get Estimate and Book Pickup, header Book Pickup, final CTA, Track submit, estimator Send/Book. Rules: only `(hover: hover) and (pointer: fine)`; max pull 6px; transform only (no layout shift); springs back on leave, on scroll and on blur; off for `prefers-reduced-motion`; keyboard focus unaffected. Do not apply it to every element; magnetic text links and cards feel broken.
- [ ] **8.8 Custom cursor.** Review `CustomCursor.tsx`. Keep it only if it meets this: dot + ring, ring grows over interactive elements; its colour follows the surface under it (gold on oxford and dark areas, oxford on light and gold areas) by reading a `data-surface` attribute set on bands and cards, computed when the hover target changes, not per frame; never invisible (ring has a 2px outline that contrasts with both surfaces); hidden on touch, coarse pointer, reduced motion and admin; native cursor stays over text inputs, textareas, selects, iframes and the chatbot panel; `cursor: none` is applied only while the custom cursor is mounted and active; updates with `transform` in `requestAnimationFrame`, `pointer-events: none`. If it cannot meet this, remove it and record the decision in `docs/AI_WORKLOG.md`.
- [ ] **8.9 Both themes.** Every route must pass the hard checks in light and dark (`--theme both`). Where you touch a file, replace `dark:bg-[...]` hacks with semantic tokens so the theme switches by variables.

## Gate
```
npm run typecheck && npm test && npm run build
node server.js &   # then:
npm run qa:ui      # both themes
```
`qa:ui` hard checks must all be **0**: `invisible`, `undefinedVars`, `noPointer`, `noHover`, `hoverInvisible`, `overflowX`, `console`. (`midword` and `labelWrap` are Phase 10 but must not get worse.) 93/93 tests pass. Zero undefined variables per `check-css-vars`. Zero hex/gradient hits in `src/`.

## Exit criteria
Selected states visible everywhere in both themes; one hover system following the blue-to-gold / yellow-to-oxford rule; pointer cursor on everything clickable; magnetic only on primary CTAs; cursor reviewed; one UI kit; `public/` restored; baseline vs after numbers written to `docs/qa/phase8.md`.

## Not in this phase
Removing national cargo (Phase 9), copy and text fit (Phase 10).
