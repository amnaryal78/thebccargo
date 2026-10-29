import type { CountryGuide, GuideRegion, GuideSectionId, Bi } from './types';
import { ASIA_GUIDES } from './asia';
import { FAR_GUIDES } from './farRoutes';
import { GULF_GUIDES } from './gulf';
import { EUROPE_GUIDES } from './europe';

export type { CountryGuide, GuideRegion, GuideSectionId, Bi, Lang, LocalGuide, LocalUi, LocalPack, LocalLangCode } from './types';

/** Every country guide, flagship routes first. */
export const COUNTRY_GUIDES: CountryGuide[] = [...ASIA_GUIDES, ...GULF_GUIDES, ...EUROPE_GUIDES, ...FAR_GUIDES];

const BY_SLUG = new Map(COUNTRY_GUIDES.map((g) => [g.slug, g]));

export const getCountryGuide = (slug: string | undefined): CountryGuide | undefined =>
  slug ? BY_SLUG.get(slug) : undefined;

export const isCountryGuideSlug = (slug: string | undefined): boolean => !!slug && BY_SLUG.has(slug);

export const DEFAULT_SECTION_ORDER: GuideSectionId[] = [
  'intro', 'journey', 'send', 'avoid', 'receiver', 'price', 'checklist', 'track', 'faq',
];

export const REGION_LABEL: Record<GuideRegion, Bi> = {
  asia: { en: 'Asia', ne: 'एसिया' },
  'middle-east': { en: 'Middle East', ne: 'मध्यपूर्व' },
  europe: { en: 'Europe', ne: 'युरोप' },
  'north-america': { en: 'North America', ne: 'उत्तर अमेरिका' },
  oceania: { en: 'Oceania', ne: 'ओसियानिया' },
};

/** Up to `n` other guides, same region first, for the "You may also be sending to" strip. */
export function relatedGuides(guide: CountryGuide, n = 3): CountryGuide[] {
  // Neighbours in list order after this guide, wrapping round, so each page shows different ones.
  const region = COUNTRY_GUIDES.filter((g) => g.region === guide.region);
  const at = region.findIndex((g) => g.slug === guide.slug);
  const same = [...region.slice(at + 1), ...region.slice(0, at)];
  const rest = COUNTRY_GUIDES.filter((g) => g.region !== guide.region);
  return [...same, ...rest].slice(0, n);
}
