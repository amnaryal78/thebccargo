import { describe, it, expect } from 'vitest';
import { buildShareUrl, readShareParams, quoteText } from '../src/features/estimator/share';
import { calculateSheetShipmentQuote } from '../src/features/estimator/engine';
import { MOCK_SHEET_RATES } from './fixtures/mockSheetRates';

describe('shared rate link', () => {
  it('round-trips every choice through the URL', () => {
    const url = buildShareUrl('https://thebccargo.com', {
      country: 'United Kingdom',
      weightKg: 12.5,
      liquidBottles: 3,
      meatKg: 2,
      medicine: true,
      pickupArea: 'Birgunj',
    });
    const u = new URL(url);
    expect(u.pathname).toBe('/rates');
    expect(u.searchParams.get('dest')).toBe('United Kingdom');
    expect(u.searchParams.get('weight')).toBe('12.5');
    expect(readShareParams(u.search)).toEqual({ liquidBottles: 3, meatKg: 2, medicine: true, pickupArea: 'Birgunj' });
  });

  it('leaves unticked items out of the link', () => {
    const u = new URL(buildShareUrl('https://x', { country: 'Japan', weightKg: 5, liquidBottles: 0, meatKg: 0, medicine: false, pickupArea: '' }));
    expect([...u.searchParams.keys()]).toEqual(['dest', 'weight']);
  });

  it('treats link values as untrusted', () => {
    expect(readShareParams('?liq=-4&meat=abc&med=yes&pickup=<script>')).toEqual({ liquidBottles: 0, meatKg: 0, medicine: false, pickupArea: '' });
    expect(readShareParams('?liq=100000').liquidBottles).toBe(999);
  });

  it('puts the bill lines, total and link in the shared text', () => {
    const q = calculateSheetShipmentQuote(
      { destination: 'United Kingdom', actualWeightKg: 10, hasLiquid: true, liquidBottleCount: 2, hasMedicine: true },
      MOCK_SHEET_RATES
    );
    const text = quoteText(q, 'https://thebccargo.com/rates?dest=United+Kingdom');
    expect(text).toContain('Liquid (2 btl x Rs 700): Rs 1,400');
    expect(text).toContain('Medicine: contact us for the price');
    expect(text).toContain(`TOTAL: Rs ${q.totalNpr.toLocaleString('en-US')}`);
    expect(text.endsWith('See this price: https://thebccargo.com/rates?dest=United+Kingdom')).toBe(true);
  });
});
