import type { Bi, CountryGuide, GuideFaq } from './types';
import { clothes, documents, dryFood, crafts, medicine, meatAllowed, dangerous, fakesAndCash, liquids } from './common';

/**
 * UK, Malta, Cyprus and the EU countries on our EU A / EU B price lists.
 * Meat (sukuti) is accepted on all of these routes in our rate sheet, with its own per-kg fee.
 */

const freshProduce = {
  icon: 'food' as const,
  title: { en: 'Fresh fruit, vegetables and plants', ne: 'ताजा फलफूल, तरकारी र बिरुवा' },
  note: { en: 'Plant health rules stop them at the border.', ne: 'बिरुवा स्वास्थ्य नियमले सीमामै रोक्छ।' },
};

export const uk: CountryGuide = {
  slug: 'nepal-to-united-kingdom',
  code: 'gb',
  name: { en: 'United Kingdom', ne: 'बेलायत (युके)' },
  region: 'europe',
  rateCountry: 'UK',
  hub: { city: { en: 'London', ne: 'लन्डन' }, lat: 51.51, lon: -0.13 },
  cities: ['London', 'Reading', 'Aldershot', 'Farnborough', 'Birmingham', 'Manchester', 'Ashford', 'Plumstead'],
  currency: 'Pound sterling (GBP)',
  blurb: {
    en: 'Sukuti allowed with a per-kg fee. Postcode is everything; gifts over £39 may pay VAT.',
    ne: 'प्रति केजी शुल्कमा सुकुटी जान्छ। पोस्टकोड नै मुख्य; £39 भन्दा बढीका उपहारमा VAT लाग्न सक्छ।',
  },
  seo: {
    title: 'Nepal to UK Parcel Guide: Sukuti, VAT, Postcodes, Prices | BC Cargo',
    description:
      'Send parcels from Nepal to the UK, including sukuti on our meat service. Live prices by weight, the £39 gift rule for VAT, and how to write a UK postcode.',
  },
  hero: {
    title: { en: 'For Aldershot, Reading, Plumstead, and everywhere in between.', ne: 'एल्डरसट, रिडिङ, प्लमस्टेड, र बीचका सबै ठाउँका लागि।' },
    lede: {
      en: 'The UK has one of the oldest Nepali communities abroad, from Gurkha families to students. We send them home food, sukuti included, clothes and papers.',
      ne: 'बेलायतमा विदेशको सबैभन्दा पुरानो नेपाली समुदायमध्ये एक छ, गोर्खा परिवारदेखि विद्यार्थीसम्म। हामी उहाँहरूलाई सुकुटीसहित घरको खाना, लुगा र कागज पठाउँछौं।',
    },
  },
  intro: [
    {
      en: 'Two things make UK parcels smooth: the postcode, which tells the courier almost the exact street, and an honest value on the declaration.',
      ne: 'बेलायतको पार्सल सहज बनाउने दुई कुरा: पोस्टकोड, जसले कुरियरलाई लगभग ठ्याक्कै सडक बताउँछ, र घोषणामा इमानदार मूल्य।',
    },
    {
      en: 'Gifts from one person to another worth £39 or less usually pay no VAT. Above that, the receiver may get a bill from the courier before delivery.',
      ne: 'एक व्यक्तिले अर्कोलाई पठाएको £39 वा कम मूल्यको उपहारमा प्रायः VAT लाग्दैन। त्योभन्दा बढी भए डेलिभरीअघि प्रापकलाई कुरियरबाट बिल आउन सक्छ।',
    },
  ],
  exampleKg: 10,
  send: [
    meatAllowed({
      en: 'Sukuti and dried meat go to the UK with an extra fee per kg of meat. Vacuum-packed travels best.',
      ne: 'सुकुटी र सुकाएको मासु बेलायतमा मासुको प्रति केजी थप शुल्कमा जान्छ। भ्याकुम प्याक भए राम्रो।',
    }),
    dryFood({ en: 'Gundruk, masala, achar and tea, sealed and labelled.', ne: 'गुन्द्रुक, मसला, अचार र चिया, सिल र लेबल गरेर।' }),
    clothes({ en: 'Festival clothes, daura suruwal, and warm layers for the damp winters.', ne: 'चाडपर्वका लुगा, दौरा सुरुवाल र ओसिलो जाडोका लागि न्यानो लुगा।' }),
    documents({ en: 'Certificates, pension and family papers, flat in a sleeve.', ne: 'प्रमाणपत्र, पेन्सन र परिवारका कागज, खोलमा सिधा।' }),
    liquids({ en: 'Ghee and oil, sealed and upright, with the liquid fee per box.', ne: 'घिउ र तेल, सिल गरी ठाडो, प्रति बाकस तरल शुल्कसहित।' }),
  ],
  avoid: [freshProduce, dangerous, fakesAndCash],
  receiver: {
    lead: { en: 'Get the postcode exactly right. It does most of the work.', ne: 'पोस्टकोड ठ्याक्कै मिलाउनुहोस्। धेरै काम त्यसैले गर्छ।' },
    needs: [
      { en: 'Full name', ne: 'पूरा नाम' },
      { en: 'House number and street', ne: 'घर नम्बर र सडक' },
      { en: 'Town and postcode (e.g. GU11 1AA)', ne: 'सहर र पोस्टकोड (जस्तै GU11 1AA)' },
      { en: 'UK mobile (07XXX)', ne: 'बेलायती मोबाइल (07XXX)' },
    ],
    addressExample: ['Hom Bahadur Gurung', '24 Victoria Road', 'Aldershot', 'GU11 1SS', 'United Kingdom', '+44 7700 900123'],
    tip: { en: 'UK postcodes have a space in the middle (GU11 1SS). Keep it.', ne: 'बेलायती पोस्टकोडको बीचमा खाली ठाउँ हुन्छ (GU11 1SS)। त्यो राख्नुहोस्।' },
  },
  arrival: {
    customs: {
      en: 'UK Border Force and HMRC check the parcel. If VAT or duty is due, the delivery company asks the receiver to pay it before handing over.',
      ne: 'बेलायती सीमा बल र HMRC ले जाँच्छन्। VAT वा कर लाग्ने भए डेलिभरी कम्पनीले हस्तान्तरणअघि प्रापकसँग तिर्न भन्छ।',
    },
    delivery: { en: 'A UK courier delivers, often with a text giving a one-hour window.', ne: 'बेलायती कुरियरले ल्याउँछ, प्रायः एक घण्टाको समय म्यासेजमा पठाउँछ।' },
  },
  faqs: [
    {
      q: { en: 'Can I send sukuti to the UK?', ne: 'बेलायतमा सुकुटी पठाउन मिल्छ?' },
      a: {
        en: 'Yes, on our meat service. The parcel is priced by weight, then the meat weight has an extra per-kg fee. Tick "meat" in the calculator to see it.',
        ne: 'मिल्छ, हाम्रो मासु सेवाबाट। पार्सल तौलअनुसार हिसाब हुन्छ, अनि मासुको तौलमा प्रति केजी थप शुल्क लाग्छ। क्याल्कुलेटरमा "मासु" छानेर हेर्नुहोस्।',
      },
    },
    {
      q: { en: 'Will the receiver pay VAT?', ne: 'प्रापकले VAT तिर्नुपर्छ?' },
      a: {
        en: 'For personal gifts worth £39 or less, usually not. Above that, VAT and sometimes duty apply, and the UK delivery company collects it.',
        ne: '£39 वा कम मूल्यका व्यक्तिगत उपहारमा प्रायः लाग्दैन। त्योभन्दा बढीमा VAT र कहिलेकाहीँ कर लाग्छ, बेलायती डेलिभरी कम्पनीले उठाउँछ।',
      },
    },
    {
      q: { en: 'Can I send gundruk and achar?', ne: 'गुन्द्रुक र अचार पठाउन मिल्छ?' },
      a: { en: 'Yes, sealed and double-bagged. Oily achar counts as liquid.', ne: 'मिल्छ, सिल गरी दोहोरो प्लास्टिकमा। तेलिलो अचार तरलमा गनिन्छ।' },
    },
  ],
  order: ['intro', 'send', 'price', 'receiver', 'avoid', 'journey', 'checklist', 'faq', 'track'],
};

