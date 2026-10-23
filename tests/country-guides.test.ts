import { describe, it, expect } from 'vitest';
import { COUNTRY_GUIDES, getCountryGuide, relatedGuides } from '../src/data/countryGuides';
import { findRateGroupForCountry, isMeatAllowedForCountry, calculateSheetShipmentQuote } from '../src/features/estimator/engine';
import type { SheetRateItem } from '../src/services/ratesService';
import { LOCAL_LANG_OF, loadLocalPack } from '../src/data/countryGuides/localLangs';
import { UI_BASE } from '../src/features/countryGuides/ui';
import { localizeGuide } from '../src/features/countryGuides/localize';
import { PICKUP_POLICY_EN, pickupFeeFor } from '../src/features/estimator/pickup';

/** Same groups and country lists as the live rate sheet (checked 2026-10-22); prices are dummies. */
const GROUPS: [string, string, string[]][] = [
  ['Australia', 'Australia', ['Australia']],
  ['Canada', 'Canada', ['Canada']],
  ['Cyprus', 'Cyprus', ['Cyprus']],
  ['EU A', 'EU A', ['Austria', 'Germany', 'Luxembourg', 'Netherlands', 'Czech Republic', 'Denmark', 'France', 'Monaco', 'Hungary', 'Italy', 'Ireland', 'Poland', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Portugal', 'Croatia', 'Estonia', 'Finland', 'Lithuania', 'Latvia']],
  ['EU B', 'EU B', ['Romania', 'Greece', 'Bulgaria']],
  ['Gulf Country', 'Gulf', ['Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Malaysia']],
  ['Hong Kong', 'Hong Kong', ['Hong Kong']],
  ['Japan', 'Japan', ['Japan']],
  ['Korea', 'South Korea', ['Korea', 'Republic of Korea']],
  ['Malasiya', 'Malaysia', ['Malaysia', 'Malasiya']],
  ['Malta', 'Malta', ['Malta']],
  ['New Zealand', 'New Zealand', ['New Zealand']],
  ['Philippines', 'Philippines', ['Philippines']],
  ['Taiwan', 'Taiwan', ['Taiwan']],
  ['UAE', 'United Arab Emirates', ['UAE', 'United Arab Emirates']],
  ['UK', 'United Kingdom', ['UK', 'United Kingdom', 'Britain', 'Great Britain']],
  ['USA', 'United States', ['USA', 'US', 'United States', 'United States of America']],
];

const RATES: SheetRateItem[] = GROUPS.flatMap(([rate_group, display_name, supported_countries]) => [
  ...[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5].map((kg) => ({
    rate_group, display_name, supported_countries, weight_tier: 'standard' as const, weight_kg: kg, price_npr: 1000 + kg * 100, currency: 'NPR', active: true,
  })),
  { rate_group, display_name, supported_countries, weight_tier: '10_plus' as const, weight_kg: null, price_npr: 900, currency: 'NPR', active: true },
  { rate_group, display_name, supported_countries, weight_tier: '20_plus' as const, weight_kg: null, price_npr: 800, currency: 'NPR', active: true },
]);

/** Every country the owner asked for (spelling as given). */
const REQUESTED = [
  'Korea', 'Japan', 'UK', 'Australia', 'USA', 'Canada', 'New Zealand', 'Malta', 'Cyprus', 'UAE', 'Hong Kong', 'Philippines', 'Taiwan',
  'Austria', 'Germany', 'Luxembourg', 'Netherlands', 'Czech Republic', 'Denmark', 'France', 'Monaco', 'Hungary', 'Italy', 'Ireland', 'Poland', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Portugal',
  'Romania', 'Greece', 'Bulgaria', 'Croatia', 'Estonia', 'Finland', 'Lithuania', 'Latvia',
  'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Malaysia',
];

/** Walk every {en, ne} pair in a guide. */
function bilingual(obj: unknown, out: { en: string; ne: string }[] = []) {
  if (obj && typeof obj === 'object') {
    const o = obj as Record<string, unknown>;
    if (typeof o.en === 'string' && typeof o.ne === 'string') out.push(o as { en: string; ne: string });
    else Object.values(o).forEach((v) => bilingual(v, out));
  }
  return out;
}

describe('country guides', () => {
  it('covers every requested country exactly once, with stable slugs', () => {
    expect(COUNTRY_GUIDES).toHaveLength(REQUESTED.length);
    const slugs = COUNTRY_GUIDES.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    slugs.forEach((s) => expect(s).toMatch(/^nepal-to-[a-z-]+$/));
    for (const c of REQUESTED) expect(COUNTRY_GUIDES.some((g) => g.rateCountry === c), c).toBe(true);
  });

  it('maps every guide to a live rate group the estimator can price', () => {
    for (const g of COUNTRY_GUIDES) {
      expect(findRateGroupForCountry(g.rateCountry, RATES), g.slug).not.toBeNull();
      expect(calculateSheetShipmentQuote({ destination: g.rateCountry, actualWeightKg: 5 }, RATES).allowed, g.slug).toBe(true);
    }
  });

  it('only offers sukuti where the rate engine allows meat', () => {
    for (const g of COUNTRY_GUIDES) {
      const group = findRateGroupForCountry(g.rateCountry, RATES)!.rateGroup;
      const allowed = isMeatAllowedForCountry(group) || isMeatAllowedForCountry(g.rateCountry);
      const offers = g.send.some((i) => i.icon === 'meat');
      expect(offers, g.slug).toBe(allowed);
    }
  });

  it('keeps prices and transit promises out of the content', () => {
    for (const g of COUNTRY_GUIDES) {
      const text = JSON.stringify(g);
      expect(text, g.slug).not.toMatch(/Rs\.?\s?\d/);
      expect(text, g.slug).not.toMatch(/\b\d+\s*(?:-\s*\d+\s*)?(?:working\s+)?days?\b/i);
    }
  });

  it('has every piece of text in English and Nepali', () => {
    for (const g of COUNTRY_GUIDES) {
      for (const b of bilingual(g)) {
        expect(b.en.trim().length, `${g.slug}: ${b.en}`).toBeGreaterThan(0);
        expect(b.ne, `${g.slug}: ${b.en}`).toMatch(/[ऀ-ॿ]/);
      }
    }
  });

  it('gives each guide its own opening, title and FAQs', () => {
    const uniq = (xs: string[]) => new Set(xs).size === xs.length;
    expect(uniq(COUNTRY_GUIDES.map((g) => g.hero.title.en))).toBe(true);
    expect(uniq(COUNTRY_GUIDES.map((g) => g.seo.title))).toBe(true);
    expect(uniq(COUNTRY_GUIDES.map((g) => g.seo.description))).toBe(true);
    for (const g of COUNTRY_GUIDES) expect(g.faqs.length, g.slug).toBeGreaterThanOrEqual(2);
  });

  it('looks guides up by slug and suggests other guides', () => {
    expect(getCountryGuide('nepal-to-south-korea')?.rateCountry).toBe('Korea');
    expect(getCountryGuide('nepal-air-cargo-customs-guide-2026')).toBeUndefined();
    const korea = getCountryGuide('nepal-to-south-korea')!;
    const rel = relatedGuides(korea, 3);
    expect(rel).toHaveLength(3);
    expect(rel.every((g) => g.slug !== korea.slug)).toBe(true);
  });
});

describe('local-language packs', () => {
  const codes = [...new Set(Object.values(LOCAL_LANG_OF).map((l) => l.code))];

  it('has a pack for every language a guide offers, and a guide for every slug it lists', async () => {
    for (const code of codes) {
      const pack = await loadLocalPack(code);
      expect(pack.ui.code).toBe(code);
      for (const [slug, info] of Object.entries(LOCAL_LANG_OF)) {
        if (info.code !== code) continue;
        expect(getCountryGuide(slug), slug).toBeDefined();
        expect(pack.guides[slug], slug).toBeDefined();
        expect(info.label, slug).toBe(pack.ui.label);
      }
    }
  });

  it('translates every page label and keeps the placeholders', async () => {
    for (const code of codes) {
      const { ui } = await loadLocalPack(code);
      // labels the guide page never prints may fall back to English
      const UNUSED = ['guide', 'forOneKg', 'askTodayPrice', 'priceList', 'atAGlance', 'journeyTitle', 'checklistTitle', 'notFoundTitle', 'readGuide'];
      const need = Object.keys(UI_BASE.T).filter((k) => !UNUSED.includes(k));
      for (const k of need) expect(ui.T[k], `${code}.${k}`).toBeTruthy();
      expect(ui.T.policy).toContain('20');
      expect(ui.T.policy).toContain('200');
      for (const k of Object.keys(UI_BASE.T) as (keyof typeof UI_BASE.T)[]) {
        const want = (UI_BASE.T[k].en.match(/\{\w+\}/g) || []).sort().join();
        if (ui.T[k]) expect((ui.T[k].match(/\{\w+\}/g) || []).sort().join(), `${code}.${k}`).toBe(want);
      }
      expect(ui.journey).toHaveLength(UI_BASE.journey.length);
      expect(ui.journey[2].body).toContain('{policy}');
      expect(ui.journey[4].body).toContain('{country}');
      expect(ui.checklist).toHaveLength(UI_BASE.checklist.length);
      expect(ui.stages).toHaveLength(UI_BASE.stages.length);
      expect(ui.faqs).toHaveLength(UI_BASE.faqs.length);
      expect(ui.faqs[1].a).toContain('{policy}');
    }
  });

  it('lines up with the English guide item for item', async () => {
    for (const [slug, info] of Object.entries(LOCAL_LANG_OF)) {
      const g = getCountryGuide(slug)!;
      const l = (await loadLocalPack(info.code)).guides[slug];
      expect(l.send, slug).toHaveLength(g.send.length);
      expect(l.avoid, slug).toHaveLength(g.avoid.length);
      expect(l.intro, slug).toHaveLength(g.intro.length);
      expect(l.receiver.needs, slug).toHaveLength(g.receiver.needs.length);
      expect(l.faqs, slug).toHaveLength(g.faqs.length);
      const localized = localizeGuide(g, l);
      expect(localized.name.en).toBe(l.name);
      // nothing in the translation may leave the original English behind
      expect(JSON.stringify(localized.hero)).not.toContain(g.hero.title.en);
    }
  });

  it('keeps the pickup policy in the same numbers everywhere', () => {
    expect(PICKUP_POLICY_EN).toContain('Hetauda and Birgunj');
    expect(PICKUP_POLICY_EN).toContain('20 kg');
    expect(PICKUP_POLICY_EN).toContain('Rs 200');
    expect(pickupFeeFor('Hetauda', 25)).toBe(0);
    expect(pickupFeeFor('Birgunj', 20.5)).toBe(0);
    expect(pickupFeeFor('Hetauda', 20)).toBe(200);
    expect(pickupFeeFor('Hetauda', 10)).toBe(200);
    expect(pickupFeeFor('Kathmandu', 50)).toBe(200);
    expect(pickupFeeFor('Chitwan', 50)).toBe(200);
  });
});
