import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PAGE_META } from '../src/data/pageMeta';

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

  it('every static page title is 60 characters or fewer and every description is 70-160', () => {
    const entries = Object.entries(PAGE_META);
    expect(entries.length).toBeGreaterThan(10);
    for (const [route, m] of entries) {
      expect(m.title.length, `${route} title`).toBeLessThanOrEqual(60);
      expect(m.description.length, `${route} description`).toBeGreaterThanOrEqual(70);
      expect(m.description.length, `${route} description`).toBeLessThanOrEqual(160);
    }
  });

  it('static page metadata contains no unverified claims', () => {
    for (const [route, m] of Object.entries(PAGE_META)) {
      expect(m.title + ' ' + m.description, route).not.toMatch(/B-409|\b(?:190|220)\+|since 20\d\d|business days|SLA|licen[cs]ed/i);
    }
  });

  it('the sitemap lists every static page', () => {
    const sitemap = read('public/sitemap.xml');
    for (const r of Object.keys(PAGE_META)) expect(sitemap, r).toContain(`<loc>https://thebccargo.com${r === '/' ? '/' : r}</loc>`);
  });
});