/* ---------- EU and Mediterranean builder ---------- */

interface EuSpec {
  slug: string;
  code: string;
  name: Bi;
  rateCountry: string;
  hub: CountryGuide['hub'];
  cities: string[];
  currency: string;
  /** Who usually sends here, one or two sentences */
  story: Bi;
  heroTitle: Bi;
  postcode: Bi;
  addressExample: string[];
  phone: Bi;
  localTip: Bi;
  extraFaq?: GuideFaq;
  /** true for EU members (VAT + €45 gift rule) */
  eu?: boolean;
}

const euCustoms: Bi = {
  en: 'EU customs checks the parcel. Personal gifts worth up to about €45 are usually free of duty and VAT; above that the receiver may be asked to pay VAT before delivery.',
  ne: 'EU भन्सारले पार्सल जाँच्छ। करिब €45 सम्मका व्यक्तिगत उपहारमा प्रायः कर र VAT लाग्दैन; त्योभन्दा बढी भए डेलिभरीअघि प्रापकलाई VAT तिर्न भनिन सक्छ।',
};

const TITLES = [
  (c: string) => `Nepal to ${c} Parcel: Prices and Address Format | BC Cargo`,
  (c: string) => `Sending a Parcel from Nepal to ${c} | BC Cargo`,
  (c: string) => `${c} Courier from Nepal: Rates and Rules | BC Cargo`,
];

function europeGuide(s: EuSpec): CountryGuide {
  const n = s.name;
  const title = TITLES[[...s.slug].reduce((a, ch) => a + ch.charCodeAt(0), 0) % TITLES.length](n.en);
  return {
    slug: s.slug,
    code: s.code,
    name: n,
    region: 'europe',
    rateCountry: s.rateCountry,
    hub: s.hub,
    cities: s.cities,
    currency: s.currency,
    blurb: s.localTip,
    seo: {
      title,
      description: `Send parcels from Nepal to ${n.en} (${s.cities.slice(0, 2).join(', ')}). Live prices by weight, the local address format, and customs rules.`,
    },
    hero: {
      title: s.heroTitle,
      lede: {
        en: `${s.story.en} Here is what to pack, how to write the address, and what it costs today.`,
        ne: `${s.story.ne} के प्याक गर्ने, ठेगाना कसरी लेख्ने र आज कति लाग्छ भन्ने यहाँ छ।`,
      },
    },
    intro: [
      s.story,
      {
        en: `${n.en} is one of the European routes where we take sukuti, on its own per-kg fee. Everything else is priced by weight from the live list below.`,
        ne: `${n.ne} सुकुटी लैजान मिल्ने युरोपेली रुटमध्ये एक हो, छुट्टै प्रति केजी शुल्कमा। बाँकी सबै तलको लाइभ सूचीअनुसार तौलमा हिसाब हुन्छ।`,
      },
    ],
    exampleKg: 5,
    send: [
      meatAllowed({
        en: `Sukuti and dried meat go to ${n.en} on our meat service, with an extra fee per kg of meat. Vacuum-pack it.`,
        ne: `सुकुटी र सुकाएको मासु हाम्रो मासु सेवाबाट ${n.ne} जान्छ, मासुको प्रति केजी थप शुल्कमा। भ्याकुम प्याक गर्नुहोस्।`,
      }),
      dryFood({ en: 'Masala, tea, gundruk and sealed snacks.', ne: 'मसला, चिया, गुन्द्रुक र सिल गरिएको खाजा।' }),
      clothes({ en: 'Warm layers travel well; European winters are long.', ne: 'न्यानो लुगा राम्ररी जान्छ; युरोपको जाडो लामो हुन्छ।' }),
      documents({ en: 'Certificates and translations for residence or study papers.', ne: 'बसोबास वा अध्ययनका लागि प्रमाणपत्र र अनुवाद।' }),
      crafts({ en: 'Pashmina, singing bowls and thangka make good gifts.', ne: 'पश्मिना, सिंगिङ बाउल र थाङ्का राम्रा उपहार हुन्।' }),
      medicine({ en: 'Personal amounts with the prescription in the box; a small fee per box applies.', ne: 'प्रेस्क्रिप्सन बाकसभित्र राखेर व्यक्तिगत मात्रामा; प्रति बाकस थोरै शुल्क लाग्छ।' }),
    ],
    avoid: [freshProduce, dangerous, fakesAndCash],
    receiver: {
      lead: { en: `A ${n.en} address, written the local way:`, ne: `${n.ne} को ठेगाना, स्थानीय तरिकाले:` },
      needs: [
        { en: 'Full name as on their residence permit', ne: 'बसोबास अनुमतिपत्रमा जस्तै पूरा नाम' },
        { en: 'Street and house number (flat number if any)', ne: 'सडक र घर नम्बर (फ्ल्याट भए त्यो पनि)' },
        s.postcode,
        s.phone,
      ],
      addressExample: s.addressExample,
      tip: s.localTip,
    },
    arrival: {
      customs: s.eu === false
        ? { en: `${n.en} customs checks the parcel. Any duty or tax is paid by the receiver.`, ne: `${n.ne} भन्सारले पार्सल जाँच्छ। कर लागेमा प्रापकले तिर्छन्।` }
        : euCustoms,
      delivery: { en: `A local courier in ${n.en} delivers to the door.`, ne: `${n.ne} को स्थानीय कुरियरले घरसम्म ल्याउँछ।` },
    },
    faqs: [
      {
        q: { en: `Can I send sukuti to ${n.en}?`, ne: `${n.ne} मा सुकुटी पठाउन मिल्छ?` },
        a: {
          en: 'Yes, on our meat service with an extra fee per kg of meat. Tick "meat" in the calculator to see the total.',
          ne: 'मिल्छ, मासुको प्रति केजी थप शुल्कसहित हाम्रो मासु सेवाबाट। जम्मा हेर्न क्याल्कुलेटरमा "मासु" छान्नुहोस्।',
        },
      },
      {
        q: { en: `Who pays customs in ${n.en}?`, ne: `${n.ne} मा भन्सार कसले तिर्छ?` },
        a: s.eu === false
          ? { en: 'The receiver, if any duty or tax is charged.', ne: 'कर लागेमा प्रापकले।' }
          : { en: 'The receiver, if any is due. Small personal gifts (about €45 or less) usually pay nothing.', ne: 'लागेमा प्रापकले। साना व्यक्तिगत उपहार (करिब €45 वा कम) मा प्रायः केही लाग्दैन।' },
      },
      ...(s.extraFaq ? [s.extraFaq] : []),
    ],
  };
}

const eu = (s: Omit<EuSpec, 'eu'>) => europeGuide({ ...s, eu: true });

