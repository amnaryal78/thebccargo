import { test, describe, expect } from 'vitest';
import { fetchPublicTracking } from '../src/services/trackingService.ts';

describe('Tracking Service Logic', () => {
  test('rejects empty tracking queries', async () => {
    const result = await fetchPublicTracking('');
    expect(result.data).toBeNull();
    expect(result.error || '').toMatch(/valid tracking number/i);
  });

  test('rejects tracking codes that are too short', async () => {
    const result = await fetchPublicTracking('BC');
    expect(result.data).toBeNull();
    expect(result.error || '').toMatch(/at least 4 characters/i);
  });

  test('does not serve demo consignments', async () => {
    const result = await fetchPublicTracking('BC-90214-HKG');
    expect(result.data).toBeNull();
    expect(result.error || '').toMatch(/no active shipment found/i);
  });

  test('normalizes lowercase tracking code input in the not-found message', async () => {
    const result = await fetchPublicTracking('bc-unknown-0001');
    expect(result.data).toBeNull();
    expect(result.error || '').toContain('BC-UNKNOWN-0001');
  });
});
