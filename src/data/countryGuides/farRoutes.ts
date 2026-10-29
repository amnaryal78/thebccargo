import type { CountryGuide } from './types';
import { clothes, documents, dryFood, gifts, medicine, crafts, noMeat, dangerous, fakesAndCash } from './common';

/** Oceania and North America: long routes with strict food rules at the border. */

export const australia: CountryGuide = {
  slug: 'nepal-to-australia',
  code: 'au',
  name: { en: 'Australia', ne: 'अष्ट्रेलिया' },
  region: 'oceania',
  rateCountry: 'Australia',
  hub: { city: { en: 'Sydney', ne: 'सिड्नी' }, lat: -33.87, lon: 151.21 },
  cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Darwin'],
  currency: 'Australian dollar (AUD)',
  blurb: {
    en: 'Biosecurity checks every food item. Declare it honestly and most of it gets through.',
    ne: 'बायोसेक्युरिटीले हरेक खाना जाँच्छ। इमानदारीपूर्वक घोषणा गरे धेरैजसो पुग्छ।',
  },
  seo: {
    title: 'Nepal to Australia Parcel: Biosecurity, Food Rules, Prices | BC Cargo',
    description:
      'Australian biosecurity is strict on food from Nepal. What gets through, what is destroyed, how to write the address with state and postcode, and live prices.',
  },
  hero: {
    title: { en: 'Australia will open the box. Make it easy for them.', ne: 'अष्ट्रेलियाले बाकस खोल्छ। उनीहरूलाई सजिलो बनाइदिनुहोस्।' },
    lede: {
      en: 'Sending to a student in Sydney or family in Melbourne? Australia has some of the toughest food rules in the world. A clear list inside the box saves days.',
      ne: 'सिड्नीमा पढ्ने वा मेलबर्नमा बस्ने परिवारलाई पठाउँदै हुनुहुन्छ? अष्ट्रेलियाको खानासम्बन्धी नियम संसारकै कडामध्ये पर्छ। बाकसभित्र स्पष्ट सूची भए धेरै दिन बच्छ।',
    },
  },
  intro: [
    {
      en: 'Australian biosecurity looks at every parcel for food, seeds, wood and animal products. Undeclared food is the main reason parcels from Nepal get held.',
      ne: 'अष्ट्रेलियाली बायोसेक्युरिटीले हरेक पार्सलमा खाना, बिउ, काठ र पशुजन्य सामान हेर्छ। घोषणा नगरिएको खाना नै नेपालबाट आउने पार्सल रोकिने मुख्य कारण हो।',
    },
    {
      en: 'The fix is simple: tell us exactly what is inside, keep food in shop packets, and leave out the things on the "do not send" list.',
      ne: 'उपाय सजिलो छ: भित्र के छ ठ्याक्कै भन्नुहोस्, खाना पसलकै प्याकेटमा राख्नुहोस्, र "नपठाउनुहोस्" सूचीका सामान नराख्नुहोस्।',
    },
  ],
  exampleKg: 10,
  send: [
    clothes({ en: 'Remember the seasons are flipped: Dashain falls in Australian spring.', ne: 'मौसम उल्टो हुन्छ भन्ने याद गर्नुहोस्: दसैं अष्ट्रेलियामा वसन्तमा पर्छ।' }),
    dryFood({
      en: 'Commercially packed spices, tea, noodles without meat and sealed sweets usually pass when declared.',
      ne: 'कम्पनीमा प्याक गरिएका मसला, चिया, मासु नभएको चाउचाउ र सिल गरिएका मिठाई घोषणा गरे प्रायः पास हुन्छन्।',
    }),
    documents({ en: 'Degree certificates and transcripts for university, flat and dry.', ne: 'विश्वविद्यालयका लागि डिग्री प्रमाणपत्र र ट्रान्सक्रिप्ट, सिधा र सुख्खा।' }),
    medicine({ en: 'Up to three months of personal medicine with the prescription.', ne: 'प्रेस्क्रिप्सनसहित तीन महिनासम्मको व्यक्तिगत औषधि।' }),
  ],
  avoid: [
    noMeat({ en: 'No meat, dried or cooked. Sukuti will be destroyed at the border.', ne: 'सुकाएको होस् वा पकाएको, मासु नपठाउनुहोस्। सुकुटी सीमामै नष्ट गरिन्छ।' }),
    {
      icon: 'food',
      title: { en: 'Seeds, grains, dairy and homemade food', ne: 'बिउ, अन्न, दुग्धजन्य र घरमा बनाएको खाना' },
      note: {
        en: 'Rice, raw beans, ghee, homemade achar and gundruk in a plain bag are often refused. Shop-packed is your best chance.',
        ne: 'चामल, काँचो गेडागुडी, घिउ, घरको अचार र सादा थैलोको गुन्द्रुक प्रायः अस्वीकार हुन्छ। पसलमा प्याक गरिएको भए सम्भावना बढी।',
      },
    },
    {
      icon: 'craft',
      title: { en: 'Untreated wood and straw', ne: 'प्रशोधन नगरिएको काठ र पराल' },
      note: { en: 'Wooden crafts and straw items need treatment certificates. Ask us first.', ne: 'काठका हस्तकला र परालका सामानलाई प्रशोधन प्रमाणपत्र चाहिन्छ। पहिले सोध्नुहोस्।' },
    },
    dangerous,
  ],
  receiver: {
    lead: { en: 'Australian addresses end with suburb, state and a 4-digit postcode.', ne: 'अष्ट्रेलियाली ठेगाना सबर्ब, राज्य र ४ अङ्कको पोस्टकोडले टुङ्गिन्छ।' },
    needs: [
      { en: 'Full name', ne: 'पूरा नाम' },
      { en: 'Unit / house number and street', ne: 'युनिट / घर नम्बर र सडक' },
      { en: 'Suburb, state (NSW, VIC, QLD, WA...) and postcode', ne: 'सबर्ब, राज्य (NSW, VIC, QLD, WA...) र पोस्टकोड' },
      { en: 'Australian mobile (04XX)', ne: 'अष्ट्रेलियाली मोबाइल (04XX)' },
    ],
    addressExample: ['Prakash Adhikari', 'Unit 4, 27 Station Street', 'Harris Park NSW 2150', 'Australia', '+61 412 345 678'],
    tip: { en: 'Write units as "Unit 4, 27 Station Street", not "4/27", so it is clear to everyone handling it.', ne: 'युनिट "4/27" नभई "Unit 4, 27 Station Street" लेख्नुहोस्, सबैलाई स्पष्ट होस्।' },
  },
  arrival: {
    customs: {
      en: 'Australian Border Force and biosecurity inspect the parcel. Declared food is checked; undeclared food can bring a fine. The receiver pays any duty.',
      ne: 'अष्ट्रेलियाली सीमा बल र बायोसेक्युरिटीले पार्सल जाँच्छन्। घोषणा गरिएको खाना जाँचिन्छ; घोषणा नगरेको भए जरिवाना लाग्न सक्छ। कर प्रापकले तिर्छन्।',
    },
    delivery: { en: 'A local courier delivers. Apartments often have parcel lockers.', ne: 'स्थानीय कुरियरले ल्याउँछ। अपार्टमेन्टमा प्रायः पार्सल लकर हुन्छ।' },
  },
  faqs: [
    {
      q: { en: 'Can I send gundruk or masala to Australia?', ne: 'अष्ट्रेलियामा गुन्द्रुक वा मसला पठाउन मिल्छ?' },
      a: {
        en: 'Shop-packed masala usually passes when declared. Loose or homemade gundruk is often refused. We list every food item on the declaration so nothing is a surprise.',
        ne: 'पसलमा प्याक गरिएको मसला घोषणा गरे प्रायः पास हुन्छ। खुला वा घरको गुन्द्रुक प्रायः अस्वीकार हुन्छ। हामी घोषणामा हरेक खाना लेख्छौं।',
      },
    },
    {
      q: { en: 'Why should I declare food at all?', ne: 'खाना किन घोषणा गर्ने?' },
      a: {
        en: 'Declared food that is not allowed is simply removed. Hidden food can mean a fine for the receiver.',
        ne: 'घोषणा गरिएको तर अनुमति नभएको खाना हटाइन्छ मात्र। लुकाएको खानाले प्रापकलाई जरिवाना पर्न सक्छ।',
      },
    },
    {
      q: { en: 'Who pays duty in Australia?', ne: 'अष्ट्रेलियामा कर कसले तिर्छ?' },
      a: { en: 'The receiver, if any is charged. Our price covers packing, boxes and the flight.', ne: 'लागेमा प्रापकले। हाम्रो मूल्यमा प्याकिङ, बाकस र ढुवानी पर्छ।' },
    },
  ],
  order: ['intro', 'avoid', 'send', 'price', 'receiver', 'journey', 'checklist', 'faq', 'track'],
};

