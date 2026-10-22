import type { CountryGuide } from './types';
import {
  clothes, documents, dryFood, medicine, crafts, samples, liquids,
  meatAllowed, noMeat, dangerous, fakesAndCash,
} from './common';

export const korea: CountryGuide = {
  slug: 'nepal-to-south-korea',
  code: 'kr',
  name: { en: 'South Korea', ne: 'दक्षिण कोरिया' },
  region: 'asia',
  rateCountry: 'Korea',
  hub: { city: { en: 'Seoul', ne: 'सोल' }, lat: 37.57, lon: 126.98 },
  cities: ['Seoul', 'Incheon', 'Busan', 'Daegu', 'Gimhae', 'Ansan', 'Gwangju', 'Daejeon'],
  currency: 'Korean won (KRW)',
  blurb: {
    en: 'Food and clothes for EPS workers and students. The receiver needs a PCCC number.',
    ne: 'EPS कामदार र विद्यार्थीका लागि खाना र लुगा। प्रापकसँग PCCC नम्बर चाहिन्छ।',
  },
  seo: {
    title: 'Nepal to South Korea Parcel Guide: Rates, PCCC, Rules | BC Cargo',
    description:
      'Sending a parcel from Nepal to Korea? Live prices by weight, what Korean customs allows, why the receiver needs a PCCC number, and how to track it.',
  },
  hero: {
    title: { en: 'From your kitchen in Nepal to a dorm in Korea.', ne: 'नेपालको भान्साबाट कोरियाको कोठासम्म।' },
    lede: {
      en: 'Achar, clothes, documents, a jacket someone forgot. Bring it to us, we weigh it, pack it in strong boxes and send it to South Korea with a tracking number.',
      ne: 'अचार, लुगा, कागजपत्र, बिर्सिएको ज्याकेट। हामीकहाँ ल्याउनुहोस्, हामी तौलेर बलियो बाकसमा प्याक गर्छौं र ट्र्याकिङ नम्बरसहित दक्षिण कोरिया पठाउँछौं।',
    },
  },
  intro: [
    {
      en: 'Korea is one of the busiest routes out of Nepal. Most parcels go to people working under the EPS scheme, and to students in Seoul, Busan and the factory towns around them.',
      ne: 'कोरिया नेपालबाट सबैभन्दा धेरै पार्सल जाने रुटमध्ये एक हो। धेरैजसो पार्सल EPS अन्तर्गत काम गर्ने दाजुभाइ दिदीबहिनी र सोल, बुसान वरपर पढ्ने विद्यार्थीकहाँ जान्छन्।',
    },
    {
      en: 'The flight is the easy part. What holds parcels up in Korea is the paperwork on the receiver side, mostly a missing customs number. Get that right and the rest is simple.',
      ne: 'उडान त सजिलो भाग हो। कोरियामा पार्सल अड्किने मुख्य कारण प्रापकतर्फको कागज, विशेष गरी भन्सार नम्बर नहुनु हो। त्यो मिलाउनुभयो भने बाँकी सजिलो छ।',
    },
  ],
  exampleKg: 5,
  send: [
    dryFood({
      en: 'Achar, masala, chiura, gundruk and tea, sealed in their packets. Homemade pickles go in a double bag.',
      ne: 'अचार, मसला, चिउरा, गुन्द्रुक र चिया, प्याकेटमै सिल गरेर। घरमा बनाएको अचार दोहोरो प्लास्टिकमा।',
    }),
    clothes({
      en: 'Winter in Korea is cold. Jackets, sweaters and daura suruwal are among the most common things we send.',
      ne: 'कोरियाको जाडो कडा हुन्छ। ज्याकेट, स्वेटर र दौरा सुरुवाल हामीले सबैभन्दा धेरै पठाउने सामानमध्ये हुन्।',
    }),
    documents({
      en: 'Certificates, transcripts and visa papers. Put them in a plastic sleeve so they stay flat and dry.',
      ne: 'प्रमाणपत्र, ट्रान्सक्रिप्ट र भिसाका कागज। सिधा र सुख्खा रहोस् भनेर प्लास्टिक खोलमा राख्नुहोस्।',
    }),
    medicine({
      en: 'Personal amounts only, with a copy of the prescription inside the box. There is a small extra fee per box.',
      ne: 'आफ्नै प्रयोगका लागि मात्र, प्रेस्क्रिप्सनको प्रतिलिपि बाकसभित्र राखेर। प्रति बाकस अलिकति थप शुल्क लाग्छ।',
    }),
    liquids({
      en: 'Ghee, oil and wet pickles are fine if sealed and packed upright. Liquid boxes carry a small extra fee.',
      ne: 'घिउ, तेल र झोल अचार राम्ररी सिल गरी ठाडो प्याक गरे पठाउन मिल्छ। तरल भएको बाकसमा थोरै थप शुल्क लाग्छ।',
    }),
  ],
  avoid: [
    noMeat({
      en: 'Korea does not accept meat from Nepal. That includes sukuti, sausages and anything cooked with meat. We will not pack it.',
      ne: 'कोरियाले नेपालबाट मासु लिँदैन। सुकुटी, ससेज र मासु हालेर पकाएको खाना पनि। हामी यो प्याक गर्दैनौं।',
    }),
    {
      icon: 'food',
      title: { en: 'Fresh fruit, vegetables and seeds', ne: 'ताजा फलफूल, तरकारी र बिउ' },
      note: {
        en: 'Plant quarantine stops fresh produce, soil and seeds. Dried and packed items are a different story.',
        ne: 'बिरुवा क्वारेन्टाइनले ताजा फलफूल, माटो र बिउ रोक्छ। सुकाएर प्याक गरेको सामान भने फरक कुरा हो।',
      },
    },
    dangerous,
    fakesAndCash,
  ],
  receiver: {
    lead: {
      en: 'Korean customs clears parcels against the receiver, not the sender. Ask them for these before you come in.',
      ne: 'कोरियाली भन्सारले पार्सल प्रापकको नाममा जाँच्छ, पठाउनेको होइन। आउनुअघि यी कुरा उहाँसँग माग्नुहोस्।',
    },
    needs: [
      { en: 'Full name exactly as on their ARC (alien registration card)', ne: 'ARC (विदेशी दर्ता कार्ड) मा जस्तै पूरा नाम' },
      { en: 'Personal Customs Clearance Code (PCCC), starts with P', ne: 'व्यक्तिगत भन्सार कोड (PCCC), P बाट सुरु हुन्छ' },
      { en: 'Korean mobile number (010-XXXX-XXXX)', ne: 'कोरियाली मोबाइल नम्बर (010-XXXX-XXXX)' },
      { en: 'Full address with the 5-digit postal code', ne: '५ अङ्कको पोस्टल कोडसहित पूरा ठेगाना' },
    ],
    addressExample: ['Ram Bahadur Thapa', '12, Saemal-ro 3beon-gil, Danwon-gu', 'Ansan-si, Gyeonggi-do 15412', 'South Korea', '+82 10-1234-5678', 'PCCC: P123456789012'],
    tip: {
      en: 'The receiver can get a PCCC free on the Korea Customs (UNI-PASS) website or app in a few minutes. A copy of the address in Korean letters also helps the local courier.',
      ne: 'प्रापकले कोरिया भन्सार (UNI-PASS) को वेबसाइट वा एपबाट केही मिनेटमै निःशुल्क PCCC लिन सक्नुहुन्छ। ठेगाना कोरियाली अक्षरमा पनि भए स्थानीय कुरियरलाई सजिलो हुन्छ।',
    },
  },
  arrival: {
    customs: {
      en: 'Korea Customs checks the parcel against the PCCC. Personal-use items of low value usually pass without duty; the receiver pays if any is charged.',
      ne: 'कोरिया भन्सारले PCCC अनुसार पार्सल जाँच्छ। कम मूल्यका व्यक्तिगत सामानमा प्रायः कर लाग्दैन; लागे प्रापकले तिर्नुपर्छ।',
    },
    delivery: {
      en: 'A Korean courier brings it to the door and usually texts the receiver first, so the 010 number must be right.',
      ne: 'कोरियाली कुरियरले घरसम्म ल्याउँछ र प्रायः पहिले म्यासेज गर्छ, त्यसैले 010 नम्बर सही हुनुपर्छ।',
    },
  },
  faqs: [
    {
      q: { en: 'What is a PCCC and does my brother really need one?', ne: 'PCCC भनेको के हो, मेरो दाइलाई साँच्चै चाहिन्छ?' },
      a: {
        en: 'Yes. It is the personal customs number Korea uses instead of the ARC number. Without it the parcel can wait at customs until the receiver sends it. It is free and takes a few minutes online.',
        ne: 'हो। यो कोरियाले ARC नम्बरको सट्टा प्रयोग गर्ने व्यक्तिगत भन्सार नम्बर हो। नभए प्रापकले नपठाउञ्जेल पार्सल भन्सारमै बस्न सक्छ। यो निःशुल्क हो र अनलाइन केही मिनेटमै बन्छ।',
      },
    },
    {
      q: { en: 'Can I send sukuti to Korea?', ne: 'कोरियामा सुकुटी पठाउन मिल्छ?' },
      a: {
        en: 'No. Meat is not allowed into Korea from Nepal, dried or cooked. Our calculator blocks it for this route too.',
        ne: 'मिल्दैन। सुकाएको होस् वा पकाएको, नेपालबाट कोरियामा मासु लैजान पाइँदैन। हाम्रो क्याल्कुलेटरले पनि यो रुटमा रोक्छ।',
      },
    },
    {
      q: { en: 'Can I send homemade achar?', ne: 'घरमा बनाएको अचार पठाउन मिल्छ?' },
      a: {
        en: 'Yes, if it has no meat. Use a jar with a tight lid, then two plastic bags. Oily pickles count as liquid, which adds a small fee per box.',
        ne: 'मिल्छ, मासु नभएको भए। बलियो बिर्को भएको भाँडोमा राखेर दुई तह प्लास्टिकमा बेर्नुहोस्। तेलिलो अचार तरलमा गनिन्छ, प्रति बाकस थोरै शुल्क थपिन्छ।',
      },
    },
    {
      q: { en: 'Who pays customs duty in Korea?', ne: 'कोरियामा भन्सार कर कसले तिर्छ?' },
      a: {
        en: 'The receiver, if any is charged. Our price covers packing, the boxes and the flight to Korea. Small personal parcels usually pass without duty.',
        ne: 'कर लागेमा प्रापकले तिर्नुहुन्छ। हाम्रो मूल्यमा प्याकिङ, बाकस र कोरियासम्मको ढुवानी पर्छ। सानो व्यक्तिगत पार्सलमा प्रायः कर लाग्दैन।',
      },
    },
  ],
  order: ['intro', 'receiver', 'send', 'avoid', 'price', 'journey', 'checklist', 'track', 'faq'],
};

