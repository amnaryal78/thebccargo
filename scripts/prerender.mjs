/**
 * Prerenders static HTML files for all public routes into dist/<route>/index.html
 * Injects static title, meta description, canonical, OpenGraph, Twitter, and JSON-LD schemas
 * Guarantees zero-JS social preview rendering (WhatsApp, Facebook, Twitter, Googlebot).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadCountryGuides } from './country-guides.mjs';
import { loadBusiness, loadPageMeta, loadServices } from './app-data.mjs';
import { loadPublishedBlogs } from './published-blogs.mjs';

const { organizationJsonLd, websiteJsonLd, organizationRef } = await loadBusiness();
const { PAGE_META } = await loadPageMeta();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const BASE_URL = 'https://thebccargo.com';

const OG = `${BASE_URL}/og-banner.png`;
const page = (title, description, extra = {}) => ({ title, description, ogType: 'website', ogImage: OG, ...extra });

// Static pages: title + description come from src/data/pageMeta.ts, the same map the page components render.
const ROUTE_METADATA = {};
for (const [route, m] of Object.entries(PAGE_META)) {
  ROUTE_METADATA[route] = page(m.title, m.description, route === '/' ? { jsonLd: [organizationJsonLd(), websiteJsonLd()] } : {});
}

// Service pages take their title, description and name from the same catalog the app renders.
for (const s of await loadServices()) {
  ROUTE_METADATA[`/services/${s.slug}`] = page(s.seoTitle, s.seoDescription, {
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'Service', name: s.title, description: s.seoDescription,
      url: `${BASE_URL}/services/${s.slug}`, provider: organizationRef
    }
  });
}

const esc = (v) => String(v).replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const NAV_LINKS = [
  ['/', 'Home'], ['/rates', 'Rates'], ['/services', 'Services'], ['/track', 'Track a shipment'], ['/book', 'Book'],
  ['/blogs', 'Country shipping guides'], ['/how-to-ship', 'How to ship'], ['/faq', 'FAQ'], ['/about', 'About'], ['/contact', 'Contact'], ['/policies', 'Policies']
];

/** Plain, truthful fallback shown before JavaScript loads and read by crawlers: heading, summary, links. */
function fallbackBody(routePath, meta) {
  const heading = esc(meta.title.split(' | ')[0].split(' — ')[0]);
  const links = NAV_LINKS.filter(([href]) => href !== routePath).map(([href, label]) => `<a href="${href}">${label}</a>`).join(' ');
  const list = (prefix, skip) => Object.entries(ROUTE_METADATA)
    .filter(([p]) => p.startsWith(prefix) && p !== skip && p !== routePath)
    .map(([p, m]) => `<li><a href="${p}">${esc(m.title.split(' | ')[0])}</a></li>`).join('');
  const services = list('/services/', '/services');
  const corridors = list('/send-parcel-nepal-to-');
  const showGuides = ['/', '/blogs', '/rates'].includes(routePath) || routePath.startsWith('/send-parcel-nepal-to-');
  const guides = showGuides ? list('/blogs/', '/blogs') : '';
  const more = (services ? `<h2>Our services</h2><ul>${services}</ul>` : '') + (corridors ? `<h2>Send a parcel from Nepal</h2><ul>${corridors}</ul>` : '') + (guides ? `<h2>Country shipping guides</h2><ul>${guides}</ul>` : '');
  return `<main style="max-width:720px;margin:0 auto;padding:24px;font-family:system-ui,sans-serif;color:#121211"><h1>${heading}</h1><p>${esc(meta.description)}</p><nav aria-label="Main">${links}</nav>${more}<p>The BC Cargo &amp; Courier Pvt. Ltd., School Road -4, Hetauda, Nepal. Phone 057-591816.</p></main>`;
}

