import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { skeletonKindForPath } from '../src/components/routeSkeletonKind';

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

describe('first-load shell', () => {
  it('has no boot overlay and only appears after 500ms', () => {
    expect(html).not.toContain('id="bc-boot"');
    expect(html).toMatch(/#bc-shell\{[^}]*opacity:0/);
    expect(html).toContain('animation:bc-shell-in .15s ease .5s forwards');
  });

  it('keeps crawler text hidden until React takes over, and shows it without JS', () => {
    expect(html).toContain('html.bc-booting #root{visibility:hidden');
    expect(html).toContain('<noscript><style>#bc-shell{display:none!important}html.bc-booting #root{visibility:visible!important}</style></noscript>');
  });
});

describe('route skeleton choice', () => {
  it('matches the shape of each route', () => {
    expect(skeletonKindForPath('/')).toBe('page');
    expect(skeletonKindForPath('/blogs')).toBe('cards');
    expect(skeletonKindForPath('/blogs/nepal-to-japan')).toBe('article');
    expect(skeletonKindForPath('/services')).toBe('cards');
    expect(skeletonKindForPath('/services/air')).toBe('article');
    expect(skeletonKindForPath('/book')).toBe('form');
    expect(skeletonKindForPath('/track')).toBe('form');
    expect(skeletonKindForPath('/admin/shipments')).toBe('admin');
    expect(skeletonKindForPath('/admin/login')).toBe('form');
  });
});
