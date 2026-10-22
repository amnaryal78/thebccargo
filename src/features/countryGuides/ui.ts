import type { Bi, GuideRegion, GuideSectionId } from '../../data/countryGuides';
import { PICKUP_POLICY_EN, PICKUP_POLICY_NE } from '../estimator/pickup';

/** Labels shared by every guide page. Country text lives in src/data/countryGuides. */

export const SECTION_LABEL: Record<GuideSectionId, Bi> = {
  intro: { en: 'Before you start', ne: 'सुरु गर्नुअघि' },
  journey: { en: 'The journey', ne: 'पार्सलको यात्रा' },
  send: { en: 'What you can send', ne: 'के पठाउन मिल्छ' },
  avoid: { en: 'What not to send', ne: 'के नपठाउने' },
  receiver: { en: 'What the receiver needs', ne: 'प्रापकलाई के चाहिन्छ' },
  price: { en: 'Price today', ne: 'आजको मूल्य' },
  checklist: { en: 'Before you hand it over', ne: 'बुझाउनुअघि' },
  track: { en: 'Tracking', ne: 'ट्र्याकिङ' },
  faq: { en: 'Questions', ne: 'प्रश्नहरू' },
};

export const T = {
  guide: { en: 'Country shipping guide', ne: 'देशअनुसार ढुवानी गाइड' },
  onThisPage: { en: 'On this page', ne: 'यस पेजमा' },
  from: { en: 'From', ne: 'देखि' },
  forOneKg: { en: 'for a 1 kg parcel, box included', ne: '१ केजी पार्सल, बाकससहित' },
  perKgBulk: { en: 'per kg, for {kg} kg and above', ne: '{kg} केजी वा बढीमा प्रति केजी' },
  perKgShort: { en: '/kg for {kg} kg+', ne: '/केजी ({kg} केजी+)' },
  home: { en: 'Home', ne: 'गृहपृष्ठ' },
  guidesCrumb: { en: 'Guides', ne: 'गाइड' },
  dropOff: { en: 'Drop-off', ne: 'बुझाउने ठाउँ' },
  officeAddr: { en: 'School Road -4, Hetauda', ne: 'स्कुल रोड -४, हेटौंडा' },
  nepalWord: { en: 'NEPAL', ne: 'नेपाल' },
  hetaudaWord: { en: 'Hetauda', ne: 'हेटौंडा' },
  delivered: { en: 'Delivered', ne: 'डेलिभरी' },
  customsOf: { en: '{country} customs', ne: '{country} भन्सार' },
  askTodayPrice: { en: 'Ask us for today’s price', ne: 'आजको मूल्य हामीसँग सोध्नुहोस्' },
  priceLoading: { en: 'Checking today’s price', ne: 'आजको मूल्य हेर्दै' },
  priceUnavailable: {
    en: 'Current price unavailable. Message us for the latest rate.',
    ne: 'अहिले मूल्य उपलब्ध छैन। ताजा दरका लागि हामीलाई म्यासेज गर्नुहोस्।',
  },
  calculate: { en: 'Calculate shipping', ne: 'ढुवानी शुल्क हेर्नुहोस्' },
  whatsapp: { en: 'Ask on WhatsApp', ne: 'WhatsApp मा सोध्नुहोस्' },
  talkWhatsapp: { en: 'Talk on WhatsApp', ne: 'WhatsApp मा कुरा गर्नुहोस्' },
  book: { en: 'Book this shipment', ne: 'यो पार्सल बुक गर्नुहोस्' },
  track: { en: 'Track my parcel', ne: 'मेरो पार्सल ट्र्याक गर्नुहोस्' },
  trackParcel: { en: 'Track a parcel', ne: 'पार्सल ट्र्याक गर्नुहोस्' },
  share: { en: 'Share', ne: 'सेयर' },
  copied: { en: 'Link copied', ne: 'लिङ्क कपी भयो' },
  mainCities: { en: 'Main cities', ne: 'मुख्य सहर' },
  currency: { en: 'Local currency', ne: 'स्थानीय मुद्रा' },
  priceList: { en: 'Price list', ne: 'मूल्य सूची' },
  transit: { en: 'Transit time', ne: 'पुग्ने समय' },
  transitValue: { en: 'Ask us for the next dispatch date', ne: 'अर्को पठाउने मिति हामीसँग सोध्नुहोस्' },
  tracking: { en: 'Tracking', ne: 'ट्र्याकिङ' },
  trackingValue: { en: 'Online, with your receipt number', ne: 'रसिद नम्बरबाट अनलाइन' },
  atAGlance: { en: 'At a glance', ne: 'छोटकरीमा' },
  exampleAddress: { en: 'How the address should look', ne: 'ठेगाना यस्तो देखिनुपर्छ' },
  planning: { en: 'Planning a {kg} kg parcel?', ne: '{kg} केजीको पार्सल पठाउने सोच्दै हुनुहुन्छ?' },
  planningBody: {
    en: 'Here is what it costs today, box charge included. Prices come straight from our live price list.',
    ne: 'आज यति लाग्छ, बाकस शुल्कसहित। मूल्य सिधै हाम्रो लाइभ मूल्य सूचीबाट आउँछ।',
  },
  boxIncluded: { en: 'box included', ne: 'बाकससहित' },
  perKg: { en: 'per kg', ne: 'प्रति केजी' },
  heavier: { en: 'Heavier boxes are priced per kg', ne: 'गह्रौं बाकस प्रति केजी हिसाब हुन्छ' },
  updated: { en: 'Price list updated', ne: 'मूल्य सूची अपडेट' },
  calcTitle: { en: 'How much will my parcel cost?', ne: 'मेरो पार्सलको कति लाग्छ?' },
  weight: { en: 'Total weight (kg)', ne: 'जम्मा तौल (केजी)' },
  hasLiquid: { en: 'Ghee, oil or other liquid', ne: 'घिउ, तेल वा अरू तरल' },
  hasMedicine: { en: 'Medicine', ne: 'औषधि' },
  hasMeat: { en: 'Sukuti or dried meat', ne: 'सुकुटी वा सुकाएको मासु' },
  meatKg: { en: 'Meat weight (kg)', ne: 'मासुको तौल (केजी)' },
  meatNotHere: { en: 'Not accepted on this route', ne: 'यो रुटमा लिइँदैन' },
  shipping: { en: 'Shipping', ne: 'ढुवानी' },
  boxes: { en: 'Boxes', ne: 'बाकस' },
  liquidFee: { en: 'Liquid fee', ne: 'तरल शुल्क' },
  medicineFee: { en: 'Medicine fee', ne: 'औषधि शुल्क' },
  meatFee: { en: 'Meat fee', ne: 'मासु शुल्क' },
  total: { en: 'Estimated total', ne: 'अनुमानित जम्मा' },
  calcNote: {
    en: 'Final price is set when we weigh the parcel at our office. Customs duty or tax in the destination country is not included and is paid by the receiver.',
    ne: 'अन्तिम मूल्य हाम्रो कार्यालयमा पार्सल तौलेपछि तय हुन्छ। गन्तव्य देशको भन्सार कर यसमा पर्दैन र प्रापकले तिर्छन्।',
  },
  journeyTitle: { en: 'Your shipment journey', ne: 'तपाईंको पार्सलको यात्रा' },
  trackTitle: { en: 'Your parcel has a journey. Follow it.', ne: 'तपाईंको पार्सलको यात्रा हुन्छ। पछ्याउनुहोस्।' },
  trackBody: {
    en: 'Every box gets a tracking number on your receipt. Enter it on our tracking page to see where it is.',
    ne: 'हरेक बाकसको ट्र्याकिङ नम्बर तपाईंको रसिदमा हुन्छ। कहाँ पुग्यो हेर्न हाम्रो ट्र्याकिङ पेजमा हाल्नुहोस्।',
  },
  checklistTitle: { en: 'Before you hand over your parcel', ne: 'पार्सल बुझाउनुअघि' },
  checklistHint: { en: 'Tick them off as you go. Nothing is saved.', ne: 'गर्दै जाँदा टिक लगाउनुहोस्। केही सेभ हुँदैन।' },
  readyTitle: { en: 'Ready to send to {country}?', ne: '{country} पठाउन तयार हुनुहुन्छ?' },
  readyBody: {
    en: 'Bring it to our office in Hetauda, or ask us about home pickup. We weigh it, pack it and give you a tracking number.',
    ne: 'हेटौंडाको हाम्रो कार्यालयमा ल्याउनुहोस्, वा घरबाट लिन आउने बारे सोध्नुहोस्। हामी तौल्छौं, प्याक गर्छौं र ट्र्याकिङ नम्बर दिन्छौं।',
  },
  related: { en: 'You may also be sending to', ne: 'तपाईं यहाँ पनि पठाउँदै हुनुहुन्छ होला' },
  rulesChange: {
    en: 'Rules can change. Check with us before packing anything you are unsure about.',
    ne: 'नियम बदलिन सक्छ। शंका लागेको सामान प्याक गर्नुअघि हामीसँग सोध्नुहोस्।',
  },
  notFoundTitle: { en: 'Looking for another destination?', ne: 'अर्को गन्तव्य खोज्दै हुनुहुन्छ?' },
  allGuides: { en: 'All country guides', ne: 'सबै देशका गाइड' },
  readGuide: { en: 'Read guide', ne: 'गाइड पढ्नुहोस्' },
} satisfies Record<string, Bi>;

