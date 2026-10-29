import type { Bi, CountryGuide, GuideItem } from './types';
import { clothes, documents, dryFood, liquids, noMeat, dangerous } from './common';

/** Gulf routes: addresses work differently in each country, and medicine rules are strict everywhere. */

const gulfMedicine: GuideItem = {
  icon: 'medicine',
  title: { en: 'Medicine without a prescription', ne: 'प्रेस्क्रिप्सन बिनाको औषधि' },
  note: {
    en: 'Gulf countries control many common medicines, including some painkillers and sleeping tablets. Send a photo of each packet to us before you pack.',
    ne: 'खाडी देशहरूले धेरै सामान्य औषधि नियन्त्रण गर्छन्, केही दुखाइ कम गर्ने र निद्राका चक्की पनि। प्याक गर्नुअघि हरेक प्याकेटको फोटो पठाउनुहोस्।',
  },
};

const noAlcohol: GuideItem = {
  icon: 'liquid',
  title: { en: 'Alcohol and pork', ne: 'मदिरा र सुँगुरको मासु' },
  note: { en: 'Not allowed. That includes raksi and anything containing pork.', ne: 'अनुमति छैन। रक्सी र सुँगुर भएको कुनै पनि सामान पनि।' },
};

const religiousItems = (country: Bi): GuideItem => ({
  icon: 'personal',
  title: { en: 'Books, idols and printed material', ne: 'किताब, मूर्ति र छापिएका सामान' },
  note: {
    en: `Personal puja items are usually fine, but ${country.en} customs may open and check printed or religious material. Keep it to a small personal amount.`,
    ne: `व्यक्तिगत पूजाका सामान प्रायः ठीक हुन्छन्, तर ${country.ne} भन्सारले छापिएका वा धार्मिक सामान खोलेर जाँच्न सक्छ। थोरै, व्यक्तिगत मात्रामा राख्नुहोस्।`,
  },
});

