import { describe, it, expect } from 'vitest';
import { DEFAULT_HOW_TO_SHIP } from '../src/data/defaultHowToShip';
import { fetchPublishedHowToShip } from '../src/services/howToShipService';

describe('How to Ship Feature & Data Integrity', () => {
  it('validates default How-to-Ship initial content structure and bilingual completeness', () => {
    expect(DEFAULT_HOW_TO_SHIP.title_en).toBe('Before You Ship');
    expect(DEFAULT_HOW_TO_SHIP.title_np).toBe('सामान पठाउनुअघि');
    expect(DEFAULT_HOW_TO_SHIP.intro_en).toContain('Read this simple guide before sending your parcel with The BC Cargo.');
    expect(DEFAULT_HOW_TO_SHIP.sections).toHaveLength(6);

    // Section 1: What Can You Send?
    const sec1 = DEFAULT_HOW_TO_SHIP.sections.find((s) => s.section_number === 1);
    expect(sec1).toBeDefined();
    expect(sec1?.title_en).toBe('What Can You Send?');
    expect(sec1?.title_np).toBe('के पठाउन मिल्छ?');
    expect(sec1?.items.length).toBe(6);
    expect(sec1?.items[0].en).toBe('Clothes, shoes and bags');
    expect(sec1?.items[0].np).toBe('लुगा, जुत्ता र झोला');
    expect(sec1?.items[5].en).toBe('Sealed pickles');
    expect(sec1?.items[5].np).toBe('राम्ररी प्याक गरिएको अचार');

    // Section 2: Items With Special Rules
    const sec2 = DEFAULT_HOW_TO_SHIP.sections.find((s) => s.section_number === 2);
    expect(sec2).toBeDefined();
    expect(sec2?.title_en).toBe('Items With Special Rules');
    expect(sec2?.items.length).toBe(4);
    expect(sec2?.items[0].highlight_en).toBe('Medicine');
    expect(sec2?.items[1].highlight_en).toBe('Meat');
    expect(sec2?.items[2].highlight_en).toBe('Phones and laptops');
    expect(sec2?.items[3].highlight_en).toBe('Liquids');

    // Section 3: Items You Cannot Send
    const sec3 = DEFAULT_HOW_TO_SHIP.sections.find((s) => s.section_number === 3);
    expect(sec3).toBeDefined();
    expect(sec3?.title_en).toBe('Items You Cannot Send');
    expect(sec3?.items.length).toBe(7);
    expect(sec3?.extra_text_en).toContain('Every country has different rules');
    expect(sec3?.extra_text_np).toContain('कुनै सामान पठाउन मिल्छ कि मिल्दैन भन्ने थाहा छैन? प्याक गर्नुअघि WhatsApp मा फोटो पठाउनुहोस्।');

    // Section 4: What Should You Bring?
    const sec4 = DEFAULT_HOW_TO_SHIP.sections.find((s) => s.section_number === 4);
    expect(sec4).toBeDefined();
    expect(sec4?.title_en).toBe('What Should You Bring?');
    expect(sec4?.items[0].en).toContain('citizenship card or passport');
    expect(sec4?.items[3].np).toContain('개인통관고유부호');

    // Section 5: How to Pack
    const sec5 = DEFAULT_HOW_TO_SHIP.sections.find((s) => s.section_number === 5);
    expect(sec5).toBeDefined();
    expect(sec5?.title_en).toBe('How to Pack');
    expect(sec5?.items[0].en).toContain('We will pack them safely.');

    // Section 6: Customs and Tax
    const sec6 = DEFAULT_HOW_TO_SHIP.sections.find((s) => s.section_number === 6);
    expect(sec6).toBeDefined();
    expect(sec6?.title_en).toBe('Customs and Tax');
    expect(sec6?.items[0].en).toContain('We prepare the export papers in Nepal.');

    // Contact WhatsApp section
    expect(DEFAULT_HOW_TO_SHIP.contact_title_en).toBe('Not sure about your parcel?');
    expect(DEFAULT_HOW_TO_SHIP.contact_title_np).toBe('सामानबारे अन्योलमा हुनुहुन्छ?');
    expect(DEFAULT_HOW_TO_SHIP.contact_text_en).toBe('Contact The BC Cargo on WhatsApp before sending it.');
    expect(DEFAULT_HOW_TO_SHIP.contact_text_np).toBe('सामान पठाउनुअघि The BC Cargo मा WhatsApp मार्फत सम्पर्क गर्नुहोस्।');
  });

  it('fetchPublishedHowToShip resolves safely with published content and fallback', async () => {
    const data = await fetchPublishedHowToShip();
    expect(data).toBeDefined();
    expect(data.published).toBe(true);
    expect(['Before You Ship', 'Before Shipment']).toContain(data.title_en);
    expect(data.sections.length).toBe(6);
  });
});