export const newZealand: CountryGuide = {
  slug: 'nepal-to-new-zealand',
  code: 'nz',
  name: { en: 'New Zealand', ne: 'न्युजिल्यान्ड' },
  region: 'oceania',
  rateCountry: 'New Zealand',
  hub: { city: { en: 'Auckland', ne: 'अकल्यान्ड' }, lat: -36.85, lon: 174.76 },
  cities: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Dunedin'],
  currency: 'New Zealand dollar (NZD)',
  blurb: {
    en: 'Biosecurity as strict as Australia. Keep food sealed and declared.',
    ne: 'बायोसेक्युरिटी अष्ट्रेलियाजस्तै कडा। खाना सिल गरी घोषणा गर्नुहोस्।',
  },
  seo: {
    title: 'Sending Parcels from Nepal to New Zealand | BC Cargo',
    description:
      'New Zealand biosecurity rules for parcels from Nepal, how to address it with suburb and postcode, and live prices by weight.',
  },
  hero: {
    title: { en: 'The longest route we run. Pack it like it.', ne: 'हाम्रो सबैभन्दा लामो रुट। त्यसैअनुसार प्याक गर्नुहोस्।' },
    lede: {
      en: 'Auckland, Wellington, Christchurch. New Zealand checks every box for food and plant material, so a tidy, declared parcel is a fast parcel.',
      ne: 'अकल्यान्ड, वेलिङ्टन, क्राइस्टचर्च। न्युजिल्यान्डले हरेक बाकसमा खाना र बिरुवाजन्य सामान जाँच्छ, त्यसैले सफा र घोषित पार्सल छिटो पुग्छ।',
    },
  },
  intro: [
    {
      en: 'New Zealand protects its farms the same way Australia does. Anything food, seed or plant gets looked at. Shoes with soil on them can be held too, so clean them first.',
      ne: 'न्युजिल्यान्डले अष्ट्रेलियाजस्तै आफ्ना खेतबारी जोगाउँछ। खाना, बिउ वा बिरुवा जे भए पनि जाँचिन्छ। माटो लागेको जुत्ता पनि रोकिन सक्छ, त्यसैले पहिले सफा गर्नुहोस्।',
    },
  ],
  exampleKg: 5,
  send: [
    clothes({ en: 'Clean shoes and boots well; dirt counts as a biosecurity risk.', ne: 'जुत्ता राम्ररी सफा गर्नुहोस्; माटो बायोसेक्युरिटी जोखिम मानिन्छ।' }),
    documents({ en: 'Certificates and letters travel without trouble.', ne: 'प्रमाणपत्र र चिठी सजिलै जान्छन्।' }),
    dryFood({ en: 'Shop-packed, sealed and declared. Leave homemade food at home.', ne: 'पसलको सिल गरिएको र घोषणा गरिएको। घरको खाना घरमै राख्नुहोस्।' }),
    crafts({ en: 'Metal and fabric crafts are fine. Wooden items need checking.', ne: 'धातु र कपडाका हस्तकला ठीक छन्। काठका सामान जाँच्नुपर्छ।' }),
  ],
  avoid: [
    noMeat({ en: 'No meat of any kind.', ne: 'कुनै पनि मासु नपठाउनुहोस्।' }),
    { icon: 'food', title: { en: 'Seeds, honey and dairy', ne: 'बिउ, मह र दुग्धजन्य' }, note: { en: 'Commonly refused by New Zealand biosecurity.', ne: 'न्युजिल्यान्ड बायोसेक्युरिटीले प्रायः अस्वीकार गर्छ।' } },
    dangerous,
  ],
  receiver: {
    lead: { en: 'New Zealand addresses use the suburb and a 4-digit postcode.', ne: 'न्युजिल्यान्डको ठेगानामा सबर्ब र ४ अङ्कको पोस्टकोड हुन्छ।' },
    needs: [
      { en: 'Full name', ne: 'पूरा नाम' },
      { en: 'Street number and name', ne: 'सडक नम्बर र नाम' },
      { en: 'Suburb, city and 4-digit postcode', ne: 'सबर्ब, सहर र ४ अङ्कको पोस्टकोड' },
      { en: 'NZ mobile (02X)', ne: 'NZ मोबाइल (02X)' },
    ],
    addressExample: ['Sunita Karki', '15 Dominion Road', 'Mount Eden', 'Auckland 1024', 'New Zealand', '+64 21 123 4567'],
    tip: { en: 'The suburb line is important; many streets share names across cities.', ne: 'सबर्बको लाइन महत्वपूर्ण छ; धेरै सहरमा एउटै नामका सडक हुन्छन्।' },
  },
  arrival: {
    customs: { en: 'NZ Customs and biosecurity inspect the parcel. The receiver pays any duty or GST.', ne: 'NZ भन्सार र बायोसेक्युरिटीले जाँच्छन्। कर वा GST प्रापकले तिर्छन्।' },
    delivery: { en: 'A local courier delivers to the door.', ne: 'स्थानीय कुरियरले घरसम्म ल्याउँछ।' },
  },
  faqs: [
    {
      q: { en: 'Can I send food to New Zealand?', ne: 'न्युजिल्यान्डमा खाना पठाउन मिल्छ?' },
      a: { en: 'Sealed, shop-packed food that is declared has the best chance. Meat, seeds and homemade food are usually refused.', ne: 'सिल गरिएको, पसलमा प्याक भएको र घोषणा गरिएको खानाको सम्भावना राम्रो हुन्छ। मासु, बिउ र घरको खाना प्रायः अस्वीकार हुन्छ।' },
    },
    {
      q: { en: 'Who pays GST in New Zealand?', ne: 'न्युजिल्यान्डमा GST कसले तिर्छ?' },
      a: { en: 'The receiver, if it applies.', ne: 'लागेमा प्रापकले।' },
    },
  ],
  order: ['intro', 'avoid', 'send', 'receiver', 'price', 'journey', 'checklist', 'faq', 'track'],
};

