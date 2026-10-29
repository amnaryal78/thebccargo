import { test, describe, expect } from 'vitest';
import {
  calculateEstimate,
  calculateSheetShipmentQuote,
  calculateBoxCount,
  partitionBoxWeights,
  isMeatAllowedForCountry,
  getMeatRatePerKg,
  roundToNearest10,
  HandlingRule,
  DEFAULT_RATE_SETTINGS,
} from '../src/features/estimator/engine';
import {
  INITIAL_NATIONAL_RATES,
  INITIAL_INTERNATIONAL_RATES,
} from '../src/services/ratesService';
import { MOCK_SHEET_RATES } from './fixtures/mockSheetRates';

const SEEDED_HANDLING_RULES: HandlingRule[] = [
  {
    id: 'hr-01',
    flag: 'liquid',
    country_code: null,
    mode: null,
    allowed: true,
    surcharge_type: 'percent',
    surcharge_value: 0,
    requirements_md: 'Leak-proof sealed packaging and MSDS documentation required.',
    is_placeholder: false,
    active: true,
  },
  {
    id: 'hr-02',
    flag: 'meat',
    country_code: null,
    mode: null,
    allowed: true,
    surcharge_type: null,
    surcharge_value: 0,
    requirements_md: 'Factory-sealed, non-perishable cured items only.',
    is_placeholder: false,
    active: true,
  },
  {
    id: 'hr-03',
    flag: 'meat',
    country_code: 'USA',
    mode: 'air',
    allowed: false,
    surcharge_type: null,
    surcharge_value: 0,
    requirements_md: 'Perishable animal meat and food products of animal origin are prohibited for air parcel export to the USA under agricultural restrictions.',
    is_placeholder: false,
    active: true,
  },
  {
    id: 'hr-04',
    flag: 'medicine',
    country_code: null,
    mode: null,
    allowed: true,
    surcharge_type: null,
    surcharge_value: 0,
    requirements_md: 'Registered doctor prescription and pharmacy invoice required.',
    is_placeholder: false,
    active: true,
  },
];

const mockRates = {
  nationalRates: INITIAL_NATIONAL_RATES,
  internationalRates: INITIAL_INTERNATIONAL_RATES,
  sheetRates: MOCK_SHEET_RATES,
};

