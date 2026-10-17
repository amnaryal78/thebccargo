# Changelog

All notable changes to **The BC Cargo & Courier** production platform will be documented in this file.
The project adheres to Semantic Versioning (`MAJOR.MINOR.PATCH`).

---

## [Phase 9] - Final Check & Production Release Ready (2026-10-15)
- Completed full regression test suite (`npm test`: 19 test files, 128 tests passed with 0 failures).
- Verified TypeScript type check (`npm run typecheck`: 0 errors) and code style (`npm run lint`: 0 errors).
- Built optimized production bundle and prerendered 32 static HTML pages in `dist/` (`npm run build`: 797ms build time).
- Verified cross-device responsiveness for Android Chrome, desktop Chrome, and low-bandwidth networks (PWA offline shell, touch targets $\ge 48$px, zero font shift).
- Verified live rates calculation, 20 kg/box partitioning, meat restrictions (Europe/UK/Hong Kong only), and strict bill mathematical parity across all countries.
- Verified sheet offline resilience: engine falls back safely to cache/database with zero invented or fake numbers.
- Added comprehensive QA suite in `tests/final-check.test.ts`.

## [Phase 8] - Pinned Buttons and Cursor (2026-10-15)
- Removed `lg:hidden` restriction from `src/components/StickyContactButtons.tsx`, making pinned action buttons visible and accessible on both desktop and mobile viewports.
- Configured three dedicated pinned buttons with tactile claymorphism styling: **Chat** (`Bot` icon; smoothly scrolls and focuses the AI chatbot input), **WhatsApp** (`MessageCircle` icon; opens WhatsApp dispatch `wa.me/9779855068307`), and **Location** (`MapPin` icon; opens verified Google Maps pin `maps.app.goo.gl/pYyv4DPf69xwDV9J7` for Hetauda HQ).
- Positioned buttons responsively on the right side (`lg:bottom-10 lg:right-6`) on desktop and above the Android bottom navigation bar (`bottom-20 right-4`) on mobile, with desktop hover tooltips and non-overlapping z-index (`z-30`).
- Updated `src/components/CustomCursor.tsx` to cycle brand prompts every 6 seconds (6000 ms, updated from 9000 ms).
- Added test suite in `tests/sticky-buttons.test.ts` (3 tests verifying button visibility, targets, and 6s cursor interval).

## [Phase 7] - AI Chat (Always On, Few Rules) (2026-10-15)
- Streamlined `src/data/chatbotData.ts`: removed bulky hardcoded FAQ trees, keeping only verified Hetauda HQ contact details, Nepal doorstep pickup policy, and core rules.
- Created Supabase Edge Function `chat` (`supabase/functions/chat/index.ts`) and updated `bc-cargo-chat/index.ts` with server-side AI key management (`OPENROUTER_API_KEY`).
- Enforced strict Phase 7 assistant guardrails: cargo & BC Cargo only, short easy words, prices strictly from live rates engine (no guessing), meat permitted ONLY for Europe, UK, and Hong Kong, pickup strictly within Nepal, and automatic WhatsApp human escalation.
- Integrated in-memory IP rate limiting (30 requests/minute) and Cloudflare Turnstile CAPTCHA verification (`TurnstileWidget` & server-side verify) to prevent bot exploitation.
- Supported admin rule customization in `AdminChatbotControl.tsx` and updated `BcCargoChatbot.tsx` with single-word action chips (WhatsApp, Price, Call, Track) and matching Lucide icons.
- Added comprehensive test suite in `tests/chatbot.test.ts` (10 passing tests verifying rates, pickup, meat restriction, refusal guardrail, and escalation).