/** Country guides: unique head tags, Article + FAQPage JSON-LD and a readable English body per guide. */
function addCountryGuides(guides) {
  for (const g of guides) {
    const url = `${BASE_URL}/blogs/${g.slug}`;
    const faqs = [...g.faqs];
    const li = (items) => items.map((i) => `<li><strong>${esc(i.title.en)}</strong>: ${esc(i.note.en)}</li>`).join('');
    ROUTE_METADATA[`/blogs/${g.slug}`] = {
      title: g.seo.title,
      description: g.seo.description,
      ogType: 'article',
      ogImage: `${BASE_URL}/og-banner.png`,
      jsonLd: [
        {
          '@context': 'https://schema.org', '@type': 'Article',
          headline: g.seo.title.split(' | ')[0], description: g.seo.description, inLanguage: ['en', 'ne'], mainEntityOfPage: url,
          author: { '@type': 'Organization', name: 'The BC Cargo & Courier' },
          publisher: { '@type': 'Organization', name: 'The BC Cargo & Courier', logo: { '@type': 'ImageObject', url: `${BASE_URL}/icon-512.png` } }
        },
        {
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: faqs.map((x) => ({ '@type': 'Question', name: x.q.en, acceptedAnswer: { '@type': 'Answer', text: x.a.en } }))
        }
      ],
      bodyHtml: `<main style="max-width:720px;margin:0 auto;padding:24px;font-family:system-ui,sans-serif;color:#121211"><p>Nepal to ${esc(g.name.en)}</p><h1>${esc(g.hero.title.en)}</h1><p>${esc(g.hero.lede.en)}</p>${g.intro.map((p) => `<p>${esc(p.en)}</p>`).join('')}<h2>What you can send</h2><ul>${li(g.send)}</ul><h2>What not to send</h2><ul>${li(g.avoid)}</ul><h2>What the receiver needs</h2><p>${esc(g.receiver.lead.en)}</p><ul>${g.receiver.needs.map((r) => `<li>${esc(r.en)}</li>`).join('')}</ul><p>${esc(g.receiver.tip.en)}</p><h2>Price</h2><p>Live prices by weight are on this page and on our <a href="/rates">rates page</a>.</p><h2>Questions</h2>${faqs.map((x) => `<h3>${esc(x.q.en)}</h3><p>${esc(x.a.en)}</p>`).join('')}<p><a href="/blogs">All country guides</a> · <a href="/track">Track a parcel</a></p><p>The BC Cargo &amp; Courier Pvt. Ltd., School Road -4, Hetauda, Nepal. Phone 057-591816.</p></main>`
    };
  }
}

