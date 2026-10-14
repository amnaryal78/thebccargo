# 00 — Audit of `production_project.zip`

Read this first. It records what the code is today, so later phases don't re-discover it.
Anything marked **VERIFY** was seen in the code but not run. The audit sandbox had no npm registry access, so `npm run build` and `tsc` were **not** executed. The agent must run both in Phase 0.

## 1. What exists today

| Area | Finding |
|---|---|
| Stack | Vite 8, React 19, TypeScript, Tailwind 4, react-router 7, framer-motion, Supabase (auth, DB, edge functions), `dotted-map`, lucide-react |
| Server | `server.js`: dependency-free Node server. It serves `dist/`, has an SPA fallback, `/api/chat` and `/api/fix-blog` (OpenRouter proxy) and `/api/health`. |
| Backend | Supabase with 4 migrations. Tables: shipments, milestones, bookings, national_rates, international_rates, blogs, services, faqs, reviews, partners, careers, job_applications, inquiries, policies, site_settings, analytics_events, audit_logs, user_roles, air_waybills, pod_documents, notifications. Edge functions: submit-booking, submit-inquiry, submit-job-application, generate-awb, create-signed-file-url, bc-cargo-chat, process-shipment-notification. |
| Routes | `/`, `/track`, `/book`, `/services`, `/rates[/national\|international\|calculator\|rfq]`, `/blogs[/:slug]`, `/about`, `/contact`, `/policies`, `/faq`, `/careers[/:slug]`, `/login`, `/admin/login`, `/admin/*` |
| Size | About 16k lines of TS/TSX. `AdminDashboardPage.tsx` is **1,812 lines**, `RatesPage.tsx` is 871, and `LogisticsMotionGraphicSection.tsx` is 800. |
| Good, keep | Supabase schema and RLS direction, edge functions, role allow-list auth, route-level lazy loading, `SEOHead`, blog CMS plus AI blog fixer, chatbot proxy, volumetric-weight logic, `prefers-reduced-motion` and `pointer: fine` guards for the cursor |

## 2. Why it feels "not professional" (design root causes)

1. **Palette is wrong.** It is dominated by bright UI-blue `#0B5ED7`, which appears about 334 times, plus `#2F80ED`, `#60A5FA` and `#38BDF8`. None of these are Oxford Blue. Yellow is used as a small accent, not as a brand colour.
2. **Gradients exist** in 14 places: the hero, a Rates card, the FAQ CTA, the Footer social icons (an Instagram-style rainbow), the chatbot, the logo and the world map. All must go.
3. **Typography is the stock AI/SaaS pair**, Inter plus Plus Jakarta Sans.
4. **Template tells:** pill badge with a pulsing green dot ("Connecting Nepal & the world"), centered H1 + subtitle + search card, mono uppercase micro-labels everywhere, and "Live Updates" with a ping dot on a feature that does not work.
5. **The hero is a tracking box for a tracking system that has no data source.** `App.tsx` seeds fake `INITIAL_SHIPMENTS` into localStorage and shows them as if they were real. A real customer can read this as fraud.
6. **No 3D anywhere.** `LogisticsMotionGraphicSection` is 800 lines of 2D motion.
7. **Every page is a different layout language.** There is no shared section system.

## 3. Bugs and risks found

### Likely user-visible
- **Hero H1 has `whitespace-nowrap` at `text-2xl`** (`LandingPage.tsx`). The string is about 39 characters, so it overflows a 360px Android screen. `body` has `overflow-x: clip`, so it will be silently cut off. (VERIFY on a 360px viewport.)
- **Fake demo shipments** are shown to real users (see 2.5). Tracking must read only from Supabase `shipments`, with a clear empty and not-found state.
- **Admin sidebar lists 11 tabs**, but a grep of `activeTab ===` found renders only for overview, blogs, shipments, chatbot, users, cursor-messages and settings. **VERIFY** that inquiries, national-rates, international-rates and careers actually render. They may sit behind a different condition, or be dead tabs.
- Admin keeps `inquiries`, `shipments` and cursor messages in **localStorage** as the initial state (`getInitialInquiries()`, `secureDataStorage`). The admin can therefore see stale or local-only data that differs from the database, which is a classic "glitch".
- `/rates/*` serves one component with 4 tabs and no unique title or description per tab, so those URLs are weak for SEO.

### Security and config
- `authService.ts` returns a **hard-coded mock MFA secret** (`JBSWY3DPEHPK3PXP`) when Supabase is not configured. Delete the mock path. Admin must hard-fail when Supabase is missing.
- `secureStorage.ts` is XOR plus a salt that ships in the bundle. This is obfuscation, **not** encryption. Stop describing it as secure and stop storing business data in it.
- `server.js` sets `X-Frame-Options` but **no Content-Security-Policy**. (VERIFY other headers: HSTS, Referrer-Policy and Permissions-Policy.)
- `.env` was inside the zip. It contained placeholders only (`your…`), so there is no leaked key, but never ship `.env`. Confirm `.gitignore` and `.dockerignore` exclude it, and rotate keys if real ones were ever in it.

### SEO
- **Client-side rendered SPA.** `SEOHead` sets tags in `useEffect`, so crawlers that do not run JS see only the generic `index.html` title. Social previews (WhatsApp, Facebook) never run JS, so every link previews as the homepage.
- `og-banner.png` is referenced but **missing from `/public`**.
- `sitemap.xml` is hand-written, with 3 blog URLs hardcoded and no `/policies` or `/faq`. It must be generated from the DB at build time.
- JSON-LD uses one `#jsonld-schema` script that gets overwritten. There is no `Organization`, `LocalBusiness`, `Service`, `FAQPage`, `Article` or `BreadcrumbList` schema set per page.

### Engineering
- `npm test`: **2 of 3 test files fail** (`ERR_MODULE_NOT_FOUND` for `../lib/supabase`, caused by extensionless imports under `node --experimental-strip-types`). 4 of 6 tests pass. Move to **Vitest**.
- `lint` is an alias for `tsc`. There is no ESLint.
- Google Fonts is loaded render-blocking from a third party. Self-host with fontsource.
- 913 `dark:` variants, so dark mode is wired deeply. See DESIGN.md for the decision on this.

## 4. Decisions this audit leads to
1. **Keep** Vite, React, Supabase and the edge functions. Rewriting to Next.js would cost weeks and buy only SEO, which a prerender step also solves. See ARCHITECTURE.md.
2. **Rebuild the visual layer.** Tokens, type, the section system and all public pages. Do not restyle in place.
3. **Replace the hero** with an interactive "Route Table" and move tracking to a quiet secondary position.
4. **Add the Rate Estimator** as a first-class feature.
5. **Split and repair admin.**
6. **Fix SEO** with prerendering, per-page metadata and generated sitemaps.
