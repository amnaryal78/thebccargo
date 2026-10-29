import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { byMonth, monthKey, summarize, type ResellerOrder } from '../src/features/reseller/commission';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const order = (over: Partial<ResellerOrder>): ResellerOrder => ({
  id: Math.random().toString(36),
  tracking_number: 'BC1',
  created_at: '2026-10-10T06:00:00Z',
  destination: 'Seoul',
  status: 'pending',
  weight_kg: 10,
  commission_npr: 500,
  ...over,
});

describe('reseller commission summary', () => {
  test('splits earned (delivered) and pending, and adds weight', () => {
    const s = summarize([
      order({ status: 'delivered', weight_kg: 12.5, commission_npr: 625 }),
      order({ status: 'in_transit', weight_kg: 3, commission_npr: 150 }),
    ]);
    expect(s).toEqual({ orders: 2, weightKg: 15.5, earnedNpr: 625, pendingNpr: 150, cancelled: 0 });
  });

  test('cancelled orders count but add no weight or commission', () => {
    const s = summarize([order({ status: 'Cancelled', weight_kg: 20, commission_npr: 0 }), order({ status: 'delivered' })]);
    expect(s.orders).toBe(2);
    expect(s.cancelled).toBe(1);
    expect(s.weightKg).toBe(10);
    expect(s.earnedNpr).toBe(500);
  });

  test('empty list is all zero', () => {
    expect(summarize([])).toEqual({ orders: 0, weightKg: 0, earnedNpr: 0, pendingNpr: 0, cancelled: 0 });
  });

  test('decimals do not drift', () => {
    const s = summarize(Array.from({ length: 10 }, () => order({ status: 'delivered', weight_kg: 0.1, commission_npr: 5 })));
    expect(s.weightKg).toBe(1);
    expect(s.earnedNpr).toBe(50);
  });

  test('months follow Nepal time, newest first', () => {
    // 2026-09-30 20:00 UTC is already 1 October in Nepal (UTC+5:45)
    expect(monthKey('2026-09-30T20:00:00Z')).toBe('2026-10');
    const months = byMonth([
      order({ created_at: '2026-09-05T06:00:00Z', weight_kg: 4, commission_npr: 200 }),
      order({ created_at: '2026-10-05T06:00:00Z', weight_kg: 6, commission_npr: 300 }),
      order({ created_at: '2026-10-06T06:00:00Z', status: 'cancelled', weight_kg: 9, commission_npr: 0 }),
    ]);
    expect(months.map((m) => m.key)).toEqual(['2026-10', '2026-09']);
    expect(months[0]).toMatchObject({ orders: 2, weightKg: 6, commissionNpr: 300, label: 'Oct 2026' });
  });
});

describe('get_my_reseller_orders migration', () => {
  const sql = fs.readFileSync(path.join(root, 'supabase', 'migrations', '20261028000000_reseller_orders_dashboard.sql'), 'utf8');

  test('commission is computed in the database at Rs 50 per kg, zero when cancelled', () => {
    expect(sql).toMatch(/50::numeric AS npr_per_kg/);
    expect(sql).toMatch(/WHEN lower\(s\.status\) = 'cancelled' THEN 0/);
  });

  test('only the caller\'s own reseller row, no customer contact details', () => {
    expect(sql).toMatch(/ur\.role::text = 'reseller'/);
    expect(sql).toMatch(/s\.reseller_id = me\.id/);
    const returned = sql.slice(sql.indexOf('RETURNS TABLE'), sql.indexOf('LANGUAGE sql'));
    expect(returned).not.toMatch(/name|phone|email|address/);
  });

  test('anonymous visitors cannot call it', () => {
    expect(sql).toContain('REVOKE ALL ON FUNCTION public.get_my_reseller_orders() FROM PUBLIC, anon;');
  });

  test('the browser never computes commission itself', () => {
    const ui = fs.readFileSync(path.join(root, 'src', 'features', 'reseller', 'ResellerDashboard.tsx'), 'utf8');
    expect(ui).not.toMatch(/\*\s*50|50\s*\*/);
  });
});
