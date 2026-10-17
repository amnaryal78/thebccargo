import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const PUBLIC_DIR = path.resolve(__dirname, '../public');

describe('Phase 5 — PWA & Offline Asset Verification', () => {
  it('validates public/manifest.json structure and required PWA fields', () => {
    const manifestPath = path.join(PUBLIC_DIR, 'manifest.json');
    expect(fs.existsSync(manifestPath), 'manifest.json must exist in public/').toBe(true);

    const content = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(content);

    expect(manifest.name).toBe('The BC Cargo & Courier');
    expect(manifest.short_name).toBe('BC Cargo');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#002147');
    expect(manifest.background_color).toBe('#F6F6F4');
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);

    // Verify maskable icon exists in list
    const hasMaskable = manifest.icons.some(
      (icon: any) => icon.purpose && icon.purpose.includes('maskable')
    );
    expect(hasMaskable).toBe(true);
  });

  it('validates public/sw.js Service Worker caching strategy', () => {
    const swPath = path.join(PUBLIC_DIR, 'sw.js');
    expect(fs.existsSync(swPath), 'sw.js must exist in public/').toBe(true);

    const swContent = fs.readFileSync(swPath, 'utf8');
    expect(swContent).toContain('bc-cargo-cache-');
    expect(swContent).toContain('/offline.html');
    expect(swContent).toContain('/rates');
    expect(swContent).toContain('/contact');

    // Asserts zero caching of API write mutations
    expect(swContent).toContain('req.method !== \'GET\'');
    expect(swContent).toContain('url.pathname.startsWith(\'/api/\')');
  });

  it('validates public/offline.html fallback page', () => {
    const offlinePath = path.join(PUBLIC_DIR, 'offline.html');
    expect(fs.existsSync(offlinePath), 'offline.html must exist in public/').toBe(true);

    const content = fs.readFileSync(offlinePath, 'utf8');
    expect(content).toContain('You Are Offline');
    expect(content).toContain('+977-57-520000');
    expect(content).toContain('Retry Connection');
  });

  it('verifies generated PNG icons and og-banner have valid PNG signatures', () => {
    const pngFiles = ['og-banner.png', 'icon-192.png', 'icon-512.png', 'icon-maskable.png'];
    const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    for (const file of pngFiles) {
      const filePath = path.join(PUBLIC_DIR, file);
      expect(fs.existsSync(filePath), `${file} must exist on disk`).toBe(true);

      const buffer = fs.readFileSync(filePath);
      const signature = buffer.subarray(0, 8);
      expect(signature.equals(pngSignature), `${file} must have valid PNG magic signature`).toBe(true);
    }
  });
});