export const malta = europeGuide({
  eu: true,
  slug: 'nepal-to-malta', code: 'mt', name: { en: 'Malta', ne: 'माल्टा' }, rateCountry: 'Malta',
  hub: { city: { en: 'Valletta', ne: 'भालेटा' }, lat: 35.9, lon: 14.51 },
  cities: ['Valletta', 'Birkirkara', 'Mosta', 'Qormi', 'Sliema', 'St. Julian’s'],
  currency: 'Euro (EUR)',
  story: { en: 'Malta has a growing Nepali community working in care homes, hotels and delivery.', ne: 'माल्टामा केयर होम, होटल र डेलिभरीमा काम गर्ने नेपाली समुदाय बढ्दो छ।' },
  heroTitle: { en: 'Small island, three-letter postcodes.', ne: 'सानो टापु, तीन अक्षरको पोस्टकोड।' },
  postcode: { en: 'Locality and postcode (3 letters + 4 digits, e.g. BKR 1234)', ne: 'ठाउँ र पोस्टकोड (३ अक्षर + ४ अङ्क, जस्तै BKR 1234)' },
  addressExample: ['Sarita Thapa', 'Flat 3, Sunrise Court', 'Triq il-Kbira', 'Birkirkara BKR 1234', 'Malta', '+356 7912 3456'],
  phone: { en: 'Maltese mobile (+356 7X / 9X)', ne: 'माल्टा मोबाइल (+356 7X / 9X)' },
  localTip: { en: 'Many Maltese buildings have names, not numbers. Write the building name.', ne: 'माल्टाका धेरै भवनको नम्बर होइन, नाम हुन्छ। भवनको नाम लेख्नुहोस्।' },
});

export const cyprus = europeGuide({
  eu: true,
  slug: 'nepal-to-cyprus', code: 'cy', name: { en: 'Cyprus', ne: 'साइप्रस' }, rateCountry: 'Cyprus',
  hub: { city: { en: 'Nicosia', ne: 'निकोसिया' }, lat: 35.17, lon: 33.36 },
  cities: ['Nicosia', 'Limassol', 'Larnaca', 'Paphos', 'Ayia Napa'],
  currency: 'Euro (EUR)',
  story: { en: 'Students and workers in Nicosia and Limassol are most of our Cyprus parcels.', ne: 'निकोसिया र लिमासोलका विद्यार्थी र कामदार हाम्रा धेरैजसो साइप्रस पार्सलका प्रापक हुन्।' },
  heroTitle: { en: 'Cyprus: four digits and a street name.', ne: 'साइप्रस: चार अङ्क र सडकको नाम।' },
  postcode: { en: 'City and 4-digit postcode (e.g. 3035 Limassol)', ne: 'सहर र ४ अङ्कको पोस्टकोड (जस्तै 3035 Limassol)' },
  addressExample: ['Bikash Rai', 'Agiou Andreou 112, Flat 201', '3035 Limassol', 'Cyprus', '+357 99 123456'],
  phone: { en: 'Cyprus mobile (+357 9X)', ne: 'साइप्रस मोबाइल (+357 9X)' },
  localTip: { en: 'Street names may be written in Greek; the English spelling plus postcode is enough for us.', ne: 'सडकको नाम ग्रिकमा हुन सक्छ; अंग्रेजी हिज्जे र पोस्टकोड भए पुग्छ।' },
});

/* EU A */

export const austria = eu({
  slug: 'nepal-to-austria', code: 'at', name: { en: 'Austria', ne: 'अष्ट्रिया' }, rateCountry: 'Austria',
  hub: { city: { en: 'Vienna', ne: 'भियना' }, lat: 48.21, lon: 16.37 }, cities: ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck'], currency: 'Euro (EUR)',
  story: { en: 'Nepalis in Austria are mostly in Vienna, working in restaurants or studying.', ne: 'अष्ट्रियाका नेपाली धेरैजसो भियनामा रेस्टुरेन्टमा काम गर्छन् वा पढ्छन्।' },
  heroTitle: { en: 'Vienna, Graz or Salzburg: a parcel from Nepal.', ne: 'भियना, ग्राज वा साल्जबर्ग: नेपालबाट एउटा पार्सल।' },
  postcode: { en: '4-digit postcode before the city (e.g. 1100 Wien)', ne: 'सहरअघि ४ अङ्कको पोस्टकोड (जस्तै 1100 Wien)' },
  addressExample: ['Anil Shrestha', 'Favoritenstraße 120/3/14', '1100 Wien', 'Austria', '+43 660 1234567'],
  phone: { en: 'Austrian mobile (+43 6XX)', ne: 'अष्ट्रियाली मोबाइल (+43 6XX)' },
  localTip: { en: 'Vienna flats are written as street number / stair / door, like 120/3/14. Copy all three.', ne: 'भियनाका फ्ल्याट सडक नम्बर / सिँढी / ढोका गरी लेखिन्छन्, जस्तै 120/3/14। तीनै लेख्नुहोस्।' },
});

export const germany = eu({
  slug: 'nepal-to-germany', code: 'de', name: { en: 'Germany', ne: 'जर्मनी' }, rateCountry: 'Germany',
  hub: { city: { en: 'Berlin', ne: 'बर्लिन' }, lat: 52.52, lon: 13.4 }, cities: ['Berlin', 'Frankfurt', 'Munich', 'Hamburg', 'Cologne', 'Stuttgart'], currency: 'Euro (EUR)',
  story: { en: 'Germany has thousands of Nepali students and Ausbildung trainees, plus nurses and IT workers.', ne: 'जर्मनीमा हजारौं नेपाली विद्यार्थी र आउसबिल्डुङ तालिमार्थी, साथै नर्स र आईटीकर्मी छन्।' },
  heroTitle: { en: 'For students and trainees in Germany, a box from home.', ne: 'जर्मनीका विद्यार्थी र तालिमार्थीका लागि घरबाट एउटा बाकस।' },
  postcode: { en: '5-digit postcode before the city (e.g. 10115 Berlin)', ne: 'सहरअघि ५ अङ्कको पोस्टकोड (जस्तै 10115 Berlin)' },
  addressExample: ['Suman Karki', 'c/o Müller', 'Invalidenstraße 45', '10115 Berlin', 'Germany', '+49 151 23456789'],
  phone: { en: 'German mobile (+49 15X / 16X / 17X)', ne: 'जर्मन मोबाइल (+49 15X / 16X / 17X)' },
  localTip: { en: 'The receiver’s name must be on the letterbox. If they share a flat, add "c/o" and the name on the box.', ne: 'प्रापकको नाम चिठी बाकसमा हुनुपर्छ। फ्ल्याट बाँडेर बस्नुहुन्छ भने "c/o" र बाकसमा भएको नाम थप्नुहोस्।' },
  extraFaq: {
    q: { en: 'Why does the name on the letterbox matter in Germany?', ne: 'जर्मनीमा चिठी बाकसको नाम किन महत्वपूर्ण छ?' },
    a: { en: 'German couriers deliver by the name on the bell or letterbox. If it is missing, the parcel often goes back to the depot.', ne: 'जर्मन कुरियरले घण्टी वा चिठी बाकसको नामअनुसार डेलिभर गर्छन्। नाम नभए पार्सल प्रायः डिपो फर्किन्छ।' },
  },
});

