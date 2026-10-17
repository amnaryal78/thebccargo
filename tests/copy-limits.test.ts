import { describe, it, expect } from 'vitest';
import { NAV_COPY, PLAIN_TERMS, HERO_METRICS } from '../src/content/copy';

describe('Phase 10 — Plain English & Copy Limits Enforcer', () => {
  it('enforces that all navigation labels are at most 10 characters', () => {
    for (const [key, label] of Object.entries(NAV_COPY)) {
      if (key === 'bookPickup') continue; // Action CTA exception
      expect(
        label.length,
        `Nav label "${label}" for ${key} exceeds 10 characters`
      ).toBeLessThanOrEqual(10);
    }
  });

  it('enforces that plain terms are at most 3 words and 20 characters', () => {
    for (const [key, term] of Object.entries(PLAIN_TERMS)) {
      const words = term.trim().split(/\s+/).length;
      expect(words, `Term "${term}" has more than 3 words`).toBeLessThanOrEqual(3);
      expect(term.length, `Term "${term}" exceeds 20 characters`).toBeLessThanOrEqual(20);
    }
  });

  it('enforces that hero metrics have short, factual labels and details', () => {
    for (const metric of HERO_METRICS) {
      expect(metric.label.length).toBeLessThanOrEqual(15);
      expect(metric.detail.length).toBeLessThanOrEqual(40);
    }
  });

  it('verifies common jargon replacements in plain language guidelines', () => {
    expect(PLAIN_TERMS.trackingNumber).toBe('Tracking number');
    expect(PLAIN_TERMS.receiver).toBe('Receiver');
    expect(PLAIN_TERMS.sender).toBe('Sender');
    expect(PLAIN_TERMS.shipment).toBe('Shipment');
    expect(PLAIN_TERMS.customsPaperwork).toBe('Customs paperwork');
  });
});
