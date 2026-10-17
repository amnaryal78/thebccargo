# Phase 5 — SEO, PWA, performance, security headers

**Read:** 03_ARCHITECTURE §3, §4, §6, 01_PRD §5.10, §6.

## Tasks
1. Typed `<Seo>` component: per-route title (≤ 60 chars), description (≤ 155), canonical, OG and Twitter, and a **list** of JSON-LD blocks. Add the schemas listed in ARCHITECTURE §3.6.
2. `scripts/prerender.ts` (Playwright): render every public URL, including DB slugs, to `dist/<route>/index.html`. Add a test that asserts the title and JSON-LD exist in the **static HTML** for `/`, `/rates`, one blog, one service and one job.
3. `scripts/generate-sitemap.ts`: the sitemap with real `lastmod`, plus `robots.txt`. `/admin` and `/login` get `noindex`.
4. Create `og-banner.png` (1200×630, flat brand style) and per-post OG images (a fallback template).
5. `server.js`: serve prerendered HTML first, add gzip/brotli, CSP, HSTS, Referrer-Policy, Permissions-Policy, X-Content-Type-Options, and rate limits on `/api/*`. Re-test the chatbot and the blog fixer.
6. PWA: manifest, icons (maskable), a service worker that caches the shell, `/rates` and `/contact`, plus an offline page. Keep it small. Do not cache API writes.
7. Performance pass: image formats and sizes, preloads, lazy chunks, removal of unused deps, and a CI check on the initial mobile JS budget (≤ 170 KB gz).
8. Lighthouse CI on `/`, `/rates`, `/services`, one blog and `/contact`, mobile profile.

## Done when
Lighthouse mobile ≥ 85 perf and ≥ 95 for A11y, SEO and BP on those pages. A WhatsApp or Facebook link preview shows the right title and image for a blog URL (test with the OG debug tools, or inspect the static HTML if offline). CSP has no violations in the console.
