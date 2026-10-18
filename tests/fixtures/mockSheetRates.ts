import { SheetRateItem } from '../../src/services/ratesService';

export const MOCK_SHEET_RATES: SheetRateItem[] = [
  // Korea
  { rate_group: 'Korea', display_name: 'South Korea', supported_countries: ['Korea', 'Republic of Korea'], weight_tier: 'standard', weight_kg: 1, price_npr: 2500, currency: 'NPR', active: true },
  { rate_group: 'Korea', display_name: 'South Korea', supported_countries: ['Korea', 'Republic of Korea'], weight_tier: 'standard', weight_kg: 1.5, price_npr: 2850, currency: 'NPR', active: true },
  { rate_group: 'Korea', display_name: 'South Korea', supported_countries: ['Korea', 'Republic of Korea'], weight_tier: 'standard', weight_kg: 2, price_npr: 2850, currency: 'NPR', active: true },
  { rate_group: 'Korea', display_name: 'South Korea', supported_countries: ['Korea', 'Republic of Korea'], weight_tier: 'standard', weight_kg: 2.5, price_npr: 3550, currency: 'NPR', active: true },
  { rate_group: 'Korea', display_name: 'South Korea', supported_countries: ['Korea', 'Republic of Korea'], weight_tier: 'standard', weight_kg: 3, price_npr: 3550, currency: 'NPR', active: true },
  { rate_group: 'Korea', display_name: 'South Korea', supported_countries: ['Korea', 'Republic of Korea'], weight_tier: 'standard', weight_kg: 3.5, price_npr: 4250, currency: 'NPR', active: true },
  { rate_group: 'Korea', display_name: 'South Korea', supported_countries: ['Korea', 'Republic of Korea'], weight_tier: 'standard', weight_kg: 4, price_npr: 4700, currency: 'NPR', active: true },
  { rate_group: 'Korea', display_name: 'South Korea', supported_countries: ['Korea', 'Republic of Korea'], weight_tier: 'standard', weight_kg: 5, price_npr: 5300, currency: 'NPR', active: true },
  { rate_group: 'Korea', display_name: 'South Korea', supported_countries: ['Korea', 'Republic of Korea'], weight_tier: 'standard', weight_kg: 6, price_npr: 6350, currency: 'NPR', active: true },
  { rate_group: 'Korea', display_name: 'South Korea', supported_countries: ['Korea', 'Republic of Korea'], weight_tier: 'standard', weight_kg: 7, price_npr: 6700, currency: 'NPR', active: true },
  { rate_group: 'Korea', display_name: 'South Korea', supported_countries: ['Korea', 'Republic of Korea'], weight_tier: 'standard', weight_kg: 8, price_npr: 7750, currency: 'NPR', active: true },
  { rate_group: 'Korea', display_name: 'South Korea', supported_countries: ['Korea', 'Republic of Korea'], weight_tier: 'standard', weight_kg: 9, price_npr: 8100, currency: 'NPR', active: true },
  { rate_group: 'Korea', display_name: 'South Korea', supported_countries: ['Korea', 'Republic of Korea'], weight_tier: 'standard', weight_kg: 9.5, price_npr: 8450, currency: 'NPR', active: true },
  { rate_group: 'Korea', display_name: 'South Korea', supported_countries: ['Korea', 'Republic of Korea'], weight_tier: '10_plus', weight_kg: null, price_npr: 800, currency: 'NPR', active: true },
  { rate_group: 'Korea', display_name: 'South Korea', supported_countries: ['Korea', 'Republic of Korea'], weight_tier: '20_plus', weight_kg: null, price_npr: 650, currency: 'NPR', active: true },

  // UK
  { rate_group: 'UK', display_name: 'United Kingdom', supported_countries: ['UK', 'United Kingdom', 'Britain', 'Great Britain'], weight_tier: 'standard', weight_kg: 1, price_npr: 3200, currency: 'NPR', active: true },
  { rate_group: 'UK', display_name: 'United Kingdom', supported_countries: ['UK', 'United Kingdom', 'Britain', 'Great Britain'], weight_tier: 'standard', weight_kg: 2, price_npr: 4500, currency: 'NPR', active: true },
  { rate_group: 'UK', display_name: 'United Kingdom', supported_countries: ['UK', 'United Kingdom', 'Britain', 'Great Britain'], weight_tier: 'standard', weight_kg: 3, price_npr: 5300, currency: 'NPR', active: true },
  { rate_group: 'UK', display_name: 'United Kingdom', supported_countries: ['UK', 'United Kingdom', 'Britain', 'Great Britain'], weight_tier: 'standard', weight_kg: 5, price_npr: 7300, currency: 'NPR', active: true },
  { rate_group: 'UK', display_name: 'United Kingdom', supported_countries: ['UK', 'United Kingdom', 'Britain', 'Great Britain'], weight_tier: 'standard', weight_kg: 9.5, price_npr: 12100, currency: 'NPR', active: true },
  { rate_group: 'UK', display_name: 'United Kingdom', supported_countries: ['UK', 'United Kingdom', 'Britain', 'Great Britain'], weight_tier: '10_plus', weight_kg: null, price_npr: 950, currency: 'NPR', active: true },
  { rate_group: 'UK', display_name: 'United Kingdom', supported_countries: ['UK', 'United Kingdom', 'Britain', 'Great Britain'], weight_tier: '20_plus', weight_kg: null, price_npr: 700, currency: 'NPR', active: true },

  // Hong Kong
  { rate_group: 'Hong Kong', display_name: 'Hong Kong', supported_countries: ['Hong Kong', 'HKG'], weight_tier: 'standard', weight_kg: 1, price_npr: 3000, currency: 'NPR', active: true },
  { rate_group: 'Hong Kong', display_name: 'Hong Kong', supported_countries: ['Hong Kong', 'HKG'], weight_tier: 'standard', weight_kg: 2.5, price_npr: 1900, currency: 'NPR', active: true },
  { rate_group: 'Hong Kong', display_name: 'Hong Kong', supported_countries: ['Hong Kong', 'HKG'], weight_tier: 'standard', weight_kg: 5, price_npr: 5100, currency: 'NPR', active: true },
  { rate_group: 'Hong Kong', display_name: 'Hong Kong', supported_countries: ['Hong Kong', 'HKG'], weight_tier: 'standard', weight_kg: 6, price_npr: 3500, currency: 'NPR', active: true },
  { rate_group: 'Hong Kong', display_name: 'Hong Kong', supported_countries: ['Hong Kong', 'HKG'], weight_tier: '10_plus', weight_kg: null, price_npr: 550, currency: 'NPR', active: true },
  { rate_group: 'Hong Kong', display_name: 'Hong Kong', supported_countries: ['Hong Kong', 'HKG'], weight_tier: '20_plus', weight_kg: null, price_npr: 700, currency: 'NPR', active: true },

  // USA
  { rate_group: 'USA', display_name: 'United States', supported_countries: ['USA', 'US', 'United States', 'United States of America'], weight_tier: 'standard', weight_kg: 1, price_npr: 5500, currency: 'NPR', active: true },
  { rate_group: 'USA', display_name: 'United States', supported_countries: ['USA', 'US', 'United States', 'United States of America'], weight_tier: 'standard', weight_kg: 5, price_npr: 10800, currency: 'NPR', active: true },
  { rate_group: 'USA', display_name: 'United States', supported_countries: ['USA', 'US', 'United States', 'United States of America'], weight_tier: '10_plus', weight_kg: null, price_npr: 1500, currency: 'NPR', active: true },
  { rate_group: 'USA', display_name: 'United States', supported_countries: ['USA', 'US', 'United States', 'United States of America'], weight_tier: '20_plus', weight_kg: null, price_npr: 1300, currency: 'NPR', active: true },
];
