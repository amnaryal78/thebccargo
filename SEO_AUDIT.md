# SEO audit and implementation report

Date: 2026-10-23. Scope: thebccargo.com source in this repository. Nothing was deployed or pushed.
Scores below are the auditor's judgement, not tool output. Lighthouse, Search Console and a live crawl were NOT run in this session (UNVERIFIED).

## 1. Starting state

Already good (kept): static prerender of public routes into `dist/`, sitemap + robots, www to apex 301, real 404.html, `X-Robots-Tag: noindex` on `/admin` and `/login`, 43 country guides with Article + FAQPage JSON-LD, `llms.txt`, strong headers/caching in `vercel.json`, previous Lighthouse SEO 100 on sampled pages.

Problems found (the existing `seo:check` was green because it only checked structure, not truth):

| # | Problem | Severity |
|---|---------|----------|
| 1 | Prerender published pages and `JobPosting` JSON-LD for 4 jobs that do not exist in the app (career slugs are DB-driven), including a fabricated Birgunj address | High |
| 2 | Prerender published 3 articles that exist nowhere in the app or database, one crediting an invented author ("Prakash Adhikari, Senior Customs Broker") | High |
| 3 | Client JSON-LD re-injected `geo`, `postalCode`, `priceRange` and hours 08:00-19:00 after hydration, contradicting the static HTML and the footer (09:00-18:00) | High |
| 4 | After hydration, client code overwrote prerendered title/description on ~12 routes with different text; `/track` and `/book` kept the previous page's title and canonical (`/contact`) | High |
| 5 | Unverified claims in metadata and JSON-LD: "220+ destinations", "190+ airports", "48-72 hour SLA", licence #B-409, "since 2012", Pokhara/Birgunj hubs, a made-up `Offer` price (NPR 500) on `/rates` | High |
| 6 | Two competing org entities on the homepage (Organization + LocalBusiness "Central HQ") | Medium |
| 7 | Duplicate intent: `/send-parcel-nepal-to-<country>` pages vs `/blogs/nepal-to-<country>` guides, with conflicting delivery times (3-5 days vs the guides' none) | Medium |
| 8 | `/rates`, `/rates/international`, `/rates/rfq` render the same page with three indexable URLs | Medium |
| 9 | Invalid `og:type` ("service") on service and corridor pages | Low |
| 10 | Default canonical used `window.location.origin`, so a preview/staging host would self-canonicalise | Medium |
| 11 | `index.html` default title said "National & International" (site is international only) and "220+" | Medium |
| 12 | Sitemap hardcoded; published database posts (4 real ones) missing from sitemap and prerender | Medium |
| 13 | Europe/Gulf pages showed "4-6" and "2-4 business days" (not owner-supplied) | Medium |

## 2. Changes made

**New files**
- `src/data/business.ts`: single source for name, phone, address, hours, social links; builds the one LocalBusiness + WebSite JSON-LD used by both the app and the prerender.
- `src/data/pageMeta.ts`: single source of title/description for 14 static pages (read by pages and by the prerender).
- `scripts/app-data.mjs`, `scripts/published-blogs.mjs`: load app data (via jiti) and published Supabase posts at build time (public anon key, `published=eq.true`, logs only counts).
- `docs/SEO_CHECKLIST.md`: reusable per-page checklist. This file.

**Edited**
- `scripts/prerender.mjs`: metadata now generated from `PAGE_META`, `SERVICES_CATALOG` and DB posts; fabricated blog/career/legacy pages and the fake `Offer` removed; org entity from `business.ts`; `robots` meta and `og:locale` added; valid `og:type`; crawlable guide links on home, `/blogs`, `/rates`.
- `scripts/generate-sitemap.mjs`: removed redirected/removed URLs, added published DB posts with real `lastmod`.
- `scripts/seo-check.mjs`: now also fails the build on unverified-claim strings, `JobPosting`, `priceRange`, `postalCode`, `GeoCoordinates`, more than one `<h1>`, invalid `og:type`, and a sitemap URL that `vercel.json` redirects.
- `src/components/SEOHead.tsx` (canonical default is the production origin), `LandingPage.tsx`, `RatesPage.tsx`, `ServicesSuite.tsx`, `AboutPage.tsx`, `ContactPage.tsx`, `CareersPage.tsx`, `BlogListPage.tsx`, `FaqPage.tsx`, `PoliciesPage.tsx`, `HowToShipPage.tsx`, `ServiceDetailPage.tsx`, `TrackingSection.tsx`, `BookingSystem.tsx`, `country/CountryLandingPage.tsx`: use `PAGE_META`/`seoTitle` so hydrated metadata equals static metadata.
- Copy: removed "190+/220+" counts (home hero, estimator slot, partner slider, chatbot, server prompt, services data), removed licence number from FAQ, policies, service meta and country data, removed GPS-telemetry claims from the overland service, replaced Europe/Gulf day counts with "ask us".
- `index.html`, `public/llms.txt`: default title/description corrected; llms.txt lists guides and no unverified delivery times (Korea about 10 and Japan about 15 days kept: recorded earlier as owner-aligned).
- `src/App.tsx`, `vercel.json`: redirects below.
- Tests updated, not loosened: `tests/prerender.test.ts` (now asserts the fabricated pages are gone), `tests/country-seo.test.ts` (asserts the 301s), `tests/seo-static.test.ts` (reads `PAGE_META`; adds claim and length guards).

**Redirects added (301, in `vercel.json` and `App.tsx`)**
`/send-parcel-nepal-to-{south-korea,malaysia,japan,hong-kong,usa}` to `/blogs/nepal-to-<same>`; `/send-parcel-nepal-to-uk` to `/blogs/nepal-to-united-kingdom`; `/rates/international`, `/rates/rfq` to `/rates`; four `/careers/<old-slug>` to `/careers`; three old `/blogs/<slug>` to `/blogs`.

**New routes/pages:** none. No country pages were invented; the 43 existing guides are the country-route architecture (`/blogs/nepal-to-<country>`), now linked from the static HTML of home, `/blogs`, `/rates` and the regional pages.

## 3. Decisions

- **Country URLs:** the guide route `/blogs/nepal-to-<country>` is kept as canonical (its content is more complete and has no unsupported claims). Moving to `/shipping/...` would break 43 indexed URLs for no ranking gain.
- **Structured data:** LocalBusiness + WebSite on home only (one entity); Service on service pages; Article + FAQPage on guides (FAQ is visible); BlogPosting on DB posts using real dates; BreadcrumbList on every non-home page. No ratings, prices, geo, jobs or invented people.
- **hreflang:** not implemented on purpose. English and Nepali are an in-page toggle on one URL, not separate URLs, so there are no equivalent pages to annotate. Adding `/ne/` routes with real Nepali titles and content is the correct next step if Nepali search traffic matters.
- **Sitemap:** generated at build from code plus published Supabase rows (drafts excluded). Not a sitemap index (65 URLs).
- **Soft 404:** unknown `/blogs/<x>` still returns 200 with the in-app not-found page (noindex) because posts are dynamic. A real 404 would need a build-time slug list or an edge function.

## 4. Validation performed (this session)

| Check | Result |
|-------|--------|
| `tsc --noEmit` | clean |
| `vitest run` | 28 files, 205 tests pass |
| `vite build` + prerender (65 pages) + sitemap | pass |
| `seo:check` | pass; 2 warnings, both for one DB post (81-char title, 180-char description) |
| Bundle budget | pass (initial 2.06 KB gz) |
| Browser, 16 routes, dev server | hydrated title, description, canonical equal static values; one H1 each; all canonicals on production origin |
| Browser, hydrated homepage JSON-LD | LocalBusiness + WebSite only; hours 09:00-18:00; no geo |
| Browser, 4 legacy URLs | all redirect client-side as intended |
| Internal-link scan of prerendered HTML | no broken links |

NOT verified: Lighthouse / Core Web Vitals (no new measurement; earlier worklog: home mobile 93-95), Google Rich Results Test, Search Console coverage, HTTP behaviour of the new Vercel redirects (only testable after deploy), image optimisation pass, keyboard/contrast audit (earlier a11y audit reported 100), live crawl for redirect chains.

## 5. Score (judgement)

- On-site technical/on-page before: about 70/100. Structure was strong but several published facts were false or unsupported and metadata changed after hydration.
- On-site technical/on-page after: about 82/100.
- Why not 95 yet: (a) in-body owner facts still unconfirmed (below); (b) no Nepali URLs; (c) image alt/size/format pass and CWV re-measure not done; (d) 3 pages have thin supporting content (services copy is largely unverified marketing text); (e) soft 404 on unknown blog slugs; (f) no Rich Results validation run.
- External authority (backlinks, Google Business Profile, reviews, Search Console history): UNVERIFIED and outside code; it caps ranking potential regardless of the on-site score.

## 6. Owner must confirm (nothing was invented)

1. Customs licence **#B-409**: still shown in Footer, `copy.ts`, `settingsService.ts`, service detail page, printed bills, chatbot and server prompt. Removed from metadata, JSON-LD, FAQ, policies and llms.txt until you confirm it. Restore wherever proof exists.
2. Whether BC Cargo actually offers **overland (Nepal-India), ocean FCL/LCL and customs brokerage** as services; all four service pages and their body copy come from `servicesData.ts` and are unverified. Also "daily scheduled flights", "IATA agent", "CAAN escort" lines there.
3. About page says "The Black Coffee Cargo & Courier": confirm this is the intended expansion of "BC".
4. Delivery times for every country except Korea (10) and Japan (15); then they can be added to guides.
5. Postal code, map coordinates, price range: supply if you want them in structured data.
6. The 4 fallback articles in `blogService.ts` (shown only if the database is empty) contain unverified statements; review before relying on them.
7. DB post "Air Cargo Export Guidelines from TIA" needs a shorter title (about 60) and description (about 155).
8. Google Business Profile details (name, hours, category) so the site matches exactly; Search Console property access.
9. Social profile URLs in the footer are used as `sameAs`; confirm they are yours.
10. Genuine photos of the office/team and any real customer reviews you are allowed to publish.
