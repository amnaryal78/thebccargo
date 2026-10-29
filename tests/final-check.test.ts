import { describe, it, expect } from 'vitest';
import {
  calculateSheetShipmentQuote,
  calculateBoxCount,
  partitionBoxWeights,
  isMeatAllowedForCountry,
  getMeatRatePerKg,
} from '../src/features/estimator/engine';
import { MOCK_SHEET_RATES } from './fixtures/mockSheetRates';

describe('Phase 9 — Final Check & Quality Assurance', () => {
  describe('1. Box Packaging & Partitioning (Max 20 kg per box)', () => {
    it('calculates correct box counts up to heavy shipments', () => {
      expect(calculateBoxCount(0.5)).toBe(1);
      expect(calculateBoxCount(5)).toBe(1);
      expect(calculateBoxCount(20)).toBe(1);
      expect(calculateBoxCount(20.5)).toBe(2);
      expect(calculateBoxCount(35)).toBe(2);
      expect(calculateBoxCount(40)).toBe(2);
      expect(calculateBoxCount(41)).toBe(3);
      expect(calculateBoxCount(60)).toBe(3);
      expect(calculateBoxCount(61)).toBe(4);
    });

    it('partitions weights into valid standard box chunks (<= 20 kg)', () => {
      const p35 = partitionBoxWeights(35);
      expect(p35).toEqual([20, 15]);

      const p45 = partitionBoxWeights(45);
      expect(p45).toEqual([20, 20, 5]);

      const p60 = partitionBoxWeights(60);
      expect(p60).toEqual([20, 20, 20]);
    });
  });

  describe('2. Country Corridor Rules: Meat Lock & Permitted Destinations', () => {
    it('enforces meat lock: permitted ONLY for Europe, UK, and Hong Kong', () => {
      // Allowed corridors
      expect(isMeatAllowedForCountry('GB')).toBe(true);
      expect(isMeatAllowedForCountry('UK')).toBe(true);
      expect(isMeatAllowedForCountry('HK')).toBe(true);
      expect(isMeatAllowedForCountry('Hong Kong')).toBe(true);
      expect(isMeatAllowedForCountry('DE')).toBe(true); // Germany (EU)
      expect(isMeatAllowedForCountry('FR')).toBe(true); // France (EU)
      expect(isMeatAllowedForCountry('IT')).toBe(true); // Italy (EU)
      expect(isMeatAllowedForCountry('PT')).toBe(true); // Portugal (EU)
      expect(isMeatAllowedForCountry('CY')).toBe(true); // Cyprus (EU)
      expect(isMeatAllowedForCountry('MT')).toBe(true); // Malta (EU)

      // Strictly prohibited corridors
      expect(isMeatAllowedForCountry('KR')).toBe(false); // South Korea
      expect(isMeatAllowedForCountry('Korea')).toBe(false);
      expect(isMeatAllowedForCountry('MY')).toBe(false); // Malaysia
      expect(isMeatAllowedForCountry('Malaysia')).toBe(false);
      expect(isMeatAllowedForCountry('JP')).toBe(false); // Japan
      expect(isMeatAllowedForCountry('Japan')).toBe(false);
      expect(isMeatAllowedForCountry('US')).toBe(false); // USA
      expect(isMeatAllowedForCountry('AE')).toBe(false); // UAE / Dubai
      expect(isMeatAllowedForCountry('AU')).toBe(false); // Australia
      expect(isMeatAllowedForCountry('CA')).toBe(false); // Canada
      expect(isMeatAllowedForCountry('IN')).toBe(false); // India
    });

    it('returns official meat tariff rates: Rs 800 for EU/UK, Rs 1,100 for Hong Kong, 0/locked for others', () => {
      expect(getMeatRatePerKg('GB')).toBe(800);
      expect(getMeatRatePerKg('UK')).toBe(800);
      expect(getMeatRatePerKg('DE')).toBe(800);
      expect(getMeatRatePerKg('HK')).toBe(1100);
      expect(getMeatRatePerKg('Hong Kong')).toBe(1100);
      expect(getMeatRatePerKg('KR')).toBe(0);
      expect(getMeatRatePerKg('US')).toBe(0);
    });
  });

  describe('3. Pricing Parity & Bill Calculation Integrity', () => {
    it('calculates mathematically exact totals for UK (10 kg and 30 kg)', () => {
      const quote10 = calculateSheetShipmentQuote(
        {
          destination: 'United Kingdom',
          actualWeightKg: 10,
          hasLiquid: false,
          hasMeat: false,
          hasMedicine: false,
        },
        MOCK_SHEET_RATES
      );

      expect(quote10.allowed).toBe(true);
      expect(quote10.boxCount).toBe(1);
      // Mathematical parity: totalNpr strictly equals sum of all line items
      const expectedTotal10 =
        quote10.baseShippingCharge +
        quote10.boxCharge +
        quote10.liquidCharge +
        quote10.meatCharge +
        quote10.medicineCharge;
      expect(quote10.totalNpr).toBe(expectedTotal10);

      // UK 30 kg shipment (2 boxes: 20kg + 10kg, with liquid, meat & medicine)
      const quote30 = calculateSheetShipmentQuote(
        {
          destination: 'United Kingdom',
          actualWeightKg: 30,
          hasLiquid: true,
          liquidBottleCount: 3,
          hasMeat: true,
          meatKg: 5,
          hasMedicine: true,
        },
        MOCK_SHEET_RATES
      );

      expect(quote30.allowed).toBe(true);
      expect(quote30.boxCount).toBe(2);
      expect(quote30.boxCharge).toBe(2200); // 2 boxes * 1100
      expect(quote30.liquidCharge).toBe(2100); // 3 bottles * 700
      expect(quote30.medicineCharge).toBe(0); // medicine: contact us
      expect(quote30.medicineOnRequest).toBe(true);
      expect(quote30.meatCharge).toBe(4000); // 5 kg * 800
      const expectedTotal30 =
        quote30.baseShippingCharge +
        quote30.boxCharge +
        quote30.liquidCharge +
        quote30.meatCharge +
        quote30.medicineCharge;
      expect(quote30.totalNpr).toBe(expectedTotal30);
    });

    it('calculates correct South Korea quotes with meat locked and blocked', () => {
      const quoteKR = calculateSheetShipmentQuote(
        {
          destination: 'Korea',
          actualWeightKg: 5,
          hasLiquid: true,
          hasMeat: true, // Should be blocked because meat is prohibited in Korea
          meatKg: 2,
          hasMedicine: false,
        },
        MOCK_SHEET_RATES
      );

      expect(quoteKR.allowed).toBe(true);
      expect(quoteKR.meatBlocked).toBe(true);
      expect(quoteKR.meatCharge).toBe(0);
      expect(quoteKR.boxCount).toBe(1);
      expect(quoteKR.totalNpr).toBe(
        quoteKR.baseShippingCharge + quoteKR.boxCharge + quoteKR.liquidCharge
      );
    });
  });

  describe('4. Offline Resilience (No Invented / Fake Numbers)', () => {
    it('returns allowed=false and zero price when no matching rates exist', () => {
      const invalidQuote = calculateSheetShipmentQuote(
        {
          destination: 'NonExistentCountryX',
          actualWeightKg: 10,
          hasLiquid: false,
          hasMeat: false,
          hasMedicine: false,
        },
        [] // Offline / empty rates
      );

      expect(invalidQuote.allowed).toBe(false);
      expect(invalidQuote.baseShippingCharge).toBe(0);
      expect(invalidQuote.totalNpr).toBe(0);
      expect(invalidQuote.blockedReason).toContain('unavailable');
    });
  });
});
