export interface CountryPageConfig {
  slug: string;
  countryName: string;
  countryCode: string;
  flag: string;
  rateGroup: string;
  headline: string;
  subheadline: string;
  metaTitle: string;
  metaDescription: string;
  transitTime: string;
  departureFrequency: string;
  originHub: string;
  packingRules: string[];
  restrictedItems: string[];
  allowedSpecial: string[];
  faqs: { question: string; answer: string }[];
  sampleWeightKg: number;
}

export const COUNTRY_LANDING_DATA: Record<string, CountryPageConfig> = {
  'send-parcel-nepal-to-south-korea': {
    slug: 'send-parcel-nepal-to-south-korea',
    countryName: 'South Korea',
    countryCode: 'KR',
    flag: '🇰🇷',
    rateGroup: 'Korea',
    headline: 'Send Parcel from Hetauda & Nepal to South Korea',
    subheadline: 'Fast, secure air cargo and courier service from our Hetauda Central Hub to Seoul, Busan, Incheon, and across South Korea. Live per-kg rates, box packaging, and customs clearing.',
    metaTitle: 'Send Parcel from Hetauda Nepal to South Korea | BC Cargo',
    metaDescription: 'Send parcels and cargo from Hetauda, Nepal to South Korea. Doorstep pickup, air freight via Incheon, about 10 days delivery, live tariffs and customs help.',
    transitTime: '10 days',
    departureFrequency: 'Daily scheduled air departures',
    originHub: 'School Road -4, Hetauda, Nepal',
    packingRules: [
      'Maximum 20 kg weight per export carton.',
      'Corrugated double-wall boxes required for electronic scale transit.',
      'Receiver Korean phone number and Personal Customs Clearance Code (PCCC) or Alien Registration Card (ARC) recommended.',
    ],
    restrictedItems: [
      'Meat and meat-containing products (Sukuti, sausages, jerky) are strictly blocked for South Korea by agricultural import laws.',
      'Flammable items, lithium batteries without manufacturer MSDS.',
    ],
    allowedSpecial: [
      'Nepali spices, dry foods, teas, and packaged items (properly labelled).',
      'Handicrafts, pashmina, clothing, and garments.',
      'Approved medicines and liquids with certified packaging.',
    ],
    faqs: [
      {
        question: 'How do I send a parcel from Hetauda to South Korea?',
        answer: 'You can bring your items to our Hetauda Central Office at School Road -4, Hetauda, or schedule a doorstep pickup. We weigh, inspect, pack into standard 20 kg boxes, and generate your live quotation bill and tracking number.',
      },
      {
        question: 'Can I send meat products like Sukuti to Korea?',
        answer: 'No. South Korean quarantine regulations strictly prohibit all animal meat and livestock products from Nepal. We strictly enforce this to prevent customs confiscation and penalties.',
      },
      {
        question: 'How long does air cargo take from Hetauda to Seoul or Busan?',
        answer: 'Air cargo generally reaches South Korea in about 10 days after customs departure, followed by local Korean courier delivery to your recipient’s door.',
      },
      {
        question: 'What are the charges for sending packages to South Korea?',
        answer: 'Rates are calculated live from our official sheet. Small parcels under 10 kg use half-kilogram step pricing, while shipments of 10 kg and above receive discounted per-kilogram wholesale rates (e.g. 10+ kg and 20+ kg tier discounts). Box packaging is Rs 1,100 per box.',
      },
    ],
    sampleWeightKg: 10,
  },

  'send-parcel-nepal-to-malaysia': {
    slug: 'send-parcel-nepal-to-malaysia',
    countryName: 'Malaysia',
    countryCode: 'MY',
    flag: '🇲🇾',
    rateGroup: 'Malaysia',
    headline: 'Express Parcel Delivery from Hetauda & Nepal to Malaysia',
    subheadline: 'Reliable air courier for families, students, and businesses from Hetauda Central Hub to Kuala Lumpur, Penang, Johor Bahru, and throughout Malaysia.',
    metaTitle: 'Send Courier from Hetauda Nepal to Malaysia | BC Cargo',
    metaDescription: 'Economical cargo and courier services from Hetauda and Kathmandu to Malaysia. Fast 3–5 day delivery to Kuala Lumpur and Selangor with full customs documentation.',
    transitTime: '3–5 business days',
    departureFrequency: '4 scheduled flights weekly',
    originHub: 'School Road -4, Hetauda, Nepal',
    packingRules: [
      'Maximum 20 kg per export carton (multi-box partition available).',
      'Receiver Malaysian address, postal code, and active WhatsApp number required.',
      'High-grade sealing tape and moisture protection recommended.',
    ],
    restrictedItems: [
      'Uncertified meat and fresh perishable items.',
      'Counterfeit goods, non-prescribed pharmaceuticals, and narcotics.',
    ],
    allowedSpecial: [
      'Personal effects, garments, winter wear, and Nepali handicrafts.',
      'Dry packaged groceries, tea, and traditional goods.',
      'Prescription medicines with valid doctor prescription.',
    ],
    faqs: [
      {
        question: 'Where can I drop off goods in Hetauda for shipment to Malaysia?',
        answer: 'Our main office is located at School Road -4, Hetauda. Consignments are packed securely and dispatched via our daily logistics network.',
      },
      {
        question: 'How long does it take for a package to reach Kuala Lumpur?',
        answer: 'Normal transit time from Hetauda to Kuala Lumpur doorstep is 3 to 5 business days with live online tracking.',
      },
      {
        question: 'Are home pickups available in Hetauda?',
        answer: 'Yes, we provide doorstep parcel pickup across Hetauda and surrounding areas in Makwanpur for international freight.',
      },
    ],
    sampleWeightKg: 10,
  },

  'send-parcel-nepal-to-uk': {
    slug: 'send-parcel-nepal-to-uk',
    countryName: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    rateGroup: 'UK',
    headline: 'Send Parcel & Cargo from Hetauda & Nepal to United Kingdom',
    subheadline: 'Priority air courier from Hetauda to London, Birmingham, Manchester, Edinburgh, and across Great Britain. Certified compliance and meat packaging available.',
    metaTitle: 'Send Parcel from Hetauda Nepal to the UK | BC Cargo',
    metaDescription: 'Send personal packages, legal documents, dry foods, and commercial goods from Hetauda Nepal to the UK. 3–5 day delivery to London and nationwide.',
    transitTime: '3–5 business days',
    departureFrequency: 'Daily air departures',
    originHub: 'School Road -4, Hetauda, Nepal',
    packingRules: [
      'Max 20 kg per box.',
      'Complete UK postal code and recipient contact number essential for Royal Mail / DPD dispatch.',
      'Commercial invoice / packing list declaration signed at intake.',
    ],
    restrictedItems: [
      'Narcotics, aerosol cans, and undeclared hazardous liquids.',
    ],
    allowedSpecial: [
      'Permitted cured meat (Sukuti) under special compliance surcharge (Rs 800/kg).',
      'Sealed liquids and pickles under handling surcharge (Rs 700 per bottle).',
      'Verified medicine with prescription (contact us for the price).',
    ],
    faqs: [
      {
        question: 'Can I send dried meat (Sukuti) to the UK?',
        answer: 'Yes! The United Kingdom is one of the destinations where meat shipping is permitted under strict compliance guidelines and our special meat surcharge of Rs 800 per kg.',
      },
      {
        question: 'How are UK shipments weighed and billed in Hetauda?',
        answer: 'We weigh your shipment on electronic scales at School Road -4, Hetauda. If total weight exceeds 20 kg, it is automatically divided into 20 kg boxes for safety and IATA airline handling.',
      },
    ],
    sampleWeightKg: 20,
  },

  'send-parcel-nepal-to-japan': {
    slug: 'send-parcel-nepal-to-japan',
    countryName: 'Japan',
    countryCode: 'JP',
    flag: '🇯🇵',
    rateGroup: 'Japan',
    headline: 'Air Cargo & Courier from Hetauda & Nepal to Japan',
    subheadline: 'Fast air transport for personal items, student necessities, and commercial samples from Hetauda Central Hub to Tokyo, Osaka, Nagoya, and Fukuoka.',
    metaTitle: 'Send Parcel from Hetauda Nepal to Japan | BC Cargo',
    metaDescription: 'Send parcels and courier from Hetauda, Nepal to Japan. About 15 days delivery to Tokyo and all prefectures. Live pricing and customs clearance.',
    transitTime: '15 days',
    departureFrequency: 'Daily flight connections via Tokyo Narita (NRT)',
    originHub: 'School Road -4, Hetauda, Nepal',
    packingRules: [
      'Standard box size max 20 kg.',
      'Japanese recipient address with Kanji/Romaji and local telephone number required.',
    ],
    restrictedItems: [
      'Animal meat, uncertified agricultural produce, soil, and plants prohibited under Japanese quarantine laws.',
    ],
    allowedSpecial: [
      'Handicrafts, felt items, thangka paintings, and garments.',
      'Certified dry tea and approved processed foods.',
    ],
    faqs: [
      {
        question: 'What is the transit time from Hetauda to Tokyo?',
        answer: 'Air cargo generally arrives at Tokyo Narita or Haneda in about 15 days, clearing customs swiftly.',
      },
      {
        question: 'Is meat allowed to Japan?',
        answer: 'No, Japanese customs regulations strictly prohibit meat products from Nepal without specialized bilateral import certification.',
      },
    ],
    sampleWeightKg: 10,
  },

  'send-parcel-nepal-to-europe': {
    slug: 'send-parcel-nepal-to-europe',
    countryName: 'Europe',
    countryCode: 'EU',
    flag: '🇪🇺',
    rateGroup: 'Europe',
    headline: 'Send Cargo & Courier from Hetauda & Nepal to Europe',
    subheadline: 'Comprehensive air logistics connecting Hetauda to Germany, France, Italy, Spain, Netherlands, Portugal, Poland, and the entire European Union.',
    metaTitle: 'Send Cargo from Hetauda Nepal to Europe | BC Cargo',
    metaDescription: 'Send personal and commercial cargo from Hetauda to Europe (EU). Fast customs-cleared air freight to Frankfurt, Paris, Rome, Madrid, and across the EU.',
    transitTime: 'Ask for current estimate',
    departureFrequency: 'Daily air freight departures',
    originHub: 'School Road -4, Hetauda, Nepal',
    packingRules: [
      'Max 20 kg per export carton.',
      'EU EORI number required for commercial consignments; personal shipments require recipient passport/ID info.',
    ],
    restrictedItems: [
      'Unregulated perishable goods, ivory, counterfeit items.',
    ],
    allowedSpecial: [
      'Permitted cured meat under European quarantine compliance (Rs 800/kg).',
      'Nepali handicrafts, carpets, singing bowls, and organic tea.',
    ],
    faqs: [
      {
        question: 'Which European countries do you ship to from Hetauda?',
        answer: 'We deliver door-to-door across all major EU nations including Germany, France, Italy, Spain, Portugal, Netherlands, Belgium, Switzerland, Austria, and Scandinavia.',
      },
      {
        question: 'How do European customs taxes work?',
        answer: 'Recipients may be assessed standard VAT or customs duty by local EU customs authorities based on the declared item value.',
      },
    ],
    sampleWeightKg: 15,
  },

  'send-parcel-nepal-to-gulf': {
    slug: 'send-parcel-nepal-to-gulf',
    countryName: 'UAE & Gulf Countries',
    countryCode: 'AE',
    flag: '🇦🇪',
    rateGroup: 'Gulf',
    headline: 'Fast Parcel Service from Hetauda & Nepal to UAE & Gulf',
    subheadline: 'Affordable, scheduled air courier from Hetauda Central Hub to Dubai, Abu Dhabi, Sharjah, Qatar, Saudi Arabia, Bahrain, and Oman.',
    metaTitle: 'Send Courier from Hetauda Nepal to Dubai & Gulf | BC Cargo',
    metaDescription: 'Fast courier service from Hetauda to Dubai, UAE, Qatar, and Gulf region. Live per-kg rates and complete tracking.',
    transitTime: 'Ask for current estimate',
    departureFrequency: 'Daily direct flights to Dubai and Doha',
    originHub: 'School Road -4, Hetauda, Nepal',
    packingRules: [
      'Maximum 20 kg per box.',
      'Local UAE / Gulf contact mobile number with WhatsApp active for courier dispatch.',
    ],
    restrictedItems: [
      'Religious contraband, unapproved medications, poppy seeds, and pork products.',
    ],
    allowedSpecial: [
      'Nepali foods, homemade pickles (with sealed liquid packing fee), dry noodles, and clothing.',
    ],
    faqs: [
      {
        question: 'How long does a package take from Hetauda to Dubai?',
        answer: 'Delivery time to Dubai and Abu Dhabi depends on flights and customs. Ask us for the current estimate before you ship.',
      },
      {
        question: 'Can I send homemade pickles to Dubai?',
        answer: 'Yes! Sealed liquids and pickles can be shipped with our specialized leak-proof packaging surcharge (Rs 700 per bottle).',
      },
    ],
    sampleWeightKg: 10,
  },

  'send-parcel-nepal-to-hong-kong': {
    slug: 'send-parcel-nepal-to-hong-kong',
    countryName: 'Hong Kong',
    countryCode: 'HK',
    flag: '🇭🇰',
    rateGroup: 'Hong Kong',
    headline: 'Express Air Cargo from Hetauda & Nepal to Hong Kong',
    subheadline: 'Priority air freight connecting Hetauda to Hong Kong Island, Kowloon, and New Territories with meat compliance support and fast customs entry.',
    metaTitle: 'Air Cargo from Hetauda Nepal to Hong Kong | BC Cargo',
    metaDescription: 'Send courier and air freight from Hetauda Nepal to Hong Kong. Direct flights, special meat compliance rate, fast 2–4 day delivery, and online tracking.',
    transitTime: '2–4 business days',
    departureFrequency: 'Daily flights via Hong Kong International Airport (HKG)',
    originHub: 'School Road -4, Hetauda, Nepal',
    packingRules: [
      'Maximum 20 kg per carton.',
      'Hong Kong delivery address and local phone number.',
    ],
    restrictedItems: [
      'E-cigarettes, lithium power banks without declarations, flammable items.',
    ],
    allowedSpecial: [
      'Meat compliance permitted under specialized Hong Kong tariff (Rs 1,100/kg).',
      'Nepali teas, jewelry, rudraksha, and Buddhist artifacts.',
    ],
    faqs: [
      {
        question: 'Can I send dried meat (Sukuti) to Hong Kong?',
        answer: 'Yes! Hong Kong allows meat cargo under our specialized meat compliance surcharge of Rs 1,100 per kg.',
      },
      {
        question: 'Where do I drop my parcel in Hetauda for Hong Kong?',
        answer: 'Visit our Central Office at School Road -4, Hetauda (Phone: 057-591816 / 9855019485) for instant scale weighing and booking.',
      },
    ],
    sampleWeightKg: 10,
  },

  'send-parcel-nepal-to-usa': {
    slug: 'send-parcel-nepal-to-usa',
    countryName: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    rateGroup: 'USA',
    headline: 'Air Cargo & Courier from Hetauda & Nepal to USA',
    subheadline: 'Fast, trackable air freight from Hetauda to New York, California, Texas, and all 50 US states. FDA prior notice support and certified export packaging.',
    metaTitle: 'Send Parcel from Hetauda Nepal to USA | BC Cargo',
    metaDescription: 'Send parcel and commercial air cargo from Hetauda Nepal to the United States. 4–6 day delivery nationwide with tracking, customs assistance, and live sheet rates.',
    transitTime: '4–6 business days',
    departureFrequency: 'Daily air cargo manifests',
    originHub: 'School Road -4, Hetauda, Nepal',
    packingRules: [
      'Max 20 kg per carton.',
      'Recipient US street address (no P.O. Box for courier air waybill) with 5-digit ZIP code.',
      'FDA registration or Prior Notice assistance provided for commercial food exports.',
    ],
    restrictedItems: [
      'Meat and meat-based food items are prohibited under US Department of Agriculture (USDA) animal health restrictions.',
    ],
    allowedSpecial: [
      'Pashmina, handicrafts, felt products, singing bowls, and woolen wear.',
      'Commercial tea, spices, and non-meat dry processed foods.',
      'Prescribed medicines with English prescription and doctor authorization.',
    ],
    faqs: [
      {
        question: 'Can I send meat items to the USA?',
        answer: 'No, US agricultural regulations prohibit all meat items and animal-origin food products from Nepal.',
      },
      {
        question: 'How do I send commercial goods or handicrafts from Hetauda to America?',
        answer: 'Our customs brokerage team assists with commercial export declarations, certificate of origin, and courier linehaul direct to US ports.',
      },
    ],
    sampleWeightKg: 20,
  },
};