export const japan: CountryGuide = {
  slug: 'nepal-to-japan',
  code: 'jp',
  name: { en: 'Japan', ne: 'जापान' },
  region: 'asia',
  rateCountry: 'Japan',
  hub: { city: { en: 'Tokyo', ne: 'टोकियो' }, lat: 35.68, lon: 139.69 },
  cities: ['Tokyo', 'Osaka', 'Nagoya', 'Fukuoka', 'Yokohama', 'Saitama', 'Chiba'],
  currency: 'Japanese yen (JPY)',
  blurb: {
    en: 'Strict on meat and on medicine quantities. Address needs the 〒 postcode.',
    ne: 'मासु र औषधिको मात्रामा कडा। ठेगानामा 〒 पोस्टकोड चाहिन्छ।',
  },
  seo: {
    title: 'Sending a Parcel from Nepal to Japan: Prices and Rules | BC Cargo',
    description:
      'What Japan quarantine allows from Nepal, how much medicine you can send, how to write a Japanese address, and live parcel prices by weight.',
  },
  hero: {
    title: { en: 'Japan checks every parcel carefully. Pack it right once.', ne: 'जापानले हरेक पार्सल राम्ररी जाँच्छ। एकै पटक ठीकसँग प्याक गर्नुहोस्।' },
    lede: {
      en: 'Students in Tokyo, cooks in Osaka, families in Fukuoka. We send their parcels from Nepal every week, and we know what Japanese customs will stop.',
      ne: 'टोकियोका विद्यार्थी, ओसाकाका भान्से, फुकुओकाका परिवार। उहाँहरूका पार्सल हामी नेपालबाट पठाइरहन्छौं, र जापानी भन्सारले के रोक्छ भन्ने हामीलाई थाहा छ।',
    },
  },
  intro: [
    {
      en: 'Japan is tidy and strict. Parcels that follow the rules move quickly. Parcels with meat, too much medicine or an unclear address get held, and sometimes destroyed.',
      ne: 'जापान व्यवस्थित र कडा छ। नियम मानेका पार्सल छिटो जान्छन्। मासु, धेरै औषधि वा अस्पष्ट ठेगाना भएका पार्सल रोकिन्छन्, कहिलेकाहीँ नष्ट पनि गरिन्छन्।',
    },
    {
      en: 'So this guide spends more time on what not to send than most. Read that part before you pack.',
      ne: 'त्यसैले यो गाइडले के नपठाउने भन्नेमा बढी समय दिएको छ। प्याक गर्नुअघि त्यो भाग पढ्नुहोस्।',
    },
  ],
  exampleKg: 3,
  send: [
    dryFood({
      en: 'Packed spices, tea, chiura and sweets in their original sealed packets with the label on.',
      ne: 'लेबल भएको, सिल नखोलिएको प्याकेटमा मसला, चिया, चिउरा र मिठाई।',
    }),
    clothes({
      en: 'Clothes and shoes are the easiest thing to send to Japan. Fold them flat to keep the weight honest.',
      ne: 'जापान पठाउन सबैभन्दा सजिलो लुगा र जुत्ता हो। तौल नबढोस् भनेर मिलाएर पट्याउनुहोस्।',
    }),
    documents({
      en: 'Certificates for school or visa applications. Japan schools often want originals, so keep copies at home.',
      ne: 'स्कुल वा भिसाका लागि प्रमाणपत्र। जापानी स्कुलले प्रायः सक्कल माग्छन्, त्यसैले प्रतिलिपि घरमा राख्नुहोस्।',
    }),
    crafts({
      en: 'Singing bowls, thangka, pashmina and paper products go through without trouble.',
      ne: 'सिंगिङ बाउल, थाङ्का, पश्मिना र कागजका सामान सजिलै जान्छन्।',
    }),
    medicine({
      en: 'Up to about one month of personal use, with the prescription. More than that needs a Japanese import permit first.',
      ne: 'करिब एक महिना पुग्ने व्यक्तिगत प्रयोगको, प्रेस्क्रिप्सनसहित। त्योभन्दा बढीका लागि पहिले जापानी आयात अनुमति चाहिन्छ।',
    }),
  ],
  avoid: [
    noMeat({
      en: 'Japan animal quarantine refuses meat and meat products from Nepal, including sukuti, sausages, jerky and instant noodles with meat in them.',
      ne: 'जापानी पशु क्वारेन्टाइनले नेपालबाट मासु र मासुजन्य सामान लिँदैन: सुकुटी, ससेज, जर्की र मासु भएको चाउचाउ पनि।',
    }),
    {
      icon: 'medicine',
      title: { en: 'Medicines with stimulants or codeine', ne: 'उत्तेजक वा कोडिन भएका औषधि' },
      note: {
        en: 'Some common cold and pain medicines sold in Nepal are banned in Japan. Send the packet photo to us before packing any medicine.',
        ne: 'नेपालमा पाइने केही रुघाखोकी र दुखाइका औषधि जापानमा प्रतिबन्धित छन्। औषधि प्याक गर्नुअघि प्याकेटको फोटो हामीलाई पठाउनुहोस्।',
      },
    },
    {
      icon: 'food',
      title: { en: 'Fresh fruit, plants and soil', ne: 'ताजा फलफूल, बिरुवा र माटो' },
      note: {
        en: 'Plant quarantine stops them at the airport.',
        ne: 'बिरुवा क्वारेन्टाइनले एयरपोर्टमै रोक्छ।',
      },
    },
    dangerous,
  ],
  receiver: {
    lead: {
      en: 'Japanese addresses run from big to small: postcode, prefecture, city, block, then building and room.',
      ne: 'जापानी ठेगाना ठूलोबाट सानोतर्फ लेखिन्छ: पोस्टकोड, प्रिफेक्चर, सहर, ब्लक, अनि भवन र कोठा।',
    },
    needs: [
      { en: 'Full name as on their residence card', ne: 'रेसिडेन्स कार्डमा जस्तै पूरा नाम' },
      { en: '7-digit postcode (〒123-4567)', ne: '७ अङ्कको पोस्टकोड (〒123-4567)' },
      { en: 'Building name and room number', ne: 'भवनको नाम र कोठा नम्बर' },
      { en: 'Japanese phone number (090/080/070)', ne: 'जापानी फोन नम्बर (090/080/070)' },
    ],
    addressExample: ['〒160-0023', 'Tokyo-to, Shinjuku-ku, Nishi-Shinjuku 7-2-5', 'Sakura Heights 203', 'Sita Gurung', '+81 90-1234-5678'],
    tip: {
      en: 'Missing the room number is the most common reason a Japanese courier brings a parcel back. Ask for it even if the building is small.',
      ne: 'कोठा नम्बर नहुनु नै जापानी कुरियरले पार्सल फिर्ता लैजाने सबैभन्दा सामान्य कारण हो। भवन सानो भए पनि सोध्नुहोस्।',
    },
  },
  arrival: {
    customs: {
      en: 'Japan Customs and quarantine open and check parcels. Duty on personal gifts is often small; the receiver pays if any.',
      ne: 'जापानी भन्सार र क्वारेन्टाइनले पार्सल खोलेर जाँच्छन्। व्यक्तिगत उपहारमा कर प्रायः कम हुन्छ; लागेमा प्रापकले तिर्छन्।',
    },
    delivery: {
      en: 'A Japanese courier delivers. If nobody is in, they leave a slip and the receiver books a new time.',
      ne: 'जापानी कुरियरले घरसम्म ल्याउँछ। कोही नभए कागज छोड्छ र प्रापकले नयाँ समय मिलाउनुहुन्छ।',
    },
  },
  faqs: [
    {
      q: { en: 'How much medicine can I send to Japan?', ne: 'जापानमा कति औषधि पठाउन मिल्छ?' },
      a: {
        en: 'For prescription medicine, about one month of personal use without extra paperwork. Some ingredients are banned outright, so show us the packets first.',
        ne: 'प्रेस्क्रिप्सन औषधि करिब एक महिनाको व्यक्तिगत प्रयोगसम्म थप कागज बिना। केही तत्व पूर्ण रूपमा प्रतिबन्धित छन्, त्यसैले पहिले प्याकेट देखाउनुहोस्।',
      },
    },
    {
      q: { en: 'Can I send Wai Wai or instant noodles?', ne: 'वाइवाइ वा चाउचाउ पठाउन मिल्छ?' },
      a: {
        en: 'Vegetarian flavours, yes. Chicken or other meat flavours contain meat extract, which Japan quarantine can refuse.',
        ne: 'शाकाहारी स्वादको मिल्छ। चिकन वा अरू मासुको स्वादमा मासुको अंश हुन्छ, जापानी क्वारेन्टाइनले रोक्न सक्छ।',
      },
    },
    {
      q: { en: 'Who pays Japanese customs duty?', ne: 'जापानी भन्सार कर कसले तिर्छ?' },
      a: {
        en: 'The receiver, if any. Our price covers packing, boxes and the flight to Japan.',
        ne: 'लागेमा प्रापकले। हाम्रो मूल्यमा प्याकिङ, बाकस र जापानसम्मको ढुवानी पर्छ।',
      },
    },
  ],
  order: ['intro', 'avoid', 'send', 'receiver', 'price', 'journey', 'checklist', 'faq', 'track'],
};

