/**
 * Country shipping guides: content only. Prices never live here; they come from the live
 * rate sheet (ratesService.fetchSheetRates) at render time, through the estimator engine.
 *
 * This file and the content files must stay free of runtime imports from the app
 * (type imports are fine): scripts/prerender.mjs and scripts/generate-sitemap.mjs load them in Node.
 */

export type Lang = 'en' | 'ne';

/** One piece of text in English and Nepali. */
export interface Bi {
  en: string;
  ne: string;
}

export type GuideRegion = 'asia' | 'europe' | 'middle-east' | 'north-america' | 'oceania';

export type ItemIcon =
  | 'clothes'
  | 'documents'
  | 'food'
  | 'gift'
  | 'medicine'
  | 'personal'
  | 'craft'
  | 'samples'
  | 'meat'
  | 'liquid';

export interface GuideItem {
  icon: ItemIcon;
  title: Bi;
  note: Bi;
}

export interface GuideFaq {
  q: Bi;
  a: Bi;
}

/** Section ids, in the order a guide wants them. Lets each country lead with what matters most. */
export type GuideSectionId =
  | 'intro'
  | 'journey'
  | 'send'
  | 'avoid'
  | 'receiver'
  | 'price'
  | 'checklist'
  | 'track'
  | 'faq';

export interface CountryGuide {
  /** URL slug: /blogs/<slug> */
  slug: string;
  /** ISO 3166-1 alpha-2, lowercase (flag images) */
  code: string;
  name: Bi;
  region: GuideRegion;
  /** Name passed to the estimator's findRateGroupForCountry, same as the Rates page uses */
  rateCountry: string;
  /** Capital or main city, and approximate [lat, lon] for the route map */
  hub: { city: Bi; lat: number; lon: number };
  /** Main cities we commonly deliver to (real cities only; no service claim beyond the country) */
  cities: string[];
  currency: string;
  /** Short line for cards and lists */
  blurb: Bi;
  seo: { title: string; description: string };
  hero: { title: Bi; lede: Bi };
  /** 1-3 short paragraphs */
  intro: Bi[];
  /** Weight used in the "Planning a X kg parcel?" price prompt */
  exampleKg: number;
  send: GuideItem[];
  avoid: GuideItem[];
  receiver: {
    lead: Bi;
    needs: Bi[];
    /** Example address lines, already in the local format */
    addressExample: string[];
    tip: Bi;
  };
  /** Destination-side notes for the journey (customs and local delivery steps) */
  arrival: { customs: Bi; delivery: Bi };
  faqs: GuideFaq[];
  order?: GuideSectionId[];
}