export const usa: CountryGuide = {
  slug: 'nepal-to-usa',
  code: 'us',
  name: { en: 'United States', ne: 'अमेरिका' },
  region: 'north-america',
  rateCountry: 'USA',
  hub: { city: { en: 'New York', ne: 'न्युयोर्क' }, lat: 40.71, lon: -74.01 },
  cities: ['New York', 'Dallas', 'San Francisco', 'Boston', 'Washington DC', 'Baltimore', 'Chicago'],
  currency: 'US dollar (USD)',
  blurb: {
    en: 'Food needs a clear list. The address needs a state and 5-digit ZIP.',
    ne: 'खानाको स्पष्ट सूची चाहिन्छ। ठेगानामा राज्य र ५ अङ्कको ZIP चाहिन्छ।',
  },
  seo: {
    title: 'Nepal to USA Parcel Guide: Food Rules, ZIP Codes, Prices | BC Cargo',
    description:
      'Send parcels from Nepal to the United States. What US customs and the FDA check on food, how to write an address with ZIP code, and live prices by weight.',
  },
  hero: {
    title: { en: 'Nepal to the United States, one honest list at a time.', ne: 'नेपालबाट अमेरिका, एउटा इमानदार सूचीसहित।' },
    lede: {
      en: 'From Queens to Dallas to the Bay Area, Nepali families in the US still want things from home. We send them, with the paperwork US customs expects.',
      ne: 'क्विन्सदेखि डलास र बे एरियासम्म, अमेरिकामा बस्ने नेपाली परिवार अझै घरको सामान चाहन्छन्। हामी अमेरिकी भन्सारले खोज्ने कागजसहित पठाउँछौं।',
    },
  },
  intro: [
    {
      en: 'US customs wants to know what is in the box and what it is worth. Food is also seen by the FDA, so we describe each food item plainly on the declaration.',
      ne: 'अमेरिकी भन्सारले बाकसमा के छ र कति मूल्यको छ भन्ने जान्न चाहन्छ। खाना FDA ले पनि हेर्छ, त्यसैले हामी घोषणामा हरेक खानाको सरल विवरण लेख्छौं।',
    },
  ],
  exampleKg: 5,
  send: [
    clothes({ en: 'Clothes, shoes, saris and daura suruwal for weddings and festivals.', ne: 'बिहे र चाडपर्वका लागि लुगा, जुत्ता, सारी र दौरा सुरुवाल।' }),
    dryFood({ en: 'Sealed spices, tea and snacks with labels. Each one is listed on the declaration.', ne: 'लेबल भएको सिल गरिएको मसला, चिया र खाजा। हरेक घोषणामा लेखिन्छ।' }),
    documents({ en: 'Certificates for credential evaluation, flat in a sleeve.', ne: 'शैक्षिक मूल्याङ्कनका लागि प्रमाणपत्र, खोलमा सिधा राखेर।' }),
    gifts({ en: 'Puja items, photo frames and small household things.', ne: 'पूजाका सामान, फोटो फ्रेम र साना घरायसी सामान।' }),
    medicine({ en: 'Personal use only, with the prescription in the box.', ne: 'व्यक्तिगत प्रयोगका लागि मात्र, प्रेस्क्रिप्सन बाकसभित्र राखेर।' }),
  ],
  avoid: [
    noMeat({ en: 'Meat products from Nepal are not allowed into the US.', ne: 'नेपालबाट मासुजन्य सामान अमेरिका भित्र्याउन पाइँदैन।' }),
    { icon: 'food', title: { en: 'Fresh produce and seeds', ne: 'ताजा उत्पादन र बिउ' }, note: { en: 'US agriculture inspection stops them.', ne: 'अमेरिकी कृषि निरीक्षणले रोक्छ।' } },
    dangerous,
    fakesAndCash,
  ],
  receiver: {
    lead: { en: 'US addresses end with city, two-letter state code and ZIP.', ne: 'अमेरिकी ठेगाना सहर, दुई अक्षरको राज्य कोड र ZIP ले टुङ्गिन्छ।' },
    needs: [
      { en: 'Full name', ne: 'पूरा नाम' },
      { en: 'Street address with apartment number', ne: 'अपार्टमेन्ट नम्बरसहित सडक ठेगाना' },
      { en: 'City, state code (NY, TX, CA...) and 5-digit ZIP', ne: 'सहर, राज्य कोड (NY, TX, CA...) र ५ अङ्कको ZIP' },
      { en: 'US phone number', ne: 'अमेरिकी फोन नम्बर' },
    ],
    addressExample: ['Rajesh Tamang', '37-15 74th Street, Apt 3B', 'Jackson Heights, NY 11372', 'United States', '+1 718 555 0142'],
    tip: { en: 'Put "Apt" on the same line as the street. Missing apartment numbers cause most failed deliveries.', ne: '"Apt" सडककै लाइनमा लेख्नुहोस्। अपार्टमेन्ट नम्बर नहुँदा धेरै डेलिभरी असफल हुन्छन्।' },
  },
  arrival: {
    customs: { en: 'US Customs and Border Protection checks the parcel; food may also be reviewed by the FDA. Any duty is paid by the receiver.', ne: 'अमेरिकी भन्सार तथा सीमा सुरक्षाले जाँच्छ; खाना FDA ले पनि हेर्न सक्छ। कर लागेमा प्रापकले तिर्छन्।' },
    delivery: { en: 'A US courier delivers, often leaving parcels at the door or with the building office.', ne: 'अमेरिकी कुरियरले ल्याउँछ, प्रायः ढोकामा वा भवनको अफिसमा छोड्छ।' },
  },
  faqs: [
    {
      q: { en: 'Can I send food to the US?', ne: 'अमेरिकामा खाना पठाउन मिल्छ?' },
      a: { en: 'Sealed, labelled dry food is usually fine when listed on the declaration. Meat is not.', ne: 'घोषणामा लेखिएको, लेबल भएको सिल गरिएको सुख्खा खाना प्रायः मिल्छ। मासु मिल्दैन।' },
    },
    {
      q: { en: 'Who pays US duty?', ne: 'अमेरिकी कर कसले तिर्छ?' },
      a: { en: 'The receiver, if any is charged. Our price covers packing, boxes and the flight.', ne: 'लागेमा प्रापकले। हाम्रो मूल्यमा प्याकिङ, बाकस र ढुवानी पर्छ।' },
    },
  ],
};

