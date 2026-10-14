import { test, describe } from 'node:test';
import assert from 'node:assert';
import { calculateVolumetricWeight, getChargeableWeight } from '../src/services/ratesService.ts';

describe('Rates Calculation Engine', () => {
  test('calculates volumetric weight with air standard divisor (5000)', () => {
    // 50cm x 40cm x 30cm / 5000 = 60,000 / 5000 = 12 kg
    const volWeight = calculateVolumetricWeight(50, 40, 30, 'air');
    assert.strictEqual(volWeight, 12);
  });

  test('calculates volumetric weight with overland standard divisor (6000)', () => {
    // 60cm x 50cm x 40cm / 6000 = 120,000 / 6000 = 20 kg
    const volWeight = calculateVolumetricWeight(60, 50, 40, 'overland');
    assert.strictEqual(volWeight, 20);
  });

  test('handles zero or missing dimensions gracefully', () => {
    assert.strictEqual(calculateVolumetricWeight(0, 40, 30, 'air'), 0);
    assert.strictEqual(calculateVolumetricWeight(50, 0, 30, 'air'), 0);
    assert.strictEqual(calculateVolumetricWeight(50, 40, 0, 'air'), 0);
  });

  test('determines chargeable weight as max of gross and volumetric weight', () => {
    // Gross is higher
    assert.strictEqual(getChargeableWeight(15, 12), 15);
    // Volumetric is higher
    assert.strictEqual(getChargeableWeight(10, 18.5), 18.5);
    // Equal
    assert.strictEqual(getChargeableWeight(25, 25), 25);
  });
});