export const luxembourg = eu({
  slug: 'nepal-to-luxembourg', code: 'lu', name: { en: 'Luxembourg', ne: 'लक्जमबर्ग' }, rateCountry: 'Luxembourg',
  hub: { city: { en: 'Luxembourg City', ne: 'लक्जमबर्ग सिटी' }, lat: 49.61, lon: 6.13 }, cities: ['Luxembourg City', 'Esch-sur-Alzette', 'Differdange', 'Dudelange'], currency: 'Euro (EUR)',
  story: { en: 'A small country with a small Nepali community, many working in hotels and the service sector.', ne: 'सानो देश, सानो नेपाली समुदाय, धेरैजसो होटल र सेवा क्षेत्रमा।' },
  heroTitle: { en: 'Luxembourg: small country, careful addresses.', ne: 'लक्जमबर्ग: सानो देश, ध्यान दिएर लेखिने ठेगाना।' },
  postcode: { en: 'Postcode with L- prefix (e.g. L-1234 Luxembourg)', ne: 'L- सहितको पोस्टकोड (जस्तै L-1234 Luxembourg)' },
  addressExample: ['Pramod Lama', '12, rue de la Gare', 'L-1611 Luxembourg', 'Luxembourg', '+352 621 123 456'],
  phone: { en: 'Luxembourg mobile (+352 6XX)', ne: 'लक्जमबर्ग मोबाइल (+352 6XX)' },
  localTip: { en: 'The house number goes before the street, with a comma: "12, rue de la Gare".', ne: 'घर नम्बर सडकअघि अल्पविरामसहित लेखिन्छ: "12, rue de la Gare"।' },
});

export const netherlands = eu({
  slug: 'nepal-to-netherlands', code: 'nl', name: { en: 'Netherlands', ne: 'नेदरल्यान्ड्स' }, rateCountry: 'Netherlands',
  hub: { city: { en: 'Amsterdam', ne: 'एम्स्टर्डम' }, lat: 52.37, lon: 4.9 }, cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'], currency: 'Euro (EUR)',
  story: { en: 'Students and young professionals in Amsterdam, Utrecht and Eindhoven make up most of our Dutch parcels.', ne: 'एम्स्टर्डम, उट्रेख्ट र आइन्डहोभनका विद्यार्थी र युवा पेसाकर्मी हाम्रा धेरैजसो डच पार्सलका प्रापक हुन्।' },
  heroTitle: { en: 'Netherlands: four numbers, two letters, one house number.', ne: 'नेदरल्यान्ड्स: चार अङ्क, दुई अक्षर, एउटा घर नम्बर।' },
  postcode: { en: 'Postcode as 4 digits + 2 letters (e.g. 1012 AB Amsterdam)', ne: '४ अङ्क + २ अक्षरको पोस्टकोड (जस्तै 1012 AB Amsterdam)' },
  addressExample: ['Rina Gurung', 'Damrak 70-2', '1012 LM Amsterdam', 'Netherlands', '+31 6 12345678'],
  phone: { en: 'Dutch mobile (+31 6)', ne: 'डच मोबाइल (+31 6)' },
  localTip: { en: 'Dutch postcode plus house number pin down the exact door. Get both right and the rest barely matters.', ne: 'डच पोस्टकोड र घर नम्बरले ठ्याक्कै ढोका देखाउँछ। दुवै मिलाउनुहोस्, बाँकी खासै फरक पर्दैन।' },
});

export const czechRepublic = eu({
  slug: 'nepal-to-czech-republic', code: 'cz', name: { en: 'Czech Republic', ne: 'चेक गणतन्त्र' }, rateCountry: 'Czech Republic',
  hub: { city: { en: 'Prague', ne: 'प्राग' }, lat: 50.08, lon: 14.44 }, cities: ['Prague', 'Brno', 'Ostrava', 'Plzeň', 'Olomouc'], currency: 'Czech koruna (CZK)',
  story: { en: 'Nepalis in Czechia are mostly students in Prague and Brno, and workers in factories and hotels.', ne: 'चेकियाका नेपाली धेरैजसो प्राग र ब्र्नोमा विद्यार्थी, र कारखाना तथा होटलमा कामदार छन्।' },
  heroTitle: { en: 'Prague, Brno and beyond, from Nepal.', ne: 'नेपालबाट प्राग, ब्र्नो र त्यसभन्दा पर।' },
  postcode: { en: '5-digit postcode written as 3 + 2 (e.g. 110 00 Praha 1)', ne: '३ + २ गरी लेखिने ५ अङ्कको पोस्टकोड (जस्तै 110 00 Praha 1)' },
  addressExample: ['Deepak Bhattarai', 'Vodičkova 30', '110 00 Praha 1', 'Czech Republic', '+420 601 234 567'],
  phone: { en: 'Czech mobile (+420 6XX / 7XX)', ne: 'चेक मोबाइल (+420 6XX / 7XX)' },
  localTip: { en: 'Prague addresses include the district number, like "Praha 1". Do not leave it out.', ne: 'प्रागको ठेगानामा जिल्ला नम्बर हुन्छ, जस्तै "Praha 1"। नछुटाउनुहोस्।' },
});

export const denmark = eu({
  slug: 'nepal-to-denmark', code: 'dk', name: { en: 'Denmark', ne: 'डेनमार्क' }, rateCountry: 'Denmark',
  hub: { city: { en: 'Copenhagen', ne: 'कोपनहेगन' }, lat: 55.68, lon: 12.57 }, cities: ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg'], currency: 'Danish krone (DKK)',
  story: { en: 'Denmark has many Nepali students and their families, mostly in Copenhagen and Aarhus.', ne: 'डेनमार्कमा धेरै नेपाली विद्यार्थी र तिनका परिवार छन्, धेरैजसो कोपनहेगन र आर्हुसमा।' },
  heroTitle: { en: 'Copenhagen winters call for a box from home.', ne: 'कोपनहेगनको जाडोलाई घरको बाकस चाहिन्छ।' },
  postcode: { en: '4-digit postcode before the city (e.g. 2200 København N)', ne: 'सहरअघि ४ अङ्कको पोस्टकोड (जस्तै 2200 København N)' },
  addressExample: ['Manisha KC', 'Nørrebrogade 120, 3. tv.', '2200 København N', 'Denmark', '+45 20 12 34 56'],
  phone: { en: 'Danish mobile (+45, 8 digits)', ne: 'डेनिस मोबाइल (+45, ८ अङ्क)' },
  localTip: { en: 'Danish flats are written as floor and side, like "3. tv." (3rd floor, left). Copy it exactly.', ne: 'डेनिस फ्ल्याट तल्ला र दिशाले लेखिन्छ, जस्तै "3. tv." (तेस्रो तल्ला, देब्रे)। जस्ताको तस्तै लेख्नुहोस्।' },
});

export const france = eu({
  slug: 'nepal-to-france', code: 'fr', name: { en: 'France', ne: 'फ्रान्स' }, rateCountry: 'France',
  hub: { city: { en: 'Paris', ne: 'पेरिस' }, lat: 48.86, lon: 2.35 }, cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Lille', 'Nice'], currency: 'Euro (EUR)',
  story: { en: 'Most of our French parcels go to Paris and its suburbs, to students, cooks and families.', ne: 'हाम्रा धेरैजसो फ्रान्सेली पार्सल पेरिस र वरपरका विद्यार्थी, भान्से र परिवारकहाँ जान्छन्।' },
  heroTitle: { en: 'From Nepal to Paris, one box at a time.', ne: 'नेपालबाट पेरिससम्म, एक बाकस एक पटक।' },
  postcode: { en: '5-digit postcode before the city (e.g. 75011 Paris)', ne: 'सहरअघि ५ अङ्कको पोस्टकोड (जस्तै 75011 Paris)' },
  addressExample: ['Sagar Pandey', '45 rue Oberkampf', 'Bâtiment B, 4e étage', '75011 Paris', 'France', '+33 6 12 34 56 78'],
  phone: { en: 'French mobile (+33 6 / 7)', ne: 'फ्रेन्च मोबाइल (+33 6 / 7)' },
  localTip: { en: 'Paris buildings often need a door code. Ask the receiver for it and add it to the address.', ne: 'पेरिसका भवनमा प्रायः ढोकाको कोड चाहिन्छ। प्रापकसँग मागेर ठेगानामा थप्नुहोस्।' },
});