export function prerender() {
  const indexHtmlPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.error(`[PRERENDER] dist/index.html not found! Please run 'vite build' first.`);
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8').replace(/\s*<meta name="description"[^>]*>/i, '');
  let renderedCount = 0;

  for (const [routePath, routeMeta] of Object.entries(ROUTE_METADATA)) {
    let meta = routeMeta;
    const canonical = `${BASE_URL}${routePath === '/' ? '/' : routePath}`;
    
    // Format JSON-LD scripts (page schemas + a BreadcrumbList that mirrors the URL path)
    let jsonLdTags = '';
    const extra = [];
    if (routePath !== '/') {
      const segs = routePath.replace(/^\//, '').split('/');
      const crumbs = [{ name: 'Home', url: BASE_URL + '/' }];
      segs.forEach((_, i) => {
        const p = '/' + segs.slice(0, i + 1).join('/');
        const m = ROUTE_METADATA[p];
        crumbs.push({ name: m ? m.title.split(' | ')[0] : segs[i].replace(/-/g, ' '), url: BASE_URL + p });
      });
      extra.push({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url }))
      });
    }
    {
      const own = meta.jsonLd ? (Array.isArray(meta.jsonLd) ? meta.jsonLd : [meta.jsonLd]) : [];
      meta = { ...meta, jsonLd: [...own, ...extra] };
    }
    if (meta.jsonLd) {
      const schemas = meta.jsonLd;
      jsonLdTags = schemas.map((s, idx) => 
        `<script type="application/ld+json" id="prerender-jsonld-${idx}">${JSON.stringify(s)}</script>`
      ).join('\n    ');
    }

    // Build replacement head metadata
    const metaTags = [
      `<title>${esc(meta.title)}</title>`,
      `<meta name="description" content="${esc(meta.description)}" />`,
      '<meta name="robots" content="index, follow, max-image-preview:large" />',
      `<link rel="canonical" href="${canonical}" />`,
      `<meta property="og:title" content="${esc(meta.title)}" />`,
      `<meta property="og:description" content="${esc(meta.description)}" />`,
      `<meta property="og:type" content="${meta.ogType || 'website'}" />`,
      `<meta property="og:url" content="${canonical}" />`,
      `<meta property="og:image" content="${meta.ogImage || `${BASE_URL}/og-banner.png`}" />`,
      '<meta property="og:locale" content="en_US" />',
      `<meta property="og:site_name" content="The BC Cargo &amp; Courier" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${esc(meta.title)}" />`,
      `<meta name="twitter:description" content="${esc(meta.description)}" />`,
      `<meta name="twitter:image" content="${meta.ogImage || `${BASE_URL}/og-banner.png`}" />`,
      jsonLdTags
    ].filter(Boolean).join('\n    ');

    // Replace <title> and inject tags inside <head>
    let prerenderedHtml = baseHtml;
    // Remove existing <title> tag
    prerenderedHtml = prerenderedHtml.replace(/<title>.*?<\/title>/i, '');
    // Inject custom head meta
    prerenderedHtml = prerenderedHtml.replace('</head>', `    ${metaTags}\n  </head>`);

    // Inject semantic body content if provided for JavaScript-disabled fallback & crawler indexability
    if (!meta.bodyHtml) meta = { ...meta, bodyHtml: fallbackBody(routePath, meta) };
    if (meta.bodyHtml) {
      prerenderedHtml = prerenderedHtml.replace('<div id="root"></div>', `<div id="root">${meta.bodyHtml}</div>`);
    }

    // Target directory: dist/<route>/index.html
    const targetDir = routePath === '/' 
      ? DIST_DIR 
      : path.join(DIST_DIR, routePath.replace(/^\//, ''));
    
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'index.html'), prerenderedHtml, 'utf8');
    renderedCount++;
  }

  // 404.html: Vercel serves this with a real 404 status for any URL that is not a route or a file.
  // The SPA still boots on it, so the in-app NotFoundPage renders; noindex keeps it out of search.
  const notFound = baseHtml
    .replace(/<title>.*?<\/title>/i, '')
    .replace('</head>', `    <title>Page not found | BC Cargo</title>
    <meta name="robots" content="noindex, follow" />
  </head>`)
    .replace('<div id="root"></div>', `<div id="root"><main style="max-width:720px;margin:0 auto;padding:24px;font-family:system-ui,sans-serif"><h1>Page not found</h1><p>This page does not exist. Try the <a href="/">home page</a>, <a href="/rates">rates</a> or <a href="/track">tracking</a>.</p></main></div>`);
  fs.writeFileSync(path.join(DIST_DIR, '404.html'), notFound, 'utf8');

  console.log(`[PRERENDER] Successfully generated ${renderedCount} static HTML pages in dist/!`);
}

addCountryGuides(await loadCountryGuides());
for (const b of await loadPublishedBlogs()) {
  const url = `${BASE_URL}/blogs/${b.slug}`;
  ROUTE_METADATA[`/blogs/${b.slug}`] = {
    title: b.title, description: b.description || 'Read this article from The BC Cargo & Courier.', ogType: 'article', ogImage: b.image.startsWith('https://') ? b.image : OG,
    jsonLd: { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: b.title.slice(0, 110), description: b.description, mainEntityOfPage: url, ...(b.publishedAt ? { datePublished: b.publishedAt } : {}), ...(b.updatedAt ? { dateModified: b.updatedAt } : {}), author: organizationRef, publisher: organizationRef }
  };
}
prerender();