## [Phase 6] - 3D Look, Scroll, and Simple UI (2026-10-15)
- Preserved claymorphism tokens (soft shapes, tactile borders, `#002147` Oxford Blue, `#F2B705` Gold, no gradients) in `src/design/tokens.css`.
- Added `.headline-3d` text-shadow utility for crisp, readable 3D headline typography across hero, estimator, and testimonials.
- Integrated `Card3D` with touch/fine pointer capability and `prefers-reduced-motion` guards across services, country tariffs, and customer reviews.
- Standardized all button labels across the app to single short words with matching Lucide icons (Price, Book, Chat, Call, Track, More, Send, Close; zero emojis).
- Updated `FeedbackSection.tsx` to feature the top 3 verified customer reviews by default, with a "More" button loading the next 10 reviews from Supabase.
- Updated `reviewService.ts` with pagination and verified Hetauda credentials across default review items.
- Fixed stray raw glyphs in `BookingSystem.tsx` and `AuditLogTab.tsx` with semantic Lucide icons (`ShieldCheck`, `X`).

## [Phase 5] - Globe & Tactical Route System Update (2026-10-15)
- Configured Hetauda Central HQ (`Kantirajpath, Hetauda-4, Nepal`, `lat: 27.4284, lng: 85.0322`) as the primary origin hub (`hub-hda`) with golden pulse radar marker and flight arc origin.
- Reordered international destinations prioritizing core corridors: South Korea, Malaysia, UK, Japan, Europe, and Gulf.
- Updated auto-rotation sweep to oscillate between -10° (Europe/UK) and 140° (Japan/Korea), completely preventing spinning into the blank Pacific ocean.
- Implemented 5-second drag inactivity timeout easing the globe smoothly back to the nearest corridor before resuming auto-rotation.
- Added Quick Select corridor chips (South Korea, Malaysia, UK, Japan, Europe, Gulf, More) in `RouteTable3D.tsx` with smooth programmatic easing.
- Updated `DestinationPanel.tsx` to display "From Hetauda to [Country]" and standardized primary CTA buttons ("Price" and "Book").
- Handled reduced motion (`prefers-reduced-motion: reduce`) by disabling auto-rotation.
- Added automated unit tests in `tests/globe.test.ts` verifying Hetauda origin, corridor priorities, and Pacific ocean avoidance.

## [Phase 4] - Hetauda Central Hub, Country Landing Pages & SEO Prerendering (2026-10-15)
- Replaced legacy Kathmandu mentions with Hetauda Central Headquarters across `LandingPage.tsx`, `route-data.ts`, `RegionalHubsMap.tsx`, `HowItWorksTimeline.tsx`, `MiniEstimatorSlot.tsx`, `RouteTableHero.tsx`, `BookingSystem.tsx`, `PartnerSlider.tsx`, `FaqSection.tsx`, `ServicesSuite.tsx`, and `chatbotData.ts`.
- Created dedicated SEO country corridor landing pages in `src/pages/country/CountryLandingPage.tsx` and `src/data/countryLandingData.ts` for South Korea, Malaysia, UK, Japan, Europe, UAE/Gulf, Hong Kong, and USA.
- Populated each country corridor with local Hetauda dispatch details, transit times, IATA packing standards (20 kg/box limit), country customs restrictions (e.g. meat prohibited for Korea/USA/Japan), and live Google Sheet price examples.
- Updated `scripts/prerender.mjs` to generate 32 static HTML pages in `dist/` with rich semantic body content for 100% readability with JavaScript disabled.
- Injected structured JSON-LD schemas (`LocalBusiness` with Hetauda address, `Service`, `FAQPage`) and OpenGraph/Twitter tags for all country routes.
- Updated `scripts/generate-sitemap.mjs` and generated `public/sitemap.xml` with priority indexing for all 8 country corridors.
- Added comprehensive automated test suite in `tests/country-seo.test.ts` verifying country configurations, prerendering, sitemap, and JS-off HTML.