export const uae: CountryGuide = {
  slug: 'nepal-to-uae',
  code: 'ae',
  name: { en: 'United Arab Emirates', ne: 'संयुक्त अरब इमिरेट्स (युएई)' },
  region: 'middle-east',
  rateCountry: 'UAE',
  hub: { city: { en: 'Dubai', ne: 'दुबई' }, lat: 25.2, lon: 55.27 },
  cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Al Ain', 'Ras Al Khaimah'],
  currency: 'UAE dirham (AED)',
  blurb: {
    en: 'No postcodes. The phone number and a landmark do the work.',
    ne: 'पोस्टकोड हुँदैन। फोन नम्बर र चिनारीले काम गर्छ।',
  },
  seo: {
    title: 'Nepal to Dubai & UAE Parcel: Prices and Rules | BC Cargo',
    description:
      'Send parcels from Nepal to Dubai, Abu Dhabi and Sharjah. Why the phone number matters more than the address, UAE medicine rules, and live prices by weight.',
  },
  hero: {
    title: { en: 'In the UAE, the courier calls before the address matters.', ne: 'युएईमा ठेगानाभन्दा पहिले कुरियरको फोन आउँछ।' },
    lede: {
      en: 'Camp in Jebel Ali, flat in Deira, villa in Abu Dhabi. UAE couriers find the receiver by phone, so a working number is half the job.',
      ne: 'जेबेल अलीको क्याम्प, देइराको फ्ल्याट, अबुधाबीको भिल्ला। युएईका कुरियरले फोनबाट प्रापक भेट्टाउँछन्, त्यसैले चल्ने नम्बर आधा काम हो।',
    },
  },
  intro: [
    {
      en: 'The UAE uses no postcodes and many buildings have no street number. Couriers call the receiver and ask for directions. If the number is off, the parcel waits.',
      ne: 'युएईमा पोस्टकोड हुँदैन र धेरै भवनको सडक नम्बर हुँदैन। कुरियरले प्रापकलाई फोन गरेर बाटो सोध्छन्। नम्बर बन्द भए पार्सल पर्खिन्छ।',
    },
  ],
  exampleKg: 5,
  send: [
    clothes({ en: 'Light clothes for the heat, and warm ones for winter evenings in the desert.', ne: 'गर्मीका लागि हल्का लुगा, र मरुभूमिको जाडो साँझका लागि न्यानो लुगा।' }),
    dryFood({ en: 'Masala, achar without meat, chiura and tea in sealed packs.', ne: 'सिल गरिएको प्याकमा मसला, मासु नभएको अचार, चिउरा र चिया।' }),
    liquids({ en: 'Ghee and oil sealed and upright; liquid boxes have a small fee.', ne: 'घिउ र तेल सिल गरी ठाडो राखेर; तरल बाकसमा थोरै शुल्क।' }),
    documents({ en: 'Certificates and passport copies for visa and job papers.', ne: 'भिसा र जागिरका लागि प्रमाणपत्र र राहदानीका प्रतिलिपि।' }),
  ],
  avoid: [gulfMedicine, noAlcohol, noMeat({ en: 'We do not take meat to the UAE.', ne: 'हामी युएईमा मासु लैजाँदैनौं।' }), dangerous],
  receiver: {
    lead: { en: 'Building, area and a phone that is switched on.', ne: 'भवन, क्षेत्र र खुला रहने फोन।' },
    needs: [
      { en: 'Full name as on their Emirates ID', ne: 'एमिरेट्स आईडीमा जस्तै पूरा नाम' },
      { en: 'Building or camp name, flat or room number', ne: 'भवन वा क्याम्पको नाम, फ्ल्याट वा कोठा नम्बर' },
      { en: 'Area and emirate (e.g. Al Nahda, Dubai)', ne: 'क्षेत्र र इमिरेट (जस्तै Al Nahda, Dubai)' },
      { en: 'UAE mobile (+971 5X) that they answer', ne: 'उठाउने युएई मोबाइल (+971 5X)' },
    ],
    addressExample: ['Dil Bahadur Gurung', 'Room 214, ABC Labour Camp', 'Jebel Ali Industrial Area 1', 'Dubai, UAE', 'Near: Ibn Battuta Metro', '+971 50 123 4567'],
    tip: { en: 'Add the nearest metro station or landmark. Couriers in the UAE use them all the time.', ne: 'नजिकको मेट्रो स्टेसन वा चिनारी थप्नुहोस्। युएईका कुरियरले यसैलाई प्रयोग गर्छन्।' },
  },
  arrival: {
    customs: { en: 'UAE customs screens every parcel, with particular attention to medicine. The receiver pays any duty.', ne: 'युएई भन्सारले हरेक पार्सल जाँच्छ, औषधिमा विशेष ध्यान दिन्छ। कर लागेमा प्रापकले तिर्छन्।' },
    delivery: { en: 'A local courier calls the receiver and delivers to the building or camp.', ne: 'स्थानीय कुरियरले प्रापकलाई फोन गरेर भवन वा क्याम्पसम्म ल्याउँछ।' },
  },
  faqs: [
    {
      q: { en: 'There is no postcode in Dubai. What do I write?', ne: 'दुबईमा पोस्टकोड छैन। के लेख्ने?' },
      a: { en: 'Building or camp, area, emirate and a landmark, plus a +971 number. That is how UAE couriers find people.', ne: 'भवन वा क्याम्प, क्षेत्र, इमिरेट र चिनारी, साथै +971 नम्बर। युएईका कुरियरले मान्छे यसरी नै भेट्छन्।' },
    },
    {
      q: { en: 'Can I send medicine to Dubai?', ne: 'दुबईमा औषधि पठाउन मिल्छ?' },
      a: { en: 'Some, with a prescription. Several common medicines are controlled in the UAE, so show us the packets first.', ne: 'केही, प्रेस्क्रिप्सनसहित। युएईमा धेरै सामान्य औषधि नियन्त्रित छन्, त्यसैले पहिले प्याकेट देखाउनुहोस्।' },
    },
  ],
  order: ['intro', 'receiver', 'avoid', 'send', 'price', 'journey', 'checklist', 'faq', 'track'],
};