export const monaco = eu({
  slug: 'nepal-to-monaco', code: 'mc', name: { en: 'Monaco', ne: 'मोनाको' }, rateCountry: 'Monaco',
  hub: { city: { en: 'Monaco', ne: 'मोनाको' }, lat: 43.74, lon: 7.42 }, cities: ['Monte Carlo', 'La Condamine', 'Fontvieille'], currency: 'Euro (EUR)',
  story: { en: 'Monaco is tiny, and most Nepalis there work in hotels and restaurants.', ne: 'मोनाको सानो छ, र त्यहाँका धेरै नेपाली होटल र रेस्टुरेन्टमा काम गर्छन्।' },
  heroTitle: { en: 'Monaco: one postcode, many building names.', ne: 'मोनाको: एउटै पोस्टकोड, धेरै भवनका नाम।' },
  postcode: { en: 'Postcode 98000 Monaco', ne: 'पोस्टकोड 98000 Monaco' },
  addressExample: ['Krishna Thapa', 'Le Millefiori, Apt 1204', '1 rue des Genêts', '98000 Monaco', '+377 6 12 34 56 78'],
  phone: { en: 'Monaco or French mobile', ne: 'मोनाको वा फ्रेन्च मोबाइल' },
  localTip: { en: 'Everyone in Monaco shares 98000, so the building name and apartment number carry the address.', ne: 'मोनाकोमा सबैको 98000 हो, त्यसैले भवनको नाम र अपार्टमेन्ट नम्बरले ठेगाना बोक्छ।' },
});

export const hungary = eu({
  slug: 'nepal-to-hungary', code: 'hu', name: { en: 'Hungary', ne: 'हंगेरी' }, rateCountry: 'Hungary',
  hub: { city: { en: 'Budapest', ne: 'बुडापेस्ट' }, lat: 47.5, lon: 19.04 }, cities: ['Budapest', 'Debrecen', 'Szeged', 'Pécs', 'Győr'], currency: 'Hungarian forint (HUF)',
  story: { en: 'Nepali students in Budapest and Debrecen, and a growing number of workers, are who we send to in Hungary.', ne: 'बुडापेस्ट र डेब्रेसेनका नेपाली विद्यार्थी, र बढ्दो कामदार, हंगेरीमा हाम्रा प्रापक हुन्।' },
  heroTitle: { en: 'Budapest from Nepal: postcode first.', ne: 'नेपालबाट बुडापेस्ट: पहिले पोस्टकोड।' },
  postcode: { en: '4-digit postcode (e.g. 1072 Budapest)', ne: '४ अङ्कको पोस्टकोड (जस्तै 1072 Budapest)' },
  addressExample: ['Nabin Adhikari', 'Budapest', 'Rákóczi út 42. 3. emelet 5.', '1072', 'Hungary', '+36 30 123 4567'],
  phone: { en: 'Hungarian mobile (+36 20 / 30 / 70)', ne: 'हंगेरियन मोबाइल (+36 20 / 30 / 70)' },
  localTip: { en: 'Floor ("emelet") and door number matter in Budapest apartment blocks. Include both.', ne: 'बुडापेस्टका अपार्टमेन्टमा तल्ला ("emelet") र ढोका नम्बर महत्वपूर्ण हुन्छ। दुवै लेख्नुहोस्।' },
});

export const italy = eu({
  slug: 'nepal-to-italy', code: 'it', name: { en: 'Italy', ne: 'इटाली' }, rateCountry: 'Italy',
  hub: { city: { en: 'Rome', ne: 'रोम' }, lat: 41.9, lon: 12.5 }, cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Bologna', 'Florence'], currency: 'Euro (EUR)',
  story: { en: 'Our Italian parcels go to students and workers from Milan down to Rome and Naples.', ne: 'हाम्रा इटालियन पार्सल मिलानदेखि रोम र नेपल्ससम्मका विद्यार्थी र कामदारकहाँ जान्छन्।' },
  heroTitle: { en: 'Italy: the CAP and the province code.', ne: 'इटाली: CAP र प्रान्त कोड।' },
  postcode: { en: '5-digit CAP + city + province code (e.g. 20121 Milano MI)', ne: '५ अङ्कको CAP + सहर + प्रान्त कोड (जस्तै 20121 Milano MI)' },
  addressExample: ['Ritu Basnet', 'Via Torino 15, int. 6', '20123 Milano MI', 'Italy', '+39 320 123 4567'],
  phone: { en: 'Italian mobile (+39 3XX)', ne: 'इटालियन मोबाइल (+39 3XX)' },
  localTip: { en: 'Italian addresses end with a two-letter province code (MI, RM, NA). Add it after the city.', ne: 'इटालियन ठेगाना दुई अक्षरको प्रान्त कोड (MI, RM, NA) ले टुङ्गिन्छ। सहरपछि थप्नुहोस्।' },
});

export const ireland = eu({
  slug: 'nepal-to-ireland', code: 'ie', name: { en: 'Ireland', ne: 'आयरल्यान्ड' }, rateCountry: 'Ireland',
  hub: { city: { en: 'Dublin', ne: 'डब्लिन' }, lat: 53.35, lon: -6.26 }, cities: ['Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford'], currency: 'Euro (EUR)',
  story: { en: 'Nurses, carers and students make up most of the Nepalis we send to in Ireland.', ne: 'आयरल्यान्डमा हाम्रा धेरैजसो प्रापक नर्स, केयरर र विद्यार्थी हुन्।' },
  heroTitle: { en: 'Ireland runs on the Eircode.', ne: 'आयरल्यान्ड Eircode मा चल्छ।' },
  postcode: { en: 'Eircode, 7 characters (e.g. D02 X285)', ne: 'Eircode, ७ अक्षर (जस्तै D02 X285)' },
  addressExample: ['Puja Dahal', 'Apartment 12, Block A', 'Smithfield Village, Dublin 7', 'D07 W2X5', 'Ireland', '+353 87 123 4567'],
  phone: { en: 'Irish mobile (+353 8X)', ne: 'आयरिस मोबाइल (+353 8X)' },
  localTip: { en: 'Many Irish addresses look alike. The Eircode is unique to each home, so always include it.', ne: 'धेरै आयरिस ठेगाना उस्तै देखिन्छन्। Eircode हरेक घरको छुट्टै हुन्छ, त्यसैले सधैं लेख्नुहोस्।' },
});

export const poland = eu({
  slug: 'nepal-to-poland', code: 'pl', name: { en: 'Poland', ne: 'पोल्याण्ड' }, rateCountry: 'Poland',
  hub: { city: { en: 'Warsaw', ne: 'वार्सा' }, lat: 52.23, lon: 21.01 }, cities: ['Warsaw', 'Kraków', 'Wrocław', 'Poznań', 'Gdańsk', 'Łódź'], currency: 'Polish złoty (PLN)',
  story: { en: 'Poland now has many Nepali workers in warehouses, factories and delivery, plus students.', ne: 'पोल्याण्डमा अहिले गोदाम, कारखाना र डेलिभरीमा धेरै नेपाली कामदार, साथै विद्यार्थी छन्।' },
  heroTitle: { en: 'For workers in Poland: a parcel that finds the hostel.', ne: 'पोल्याण्डका कामदारका लागि: होस्टल भेट्टाउने पार्सल।' },
  postcode: { en: 'Postcode as 2 + 3 digits (e.g. 00-950 Warszawa)', ne: '२ + ३ अङ्कको पोस्टकोड (जस्तै 00-950 Warszawa)' },
  addressExample: ['Bikram Rana', 'ul. Marszałkowska 84/92 m. 15', '00-514 Warszawa', 'Poland', '+48 512 345 678'],
  phone: { en: 'Polish mobile (+48, 9 digits)', ne: 'पोलिस मोबाइल (+48, ९ अङ्क)' },
  localTip: { en: 'In Polish addresses "m." is the flat number. For worker hostels, add the agency or company name too.', ne: 'पोलिस ठेगानामा "m." भनेको फ्ल्याट नम्बर हो। कामदार होस्टल भए एजेन्सी वा कम्पनीको नाम पनि थप्नुहोस्।' },
});

