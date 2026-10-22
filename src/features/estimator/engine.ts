/**
 * Estimator Engine — Pure TypeScript calculation functions
 * Pure functions: No React or Supabase imports.
 * Live Google Sheet rate calculation and packaging logic for BC Cargo.
 */

import { HOME_PICKUP_FEE_NPR } from './pickup';

import {
  calculateVolumetricWeight,
  getChargeableWeight,
  NationalRate,
  InternationalRate,
  SheetRateItem,
} from '../../services/ratesService';

export type ShipmentType = 'national' | 'international';
export type CargoMode = 'air' | 'overland';

export interface ContentFlags {
  liquid?: boolean;
  meat?: boolean;
  medicine?: boolean;
}

export interface HandlingRule {
  id: string;
  flag: 'liquid' | 'meat' | 'medicine' | 'other';
  country_code?: string | null;
  mode?: string | null;
  allowed: boolean;
  surcharge_type?: 'flat_npr' | 'per_kg_npr' | 'percent' | null;
  surcharge_value: number;
  requirements_md: string;
  is_placeholder: boolean;
  active: boolean;
}

export interface RateSettings {
  fuelSurchargePercent: number;
  handlingFeeNpr: number;
  usdToNprRate: number;
  minChargeNpr: number;
}

export const DEFAULT_RATE_SETTINGS: RateSettings = {
  fuelSurchargePercent: 0,
  handlingFeeNpr: 0,
  usdToNprRate: 0,
  minChargeNpr: 0,
};

// ============================================================================
// PHASE 1: GOOGLE SHEET RATE RULES CONSTANTS & PURE FUNCTIONS
// ============================================================================

export const BOX_MAX_WEIGHT_KG = 20;
export const BOX_CHARGE_NPR = 1000;
export const LIQUID_FEE_PER_BOX_NPR = 600;
export const MEDICINE_FEE_PER_BOX_NPR = 600;
export const MEAT_FEE_EUROPE_UK_PER_KG = 600;
export const MEAT_FEE_HONG_KONG_PER_KG = 1100;
/** Extra shown to signed-in resellers, per kg of total weight. */
export const RESELLER_MARKUP_PER_KG_NPR = 50;

export interface SheetShipmentInput {
  destination: string; // country name, code, or rate group (e.g. 'United Kingdom', 'Korea', 'UK')
  actualWeightKg: number;
  hasLiquid?: boolean;
  liquidBoxCount?: number;
  hasMedicine?: boolean;
  medicineBoxCount?: number;
  hasMeat?: boolean;
  meatKg?: number;
  /** Reseller price view: adds RESELLER_MARKUP_PER_KG_NPR per kg to the shipping charge. */
  isReseller?: boolean;
}

export interface BoxBreakdownItem {
  boxIndex: number;
  weightKg: number;
  bracketUsed: string;
  priceNpr: number;
}

export interface SheetQuoteResult {
  allowed: boolean;
  blockedReason?: string;
  destinationName: string;
  rateGroup: string;
  totalWeightKg: number;
  boxCount: number;
  boxWeights: number[];
  boxDetails: BoxBreakdownItem[];
  baseShippingCharge: number;
  boxCharge: number;
  liquidCharge: number;
  medicineCharge: number;
  meatCharge: number;
  /** Already included in baseShippingCharge and totalNpr. */
  resellerMarkupNpr?: number;
  totalNpr: number;
  /** Extra charge when we collect from the sender's home (already included in totalNpr). */
  pickupFeeNpr?: number;
  pickupArea?: string;
  meatBlocked: boolean;
  meatBlockedReason?: string;
}

/**
 * Step 3: Calculate number of boxes
 * One box = max 20 kg. Boxes = weight ÷ 20, rounded up.
 */
export function calculateBoxCount(weightKg: number): number {
  if (weightKg <= 0 || !isFinite(weightKg)) return 0;
  return Math.ceil(weightKg / BOX_MAX_WEIGHT_KG);
}

/**
 * Distributes total shipment weight into individual boxes (max 20 kg per box).
 * Example: 30 kg -> [20, 10]; 45 kg -> [20, 20, 5]; 3 kg -> [3].
 */
