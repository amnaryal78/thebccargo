import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { SERVICES_CATALOG } from '../src/services/servicesData';
import { SITEMAP_ROUTES } from '../scripts/generate-sitemap.mjs';

describe('International-Only Cargo Enforcement & Integrity Guards', () => {
  it('enforces that all services in the catalog are strictly international', () => {
    expect(SERVICES_CATALOG.length).toBe(4);
    for (const service of SERVICES_CATALOG) {
      expect(service.category).toBe('international');
      expect(['air', 'overland', 'ocean', 'customs']).toContain(service.mode);
      expect(service.slug).not.toMatch(/\b(domestic|national)\b/i);
      expect(service.title).not.toMatch(/\b(domestic|national)\b/i);
    }
  });

  it('guarantees sitemap does not contain domestic or legacy calculator routes', () => {
    const routePaths = SITEMAP_ROUTES.map((r: { path: string }) => r.path);
    expect(routePaths).not.toContain('/rates/national');
    expect(routePaths).not.toContain('/rates/calculator');
    expect(routePaths).not.toContain('/services/courier-nat');
    expect(routePaths).not.toContain('/services/haulage-nat');
    expect(routePaths).not.toContain('/services/nepal-domestic-express');
    expect(routePaths).not.toContain('/services/domestic-express-cargo');
  });

  it('verifies generated sitemap.xml in public/ has zero national/domestic urls', () => {
    const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
      const xml = fs.readFileSync(sitemapPath, 'utf8');
      expect(xml).not.toContain('/rates/national');
      expect(xml).not.toContain('/rates/calculator');
      expect(xml).not.toContain('/services/domestic-express-cargo');
    }
  });

  it('checks user-facing home and rates pages have no domestic courier tabs or cards', () => {
    const ratesPageContent = fs.readFileSync(
      path.resolve(__dirname, '../src/pages/RatesPage.tsx'),
      'utf8'
    );
    expect(ratesPageContent).not.toMatch(/\bactiveTab === 'national'\b/);
    expect(ratesPageContent).not.toContain('Domestic Rates');
    expect(ratesPageContent).not.toContain('National Matrix');

    const estimatorTabContent = fs.readFileSync(
      path.resolve(__dirname, '../src/features/estimator/RateEstimator.tsx'),
      'utf8'
    );
    expect(estimatorTabContent).not.toContain('National Cargo');
    expect(estimatorTabContent).not.toContain('Domestic Courier');
  });

  it('verifies booking form strictly enforces international export', () => {
    const bookingContent = fs.readFileSync(
      path.resolve(__dirname, '../src/components/BookingSystem.tsx'),
      'utf8'
    );
    expect(bookingContent).toContain("destinationCountry.trim().toLowerCase() === 'nepal'");
    expect(bookingContent).not.toContain('Domestic Courier (Nepal Hubs)');
  });
});
