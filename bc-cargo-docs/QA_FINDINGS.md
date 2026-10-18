# QA findings: build after your fix (2026-10-14)

## How this was tested
Built the zip (`npm ci`, `npm run build`), served `dist/` with the project's own `server.js`, and drove it with real Chromium (Playwright). Every public route, plus the first service, blog and career detail pages, at 360x800 and 412x915 (touch) and 1440x900 (mouse), light theme. A hover test moved the mouse over up to 40 distinct buttons and links per route and compared styles before and after. Screenshots were viewed by eye for the findings below marked "seen". The same script is in `tools/qa-ui.mjs` so you and the agent can repeat it.

**Limits:** no Supabase connection (pages used built-in fallback data); admin tested only up to its login screen; no real Android device; the checks are heuristics, so a flagged item can be a false alarm. Items marked "seen" were confirmed on screenshots. Dark theme was checked only on a subset (see section 7).

## 1. What works
`npm run typecheck` passes (0 errors). Build passes and pre-renders 26 pages. 89 of 93 tests pass. No sideways scrolling on any route at any of the three sizes. The three-tier home hero and bottom nav exist. Initial bundle is small (the changelog says 51.88 KB gzip; not re-measured here).

## 2. The big one: CSS variables that do not exist (seen)
The code uses these variables, but **none is defined anywhere in `src/`**:

| Variable | Uses | Result when undefined |
|---|---|---|
| `--gold` | 241 | gold backgrounds/borders/text silently missing |
| `--oxford-deep` | 151 | dark button/chip backgrounds missing |
| `--surface-muted` | 90 | panel backgrounds missing |
| `--text-secondary` | 89 | text falls back to inherited colour |
| `--gold-dark` | 71 | hover/active colours missing |
| `--green-mid` | 25 | (also green is not in your palette) |
| `--surface-subtle` | 10 | |
| `--green-dark`, `--green-subtle`, `--r-xs`, `--t-normal` | few | |

Example (seen): `bg-[var(--oxford-deep)] text-white` for the selected chip becomes white text on a transparent background. So on the home page the selected **"ALL CORRIDORS (14)" chip is white text on a white chip** and the active segment of the home estimator is an **empty white box** next to "NEPAL NATIONAL EXPRESS". The browser run found 13 unique invisible-text spots (contrast under 2:1) on light theme, in the hero filter, services filter ("All Modes"), blogs and FAQ category chips ("All"), estimator weight unit button, booking steps and the contact page hub card. This is your "checked/selected state matches the background and disappears" complaint.
Related: 80 files hard-code hex colours (`#002147` x232, `#F2B705` x204, `#071A33`, `#001A38`, `#0B2445`, `#F6F6F4`, `#16A34A`, `#10B981`) and there are 890 `dark:` overrides, so light and dark drift apart. There are two UI kits (`src/components/ui` and `src/design/primitives`).
Also visible in the estimator (seen): the option cards are `div role="checkbox"` with a white background and a very faint border.

## 3. Hover, pointer, cursor, magnetic
- **No pointer cursor** on 56 unique interactive elements (33 on the home page alone): Tailwind's reset leaves buttons with the arrow cursor and the code never restores it.
- **No visible hover change** on 75 of the 176 buttons/links tested (43%), including nav items ("Home", "Services"), the logo, "Sign in", the theme toggle, the phone and email links, "Read Guide", "Open Maps", "Explore ...".
- **Magnetic button:** `MagneticButton.tsx` exists but is not used anywhere.
- **Custom cursor** is mounted globally outside admin. It was not judged visually here (a headless browser has no real cursor); Phase 8 sets the criteria.
- Hover colours do not follow the rule you asked for (blue things to golden shades, yellow things to oxford shades); most use `translateY` and a shadow only.