## [Phase 3] - Bill Parity & Print Standards (2026-10-15)
- Extracted official company customer bill template to `docs/bill-reference.html` from WinUI billing service.
- Rebuilt `EstimateBillModal.tsx` to match the company's official bill layout, styling, and typography (Oxford blue `#0B1F3A`, golden yellow `#F5B301`, slate borders, and A5 / 5×8 inch paper margins).
- Displayed all mandatory Phase 3 fields: Date, Receiving Country, Total Shipment Weight, Matched Rate Bracket, and Pricing Method.
- Itemized Base Shipping Charge, Box Charge (Rs 1,000/box), Liquid Charges (Rs 600/box), and Meat Charges.
- Added conditional rendering for Medicine Special Protocol (Rs 600/box) strictly when chosen by user.
- Enforced mathematical parity: Grand Total strictly equals the sum of line items above it.
- Integrated `src/utils/numberToWords.ts` for South Asian currency wording ("Rupees Only") and added Hetauda office address with mandatory physical check notice.
- Configured dedicated `@media print` rules for `#printable-bill` fitting on 1-page A5 / 5×8 inch paper.
- Added test suite in `tests/bill.test.ts` verifying fields, math, conditional medicine row, and under-10 kg pricing.

## [Phase 2] - Easy Estimator Screen (2026-10-15)
- Rebuilt `RateEstimator.tsx` with a simplified 4-step card screen designed for effortless usability by all age groups.
- Step 1: Big tactile flag cards for top 5 corridors (South Korea, Malaysia, UK, Japan, Europe) plus searchable "More" modal listing all other sheet countries.
- Step 2: High-contrast weight stepper with accessible 48px `+` and `−` controls (0.5kg steps) and real-time box counter badge (`X boxes (max 20 kg each)`).
- Step 3: Tactile toggles for Liquid, Meat, and Medicine. Greyed out Meat for restricted countries with informative message on tap, and opened dynamic kg stepper when Meat is enabled.
- Step 4: Prominent total in NPR, itemized breakdown list, and accessible 48px primary action buttons: "Get bill" (modal preview) and "Chat" (WhatsApp dispatch with pre-filled shipment summary).
- Built `EstimateBillModal.tsx` displaying the company's verified quotation breakdown for preview and printing.

## [Phase 1] - Live Rates from Google Sheet (2026-10-15)
- Created and deployed Supabase Edge Function `rates` (`supabase/functions/rates/index.ts`) fetching live CSV from Google Sheet `1fYp7W6Q9Ri50wLQudjBWhI8J_gVGaOM47UCKrEoxS5o` with 60s in-memory caching and automatic fallback to Supabase table.
- Created `sheet_rates_cache` Supabase table and applied migration `20261015000000_sheet_rates_cache.sql`.
- Updated `src/services/ratesService.ts` and `src/features/estimator/useEstimatorData.ts` to consume live Google Sheet rates with offline/database resilience.
- Implemented pure rate engine calculations in `src/features/estimator/engine.ts` supporting box packaging (`ceil(weight / 20)`, Rs 1,000/box), tier matching (`20_plus`, `10_plus`, standard half-kg brackets), and extra compliance fees (liquid/medicine Rs 600, meat Rs 600/1,100/blocked).
- Added test coverage in `tests/estimator.test.ts` verifying UK 30 kg, Korea 3 kg, Hong Kong meat rate, and Korea meat lock.

## [Phase 0] - Safety and Cleanup (2026-10-15)
- Created dedicated git working branch `phase-0-cleanup`.
- Verified `.env` file is properly gitignored and clean of repository tracking.
- Removed legacy hardcoded money rules (12% fuel surcharge, Rs 250 handling fee, USD 135 rate, Rs 500 min charge, legacy meat/medicine fees) in estimator constants, engine, and UI.
- Synced project roadmap specification to `docs/PHASES.md`.

## [1.0.0] - 2026-10-14 — Production Release Candidate

### Phase 0 — Baseline Audit & Security Hardening
- Performed forensic audit of legacy codebase (`00_AUDIT.md`).
- Removed hardcoded credentials, service-role keys, and tokens from all browser-facing code.
- Sanitized `.env.example` to ensure zero real credentials exist in version control.
- Hardened `src/lib/supabase.ts` with strict URL and key validation to reject placeholder and non-HTTPS configurations.

