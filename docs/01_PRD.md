# 01 — PRD: The BC Cargo & Courier (v2)

## 1. Product
A modern cargo and courier website for a Nepal-based company (HQ Hetauda). It handles national and international shipping.
**Primary users:** senders in Nepal (individuals, small businesses, and families in Nepal sending to relatives abroad).
**Primary device: Android phone** (mid-range, mobile data, Chrome). Desktop gets the advanced experience.
**Business goals:** more booking and quote enquiries, more WhatsApp contacts, trust, and Google ranking for Nepal cargo and courier searches.

## 2. Principles
1. **Android-first, desktop-enhanced.** The mobile build is complete and fast. Desktop adds 3D, scroll choreography and hover depth.
2. **Honest.** No fake tracking data, no fake "live" indicators, and no invented testimonials. The estimator always says "estimate".
3. **Every section does something.** Each section has at least one real interaction (see §5). No static text walls.
4. **One design system** across Home, Services, Rates, About, Careers, Blogs, Contact and Admin.
5. **No vibe-coded look.** See DESIGN.md "Anti-template rules". They are acceptance criteria.

## 3. Scope
**In:** public site redesign, 3D hero, rate estimator, SEO and prerender, admin repair and redesign, PWA basics, tests.
**Out (later):** live carrier tracking APIs (no budget), online payment, customer accounts, native app.
**Tracking policy (no API):** `/track` reads the `shipments` and `shipment_milestones` tables. Operations staff update them in admin, and the existing `process-shipment-notification` function can message customers. If an AWB is not found, show a clear message plus WhatsApp and call buttons. Demo AWBs are removed from production.

## 4. Information architecture
```
/                    Home
/services            Services overview
/services/:slug      One page per service (air, express, overland, customs, ...)  ← SEO landing pages
/rates               Rate Estimator (default)  + /rates/national  /rates/international  /rates/rfq
/track               Track by AWB (manual-data)
/book                Booking
/about               About
/careers, /careers/:slug
/blogs, /blogs/:slug
/contact, /faq, /policies
/admin/*             Admin (noindex)
```

## 5. Functional requirements

### 5.1 Home
| Section | Dynamic behaviour |
|---|---|
| **Hero: Route Table** | Replaces the old tracking hero. **Desktop:** a 3D globe with Kathmandu/Hetauda as the hub and animated arcs. Hover or click a destination to open a panel with transit time, "from" price (from the DB), service type and a "Get estimate" button. **Android:** a lightweight 2D dotted map (SVG/canvas). Tap a destination to open the same panel as a bottom sheet. Optional gentle 3D tilt of a parcel from device orientation (opt-in, reduced-motion safe). Headline is short (≤ 8 words), wraps, and never uses `nowrap`. Primary CTAs: **Get estimate** and **Book pickup**. Track is a compact secondary field, not the centrepiece. |
| Service picker | 3D-tilt cards (desktop) or swipeable cards (mobile). Selecting one filters the "how it works" timeline below. |
| How it works | Scroll-driven 3-step timeline: pickup → customs and packing → delivery. Each step expands. |
| Mini estimator | The same component as /rates, with a compact variant. |
| Network and hubs | Interactive map of hubs from `RegionalHubsMap`, restyled. Click a hub for address, hours, one-tap call and directions. |
| Numbers | Counters animate once on view. Values come from `site_settings`, never invented. |
| Trust | Partners marquee (pauses on touch) and real reviews from the `reviews` table. If there are none, the section is hidden. |
| Latest blogs | 3 cards from the DB. |
| FAQ | Search-as-you-type accordion with `FAQPage` JSON-LD. |
| Final CTA | Sticky WhatsApp and Call on mobile. |

### 5.2 Rate Estimator (new, headline feature)
Lives at `/rates`, embedded compact on Home, and reused in the hero panel.

**Inputs**
- Shipment type: International / National.
- **Destination country** (searchable list with flags from `international_rates`) or national region.
- **Weight (kg)**, with optional dimensions L×W×H. It reuses the existing volumetric logic and shows the chargeable weight.
- **Content flags (Yes/No toggles):** Liquid · Meat / food of animal origin · Medicine (use icons from the custom set, not emoji). Other fields: item category and declared value (optional).

**Output**
- Animated **estimated bill counter** (NPR primary, USD secondary for international), with a breakdown: base freight, fuel and handling, special-handling surcharge, and a total range (e.g. `NPR 4,200–4,800`).
- **Flag-aware guidance panel.** For each Yes flag, show a requirements card (packaging, documents, permits, "may be restricted for this destination") and a surcharge line if one is set.
- Always show: "Estimate only. Final price is confirmed after weighing and inspection."
- CTAs: Book this shipment (prefilled), Send on WhatsApp (prefilled text), Download or print the quote.