export const saudiArabia: CountryGuide = {
  slug: 'nepal-to-saudi-arabia',
  code: 'sa',
  name: { en: 'Saudi Arabia', ne: 'साउदी अरब' },
  region: 'middle-east',
  rateCountry: 'Saudi Arabia',
  hub: { city: { en: 'Riyadh', ne: 'रियाद' }, lat: 24.71, lon: 46.68 },
  cities: ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Jubail', 'Mecca', 'Medina'],
  currency: 'Saudi riyal (SAR)',
  blurb: {
    en: 'Ask the receiver for their National Address short code.',
    ne: 'प्रापकसँग नेसनल एड्रेसको छोटो कोड माग्नुहोस्।',
  },
  seo: {
    title: 'Send a Parcel from Nepal to Saudi Arabia: Prices and Rules | BC Cargo',
    description:
      'Parcels from Nepal to Riyadh, Jeddah and Dammam. How the Saudi National Address works, what customs refuses, and live prices by weight.',
  },
  hero: {
    title: { en: 'Saudi Arabia has an address code. Ask for it.', ne: 'साउदी अरबमा ठेगाना कोड हुन्छ। माग्नुहोस्।' },
    lede: {
      en: 'Most of our Saudi parcels go to workers in Riyadh, Jeddah and the Eastern Province. The National Address short code makes them much easier to deliver.',
      ne: 'हाम्रा धेरैजसो साउदी पार्सल रियाद, जेद्दा र पूर्वी प्रान्तमा काम गर्नेहरूकहाँ जान्छन्। नेसनल एड्रेसको छोटो कोडले डेलिभरी धेरै सजिलो बनाउँछ।',
    },
  },
  intro: [
    {
      en: 'Saudi Arabia gave every building a National Address: an 8-character short code (4 letters, 4 numbers) that points to it exactly. Most receivers can find theirs in the Saudi Post app or on their company papers.',
      ne: 'साउदी अरबले हरेक भवनलाई नेसनल एड्रेस दिएको छ: ८ अक्षरको छोटो कोड (४ अक्षर, ४ अङ्क) जसले ठ्याक्कै भवन देखाउँछ। धेरै प्रापकले Saudi Post एप वा कम्पनीको कागजमा आफ्नो कोड भेट्छन्।',
    },
  ],
  exampleKg: 5,
  send: [
    clothes({ en: 'Light cotton for work, plus something warm for winter nights.', ne: 'कामका लागि हल्का सुती, र जाडो रातका लागि केही न्यानो।' }),
    dryFood({ en: 'Masala, tea, chiura and sealed sweets.', ne: 'मसला, चिया, चिउरा र सिल गरिएको मिठाई।' }),
    documents({ en: 'Certificates and family papers in a plastic sleeve.', ne: 'प्लास्टिक खोलमा प्रमाणपत्र र परिवारका कागज।' }),
  ],
  avoid: [noAlcohol, gulfMedicine, religiousItems({ en: 'Saudi', ne: 'साउदी' }), noMeat({ en: 'We do not take meat to Saudi Arabia.', ne: 'हामी साउदी अरबमा मासु लैजाँदैनौं।' }), dangerous],
  receiver: {
    lead: { en: 'The short code first, then the usual lines.', ne: 'पहिले छोटो कोड, अनि सामान्य ठेगाना।' },
    needs: [
      { en: 'Full name as on their iqama', ne: 'इकामामा जस्तै पूरा नाम' },
      { en: 'National Address short code (e.g. RRRD2929)', ne: 'नेसनल एड्रेस छोटो कोड (जस्तै RRRD2929)' },
      { en: 'Building number, street, district and city', ne: 'भवन नम्बर, सडक, जिल्ला र सहर' },
      { en: 'Saudi mobile (+966 5X)', ne: 'साउदी मोबाइल (+966 5X)' },
    ],
    addressExample: ['Min Bahadur Rai', 'Short code: RRRD2929', '2929 King Fahd Rd, Al Olaya', 'Riyadh 12212', 'Saudi Arabia', '+966 55 123 4567'],
    tip: { en: 'If the receiver lives in company housing, the company HR office usually knows the short code.', ne: 'प्रापक कम्पनीको आवासमा बस्नुहुन्छ भने कम्पनीको HR लाई प्रायः छोटो कोड थाहा हुन्छ।' },
  },
  arrival: {
    customs: { en: 'Saudi customs (ZATCA) inspects parcels, including printed and religious items. The receiver pays any duty.', ne: 'साउदी भन्सार (ZATCA) ले छापिएका र धार्मिक सामानसहित पार्सल जाँच्छ। कर लागेमा प्रापकले तिर्छन्।' },
    delivery: { en: 'A local courier delivers using the National Address and calls the receiver.', ne: 'स्थानीय कुरियरले नेसनल एड्रेस प्रयोग गरी प्रापकलाई फोन गरेर ल्याउँछ।' },
  },
  faqs: [
    {
      q: { en: 'What is the Saudi National Address?', ne: 'साउदी नेसनल एड्रेस भनेको के हो?' },
      a: { en: 'An address system with a short code for each building. It is the most reliable way to get a parcel delivered in Saudi Arabia.', ne: 'हरेक भवनको छोटो कोड भएको ठेगाना प्रणाली। साउदीमा पार्सल पुर्‍याउने सबैभन्दा भरपर्दो तरिका यही हो।' },
    },
    {
      q: { en: 'Can I send a puja book or idol?', ne: 'पूजाको किताब वा मूर्ति पठाउन मिल्छ?' },
      a: { en: 'Small personal items usually go through, but customs may open them. Keep the amount small and personal.', ne: 'साना व्यक्तिगत सामान प्रायः जान्छन्, तर भन्सारले खोल्न सक्छ। थोरै र व्यक्तिगत राख्नुहोस्।' },
    },
  ],
};