export const hongKong: CountryGuide = {
  slug: 'nepal-to-hong-kong',
  code: 'hk',
  name: { en: 'Hong Kong', ne: 'हङकङ' },
  region: 'asia',
  rateCountry: 'Hong Kong',
  hub: { city: { en: 'Hong Kong', ne: 'हङकङ' }, lat: 22.32, lon: 114.17 },
  cities: ['Kowloon', 'Hong Kong Island', 'New Territories', 'Yuen Long', 'Tsuen Wan'],
  currency: 'Hong Kong dollar (HKD)',
  blurb: {
    en: 'One of the few routes where we take sukuti. No postcode needed.',
    ne: 'सुकुटी लैजान मिल्ने थोरै रुटमध्ये एक। पोस्टकोड चाहिँदैन।',
  },
  seo: {
    title: 'Nepal to Hong Kong Cargo: Sukuti, Prices and Address Tips | BC Cargo',
    description:
      'Send parcels from Nepal to Hong Kong, including sukuti on our meat service. Live prices by weight, address format without postcodes, and what customs checks.',
  },
  hero: {
    title: { en: 'Hong Kong: yes, the sukuti can come too.', ne: 'हङकङ: हो, सुकुटी पनि जान सक्छ।' },
    lede: {
      en: 'The Nepali community in Hong Kong has been here for generations. We send food from home, clothes and documents, with dried meat on its own per-kg rate.',
      ne: 'हङकङमा नेपाली समुदाय पुस्तौंदेखि छ। हामी घरको खाना, लुगा र कागजपत्र पठाउँछौं, सुकाएको मासु छुट्टै प्रति केजी दरमा।',
    },
  },
  intro: [
    {
      en: 'Hong Kong is a free port, so most personal goods go in without duty. That makes it one of the simplest routes we run.',
      ne: 'हङकङ खुला बन्दरगाह हो, त्यसैले धेरैजसो व्यक्तिगत सामानमा कर लाग्दैन। त्यसैले यो हाम्रो सबैभन्दा सजिलो रुटमध्ये एक हो।',
    },
    {
      en: 'The exceptions are alcohol and tobacco, which Hong Kong does tax and control. Leave those out.',
      ne: 'अपवाद मदिरा र चुरोट हुन्, जसमा हङकङले कर र नियन्त्रण गर्छ। ती नराख्नुहोस्।',
    },
  ],
  exampleKg: 5,
  send: [
    meatAllowed({
      en: 'Sukuti and dried meat go on this route with an extra charge per kg of meat. Vacuum-pack it or double-bag it.',
      ne: 'यो रुटमा सुकुटी र सुकाएको मासु मासुको प्रति केजी थप शुल्कमा जान्छ। भ्याकुम प्याक वा दोहोरो प्लास्टिकमा राख्नुहोस्।',
    }),
    dryFood({
      en: 'Gundruk, masala, dalmoth and tea. Keep the shop packets sealed.',
      ne: 'गुन्द्रुक, मसला, दालमोठ र चिया। पसलको प्याकेट नखोल्नुहोस्।',
    }),
    clothes({
      en: 'Festival clothes before Dashain are our busiest Hong Kong parcels.',
      ne: 'दसैंअघिका चाडपर्वका लुगा हाम्रो हङकङतर्फको सबैभन्दा व्यस्त पार्सल हुन्।',
    }),
    documents({
      en: 'Certificates and family papers, flat in a plastic sleeve.',
      ne: 'प्रमाणपत्र र परिवारका कागज, प्लास्टिक खोलमा सिधा राखेर।',
    }),
  ],
  avoid: [
    {
      icon: 'liquid',
      title: { en: 'Alcohol and cigarettes', ne: 'मदिरा र चुरोट' },
      note: {
        en: 'Hong Kong taxes and controls them. Raksi and cigarettes should not go in the box.',
        ne: 'हङकङले यसमा कर र नियन्त्रण गर्छ। रक्सी र चुरोट बाकसमा नराख्नुहोस्।',
      },
    },
    dangerous,
    fakesAndCash,
  ],
  receiver: {
    lead: {
      en: 'Hong Kong has no postcodes. The building, floor and flat number do the job instead.',
      ne: 'हङकङमा पोस्टकोड हुँदैन। भवन, तल्ला र फ्ल्याट नम्बरले त्यो काम गर्छ।',
    },
    needs: [
      { en: 'Full name', ne: 'पूरा नाम' },
      { en: 'Flat, floor and block, then building name', ne: 'फ्ल्याट, तल्ला र ब्लक, अनि भवनको नाम' },
      { en: 'Street and district (e.g. Yau Ma Tei, Kowloon)', ne: 'सडक र जिल्ला (जस्तै Yau Ma Tei, Kowloon)' },
      { en: 'Hong Kong mobile number (8 digits)', ne: 'हङकङ मोबाइल नम्बर (८ अङ्क)' },
    ],
    addressExample: ['Bimala Rai', 'Flat C, 12/F, Block 2', 'Golden Court, 33 Shanghai Street', 'Yau Ma Tei, Kowloon', 'Hong Kong', '+852 9123 4567'],
    tip: {
      en: 'Write the floor as "12/F". Couriers in Hong Kong read that instantly.',
      ne: 'तल्ला "12/F" भनेर लेख्नुहोस्। हङकङका कुरियरले तुरुन्तै बुझ्छन्।',
    },
  },
  arrival: {
    customs: {
      en: 'Hong Kong Customs checks for dutiable goods (alcohol, tobacco). Ordinary personal items pass without duty.',
      ne: 'हङकङ भन्सारले करयोग्य सामान (मदिरा, चुरोट) जाँच्छ। सामान्य व्यक्तिगत सामानमा कर लाग्दैन।',
    },
    delivery: {
      en: 'A local courier delivers to the flat. Many buildings have a guard who can sign.',
      ne: 'स्थानीय कुरियरले फ्ल्याटसम्म ल्याउँछ। धेरै भवनमा गार्डले सही गर्न सक्छन्।',
    },
  },
  faqs: [
    {
      q: { en: 'How is sukuti charged to Hong Kong?', ne: 'हङकङमा सुकुटीको शुल्क कसरी लाग्छ?' },
      a: {
        en: 'The parcel is priced by weight as usual, then the meat weight gets an extra per-kg fee. Tick "meat" in the calculator below to see it.',
        ne: 'पार्सल सामान्य रूपमा तौलअनुसार हिसाब हुन्छ, अनि मासुको तौलमा प्रति केजी थप शुल्क लाग्छ। तलको क्याल्कुलेटरमा "मासु" छानेर हेर्नुहोस्।',
      },
    },
    {
      q: { en: 'Is there duty in Hong Kong?', ne: 'हङकङमा भन्सार कर लाग्छ?' },
      a: {
        en: 'Not on ordinary personal goods. Only alcohol, tobacco and a few fuels are taxed, and we do not ship those.',
        ne: 'सामान्य व्यक्तिगत सामानमा लाग्दैन। मदिरा, चुरोट र केही इन्धनमा मात्र कर लाग्छ, जुन हामी पठाउँदैनौं।',
      },
    },
  ],
  order: ['intro', 'send', 'price', 'receiver', 'avoid', 'journey', 'checklist', 'faq', 'track'],
};

