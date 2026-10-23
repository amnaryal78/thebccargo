import { describe, it, expect } from 'vitest';
import { calculateSheetShipmentQuote, RESELLER_MARKUP_PER_KG_NPR } from '../src/features/estimator/engine';
import { getRolePermissions } from '../src/features/admin/types';
import { validateMessage } from '../src/services/messageService';
import { MOCK_SHEET_RATES } from './fixtures/mockSheetRates';

describe('Reseller role', () => {
  const input = { destination: 'United Kingdom', actualWeightKg: 30 };

  it('adds exactly Rs 50 per kg to the reseller estimate and nothing for normal users', () => {
    const normal = calculateSheetShipmentQuote(input, MOCK_SHEET_RATES);
    const reseller = calculateSheetShipmentQuote({ ...input, isReseller: true }, MOCK_SHEET_RATES);

    expect(RESELLER_MARKUP_PER_KG_NPR).toBe(50);
    expect(normal.resellerMarkupNpr).toBeUndefined();
    expect(reseller.resellerMarkupNpr).toBe(30 * 50);
    expect(reseller.totalNpr - normal.totalNpr).toBe(30 * 50);
  });

  it('keeps total equal to the sum of visible line items for resellers', () => {
    const q = calculateSheetShipmentQuote({ ...input, isReseller: true, hasLiquid: true }, MOCK_SHEET_RATES);
    expect(q.totalNpr).toBe(q.baseShippingCharge + q.boxCharge + q.liquidCharge + q.medicineCharge + q.meatCharge);
  });

  it('gives resellers no admin permissions', () => {
    const p = getRolePermissions('reseller');
    expect(p.canViewDashboard).toBe(false);
    expect(p.canManageUsers).toBe(false);
    expect(p.canManageShipments).toBe(false);
    expect(p.isReadOnly).toBe(true);
  });
});

describe('Customer message validation', () => {
  it('requires a name, a phone number and a message', () => {
    expect(validateMessage('', '9800000000', 'hi')).toMatch(/name/i);
    expect(validateMessage('Sita', '123', 'hi')).toMatch(/phone/i);
    expect(validateMessage('Sita', '+977 9800000000', '  ')).toMatch(/message/i);
    expect(validateMessage('Sita', '+977 9800000000', 'Rate to UK?')).toBeNull();
  });
});
