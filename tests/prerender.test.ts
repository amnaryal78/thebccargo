import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve(__dirname, '../dist');

describe('Phase 5 — Prerendered Static HTML & Structured Data', () => {
  it('asserts that dist/index.html exists and contains Organization & LocalBusiness JSON-LD', () => {
    const htmlPath = path.join(DIST_DIR, 'index.html');
    expect(fs.existsSync(htmlPath), 'dist/index.html must exist').toBe(true);
    const content = fs.readFileSync(htmlPath, 'utf8');

    expect(content).toContain('<title>BC Cargo &amp; Courier');
    expect(content).toContain('<meta name="description"');
    expect(content).toContain('<script type="application/ld+json"');
    expect(content).toContain('"@type":"Organization"');
    expect(content).toContain('"@type":"LocalBusiness"');
    expect(content).toContain('School Road -4');
  });

  it('asserts that dist/rates/index.html exists and contains rates title and meta', () => {
    const htmlPath = path.join(DIST_DIR, 'rates', 'index.html');
    expect(fs.existsSync(htmlPath), 'dist/rates/index.html must exist').toBe(true);
    const content = fs.readFileSync(htmlPath, 'utf8');

    expect(content).toContain('Rate Estimator');
    expect(content).toContain('rates');
    expect(content).toContain('https://thebccargo.com/rates');
    expect(content).toContain('<script type="application/ld+json"');
  });

  it('asserts that service detail static HTML contains Service JSON-LD schema', () => {
    const htmlPath = path.join(DIST_DIR, 'services', 'international-air-freight', 'index.html');
    expect(fs.existsSync(htmlPath), 'dist/services/international-air-freight/index.html must exist').toBe(true);
    const content = fs.readFileSync(htmlPath, 'utf8');

    expect(content).toContain('Air Freight Express');
    expect(content).toContain('"@type":"Service"');
    expect(content).toContain('The BC Cargo & Courier');
  });

  it('asserts that blog post static HTML contains Article & BreadcrumbList JSON-LD schemas', () => {
    const htmlPath = path.join(DIST_DIR, 'blogs', 'nepal-air-cargo-customs-guide-2026', 'index.html');
    expect(fs.existsSync(htmlPath), 'dist/blogs/nepal-air-cargo-customs-guide-2026/index.html must exist').toBe(true);
    const content = fs.readFileSync(htmlPath, 'utf8');

    expect(content).toContain('Nepal Air Cargo Customs');
    expect(content).toContain('"@type":"Article"');
    expect(content).toContain('"@type":"BreadcrumbList"');
    expect(content).toContain('Prakash Adhikari');
  });

  it('asserts that job career static HTML contains JobPosting JSON-LD schema', () => {
    const htmlPath = path.join(DIST_DIR, 'careers', 'customs-broker-specialist', 'index.html');
    expect(fs.existsSync(htmlPath), 'dist/careers/customs-broker-specialist/index.html must exist').toBe(true);
    const content = fs.readFileSync(htmlPath, 'utf8');

    expect(content).toContain('Customs');
    expect(content).toContain('"@type":"JobPosting"');
    expect(content).toContain('Birgunj');
  });
});