export function partitionBoxWeights(totalWeightKg: number): number[] {
  if (totalWeightKg <= 0 || !isFinite(totalWeightKg)) return [];
  const count = calculateBoxCount(totalWeightKg);
  const weights: number[] = [];
  let remaining = totalWeightKg;

  for (let i = 0; i < count; i++) {
    const boxWeight = Math.min(BOX_MAX_WEIGHT_KG, remaining);
    weights.push(Number(boxWeight.toFixed(2)));
    remaining -= boxWeight;
  }

  return weights;
}

// Countries and rate groups where meat shipping is permitted
const MEAT_ALLOWED_EUROPE_UK_GROUPS = new Set([
  'uk',
  'gb',
  'united kingdom',
  'britain',
  'great britain',
  'gbr',
  'eu a',
  'eu b',
  'malta',
  'mt',
  'cyprus',
  'cy',
  'austria',
  'at',
  'germany',
  'de',
  'luxembourg',
  'lu',
  'netherlands',
  'nl',
  'czech republic',
  'cz',
  'denmark',
  'dk',
  'france',
  'fr',
  'monaco',
  'mc',
  'hungary',
  'hu',
  'italy',
  'it',
  'ireland',
  'ie',
  'poland',
  'pl',
  'slovakia',
  'sk',
  'slovenia',
  'si',
  'spain',
  'es',
  'sweden',
  'se',
  'portugal',
  'pt',
  'croatia',
  'hr',
  'estonia',
  'ee',
  'finland',
  'fi',
  'lithuania',
  'lt',
  'latvia',
  'lv',
  'romania',
  'ro',
  'greece',
  'gr',
  'bulgaria',
  'bg',
]);

const MEAT_ALLOWED_HONG_KONG_GROUPS = new Set([
  'hong kong',
  'hong kong sar',
  'hkg',
  'hk',
]);

/**
 * Step 5: Check if meat is allowed for the target country/rate group.
 * Allowed ONLY for UK, Europe (EU A, EU B, Malta, Cyprus), and Hong Kong.
 */
export function isMeatAllowedForCountry(countryOrGroup: string): boolean {
  if (!countryOrGroup) return false;
  const normalized = countryOrGroup.trim().toLowerCase();
  return (
    MEAT_ALLOWED_EUROPE_UK_GROUPS.has(normalized) ||
    MEAT_ALLOWED_HONG_KONG_GROUPS.has(normalized)
  );
}

/**
 * Step 5: Get per-kg meat rate.
 * Rs 600/kg for Europe & UK; Rs 1,100/kg for Hong Kong; 0 for others.
 */
export function getMeatRatePerKg(countryOrGroup: string): number {
  if (!countryOrGroup) return 0;
  const normalized = countryOrGroup.trim().toLowerCase();
  if (MEAT_ALLOWED_HONG_KONG_GROUPS.has(normalized)) {
    return MEAT_FEE_HONG_KONG_PER_KG;
  }
  if (MEAT_ALLOWED_EUROPE_UK_GROUPS.has(normalized)) {
    return MEAT_FEE_EUROPE_UK_PER_KG;
  }
  return 0;
}

/**
 * Common alternative names and sheet listing spellings
 */