/** Steps before the parcel leaves Nepal; the last two come from each guide's arrival notes. */
export const JOURNEY_STEPS: { title: Bi; body: Bi }[] = [
  {
    title: { en: 'Prepare', ne: 'तयारी' },
    body: {
      en: 'Collect what you want to send and get the receiver’s details. Leave boxes open; we check and pack.',
      ne: 'पठाउने सामान जम्मा गर्नुहोस् र प्रापकको विवरण लिनुहोस्। बाकस खुलै राख्नुहोस्; हामी जाँचेर प्याक गर्छौं।',
    },
  },
  {
    title: { en: 'Book', ne: 'बुक' },
    body: {
      en: 'Message us on WhatsApp, call, or book online. We confirm the price and the next dispatch.',
      ne: 'WhatsApp मा म्यासेज, फोन वा अनलाइन बुक गर्नुहोस्। हामी मूल्य र अर्को पठाउने मिति पक्का गर्छौं।',
    },
  },
  {
    title: { en: 'Drop off or pickup', ne: 'बुझाउने वा लिन आउने' },
    body: {
      en: 'Bring it to School Road -4, Hetauda, or ask us to collect it from home. {policy}',
      ne: 'हेटौंडा स्कुल रोड -४ मा ल्याउनुहोस्, वा घरबाटै लिन आउन भन्नुहोस्। {policy}',
    },
  },
  {
    title: { en: 'Weigh and pack in Nepal', ne: 'नेपालमै तौल र प्याक' },
    body: {
      en: 'We weigh, pack into boxes of up to 20 kg, prepare the customs papers and give you a tracking number per box.',
      ne: 'हामी तौल्छौं, २० केजीसम्मका बाकसमा प्याक गर्छौं, भन्सार कागज बनाउँछौं र हरेक बाकसको ट्र्याकिङ नम्बर दिन्छौं।',
    },
  },
  {
    title: { en: 'By air', ne: 'हवाई ढुवानी' },
    body: {
      en: 'Your boxes leave Nepal with the next dispatch to {country}.',
      ne: 'तपाईंका बाकस {country} जाने अर्को ढुवानीसँग नेपालबाट निस्कन्छन्।',
    },
  },
];

