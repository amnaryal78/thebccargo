import { describe, it, expect } from 'vitest';
import {
  amountInWords,
  autoBoxCount,
  computeBill,
  effectiveBoxCount,
  emptyBox,
  generateBillNo,
  money,
  newBillDraft,
  resizeBoxes,
  validateBill,
  uid,
} from '../src/features/admin/shipments/billing/model';

const draft = () => {
  const d = newBillDraft('2026-10-18');
  d.receiver = { name: 'Puja Kadel', country: 'New Zealand', phone: '+64 27 230 3837', address: '84 Manukau Road', email: '' };
  d.sender.name = 'Laxman Kadel';
  d.totalWeightKg = 13.76;
  return d;
};

describe('box count', () => {
  it('rounds up past the 20 kg limit but not below it', () => {
    expect(autoBoxCount(19.5)).toBe(1);
    expect(autoBoxCount(20)).toBe(1);
    expect(autoBoxCount(20.01)).toBe(2);
    expect(autoBoxCount(40)).toBe(2);
    expect(autoBoxCount(0)).toBe(1);
  });
  it('lets the admin override the automatic count', () => {
    const d = draft();
    d.totalWeightKg = 19.5;
    d.boxCountMode = 'manual';
    d.boxCountManual = 2;
    expect(effectiveBoxCount(d)).toBe(2);
  });
  it('keeps typed items when boxes are added or removed', () => {
    const a = emptyBox();
    a.goods.push({ id: uid(), name: 'Saree', unit: 'set', qty: 2 });
    expect(resizeBoxes([a], 3)).toHaveLength(3);
    expect(resizeBoxes([a], 3)[0].goods).toHaveLength(1);
    expect(resizeBoxes([a, emptyBox()], 1)).toHaveLength(1);
  });
});

describe('charges', () => {
  it('adds freight, box charge and extras exactly', () => {
    const d = draft();
    d.extras = [{ id: 'x', name: 'Packing', amount: 250.5 }];
    const r = computeBill(d, 19180);
    expect(r.boxCharge).toBe(1100);
    expect(r.total).toBe(19180 + 1100 + 250.5);
  });
  it('charges liquid per bottle and honours a manual override', () => {
    const d = draft();
    d.boxes[0].liquids.push({ id: 'a', kind: 'Ghee', otherName: '', unit: 'btl', qty: 3 });
    expect(computeBill(d, 1000).liquidCharge).toBe(1800);
    d.liquidChargeOverride = 1500;
    expect(computeBill(d, 1000).liquidCharge).toBe(1500);
  });
  it('charges meat per kg (Europe 600, Hong Kong 1050) and warns when the country does not allow it', () => {
    const d = draft();
    d.receiver.country = 'Germany';
    d.boxes[0].meats.push({ id: 'm', name: 'Goat', kgPerUnit: 2, qty: 2 });
    expect(computeBill(d, 0).meatCharge).toBe(2400);
    d.receiver.country = 'Hong Kong';
    expect(computeBill(d, 0).meatCharge).toBe(4200);
    d.receiver.country = 'New Zealand';
    expect(computeBill(d, 0).warnings.join(' ')).toMatch(/Meat/);
  });
  it('ignores items in boxes beyond the box count', () => {
    const d = draft();
    d.boxes = [emptyBox(), emptyBox()];
    d.boxes[1].liquids.push({ id: 'a', kind: 'Oil', otherName: '', unit: 'btl', qty: 5 });
    expect(computeBill(d, 0).liquidCharge).toBe(0);
  });
  it('does not drift on decimals', () => {
    expect(money(0.1 + 0.2)).toBe(0.3);
    const d = draft();
    d.extras = [
      { id: '1', name: 'a', amount: 0.1 },
      { id: '2', name: 'b', amount: 0.2 },
    ];
    expect(computeBill(d, 0).extrasTotal).toBe(0.3);
  });
  it('warns when no rate is known instead of billing zero silently', () => {
    expect(computeBill(draft(), null).warnings.join(' ')).toMatch(/No rate/);
  });
  it('line amounts always sum to the total', () => {
    const d = draft();
    d.boxes[0].liquids.push({ id: 'a', kind: 'Honey', otherName: '', unit: 'btl', qty: 1 });
    d.extras = [{ id: 'x', name: 'Fee', amount: 99.99 }];
    const r = computeBill(d, 5000.55);
    expect(money(r.lines.reduce((s, l) => s + l.amount, 0))).toBe(r.total);
  });
});

