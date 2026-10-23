import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve(__dirname, '../dist');

describe('Phase 5 — Prerendered Static HTML & Structured Data', () => {
  it('asserts that dist/index.html exists and contains Organization & LocalBusiness JSON-LD', () => {
    const htmlPath = path.join(DIST_DIR, 'index.html');
    expect(fs.existsSync(htmlPath), 'dist/index.html must exist').toBe(true);
    const content = fs.readFileSync(htmlPath, 'utf8');

    expect(content).toContain('<title>International Courier &amp; Cargo from Nepal');
    expect(content).toContain('<meta name="description"');
    expect(content).toContain('<script type="application/ld+json"');
    // One consolidated entity: LocalBusiness (a subtype of Organization), not two competing definitions.
    expect(content).toContain('"@type":"LocalBusiness"');
    expect(content.match(/"@type":"(?:Organization|LocalBusiness)","@id"/g)?.length ?? 0).toBe(1);
    expect(content).toContain('"@type":"WebSite"');
    expect(content).toContain('School Road -4');
  });

  it('asserts that dist/rates/index.html exists and contains rates title and meta', () => {
    const htmlPath = path.join(DIST_DIR, 'rates', 'index.html');
    expect(fs.existsSync(htmlPath), 'dist/rates/index.html must exist').toBe(true);
    const content = fs.readFileSync(htmlPath, 'utf8');

    expect(content).toContain('Shipping Rates from Nepal');
    expect(content).toContain('rates');
    expect(content).toContain('https://thebccargo.com/rates');
    expect(content).toContain('"@type":"BreadcrumbList"');
    // No invented price: the old WebApplication schema published a fabricated Offer.
    expect(content).not.toContain('"price"');
  });

  it('asserts that service detail static HTML contains Service JSON-LD schema', () => {
    const htmlPath = path.join(DIST_DIR, 'services', 'international-air-freight', 'index.html');
    expect(fs.existsSync(htmlPath), 'dist/services/international-air-freight/index.html must exist').toBe(true);
    const content = fs.readFileSync(htmlPath, 'utf8');

    expect(content).toContain('Air Freight');
    expect(content).toContain('"@type":"Service"');
    expect(content).toContain('The BC Cargo & Courier');
  });

  it('does not publish pages for articles or jobs that do not exist in the app', () => {
    // These were prerendered with an invented author and a fabricated JobPosting. They now 301 (see vercel.json).
    for (const gone of ['blogs/nepal-air-cargo-customs-guide-2026', 'blogs/kolkata-dry-port-rail-transit-guide', 'blogs/cold-chain-pharma-logistics-nepal',
      'careers/customs-broker-specialist', 'careers/air-cargo-operations-lead', 'careers/cross-border-fleet-dispatcher', 'careers/warehouse-sortation-supervisor']) {
      expect(fs.existsSync(path.join(DIST_DIR, gone, 'index.html')), gone).toBe(false);
    }
    for (const f of ['index.html', 'careers/index.html', 'blogs/index.html']) {
      const content = fs.readFileSync(path.join(DIST_DIR, f), 'utf8');
      expect(content).not.toContain('JobPosting');
      expect(content).not.toContain('Prakash Adhikari');
    }
  });

  it('country guide static HTML carries Article, FAQPage and BreadcrumbList schemas', () => {
    const content = fs.readFileSync(path.join(DIST_DIR, 'blogs', 'nepal-to-south-korea', 'index.html'), 'utf8');
    expect(content).toContain('"@type":"Article"');
    expect(content).toContain('"@type":"FAQPage"');
    expect(content).toContain('"@type":"BreadcrumbList"');
    expect(content).toContain('<link rel="canonical" href="https://thebccargo.com/blogs/nepal-to-south-korea"');
  });
});
