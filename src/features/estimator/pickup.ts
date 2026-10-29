export type HandoverMethod = 'office' | 'home';

/** Charge for collecting the parcel from the sender's home, unless the free-pickup rule below applies. */
export const HOME_PICKUP_FEE_NPR = 200;

/** Home pickup is free only in these places, and only for parcels heavier than FREE_PICKUP_OVER_KG (owner rule, 2026-10-23). */
export const FREE_PICKUP_AREAS = ['Hetauda', 'Pathlaiya', 'Jitpur', 'Simara'] as const;
export const FREE_PICKUP_OVER_KG = 20;

/** Pickup charge in NPR for a given area and total weight (0 = free). */
export function pickupFeeFor(area: string, weightKg: number): number {
  const free = (FREE_PICKUP_AREAS as readonly string[]).includes(area) && weightKg > FREE_PICKUP_OVER_KG;
  return free ? 0 : HOME_PICKUP_FEE_NPR;
}

/** "Hetauda, Pathlaiya, Jitpur and Simara" */
export const FREE_PICKUP_AREAS_TEXT = `${FREE_PICKUP_AREAS.slice(0, -1).join(', ')} and ${FREE_PICKUP_AREAS[FREE_PICKUP_AREAS.length - 1]}`;
const FREE_PICKUP_AREAS_NE = 'हेटौंडा, पथलैया, जितपुर र सिमरा';

/** One sentence for guides and forms; always matches the numbers above. */
export const PICKUP_POLICY_EN = `Home pickup is free only in ${FREE_PICKUP_AREAS_TEXT} for parcels above ${FREE_PICKUP_OVER_KG} kg. Otherwise it is Rs ${HOME_PICKUP_FEE_NPR}.`;
export const PICKUP_POLICY_NE = `घरबाटै लिन आउने सेवा ${FREE_PICKUP_OVER_KG} केजीभन्दा बढी भएका ${FREE_PICKUP_AREAS_NE}का पार्सलमा मात्र निःशुल्क हुन्छ। अरू बेला रु ${HOME_PICKUP_FEE_NPR} लाग्छ।`;

/** Home pickup is only offered around these places (free areas first; the rest always cost HOME_PICKUP_FEE_NPR). */
export const PICKUP_AREAS = [...FREE_PICKUP_AREAS, 'Birgunj', 'Chitwan', 'Kathmandu'] as const;

export const OTHER_AREA = 'other';