export const canada: CountryGuide = {
  slug: 'nepal-to-canada',
  code: 'ca',
  name: { en: 'Canada', ne: 'क्यानडा' },
  region: 'north-america',
  rateCountry: 'Canada',
  hub: { city: { en: 'Toronto', ne: 'टोरन्टो' }, lat: 43.65, lon: -79.38 },
  cities: ['Toronto', 'Calgary', 'Vancouver', 'Montreal', 'Edmonton', 'Ottawa', 'Winnipeg'],
  currency: 'Canadian dollar (CAD)',
  blurb: {
    en: 'Postal code is six characters (A1A 1A1). Food rules are close to the US.',
    ne: 'पोस्टल कोड छ अक्षरको हुन्छ (A1A 1A1)। खानाका नियम अमेरिकाजस्तै।',
  },
  seo: {
    title: 'Nepal to Canada Courier: Prices, Postal Codes and Rules | BC Cargo',
    description:
      'Send parcels from Nepal to Canada. How to write a Canadian postal code, what CFIA allows in food, and live prices by weight.',
  },
  hero: {
    title: { en: 'Something warm from Nepal, for a Canadian winter.', ne: 'क्यानडाको जाडोका लागि नेपालबाट केही न्यानो।' },
    lede: {
      en: 'Students in Toronto, families in Calgary and Vancouver. Here is what to pack, how to write the address, and what it costs today.',
      ne: 'टोरन्टोका विद्यार्थी, क्यालगरी र भ्यानकुभरका परिवार। के प्याक गर्ने, ठेगाना कसरी लेख्ने र आज कति लाग्छ भन्ने यहाँ छ।',
    },
  },
  intro: [
    {
      en: 'Canada splits the check between the border agency (CBSA) and the food inspection agency (CFIA). For you that means: list every food item, and leave meat out.',
      ne: 'क्यानडामा जाँच सीमा निकाय (CBSA) र खाद्य निरीक्षण निकाय (CFIA) बीच बाँडिन्छ। तपाईंका लागि यसको अर्थ: हरेक खाना सूचीमा लेख्नुहोस् र मासु नराख्नुहोस्।',
    },
  ],
  exampleKg: 10,
  send: [
    clothes({ en: 'Wool, pashmina and sweaters are welcome in a Canadian winter.', ne: 'ऊन, पश्मिना र स्वेटर क्यानडाको जाडोमा काम लाग्छन्।' }),
    dryFood({ en: 'Packed spices, tea and sweets, labelled and listed.', ne: 'लेबल भएको र सूचीमा लेखिएको प्याक गरिएको मसला, चिया र मिठाई।' }),
    documents({ en: 'Certificates for study permits and job applications.', ne: 'अध्ययन अनुमति र जागिरका लागि प्रमाणपत्र।' }),
    crafts({ en: 'Pashmina and singing bowls are common gifts.', ne: 'पश्मिना र सिंगिङ बाउल सामान्य उपहार हुन्।' }),
  ],
  avoid: [
    noMeat({ en: 'Meat products are not allowed into Canada from Nepal.', ne: 'नेपालबाट मासुजन्य सामान क्यानडा भित्र्याउन पाइँदैन।' }),
    { icon: 'food', title: { en: 'Fresh fruit, seeds and soil', ne: 'ताजा फलफूल, बिउ र माटो' }, note: { en: 'CFIA stops them.', ne: 'CFIA ले रोक्छ।' } },
    dangerous,
  ],
  receiver: {
    lead: { en: 'Canadian postal codes mix letters and numbers: A1A 1A1.', ne: 'क्यानडाको पोस्टल कोडमा अक्षर र अङ्क मिसिन्छ: A1A 1A1।' },
    needs: [
      { en: 'Full name', ne: 'पूरा नाम' },
      { en: 'Unit and street address', ne: 'युनिट र सडक ठेगाना' },
      { en: 'City, province code (ON, AB, BC...) and postal code', ne: 'सहर, प्रान्त कोड (ON, AB, BC...) र पोस्टल कोड' },
      { en: 'Canadian phone number', ne: 'क्यानडाली फोन नम्बर' },
    ],
    addressExample: ['Kiran Poudel', '1205-25 Silver Springs Blvd', 'Scarborough ON M1V 1M4', 'Canada', '+1 416 555 0193'],
    tip: { en: 'In Canada "1205-25" means unit 1205 at number 25. Keep it in that order.', ne: 'क्यानडामा "1205-25" को अर्थ २५ नम्बरको १२०५ युनिट हो। यही क्रममा लेख्नुहोस्।' },
  },
  arrival: {
    customs: { en: 'CBSA and CFIA check the parcel. The receiver pays any duty or tax.', ne: 'CBSA र CFIA ले जाँच्छन्। कर प्रापकले तिर्छन्।' },
    delivery: { en: 'A Canadian courier delivers; apartment buildings often hold parcels at the front desk.', ne: 'क्यानडाली कुरियरले ल्याउँछ; अपार्टमेन्टमा प्रायः रिसेप्सनमा राखिन्छ।' },
  },
  faqs: [
    {
      q: { en: 'What does a Canadian postal code look like?', ne: 'क्यानडाको पोस्टल कोड कस्तो हुन्छ?' },
      a: { en: 'Letter-number-letter, space, number-letter-number. For example M1V 1M4.', ne: 'अक्षर-अङ्क-अक्षर, खाली ठाउँ, अङ्क-अक्षर-अङ्क। जस्तै M1V 1M4।' },
    },
    {
      q: { en: 'Can I send samples for a business?', ne: 'व्यापारका लागि नमुना पठाउन मिल्छ?' },
      a: { en: 'Yes. Mark them as samples with a value. Larger commercial loads may need more paperwork; ask us.', ne: 'मिल्छ। मूल्यसहित नमुना भनेर लेख्नुहोस्। ठूलो व्यापारिक मालका लागि थप कागज चाहिन सक्छ; सोध्नुहोस्।' },
    },
  ],
};

export const FAR_GUIDES = [australia, newZealand, usa, canada];