export const qatar: CountryGuide = {
  slug: 'nepal-to-qatar',
  code: 'qa',
  name: { en: 'Qatar', ne: 'कतार' },
  region: 'middle-east',
  rateCountry: 'Qatar',
  hub: { city: { en: 'Doha', ne: 'दोहा' }, lat: 25.29, lon: 51.53 },
  cities: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Lusail', 'Al Khor', 'Industrial Area'],
  currency: 'Qatari riyal (QAR)',
  blurb: {
    en: 'Use the zone, street and building numbers from the blue plate.',
    ne: 'निलो प्लेटको जोन, सडक र भवन नम्बर प्रयोग गर्नुहोस्।',
  },
  seo: {
    title: 'Nepal to Qatar Parcel: Blue Plate Address, Prices, Rules | BC Cargo',
    description:
      'Send parcels from Nepal to Doha and the Industrial Area. How to read the Qatar blue plate address, what not to send, and live prices by weight.',
  },
  hero: {
    title: { en: 'Doha addresses are on a blue plate. Ask for three numbers.', ne: 'दोहाको ठेगाना निलो प्लेटमा हुन्छ। तीन नम्बर माग्नुहोस्।' },
    lede: {
      en: 'Zone, street, building. Every building in Qatar has them on a blue sign by the door. With those and a phone number, your parcel finds its way.',
      ne: 'जोन, सडक, भवन। कतारका हरेक भवनको ढोकानजिक निलो बोर्डमा यी हुन्छन्। यी र फोन नम्बर भए पार्सलले बाटो भेट्छ।',
    },
  },
  intro: [
    {
      en: 'A lot of Nepalis in Qatar live in company accommodation in the Industrial Area or Al Wakrah. Those camps get many parcels, so the room number and company name matter.',
      ne: 'कतारमा धेरै नेपाली इन्डस्ट्रियल एरिया वा अल वक्रामा कम्पनीको आवासमा बस्छन्। ती क्याम्पमा धेरै पार्सल आउँछन्, त्यसैले कोठा नम्बर र कम्पनीको नाम महत्वपूर्ण हुन्छ।',
    },
  ],
  exampleKg: 5,
  send: [
    clothes({ en: 'Work clothes, light cotton and festival wear.', ne: 'कामका लुगा, हल्का सुती र चाडपर्वका लुगा।' }),
    dryFood({ en: 'Sealed masala, tea and snacks.', ne: 'सिल गरिएको मसला, चिया र खाजा।' }),
    documents({ en: 'Certificates and family documents.', ne: 'प्रमाणपत्र र परिवारका कागज।' }),
  ],
  avoid: [noAlcohol, gulfMedicine, religiousItems({ en: 'Qatari', ne: 'कतारी' }), noMeat({ en: 'We do not take meat to Qatar.', ne: 'हामी कतारमा मासु लैजाँदैनौं।' }), dangerous],
  receiver: {
    lead: { en: 'Read the blue plate on the building.', ne: 'भवनको निलो प्लेट पढ्नुहोस्।' },
    needs: [
      { en: 'Full name as on their QID', ne: 'QID मा जस्तै पूरा नाम' },
      { en: 'Zone, street and building numbers', ne: 'जोन, सडक र भवन नम्बर' },
      { en: 'Company name and room number for camps', ne: 'क्याम्प भए कम्पनीको नाम र कोठा नम्बर' },
      { en: 'Qatar mobile (+974, 8 digits)', ne: 'कतार मोबाइल (+974, ८ अङ्क)' },
    ],
    addressExample: ['Ganesh Shrestha', 'c/o XYZ Contracting, Room 31', 'Building 45, Street 24, Zone 57', 'Industrial Area, Doha', 'Qatar', '+974 5512 3456'],
    tip: { en: 'A photo of the blue plate sent by the receiver is all we need to get the address right.', ne: 'प्रापकले पठाएको निलो प्लेटको फोटोले ठेगाना मिलाउन पुग्छ।' },
  },
  arrival: {
    customs: { en: 'Qatar customs inspects the parcel. The receiver pays any duty.', ne: 'कतार भन्सारले पार्सल जाँच्छ। कर लागेमा प्रापकले तिर्छन्।' },
    delivery: { en: 'A local courier calls and delivers to the building or camp gate.', ne: 'स्थानीय कुरियरले फोन गरी भवन वा क्याम्पको गेटसम्म ल्याउँछ।' },
  },
  faqs: [
    {
      q: { en: 'What is the blue plate address?', ne: 'निलो प्लेट ठेगाना भनेको के हो?' },
      a: { en: 'Each building in Qatar has a blue sign with its zone, street and building number. Those three numbers are the address.', ne: 'कतारका हरेक भवनमा जोन, सडक र भवन नम्बर लेखिएको निलो बोर्ड हुन्छ। ती तीन नम्बर नै ठेगाना हो।' },
    },
    {
      q: { en: 'Can I send to a labour camp?', ne: 'लेबर क्याम्पमा पठाउन मिल्छ?' },
      a: { en: 'Yes. Add the company name and room, and make sure the receiver answers the phone.', ne: 'मिल्छ। कम्पनीको नाम र कोठा थप्नुहोस्, र प्रापकले फोन उठाउने निश्चित गर्नुहोस्।' },
    },
  ],
};

