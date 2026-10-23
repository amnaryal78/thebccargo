import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import fs from 'fs';
import path from 'path';
import { CountryLandingPage } from '../src/pages/country/CountryLandingPage';
import { COUNTRY_LANDING_DATA } from '../src/data/countryLandingData';
import { SITEMAP_ROUTES } from '../scripts/generate-sitemap.mjs';

const DIST_DIR = path.resolve(__dirname, '../dist');

describe('Phase 4 — Hetauda, Country Landing Pages, and SEO Prerendering', () => {
  it('has configurations for all 8 primary corridors including top 5', () => {
    const requiredSlugs = [
      'send-parcel-nepal-to-south-korea',
      'send-parcel-nepal-to-malaysia',
      'send-parcel-nepal-to-uk',
      'send-parcel-nepal-to-japan',
      'send-parcel-nepal-to-europe',
      'send-parcel-nepal-to-gulf',
      'send-parcel-nepal-to-hong-kong',
      'send-parcel-nepal-to-usa',
    ];

    for (const slug of requiredSlugs) {
      const data = COUNTRY_LANDING_DATA[slug];
      expect(data, `Missing country data for ${slug}`).toBeDefined();
      expect(data.headline).toContain('Hetauda');
      expect(data.originHub).toContain('Hetauda');
      expect(data.faqs.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('renders CountryLandingPage to static HTML with Hetauda address, FAQs, and buttons', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/send-parcel-nepal-to-south-korea'] },
        React.createElement(CountryLandingPage, {
          forcedSlug: 'send-parcel-nepal-to-south-korea',
        })
      )
    );

    // Assert key SEO and operational details
    expect(html).toContain('Send Parcel from Hetauda &amp; Nepal to South Korea');
    expect(html).toContain('School Road -4, Hetauda');
    expect(html).toContain('10 days');
    expect(html).toContain('Price');
    expect(html).toContain('Chat');
    expect(html).toContain('Customs Restrictions for South Korea');
    expect(html).toContain('Meat and meat-containing products (Sukuti, sausages, jerky) are strictly blocked');
    expect(html).toContain('Frequently Asked Questions');
  });

  it('keeps only regional corridor pages in the sitemap; single-country corridors 301 to their guide', () => {
    const sitemapPaths = SITEMAP_ROUTES.map((r) => r.path);
    expect(sitemapPaths).toContain('/send-parcel-nepal-to-europe');
    expect(sitemapPaths).toContain('/send-parcel-nepal-to-gulf');
    const vercel = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../vercel.json'), 'utf8'));
    const redirects = new Map<string, string>(vercel.redirects.map((r: { source: string; destination: string }) => [r.source, r.destination]));
    const moved: Record<string, string> = {
      '/send-parcel-nepal-to-south-korea': '/blogs/nepal-to-south-korea',
      '/send-parcel-nepal-to-malaysia': '/blogs/nepal-to-malaysia',
      '/send-parcel-nepal-to-uk': '/blogs/nepal-to-united-kingdom',
      '/send-parcel-nepal-to-japan': '/blogs/nepal-to-japan',
      '/send-parcel-nepal-to-hong-kong': '/blogs/nepal-to-hong-kong',
      '/send-parcel-nepal-to-usa': '/blogs/nepal-to-usa'
    };
    for (const [from, to] of Object.entries(moved)) {
      expect(redirects.get(from), from).toBe(to);
      expect(sitemapPaths, from).not.toContain(from);
      expect(sitemapPaths, to).toContain(to);
    }
  });

  it('asserts that dist/ contains static HTML with real text and JSON-LD when built', () => {
    const koreaHtmlPath = path.join(DIST_DIR, 'send-parcel-nepal-to-south-korea', 'index.html');
    if (fs.existsSync(koreaHtmlPath)) {
      const content = fs.readFileSync(koreaHtmlPath, 'utf8');

      expect(content).toContain('Send Parcel from Hetauda');
      expect(content).toContain('School Road');
      expect(content).toContain('Hetauda');
      expect(content).toContain('LocalBusiness');
      expect(content).toContain('FAQPage');
      expect(content).toContain('<title>');
      expect(content).toContain('<meta name="description"');
      expect(content).toContain('<link rel="canonical"');
    }
  });
});
