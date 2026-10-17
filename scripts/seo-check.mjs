/**
 * Post-build SEO and launch checks over dist/. Run after `npm run build`:
 *   node scripts/seo-check.mjs
 * Exits 1 when a check fails, so it can gate a deploy.
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const SITE = 'https://thebccargo.com';
const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

if (!fs.existsSync(DIST)) {
  console.error('dist/ not found. Run the build first.');
  process.exit(1);
}

const htmlFiles = [];
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.html')) htmlFiles.push(p);
  }
})(DIST);

const rel = (f) => path.relative(DIST, f).replace(/\\/g, '/');
const routeOf = (f) => {
  const r = rel(f).replace(/index\.html$/, '').replace(/\.html$/, '');
  return '/' + r.replace(/\/$/, '');
};
const pick = (h, re) => (h.match(re) || [])[1] || '';
const PRIVATE = /^\/(admin|login|offline)/;
const titles = new Map();
const routes = new Set(htmlFiles.map(routeOf));

for (const f of htmlFiles) {
  const name = rel(f);
  const h = fs.readFileSync(f, 'utf8');
  const route = routeOf(f);
  const title = pick(h, /<title>([^<]*)<\/title>/);
  const desc = pick(h, /<meta name="description" content="([^"]*)"/);
  const canon = pick(h, /<link rel="canonical" href="([^"]*)"/);
  const robots = pick(h, /<meta name="robots" content="([^"]*)"/);
  const og = pick(h, /<meta property="og:image" content="([^"]*)"/);
  const isPublic = !PRIVATE.test(route) && name !== '404.html';

  if (/localhost|127\.0\.0\.1/.test(h)) fail(`${name}: contains a localhost URL`);
  if (/lorem ipsum|vite \+ react|react app/i.test(h)) fail(`${name}: default framework or placeholder text`);
  if (/aggregateRating|ratingValue|reviewCount/.test(h)) fail(`${name}: contains rating structured data`);
  if (!title) fail(`${name}: missing <title>`);
  if (title.length > 70) warn(`${name}: title is ${title.length} characters (aim for 60 or fewer)`);
  if (isPublic) {
    if (!desc) fail(`${name}: missing meta description`);
    else if (desc.length > 170) warn(`${name}: description is ${desc.length} characters`);
    if (!canon) fail(`${name}: missing canonical`);
    else if (!canon.startsWith(SITE)) fail(`${name}: canonical ${canon} is not on ${SITE}`);
    if (/noindex/i.test(robots)) fail(`${name}: public page is noindex`);
    if (!og) warn(`${name}: no og:image`);
    else if (og.startsWith(SITE + '/') && !fs.existsSync(path.join(DIST, og.slice(SITE.length + 1)))) fail(`${name}: og:image file missing (${og})`);
    if (!(h.match(/<h1[\s>]/g) || []).length) warn(`${name}: no <h1> in the prerendered HTML`);
    (titles.get(title) ?? titles.set(title, []).get(title)).push(name);
  }
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch {
      fail(`${name}: invalid JSON-LD`);
    }
  }
  for (const m of h.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(m[0])) fail(`${name}: <img> without alt: ${m[0].slice(0, 80)}`);
  }
}
for (const [t, list] of titles) if (list.length > 1) fail(`Duplicate title "${t}" on ${list.join(', ')}`);

const robotsPath = path.join(DIST, 'robots.txt');
if (!fs.existsSync(robotsPath)) fail('robots.txt missing');
else {
  const r = fs.readFileSync(robotsPath, 'utf8');
  if (!r.includes(`Sitemap: ${SITE}/sitemap.xml`)) fail('robots.txt does not point to the production sitemap');
  if (/^Disallow:\s*\/\s*$/m.test(r)) fail('robots.txt blocks the whole site');
  for (const need of ['/admin']) if (!r.includes(`Disallow: ${need}`)) fail(`robots.txt does not block ${need}`);
}

const smPath = path.join(DIST, 'sitemap.xml');
if (!fs.existsSync(smPath)) fail('sitemap.xml missing');
else {
  const sm = fs.readFileSync(smPath, 'utf8');
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!urls.length) fail('sitemap.xml has no URLs');
  const seen = new Set();
  for (const u of urls) {
    if (!u.startsWith(SITE)) fail(`sitemap URL off-domain: ${u}`);
    if (/localhost|\?|#/.test(u)) fail(`sitemap URL not clean: ${u}`);
    if (seen.has(u)) fail(`sitemap duplicate: ${u}`);
    seen.add(u);
    const route = new URL(u).pathname.replace(/\/$/, '') || '/';
    if (PRIVATE.test(route)) fail(`sitemap lists a private route: ${u}`);
    if (!routes.has(route) && route !== '/') warn(`sitemap URL has no prerendered page (client route only): ${u}`);
  }
}

// Internal links in prerendered pages must point at a real route or file.
for (const f of htmlFiles) {
  const h = fs.readFileSync(f, 'utf8');
  for (const m of h.matchAll(/<a\b[^>]*\bhref="(\/[^"#?]*)"/g)) {
    const href = m[1].replace(/\/$/, '') || '/';
    if (routes.has(href) || fs.existsSync(path.join(DIST, href))) continue;
    if (/\.(png|jpg|jpeg|webp|svg|pdf|xml|txt|json|ico)$/i.test(href)) continue;
    warn(`${rel(f)}: link to ${href} has no prerendered page (may be a client route)`);
  }
}

console.log(`Checked ${htmlFiles.length} HTML pages.`);
if (warnings.length) console.log(`\nWarnings (${warnings.length}):\n- ${[...new Set(warnings)].slice(0, 40).join('\n- ')}`);
if (errors.length) {
  console.error(`\nFailures (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log('\nAll SEO checks passed.');
