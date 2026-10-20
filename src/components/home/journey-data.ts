import { RouteLocation } from './route-data';
import { DEST_BY_ISO2, SHOWN_COUNTRIES, destinationForCountry } from './country-destination';

/** One full loop of the animation in route-journey.css (plus the 0.45s exit fade done in JS). */
export const JOURNEY_CYCLE_MS = 9000;
export const JOURNEY_EXIT_MS = 450;

/** The countries customers ask about most: always played first, in this order. */
export const MAJOR_ORDER = ['KR', 'MY', 'GB', 'JP', 'AU', 'CA', 'AE'] as const;

export interface Stop {
  iso2: string;
  label: string;
  dest: RouteLocation;
}

/** Major countries first (MAJOR_ORDER), then the rest of the listed countries in their usual order. */
export const buildStops = (): Stop[] => {
  const all = SHOWN_COUNTRIES.map((c) => {
    const known = DEST_BY_ISO2[c.iso2];
    const dest = destinationForCountry(c.iso2, c.label, known?.lat ?? 0, known?.lng ?? 0);
    return { iso2: c.iso2, label: c.label, dest };
  });
  const rank = (iso2: string) => {
    const i = (MAJOR_ORDER as readonly string[]).indexOf(iso2);
    return i === -1 ? MAJOR_ORDER.length : i;
  };
  // Array.prototype.sort is stable, so the non-major countries keep their original order.
  return [...all].sort((a, b) => rank(a.iso2) - rank(b.iso2));
};

/** "3–5 business days" -> "3–5 days" for the compact chip. */
export const shortTransit = (t: string): string => t.replace(/\s*business\s*/i, ' ').replace(/\s+/g, ' ').trim();

/** Number of days the counter counts up to: the last number in the text ("3–5 days" -> 5, "10 days" -> 10). */
export const transitDays = (t: string): number => {
  const nums = t.match(/\d+/g);
  return nums ? Math.max(1, parseInt(nums[nums.length - 1], 10)) : 5;
};

/** Timeline of one loop in seconds. Must match the delays in route-journey.css. */
export const TIMELINE = { pickup: 0.2, load: 1.6, fly: 2.0, land: 5.4, delivered: 5.9 } as const;

export type JourneyStage = 'pickup' | 'flight' | 'customs' | 'delivered';

/** Which stage and which day the clock shows after `elapsedMs` of the loop. */
export const journeyClock = (elapsedMs: number, totalDays: number): { stage: JourneyStage; day: number } => {
  const s = elapsedMs / 1000;
  if (s < TIMELINE.fly) return { stage: 'pickup', day: 1 };
  if (s < TIMELINE.land) {
    const p = (s - TIMELINE.fly) / (TIMELINE.land - TIMELINE.fly);
    return { stage: 'flight', day: Math.min(totalDays, 1 + Math.floor(p * (totalDays - 1))) };
  }
  if (s < TIMELINE.delivered) return { stage: 'customs', day: totalDays };
  return { stage: 'delivered', day: totalDays };
};