### Phase 1 — Design System & Authenticated Tokens
- Authored brand color scales: Oxford Blue (`#002147`), Golden Yellow (`#F2B705`), Inks (`#121211`), Signal Red (`#C8372D`).
- Self-hosted variable typography (`@fontsource-variable/archivo`, `@fontsource-variable/public-sans`, `@fontsource-variable/jetbrains-mono`).
- Replaced harsh neobrutalist borders with authentic Claymorphic UI layer (top-left -45° lighting, debossed `.clay-inset` inputs, molded radii, tactile depressions on click).
- Achieved 100% WCAG AA contrast compliance across 25 color pairs in light and dark modes.

### Phase 2 — Homepage & Route Table Hero
- Built `RouteTableHero.tsx` with dynamic 3D WebGL Three.js globe and 2D dotted map fallback for low-power devices.
- Implemented hardware and connection capability gating (`device-capability.ts`).
- Created `MiniEstimatorSlot`, `ServicesSuite`, `HowItWorksTimeline`, and `RegionalHubsMap`.
- Added `AndroidBottomNav` and floating sticky contact buttons with accessible 44px touch targets.

### Phase 3 — Rate Estimator & Business Rule Engine
- Engineered pure TypeScript calculation engine (`engine.ts`) supporting domestic (NPR) and international (USD/NPR) freight.
- Integrated volumetric dimensional weight calculations with standard divisors (5,000 cm³/kg air, 6,000 cm³/kg overland).
- Implemented handling rules with dynamic surcharges for liquids, meats, and medicines.
- Added corridor-specific export prohibition detection (e.g. animal products to USA).
- Integrated official disclaimers and amber `[PLACEHOLDER]` warning badges for unverified regulatory decrees.

### Phase 4 — Inner Pages & Content Experience
- Refactored `/services` and dynamic `/services/:slug` pages with permitted cargo checklists and 4-stage custody pipelines.
- Upgraded `/about`, `/careers`, `/careers/:slug`, `/blogs`, `/blogs/:slug`, `/contact`, `/faq`, and `/policies`.
- Redesigned `/rates` tariff page with real-time domestic and international search matrices.

### Phase 5 — SEO, PWA, Performance & Security Headers
- Upgraded `<Seo>` component with dynamic per-route metadata and comprehensive JSON-LD schemas (`Organization`, `LocalBusiness`, `Service`, `Article`, `JobPosting`, `FAQPage`).
- Implemented `scripts/prerender.mjs` prerendering all 26 public routes into static HTML.
- Implemented `scripts/generate-sitemap.mjs` producing valid `sitemap.xml` and `robots.txt`.
- Generated brand PNG assets (`og-banner.png`, `icon-192.png`, `icon-512.png`, `icon-maskable.png`).
- Integrated Progressive Web App (PWA) manifest and Service Worker with tactile `offline.html` fallback.
- Hardened standalone server (`server.js`) with CSP, HSTS, Brotli/Gzip compression, and IP sliding-window rate limiter.
- Optimized bundle size with chunk splitting: initial mobile bundle is **51.88 KB gzip** (well under the 170 KB budget).

### Phase 6 — Admin & Operations Portal
- Deconstructed monolithic `AdminDashboardPage.tsx` into modular subroutes in `src/features/admin/*`. Every file strictly $\le 400$ lines.
- Fixed dead tabs (`inquiries`, `rates`, `careers`) to load live PostgreSQL data from remote Supabase instance.
- Eliminated all mock `localStorage` state in favor of single-source-of-truth Supabase tables.
- Implemented Role-Based Access Control (RBAC) across 6 roles (`super_admin`, `admin`, `operations`, `editor`, `support`, `read_only`).
- Added live Milestones quick-add, printable AWB modal, official inquiry reply generator (email & WhatsApp), handling rules editor, and audit log viewer.
- Disabled custom cursor on admin routes for crisp administrative productivity.

