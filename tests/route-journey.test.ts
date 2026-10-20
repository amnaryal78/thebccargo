import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { buildStops, shortTransit, JOURNEY_CYCLE_MS } from '../src/components/home/journey-data';
import { SHOWN_COUNTRIES } from '../src/components/home/country-destination';

describe('Home route journey (replaces the globe)', () => {
  it('has one animated stop for every country that was listed on the globe, in order', () => {
    const stops = buildStops();
    expect(stops.map((s) => s.iso2)).toEqual(SHOWN_COUNTRIES.map((c) => c.iso2));
    expect(stops.length).toBeGreaterThanOrEqual(15);
  });

  it('every stop shows a delivery time and a destination to price', () => {
    for (const s of buildStops()) {
      expect(s.label).toBeTruthy();
      expect(shortTransit(s.dest.transitTime)).toMatch(/\d/);
      expect(s.dest.country).toBeTruthy();
    }
  });

  it('shortens "business days" for the chip', () => {
    expect(shortTransit('3–5 business days')).toBe('3–5 days');
    expect(shortTransit('2–4 days')).toBe('2–4 days');
  });

  it('keeps the loop length in sync with the CSS timeline and honours reduced motion', () => {
    const css = fs.readFileSync(path.resolve(__dirname, '../src/components/home/route-journey.css'), 'utf8');
    expect(JOURNEY_CYCLE_MS).toBe(7000);
    expect(css).toContain('6.5s forwards'); // scene fades out at 6.5s, loop restarts at 7s
    expect(css).toContain('prefers-reduced-motion: reduce');
    // only compositor-friendly properties are animated
    expect(css).not.toMatch(/@keyframes[^{]+\{[^}]*\b(width|height|top|left|margin)\s*:/);
  });

  it('no longer ships the 3D globe or its CDN data', () => {
    const hero = fs.readFileSync(path.resolve(__dirname, '../src/components/home/RouteTableHero.tsx'), 'utf8');
    expect(hero).not.toContain('Globe');
    expect(hero).toContain('RouteJourney');
  });
});
