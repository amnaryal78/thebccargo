import { RouteLocation } from './route-data';
import { DEST_BY_ISO2, SHOWN_COUNTRIES, destinationForCountry } from './country-destination';

/** One full loop of the animation in route-journey.css. Keep in sync with its timeline. */
export const JOURNEY_CYCLE_MS = 7000;

export interface Stop {
  iso2: string;
  label: string;
  dest: RouteLocation;
}

/** Every country listed on the old globe, in the same order, resolved to its route entry. */
export const buildStops = (): Stop[] =>
  SHOWN_COUNTRIES.map((c) => {
    const known = DEST_BY_ISO2[c.iso2];
    const dest = destinationForCountry(c.iso2, c.label, known?.lat ?? 0, known?.lng ?? 0);
    return { iso2: c.iso2, label: c.label, dest };
  });

/** "3–5 business days" -> "3–5 days" for the compact chip. */
export const shortTransit = (t: string): string => t.replace(/\s*business\s*/i, ' ').replace(/\s+/g, ' ').trim();
