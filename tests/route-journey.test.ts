import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  JOURNEY_CYCLE_MS,
  JOURNEY_EXIT_MS,
  MAJOR_ORDER,
  TIMELINE,
  buildStops,
  journeyClock,
  shortTransit,
  transitDays,
} from '../src/components/home/journey-data';
import { SHOWN_COUNTRIES } from '../src/components/home/country-destination';

const css = fs.readFileSync(path.resolve(__dirname, '../src/components/home/route-journey.css'), 'utf8');

describe('Home route journey (replaces the globe)', () => {
  it('plays the major countries first, in the requested order: Korea, Malaysia, UK, Japan, Australia, Canada, Dubai', () => {
    const stops = buildStops();
    expect(stops.slice(0, 7).map((s) => s.iso2)).toEqual(['KR', 'MY', 'GB', 'JP', 'AU', 'CA', 'AE']);
    expect([...MAJOR_ORDER]).toEqual(['KR', 'MY', 'GB', 'JP', 'AU', 'CA', 'AE']);
  });

  it('still includes every country that was listed on the globe, with the rest in their usual order', () => {
    const stops = buildStops();
    expect(stops.map((s) => s.iso2).sort()).toEqual(SHOWN_COUNTRIES.map((c) => c.iso2).sort());
    const rest = stops.slice(7).map((s) => s.iso2);
    const expectedRest = SHOWN_COUNTRIES.map((c) => c.iso2).filter((i) => !(MAJOR_ORDER as readonly string[]).includes(i));
    expect(rest).toEqual(expectedRest);
  });

  it('uses the owner-set delivery days: Korea 10 days, Japan 15 days', () => {
    const byIso = Object.fromEntries(buildStops().map((s) => [s.iso2, s]));
    expect(shortTransit(byIso.KR.dest.transitTime)).toBe('10 days');
    expect(transitDays(byIso.KR.dest.transitTime)).toBe(10);
    expect(shortTransit(byIso.JP.dest.transitTime)).toBe('15 days');
    expect(transitDays(byIso.JP.dest.transitTime)).toBe(15);
  });

  it('every stop has a delivery time the day counter can use', () => {
    for (const s of buildStops()) {
      expect(s.label).toBeTruthy();
      expect(transitDays(s.dest.transitTime)).toBeGreaterThan(0);
    }
    expect(shortTransit('3–5 business days')).toBe('3–5 days');
    expect(transitDays('3–5 business days')).toBe(5);
  });

  it('the day counter runs 1..N during the flight and stays on N once landed', () => {
    expect(journeyClock(0, 10)).toEqual({ stage: 'pickup', day: 1 });
    expect(journeyClock(TIMELINE.fly * 1000, 10).stage).toBe('flight');
    const midFlight = journeyClock(((TIMELINE.fly + TIMELINE.land) / 2) * 1000, 10);
    expect(midFlight.stage).toBe('flight');
    expect(midFlight.day).toBeGreaterThan(1);
    expect(midFlight.day).toBeLessThan(10);
    expect(journeyClock(TIMELINE.land * 1000, 10)).toEqual({ stage: 'customs', day: 10 });
    expect(journeyClock(TIMELINE.delivered * 1000, 10)).toEqual({ stage: 'delivered', day: 10 });
    let last = 0;
    for (let ms = 0; ms < JOURNEY_CYCLE_MS; ms += 120) {
      const { day } = journeyClock(ms, 15);
      expect(day).toBeGreaterThanOrEqual(last);
      last = day;
    }
  });

  it('never fades the scene out in CSS (a stalled timer must not leave a white card)', () => {
    expect(css).not.toMatch(/forwards[^;]*;?\s*}\s*\n[^@]*opacity:\s*0/);
    expect(css).not.toContain('rj-out');
    expect(css).toContain('.rj-wrap.rj-leaving'); // the exit fade is class-driven from JS
    expect(JOURNEY_EXIT_MS).toBeLessThan(JOURNEY_CYCLE_MS);
    // every scene animation finishes well inside the loop, so the last frame is a stable "delivered" frame
    expect(TIMELINE.delivered + 1.5).toBeLessThan(JOURNEY_CYCLE_MS / 1000);
  });

  it('honours reduced motion and only animates compositor-friendly properties', () => {
    expect(css).toContain('prefers-reduced-motion: reduce');
    expect(css).not.toMatch(/@keyframes[^{]+\{[^}]*\b(width|height|top|left|margin)\s*:/);
  });

  it('keeps the hero light: no 3D globe or three.js', () => {
    const hero = fs.readFileSync(path.resolve(__dirname, '../src/components/home/HomeHero.tsx'), 'utf8');
    expect(hero).not.toContain('Globe');
    expect(hero).not.toMatch(/from 'three'/);
    expect(fs.existsSync(path.resolve(__dirname, '../src/components/home/TacticalGlobe3D.tsx'))).toBe(false);
  });
});
