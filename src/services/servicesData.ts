export interface ServiceDetail {
  id: string;
  slug: string;
  title: string;
  category: 'international';
  mode: 'air' | 'overland' | 'ocean' | 'customs';
  tagline: string;
  description: string;
  sla: string;
  sizeLimit: string;
  bestFor: string;
  equipment: string;
  corridors: string;
  highlights: string[];
  whatWeCarry: string[];
  whatWeDoNotCarry: string[];
  processSteps: Array<{
    stepNumber: number;
    title: string;
    description: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  seoTitle: string;
  seoDescription: string;
}

// Plain, checkable copy only: no capacities, equipment, licences, partner networks or tracking tech
// we cannot show proof for (see docs/OWNER_TODO.md). Prices always come from the live rate sheet.
export const SERVICES_CATALOG: ServiceDetail[] = [
  {
    id: 'srv-air-intl',
    slug: 'international-air-freight',
    title: 'International Air Freight & Courier',
    category: 'international',
    mode: 'air',
    tagline: 'Parcels, documents and cargo by air from Nepal',
    description:
      'Our main service. We pack your parcel, prepare the export papers and send it by air from Nepal to the address abroad. Every shipment gets a tracking number.',
    sla: '2 to 5 days, depending on the country',
    sizeLimit: 'Boxes up to 20 kg each; bigger loads on request',
    bestFor: 'Gifts, clothes, documents, food items, samples and personal parcels',
    equipment: 'Air cargo with our carrier partners',
    corridors: 'Nepal to destinations worldwide; see the country guides',
    highlights: ['Packed by our team in strong boxes', 'Export papers prepared for you', 'Tracking number for every shipment'],
    whatWeCarry: [
      'Clothes, shoes and personal items',
      'Documents and certificates',
      'Dry food, spices, tea and snacks',
      'Handicrafts and gifts',
      'Business samples',
    ],
    whatWeDoNotCarry: [
      'Cash, gold, silver or valuable jewellery',
      'Batteries, gas, and anything flammable or explosive',
      'Fake branded goods',
      'Drugs, weapons and anything illegal in Nepal or the destination',
    ],
    processSteps: [
      { stepNumber: 1, title: 'Check the price', description: 'Use the rates page, or ask us. Prices are by weight and country.' },
      { stepNumber: 2, title: 'Bring or book a pickup', description: 'Bring the parcel to our Hetauda office, or book a pickup from your home.' },
      { stepNumber: 3, title: 'We pack and prepare papers', description: 'We weigh and pack it, and prepare the export documents.' },
      { stepNumber: 4, title: 'Track it to the door', description: 'It leaves Nepal by air. Follow it with your tracking number until it is delivered.' },
    ],
    faqs: [
      {
        question: 'How is the weight charged?',
        answer:
          'By the weight of the packed parcel and the destination country. Big, light parcels can be charged by size instead; we tell you before you pay.',
      },
      {
        question: 'What documents do I need?',
        answer:
          'For personal parcels, usually just your ID and the receiver details. Business shipments may need an invoice and packing list. Ask us for your case.',
      },
      {
        question: 'Can I send liquids or medicine?',
        answer:
          'Some liquids and medicines can go to some countries, at an extra charge, if they are sealed and packed safely. Medicine may need a prescription. Ask us first.',
      },
    ],
    seoTitle: 'International Air Freight & Courier from Nepal | The BC Cargo',
    seoDescription:
      'Air courier from Hetauda, Nepal to destinations worldwide: packing, export papers and a tracking number for every shipment. Check the price online.',
  },
  {
    id: 'srv-road-intl',
    slug: 'cross-border-overland',
    title: 'Road Cargo to India',
    category: 'international',
    mode: 'overland',
    tagline: 'Overland cargo between Nepal and India',
    description:
      'For goods going to India by road. Tell us what you are sending and where, and we arrange the transport and the border papers.',
    sla: '2 to 4 days, depending on the city',
    sizeLimit: 'Ask us for your load',
    bestFor: 'Commercial goods and larger loads going to India',
    equipment: 'Road transport arranged by us',
    corridors: 'Nepal to cities in India',
    highlights: ['Border documents prepared for you', 'Quote based on your load and city'],
    whatWeCarry: ['Commercial goods with invoices', 'Machinery parts and hardware', 'Packaged goods'],
    whatWeDoNotCarry: [
      'Goods without proper invoices',
      'Flammable or hazardous goods',
      'Protected timber, wildlife or forest products',
      'Cash, gold or securities',
    ],
    processSteps: [
      { stepNumber: 1, title: 'Tell us the load', description: 'What it is, how heavy, and where in India it is going.' },
      { stepNumber: 2, title: 'Get a quote', description: 'We give you a price and the documents you need.' },
      { stepNumber: 3, title: 'Border papers', description: 'We prepare the papers for crossing the border.' },
      { stepNumber: 4, title: 'Delivery', description: 'The goods are delivered to the address in India.' },
    ],
    faqs: [
      {
        question: 'Is my road cargo insured?',
        answer: 'Ask us when you book. We can tell you what cover is available for your load.',
      },
    ],
    seoTitle: 'Road Cargo from Nepal to India | The BC Cargo',
    seoDescription: 'Overland cargo from Nepal to India, with border documents prepared for you. Ask us for a quote for your load.',
  },
  {
    id: 'srv-ocean-intl',
    slug: 'ocean-freight-intermodal',
    title: 'Sea Cargo',
    category: 'international',
    mode: 'ocean',
    tagline: 'The lowest cost for big shipments that can wait',
    description:
      'Goods travel by rail to the Indian ports and then by ship to your country. Slower than air, but much cheaper for heavy or bulky shipments. Full or shared containers.',
    sla: '18 to 35 days',
    sizeLimit: 'Shared or full containers',
    bestFor: 'Carpets, furniture, bulk goods and large household moves',
    equipment: 'Rail to the port, then container ship',
    corridors: 'Nepal by rail to Indian ports, then by sea worldwide',
    highlights: ['Shared containers for smaller loads', 'Full containers for big shipments', 'Shipping papers prepared for you'],
    whatWeCarry: ['Carpets and rugs', 'Furniture and household goods', 'Handicrafts in bulk', 'Commercial goods'],
    whatWeDoNotCarry: ['Fresh food', 'Damaged batteries and hazardous goods', 'Antiques without a government permit'],
    processSteps: [
      { stepNumber: 1, title: 'Tell us the load', description: 'What it is, its size and weight, and the destination.' },
      { stepNumber: 2, title: 'Get a quote', description: 'We give you a price for a shared or full container.' },
      { stepNumber: 3, title: 'Packing and papers', description: 'We help pack it for the long trip and prepare the shipping papers.' },
      { stepNumber: 4, title: 'Rail, sea, delivery', description: 'It goes by rail to the port, then by ship, then to the destination.' },
    ],
    faqs: [
      {
        question: 'What is a shared container?',
        answer: 'Your goods share a container with other shipments, so you only pay for the space you use. A full container is only yours.',
      },
      {
        question: 'How long does sea cargo take?',
        answer: 'Usually 18 to 35 days, depending on the country and the sailing. We give you an estimate with your quote.',
      },
    ],
    seoTitle: 'Sea Cargo from Nepal | The BC Cargo',
    seoDescription:
      'Sea cargo from Nepal by rail and ship, in shared or full containers. The low-cost choice for big shipments. Ask us for a quote.',
  },
  {
    id: 'srv-customs-intl',
    slug: 'customs-brokerage-clearance',
    title: 'Customs Help',
    category: 'international',
    mode: 'customs',
    tagline: 'We prepare the papers for Nepal customs',
    description:
      'We check your documents, prepare the export papers and take your goods through Nepal customs, so you do not have to.',
    sla: '1 to 2 days',
    sizeLimit: 'Parcels and cargo',
    bestFor: 'Business exports, handicrafts and anything that needs papers',
    equipment: 'Document preparation',
    corridors: 'Nepal customs for shipments leaving Nepal',
    highlights: ['Document check before you ship', 'Export papers prepared for you', 'Help with permits for statues and art'],
    whatWeCarry: ['Invoices and packing lists', 'Certificates of origin', 'Permits for statues, thangkas and art'],
    whatWeDoNotCarry: ['False or undervalued invoices', 'Protected wildlife products', 'Antiques without a government permit'],
    processSteps: [
      { stepNumber: 1, title: 'Document check', description: 'We look at your invoice, packing list and any permits.' },
      { stepNumber: 2, title: 'Customs declaration', description: 'We prepare and file the export declaration.' },
      { stepNumber: 3, title: 'Inspection', description: 'Customs may inspect the goods; we handle it with them.' },
      { stepNumber: 4, title: 'Released', description: 'Once cleared, the goods continue on their way.' },
    ],
    faqs: [
      {
        question: 'Do statues or art need a permit to leave Nepal?',
        answer:
          'Items that look old, like statues or thangkas, can need a clearance from the Department of Archaeology. Ask us before you buy or pack them.',
      },
    ],
    seoTitle: 'Customs Help for Exports from Nepal | The BC Cargo',
    seoDescription: 'Help with export documents and Nepal customs for shipments leaving Nepal. Ask us what papers you need.',
  },
];

export function getServiceBySlug(slug: string): ServiceDetail | undefined {
  return SERVICES_CATALOG.find((s) => s.slug === slug || s.id === slug);
}
