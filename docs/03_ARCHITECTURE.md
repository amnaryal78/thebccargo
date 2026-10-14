# 03 — ARCHITECTURE

## 1. Decision: keep the current stack, evolve it
| Option | Verdict |
|---|---|
| **A. Keep Vite + React 19 + Supabase, add build-time prerender** | **Chosen.** Zero rewrite of working auth, DB, edge functions and admin logic. Prerender solves the SEO weakness. |
| B. Migrate to Next.js (App Router) | Best SEO story in theory, but a multi-week rewrite of 16k lines, a different hosting model, and extra complexity for a small team. Revisit only if A fails Phase 6 SEO checks. |
| C. Astro for public pages plus React islands | Excellent for mobile performance, but it splits the codebase in two and the Supabase auth and admin glue is duplicated. Skip. |

**Why A is "the best" for this project:** the public site is content plus a few interactive islands, the admin is a pure SPA behind login, and Supabase already supplies the data layer. A prerender step gives crawlers and WhatsApp previews real HTML without changing the runtime model.

## 2. Target structure
```
src/
  app/            router, providers, route table (route metadata lives here)
  design/         tokens.css, fonts.css, primitives (Button, Input, ...)
  features/
    hero/         RouteTable (3D + 2D), destination panel
    estimator/    calc engine (pure TS), UI, rules hooks
    services/  rates/  tracking/  booking/  blog/  careers/  contact/  about/
    chatbot/
    admin/
      shell/      layout, nav, guards
      shipments/ inquiries/ rates/ handling-rules/ blogs/ careers/ users/ settings/ audit/
  lib/            supabase client, seo helpers, device-capability, format
  server/         (see §4)
scripts/          prerender.ts, generate-sitemap.ts, contrast-check.ts
tests/            unit (Vitest), e2e (Playwright)
docs/
```
Rules: one feature = one folder. No file over ~400 lines. Pages are thin and compose features. Services (data access) are the only place that talks to Supabase.

## 3. Rendering and SEO pipeline
1. `vite build` produces the client bundle.
2. `scripts/prerender.ts` starts a local preview and uses **Playwright (already present in the environment)** to visit every public URL. The URL list = static routes + `blogs.slug` + `services.slug` + `careers.slug` from Supabase (read with the anon key, published rows only). It saves the rendered HTML to `dist/<route>/index.html`.
3. `generate-sitemap.ts` writes `sitemap.xml` (with real `lastmod`) and `robots.txt` from the same URL list. `/admin` and `/login` are `noindex` and `Disallow`.
4. `SEOHead` becomes a typed `<Seo>` that sets per-route title, description, canonical, OG and Twitter tags, and a **list** of JSON-LD blocks (no single overwritten script id). It runs at prerender time, so tags are in the static HTML. Social crawlers then see the right preview.
5. `server.js` serves `dist/<route>/index.html` first, then falls back to `index.html`. It gets gzip/brotli, long immutable caching for hashed assets, and a CSP.
6. Schemas: `Organization` + `LocalBusiness` (Home/Contact), `Service` (service pages), `FAQPage`, `Article` + `BreadcrumbList` (blogs), `JobPosting` (careers).
7. Fallback if Playwright prerender is blocked in CI: `vite-react-ssg` (verify React 19 / Router 7 compatibility before adopting).

## 4. Server and security
- Keep `server.js`. Add **CSP** (allow self, Supabase, Turnstile and the font host if any remains), HSTS, `Referrer-Policy`, `Permissions-Policy`, `X-Content-Type-Options`, plus rate limiting on `/api/chat` and `/api/fix-blog`.
- Keys stay server-side. `.env` is never packaged. The Dockerfile must `COPY` explicit files.
- Auth: Supabase Google OAuth plus the `user_roles` allow-list plus MFA, **with the mock path removed**. In the absence of Supabase config, admin renders a hard error, never demo data.
- Replace `secureDataStorage` (XOR) for business data with nothing. Server data lives in Supabase. localStorage is allowed only for UI preferences (theme, last estimator inputs).
- RLS: re-audit each table against roles (public read only on published rows, writes only through edge functions or admin roles). Add tests for the anon role.

## 5. Data
Existing schema stays. Add (new migration `…_estimator_rules.sql`):
```
handling_rules(id, flag text check in ('liquid','meat','medicine','other'),
  country_code text null, mode text null, allowed bool default true,
  surcharge_type text check in ('flat_npr','per_kg_npr','percent'), surcharge_value numeric,
  requirements_md text, is_placeholder bool default true, active bool default true, updated_at)
rate_settings(key text pk, value jsonb)   -- fuel %, handling fee, USD→NPR rate, min charge
```
- RLS: anon `select` where `active`. Writes limited to `admin` and `super_admin` roles. All writes go to `audit_logs`.
- Seed rows are flagged `is_placeholder = true`. The UI shows a warning in admin and a softer "confirm with us" note on the public site while any placeholder applies.
- `services` gets `slug`, `seo_title`, `seo_description`, `faq jsonb` if they are missing.

### Estimator engine (pure TS, in `features/estimator/engine.ts`)
```
chargeable = max(actual, L*W*H/divisor)            // 5000 air, 6000 overland (existing)
band       = lookup international_rates | national_rates by chargeable
base       = band price (+ per-kg above the top band if the table defines it)
adds       = fuel% + handling + Σ applicable handling_rules surcharges
total      = max(minCharge, base + adds)
range      = [total*0.95, total*1.10] rounded to nearest 10   // shown as an estimate
blocked    = any applicable rule with allowed=false  → show "Contact us", no price
```
Fully unit-tested (Vitest) with table-driven cases, including edge weights, missing bands and blocked flags.

## 6. Performance architecture
- Route-level code splitting (exists). The 3D hero is a **separate dynamic import**, gated by `lib/device-capability.ts` (`canRender3D()`).
- Images: AVIF/WebP with `srcset`, explicit `width`/`height`, and `loading="lazy"` below the fold. The hero LCP element is HTML text, never the canvas.
- 3D assets: GLB, Draco/meshopt, ≤ 400 KB each. Textures ≤ 1024px. No HDR env maps.
- Libraries added: `three`, `@react-three/fiber`, `@react-three/drei` (only imported inside the lazy 3D chunk), `gsap`, `lenis` (desktop chunk only). Remove `framer-motion` from critical paths where CSS can do it. Keep it only where it earns its weight.
- Cache rates, services and settings with stale-while-revalidate (a small fetch wrapper). The estimator works offline from the last cache.
- CI budget check: fail the build if the initial mobile JS gz > 170 KB.

## 7. Testing and tooling
- **Vitest** replaces the broken `node --test` setup (fixes the 2 failing files). Playwright e2e covers estimator, booking, admin login guard and prerender output (assert `<title>` and JSON-LD in static HTML).
- ESLint (typescript-eslint, react-hooks, jsx-a11y), Prettier, and `tsc --noEmit` in CI.
- `scripts/contrast-check.ts` validates every token pair.
- Lighthouse CI with the thresholds in the PRD.

## 8. Deployment
Docker image (exists) or any Node host. The build is `vite build && node scripts/prerender.ts && node scripts/generate-sitemap.ts`. Health check `/api/health` (exists). Supabase migrations are applied with the CLI.
