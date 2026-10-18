export type HandoverMethod = 'office' | 'home';

/** Extra charge for collecting the parcel from the sender's home. */
export const HOME_PICKUP_FEE_NPR = 500;

/** Home pickup is only offered around these places. */
export const PICKUP_AREAS = ['Hetauda', 'Simara', 'Birgunj', 'Chitwan', 'Kathmandu'] as const;

export const OTHER_AREA = 'other';