export const kuwait: CountryGuide = {
  slug: 'nepal-to-kuwait',
  code: 'kw',
  name: { en: 'Kuwait', ne: 'कुवेत' },
  region: 'middle-east',
  rateCountry: 'Kuwait',
  hub: { city: { en: 'Kuwait City', ne: 'कुवेत सिटी' }, lat: 29.38, lon: 47.99 },
  cities: ['Kuwait City', 'Hawalli', 'Salmiya', 'Farwaniya', 'Jahra', 'Ahmadi', 'Mangaf'],
  currency: 'Kuwaiti dinar (KWD)',
  blurb: {
    en: 'Addresses go by area, block, street and house.',
    ne: 'ठेगाना क्षेत्र, ब्लक, सडक र घर नम्बरअनुसार हुन्छ।',
  },
  seo: {
    title: 'Nepal to Kuwait Courier: Address Format, Rules, Prices | BC Cargo',
    description:
      'Send parcels from Nepal to Kuwait. How to write an area-block-street address, what Kuwaiti customs refuses, and live prices by weight.',
  },
  hero: {
    title: { en: 'Area, block, street, house. Kuwait in four lines.', ne: 'क्षेत्र, ब्लक, सडक, घर। कुवेत चार लाइनमा।' },
    lede: {
      en: 'Many Nepalis in Kuwait work in homes, hotels and hospitals. We send them food, clothes and papers from home.',
      ne: 'कुवेतमा धेरै नेपाली घर, होटल र अस्पतालमा काम गर्छन्। हामी उहाँहरूलाई घरको खाना, लुगा र कागज पठाउँछौं।',
    },
  },
  intro: [
    {
      en: 'If the receiver works in a household, the parcel goes to the employer’s house. Ask them to check with the family that a delivery is fine and to give the full block and house number.',
      ne: 'प्रापक घरमा काम गर्नुहुन्छ भने पार्सल रोजगारदाताको घरमा जान्छ। डेलिभरी ठीक छ कि छैन परिवारसँग सोध्न र पूरा ब्लक र घर नम्बर दिन भन्नुहोस्।',
    },
  ],
  exampleKg: 3,
  send: [
    clothes({ en: 'Clothes and shoes; winters in Kuwait are colder than people expect.', ne: 'लुगा र जुत्ता; कुवेतको जाडो सोचेभन्दा चिसो हुन्छ।' }),
    dryFood({ en: 'Sealed masala, tea and snacks.', ne: 'सिल गरिएको मसला, चिया र खाजा।' }),
    documents({ en: 'Certificates and family papers.', ne: 'प्रमाणपत्र र परिवारका कागज।' }),
  ],
  avoid: [noAlcohol, gulfMedicine, noMeat({ en: 'We do not take meat to Kuwait.', ne: 'हामी कुवेतमा मासु लैजाँदैनौं।' }), dangerous],
  receiver: {
    lead: { en: 'Kuwaiti addresses are built from numbered blocks.', ne: 'कुवेती ठेगाना नम्बर गरिएका ब्लकबाट बन्छ।' },
    needs: [
      { en: 'Full name as on their civil ID', ne: 'सिभिल आईडीमा जस्तै पूरा नाम' },
      { en: 'Area, block, street and house or building number', ne: 'क्षेत्र, ब्लक, सडक र घर वा भवन नम्बर' },
      { en: 'Floor and flat if it is an apartment', ne: 'अपार्टमेन्ट भए तल्ला र फ्ल्याट' },
      { en: 'Kuwait mobile (+965, 8 digits)', ne: 'कुवेत मोबाइल (+965, ८ अङ्क)' },
    ],
    addressExample: ['Laxmi Tamang', 'Salmiya, Block 10, Street 5', 'Building 22, Floor 3, Flat 8', 'Kuwait', '+965 6012 3456'],
    tip: { en: 'Kuwait has no everyday postcodes. The block number is the key piece.', ne: 'कुवेतमा सामान्य प्रयोगमा पोस्टकोड हुँदैन। ब्लक नम्बर नै मुख्य हो।' },
  },
  arrival: {
    customs: { en: 'Kuwaiti customs inspects the parcel. The receiver pays any duty.', ne: 'कुवेती भन्सारले पार्सल जाँच्छ। कर लागेमा प्रापकले तिर्छन्।' },
    delivery: { en: 'A local courier calls the receiver and delivers.', ne: 'स्थानीय कुरियरले प्रापकलाई फोन गरेर ल्याउँछ।' },
  },
  faqs: [
    {
      q: { en: 'Can I send to the house where my sister works?', ne: 'दिदी काम गर्ने घरमा पठाउन मिल्छ?' },
      a: { en: 'Yes, if the family agrees. Use her name, the full block and house number, and her own phone if she has one.', ne: 'मिल्छ, परिवार सहमत भए। उहाँको नाम, पूरा ब्लक र घर नम्बर, र उहाँको आफ्नै फोन भए त्यो दिनुहोस्।' },
    },
    {
      q: { en: 'Who pays duty in Kuwait?', ne: 'कुवेतमा कर कसले तिर्छ?' },
      a: { en: 'The receiver, if any is charged.', ne: 'लागेमा प्रापकले।' },
    },
  ],
};

