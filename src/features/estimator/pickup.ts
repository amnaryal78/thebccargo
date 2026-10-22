export type HandoverMethod = 'office' | 'home';

/** Charge for collecting the parcel from the sender's home, unless the free-pickup rule below applies. */
export const HOME_PICKUP_FEE_NPR = 200;

/** Home pickup is free only in these places, and only for parcels heavier than FREE_PICKUP_OVER_KG. */
export const FREE_PICKUP_AREAS = ['Hetauda', 'Birgunj'] as const;
export const FREE_PICKUP_OVER_KG = 20;

/** Pickup charge in NPR for a given area and total weight (0 = free). */
export function pickupFeeFor(area: string, weightKg: number): number {
  const free = (FREE_PICKUP_AREAS as readonly string[]).includes(area) && weightKg > FREE_PICKUP_OVER_KG;
  return free ? 0 : HOME_PICKUP_FEE_NPR;
}

/** One sentence for guides and forms; always matches the numbers above. */
export const PICKUP_POLICY_EN = `Home pickup is free only in ${FREE_PICKUP_AREAS.join(' and ')} for parcels above ${FREE_PICKUP_OVER_KG} kg. Otherwise it is Rs ${HOME_PICKUP_FEE_NPR}.`;
export const PICKUP_POLICY_NE = `घरबाटै लिन आउने सेवा ${FREE_PICKUP_OVER_KG} केजीभन्दा बढी भएका हेटौंडा र वीरगञ्जका पार्सलमा मात्र निःशुल्क हुन्छ। अरू बेला रु ${HOME_PICKUP_FEE_NPR} लाग्छ।`;

/** Home pickup is only offered around these places. */
export const PICKUP_AREAS = ['Hetauda', 'Simara', 'Birgunj', 'Chitwan', 'Kathmandu'] as const;

export const OTHER_AREA = 'other';