const COUNTRY_NAME_ALIASES: Record<string, string[]> = {
  'australia': ['australia', 'aus', 'syd'],
  'austria': ['austria', 'eu a', 'eu b', 'at', 'aut', 'vie'],
  'bahrain': ['bharain', 'bahrain', 'gulf country', 'gulf', 'bah'],
  'belgium': ['belgium', 'eu a', 'eu b', 'be', 'bel', 'bru'],
  'bulgaria': ['bulgaria', 'eu b', 'eu a', 'bg', 'bgr', 'sof'],
  'canada': ['canada', 'can', 'yyz'],
  'croatia': ['coratia', 'croatia', 'eu a', 'eu b', 'hr', 'hrv', 'zag'],
  'cyprus': ['cyprus', 'cyp', 'lca'],
  'czech republic': ['chech republic', 'czech republic', 'czechia', 'czech', 'eu a', 'eu b', 'cz', 'cze', 'prg'],
  'denmark': ['denmark', 'eu a', 'eu b', 'dk', 'dnk', 'cph'],
  'estonia': ['estonia', 'eu a', 'eu b', 'ee', 'est', 'tll'],
  'finland': ['finland', 'eu a', 'eu b', 'fi', 'fin', 'hel'],
  'france': ['france', 'eu a', 'eu b', 'fr', 'fra', 'cdg'],
  'germany': ['germany', 'eu a', 'eu b', 'de', 'deu', 'fra'],
  'greece': ['greece', 'eu a', 'eu b', 'gr', 'grc', 'ath'],
  'hong kong': ['hong kong', 'hong kong sar', 'hkg', 'hk'],
  'hungary': ['hungary', 'eu a', 'eu b', 'hu', 'hun', 'bud'],
  'ireland': ['ireland', 'eu a', 'eu b', 'ie', 'irl', 'dub'],
  'italy': ['italy', 'eu a', 'eu b', 'it', 'ita', 'fco'],
  'japan': ['japan', 'jpn', 'jp', 'nrt'],
  'korea': ['korea', 'south korea', 'republic of korea', 'kor', 'icn'],
  'kuwait': ['kuwait', 'gulf country', 'gulf', 'kwt', 'kwi'],
  'latvia': ['latvia', 'eu a', 'eu b', 'lv', 'lva', 'rix'],
  'lithuania': ['lithuania', 'eu a', 'eu b', 'lt', 'ltu', 'vno'],
  'luxembourg': ['luxembourg', 'eu a', 'eu b', 'lu', 'lux'],
  'malaysia': ['malasiya', 'malaysia', 'mys', 'my', 'kul'],
  'malta': ['malta', 'mlt', 'mt', 'mla'],
  'monaco': ['monaco', 'eu a', 'eu b', 'mc', 'mco', 'nce'],
  'netherlands': ['netherlands', 'holland', 'eu a', 'eu b', 'nl', 'nld', 'ams'],
  'new zealand': ['new zealand', 'nzl', 'nz', 'akl'],
  'philippines': ['philippines', 'phl', 'ph', 'mnl'],
  'poland': ['poland', 'eu a', 'eu b', 'pl', 'pol', 'waw'],
  'portugal': ['portugal', 'eu a', 'eu b', 'pt', 'prt', 'lis'],
  'qatar': ['qatar', 'gulf country', 'gulf', 'qat', 'qa', 'doh'],
  'romania': ['romania', 'eu b', 'eu a', 'ro', 'rou', 'otp'],
  'saudi arabia': ['saudi arabia', 'saudi', 'gulf country', 'gulf', 'sau', 'sa', 'ruh'],
  'slovakia': ['slovakia', 'eu a', 'eu b', 'sk', 'svk', 'bts'],
  'slovenia': ['slovenia', 'eu a', 'eu b', 'si', 'svn', 'lju'],
  'spain': ['spain', 'eu a', 'eu b', 'es', 'esp', 'mad'],
  'sweden': ['sweden', 'eu a', 'eu b', 'se', 'swe', 'arn'],
  'taiwan': ['taiwan', 'twn', 'tw', 'tpe'],
  'uae': ['uae', 'united arab emirates', 'dubai', 'gulf country', 'gulf', 'are', 'dxb'],
  'uk': ['uk', 'united kingdom', 'great britain', 'britain', 'gbr', 'gb', 'lhr'],
  'usa': ['usa', 'united states', 'united states of america', 'us', 'usa', 'jfk'],
  'europe': ['eu a', 'eu b', 'europe'],
};

/**
 * Match user-selected country string with rate groups in the sheet
 */
export function findRateGroupForCountry(
  countryNameOrCode: string,
  rates: SheetRateItem[]
): { rateGroup: string; displayName: string } | null {
  if (!countryNameOrCode || rates.length === 0) return null;
  const target = countryNameOrCode.trim().toLowerCase();

  // 1. Direct match
  for (const item of rates) {
    if (!item.active) continue;

    if (item.rate_group.toLowerCase() === target) {
      return { rateGroup: item.rate_group, displayName: item.display_name };
    }
    if (item.display_name.toLowerCase() === target) {
      return { rateGroup: item.rate_group, displayName: item.display_name };
    }
    if (item.supported_countries && Array.isArray(item.supported_countries)) {
      const match = item.supported_countries.some(
        (c) => c.toLowerCase() === target || target.includes(c.toLowerCase())
      );
      if (match) {
        return { rateGroup: item.rate_group, displayName: item.display_name };
      }
    }
  }

  // 2. Alias fallback check
  for (const [canonical, aliases] of Object.entries(COUNTRY_NAME_ALIASES)) {
    if (target === canonical || aliases.includes(target) || target.includes(canonical)) {
      for (const item of rates) {
        if (!item.active) continue;
        const groupLow = item.rate_group.toLowerCase();
        const displayLow = item.display_name.toLowerCase();
        if (
          groupLow === canonical ||
          displayLow === canonical ||
          aliases.includes(groupLow) ||
          aliases.includes(displayLow)
        ) {
          return { rateGroup: item.rate_group, displayName: item.display_name };
        }
      }
    }
  }

  return null;
}

