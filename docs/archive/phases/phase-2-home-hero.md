# Phase 2 — Home page and the Route Table hero

**Goal:** the new landing page. The interactive hero replaces the old tracking hero.
**Read:** 01_PRD §5.1, 02_DESIGN §3, §5.

## Tasks
1. `lib/device-capability.ts` with `canRender3D()`. Unit-test it with mocked `matchMedia`, `connection` and WebGL.
2. **RouteTable (2D, Android first).** SVG/canvas dotted map from `dotted-map`, hub marker for Kathmandu/Hetauda, tappable destination dots from `international_rates` plus key national cities, and a bottom-sheet **DestinationPanel** (transit time, "from" price, service, Get estimate, Book). This is the full mobile experience. Keep it fast.
3. **RouteTable (3D, desktop).** Lazy-loaded three.js globe (dots, arcs, drag-rotate, hover and click to open the same DestinationPanel). Flat palette only. The LCP element is the HTML headline, not the canvas. Add a visible "list view" toggle for keyboard and screen-reader users.
4. Hero copy: ≤ 8-word headline, left-aligned, wrapping normally (**no `whitespace-nowrap`**). CTAs: Get estimate, Book pickup. A compact track field sits underneath as secondary.
5. Remaining sections per PRD §5.1: service picker, scroll timeline, mini estimator slot (a placeholder until Phase 3), hubs map, numbers (from `site_settings`), partners (marquee that pauses on touch), reviews (hidden if empty), latest blogs, FAQ with search, final CTA.
6. Scroll choreography on desktop only (Lenis plus GSAP ScrollTrigger, in a lazy chunk). Mobile uses IntersectionObserver reveals.
7. Retire `LogisticsMotionGraphicSection` (800 lines): replace it with the new scroll story or delete it.

## Verify
- 360px Android emulation: no horizontal overflow, the hero is usable above the fold, the 3D chunk is **not** requested.
- 1440px desktop: the 3D chunk loads after first paint, with a steady 60 fps on a mid laptop. Reduced-motion shows the static state.
- Lighthouse mobile on `/`: LCP ≤ 2.5s, JS gz ≤ 170 KB initial.

## Done when
Every home section has a working interaction, the mobile and desktop paths are both tested, and the budgets pass.