export const slovakia = eu({
  slug: 'nepal-to-slovakia', code: 'sk', name: { en: 'Slovakia', ne: 'स्लोभाकिया' }, rateCountry: 'Slovakia',
  hub: { city: { en: 'Bratislava', ne: 'ब्राटिस्लाभा' }, lat: 48.15, lon: 17.11 }, cities: ['Bratislava', 'Košice', 'Žilina', 'Nitra', 'Trnava'], currency: 'Euro (EUR)',
  story: { en: 'Nepalis in Slovakia mostly work in car and electronics factories around Bratislava, Trnava and Žilina.', ne: 'स्लोभाकियाका नेपाली धेरैजसो ब्राटिस्लाभा, त्र्नाभा र जिलिना वरपरका गाडी र इलेक्ट्रोनिक्स कारखानामा काम गर्छन्।' },
  heroTitle: { en: 'Slovakia: factory towns, careful addresses.', ne: 'स्लोभाकिया: कारखाने सहर, ध्यान दिएर लेखिने ठेगाना।' },
  postcode: { en: '5-digit postcode as 3 + 2 (e.g. 811 01 Bratislava)', ne: '३ + २ गरी ५ अङ्कको पोस्टकोड (जस्तै 811 01 Bratislava)' },
  addressExample: ['Sanjay Tamang', 'Ubytovňa XYZ, izba 214', 'Priemyselná 5', '917 01 Trnava', 'Slovakia', '+421 901 234 567'],
  phone: { en: 'Slovak mobile (+421 9XX)', ne: 'स्लोभाक मोबाइल (+421 9XX)' },
  localTip: { en: 'For worker housing ("ubytovňa"), give the hostel name and room ("izba") number.', ne: 'कामदार आवास ("ubytovňa") भए होस्टलको नाम र कोठा ("izba") नम्बर दिनुहोस्।' },
});

export const slovenia = eu({
  slug: 'nepal-to-slovenia', code: 'si', name: { en: 'Slovenia', ne: 'स्लोभेनिया' }, rateCountry: 'Slovenia',
  hub: { city: { en: 'Ljubljana', ne: 'ल्युब्ल्याना' }, lat: 46.06, lon: 14.51 }, cities: ['Ljubljana', 'Maribor', 'Celje', 'Kranj', 'Koper'], currency: 'Euro (EUR)',
  story: { en: 'A small but growing group of Nepali workers and students live in Slovenia.', ne: 'स्लोभेनियामा सानो तर बढ्दो नेपाली कामदार र विद्यार्थी समूह छ।' },
  heroTitle: { en: 'Ljubljana is closer than it looks on the map.', ne: 'ल्युब्ल्याना नक्सामा देखिनेभन्दा नजिक छ।' },
  postcode: { en: '4-digit postcode before the city (e.g. 1000 Ljubljana)', ne: 'सहरअघि ४ अङ्कको पोस्टकोड (जस्तै 1000 Ljubljana)' },
  addressExample: ['Asmita Sharma', 'Slovenska cesta 50', '1000 Ljubljana', 'Slovenia', '+386 41 123 456'],
  phone: { en: 'Slovenian mobile (+386 3X / 4X / 6X)', ne: 'स्लोभेनियन मोबाइल (+386 3X / 4X / 6X)' },
  localTip: { en: 'Slovenian names have letters like č, š and ž. Write them as the receiver does, or without the marks; both work.', ne: 'स्लोभेनियन नाममा č, š, ž जस्ता अक्षर हुन्छन्। प्रापकले लेखेजस्तै वा चिन्ह बिना लेख्नुहोस्; दुवै चल्छ।' },
});

export const spain = eu({
  slug: 'nepal-to-spain', code: 'es', name: { en: 'Spain', ne: 'स्पेन' }, rateCountry: 'Spain',
  hub: { city: { en: 'Madrid', ne: 'म्याड्रिड' }, lat: 40.42, lon: -3.7 }, cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Málaga', 'Bilbao'], currency: 'Euro (EUR)',
  story: { en: 'Barcelona and Madrid have established Nepali communities, many running shops and restaurants.', ne: 'बार्सिलोना र म्याड्रिडमा स्थापित नेपाली समुदाय छ, धेरैले पसल र रेस्टुरेन्ट चलाउँछन्।' },
  heroTitle: { en: 'Barcelona or Madrid: floor, door, postcode.', ne: 'बार्सिलोना वा म्याड्रिड: तल्ला, ढोका, पोस्टकोड।' },
  postcode: { en: '5-digit postcode before the city (e.g. 08001 Barcelona)', ne: 'सहरअघि ५ अङ्कको पोस्टकोड (जस्तै 08001 Barcelona)' },
  addressExample: ['Ganga Sherpa', 'Carrer de Sant Pau 58, 3º 2ª', '08001 Barcelona', 'Spain', '+34 612 345 678'],
  phone: { en: 'Spanish mobile (+34 6XX / 7XX)', ne: 'स्पेनिस मोबाइल (+34 6XX / 7XX)' },
  localTip: { en: 'Spanish flats are written as floor and door, like "3º 2ª". Leave that out and the courier cannot ring the right bell.', ne: 'स्पेनिस फ्ल्याट तल्ला र ढोकाले लेखिन्छ, जस्तै "3º 2ª"। नलेखे कुरियरले ठीक घण्टी बजाउन सक्दैन।' },
});

export const sweden = eu({
  slug: 'nepal-to-sweden', code: 'se', name: { en: 'Sweden', ne: 'स्विडेन' }, rateCountry: 'Sweden',
  hub: { city: { en: 'Stockholm', ne: 'स्टकहोम' }, lat: 59.33, lon: 18.07 }, cities: ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås'], currency: 'Swedish krona (SEK)',
  story: { en: 'Students and IT workers in Stockholm and Gothenburg make up most of our Swedish parcels.', ne: 'स्टकहोम र गोथेनबर्गका विद्यार्थी र आईटीकर्मी हाम्रा धेरैजसो स्विडिस पार्सलका प्रापक हुन्।' },
  heroTitle: { en: 'Sweden: the name has to be on the door.', ne: 'स्विडेन: नाम ढोकामा हुनैपर्छ।' },
  postcode: { en: '5-digit postcode as 3 + 2 (e.g. 113 51 Stockholm)', ne: '३ + २ गरी ५ अङ्कको पोस्टकोड (जस्तै 113 51 Stockholm)' },
  addressExample: ['Aashish Koirala', 'Odengatan 65, lgh 1102', '113 22 Stockholm', 'Sweden', '+46 70 123 45 67'],
  phone: { en: 'Swedish mobile (+46 7X)', ne: 'स्विडिस मोबाइल (+46 7X)' },
  localTip: { en: 'Swedish flats have a 4-digit "lgh" number. Ask the receiver for it; it is on their lease.', ne: 'स्विडिस फ्ल्याटको ४ अङ्कको "lgh" नम्बर हुन्छ। प्रापकसँग माग्नुहोस्; भाडा सम्झौतामा हुन्छ।' },
});