/**
 * Step 4: Calculate base price for a single box from the sheet
 * - Box has 20 kg or more -> 20_plus rate * box kg
 * - Box has 10 kg to 19.99 kg -> 10_plus rate * box kg
 * - Box has less than 10 kg -> round up to next 0.5 kg, standard row price
 */
export function calculateBoxBasePrice(
  boxWeightKg: number,
  rates: SheetRateItem[],
  rateGroup: string
): { priceNpr: number; bracketUsed: string } {
  const groupRates = rates.filter(
    (r) => r.rate_group.toLowerCase() === rateGroup.toLowerCase() && r.active
  );

  if (groupRates.length === 0) {
    return { priceNpr: 0, bracketUsed: 'Unavailable' };
  }

  // Tier 1: 20+ kg
  if (boxWeightKg >= 20) {
    const tier20 = groupRates.find((r) => r.weight_tier === '20_plus');
    if (tier20) {
      const price = Math.round(tier20.price_npr * boxWeightKg);
      return {
        priceNpr: price,
        bracketUsed: `20+ kg (Rs ${tier20.price_npr}/kg × ${boxWeightKg} kg)`,
      };
    }
  }

  // Tier 2: 10 to 19.99 kg
  if (boxWeightKg >= 10 && boxWeightKg < 20) {
    const tier10 = groupRates.find((r) => r.weight_tier === '10_plus');
    if (tier10) {
      const price = Math.round(tier10.price_npr * boxWeightKg);
      return {
        priceNpr: price,
        bracketUsed: `10+ kg (Rs ${tier10.price_npr}/kg × ${boxWeightKg} kg)`,
      };
    }
  }

  // Tier 3: Less than 10 kg (round up to next 0.5 kg, min 1 kg, max 9.5 kg)
  const roundedKg = Math.max(1, Math.ceil(boxWeightKg * 2) / 2);

  if (roundedKg >= 10) {
    const tier10 = groupRates.find((r) => r.weight_tier === '10_plus');
    if (tier10) {
      const price = Math.round(tier10.price_npr * boxWeightKg);
      return {
        priceNpr: price,
        bracketUsed: `10+ kg (Rs ${tier10.price_npr}/kg × ${boxWeightKg} kg)`,
      };
    }
  }

  const standardRow = groupRates.find(
    (r) =>
      r.weight_tier === 'standard' &&
      r.weight_kg !== null &&
      Math.abs(r.weight_kg - roundedKg) < 0.01
  );

  if (standardRow) {
    return {
      priceNpr: standardRow.price_npr,
      bracketUsed: `Standard ${roundedKg} kg (flat Rs ${standardRow.price_npr})`,
    };
  }

  // Fallback if exact 0.5 step wasn't present: pick nearest standard row
  const standardRows = groupRates
    .filter((r) => r.weight_tier === 'standard' && r.weight_kg !== null)
    .sort((a, b) => (a.weight_kg || 0) - (b.weight_kg || 0));

  if (standardRows.length > 0) {
    const fallback =
      standardRows.find((r) => (r.weight_kg || 0) >= roundedKg) ||
      standardRows[standardRows.length - 1];
    return {
      priceNpr: fallback.price_npr,
      bracketUsed: `Standard ${fallback.weight_kg} kg (flat Rs ${fallback.price_npr})`,
    };
  }

  return { priceNpr: 0, bracketUsed: 'Unavailable' };
}

/**
 * Main Pure Rate Engine for Live Sheet Rates
 * Steps 1 through 6 in docs/PHASES.md
 */