export const philippines: CountryGuide = {
  slug: 'nepal-to-philippines',
  code: 'ph',
  name: { en: 'Philippines', ne: 'फिलिपिन्स' },
  region: 'asia',
  rateCountry: 'Philippines',
  hub: { city: { en: 'Manila', ne: 'मनिला' }, lat: 14.6, lon: 120.98 },
  cities: ['Manila', 'Quezon City', 'Makati', 'Cebu City', 'Davao City'],
  currency: 'Philippine peso (PHP)',
  blurb: {
    en: 'Good for documents and samples. Include the barangay in the address.',
    ne: 'कागजपत्र र नमुनाका लागि राम्रो। ठेगानामा बराङ्गे लेख्नुहोस्।',
  },
  seo: {
    title: 'Nepal to Philippines Courier: Prices and Address Guide | BC Cargo',
    description:
      'Send documents, samples and gifts from Nepal to the Philippines. Live prices by weight, how to write a barangay address, and what to leave out.',
  },
  hero: {
    title: { en: 'Nepal to Manila, Cebu or Davao.', ne: 'नेपालबाट मनिला, सेबु वा डाभाओसम्म।' },
    lede: {
      en: 'Most of what we send to the Philippines is paperwork, samples and gifts for students and families. Here is how to get it there without a hold-up.',
      ne: 'फिलिपिन्स पठाउने धेरैजसो सामान कागजपत्र, नमुना र विद्यार्थी तथा परिवारका लागि उपहार हुन्छन्। अड्किन नदिई कसरी पठाउने भन्ने यहाँ छ।',
    },
  },
  intro: [
    {
      en: 'Philippine addresses depend on the barangay, the smallest local area. A parcel without it can go round in circles inside a big city.',
      ne: 'फिलिपिन्सको ठेगाना बराङ्गे (सबैभन्दा सानो स्थानीय क्षेत्र) मा निर्भर हुन्छ। त्यो नभए ठूलो सहरभित्र पार्सल घुमिरहन सक्छ।',
    },
  ],
  exampleKg: 2,
  send: [
    documents({
      en: 'Academic papers and certificates, often for medical students. Keep originals flat and dry.',
      ne: 'शैक्षिक कागज र प्रमाणपत्र, प्रायः मेडिकल विद्यार्थीका लागि। सक्कल सिधा र सुख्खा राख्नुहोस्।',
    }),
    samples({
      en: 'Product samples for buyers. Mark them "sample, no commercial value" with a rough value.',
      ne: 'खरिदकर्ताका लागि उत्पादनका नमुना। "नमुना, व्यापारिक मूल्य छैन" लेखेर अनुमानित मूल्य दिनुहोस्।',
    }),
    clothes({ en: 'Light clothes travel well; it is warm all year.', ne: 'हल्का लुगा राम्ररी जान्छ; त्यहाँ वर्षभरि न्यानो हुन्छ।' }),
    dryFood({ en: 'Sealed snacks and tea in shop packets.', ne: 'पसलको सिल भएको खाजा र चिया।' }),
  ],
  avoid: [
    noMeat({
      en: 'We do not take meat on this route.',
      ne: 'यो रुटमा हामी मासु लैजाँदैनौं।',
    }),
    dangerous,
    fakesAndCash,
  ],
  receiver: {
    lead: { en: 'Give the courier everything down to the barangay.', ne: 'कुरियरलाई बराङ्गेसम्मको सबै विवरण दिनुहोस्।' },
    needs: [
      { en: 'Full name', ne: 'पूरा नाम' },
      { en: 'House or unit number and street', ne: 'घर वा युनिट नम्बर र सडक' },
      { en: 'Barangay, city and province', ne: 'बराङ्गे, सहर र प्रान्त' },
      { en: '4-digit ZIP code and a +63 mobile', ne: '४ अङ्कको ZIP कोड र +63 मोबाइल' },
    ],
    addressExample: ['Anita Shrestha', 'Unit 5B, 120 Katipunan Avenue', 'Barangay Loyola Heights', 'Quezon City, Metro Manila 1108', 'Philippines', '+63 917 123 4567'],
    tip: { en: 'A nearby landmark ("near the church", "beside the 7-Eleven") genuinely helps couriers there.', ne: 'नजिकको चिनारी ("चर्च नजिक", "7-Eleven छेउ") ले त्यहाँका कुरियरलाई साँच्चै मद्दत गर्छ।' },
  },
  arrival: {
    customs: {
      en: 'The Bureau of Customs checks the parcel. Duty and tax, if any, are paid by the receiver.',
      ne: 'ब्युरो अफ कस्टम्सले पार्सल जाँच्छ। कर लागेमा प्रापकले तिर्छन्।',
    },
    delivery: { en: 'A local courier delivers and calls the +63 number.', ne: 'स्थानीय कुरियरले +63 नम्बरमा फोन गरेर ल्याउँछ।' },
  },
  faqs: [
    {
      q: { en: 'What is a barangay?', ne: 'बराङ्गे भनेको के हो?' },
      a: { en: 'The smallest local area in the Philippines, a bit like a ward. Every address has one.', ne: 'फिलिपिन्सको सबैभन्दा सानो स्थानीय क्षेत्र, हाम्रो वडा जस्तै। हरेक ठेगानामा हुन्छ।' },
    },
    {
      q: { en: 'Can I send food?', ne: 'खाना पठाउन मिल्छ?' },
      a: { en: 'Sealed, packed dry food is fine. Meat and fresh produce are not.', ne: 'सिल भएको सुख्खा खाना मिल्छ। मासु र ताजा सामान मिल्दैन।' },
    },
  ],
  order: ['intro', 'receiver', 'send', 'avoid', 'price', 'journey', 'checklist', 'track', 'faq'],
};

