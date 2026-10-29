import type { Bi, GuideItem } from './types';

/**
 * Building blocks shared by many guides. Each takes the country-specific sentence, so two
 * guides never print the same card word for word.
 */

export const clothes = (note: Bi): GuideItem => ({
  icon: 'clothes',
  title: { en: 'Clothes and shoes', ne: 'लुगा र जुत्ता' },
  note,
});

export const documents = (note: Bi): GuideItem => ({
  icon: 'documents',
  title: { en: 'Documents', ne: 'कागजपत्र' },
  note,
});

export const dryFood = (note: Bi): GuideItem => ({
  icon: 'food',
  title: { en: 'Dry, packed food', ne: 'सुख्खा, प्याक गरिएको खाना' },
  note,
});

export const gifts = (note: Bi): GuideItem => ({
  icon: 'gift',
  title: { en: 'Gifts and household items', ne: 'उपहार र घरायसी सामान' },
  note,
});

export const medicine = (note: Bi): GuideItem => ({
  icon: 'medicine',
  title: { en: 'Prescribed medicine', ne: 'डाक्टरले लेखेको औषधि' },
  note,
});

export const crafts = (note: Bi): GuideItem => ({
  icon: 'craft',
  title: { en: 'Handicrafts and pashmina', ne: 'हस्तकला र पश्मिना' },
  note,
});

export const samples = (note: Bi): GuideItem => ({
  icon: 'samples',
  title: { en: 'Business samples', ne: 'व्यापारिक नमुना' },
  note,
});

export const liquids = (note: Bi): GuideItem => ({
  icon: 'liquid',
  title: { en: 'Ghee, oil and pickles', ne: 'घिउ, तेल र अचार' },
  note,
});

/** Meat (sukuti and similar) on a route where our rate sheet allows it, with its own per-kg fee. */
export const meatAllowed = (note: Bi): GuideItem => ({
  icon: 'meat',
  title: { en: 'Sukuti and dried meat', ne: 'सुकुटी र सुकाएको मासु' },
  note,
});

/** Meat on a route where we do not take it. */
export const noMeat = (note: Bi): GuideItem => ({
  icon: 'meat',
  title: { en: 'Meat of any kind', ne: 'कुनै पनि किसिमको मासु' },
  note,
});

export const dangerous: GuideItem = {
  icon: 'personal',
  title: { en: 'Batteries, gas and anything flammable', ne: 'ब्याट्री, ग्यास र आगो लाग्ने सामान' },
  note: {
    en: 'Power banks, loose lithium batteries, lighters, matches, perfume in large amounts and aerosol cans cannot fly in cargo.',
    ne: 'पावर बैंक, छुट्टै लिथियम ब्याट्री, लाइटर, सलाई, धेरै अत्तर र स्प्रे क्यान कार्गोमा उड्न पाउँदैनन्।',
  },
};

export const fakesAndCash: GuideItem = {
  icon: 'personal',
  title: { en: 'Cash, gold and copied brands', ne: 'नगद, सुन र नक्कली ब्रान्ड' },
  note: {
    en: 'No cash, gold, silver or jewellery of value, and no fake branded goods. Customs seize them and the parcel stops.',
    ne: 'नगद, सुन, चाँदी, महँगो गहना र नक्कली ब्रान्डका सामान नपठाउनुहोस्। भन्सारले जफत गर्छ र पार्सल रोकिन्छ।',
  },
};
