/**
 * Generates production sitemap.xml and robots.txt
 * Follows Google and Bing sitemap specifications with accurate lastmod timestamps
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadCountryGuides } from './country-guides.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');

const BASE_URL = 'https://thebccargo.com';
// lastmod = date of the last commit that touched the site source, so it only changes when content really changes
// (search engines ignore lastmod when every URL claims "today").
import { execSync } from 'child_process';
const lastCommitDate = () => {
  try { return execSync('git log -1 --format=%cs -- src public scripts/prerender.mjs', { cwd: ROOT_DIR }).toString().trim(); } catch { return ''; }
};
const CURRENT_DATE = lastCommitDate() || new Date().toISOString().split('T')[0];

export const SITEMAP_ROUTES = [
  // Primary Core Landing & Utilities
  { path: '/', changefreq: 'daily', priority: 1.0, lastmod: CURRENT_DATE },
  { path: '/rates', changefreq: 'weekly', priority: 0.9, lastmod: CURRENT_DATE },
  { path: '/rates/international', changefreq: 'weekly', priority: 0.8, lastmod: CURRENT_DATE },
  { path: '/rates/rfq', changefreq: 'weekly', priority: 0.8, lastmod: CURRENT_DATE },
  { path: '/track', changefreq: 'weekly', priority: 0.8, lastmod: CURRENT_DATE },
  { path: '/book', changefreq: 'weekly', priority: 0.8, lastmod: CURRENT_DATE },

  // Top Country Corridors (Phase 4 High-Converting SEO Landing Pages)
  { path: '/send-parcel-nepal-to-south-korea', changefreq: 'daily', priority: 0.95, lastmod: CURRENT_DATE },
  { path: '/send-parcel-nepal-to-malaysia', changefreq: 'daily', priority: 0.95, lastmod: CURRENT_DATE },
  { path: '/send-parcel-nepal-to-uk', changefreq: 'daily', priority: 0.95, lastmod: CURRENT_DATE },
  { path: '/send-parcel-nepal-to-japan', changefreq: 'daily', priority: 0.95, lastmod: CURRENT_DATE },
  { path: '/send-parcel-nepal-to-europe', changefreq: 'daily', priority: 0.95, lastmod: CURRENT_DATE },
  { path: '/send-parcel-nepal-to-gulf', changefreq: 'daily', priority: 0.90, lastmod: CURRENT_DATE },
  { path: '/send-parcel-nepal-to-hong-kong', changefreq: 'daily', priority: 0.90, lastmod: CURRENT_DATE },
  { path: '/send-parcel-nepal-to-usa', changefreq: 'daily', priority: 0.90, lastmod: CURRENT_DATE },

  // Services Catalog & Details
  { path: '/services', changefreq: 'weekly', priority: 0.9, lastmod: CURRENT_DATE },
  { path: '/services/international-air-freight', changefreq: 'weekly', priority: 0.85, lastmod: CURRENT_DATE },
  { path: '/services/cross-border-overland', changefreq: 'weekly', priority: 0.85, lastmod: CURRENT_DATE },
  { path: '/services/ocean-freight-intermodal', changefreq: 'weekly', priority: 0.85, lastmod: CURRENT_DATE },
  { path: '/services/customs-brokerage-clearance', changefreq: 'weekly', priority: 0.85, lastmod: CURRENT_DATE },

  // Company Information & Hubs
  { path: '/about', changefreq: 'monthly', priority: 0.7, lastmod: CURRENT_DATE },
  { path: '/contact', changefreq: 'weekly', priority: 0.85, lastmod: CURRENT_DATE },

  // Careers & Job Vacancies
  { path: '/careers', changefreq: 'weekly', priority: 0.7, lastmod: CURRENT_DATE },
  { path: '/careers/customs-broker-specialist', changefreq: 'weekly', priority: 0.6, lastmod: CURRENT_DATE },
  { path: '/careers/air-cargo-operations-lead', changefreq: 'weekly', priority: 0.6, lastmod: CURRENT_DATE },
  { path: '/careers/cross-border-fleet-dispatcher', changefreq: 'weekly', priority: 0.6, lastmod: CURRENT_DATE },
  { path: '/careers/warehouse-sortation-supervisor', changefreq: 'weekly', priority: 0.6, lastmod: CURRENT_DATE },

  // Blog Articles & Trade Knowledge
  { path: '/blogs', changefreq: 'daily', priority: 0.8, lastmod: CURRENT_DATE },
  { path: '/blogs/nepal-air-cargo-customs-guide-2026', changefreq: 'monthly', priority: 0.75, lastmod: CURRENT_DATE },
  { path: '/blogs/kolkata-dry-port-rail-transit-guide', changefreq: 'monthly', priority: 0.75, lastmod: CURRENT_DATE },
  { path: '/blogs/cold-chain-pharma-logistics-nepal', changefreq: 'monthly', priority: 0.75, lastmod: CURRENT_DATE },

  // Legal & FAQ
  { path: '/faq', changefreq: 'monthly', priority: 0.7, lastmod: CURRENT_DATE },
  { path: '/how-to-ship', changefreq: 'monthly', priority: 0.7, lastmod: CURRENT_DATE },
  { path: '/policies', changefreq: 'monthly', priority: 0.5, lastmod: CURRENT_DATE }
];

for (const g of await loadCountryGuides()) {
  SITEMAP_ROUTES.push({ path: `/blogs/${g.slug}`, changefreq: 'weekly', priority: 0.85, lastmod: CURRENT_DATE });
}

export function generateSitemapXml() {
  const urls = SITEMAP_ROUTES.map((r) => {
    return `  <url>
    <loc>${BASE_URL}${r.path}</loc>
    <lastmod>${r.lastmod || CURRENT_DATE}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export function generateRobotsTxt() {
  return `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Disallow private and administrative portals from search indexing
Disallow: /admin/
Disallow: /admin
Disallow: /login
Disallow: /_kit

# AI search and answer engines are welcome to read the public pages (see also /llms.txt)
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: PerplexityBot
User-agent: Google-Extended
User-agent: Applebot-Extended
Allow: /
Disallow: /admin
Disallow: /login
Disallow: /_kit

# Official Sitemap Location
Sitemap: ${BASE_URL}/sitemap.xml
`;
}

// Execution
const sitemapContent = generateSitemapXml();
const robotsContent = generateRobotsTxt();

// Write to public/
fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapContent, 'utf8');
fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robotsContent, 'utf8');
console.log(`[SITEMAP] Generated public/sitemap.xml with ${SITEMAP_ROUTES.length} routes.`);
console.log(`[ROBOTS] Generated public/robots.txt.`);

// If dist/ exists, sync them into dist/ as well
if (fs.existsSync(DIST_DIR)) {
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapContent, 'utf8');
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robotsContent, 'utf8');
  console.log(`[SITEMAP] Synced sitemap.xml and robots.txt to dist/.`);
}