export const portugal = eu({
  slug: 'nepal-to-portugal', code: 'pt', name: { en: 'Portugal', ne: 'पोर्चुगल' }, rateCountry: 'Portugal',
  hub: { city: { en: 'Lisbon', ne: 'लिस्बन' }, lat: 38.72, lon: -9.14 }, cities: ['Lisbon', 'Porto', 'Odemira', 'Faro', 'Braga', 'Amadora'], currency: 'Euro (EUR)',
  story: { en: 'Portugal’s Nepali community has grown fast, in Lisbon and in the farms around Odemira.', ne: 'पोर्चुगलको नेपाली समुदाय लिस्बन र ओडेमिरा वरपरका फार्ममा छिटो बढेको छ।' },
  heroTitle: { en: 'Lisbon or Odemira: a parcel from home.', ne: 'लिस्बन वा ओडेमिरा: घरबाट एउटा पार्सल।' },
  postcode: { en: 'Postcode as 4 + 3 digits (e.g. 1000-001 Lisboa)', ne: '४ + ३ अङ्कको पोस्टकोड (जस्तै 1000-001 Lisboa)' },
  addressExample: ['Dinesh Magar', 'Rua da Palma 120, 2º Esq.', '1100-394 Lisboa', 'Portugal', '+351 912 345 678'],
  phone: { en: 'Portuguese mobile (+351 9X)', ne: 'पोर्चुगिज मोबाइल (+351 9X)' },
  localTip: { en: 'Rural addresses in Alentejo can be vague. For farm housing, add the farm name and a reachable phone.', ne: 'अलेन्तेजोका ग्रामीण ठेगाना अस्पष्ट हुन सक्छन्। फार्म आवास भए फार्मको नाम र उठ्ने फोन थप्नुहोस्।' },
});

/* Countries the user lists under EU B. The live sheet decides which price list each one uses. */

