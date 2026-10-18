import { describe, it, expect, beforeEach } from 'vitest';
import { 
  processChatMessage, 
  isQueryInScope, 
  getRules, 
  saveRule, 
  getKnowledgeItems
} from '../src/services/chatbotService';

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

    it('returns official Hetauda contact details when asked for contact/phone/office', async () => {
      const res = await processChatMessage('Where is your Hetauda office and what is your phone number?');
      expect(res.text).toContain('School Road -4, Hetauda');
      expect(res.text).toContain('9855019485');
      expect(res.text).toContain('057-591816');
      expect(res.text).toContain('thebccargo@gmail.com');
      expect(res.actions?.some(a => a.type === 'whatsapp')).toBe(true);
      expect(res.actions?.some(a => a.type === 'call')).toBe(true);
    });
  });

  describe('2. Live Rates Policy (Never Guess Prices)', () => {
    it('refers to live rates tariff engine and does not fabricate prices for rate queries', async () => {
      const res = await processChatMessage('How much to send 5 kg to Korea?');
      // Must not fabricate arbitrary prices like "$8.50"
      expect(res.text.toLowerCase()).toContain('live rates');
      expect(res.actions?.some(a => a.label === 'Price' && a.payload === 'rates')).toBe(true);
      expect(res.actions?.some(a => a.type === 'whatsapp')).toBe(true);
    });
  });

  describe('3. Pickup & Delivery Policy', () => {
    it('confirms doorstep pickup anywhere in Nepal (e.g. Pokhara)', async () => {
      const res = await processChatMessage('Can you pick up from Pokhara?');
      expect(res.text.toLowerCase()).toContain('doorstep pickup');
      expect(res.text).toContain('Nepal');
      expect(res.actions?.some(a => a.type === 'whatsapp')).toBe(true);
    });

    it('rejects pickup outside Nepal (e.g. London, USA)', async () => {
      const res = await processChatMessage('Can you pick up a box from London?');
      expect(res.text.toLowerCase()).toContain('only pick up shipments within nepal');
      expect(res.text.toLowerCase()).toContain('deliver worldwide');
    });
  });

  describe('4. Meat Shipment Restrictions', () => {
    it('accepts meat ONLY for Europe, UK, and Hong Kong', async () => {
      const resUK = await processChatMessage('Can I ship meat to UK?');
      expect(resUK.text.toLowerCase()).toContain('allowed for europe, uk, and hong kong');

      const resUSA = await processChatMessage('Can I ship meat to USA?');
      expect(resUSA.text.toLowerCase()).toContain('accepted only for europe, uk, and hong kong');
      expect(resUSA.text.toLowerCase()).toContain('prohibited');
    });
  });

  describe('5. Booking & Tracking Human Escalation', () => {
    it('directs booking inquiries to human staff on WhatsApp', async () => {
      const res = await processChatMessage('How do I book a shipment today?');
      expect(res.text.toLowerCase()).toContain('human staff');
      expect(res.text).toContain('WhatsApp');
      expect(res.actions?.some(a => a.label === 'WhatsApp' && a.type === 'whatsapp')).toBe(true);
    });

    it('directs tracking inquiries to human staff or Track button', async () => {
      const res = await processChatMessage('Can you track my shipment BC-90214-HKG?');
      expect(res.text.toLowerCase()).toContain('tracking');
      expect(res.actions?.some(a => a.label === 'Track')).toBe(true);
      expect(res.actions?.some(a => a.type === 'whatsapp')).toBe(true);
    });
  });

  describe('6. Out-of-Scope Non-Cargo Refusal Guardrail', () => {
    it('rejects general non-cargo questions politely', async () => {
      expect(isQueryInScope('Tell me a joke')).toBe(false);
      expect(isQueryInScope('Write python code to sort an array')).toBe(false);
      expect(isQueryInScope('Who is the prime minister?')).toBe(false);

      const res = await processChatMessage('Tell me a joke');
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
