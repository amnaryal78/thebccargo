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

  test('returns sanitized manifest for verified seed consignment BC-90214-HKG', async () => {
    const result = await fetchPublicTracking('BC-90214-HKG');
    expect(result.error).toBeNull();
    expect(result.data).not.toBeNull();
    if (result.data) {
      expect(result.data.trackingNumber).toBe('BC-90214-HKG');
      expect(result.data.status).toBe('In Transit');
      expect(result.data.milestones.length).toBeGreaterThan(0);
      // PII must be sanitized
      expect(result.data.shipper.name).toBe('Authorized Exporter');
      expect(result.data.consignee.name).toBe('Authorized Consignee');
    }
  });

  test('normalizes lowercase tracking code input', async () => {
    const result = await fetchPublicTracking('bc-90214-hkg');
    expect(result.error).toBeNull();
    expect(result.data).not.toBeNull();
    if (result.data) {
      expect(result.data.trackingNumber).toBe('BC-90214-HKG');
    }
  });
});