export const CHECKLIST: Bi[] = [
  { en: 'Receiver’s full name, as on their ID', ne: 'परिचयपत्रमा जस्तै प्रापकको पूरा नाम' },
  { en: 'A phone number the receiver answers', ne: 'प्रापकले उठाउने फोन नम्बर' },
  { en: 'Complete address in the local format', ne: 'स्थानीय ढाँचामा पूरा ठेगाना' },
  { en: 'Checked the "what not to send" list', ne: '"के नपठाउने" सूची हेरिसक्नुभयो' },
  { en: 'Liquids sealed and packed separately', ne: 'तरल सामान सिल गरी छुट्टै प्याक' },
  { en: 'Prescriptions or invoices ready, if needed', ne: 'चाहिने भए प्रेस्क्रिप्सन वा बिल तयार' },
  { en: 'Confirmed today’s price', ne: 'आजको मूल्य पक्का गर्नुभयो' },
];

export const TRACK_STAGES: Bi[] = [
  { en: 'Nepal', ne: 'नेपाल' },
  { en: 'Processing', ne: 'प्रक्रिया' },
  { en: 'Air transit', ne: 'हवाई यात्रा' },
  { en: 'Customs', ne: 'भन्सार' },
  { en: 'Local delivery', ne: 'स्थानीय डेलिभरी' },
  { en: 'Receiver', ne: 'प्रापक' },
];

