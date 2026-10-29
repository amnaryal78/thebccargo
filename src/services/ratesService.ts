import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface NationalRate {
  id: string;
  serviceName: string;
  originRegion: string;
  destinationRegion: string;
  minWeightKg: number;
  maxWeightKg: number;
  baseRateNpr: number;
  perKgRateNpr: number;
  effectiveDate: string;
}

export interface InternationalRate {
  id: string;
  countryCode: string;
  countryName: string;
  serviceName: string;
  minWeightKg: number;
  maxWeightKg: number;
  rateUsd: number;
  effectiveDate: string;
}

export interface SheetRateItem {
  rate_group: string;
  display_name: string;
  supported_countries: string[];
  weight_tier: 'standard' | '10_plus' | '20_plus';
  weight_kg: number | null;
  price_npr: number;
  currency: string;
  active: boolean;
}

export interface SheetRatesPayload {
  rates: SheetRateItem[];
  rowCount: number;
  updatedAt: string;
  source: 'live' | 'cache_memory' | 'cache_database' | 'local_fallback';
  fallback?: boolean;
  error?: string;
}

export const INITIAL_NATIONAL_RATES: NationalRate[] = [
  { id: 'NR-01', serviceName: 'Express Parcel', originRegion: 'Kathmandu Valley', destinationRegion: 'Pokhara / Gandaki', minWeightKg: 0, maxWeightKg: 1, baseRateNpr: 250, perKgRateNpr: 60, effectiveDate: '2026-01-01' },
  { id: 'NR-02', serviceName: 'Express Parcel', originRegion: 'Kathmandu Valley', destinationRegion: 'Biratnagar / Koshi', minWeightKg: 0, maxWeightKg: 1, baseRateNpr: 280, perKgRateNpr: 70, effectiveDate: '2026-01-01' },
  { id: 'NR-03', serviceName: 'Express Parcel', originRegion: 'Kathmandu Valley', destinationRegion: 'Nepalgunj / Banke', minWeightKg: 0, maxWeightKg: 1, baseRateNpr: 320, perKgRateNpr: 80, effectiveDate: '2026-01-01' },
  { id: 'NR-04', serviceName: 'Overland Freight', originRegion: 'Hetauda Central HQ', destinationRegion: 'Birgunj ICD / Parsa', minWeightKg: 0, maxWeightKg: 100, baseRateNpr: 1500, perKgRateNpr: 12, effectiveDate: '2026-01-01' },
  { id: 'NR-05', serviceName: 'Overland Freight', originRegion: 'Hetauda Central HQ', destinationRegion: 'Chitwan / Narayangarh', minWeightKg: 0, maxWeightKg: 100, baseRateNpr: 1200, perKgRateNpr: 10, effectiveDate: '2026-01-01' },
  { id: 'NR-06', serviceName: 'Express Parcel', originRegion: 'Kathmandu Valley', destinationRegion: 'Butwal / Lumbini', minWeightKg: 0, maxWeightKg: 1, baseRateNpr: 290, perKgRateNpr: 65, effectiveDate: '2026-01-01' },
  { id: 'NR-07', serviceName: 'Overland Freight', originRegion: 'Hetauda Central HQ', destinationRegion: 'Kathmandu Valley Hub', minWeightKg: 0, maxWeightKg: 100, baseRateNpr: 1800, perKgRateNpr: 14, effectiveDate: '2026-01-01' },
];

