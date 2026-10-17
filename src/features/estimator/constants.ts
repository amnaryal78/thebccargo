import { HandlingRule, RateSettings } from './engine';

export const DEFAULT_HANDLING_RULES: HandlingRule[] = [
  {
    id: 'hr-seed-liquid',
    flag: 'liquid',
    country_code: null,
    mode: null,
    allowed: true,
    surcharge_type: null,
    surcharge_value: 0,
    requirements_md: 'Leak-proof sealed packaging required. Containers must be cushioned with absorbent material and declare contents.',
    is_placeholder: false,
    active: true,
  },
  {
    id: 'hr-seed-meat',
    flag: 'meat',
    country_code: null,
    mode: null,
    allowed: true,
    surcharge_type: null,
    surcharge_value: 0,
    requirements_md: 'Factory-sealed, non-perishable dried or processed items only. Specific corridor restrictions apply.',
    is_placeholder: false,
    active: true,
  },
  {
    id: 'hr-seed-meat-usa',
    flag: 'meat',
    country_code: 'USA',
    mode: 'air',
    allowed: false,
    surcharge_type: null,
    surcharge_value: 0,
    requirements_md: 'Perishable animal meat and food products of animal origin are prohibited for air parcel export to the United States under agricultural import restrictions.',
    is_placeholder: false,
    active: true,
  },
  {
    id: 'hr-seed-medicine',
    flag: 'medicine',
    country_code: null,
    mode: null,
    allowed: true,
    surcharge_type: null,
    surcharge_value: 0,
    requirements_md: 'Valid registered doctor prescription and original pharmacy tax invoice required. Narcotics and controlled substances are strictly prohibited.',
    is_placeholder: false,
    active: true,
  },
  {
    id: 'hr-seed-medicine-road',
    flag: 'medicine',
    country_code: null,
    mode: 'overland',
    allowed: true,
    surcharge_type: null,
    surcharge_value: 0,
    requirements_md: 'Cross-border road transit of scheduled pharmaceuticals requires medical prescription copy, certified manufacturer invoice, and customs export permit at border dry port.',
    is_placeholder: false,
    active: true,
  },
];

export const INITIAL_RATE_SETTINGS: RateSettings = {
  fuelSurchargePercent: 0,
  handlingFeeNpr: 0,
  usdToNprRate: 0,
  minChargeNpr: 0,
};

/**
 * Returns country flag emoji from 2 or 3 letter ISO code
 */
export function getCountryFlag(countryCode: string): string {
  const codeMapping: Record<string, string> = {
    USA: 'US',
    GBR: 'GB',
    HKG: 'HK',
    UAE: 'AE',
    IND: 'IN',
    AUS: 'AU',
    DEU: 'DE',
    JPN: 'JP',
    CAN: 'CA',
    QAT: 'QA',
    NPL: 'NP',
    KOR: 'KR',
    CHN: 'CN',
    SGP: 'SG',
    MYS: 'MY',
    THA: 'TH',
  };

  const alpha2 = (codeMapping[countryCode.toUpperCase()] || countryCode.slice(0, 2)).toUpperCase();
  if (alpha2.length !== 2) return '🌐';
  const codePoints = alpha2
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