/** Questions every guide answers the same way, because the answer is about us, not the country. */
export const COMMON_FAQS: { q: Bi; a: Bi }[] = [
  {
    q: { en: 'How long does it take?', ne: 'पुग्न कति समय लाग्छ?' },
    a: {
      en: 'It depends on the next dispatch and on customs at the other end. Message us and we will tell you the next dispatch date for this route.',
      ne: 'अर्को ढुवानी र गन्तव्यको भन्सारमा भर पर्छ। म्यासेज गर्नुहोस्, यो रुटको अर्को पठाउने मिति बताउँछौं।',
    },
  },
  {
    q: { en: 'Where do I drop off my parcel? Is pickup available?', ne: 'पार्सल कहाँ बुझाउने? घरबाट लिन आउनुहुन्छ?' },
    a: {
      en: 'Our office is at School Road -4, Hetauda, open Sunday to Friday, 9 am to 6 pm. We also collect from home. {policy}',
      ne: 'हाम्रो कार्यालय हेटौंडा स्कुल रोड -४ मा छ, आइतबारदेखि शुक्रबार बिहान ९ देखि साँझ ६ सम्म खुला। घरबाटै लिन पनि आउँछौं। {policy}',
    },
  },
  {
    q: { en: 'Can I track the shipment?', ne: 'पार्सल ट्र्याक गर्न मिल्छ?' },
    a: {
      en: 'Yes. Every box gets a tracking number on your receipt. Enter it on our tracking page.',
      ne: 'मिल्छ। हरेक बाकसको ट्र्याकिङ नम्बर रसिदमा हुन्छ। हाम्रो ट्र्याकिङ पेजमा हाल्नुहोस्।',
    },
  },
];

export const POLICY: Bi = { en: PICKUP_POLICY_EN, ne: PICKUP_POLICY_NE };

/** Everything a guide page prints that is not country content. Local-language packs replace the whole bundle. */
export interface UiBundle {
  T: Record<keyof typeof T, Bi>;
  sections: Record<GuideSectionId, Bi>;
  journey: { title: Bi; body: Bi }[];
  checklist: Bi[];
  stages: Bi[];
  faqs: { q: Bi; a: Bi }[];
  regions: Record<GuideRegion, Bi>;
  policy: Bi;
}

export const UI_BASE: UiBundle = {
  T,
  sections: SECTION_LABEL,
  journey: JOURNEY_STEPS,
  checklist: CHECKLIST,
  stages: TRACK_STAGES,
  faqs: COMMON_FAQS,
  regions: {
    asia: { en: 'Asia', ne: 'एसिया' },
    'middle-east': { en: 'Middle East', ne: 'मध्यपूर्व' },
    europe: { en: 'Europe', ne: 'युरोप' },
    'north-america': { en: 'North America', ne: 'उत्तर अमेरिका' },
    oceania: { en: 'Oceania', ne: 'ओसियानिया' },
  },
  policy: POLICY,
};

export const pick = (b: Bi, lang: 'en' | 'ne') => b[lang];
export const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
