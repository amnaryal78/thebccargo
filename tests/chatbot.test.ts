import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  processChatMessage, 
  isQueryInScope, 
  getRules, 
  saveRule, 
  getKnowledgeItems,
  runQuoteTool
} from '../src/services/chatbotService';

vi.mock('../src/services/ratesService', () => ({ fetchSheetRates: vi.fn() }));
const { fetchSheetRates } = vi.mocked(await import('../src/services/ratesService'));

const storageMap = new Map<string, string>();
const mockStorage = {
  getItem: (k: string) => storageMap.get(k) || null,
  setItem: (k: string, v: string) => storageMap.set(k, v),
  removeItem: (k: string) => storageMap.delete(k),
  clear: () => storageMap.clear(),
};
globalThis.localStorage = mockStorage as any;

describe('Phase 7 — BC Cargo AI Assistant & Rules Engine', () => {
  beforeEach(() => {
    storageMap.clear();
  });

  describe('1. Contact Details & Official Knowledge', () => {
    it('contains verified Hetauda HQ contact info and license', () => {
      const items = getKnowledgeItems();
      const contact = items.find(k => k.category === 'contact');
      expect(contact).toBeDefined();
      expect(contact?.content).toContain('School Road -4, Hetauda');
      expect(contact?.content).toContain('9855019485');
      expect(contact?.content).toContain('thebccargo@gmail.com');
      expect(contact?.content).toContain('#B-409');
    });

  });

  describe('2. Real AI with live-rates tool (no hardcoded answers)', () => {
    const japan = { rate_group: 'japan', display_name: 'Japan', supported_countries: ['Japan'], weight_tier: 'standard' as const, weight_kg: 8, price_npr: 5000, currency: 'NPR', active: true };

    it('runs the real engine for "8 kg to Japan": shipping + Rs 1,000 box charge', async () => {
      fetchSheetRates.mockResolvedValue({ rates: [japan], rowCount: 1, updatedAt: '', source: 'live' });
      const out = await runQuoteTool({ country: 'Japan', weight_kg: 8 });
      expect(out).toMatchObject({ available: true, destination: 'Japan', boxes: 1, shippingNpr: 5000, totalNpr: 6000 });
    });

    it('refuses to invent a price when the country has no rate or input is missing', async () => {
      fetchSheetRates.mockResolvedValue({ rates: [japan], rowCount: 1, updatedAt: '', source: 'live' });
      expect(await runQuoteTool({ country: 'Atlantis', weight_kg: 8 })).toMatchObject({ available: false });
      expect(await runQuoteTool({ country: 'Japan' })).toMatchObject({ available: false });
      fetchSheetRates.mockResolvedValue({ rates: [], rowCount: 0, updatedAt: '', source: 'local_fallback' });
      expect(await runQuoteTool({ country: 'Japan', weight_kg: 8 })).toMatchObject({ available: false });
    });

    it('AI asks for the tool, the tool result goes back, the AI reply is shown', async () => {
      fetchSheetRates.mockResolvedValue({ rates: [japan], rowCount: 1, updatedAt: '', source: 'live' });
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ toolCall: { tool: 'get_quote', country: 'Japan', weight_kg: 8 } }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ reply: 'Japan, 8 kg: Rs 6000.' }) });
      vi.stubGlobal('fetch', fetchMock);
      const res = await processChatMessage('what is the price for 8 kg for japan');
      expect(res.text).toBe('Japan, 8 kg: Rs 6000.');
      expect(JSON.parse(fetchMock.mock.calls[1][1].body).toolResult.totalNpr).toBe(6000);
    });

    it('says the AI is unavailable instead of faking an answer', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
      const res = await processChatMessage('Can you pick up from Pokhara?');
      expect(res.isFallback).toBe(true);
      expect(res.text).toContain('not available right now');
      expect(res.text).not.toMatch(/Rss?d/);
    });
  });

  describe('3. Human escalation and tracking button', () => {
    it('offers the Track button for a tracking code', async () => {
      const res = await processChatMessage('Can you track my shipment BC-90214-HKG?');
      expect(res.actions?.some(a => a.label === 'Track')).toBe(true);
      expect(res.actions?.some(a => a.type === 'whatsapp')).toBe(true);
    });
  });

  describe('6. Out-of-Scope Non-Cargo Refusal Guardrail', () => {
    it('rejects general non-cargo questions politely', async () => {
      expect(isQueryInScope('Tell me a joke')).toBe(false);
      expect(isQueryInScope('Write python code to sort an array')).toBe(false);
      expect(isQueryInScope('Who is the prime minister?')).toBe(false);

      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);
      const res = await processChatMessage('Tell me a joke');
      expect(fetchMock).not.toHaveBeenCalled();
      expect(res.isFallback).toBe(true);
      expect(res.text.toLowerCase()).toContain('only help with cargo');
      expect(res.actions?.some(a => a.type === 'whatsapp')).toBe(true);
    });
  });

  describe('7. Admin Rules Engine', () => {
    it('allows admin to edit and toggle rules in localStorage', () => {
      const initialRules = getRules();
      expect(initialRules.length).toBeGreaterThan(0);

      const meatRule = initialRules.find(r => r.name.toLowerCase().includes('meat'));
      expect(meatRule).toBeDefined();

      if (meatRule) {
        meatRule.content = 'Custom admin meat restriction rule';
        saveRule(meatRule);

        const updated = getRules();
        const savedMeatRule = updated.find(r => r.id === meatRule.id);
        expect(savedMeatRule?.content).toBe('Custom admin meat restriction rule');
      }
    });
  });
});
