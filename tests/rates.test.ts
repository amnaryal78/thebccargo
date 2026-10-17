import { test, describe, expect } from 'vitest';
import { calculateVolumetricWeight, getChargeableWeight } from '../src/services/ratesService.ts';

describe('Rates Calculation Engine', () => {
  test('calculates volumetric weight with air standard divisor (5000)', () => {
    // 50cm x 40cm x 30cm / 5000 = 60,000 / 5000 = 12 kg
    const volWeight = calculateVolumetricWeight(50, 40, 30, 'air');
    expect(volWeight).toBe(12);
  });

  test('calculates volumetric weight with overland standard divisor (6000)', () => {
    // 60cm x 50cm x 40cm / 6000 = 120,000 / 6000 = 20 kg
    const volWeight = calculateVolumetricWeight(60, 50, 40, 'overland');
    expect(volWeight).toBe(20);
  });

  test('handles zero or missing dimensions gracefully', () => {
    expect(calculateVolumetricWeight(0, 40, 30, 'air')).toBe(0);
    expect(calculateVolumetricWeight(50, 0, 30, 'air')).toBe(0);
    expect(calculateVolumetricWeight(50, 40, 0, 'air')).toBe(0);
  });

  test('determines chargeable weight as max of gross and volumetric weight', () => {
    // Gross is higher
    expect(getChargeableWeight(15, 12)).toBe(15);
    // Volumetric is higher
    expect(getChargeableWeight(10, 18.5)).toBe(18.5);
    // Equal
    expect(getChargeableWeight(25, 25)).toBe(25);
  });
});
