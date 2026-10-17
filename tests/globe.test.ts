import { describe, it, expect } from 'vitest';
import { HUBS, DESTINATIONS } from '../src/components/home/route-data';

describe('Phase 5 — Globe & Tactical Route System', () => {
  it('has Hetauda Central HQ as the primary origin hub (HUBS[0])', () => {
    const origin = HUBS[0];
    expect(origin.id).toBe('hub-hda');
    expect(origin.name).toContain('Hetauda Central HQ');
    expect(origin.country).toBe('Nepal');
    expect(origin.lat).toBeCloseTo(27.4284, 2);
    expect(origin.lng).toBeCloseTo(85.0322, 2);
  });

  it('orders international destinations prioritizing core corridors (South Korea, Malaysia, UK, Japan, Europe, Gulf)', () => {
    const topCorridorIds = DESTINATIONS.slice(0, 6).map((d) => d.id);
    expect(topCorridorIds).toEqual([
      'dest-kor', // South Korea
      'dest-kul', // Malaysia (Kuala Lumpur)
      'dest-lhr', // UK (London Heathrow)
      'dest-nrt', // Japan (Tokyo Narita)
      'dest-fra', // Europe (Frankfurt)
      'dest-dxb', // Gulf (Dubai)
    ]);
  });

  it('avoids empty Pacific ocean longitudes for primary shipping corridors', () => {
    // Primary shipping corridors should lie in the Eurasian/African/Middle Eastern sectors (-10° to 145°)
    const primaryCorridors = DESTINATIONS.slice(0, 6);
    for (const d of primaryCorridors) {
      expect(d.lng).toBeGreaterThanOrEqual(-10);
      expect(d.lng).toBeLessThanOrEqual(145);
    }
  });

  it('all flight corridors maintain valid geo coordinates originating from Hetauda', () => {
    const origin = HUBS[0];
    expect(origin.lat).toBeGreaterThan(0);
    expect(origin.lng).toBeGreaterThan(0);

    for (const dest of DESTINATIONS) {
      expect(dest.lat).toBeGreaterThanOrEqual(-90);
      expect(dest.lat).toBeLessThanOrEqual(90);
      expect(dest.lng).toBeGreaterThanOrEqual(-180);
      expect(dest.lng).toBeLessThanOrEqual(180);
      expect(dest.code).toBeTruthy();
      expect(dest.transitTime).toBeTruthy();
    }
  });
});
