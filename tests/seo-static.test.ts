import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('technical SEO guards', () => {
  const vercel = JSON.parse(read('vercel.json'));

  it('does not rewrite every URL to the app (unknown URLs must return a real 404)', () => {
    const catchAll = vercel.rewrites.filter((r: { source: string }) => r.source === '/(.*)' || r.source === '/:path*');
    expect(catchAll).toEqual([]);
  });

  it('still routes every client-side route to the app shell', () => {
    const sources = vercel.rewrites.map((r: { source: string }) => r.source).join(' ');
    for (const route of ['login', 'track', 'book', 'services', 'rates', 'blogs', 'careers', 'admin', 'faq', 'how-to-ship', 'send-parcel-nepal-to-']) {
      expect(sources).toContain(route);
    }
  });

  it('publishes robots.txt with a sitemap and llms.txt with the real contact facts', () => {
    expect(read('public/robots.txt')).toContain('Sitemap: https://thebccargo.com/sitemap.xml');
    const llms = read('public/llms.txt');
    expect(llms).toContain('Hetauda');
    expect(llms).toContain('057-591816');
    expect(llms).toContain('South Korea: about 10 days');
    expect(llms).toContain('Japan: about 15 days');
  });

  it('every prerendered title is 60 characters or fewer', () => {
    const src = read('scripts/prerender.mjs');
    const titles = [...src.matchAll(/^\s{4}title: '([^']+)'/gm)].map((m) => m[1]);
    expect(titles.length).toBeGreaterThan(20);
    for (const t of titles) expect(t.length, t).toBeLessThanOrEqual(60);
  });

  it('the sitemap lists every prerendered route', () => {
    const sitemap = read('public/sitemap.xml');
    const routes = [...read('scripts/prerender.mjs').matchAll(/^ {2}'(\/[^']*)': \{/gm)].map((m) => m[1]);
    for (const r of routes) expect(sitemap, r).toContain(`<loc>https://thebccargo.com${r}</loc>`);
  });
});
