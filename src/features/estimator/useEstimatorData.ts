import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  fetchInternationalRates,
  fetchSheetRates,
  InternationalRate,
  INITIAL_INTERNATIONAL_RATES,
  SheetRateItem,
} from '../../services/ratesService';
import { HandlingRule, RateSettings } from './engine';
import { DEFAULT_HANDLING_RULES, INITIAL_RATE_SETTINGS } from './constants';

const CACHE_KEY = 'bc_estimator_cache_v3';

interface EstimatorCachePayload {
  sheetRates: SheetRateItem[];
  internationalRates: InternationalRate[];
  handlingRules: HandlingRule[];
  rateSettings: RateSettings;
  cachedAt: number;
  rateUpdatedAt?: string;
  rateSource?: string;
}

export function useEstimatorData() {
  const [sheetRates, setSheetRates] = useState<SheetRateItem[]>(() => {
    if (typeof localStorage === 'undefined') return [];
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: EstimatorCachePayload = JSON.parse(cached);
        if (parsed.sheetRates?.length) return parsed.sheetRates;
      }
    } catch (e) {
      console.warn('Failed to load sheet rates from cache:', e);
    }
    return [];
  });

  const [internationalRates, setInternationalRates] = useState<InternationalRate[]>(() => {
    if (typeof localStorage === 'undefined') return INITIAL_INTERNATIONAL_RATES;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: EstimatorCachePayload = JSON.parse(cached);
        if (parsed.internationalRates?.length) return parsed.internationalRates;
      }
    } catch (e) {
      console.warn('Failed to load international rates from cache:', e);
    }
    return INITIAL_INTERNATIONAL_RATES;
  });

  const [handlingRules, setHandlingRules] = useState<HandlingRule[]>(() => {
    if (typeof localStorage === 'undefined') return DEFAULT_HANDLING_RULES;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: EstimatorCachePayload = JSON.parse(cached);
        if (parsed.handlingRules?.length) return parsed.handlingRules;
      }
    } catch (e) {
      console.warn('Failed to load handling rules from cache:', e);
    }
    return DEFAULT_HANDLING_RULES;
  });

  const [rateSettings, setRateSettings] = useState<RateSettings>(() => {
    if (typeof localStorage === 'undefined') return INITIAL_RATE_SETTINGS;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: EstimatorCachePayload = JSON.parse(cached);
        if (parsed.rateSettings) return parsed.rateSettings;
      }
    } catch (e) {
      console.warn('Failed to load rate settings from cache:', e);
    }
    return INITIAL_RATE_SETTINGS;
  });

  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [rateSource, setRateSource] = useState<string>('unknown');
  const [rateError, setRateError] = useState<string | null>(null);

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const revalidate = useCallback(async () => {
    if (!navigator.onLine) {
      setIsOffline(true);
      return;
    }

    setLoading(true);
    try {
      // Start the slower lookups together so they do not queue behind the sheet rates.
      const intlPromise = fetchInternationalRates();
      intlPromise.catch(() => {}); // still surfaces at the await below

      // 1. Fetch live Google Sheet rates via Supabase Edge Function
      const sheetPayload = await fetchSheetRates();
      if (sheetPayload.rates && sheetPayload.rates.length > 0) {
        setSheetRates(sheetPayload.rates);
        setRateSource(sheetPayload.source);
        setRateError(null);
        if (sheetPayload.updatedAt) {
          setLastUpdated(new Date(sheetPayload.updatedAt));
        }
      } else if (sheetPayload.error) {
        setRateError(sheetPayload.error);
      }

      // 2. Fetch legacy international rates for components needing them
      const intlData = await intlPromise;

      let rulesData = DEFAULT_HANDLING_RULES;
      let settingsData = INITIAL_RATE_SETTINGS;

      // 3. Fetch handling_rules and rate_settings from Supabase if configured
      if (isSupabaseConfigured) {
        try {
          const [{ data: hrRows, error: hrError }, { data: stRows, error: stError }] = await Promise.all([
            supabase.from('handling_rules').select('*').eq('active', true),
            supabase.from('rate_settings').select('*'),
          ]);

          if (!hrError && hrRows && hrRows.length > 0) {
            rulesData = hrRows.map((r: any) => ({
              id: r.id,
              flag: r.flag,
              country_code: r.country_code,
              mode: r.mode,
              allowed: r.allowed,
              surcharge_type: r.surcharge_type,
              surcharge_value: Number(r.surcharge_value || 0),
              requirements_md: r.requirements_md,
              is_placeholder: Boolean(r.is_placeholder),
              active: Boolean(r.active),
            }));
          }

          if (!stError && stRows && stRows.length > 0) {
            const settingsMap: Record<string, any> = {};
            for (const row of stRows) {
              settingsMap[row.key] = row.value?.value ?? row.value;
            }

            settingsData = {
              fuelSurchargePercent: Number(settingsMap.fuel_surcharge_percent ?? INITIAL_RATE_SETTINGS.fuelSurchargePercent),
              handlingFeeNpr: Number(settingsMap.handling_fee_npr ?? INITIAL_RATE_SETTINGS.handlingFeeNpr),
              usdToNprRate: Number(settingsMap.usd_to_npr_rate ?? INITIAL_RATE_SETTINGS.usdToNprRate),
              minChargeNpr: Number(settingsMap.min_charge_npr ?? INITIAL_RATE_SETTINGS.minChargeNpr),
            };
          }
        } catch (dbErr) {
          console.warn('Supabase handling rules/settings query failed, preserving existing cache:', dbErr);
        }
      }

      setInternationalRates(intlData);
      setHandlingRules(rulesData);
      setRateSettings(settingsData);
      if (!sheetPayload.updatedAt) {
        setLastUpdated(new Date());
      }

      // Save to localStorage cache
      const payload: EstimatorCachePayload = {
        sheetRates: sheetPayload.rates || [],
        internationalRates: intlData,
        handlingRules: rulesData,
        rateSettings: settingsData,
        cachedAt: Date.now(),
        rateUpdatedAt: sheetPayload.updatedAt,
        rateSource: sheetPayload.source,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('Revalidation failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    revalidate();
  }, [revalidate]);

  return {
    sheetRates,
    internationalRates,
    handlingRules,
    rateSettings,
    loading,
    isOffline,
    lastUpdated,
    rateSource,
    rateError,
    refetch: revalidate,
  };
}