export const bahrain: CountryGuide = {
  slug: 'nepal-to-bahrain',
  code: 'bh',
  name: { en: 'Bahrain', ne: 'बहराइन' },
  region: 'middle-east',
  rateCountry: 'Bahrain',
  hub: { city: { en: 'Manama', ne: 'मनामा' }, lat: 26.23, lon: 50.59 },
  cities: ['Manama', 'Muharraq', 'Riffa', 'Isa Town', 'Hamad Town', 'Sitra'],
  currency: 'Bahraini dinar (BHD)',
  blurb: {
    en: 'Address by building, road and block. Small country, quick local delivery.',
    ne: 'भवन, रोड र ब्लकअनुसार ठेगाना। सानो देश, छिटो स्थानीय डेलिभरी।',
  },
  seo: {
    title: 'Sending Parcels from Nepal to Bahrain | BC Cargo',
    description:
      'Send parcels from Nepal to Manama and across Bahrain. How the building-road-block address works, what customs checks, and live prices by weight.',
  },
  hero: {
    title: { en: 'Bahrain is small. The address still has three numbers.', ne: 'बहराइन सानो छ। तर ठेगानामा तीन नम्बर हुन्छ।' },
    lede: {
      en: 'Building, road, block. Give the courier those and a phone number, and a parcel from Nepal reaches anywhere on the island.',
      ne: 'भवन, रोड, ब्लक। कुरियरलाई यी र फोन नम्बर दिनुहोस्, नेपालबाट आएको पार्सल टापुभरि जहाँ पनि पुग्छ।',
    },
  },
  intro: [
    {
      en: 'Every address in Bahrain is a building number, a road number and a block number. They are on a sign near the door. That is all the courier needs.',
      ne: 'बहराइनमा हरेक ठेगाना भवन नम्बर, रोड नम्बर र ब्लक नम्बर हो। ढोकानजिकको बोर्डमा हुन्छन्। कुरियरलाई यति भए पुग्छ।',
    },
  ],
  exampleKg: 3,
  send: [
    clothes({ en: 'Light clothes and festival wear.', ne: 'हल्का लुगा र चाडपर्वका लुगा।' }),
    dryFood({ en: 'Sealed spices, tea and snacks.', ne: 'सिल गरिएको मसला, चिया र खाजा।' }),
    documents({ en: 'Certificates and personal papers.', ne: 'प्रमाणपत्र र व्यक्तिगत कागज।' }),
  ],
  avoid: [noAlcohol, gulfMedicine, noMeat({ en: 'We do not take meat to Bahrain.', ne: 'हामी बहराइनमा मासु लैजाँदैनौं।' }), dangerous],
  receiver: {
    lead: { en: 'Building, road and block, like this:', ne: 'भवन, रोड र ब्लक, यसरी:' },
    needs: [
      { en: 'Full name as on their CPR card', ne: 'CPR कार्डमा जस्तै पूरा नाम' },
      { en: 'Flat, building, road and block numbers', ne: 'फ्ल्याट, भवन, रोड र ब्लक नम्बर' },
      { en: 'Area name (e.g. Gudaibiya, Manama)', ne: 'क्षेत्रको नाम (जस्तै Gudaibiya, Manama)' },
      { en: 'Bahrain mobile (+973, 8 digits)', ne: 'बहराइन मोबाइल (+973, ८ अङ्क)' },
    ],
    addressExample: ['Ramesh Lama', 'Flat 12, Building 1450', 'Road 3624, Block 336', 'Gudaibiya, Manama', 'Bahrain', '+973 3612 3456'],
    tip: { en: 'Do not mix up road and block. The block is usually the 3-digit one.', ne: 'रोड र ब्लक नमिसाउनुहोस्। ब्लक प्रायः ३ अङ्कको हुन्छ।' },
  },
  arrival: {
    customs: { en: 'Bahrain customs inspects the parcel. The receiver pays any duty.', ne: 'बहराइन भन्सारले पार्सल जाँच्छ। कर लागेमा प्रापकले तिर्छन्।' },
    delivery: { en: 'A local courier delivers, usually after a phone call.', ne: 'स्थानीय कुरियरले प्रायः फोन गरेर ल्याउँछ।' },
  },
  faqs: [
    {
      q: { en: 'Does Bahrain use postcodes?', ne: 'बहराइनमा पोस्टकोड हुन्छ?' },
      a: { en: 'Not in everyday addresses. The block number does that job.', ne: 'सामान्य ठेगानामा हुँदैन। ब्लक नम्बरले त्यो काम गर्छ।' },
    },
    {
      q: { en: 'Can I send medicine?', ne: 'औषधि पठाउन मिल्छ?' },
      a: { en: 'Some, with a prescription. Show us the packets first; Gulf rules on medicine are strict.', ne: 'केही, प्रेस्क्रिप्सनसहित। पहिले प्याकेट देखाउनुहोस्; खाडीमा औषधिका नियम कडा छन्।' },
    },
  ],
};

export const GULF_GUIDES = [uae, saudiArabia, qatar, kuwait, bahrain];