export const taiwan: CountryGuide = {
  slug: 'nepal-to-taiwan',
  code: 'tw',
  name: { en: 'Taiwan', ne: 'ताइवान' },
  region: 'asia',
  rateCountry: 'Taiwan',
  hub: { city: { en: 'Taipei', ne: 'ताइपेई' }, lat: 25.03, lon: 121.56 },
  cities: ['Taipei', 'New Taipei', 'Taichung', 'Kaohsiung', 'Tainan', 'Taoyuan'],
  currency: 'New Taiwan dollar (TWD)',
  blurb: {
    en: 'Very strict on pork and meat, with heavy fines. Everything else is simple.',
    ne: 'सुँगुर र मासुमा धेरै कडा, ठूलो जरिवाना। बाँकी सजिलो।',
  },
  seo: {
    title: 'Send a Parcel from Nepal to Taiwan: Rules and Prices | BC Cargo',
    description:
      'Taiwan fines meat and pork products heavily. What you can send from Nepal instead, how to write a Taiwan address, and live parcel prices by weight.',
  },
  hero: {
    title: { en: 'Taiwan is easy, until there is meat in the box.', ne: 'ताइवान सजिलो छ, बाकसमा मासु नहुञ्जेल।' },
    lede: {
      en: 'Clothes, tea, documents and crafts travel to Taipei and Taichung without fuss. Meat is the one thing that can cost the receiver a large fine.',
      ne: 'लुगा, चिया, कागजपत्र र हस्तकला ताइपेई र ताइचुङसम्म सजिलै पुग्छन्। मासु मात्र त्यस्तो चिज हो जसले प्रापकलाई ठूलो जरिवाना पार्न सक्छ।',
    },
  },
  intro: [
    {
      en: 'Taiwan guards hard against African swine fever. Pork products from abroad are refused, and the fines fall on the receiver. Even a sealed packet of sausage counts.',
      ne: 'ताइवानले अफ्रिकी स्वाइन फिभरविरुद्ध कडा निगरानी गर्छ। विदेशबाट आउने सुँगुरजन्य सामान अस्वीकार हुन्छ र जरिवाना प्रापकले तिर्नुपर्छ। सिल गरिएको ससेजको प्याकेट पनि गनिन्छ।',
    },
  ],
  exampleKg: 3,
  send: [
    dryFood({ en: 'Vegetarian snacks, tea and spices in shop packets. Check labels for meat or lard.', ne: 'पसलको प्याकेटमा शाकाहारी खाजा, चिया र मसला। लेबलमा मासु वा बोसो छ कि हेर्नुहोस्।' }),
    clothes({ en: 'Clothes and shoes are straightforward.', ne: 'लुगा र जुत्ता सजिलै जान्छ।' }),
    crafts({ en: 'Thangka, pashmina and metal crafts are popular gifts in Taiwan.', ne: 'थाङ्का, पश्मिना र धातुका हस्तकला ताइवानमा लोकप्रिय उपहार हुन्।' }),
    documents({ en: 'Certificates and letters, flat and dry.', ne: 'प्रमाणपत्र र चिठी, सिधा र सुख्खा।' }),
  ],
  avoid: [
    noMeat({
      en: 'No meat, especially pork. Check snack labels too: some noodles and biscuits carry meat or pork fat.',
      ne: 'मासु, विशेष गरी सुँगुरको नपठाउनुहोस्। खाजाको लेबल पनि हेर्नुहोस्: केही चाउचाउ र बिस्कुटमा मासु वा सुँगुरको बोसो हुन्छ।',
    }),
    { icon: 'food', title: { en: 'Fresh fruit and plants', ne: 'ताजा फलफूल र बिरुवा' }, note: { en: 'Stopped by plant quarantine.', ne: 'बिरुवा क्वारेन्टाइनले रोक्छ।' } },
    dangerous,
  ],
  receiver: {
    lead: { en: 'Taiwan addresses can be written in English; a Chinese copy is better.', ne: 'ताइवानको ठेगाना अंग्रेजीमा लेख्न मिल्छ; चिनियाँ प्रतिलिपि भए अझ राम्रो।' },
    needs: [
      { en: 'Full name as on their ARC', ne: 'ARC मा जस्तै पूरा नाम' },
      { en: 'Postal code (3 to 6 digits)', ne: 'पोस्टल कोड (३ देखि ६ अङ्क)' },
      { en: 'Floor, number, lane and road', ne: 'तल्ला, नम्बर, गल्ली र सडक' },
      { en: 'Taiwan mobile (09XX)', ne: 'ताइवान मोबाइल (09XX)' },
    ],
    addressExample: ['Hari Bhandari', '3F, No. 15, Lane 20, Sec. 2, Zhongshan N. Rd.', 'Zhongshan Dist., Taipei City 104', 'Taiwan', '+886 912 345 678'],
    tip: { en: '"Lane" and "Alley" numbers matter in Taiwan. Copy them exactly.', ne: 'ताइवानमा "Lane" र "Alley" नम्बर महत्वपूर्ण छन्। जस्ताको तस्तै लेख्नुहोस्।' },
  },
  arrival: {
    customs: { en: 'Taiwan Customs and quarantine inspect the parcel. Any duty is paid by the receiver.', ne: 'ताइवान भन्सार र क्वारेन्टाइनले पार्सल जाँच्छ। कर लागेमा प्रापकले तिर्छन्।' },
    delivery: { en: 'A local courier delivers; convenience-store pickup is also common.', ne: 'स्थानीय कुरियरले ल्याउँछ; कन्भिनियन्स स्टोरबाट लिने चलन पनि छ।' },
  },
  faqs: [
    {
      q: { en: 'What happens if there is pork in the parcel?', ne: 'पार्सलमा सुँगुरको मासु भए के हुन्छ?' },
      a: { en: 'Taiwan can destroy it and fine the receiver a large amount. We check and will not pack it.', ne: 'ताइवानले नष्ट गर्न र प्रापकलाई ठूलो जरिवाना गर्न सक्छ। हामी जाँच्छौं र प्याक गर्दैनौं।' },
    },
    {
      q: { en: 'Can I send tea?', ne: 'चिया पठाउन मिल्छ?' },
      a: { en: 'Yes, packed tea is one of the most common things we send to Taiwan.', ne: 'मिल्छ, प्याक गरिएको चिया ताइवान पठाउने सबैभन्दा सामान्य सामानमध्ये एक हो।' },
    },
  ],
  order: ['intro', 'avoid', 'send', 'receiver', 'price', 'journey', 'checklist', 'faq', 'track'],
};