export const INITIAL_INTERNATIONAL_RATES: InternationalRate[] = [
  { id: 'IR-01', countryCode: 'HKG', countryName: 'Hong Kong SAR', serviceName: 'Air Freight Express', minWeightKg: 0.5, maxWeightKg: 5, rateUsd: 45.0, effectiveDate: '2026-01-01' },
  { id: 'IR-02', countryCode: 'HKG', countryName: 'Hong Kong SAR', serviceName: 'Air Freight Express', minWeightKg: 5.1, maxWeightKg: 20, rateUsd: 120.0, effectiveDate: '2026-01-01' },
  { id: 'IR-03', countryCode: 'UAE', countryName: 'United Arab Emirates (Dubai)', serviceName: 'Air Express Courier', minWeightKg: 0.5, maxWeightKg: 5, rateUsd: 38.0, effectiveDate: '2026-01-01' },
  { id: 'IR-04', countryCode: 'USA', countryName: 'United States', serviceName: 'Priority Air Cargo', minWeightKg: 0.5, maxWeightKg: 5, rateUsd: 65.0, effectiveDate: '2026-01-01' },
  { id: 'IR-05', countryCode: 'GBR', countryName: 'United Kingdom (London)', serviceName: 'Priority Air Cargo', minWeightKg: 0.5, maxWeightKg: 5, rateUsd: 58.0, effectiveDate: '2026-01-01' },
  { id: 'IR-06', countryCode: 'IND', countryName: 'India (New Delhi / Mumbai)', serviceName: 'Cross-Border Overland', minWeightKg: 1, maxWeightKg: 50, rateUsd: 25.0, effectiveDate: '2026-01-01' },
  { id: 'IR-07', countryCode: 'AUS', countryName: 'Australia (Sydney)', serviceName: 'Air Express Courier', minWeightKg: 0.5, maxWeightKg: 5, rateUsd: 72.0, effectiveDate: '2026-01-01' },
  { id: 'IR-08', countryCode: 'DEU', countryName: 'Germany (Frankfurt)', serviceName: 'Priority Air Cargo', minWeightKg: 0.5, maxWeightKg: 5, rateUsd: 62.0, effectiveDate: '2026-01-01' },
  { id: 'IR-09', countryCode: 'JPN', countryName: 'Japan (Tokyo)', serviceName: 'Air Freight Express', minWeightKg: 0.5, maxWeightKg: 5, rateUsd: 54.0, effectiveDate: '2026-01-01' },
  { id: 'IR-10', countryCode: 'CAN', countryName: 'Canada (Toronto)', serviceName: 'Priority Air Cargo', minWeightKg: 0.5, maxWeightKg: 5, rateUsd: 68.0, effectiveDate: '2026-01-01' },
  { id: 'IR-11', countryCode: 'QAT', countryName: 'Qatar (Doha)', serviceName: 'Air Express Courier', minWeightKg: 0.5, maxWeightKg: 5, rateUsd: 40.0, effectiveDate: '2026-01-01' },
];

/**
 * Volumetric (Dimensional) Weight calculation
 * Air Courier standard divisor = 5000 cm³/kg
 * Overland standard divisor = 6000 cm³/kg
 */
export function calculateVolumetricWeight(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  mode: 'air' | 'overland' = 'air'
): number {
  if (!lengthCm || !widthCm || !heightCm) return 0;
  const divisor = mode === 'overland' ? 6000 : 5000;
  const volWeight = (lengthCm * widthCm * heightCm) / divisor;
  return parseFloat(volWeight.toFixed(2));
}

/**
 * Get chargeable weight as higher of actual gross weight and volumetric weight
 */
export function getChargeableWeight(actualKg: number, volumetricKg: number): number {
  return Math.max(actualKg || 0, volumetricKg || 0);
}

// ============================================================================
// NATIONAL RATES DATA ACCESS
// ============================================================================

export async function fetchNationalRates(): Promise<NationalRate[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('national_rates')
        .select('*')
        .order('origin_region', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          serviceName: r.service_name,
          originRegion: r.origin_region,
          destinationRegion: r.destination_region,
          minWeightKg: Number(r.min_weight_kg),
          maxWeightKg: Number(r.max_weight_kg),
          baseRateNpr: Number(r.base_rate_npr),
          perKgRateNpr: Number(r.per_kg_rate_npr),
          effectiveDate: r.effective_date
        }));
      }
    } catch (e) {
      console.warn('Supabase national rates fetch failed, falling back:', e);
    }
  }

  return getNationalRates();
}

export const getNationalRates = (): NationalRate[] => {
  try {
    const saved = localStorage.getItem('bc_cargo_national_rates');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Failed to parse national rates:', e);
  }
  return INITIAL_NATIONAL_RATES;
};

export async function saveNationalRate(rate: NationalRate): Promise<NationalRate[]> {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('national_rates').upsert({
        id: rate.id.includes('-') && !rate.id.startsWith('NR-') ? rate.id : undefined,
        service_name: rate.serviceName,
        origin_region: rate.originRegion,
        destination_region: rate.destinationRegion,
        min_weight_kg: rate.minWeightKg,
        max_weight_kg: rate.maxWeightKg,
        base_rate_npr: rate.baseRateNpr,
        per_kg_rate_npr: rate.perKgRateNpr,
        effective_date: rate.effectiveDate
      });
    } catch (e) {
      console.warn('Supabase national rate save failed:', e);
    }
  }

  const current = getNationalRates();
  const index = current.findIndex((r) => r.id === rate.id);
  let updated: NationalRate[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = rate;
  } else {
    updated = [rate, ...current];
  }
  localStorage.setItem('bc_cargo_national_rates', JSON.stringify(updated));
  return updated;
}

