import { test, describe } from 'node:test';
import assert from 'node:assert';
import { fetchPublicTracking } from '../src/services/trackingService.ts';

describe('Tracking Service Logic', () => {
  test('rejects empty tracking queries', async () => {
    const result = await fetchPublicTracking('');
    assert.strictEqual(result.data, null);
    assert.match(result.error || '', /valid tracking number/i);
  });

  test('rejects tracking codes that are too short', async () => {
    const result = await fetchPublicTracking('BC');
    assert.strictEqual(result.data, null);
    assert.match(result.error || '', /at least 4 characters/i);
  });

  test('returns sanitized manifest for verified seed consignment BC-90214-HKG', async () => {
    const result = await fetchPublicTracking('BC-90214-HKG');
    assert.strictEqual(result.error, null);
    assert.notStrictEqual(result.data, null);
    if (result.data) {
      assert.strictEqual(result.data.trackingNumber, 'BC-90214-HKG');
      assert.strictEqual(result.data.status, 'In Transit');
      assert.ok(result.data.milestones.length > 0);
      // PII must be sanitized
      assert.strictEqual(result.data.shipper.name, 'Authorized Exporter');
      assert.strictEqual(result.data.consignee.name, 'Authorized Consignee');
    }
  });

  test('normalizes lowercase tracking code input', async () => {
    const result = await fetchPublicTracking('bc-90214-hkg');
    assert.strictEqual(result.error, null);
    assert.notStrictEqual(result.data, null);
    if (result.data) {
      assert.strictEqual(result.data.trackingNumber, 'BC-90214-HKG');
    }
  });
});