export const malaysia: CountryGuide = {
  slug: 'nepal-to-malaysia',
  code: 'my',
  name: { en: 'Malaysia', ne: 'मलेसिया' },
  region: 'asia',
  rateCountry: 'Malaysia',
  hub: { city: { en: 'Kuala Lumpur', ne: 'क्वालालम्पुर' }, lat: 3.14, lon: 101.69 },
  cities: ['Kuala Lumpur', 'Shah Alam', 'Klang', 'Penang', 'Johor Bahru', 'Seremban'],
  currency: 'Malaysian ringgit (MYR)',
  blurb: {
    en: 'For workers in factories and hostels. Give the hostel or company address in full.',
    ne: 'कारखाना र होस्टलमा काम गर्नेहरूका लागि। होस्टल वा कम्पनीको पूरा ठेगाना दिनुहोस्।',
  },
  seo: {
    title: 'Nepal to Malaysia Parcel: Prices, Hostel Addresses, Rules | BC Cargo',
    description:
      'Send clothes, food and documents from Nepal to workers in Malaysia. Live prices by weight, how to address a factory hostel, and what customs refuses.',
  },
  hero: {
    title: { en: 'A parcel from home, to the hostel in Malaysia.', ne: 'घरबाट मलेसियाको होस्टलसम्म एउटा पार्सल।' },
    lede: {
      en: 'Many of our Malaysia parcels go to factory hostels around Kuala Lumpur, Klang and Penang. The address is what makes or breaks those deliveries.',
      ne: 'हाम्रा धेरै मलेसिया पार्सल क्वालालम्पुर, क्लाङ र पेनाङ वरपरका कारखाना होस्टलमा जान्छन्। ती डेलिभरी सफल हुने वा नहुने ठेगानामै भर पर्छ।',
    },
  },
  intro: [
    {
      en: 'Hostels and factory gates get dozens of parcels. A name plus "Block C, Room 12" and the company name gets yours to the right bed.',
      ne: 'होस्टल र कारखानाको गेटमा दर्जनौं पार्सल आउँछन्। नाम, "Block C, Room 12" र कम्पनीको नाम भए तपाईंको पार्सल ठीक ठाउँमा पुग्छ।',
    },
  ],
  exampleKg: 5,
  send: [
    clothes({ en: 'Light clothes and festival wear. It is hot and humid all year.', ne: 'हल्का लुगा र चाडपर्वका लुगा। त्यहाँ वर्षभरि गर्मी र ओसिलो हुन्छ।' }),
    dryFood({ en: 'Masala, achar in a sealed jar, chiura and tea.', ne: 'मसला, सिल गरिएको भाँडोमा अचार, चिउरा र चिया।' }),
    documents({ en: 'Copies of passports, certificates and family papers.', ne: 'राहदानीका प्रतिलिपि, प्रमाणपत्र र परिवारका कागज।' }),
    medicine({ en: 'Personal medicine with the prescription, small amounts only.', ne: 'प्रेस्क्रिप्सनसहित व्यक्तिगत औषधि, थोरै मात्र।' }),
  ],
  avoid: [
    noMeat({ en: 'We do not take meat to Malaysia.', ne: 'हामी मलेसियामा मासु लैजाँदैनौं।' }),
    { icon: 'liquid', title: { en: 'Alcohol', ne: 'मदिरा' }, note: { en: 'Leave raksi and other alcohol out.', ne: 'रक्सी र अरू मदिरा नराख्नुहोस्।' } },
    dangerous,
    fakesAndCash,
  ],
  receiver: {
    lead: { en: 'For a hostel, include the company and the room.', ne: 'होस्टल भए कम्पनी र कोठा नम्बर लेख्नुहोस्।' },
    needs: [
      { en: 'Full name as on their passport', ne: 'राहदानीमा जस्तै पूरा नाम' },
      { en: 'Company name, hostel block and room', ne: 'कम्पनीको नाम, होस्टल ब्लक र कोठा' },
      { en: 'Street, town and 5-digit postcode', ne: 'सडक, सहर र ५ अङ्कको पोस्टकोड' },
      { en: 'Malaysian mobile (01X)', ne: 'मलेसियाली मोबाइल (01X)' },
    ],
    addressExample: ['Bishnu Magar', 'c/o ABC Electronics Sdn Bhd, Hostel Block C, Room 12', 'Jalan Perindustrian 4, Kawasan Perindustrian', '41200 Klang, Selangor', 'Malaysia', '+60 12-345 6789'],
    tip: { en: 'Ask the receiver whether the factory accepts parcels at the gate or only at the hostel.', ne: 'कारखानाले गेटमै पार्सल लिन्छ कि होस्टलमा मात्र, प्रापकलाई सोध्नुहोस्।' },
  },
  arrival: {
    customs: { en: 'Royal Malaysian Customs checks the parcel. The receiver pays any duty or tax.', ne: 'मलेसियाली भन्सारले पार्सल जाँच्छ। कर लागेमा प्रापकले तिर्छन्।' },
    delivery: { en: 'A local courier delivers and usually calls first.', ne: 'स्थानीय कुरियरले प्रायः पहिले फोन गरेर ल्याउँछ।' },
  },
  faqs: [
    {
      q: { en: 'Can I send to a factory hostel?', ne: 'कारखानाको होस्टलमा पठाउन मिल्छ?' },
      a: { en: 'Yes, that is common. Add the company name, block and room, and a phone that the receiver answers.', ne: 'मिल्छ, यो सामान्य हो। कम्पनीको नाम, ब्लक, कोठा र प्रापकले उठाउने फोन नम्बर दिनुहोस्।' },
    },
    {
      q: { en: 'Can I send achar?', ne: 'अचार पठाउन मिल्छ?' },
      a: { en: 'Yes, without meat, sealed and double-bagged. Oily pickles count as liquid.', ne: 'मिल्छ, मासु बिना, सिल गरेर दोहोरो प्लास्टिकमा। तेलिलो अचार तरलमा गनिन्छ।' },
    },
  ],
};

export const ASIA_GUIDES = [korea, japan, hongKong, philippines, taiwan, malaysia];