export function calculateSheetShipmentQuote(
  input: SheetShipmentInput,
  rates: SheetRateItem[]
): SheetQuoteResult {
  const match = findRateGroupForCountry(input.destination, rates);

  if (!match) {
    return {
      allowed: false,
      blockedReason: `Rates for ${input.destination || 'selected country'} are currently unavailable.`,
      destinationName: input.destination,
      rateGroup: '',
      totalWeightKg: input.actualWeightKg,
      boxCount: 0,
      boxWeights: [],
      boxDetails: [],
      baseShippingCharge: 0,
      boxCharge: 0,
      liquidCharge: 0,
      medicineCharge: 0,
      meatCharge: 0,
      totalNpr: 0,
      meatBlocked: false,
    };
  }

  const { rateGroup, displayName } = match;
  const totalWeight = Math.max(0, input.actualWeightKg || 0);
  const boxCount = calculateBoxCount(totalWeight);
  const boxWeights = partitionBoxWeights(totalWeight);

  // Calculate base price for each box
  const boxDetails: BoxBreakdownItem[] = [];
  let baseShippingCharge = 0;

  boxWeights.forEach((weight, idx) => {
    const { priceNpr, bracketUsed } = calculateBoxBasePrice(weight, rates, rateGroup);
    baseShippingCharge += priceNpr;
    boxDetails.push({
      boxIndex: idx + 1,
      weightKg: weight,
      bracketUsed,
      priceNpr,
    });
  });

  const resellerMarkupNpr = input.isReseller ? Math.round(totalWeight * RESELLER_MARKUP_PER_KG_NPR) : 0;
  baseShippingCharge += resellerMarkupNpr;

  // Box charges: Rs 1,000 per box
  const boxCharge = boxCount * BOX_CHARGE_NPR;

  // Liquid fee: Rs 600 per box that has liquid
  const liquidBoxes = input.hasLiquid
    ? Math.min(boxCount, input.liquidBoxCount !== undefined ? input.liquidBoxCount : boxCount)
    : 0;
  const liquidCharge = liquidBoxes * LIQUID_FEE_PER_BOX_NPR;

  // Medicine fee: Rs 600 per box that has medicine
  const medicineBoxes = input.hasMedicine
    ? Math.min(boxCount, input.medicineBoxCount !== undefined ? input.medicineBoxCount : boxCount)
    : 0;
  const medicineCharge = medicineBoxes * MEDICINE_FEE_PER_BOX_NPR;

  // Meat fee & compliance check
  let meatCharge = 0;
  let meatBlocked = false;
  let meatBlockedReason: string | undefined;

  if (input.hasMeat) {
    const meatAllowed = isMeatAllowedForCountry(rateGroup) || isMeatAllowedForCountry(displayName) || isMeatAllowedForCountry(input.destination);
    if (!meatAllowed) {
      meatBlocked = true;
      meatBlockedReason = 'Meat is not available for this country.';
    } else {
      const meatKg = Math.max(0, input.meatKg || 0);
      const meatRate = getMeatRatePerKg(rateGroup) || getMeatRatePerKg(displayName) || getMeatRatePerKg(input.destination);
      meatCharge = Math.round(meatKg * meatRate);
    }
  }

  // Step 6: Total = base + box charge + liquid + medicine + meat.
  // Nothing else. No fuel fee. No handling fee. No USD.
  const totalNpr = baseShippingCharge + boxCharge + liquidCharge + medicineCharge + meatCharge;

  return {
    allowed: true,
    destinationName: displayName,
    rateGroup,
    totalWeightKg: totalWeight,
    boxCount,
    boxWeights,
    boxDetails,
    baseShippingCharge,
    boxCharge,
    liquidCharge,
    medicineCharge,
    meatCharge,
    resellerMarkupNpr: resellerMarkupNpr || undefined,
    totalNpr,
    meatBlocked,
    meatBlockedReason,
  };
}

// ============================================================================
// BACKWARD-COMPATIBLE ENGINE WRAPPER FOR EXISTING ESTIMATOR COMPONENTS
// ============================================================================

export interface EstimatorInput {
  type?: ShipmentType;
  destination: string;
  actualWeightKg: number;
  dimensions?: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
  mode?: CargoMode;
  flags?: ContentFlags;
  doorstepPickup?: boolean;
  liquidBoxCount?: number;
  medicineBoxCount?: number;
  meatKg?: number;
}

export interface PriceBreakdown {
  baseFreightNpr: number;
  baseFreightUsd?: number;
  fuelSurchargeNpr: number;
  handlingFeeNpr: number;
  specialHandlingSurchargeNpr: number;
  pickupFeeNpr: number;
  subtotalNpr: number;
  minChargeApplied: boolean;
  totalNpr: number;
  totalUsd?: number;
  rangeNpr: { min: number; max: number };
  rangeUsd?: { min: number; max: number };
  boxCount?: number;
  boxChargeNpr?: number;
}