**Rules engine (data, not code)**
- New table `handling_rules` (flag, country_code nullable, surcharge_type, surcharge_value, allowed_mode, requirements_md, active). Admin edits it.
- New table `fuel_handling_settings`, or reuse `site_settings`.
- ⚠ **The company must supply the real rules, surcharges and prohibited lists.** Seed with clearly marked `PLACEHOLDER` rows and a visible admin banner, "Placeholder rules, confirm before launch". The agent must **not** invent legal or regulatory claims.
- Blocked combinations (e.g. a country that does not accept the item) show "Contact us" instead of a price.

**Acceptance:** the maths is unit-tested, runs offline from cached rates, is usable with one thumb at 360px, and every control has a visible label (no placeholder-only inputs).

### 5.3 Services
Overview page: interactive comparison (select 2 services, compare speed, size limit, best-for). Detail pages `/services/:slug`: hero, a "what we carry / don't carry" list, a process timeline, a mini estimator preselected to that service, FAQs, and `Service` JSON-LD. Content comes from the `services` table.

### 5.4 About
Story timeline (scroll-pinned on desktop, vertical on mobile), hub map, values, team cards, and compliance and licence badges (only real ones, from `site_settings`).

### 5.5 Careers
Filter by department, type and location. Job cards expand inline. The apply form is a stepper (details → CV upload → submit) with progress, file validation, Turnstile and a clear success state. `JobPosting` JSON-LD.

### 5.6 Blogs
Category chips, search, reading time, a sticky table of contents on desktop, a progress bar and share. A related-posts rail. `Article` + `BreadcrumbList` JSON-LD. The existing CMS and AI fixer are kept.

### 5.7 Contact
Hub selector that updates the map, hours and "open now" status (computed from the real timezone Asia/Kathmandu). The inquiry form validates inline. One-tap WhatsApp, call and email.

### 5.8 Global
- Android bottom navigation (Home · Rates · Track · Book · More). Desktop gets a top nav.
- Persistent Call and WhatsApp buttons on mobile. They must not cover content or the bottom nav.
- Chatbot kept, restyled, and lazy-loaded after first interaction.
- PWA: manifest, icons, and offline shell for Rates and Contact.
- Language: English now. Structure for a Nepali toggle later. Do not build it in this scope.

### 5.9 Admin (repair + redesign)
Same tokens as the site, plus a dense, table-first layout.
- Split `AdminDashboardPage.tsx` into one module per tab. Each tab is a route (`/admin/shipments`, …).
- Remove localStorage as the source of truth. Supabase only, with loading, empty and error states and optimistic updates.
- **VERIFY and fix** the dead tabs (inquiries, rates, careers).
- Add: handling-rules editor, rates editor with CSV import, shipment milestone quick-add, and an audit-log viewer.
- Mobile admin: tables collapse to cards. Actions sit in a bottom sheet.
- Remove the mock MFA path. Show a hard error when Supabase is not configured.
- Role-based UI: hide actions the role can't use, and enforce them with RLS.

### 5.10 SEO (requirements)
Prerendered HTML for every public route (including DB-driven blog and service slugs), unique title and description per URL, canonical, OG and Twitter images (create `og-banner.png` and per-post images), multiple JSON-LD types, a generated `sitemap.xml` and `robots.txt`, semantic headings (one H1 per page), image `alt`, `width`/`height`, `hreflang` placeholder, and Core Web Vitals targets (see §6).
Target keywords (used naturally, never stuffed): "cargo from Nepal", "courier Nepal to <country>", "air cargo Kathmandu", "Hetauda courier", "customs clearance Nepal".

## 6. Non-functional
| Metric | Target (mobile, mid-range Android, throttled 4G) |
|---|---|
| LCP | ≤ 2.5 s |
| INP | ≤ 200 ms |
| CLS | ≤ 0.1 |
| Initial JS (gzip) | ≤ 170 KB for `/` on mobile. 3D chunk is lazy and desktop-only. |
| Lighthouse (mobile) | Perf ≥ 85, A11y ≥ 95, SEO ≥ 95, BP ≥ 95 |
| Accessibility | WCAG 2.2 AA, touch targets ≥ 44px, `prefers-reduced-motion` respected |
| Browsers | Chrome/Android 100+, Safari iOS 15+, current desktop browsers |

**3D gating:** load WebGL only if `matchMedia('(min-width:1024px) and (pointer:fine)')`, `!navigator.connection?.saveData`, no reduced-motion, `hardwareConcurrency ≥ 6` (when available) and WebGL2 is present. Otherwise use the 2D fallback. Both are acceptance-tested.

## 7. Success metrics
Booking and quote submissions, estimator completion rate, WhatsApp clicks, mobile bounce rate, organic impressions for "cargo from Nepal", "courier Nepal to <country>" and similar searches, and Lighthouse scores above.

## 8. Open questions for the owner (agent must not guess)
1. Real surcharge and prohibited rules for liquid, meat and medicine, and per country.
2. Real contact numbers, WhatsApp number, hub addresses and opening hours.
3. Real licences, certifications and company numbers.
4. Logo source file (the current `BcLogo.tsx` uses gradients).
5. Real photos of the team, hubs and vehicles (stock photos are not acceptable on About).
