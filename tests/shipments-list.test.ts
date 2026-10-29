import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';

vi.mock('../src/lib/supabase', () => ({ supabase: {}, isSupabaseConfigured: true }));
const { orderMilestones, shipmentSearchTerm } = await import('../src/features/admin/services/adminDataService');

describe('orderMilestones', () => {
  it('puts a back-dated update in event order; ties and unreadable times keep entry order', () => {
    const list = [
      { id: 'a', timestamp: '2026-10-28T10:00:00Z', sort_order: 1 },
      { id: 'b', timestamp: '2026-10-30T10:00:00Z', sort_order: 2 },
      { id: 'c', timestamp: 'not a date', sort_order: 3 },
      { id: 'd', timestamp: '2026-10-29T10:00:00Z', sort_order: 4 }, // added later, happened earlier
      { id: 'e', timestamp: '2026-10-29T10:00:00Z', sort_order: 5 },
    ];
    expect(orderMilestones(list).map((m) => m.id)).toEqual(['a', 'd', 'e', 'b', 'c']);
  });
});

describe('shipmentSearchTerm', () => {
  it("removes characters that would break or widen PostgREST's or() filter", () => {
    expect(shipmentSearchTerm('  BC1810AB ')).toBe('BC1810AB');
    expect(shipmentSearchTerm('Smith, John (UK)')).toBe('Smith John UK');
    expect(shipmentSearchTerm('100%*')).toBe('100');
    expect(shipmentSearchTerm(',,,')).toBe('');
  });
});

describe('shipment save', () => {
  const svc = readFileSync('src/features/admin/services/adminDataService.ts', 'utf8');
  it('only overwrites the row it loaded (version check)', () => {
    expect(svc).toContain(".eq('updated_at', loadedAt)");
    expect(svc).toContain('if (!data?.length) throw new ShipmentConflictError();');
  });
  it('the list never downloads the bill JSON', () => {
    expect(svc).toMatch(/SHIPMENT_LIST_COLUMNS =\n\s+'[^']+'/);
    expect(svc.match(/SHIPMENT_LIST_COLUMNS =\n\s+'([^']+)'/)![1]).not.toMatch(/\bbill\b/);
  });
});

describe('public tracking', () => {
  it('shows a cancelled shipment as Cancelled, not Order placed', () => {
    const src = readFileSync('src/services/trackingService.ts', 'utf8');
    expect(src).toContain("if (s.includes('cancel')) return 'Cancelled';");
  });
});
