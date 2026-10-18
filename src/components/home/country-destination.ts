import { COUNTRY_BY_ISO2, deliveryEstimate } from '../../data/countries';
import { DESTINATIONS, RouteLocation } from './route-data';

/** Turns a flag emoji (🇰🇷) into its ISO2 code (KR). */
const isoFromFlagEmoji = (flag?: string): string => {
  if (!flag) return '';
  return Array.from(flag)
    .map((ch) => String.fromCharCode((ch.codePointAt(0) ?? 0) - 0x1f1e6 + 65))
    .join('');
};

export const DEST_BY_ISO2: Record<string, RouteLocation> = Object.fromEntries(
  DESTINATIONS.map((d) => [isoFromFlagEmoji(d.flag), d])
);

/**
 * Returns the route entry for any country. Countries with a tariff row use it;
 * all others get a regional delivery estimate so every flag opens a useful panel.
 */
export const destinationForCountry = (
  iso2: string,
  fallbackName: string,
  lat: number,
  lng: number
): RouteLocation => {
  const known = DEST_BY_ISO2[iso2];
  const info = COUNTRY_BY_ISO2[iso2];
  const name = info?.name ?? fallbackName;
  if (known) return { ...known, country: name, name };

  const est = info ? deliveryEstimate(info.region) : { days: '5–8 days', mode: 'Air' };
  return {
    id: `country-${iso2}`,
    name,
    country: name,
    code: iso2,
    lat,
    lng,
    mode: 'air',
    serviceName: 'Air Express',
    transitTime: est.days,
    fromPrice: 'Live Tariff',
    currency: 'NPR',
    active: true,
  };
};

/** The only countries shown on the globe (flag only), in chip order. */
export const SHOWN_COUNTRIES: { iso2: string; label: string }[] = [
  { iso2: 'KR', label: 'Korea' },
  { iso2: 'AU', label: 'Australia' },
  { iso2: 'AT', label: 'Austria' },
  { iso2: 'JP', label: 'Japan' },
  { iso2: 'MY', label: 'Malaysia' },
  { iso2: 'NZ', label: 'New Zealand' },
  { iso2: 'AE', label: 'UAE' },
  { iso2: 'SA', label: 'Saudi Arabia' },
  { iso2: 'KW', label: 'Kuwait' },
  { iso2: 'QA', label: 'Qatar' },
  { iso2: 'CA', label: 'Canada' },
  { iso2: 'US', label: 'USA' },
  { iso2: 'GB', label: 'UK' },
  { iso2: 'DE', label: 'Germany' },
  { iso2: 'BH', label: 'Bahrain' },
  { iso2: 'HK', label: 'Hong Kong' },
  { iso2: 'CY', label: 'Cyprus' },
  { iso2: 'MT', label: 'Malta' },
  { iso2: 'RO', label: 'Romania' },
];

export const SHOWN_ISO2 = new Set(SHOWN_COUNTRIES.map((c) => c.iso2));