describe('Phase 1 — Google Sheet Live Rate Engine Suite', () => {
  describe('Box Count & Partitioning (Step 3)', () => {
    test('calculates correct box counts for various weights', () => {
      expect(calculateBoxCount(0)).toBe(0);
      expect(calculateBoxCount(3)).toBe(1);
      expect(calculateBoxCount(15)).toBe(1);
      expect(calculateBoxCount(20)).toBe(1);
      expect(calculateBoxCount(20.1)).toBe(2);
      expect(calculateBoxCount(30)).toBe(2);
      expect(calculateBoxCount(40)).toBe(2);
      expect(calculateBoxCount(45)).toBe(3);
    });

    test('partitions total weights into boxes with 20 kg cap', () => {
      expect(partitionBoxWeights(0)).toEqual([]);
      expect(partitionBoxWeights(3)).toEqual([3]);
      expect(partitionBoxWeights(20)).toEqual([20]);
      expect(partitionBoxWeights(30)).toEqual([20, 10]);
      expect(partitionBoxWeights(45)).toEqual([20, 20, 5]);
    });
  });

  describe('Pure Function Tests (Phase 1 Acceptance Criteria)', () => {
    test('UK 30 kg, liquid 2 btl + meat 1 kg -> base 23,500, box 2,200, liquid 1,400, meat 800', () => {
      const quote = calculateSheetShipmentQuote(
        {
          destination: 'United Kingdom',
          actualWeightKg: 30,
          hasLiquid: true,
          liquidBottleCount: 2,
          hasMeat: true,
          meatKg: 1,
        },
        MOCK_SHEET_RATES
      );

      // Box 1: 20 kg @ 700 = 14,000
      // Box 2: 10 kg @ 950 = 9,500
      // Base: 14,000 + 9,500 = 23,500
      expect(quote.allowed).toBe(true);
      expect(quote.boxCount).toBe(2);
      expect(quote.boxWeights).toEqual([20, 10]);
      expect(quote.baseShippingCharge).toBe(23500);
      expect(quote.boxCharge).toBe(2200); // 2 boxes * 1,100
      expect(quote.liquidCharge).toBe(1400); // 2 bottles * 700
      expect(quote.meatCharge).toBe(800); // 1 kg * 800
      expect(quote.totalNpr).toBe(23500 + 2200 + 1400 + 800); // 27,900
    });

    test('Korea 3 kg -> 3,550 base + 1,100 box', () => {
      const quote = calculateSheetShipmentQuote(
        {
          destination: 'South Korea',
          actualWeightKg: 3,
        },
        MOCK_SHEET_RATES
      );

      // 1 box of 3 kg, standard rate for Korea 3kg is 3,550
      expect(quote.allowed).toBe(true);
      expect(quote.boxCount).toBe(1);
      expect(quote.boxWeights).toEqual([3]);
      expect(quote.baseShippingCharge).toBe(3550);
      expect(quote.boxCharge).toBe(1100);
      expect(quote.totalNpr).toBe(3550 + 1100);
    });

    test('Meat on Korea -> blocked with clear message', () => {
      expect(isMeatAllowedForCountry('Korea')).toBe(false);
      expect(isMeatAllowedForCountry('South Korea')).toBe(false);

      const quote = calculateSheetShipmentQuote(
        {
          destination: 'South Korea',
          actualWeightKg: 5,
          hasMeat: true,
          meatKg: 1,
        },
        MOCK_SHEET_RATES
      );

      expect(quote.meatBlocked).toBe(true);
      expect(quote.meatBlockedReason).toBe('Meat is not available for this country.');
    });

    test('Meat on Hong Kong charges Rs 1,100 per kg', () => {
      expect(isMeatAllowedForCountry('Hong Kong')).toBe(true);
      expect(getMeatRatePerKg('Hong Kong')).toBe(1100);

      const quote = calculateSheetShipmentQuote(
        {
          destination: 'Hong Kong',
          actualWeightKg: 5,
          hasMeat: true,
          meatKg: 2,
        },
        MOCK_SHEET_RATES
      );

      expect(quote.meatBlocked).toBe(false);
      expect(quote.meatCharge).toBe(2200); // 2 kg * 1100
    });
  });

  describe('Full Estimator Integration via calculateEstimate', () => {
    test('calculates UK 30 kg estimate through calculateEstimate with sheetRates', () => {
      const result = calculateEstimate(
        {
          type: 'international',
          destination: 'UK',
          actualWeightKg: 30,
          flags: { liquid: true, meat: true },
          meatKg: 1,
        },
        mockRates,
        SEEDED_HANDLING_RULES,
        DEFAULT_RATE_SETTINGS
      );

      expect(result.allowed).toBe(true);
      expect(result.breakdown.baseFreightNpr).toBe(23500);
      expect(result.breakdown.boxChargeNpr).toBe(2200);
      expect(result.breakdown.totalNpr).toBe(27200); // 23,500 + 2,200 + 700 (1 btl) + 800 (1 kg meat)
    });

    test('blocks meat shipment to Korea through calculateEstimate', () => {
      const result = calculateEstimate(
        {
          type: 'international',
          destination: 'Korea',
          actualWeightKg: 3,
          flags: { meat: true },
          meatKg: 1,
        },
        mockRates,
        SEEDED_HANDLING_RULES,
        DEFAULT_RATE_SETTINGS
      );

      expect(result.allowed).toBe(false);
      expect(result.blockedReason).toBe('Meat is not available for this country.');
    });
  });

  describe('Range Rounding Utility', () => {
    test('rounds numbers correctly to the nearest 10', () => {
      expect(roundToNearest10(1234)).toBe(1230);
      expect(roundToNearest10(1235)).toBe(1240);
      expect(roundToNearest10(1239)).toBe(1240);
      expect(roundToNearest10(502)).toBe(500);
      expect(roundToNearest10(507)).toBe(510);
    });
  });
});
