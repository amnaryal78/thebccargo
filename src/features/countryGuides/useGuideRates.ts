import { useEffect, useState } from 'react';
import { fetchSheetRates, type SheetRateItem, type SheetRatesPayload } from '../../services/ratesService';
import { findRateGroupForCountry } from '../estimator/engine';

/**
 * Live prices for the guides. One fetch per page load, shared by the hero, the rate cards,
 * the calculator and the related-guide cards, so a guide page never queries rates twice.
 */

let pending: Promise<SheetRatesPayload> | null = null;
const loadOnce = () => (pending ??= fetchSheetRates().catch(() => ({ rates: [], rowCount: 0, updatedAt: '', source: 'local_fallback' as const })));

export interface GuideRates {
  status: 'loading' | 'ready' | 'unavailable';
  rates: SheetRateItem[];
  updatedAt: string;
}

export function useGuideRates(): GuideRates {
  const [state, setState] = useState<GuideRates>({ status: 'loading', rates: [], updatedAt: '' });
  useEffect(() => {
    let alive = true;
    void loadOnce().then((p) => {
      if (!alive) return;
      setState(p.rates.length ? { status: 'ready', rates: p.rates, updatedAt: p.updatedAt } : { status: 'unavailable', rates: [], updatedAt: '' });
    });
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

export interface GroupPrices {
  rateGroup: string;
  /** Flat prices for whole parcels under 10 kg, sorted by weight */
  flat: { kg: number; price: number }[];
  /** Per-kg prices for heavier boxes, when the sheet has them */
  per10?: number;
  per20?: number;
  /** Lowest flat price, for "from Rs X" */
  from?: number;
}

/** The same group lookup the estimator uses, so a guide shows exactly what the Rates page would. */
export function groupPrices(rates: SheetRateItem[], country: string): GroupPrices | null {
  const match = findRateGroupForCountry(country, rates);
  if (!match) return null;
  const rows = rates.filter((r) => r.active && r.rate_group.toLowerCase() === match.rateGroup.toLowerCase());
  const flat = rows
    .filter((r) => r.weight_tier === 'standard' && r.weight_kg != null)
    .map((r) => ({ kg: Number(r.weight_kg), price: Number(r.price_npr) }))
    .sort((a, b) => a.kg - b.kg);
  return {
    rateGroup: match.rateGroup,
    flat,
    per10: rows.find((r) => r.weight_tier === '10_plus')?.price_npr,
    per20: rows.find((r) => r.weight_tier === '20_plus')?.price_npr,
    from: flat[0]?.price,
  };
}

export const npr = (n: number) => `Rs ${Math.round(n).toLocaleString('en-IN')}`;

/** Per-kg price for big parcels (20 kg and above, else 10 kg and above), straight from the sheet. */
export function bulkRate(rates: SheetRateItem[], country: string): { perKg: number; minKg: number } | null {
  const g = groupPrices(rates, country);
  if (!g) return null;
  if (g.per20 != null) return { perKg: g.per20, minKg: 20 };
  if (g.per10 != null) return { perKg: g.per10, minKg: 10 };
  return null;
}