### Phase 7 — QA, Verification & Launch Readiness
- Built comprehensive end-to-end acceptance suite (`tests/e2e-workflows.test.ts`) covering estimator calculations, bookings, inquiries, job applications, admin auth guards, and tracking found/not-found paths.
- Verified Docker production image security (`.dockerignore` and multi-stage `Dockerfile` running as non-root `USER node` without `.env`).
- Automated scan confirming compiled `dist/` bundle contains zero private keys or credentials.
- Published `docs/launch-checklist.md` documenting open owner action items and establishing the launch blocker on placeholder handling rules.
- Verification status: 10 test files, 93 automated tests passing, 0 TypeScript errors, clean production build.

### Phase 8 — Foundation & Interaction System
- Resolved all 313 undefined CSS variable instances across stylesheets and components with guarded Vitest regression check (`tests/css-vars.test.ts`).
- Enforced global pointer cursor rules on all interactive elements (`button`, `[role=button]`, `[role=tab]`, `a[href]`, `summary`, `select`, `label[for]`, `input[type=checkbox]`, `input[type=radio]`) with `not-allowed` on disabled states.
- Implemented two-way brand hover physics on `Button.tsx` (Gold -> Oxford Blue hover with light gold text; Oxford -> Gold hover with Oxford text).
- Added magnetic pointer attraction on primary CTA buttons for fine-pointer desktop devices.
- Refined custom cursor with smooth spring damping and automatic suppression over text inputs, selects, textareas, and chatbot dialogue.
- Consolidated UI kit under `src/design/primitives/` with backward-compatible re-exports in `src/components/ui/`.

### Phase 9 — International-Cargo-Only Transformation
- Eradicated all domestic/national courier options, rates, routes, filters, cards, and chatbot knowledge base answers.
- Preserved dormant `national_rates` database table without dropping schema.
- Replaced domestic service `srv-nat-express` with `srv-customs-intl` (Customs Brokerage & Border Clearance, License #B-409).
- Enforced strict domestic booking rejection on both client and Edge Function when destination country is Nepal.
- Established 301 permanent redirects in `server.js` and client `<Navigate />` in `App.tsx` for legacy `/rates/national`, `/rates/calculator`, and `/services/courier-nat`, `/services/haulage-nat`, `/services/nepal-domestic-express`, `/services/domestic-express-cargo`.
- Updated corridor tables, gateway copy, and policy documents to international air and cross-border road linehaul.
- Authored guard test `tests/international-only.test.ts` to strictly maintain the international-only invariant.

### Phase 10 — Plain English, Words Fit & Visual QA
- Hard label wrapping rules: added `whitespace-nowrap`, `overflow-wrap: normal`, `word-break: normal` across buttons, tabs, chips, badges, and headers to eradicate mid-token breaks.
- Replaced fixed heights on controls with responsive `min-height` rules.
- Header responsive pass: icon-only Sign In with `aria-label` at `< 640px`; dynamic Book button ("Book" at `< 400px`, "Book Pickup" at `400px+`).
- Short navigation pass: simplified top-level nav to `Home`, `Rates`, `Track`, `Services`, `Blog`, `About`, and `More` dropdown (`Contact`, `Careers`, `FAQ`, `Policies`).
- Bottom bar and More sheet standardized to 1-word clear labels (`Services`, `About`, `Contact`, `Blog`, `Careers`, `FAQ`, `Policies`, `Login`).
- Brand integrity audit: removed unprovable statistical claims (e.g. "99.4% on-time", "190+ ports", "GPS-tracked") and logged them in `docs/OWNER_TODO.md` with required proof.
- Centralized plain language tokens and navigation labels in `src/content/copy.ts` guarded by `tests/copy-limits.test.ts`.
- Prerender and sitemap synced to 24 international routes.