export const romania = eu({
  slug: 'nepal-to-romania', code: 'ro', name: { en: 'Romania', ne: 'रोमानिया' }, rateCountry: 'Romania',
  hub: { city: { en: 'Bucharest', ne: 'बुखारेस्ट' }, lat: 44.43, lon: 26.1 }, cities: ['Bucharest', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța'], currency: 'Romanian leu (RON)',
  story: { en: 'Many Nepalis have gone to Romania recently for construction, factory and delivery work.', ne: 'पछिल्लो समय धेरै नेपाली निर्माण, कारखाना र डेलिभरीको कामका लागि रोमानिया गएका छन्।' },
  heroTitle: { en: 'Romania: six digits and the company address.', ne: 'रोमानिया: छ अङ्क र कम्पनीको ठेगाना।' },
  postcode: { en: '6-digit postcode (e.g. 010011 București)', ne: '६ अङ्कको पोस्टकोड (जस्तै 010011 București)' },
  addressExample: ['Hari Pariyar', 'c/o ABC Construct SRL', 'Strada Fabricii 12, Sector 6', '060821 București', 'Romania', '+40 712 345 678'],
  phone: { en: 'Romanian mobile (+40 7XX)', ne: 'रोमानियन मोबाइल (+40 7XX)' },
  localTip: { en: 'If the receiver lives in employer housing, use the company name with "c/o" and their room.', ne: 'प्रापक रोजगारदाताको आवासमा बस्नुहुन्छ भने "c/o" सहित कम्पनीको नाम र कोठा लेख्नुहोस्।' },
});

export const greece = eu({
  slug: 'nepal-to-greece', code: 'gr', name: { en: 'Greece', ne: 'ग्रिस' }, rateCountry: 'Greece',
  hub: { city: { en: 'Athens', ne: 'एथेन्स' }, lat: 37.98, lon: 23.73 }, cities: ['Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Piraeus'], currency: 'Euro (EUR)',
  story: { en: 'Nepalis in Greece work in farming, hospitality and construction, many around Athens.', ne: 'ग्रिसका नेपाली कृषि, आतिथ्य र निर्माणमा काम गर्छन्, धेरै एथेन्स वरपर।' },
  heroTitle: { en: 'Athens and the islands, from Nepal.', ne: 'नेपालबाट एथेन्स र टापुहरूसम्म।' },
  postcode: { en: '5-digit postcode as 3 + 2 (e.g. 105 57 Athens)', ne: '३ + २ गरी ५ अङ्कको पोस्टकोड (जस्तै 105 57 Athens)' },
  addressExample: ['Sita Bk', 'Patision 120, 3rd floor', '112 57 Athens', 'Greece', '+30 691 234 5678'],
  phone: { en: 'Greek mobile (+30 69X)', ne: 'ग्रिक मोबाइल (+30 69X)' },
  localTip: { en: 'Greek street names are in Greek letters on signs. The Latin spelling plus postcode is fine on our label.', ne: 'ग्रिक सडकका नाम बोर्डमा ग्रिक अक्षरमा हुन्छन्। हाम्रो लेबलमा ल्याटिन हिज्जे र पोस्टकोड भए पुग्छ।' },
});

export const bulgaria = eu({
  slug: 'nepal-to-bulgaria', code: 'bg', name: { en: 'Bulgaria', ne: 'बुल्गेरिया' }, rateCountry: 'Bulgaria',
  hub: { city: { en: 'Sofia', ne: 'सोफिया' }, lat: 42.7, lon: 23.32 }, cities: ['Sofia', 'Plovdiv', 'Varna', 'Burgas'], currency: 'Euro (EUR)',
  story: { en: 'Workers in Sofia and the Black Sea resorts are most of our Bulgaria parcels.', ne: 'सोफिया र कालो सागरका रिसोर्टमा काम गर्नेहरू हाम्रा धेरैजसो बुल्गेरिया पार्सलका प्रापक हुन्।' },
  heroTitle: { en: 'Sofia, Varna, Burgas: four digits do it.', ne: 'सोफिया, भार्ना, बुर्गास: चार अङ्कले काम गर्छ।' },
  postcode: { en: '4-digit postcode (e.g. 1000 Sofia)', ne: '४ अङ्कको पोस्टकोड (जस्तै 1000 Sofia)' },
  addressExample: ['Ram Kumar Chaudhary', 'ul. Vitosha 45, et. 2, ap. 6', '1000 Sofia', 'Bulgaria', '+359 88 123 4567'],
  phone: { en: 'Bulgarian mobile (+359 8X)', ne: 'बुल्गेरियन मोबाइल (+359 8X)' },
  localTip: { en: 'In Bulgarian addresses "et." is the floor and "ap." the flat. Include both.', ne: 'बुल्गेरियन ठेगानामा "et." भनेको तल्ला र "ap." भनेको फ्ल्याट हो। दुवै लेख्नुहोस्।' },
});

export const croatia = eu({
  slug: 'nepal-to-croatia', code: 'hr', name: { en: 'Croatia', ne: 'क्रोएसिया' }, rateCountry: 'Croatia',
  hub: { city: { en: 'Zagreb', ne: 'जाग्रेब' }, lat: 45.81, lon: 15.98 }, cities: ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Dubrovnik'], currency: 'Euro (EUR)',
  story: { en: 'Croatia has taken many Nepali workers in construction, hotels and food delivery in recent years.', ne: 'पछिल्ला वर्षमा क्रोएसियाले निर्माण, होटल र खाना डेलिभरीमा धेरै नेपाली कामदार लिएको छ।' },
  heroTitle: { en: 'Zagreb, Split, the coast: a parcel from Nepal.', ne: 'जाग्रेब, स्प्लिट, समुद्री तट: नेपालबाट एउटा पार्सल।' },
  postcode: { en: '5-digit postcode before the city (e.g. 10000 Zagreb)', ne: 'सहरअघि ५ अङ्कको पोस्टकोड (जस्तै 10000 Zagreb)' },
  addressExample: ['Kamal Gurung', 'Ilica 120, 2. kat', '10000 Zagreb', 'Croatia', '+385 91 234 5678'],
  phone: { en: 'Croatian mobile (+385 9X)', ne: 'क्रोएसियन मोबाइल (+385 9X)' },
  localTip: { en: 'Seasonal workers on the coast move often. Confirm the address just before you send.', ne: 'समुद्री तटका मौसमी कामदार प्रायः ठाउँ सर्छन्। पठाउनुअघि ठेगाना फेरि पक्का गर्नुहोस्।' },
});

export const estonia = eu({
  slug: 'nepal-to-estonia', code: 'ee', name: { en: 'Estonia', ne: 'इस्टोनिया' }, rateCountry: 'Estonia',
  hub: { city: { en: 'Tallinn', ne: 'टालिन' }, lat: 59.44, lon: 24.75 }, cities: ['Tallinn', 'Tartu', 'Narva', 'Pärnu'], currency: 'Euro (EUR)',
  story: { en: 'Students in Tallinn and Tartu are most of the people we send to in Estonia.', ne: 'टालिन र टार्टुका विद्यार्थी इस्टोनियामा हाम्रा धेरैजसो प्रापक हुन्।' },
  heroTitle: { en: 'Tallinn: parcel lockers are the norm.', ne: 'टालिन: पार्सल लकर सामान्य हो।' },
  postcode: { en: '5-digit postcode (e.g. 10111 Tallinn)', ne: '५ अङ्कको पोस्टकोड (जस्तै 10111 Tallinn)' },
  addressExample: ['Sandesh Thapa', 'Narva mnt 25-14', '10120 Tallinn', 'Estonia', '+372 5123 4567'],
  phone: { en: 'Estonian mobile (+372 5X)', ne: 'इस्टोनियन मोबाइल (+372 5X)' },
  localTip: { en: 'Estonian couriers often send a locker code by SMS. A working +372 number really matters.', ne: 'इस्टोनियाका कुरियरले प्रायः SMS मा लकर कोड पठाउँछन्। चल्ने +372 नम्बर साँच्चै महत्वपूर्ण छ।' },
});

export const finland = eu({
  slug: 'nepal-to-finland', code: 'fi', name: { en: 'Finland', ne: 'फिनल्यान्ड' }, rateCountry: 'Finland',
  hub: { city: { en: 'Helsinki', ne: 'हेल्सिंकी' }, lat: 60.17, lon: 24.94 }, cities: ['Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Turku', 'Oulu'], currency: 'Euro (EUR)',
  story: { en: 'Finland’s Nepali community includes nurses, cooks and many students.', ne: 'फिनल्यान्डको नेपाली समुदायमा नर्स, भान्से र धेरै विद्यार्थी छन्।' },
  heroTitle: { en: 'Helsinki winters, and a warm box from Nepal.', ne: 'हेल्सिंकीको जाडो, र नेपालबाट एउटा न्यानो बाकस।' },
  postcode: { en: '5-digit postcode before the city (e.g. 00100 Helsinki)', ne: 'सहरअघि ५ अङ्कको पोस्टकोड (जस्तै 00100 Helsinki)' },
  addressExample: ['Bina Shrestha', 'Mannerheimintie 40 B 12', '00100 Helsinki', 'Finland', '+358 40 123 4567'],
  phone: { en: 'Finnish mobile (+358 4X / 50)', ne: 'फिनिस मोबाइल (+358 4X / 50)' },
  localTip: { en: 'Finnish addresses add staircase letter and flat number after the street: "40 B 12". Keep all of it.', ne: 'फिनिस ठेगानामा सडकपछि सिँढीको अक्षर र फ्ल्याट नम्बर हुन्छ: "40 B 12"। सबै राख्नुहोस्।' },
});

export const lithuania = eu({
  slug: 'nepal-to-lithuania', code: 'lt', name: { en: 'Lithuania', ne: 'लिथुआनिया' }, rateCountry: 'Lithuania',
  hub: { city: { en: 'Vilnius', ne: 'भिल्नियस' }, lat: 54.69, lon: 25.28 }, cities: ['Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai'], currency: 'Euro (EUR)',
  story: { en: 'Students and transport workers in Vilnius and Kaunas are who we send to in Lithuania.', ne: 'भिल्नियस र काउनासका विद्यार्थी र यातायात कामदार लिथुआनियामा हाम्रा प्रापक हुन्।' },
  heroTitle: { en: 'Vilnius: LT and five digits.', ne: 'भिल्नियस: LT र पाँच अङ्क।' },
  postcode: { en: 'Postcode with LT- prefix (e.g. LT-01103 Vilnius)', ne: 'LT- सहितको पोस्टकोड (जस्तै LT-01103 Vilnius)' },
  addressExample: ['Rajan Bhusal', 'Gedimino pr. 20-5', 'LT-01103 Vilnius', 'Lithuania', '+370 612 34567'],
  phone: { en: 'Lithuanian mobile (+370 6XX)', ne: 'लिथुआनियन मोबाइल (+370 6XX)' },
  localTip: { en: 'The flat number follows a dash after the house number ("20-5"). Do not drop it.', ne: 'फ्ल्याट नम्बर घर नम्बरपछि ड्यासमा आउँछ ("20-5")। नछुटाउनुहोस्।' },
});

export const latvia = eu({
  slug: 'nepal-to-latvia', code: 'lv', name: { en: 'Latvia', ne: 'लाट्भिया' }, rateCountry: 'Latvia',
  hub: { city: { en: 'Riga', ne: 'रिगा' }, lat: 56.95, lon: 24.11 }, cities: ['Riga', 'Daugavpils', 'Liepāja', 'Jelgava'], currency: 'Euro (EUR)',
  story: { en: 'Most of our Latvia parcels go to students and young workers in Riga.', ne: 'हाम्रा धेरैजसो लाट्भिया पार्सल रिगाका विद्यार्थी र युवा कामदारकहाँ जान्छन्।' },
  heroTitle: { en: 'Riga: LV, four digits, and the flat number.', ne: 'रिगा: LV, चार अङ्क र फ्ल्याट नम्बर।' },
  postcode: { en: 'Postcode with LV- prefix (e.g. LV-1050 Rīga)', ne: 'LV- सहितको पोस्टकोड (जस्तै LV-1050 Rīga)' },
  addressExample: ['Sabina Lama', 'Brīvības iela 85-12', 'Rīga, LV-1001', 'Latvia', '+371 2123 4567'],
  phone: { en: 'Latvian mobile (+371 2X)', ne: 'लाट्भियन मोबाइल (+371 2X)' },
  localTip: { en: 'Latvian addresses put the city and postcode on one line: "Rīga, LV-1001".', ne: 'लाट्भियन ठेगानामा सहर र पोस्टकोड एउटै लाइनमा हुन्छ: "Rīga, LV-1001"।' },
});

export const EUROPE_GUIDES = [
  uk, malta, cyprus,
  austria, germany, luxembourg, netherlands, czechRepublic, denmark, france, monaco, hungary,
  italy, ireland, poland, slovakia, slovenia, spain, sweden, portugal,
  romania, greece, bulgaria, croatia, estonia, finland, lithuania, latvia,
];