export async function deleteNationalRate(id: string): Promise<NationalRate[]> {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('national_rates').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete national rate failed:', e);
    }
  }

  const current = getNationalRates().filter((r) => r.id !== id);
  localStorage.setItem('bc_cargo_national_rates', JSON.stringify(current));
  return current;
}

// ============================================================================
// INTERNATIONAL RATES DATA ACCESS
// ============================================================================

export async function fetchInternationalRates(): Promise<InternationalRate[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('international_rates')
        .select('*')
        .order('country_name', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          countryCode: r.country_code,
          countryName: r.country_name,
          serviceName: r.service_name,
          minWeightKg: Number(r.min_weight_kg),
          maxWeightKg: Number(r.max_weight_kg),
          rateUsd: Number(r.rate_usd),
          effectiveDate: r.effective_date
        }));
      }
    } catch (e) {
      console.warn('Supabase international rates fetch failed, falling back:', e);
    }
  }

  return getInternationalRates();
}

export async function fetchSheetRates(): Promise<SheetRatesPayload> {
  if (isSupabaseConfigured) {
    // 1. Invoke Supabase Edge Function 'rates'
    try {
      const { data, error } = await supabase.functions.invoke('rates', { signal: AbortSignal.timeout(10000) }); // a hung call falls through instead of loading forever
      if (!error && data && data.rates && data.rates.length > 0) {
        try {
          localStorage.setItem('bc_cargo_sheet_rates_cache', JSON.stringify(data));
        } catch {
          // Ignore localStorage errors
        }
        return data as SheetRatesPayload;
      }
    } catch (e) {
      console.warn('Edge function invoke "rates" error, trying database fallback:', e);
    }

    // 2. Fallback to Supabase sheet_rates_cache table
    try {
      const { data: dbData, error: dbError } = await supabase
        .from('sheet_rates_cache')
        .select('*')
        .eq('id', 'latest')
        .abortSignal(AbortSignal.timeout(10000))
        .maybeSingle();

      if (!dbError && dbData && dbData.rates && dbData.rates.length > 0) {
        const payload: SheetRatesPayload = {
          rates: dbData.rates,
          rowCount: dbData.row_count,
          updatedAt: dbData.updated_at,
          source: 'cache_database',
          fallback: true,
        };
        try {
          localStorage.setItem('bc_cargo_sheet_rates_cache', JSON.stringify(payload));
        } catch {
          // Ignore localStorage errors
        }
        return payload;
      }
    } catch (dbErr) {
      console.warn('Supabase sheet_rates_cache query error:', dbErr);
    }
  }

  // 3. Fallback to localStorage cache
  try {
    const saved = localStorage.getItem('bc_cargo_sheet_rates_cache');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.rates?.length > 0) {
        return { ...parsed, source: 'local_fallback', fallback: true };
      }
    }
  } catch {
    // Ignore localStorage errors
  }

  return {
    rates: [],
    rowCount: 0,
    updatedAt: '',
    source: 'local_fallback',
    error: 'Price not available now. Please chat with us.',
  };
}

export const getInternationalRates = (): InternationalRate[] => {
  try {
    const saved = localStorage.getItem('bc_cargo_international_rates');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Failed to parse international rates:', e);
  }
  return INITIAL_INTERNATIONAL_RATES;
};

export async function saveInternationalRate(rate: InternationalRate): Promise<InternationalRate[]> {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('international_rates').upsert({
        id: rate.id.includes('-') && !rate.id.startsWith('IR-') ? rate.id : undefined,
        country_code: rate.countryCode,
        country_name: rate.countryName,
        service_name: rate.serviceName,
        min_weight_kg: rate.minWeightKg,
        max_weight_kg: rate.maxWeightKg,
        rate_usd: rate.rateUsd,
        effective_date: rate.effectiveDate
      });
    } catch (e) {
      console.warn('Supabase international rate save failed:', e);
    }
  }

  const current = getInternationalRates();
  const index = current.findIndex((r) => r.id === rate.id);
  let updated: InternationalRate[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = rate;
  } else {
    updated = [rate, ...current];
  }
  localStorage.setItem('bc_cargo_international_rates', JSON.stringify(updated));
  return updated;
}

export async function deleteInternationalRate(id: string): Promise<InternationalRate[]> {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('international_rates').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete international rate failed:', e);
    }
  }

  const current = getInternationalRates().filter((r) => r.id !== id);
  localStorage.setItem('bc_cargo_international_rates', JSON.stringify(current));
  return current;
}
