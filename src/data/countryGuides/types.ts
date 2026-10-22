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

/* ---------- Local-language packs (Korean for Korea, Arabic for the Gulf, ...) ---------- */

export type LocalLangCode =
  | 'ko' | 'ja' | 'zh' | 'ar' | 'ms' | 'de'
  | 'fr' | 'es' | 'it' | 'pt' | 'pl' | 'ro' | 'el' | 'nl' | 'cs' | 'da' | 'hu' | 'sk' | 'sl' | 'sv'
  | 'bg' | 'hr' | 'et' | 'fi' | 'lt' | 'lv' | 'mt' | 'fil';

export interface LocalItem {
  title: string;
  note: string;
}

/** Translation of one guide. Arrays line up with the English guide, index for index. */
export interface LocalGuide {
  name: string;
  city: string;
  blurb: string;
  hero: { title: string; lede: string };
  intro: string[];
  send: LocalItem[];
  avoid: LocalItem[];
  receiver: { lead: string; needs: string[]; tip: string };
  arrival: { customs: string; delivery: string };
  faqs: { q: string; a: string }[];
}

/** Page labels in the local language: same keys as the shared English/Nepali labels. */
export interface LocalUi {
  code: LocalLangCode;
  /** Name of the language, written in that language (button label) */
  label: string;
  /** BCP 47 tag for the lang attribute and date formatting */
  locale: string;
  rtl?: boolean;
  T: Record<string, string>;
  sections: Record<GuideSectionId, string>;
  journey: { title: string; body: string }[];
  checklist: string[];
  stages: string[];
  faqs: { q: string; a: string }[];
  regions: Record<GuideRegion, string>;
}

export interface LocalPack {
  ui: LocalUi;
  guides: Record<string, LocalGuide>;
}
