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
  compliance: string;
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

export const SERVICES_CATALOG: ServiceDetail[] = [
  {
    id: 'srv-air-intl',
    slug: 'international-air-freight',
    title: 'International Air Freight Express',
    category: 'international',
    mode: 'air',
    tagline: 'Daily Priority Cargo Flights Worldwide from Kathmandu',
    description: 'Scheduled air cargo departure manifests connecting Tribhuvan International Airport (KTM) directly to global hub airports across 190+ countries. Engineered for time-critical commercial exports, sensitive electronics, high-value handicrafts, and official documents with end-to-end customs broker escort.',
    sla: '2 to 5 Days Door-to-Door Worldwide',
    sizeLimit: 'Up to 3,000 kg per pallet / Charter for oversize',
    bestFor: 'Urgent exports, pashmina & garments, artisan handicrafts, commercial samples & documents',
    equipment: 'Commercial cargo & widebody passenger holds with dedicated temperature-stabilized compartments',
    corridors: 'Kathmandu (KTM) ➔ Frankfurt, Dubai, Bangkok, Hong Kong, USA, UK, Australia, Japan',
    compliance: 'IATA Cargo Agent Regd, CAAN Cargo Escort License, Nepal Customs Broker License #B-409',
    highlights: [
      'Direct air links to Frankfurt, Dubai, Bangkok, Doha & Hong Kong',
      'Secured customs bonded storage at Kathmandu TIA terminal',
      'Full electronic AWB tracking with telematics milestone logs',
      'Specialized export packing and shrink-wrap palletizing',
    ],
    whatWeCarry: [
      'Apparel, pashmina wool, felt & export textiles',
      'Himalayan specialty coffee, orthodox tea & spices',
      'Thangka paintings, bronze statues & handicrafts',
      'Electronic devices, instruments & commercial components',
      'Diplomatic pouches, legal tenders & urgent business parcels',
    ],
    whatWeDoNotCarry: [
      'Unsealed or fresh perishable meats without cold-chain charter',
      'Unlabelled bulk hazardous chemicals or corrosive acids',
      'Narcotics, psychotropic drugs & non-prescribed controlled substances',
      'Unlicensed firearms, ammunition & explosive materials',
    ],
    processSteps: [
      {
        stepNumber: 1,
        title: 'Collection & Certified Tare Weighing',
        description: 'Doorstep pickup in Kathmandu Valley and Hetauda with digital scale verification and physical tare inspection.',
      },
      {
        stepNumber: 2,
        title: 'Customs Examination & Export Documentation',
        description: 'Formal customs appraisal, clearance under Broker License #B-409, Certificate of Origin verification, and e-AWB generation.',
      },
      {
        stepNumber: 3,
        title: 'Airway Manifest Linehaul',
        description: 'Secured tarmac transfer at TIA Kathmandu to scheduled international flights with locked security seals.',
      },
      {
        stepNumber: 4,
        title: 'Destination Clearance & Doorstep Delivery',
        description: 'Rapid import clearance through partner carriers in destination territories with signed proof of delivery (POD).',
      },
    ],
    faqs: [
      {
        question: 'How is chargeable weight determined for air cargo?',
        answer: 'IATA air courier standard dictates that chargeable weight is the greater of actual scale gross weight (kg) or volumetric weight calculated as (Length × Width × Height in cm) ÷ 5,000.',
      },
      {
        question: 'What documentation is required to export goods by air from Nepal?',
        answer: 'Standard commercial shipments require an export invoice, packing list, PAN/VAT registration copy, and Customs Declaration (Pragyapan Patra). Certain cultural items may require Department of Archaeology permits.',
      },
      {
        question: 'Can I send liquids or pharmaceuticals internationally?',
        answer: 'Yes, provided liquids include a manufacturer Material Safety Data Sheet (MSDS) and leak-proof packaging. Pharmaceuticals require a valid registered doctor prescription and purchase invoice.',
      },
    ],
    seoTitle: 'International Air Freight & Cargo from Nepal | The BC Cargo',
    seoDescription: 'Fast, licensed air cargo from Kathmandu TIA Gateway to 190+ global destinations. Customs clearance, door-to-door tracking, and daily scheduled flights.',
  },
  {
    id: 'srv-road-intl',
    slug: 'cross-border-overland',
    title: 'Cross-Border Overland Linehaul',
    category: 'international',
    mode: 'overland',
    tagline: 'Reliable Heavy Trucking Connecting Nepal, India & Border Ports',
    description: 'Direct bilateral truck freight connecting Nepal industrial corridors with India and transit seaports. Operating multi-axle covered container trucks with satellite GPS tracking, customs transit permits (CTD), and cross-border customs escort through Birgunj ICD and Raxaul.',
    sla: '2 to 4 Days Regional Transit',
    sizeLimit: 'Up to 35 Tons per trailer / Full truckload (FTL)',
    bestFor: 'Heavy manufacturing machinery, raw materials, agricultural commodities, bulk commercial trade',
    equipment: 'Covered container trucks (20ft/32ft/40ft), multi-axle trailers, flatbed carriers',
    corridors: 'Hetauda & Kathmandu ➔ Birgunj Dry Port ➔ Raxaul, Patna, Delhi NCR, Kolkata, Tatopani',
    compliance: 'Nepal-India Bilateral Transit Treaty Authorized Carrier, Motor Vehicle Transit Protocol',
    highlights: [
      'Daily scheduled cross-border linehaul dispatch from Hetauda Central Hub',
      'Real-time GPS satellite telematics tracking on all container rigs',
      'Electronic Seal (E-Seal) compliance for bonded transit corridors',
      'Dedicated customs processing team stationed at Birgunj ICD dry port',
    ],
    whatWeCarry: [
      'Industrial machinery, plant equipment & replacement hardware',
      'Bulk agricultural commodities, pulses, herbs & botanicals',
      'Construction supplies, metal alloys & electrical conduits',
      'Consumer packaged goods (FMCG) & retail inventory',
      'Automotive components, tyres & transport accessories',
    ],
    whatWeDoNotCarry: [
      'Unmanifested commercial cargo without bilaterally approved invoices',
      'Uncontained flammable liquids or uncertified hazardous waste',
      'Prohibited timber, endangered wildlife or rare forest specimens',
      'Unaccompanied negotiable securities, bullion or unregistered currency',
    ],
    processSteps: [
      {
        stepNumber: 1,
        title: 'Yard Staging & Pallet Inspection',
        description: 'Consignment consolidation at Hetauda Central Logistics Yard with gross axle weighing and load distribution checks.',
      },
      {
        stepNumber: 2,
        title: 'Bilateral Transit Documentation',
        description: 'Preparation of Customs Transit Declarations (CTD), electronic sealing, and insurance transit bond registration.',
      },
      {
        stepNumber: 3,
        title: 'Bonded Border Linehaul',
        description: 'Direct highway transport through authorized dry port checkpoints with automated GPS perimeter geofencing.',
      },
      {
        stepNumber: 4,
        title: 'Consignee Yard Delivery',
        description: 'Direct port or factory gate discharge in India or Nepal with signed physical and electronic delivery manifests.',
      },
    ],
    faqs: [
      {
        question: 'What is the volumetric weight divisor for overland road transport?',
        answer: 'Overland surface freight utilizes a standard volumetric divisor of 6,000 cm³/kg, offering more cost-effective volume handling than air courier.',
      },
      {
        question: 'Are shipments insured while traversing cross-border highways?',
        answer: 'Yes, all linehaul shipments carry standard Carrier Legal Liability. Comprehensive Marine/Transit Cargo Insurance covering all-risks can be attached directly during booking.',
      },
    ],
    seoTitle: 'Cross-Border Overland Freight Nepal to India | The BC Cargo',
    seoDescription: 'High-capacity overland container trucking connecting Hetauda, Kathmandu, Birgunj dry port, Delhi NCR, and Kolkata with satellite GPS tracking.',
  },
  {
    id: 'srv-ocean-intl',
    slug: 'ocean-freight-intermodal',
    title: 'International Ocean Freight & Intermodal',
    category: 'international',
    mode: 'ocean',
    tagline: 'Cost-Effective Worldwide Maritime Container Shipping',
    description: 'Comprehensive maritime export logistics bridging landlocked Nepal to global seaports. Operating via rail dry port connections at Birgunj to Kolkata and Visakhapatnam ports, offering both Less-than-Container Load (LCL) consolidation and Full Container Load (FCL) shipping.',
    sla: '18 to 35 Days Global Seaport Delivery',
    sizeLimit: '20ft Container (24 Tons) / 40ft High Cube Container (28 Tons)',
    bestFor: 'High-volume commercial merchandise, woollen carpets, bulk agricultural exports, heavy stonecraft',
    equipment: 'ISO standard 20ft/40ft dry vans, high-cubes, open tops, and reefer temperature containers',
    corridors: 'Birgunj Rail Inland Container Depot ➔ Kolkata Port / Vizag Port ➔ Europe, USA, Middle East',
    compliance: 'CONCOR India rail transit protocols, International Maritime Organization (IMO) compliance',
    highlights: [
      'Economical bulk shipping rates for heavy export consignments',
      'Shared LCL cargo consolidation with secure warehouse grouping in Birgunj',
      'Seamless rail-to-ship intermodal transfers without double-handling',
      'End-to-end bill of lading (B/L) documentation and sea manifest clearance',
    ],
    whatWeCarry: [
      'Hand-knotted woollen & silk carpets and floor coverings',
      'Lokta handmade paper products and wooden art',
      'Herbal extracts, non-perishable agricultural produce & botanicals',
      'Industrial machinery parts & metal castings',
      'High-volume wholesale retail products and craft crates',
    ],
    whatWeDoNotCarry: [
      'Perishable fresh foods without specialized refrigerated containers',
      'Damaged or uncertified lithium-ion batteries exceeding maritime safety limits',
      'Toxic waste, untreated animal skins or biohazardous residues',
      'Stolen goods or uncertified archeological artifacts',
    ],
    processSteps: [
      {
        stepNumber: 1,
        title: 'Container Stuffing & Survey',
        description: 'Professional export packing, moisture-barrier wrapping, and container stuffing at Birgunj or Hetauda warehouse.',
      },
      {
        stepNumber: 2,
        title: 'ICD Rail Transit to Seaport',
        description: 'Bonded freight train transport via Container Corporation of India (CONCOR) directly to Kolkata or Visakhapatnam docks.',
      },
      {
        stepNumber: 3,
        title: 'Vessel Lashing & Maritime Sailing',
        description: 'Loading onto ocean container vessels with international ocean Bill of Lading (B/L) issued and real-time vessel AIS tracking.',
      },
      {
        stepNumber: 4,
        title: 'Port-of-Entry Discharge & Customs',
        description: 'Arrival at destination port, import customs entry processing, and drayage delivery to destination distribution centers.',
      },
    ],
    faqs: [
      {
        question: 'What is the difference between LCL and FCL shipping?',
        answer: 'FCL (Full Container Load) reserves an entire 20ft or 40ft container exclusively for your goods. LCL (Less-than-Container Load) consolidates your cargo with other shippers into a shared container, keeping costs low for volumes between 1 and 15 CBM.',
      },
      {
        question: 'How long does sea shipping take from Nepal to Europe or North America?',
        answer: 'Transit times generally range from 20 to 28 days for European ports (Rotterdam, Hamburg) and 28 to 35 days for US ports (New York, Los Angeles), including rail transit from Birgunj to the seaport.',
      },
    ],
    seoTitle: 'International Ocean Container Shipping Nepal | The BC Cargo',
    seoDescription: 'Reliable sea freight and multimodal intermodal shipping from Nepal via Birgunj dry port to worldwide destinations. LCL consolidation and FCL container dispatch.',
  },
  {
    id: 'srv-customs-intl',
    slug: 'customs-brokerage-clearance',
    title: 'Customs Brokerage & Border Clearance',
    category: 'international',
    mode: 'customs',
    tagline: 'Official Licensed Customs Brokerage (#B-409) at Nepal Gateway Ports',
    description: 'Licensed government customs escort, bonded clearance, and tariff appraisal handling at Tribhuvan International Airport (TIA) Cargo Terminal, Birgunj Inland Container Depot (ICD), Tatopani dry port, and Bhairahawa. We manage Pragyapan Patra preparation, HS code classification, and export certificate attestation.',
    sla: '24 to 48 Hours Port Clearance',
    sizeLimit: 'All parcel & container volumes',
    bestFor: 'Export compliance, commercial invoices, archaeological vetting, hazardous cargo documentation',
    equipment: 'Customs bonded staging docks, physical inspection counters, automated ASYCUDA World electronic filing',
    corridors: 'TIA Cargo Complex Kathmandu, Birgunj Dry Port, Bhairahawa ICD, Tatopani ICP',
    compliance: 'Nepal Department of Customs Licensed Customs Broker #B-409, TEPC Export Certification',
    highlights: [
      'Direct filing into ASYCUDA World customs network',
      'Certified Department of Archaeology vetting for cultural art & statues',
      'Chamber of Commerce Certificate of Origin (COO) processing',
      'Duty drawback processing and bonded transshipment paperwork',
    ],
    whatWeCarry: [
      'Export commercial invoices & packing manifests',
      'Certificates of Origin, GSP forms & bilateral trade permits',
      'Archaeological clearance letters for statuary and handicraft',
      'Phytosanitary & quarantine certificates for herbs and teas',
    ],
    whatWeDoNotCarry: [
      'Fraudulent invoice undervaluation or unmanifested contraband',
      'CITES Appendix I restricted wildlife derivatives',
      'Uncertified antiquities exceeding 100 years of age without government permit',
      'Non-compliant hazardous chemical consignments without MSDS',
    ],
    processSteps: [
      {
        stepNumber: 1,
        title: 'Document Audit & Tariff Classification',
        description: 'Review commercial invoices, packing lists, and assign Harmonized System (HS) codes under Nepal Customs Tariff.',
      },
      {
        stepNumber: 2,
        title: 'ASYCUDA World Digital Entry',
        description: 'Submission of formal Customs Declaration (Pragyapan Patra) and electronic generation of duty assessment notices.',
      },
      {
        stepNumber: 3,
        title: 'Physical Inspection & Cargo Escort',
        description: 'Coordination with customs appraisal officers at TIA or dry ports for visual inspection and non-intrusive container scanning.',
      },
      {
        stepNumber: 4,
        title: 'Release Order & Gate Pass Clearance',
        description: 'Payment of statutory charges, issuance of customs out-of-charge pass, and handover to carrier tarmac linehaul.',
      },
    ],
    faqs: [
      {
        question: 'What is Broker License #B-409?',
        answer: 'License #B-409 is our official Customs Agent certification issued by the Nepal Department of Customs, authorizing BC Cargo to legally represent consignors in formal export/import declarations.',
      },
      {
        question: 'Do I need special clearance to export antique-looking items from Nepal?',
        answer: 'Yes. Any cultural craft, statue, or thangka resembling antique artifacts requires verification and an archaeological clearance wax seal from the Department of Archaeology.',
      },
    ],
    seoTitle: 'Nepal Customs Brokerage & Export Clearance | The BC Cargo',
    seoDescription: 'Licensed customs agent #B-409 providing rapid clearance, ASYCUDA filing, Certificate of Origin, and export documentation at Kathmandu TIA and Birgunj dry port.',
  },
];

export function getServiceBySlug(slug: string): ServiceDetail | undefined {
  return SERVICES_CATALOG.find((s) => s.slug === slug || s.id === slug);
}