export interface GuidanceCard {
  flag: 'liquid' | 'meat' | 'medicine';
  allowed: boolean;
  title: string;
  requirementsMd: string;
  surchargeNotice?: string;
  isPlaceholder: boolean;
}

export interface EstimateResult {
  chargeableWeightKg: number;
  actualWeightKg: number;
  volumetricWeightKg: number;
  isVolumetric: boolean;
  allowed: boolean;
  blockedReason?: string;
  missingBand: boolean;
  serviceName?: string;
  destinationName: string;
  mode: CargoMode;
  breakdown: PriceBreakdown;
  appliedRules: HandlingRule[];
  guidanceCards: GuidanceCard[];
  isPlaceholderWarning: boolean;
  currency: 'NPR' | 'USD';
  sheetQuote?: SheetQuoteResult;
}

export function roundToNearest10(value: number): number {
  return Math.round(value / 10) * 10;
}

export function resolveHandlingRule(
  flag: 'liquid' | 'meat' | 'medicine',
  rules: HandlingRule[],
  destination: string,
  mode: CargoMode,
  _type?: ShipmentType
): HandlingRule | null {
  const activeRules = rules.filter((r) => r.active && r.flag === flag);
  if (activeRules.length === 0) return null;

  const destUpper = destination.trim().toUpperCase();
  const corridorMatch = activeRules.find(
    (r) => r.country_code && r.country_code.toUpperCase() === destUpper && (!r.mode || r.mode === mode)
  );
  if (corridorMatch) return corridorMatch;

  const modeMatch = activeRules.find((r) => !r.country_code && r.mode === mode);
  if (modeMatch) return modeMatch;

  const globalMatch = activeRules.find((r) => !r.country_code && !r.mode);
  return globalMatch || activeRules[0] || null;
}

