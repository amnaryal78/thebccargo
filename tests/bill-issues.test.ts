import { describe, expect, it } from 'vitest';
import { collectIssues, suggestEmail } from '../src/features/admin/shipments/billing/issues';
import { newBillDraft, type BillDraft } from '../src/features/admin/shipments/billing/model';

const draft = (): BillDraft => {
  const d = newBillDraft('2026-10-18');
  d.billNo = 'BC1810AB';
  d.sender = { name: 'Sita', country: 'Nepal', phone: '+977 9812345678', address: 'Hetauda', email: '' };
  d.receiver = { name: 'John', country: 'United Kingdom', phone: '+44 7700900123', address: '1 High St, London', email: '' };
  d.totalWeightKg = 10;
  d.boxes[0].goods.push({ id: 'g', name: 'Tea', unit: 'pkt', qty: 2 });
  return d;
};

describe('suggestEmail', () => {
  it('repairs common gmail typos', () => {
    expect(suggestEmail('sita@gmal.com')).toBe('sita@gmail.com');
    expect(suggestEmail('sita@gmial.com')).toBe('sita@gmail.com');
    expect(suggestEmail('sitagmail.com')).toBe('sita@gmail.com');
  });
  it('leaves good addresses alone', () => {
    expect(suggestEmail('sita@gmail.com')).toBeNull();
    expect(suggestEmail('')).toBeNull();
  });
});

describe('collectIssues', () => {
  it('is clean for a complete draft', () => {
    expect(Object.values(collectIssues(draft())).filter((i) => i.level === 'error')).toEqual([]);
  });

  it('flags a short phone with a plain fix message', () => {
    const d = draft();
    d.receiver.phone = '+44 123';
    const i = collectIssues(d)['receiver-phone'];
    expect(i.level).toBe('error');
    expect(i.message).toMatch(/at least 7 digits/);
  });

  it('offers to strip letters from a phone', () => {
    const d = draft();
    d.receiver.phone = '+44 77009abc123';
    const i = collectIssues(d)['receiver-phone'];
    i.fix!.apply(d);
    expect(d.receiver.phone).toBe('+44 77009123');
  });

  it('suggests the gmail fix and applies it', () => {
    const d = draft();
    d.receiver.email = 'john@gmal.con';
    const i = collectIssues(d)['receiver-email'];
    expect(i.message).toContain('john@gmail.com');
    i.fix!.apply(d);
    expect(d.receiver.email).toBe('john@gmail.com');
    expect(collectIssues(d)['receiver-email']).toBeUndefined();
  });

  it('requires weight and offers more boxes when a box is overloaded', () => {
    const d = draft();
    d.totalWeightKg = 0;
    expect(collectIssues(d)['total-weight'].level).toBe('error');
    d.totalWeightKg = 45;
    d.boxCountMode = 'manual';
    d.boxCountManual = 1;
    const i = collectIssues(d)['box-count'];
    expect(i.fix!.label).toBe('Use 3 boxes');
    i.fix!.apply(d);
    expect(d.boxCountMode).toBe('auto');
  });

  it('warns when box weights disagree with the total', () => {
    const d = draft();
    d.boxes[0].weightKg = 12;
    const i = collectIssues(d)['box-weights'];
    expect(i.message).toMatch(/12 kg/);
    i.fix!.apply(d);
    expect(d.totalWeightKg).toBe(12);
  });

  it('flags a half-filled additional charge', () => {
    const d = draft();
    d.extras.push({ id: 'e', name: 'Packing', amount: 0 });
    expect(collectIssues(d)['extra-0'].message).toMatch(/Enter an amount/);
  });
});