## 4. National / domestic cargo (still everywhere)
A word-boundary search (`national`, `domestic`, `courier-nat`, `haulage-nat`, `nat-express`, `inland`, `within nepal`, `hub-to-hub`) finds about **166 lines in 47 files**: components 33, pages 32, estimator 12, admin 19, services 25, data 10, Supabase 14, scripts 11, tests 10. Visible examples (seen): home hero filters "National Freight" and "Nepal National Express"; home estimator has an International / National switch; services filter "Nepal National" and a service card tagged "National & Regional" ("Surface & Overland Freight", mixed with cross-border content); rates tabs "Nepal Domestic Surface" and "Hub-to-Hub"; booking step 1 card "Nepal Domestic Freight". Also in the engine, the services data, `national_rates` table, admin editors, FAQs, policies, chatbot knowledge, SEO, sitemap and prerender routes.

## 5. Text that breaks or wraps (seen)
Per route at 360 px the browser run found labels that wrap inside controls and words that break:
- Home: "GET ESTIMATE →" wraps to two lines in the hero button; "OPEN FULL WAYBILL RATE ESTIMATOR" wraps to three; filter chips "ALL CORRIDORS (14)", "GLOBAL AIRWAY", "NATIONAL FREIGHT", "CROSS-BORDER EXPORT", "NEPAL NATIONAL EXPRESS" wrap.
- Rates: "CROSS-BORDER INTERNATIONAL", "190+ COUNTRIES", "NEPAL DOMESTIC SURFACE", "HUB-TO-HUB" (a word split), "+ ADD SIZE", "WHATSAPP QUOTE".
- Phone number `+977-057-520000` breaks at its hyphens on home, about and contact.
- Booking: all four step labels wrap, plus the "Worldwide Export" and "Nepal Domestic Freight" cards.
- Contact hub buttons, FAQ "WhatsApp Dispatch", Track and 404 "Book Pickup".
- **Your screenshot:** the header "SIGN IN" wraps to two lines and "BOOK PICKUP" too, inside fixed-height pills.
Totals (unique): 27 labels that wrap, 2 words that break in the middle, 0 text clipped. Cause: uppercase + wide letter-spacing + mono/heavy font in narrow, fixed-height controls, with no `nowrap`.

## 6. Words and claims
- Very long navigation labels: "Company Overview & Hubs", "Branch Offices & Dispatch", "Customs & Regulatory Rules", "Careers & Opportunities", "Frequently Asked Questions", "Employee / Staff Sign In", "Logistics Knowledge & News" (header and More sheet).
- Long, jargon-heavy copy (seen on home): "Integrated Air, Surface & Customs Infrastructure", "Verified 3-stage chain of custody with real-time waypoint scanning", "Port-to-door estimate", "Interline EDI Tracking Synchronization", "Volumetric divisor 5000 cm3/kg".
- **Claims with no evidence in the repo:** "99.4% Verified On-Time Manifest Rate", "190+ international ports" (10 places), "IATA Certified Packaging", "Direct air manifests with Qatar Airways, Emirates and Thai Cargo". And **claims the system cannot do**: "real-time waypoint scanning", "GPS-tracked fleet", "EDI Live Sync", "telematics". Tracking is updated by staff.

## 7. Colour contrast (light theme, 360 px)
Beyond the invisible cases there are 26 unique texts under WCAG AA: grey-blue helper text (about 2.6:1) on the login pages, footer and "Main Page / Find your delivery / Help & Support" captions; green status text (3.3:1); "WhatsApp Quote" white on WhatsApp green (2.0:1). These are soft findings; the big ones are in section 2.
Dark theme: run `npm run qa:ui` with `--theme dark` for the full list. See the "Dark theme sample" at the end of this file if the run finished.

## 8. Other findings
- `public/` is missing from the zip: 4 tests fail (manifest, service worker, offline page, PNG icons and og-banner) and `/sw.js` returns 404 on every page. If your real repo has `public/`, ignore the zip; otherwise regenerate.
- `npm run lint` passes with 0 errors but 298 warnings (mostly unused variables).
- Large vendor chunks: `vendor-map` 394 KB (151 KB gzip) and `vendor-three` 531 KB (132 KB gzip). They are split, but check they load only where used.
- `ThemeContext` and dark mode are kept; the previous phase moved the style to soft clay shadows and rounded corners. I kept that direction because you did not object to it.