export function calculateEstimate(
  input: EstimatorInput,
  rates: {
    nationalRates?: NationalRate[];
    internationalRates: InternationalRate[];
    sheetRates?: SheetRateItem[];
  },
  handlingRules: HandlingRule[],
  settings: RateSettings = DEFAULT_RATE_SETTINGS
): EstimateResult {
  const mode: CargoMode = input.mode || 'air';
  const actualWeight = Math.max(0, input.actualWeightKg || 0);

  let volumetricWeight = 0;
  if (input.dimensions && input.dimensions.lengthCm && input.dimensions.widthCm && input.dimensions.heightCm) {
    volumetricWeight = calculateVolumetricWeight(
      input.dimensions.lengthCm,
      input.dimensions.widthCm,
      input.dimensions.heightCm,
      mode
    );
  }

  const chargeableWeight = getChargeableWeight(actualWeight, volumetricWeight);
  const isVolumetric = volumetricWeight > actualWeight;

  // If live sheet rates are provided, use Phase 1 pure logic
  if (rates.sheetRates && rates.sheetRates.length > 0) {
    const sheetQuote = calculateSheetShipmentQuote(
      {
        destination: input.destination,
        actualWeightKg: chargeableWeight,
        hasLiquid: input.flags?.liquid,
        liquidBoxCount: input.liquidBoxCount,
        hasMedicine: input.flags?.medicine,
        medicineBoxCount: input.medicineBoxCount,
        hasMeat: input.flags?.meat,
        meatKg: input.meatKg,
      },
      rates.sheetRates
    );

    const guidanceCards: GuidanceCard[] = [];
    if (input.flags?.liquid) {
      guidanceCards.push({
        flag: 'liquid',
        allowed: true,
        title: 'Liquid / Fluid Shipment',
        requirementsMd: 'Leak-proof sealed packaging required. Surcharge Rs 600 per box.',
        surchargeNotice: `Rs ${sheetQuote.liquidCharge} (${sheetQuote.boxCount} boxes)`,
        isPlaceholder: false,
      });
    }
    if (input.flags?.medicine) {
      guidanceCards.push({
        flag: 'medicine',
        allowed: true,
        title: 'Medical Protocol',
        requirementsMd: 'Doctor prescription and invoice required. Surcharge Rs 600 per box.',
        surchargeNotice: `Rs ${sheetQuote.medicineCharge} (${sheetQuote.boxCount} boxes)`,
        isPlaceholder: false,
      });
    }
    if (input.flags?.meat) {
      guidanceCards.push({
        flag: 'meat',
        allowed: !sheetQuote.meatBlocked,
        title: 'Meat & Animal Origin Compliance',
        requirementsMd: sheetQuote.meatBlocked
          ? 'Meat is not available for this country.'
          : 'Factory-sealed, certified meat items only.',
        surchargeNotice: sheetQuote.meatBlocked
          ? undefined
          : `Rs ${sheetQuote.meatCharge}`,
        isPlaceholder: false,
      });
    }

    const pickupFeeNpr = input.doorstepPickup ? HOME_PICKUP_FEE_NPR : 0;
    const totalNpr = sheetQuote.totalNpr + pickupFeeNpr;

    return {
      chargeableWeightKg: chargeableWeight,
      actualWeightKg: actualWeight,
      volumetricWeightKg: volumetricWeight,
      isVolumetric,
      allowed: sheetQuote.allowed && !sheetQuote.meatBlocked,
      blockedReason: (() => {
        if (sheetQuote.meatBlocked) {
          const rule = resolveHandlingRule('meat', handlingRules, input.destination, mode, input.type);
          if (rule && !rule.allowed) return rule.requirements_md;
          return sheetQuote.meatBlockedReason;
        }
        return sheetQuote.blockedReason;
      })(),
      missingBand: !sheetQuote.allowed,
      serviceName: 'Air Freight Cargo',
      destinationName: sheetQuote.destinationName || input.destination,
      mode,
      breakdown: {
        baseFreightNpr: sheetQuote.baseShippingCharge,
        fuelSurchargeNpr: 0,
        handlingFeeNpr: 0,
        specialHandlingSurchargeNpr: sheetQuote.liquidCharge + sheetQuote.medicineCharge + sheetQuote.meatCharge,
        pickupFeeNpr,
        subtotalNpr: totalNpr,
        minChargeApplied: false,
        totalNpr,
        rangeNpr: { min: totalNpr, max: totalNpr },
        boxCount: sheetQuote.boxCount,
        boxChargeNpr: sheetQuote.boxCharge,
      },
      appliedRules: [],
      guidanceCards,
      isPlaceholderWarning: handlingRules.some((r) => r.is_placeholder),
      currency: 'NPR',
      sheetQuote,
    };
  }

  // Fallback to legacy structure if no sheet rates provided
  const appliedRules: HandlingRule[] = [];
  const guidanceCards: GuidanceCard[] = [];
  let isBlocked = false;
  let blockedReason = '';

  const activeFlags: Array<'liquid' | 'meat' | 'medicine'> = [];
  if (input.flags?.liquid) activeFlags.push('liquid');
  if (input.flags?.meat) activeFlags.push('meat');
  if (input.flags?.medicine) activeFlags.push('medicine');

  for (const flag of activeFlags) {
    const rule = resolveHandlingRule(flag, handlingRules, input.destination, mode, input.type);
    if (rule) {
      appliedRules.push(rule);
      if (!rule.allowed) {
        isBlocked = true;
        blockedReason = rule.requirements_md;
      }
      guidanceCards.push({
        flag,
        allowed: rule.allowed,
        title: 'Special Handling Guidelines',
        requirementsMd: rule.requirements_md,
        isPlaceholder: rule.is_placeholder,
      });
    }
  }

  return {
    chargeableWeightKg: chargeableWeight,
    actualWeightKg: actualWeight,
    volumetricWeightKg: volumetricWeight,
    isVolumetric,
    allowed: !isBlocked,
    blockedReason: isBlocked ? blockedReason : undefined,
    missingBand: false,
    serviceName: 'Air Freight',
    destinationName: input.destination,
    mode,
    breakdown: {
      baseFreightNpr: 0,
      fuelSurchargeNpr: 0,
      handlingFeeNpr: 0,
      specialHandlingSurchargeNpr: 0,
      pickupFeeNpr: 0,
      subtotalNpr: 0,
      minChargeApplied: false,
      totalNpr: 0,
      rangeNpr: { min: 0, max: 0 },
    },
    appliedRules,
    guidanceCards,
    isPlaceholderWarning: false,
    currency: 'NPR',
  };
}