describe('amount in words', () => {
  it('matches the printed total, in Indian grouping', () => {
    expect(amountInWords(20180)).toBe('Twenty Thousand One Hundred and Eighty Rupees Only');
    expect(amountInWords(100000)).toBe('One Lakh Rupees Only');
    expect(amountInWords(1250000)).toBe('Twelve Lakh Fifty Thousand Rupees Only');
    expect(amountInWords(20105)).toBe('Twenty Thousand One Hundred and Five Rupees Only');
    expect(amountInWords(1005)).toBe('One Thousand and Five Rupees Only');
    expect(amountInWords(0)).toBe('Zero Rupees Only');
    expect(amountInWords(10.5)).toBe('Ten Rupees and Fifty Paisa Only');
  });
});

describe('validation and bill number', () => {
  it('requires the receiver details', () => {
    expect(validateBill(newBillDraft('2026-10-18')).length).toBeGreaterThan(3);
    const d = draft();
    d.billNo = 'BC1810AB';
    expect(validateBill(d)).toEqual([]);
  });
  it('makes bill numbers like BC1810KT', () => {
    expect(generateBillNo(new Date(2026, 9, 18))).toMatch(/^BC1810[A-Z]{2}$/);
  });
});

import { buildBoxSheetsHtml, buildCustomerBillHtml } from '../src/features/admin/shipments/billing/print';

describe('printed documents', () => {
  const build = () => {
    const d = draft();
    d.billNo = 'BC1810AB';
    d.totalWeightKg = 30;
    d.receiver.name = '<script>alert(1)</script> Puja';
    d.boxes = [emptyBox(), emptyBox()];
    d.boxes[0].goods.push({ id: 'g', name: 'Saree & Blouse', unit: 'set', qty: 2 });
    d.boxes[1].liquids.push({ id: 'l', kind: 'Ghee', otherName: '', unit: 'btl', qty: 2 });
    d.extras = [{ id: 'e', name: 'Packing', amount: 100 }];
    return { draft: d, result: computeBill(d, 19180) };
  };
  it('customer bill shows the exact total and the same amount in words, in A5', () => {
    const s = build();
    const html = buildCustomerBillHtml(s);
    expect(html).toContain('size: A5');
    expect(html).toContain(`Rs.</span> ${s.result.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    expect(html).toContain(amountInWords(s.result.total));
    expect(html).toContain('Liquid Charge');
    expect(html).toContain('Packing');
  });
  it('escapes typed text so it cannot inject markup', () => {
    const html = buildCustomerBillHtml(build()) + buildBoxSheetsHtml(build());
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('Saree &amp; Blouse');
  });
  it('prints one sheet per box, or just the chosen box', () => {
    const s = build();
    expect(buildBoxSheetsHtml(s).match(/class='woori-card'/g)).toHaveLength(2);
    const one = buildBoxSheetsHtml(s, [1]);
    expect(one.match(/class='woori-card'/g)).toHaveLength(1);
    expect(one).toContain('2 / 2');
    expect(one).toContain('Butter');
    expect(one).not.toContain('Ghee');
    expect(one).not.toContain('Saree');
  });
});

describe('phone validation', () => {
  it('rejects a phone that is only the country code', () => {
    const d = draft();
    d.billNo = 'BC1810AB';
    d.receiver.phone = '+64 ';
    expect(validateBill(d).join(' ')).toMatch(/phone/i);
  });
});
