import { Shipment, HubInfo } from '../types';

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    trackingNumber: 'BC-90214-HKG',
    bookingRef: 'BK-2026-90214',
    mode: 'air',
    serviceName: 'Air Freight Express (Priority Charters)',
    status: 'In Transit',
    commodity: 'Specialized Garments & Precision Optics',
    shipper: {
      name: 'Prakash Adhikari',
      company: 'Himalayan Textiles Corp.',
      city: 'Hetauda',
      country: 'Nepal',
      address: 'Plot 42, Hetauda Industrial District (HID)',
      contact: '+977-57-521190'
    },
    consignee: {
      name: 'Helmut Schneider',
      company: 'Schneider Optik & Textil GmbH',
      city: 'Frankfurt am Main',
      country: 'Germany',
      address: 'Mainzer Landstraße 180, 60327 Frankfurt',
      contact: '+49 69 7589 200'
    },
    origin: 'Hetauda, Nepal',
    originHub: 'Hetauda Global HQ Hub',
    destination: 'Frankfurt (FRA), Germany',
    destinationGateway: 'FRA (Lufthansa Cargo Hub 1)',
    carrierInfo: 'Flight BC-702 / Connecting LH-739',
    grossWeightKg: 2450,
    chargeableWeightKg: 2800,
    volumeCbm: 8.40,
    pieces: 8,
    incoterm: 'CIF - Cost, Insurance, Freight',
    estimatedDelivery: 'Oct 26, 2026 • 14:30 CET',
    bookingDate: 'Oct 23, 2026',
    telemetry: {
      temperature: '+18.4°C (Optimal)',
      eSealStatus: 'E-Seal #NP-88319 Verified',
      sealNumber: 'NP-88319-BC',
      batteryLevel: '94%',
      currentCoordinates: { lat: 22.3080, lng: 113.9185 }, // HKG
      altitude: '10,800 m',
      speed: '860 km/h',
      lastUpdated: '12 mins ago (Live Telemetry)'
    },
    milestones: [
      {
        id: 'm1',
        title: 'Shipment Accepted & Calibrated',
        location: 'The BC Cargo Regional Depot, Kantirajpath, Hetauda-4, Nepal',
        timestamp: 'Oct 24, 08:30 NPT',
        status: 'completed',
        verifier: 'Verified by Dispatcher #12 (Hetauda HQ)',
        notes: 'Dimensions checked, tamper-proof barcode security seals applied.'
      },
      {
        id: 'm2',
        title: 'Customs Export Clearance & Bonded Transit to TIA',
        location: 'Birgunj Customs / Kathmandu Expressway Corridor',
        timestamp: 'Oct 24, 15:45 NPT',
        status: 'completed',
        verifier: 'Broker Clearance Lic. #B-409',
        notes: 'ASYCUDA World Export Pragyapan Patra #EX-88902 registered.'
      },
      {
        id: 'm3',
        title: 'Air Manifest Loaded & Departed from Kathmandu (KTM)',
        location: 'Runway Gate 4, Tribhuvan International Airport (TIA) Cargo Precinct',
        timestamp: 'Oct 25, 02:10 NPT',
        status: 'completed',
        verifier: 'IATA Ramp Officer Raman K.',
        notes: 'Aircraft departure confirmed on schedule.'
      },
      {
        id: 'm4',
        title: 'In-Transit Inspection & Consolidation (HKG Hub)',
        location: 'Hong Kong International Airport Cargo Complex',
        timestamp: 'Oct 25, 11:20 HKT',
        status: 'current',
        verifier: 'Telemetry Station HK-4',
        notes: 'Active connecting transfer to Flight LH-739 bound for Frankfurt.'
      },
      {
        id: 'm5',
        title: 'Arrival & Import Customs Release at Frankfurt (FRA)',
        location: 'Lufthansa Cargo Center, Gateway Frankfurt Main, Germany',
        timestamp: 'Estimated: Oct 26, 14:30 CET',
        status: 'pending',
        notes: 'Final delivery via European Bonded Road Feeder Service.'
      }
    ]
  },
  {
    trackingNumber: 'BC-88192-DXB',
    bookingRef: 'BK-2026-88192',
    mode: 'express',
    serviceName: 'Express Courier Door-to-Airport',
    status: 'In Transit',
    commodity: 'Handmade Pashmina Shawls & Organic Tea',
    shipper: {
      name: 'Sunita Shakya',
      company: 'Lumbini Handicrafts & Weavers',
      city: 'Kathmandu',
      country: 'Nepal',
      address: 'Thamel Trade Center, Ward 26',
      contact: '+977-1-4429910'
    },
    consignee: {
      name: 'Tariq Al-Mansoor',
      company: 'Gulf Luxury Imports LLC',
      city: 'Dubai',
      country: 'United Arab Emirates',
      address: 'Al Quoz Logistics District 3, Dubai',
      contact: '+971 4 399 8820'
    },
    origin: 'Kathmandu, Nepal',
    originHub: 'Kathmandu Air Cargo Complex (TIA)',
    destination: 'Dubai (DXB), UAE',
    destinationGateway: 'DXB Cargo Terminal 2',
    carrierInfo: 'FlyDubai Cargo FZ-576',
    grossWeightKg: 185,
    chargeableWeightKg: 210,
    volumeCbm: 1.25,
    pieces: 4,
    incoterm: 'DAP - Delivered at Place',
    estimatedDelivery: 'Oct 25, 2026 • 21:00 GST',
    bookingDate: 'Oct 24, 2026',
    telemetry: {
      temperature: '+21.0°C (Normal)',
      eSealStatus: 'E-Seal #NP-55412 Active',
      sealNumber: 'NP-55412-DXB',
      batteryLevel: '98%',
      currentCoordinates: { lat: 25.2532, lng: 55.3657 },
      altitude: 'In Descent (1,200m)',
      speed: '410 km/h',
      lastUpdated: '5 mins ago'
    },
    milestones: [
      {
        id: 'm1',
        title: 'Doorstep Courier Collection',
        location: 'Thamel, Kathmandu Depot',
        timestamp: 'Oct 24, 11:00 NPT',
        status: 'completed',
        verifier: 'Courier Agent Bike #09',
        notes: 'Handover complete, weighing and dimension laser verified.'
      },
      {
        id: 'm2',
        title: 'Customs Pre-Clearance at TIA',
        location: 'Kathmandu Air Cargo Terminal',
        timestamp: 'Oct 24, 18:30 NPT',
        status: 'completed',
        verifier: 'Nepal Customs Desk 3',
        notes: 'Export duty drawback and origin certification validated.'
      },
      {
        id: 'm3',
        title: 'Flight Uplift & Trans-Arabian Transit',
        location: 'Airborne KTM-DXB Corridor',
        timestamp: 'Oct 25, 14:15 NPT',
        status: 'current',
        verifier: 'ATC Automated Telemetry',
        notes: 'ETA Dubai within 45 minutes.'
      },
      {
        id: 'm4',
        title: 'Direct Courier Delivery to Consignee',
        location: 'Dubai Al Quoz, UAE',
        timestamp: 'Estimated: Oct 25, 21:00 GST',
        status: 'pending',
        notes: 'Assigned to Dubai Gulf Express van route.'
      }
    ]
  },
  {
    trackingNumber: 'NP-4421-DEL',
    bookingRef: 'BK-2026-4421',
    mode: 'overland',
    serviceName: 'Cross-Border Overland Linehaul',
    status: 'In Transit',
    commodity: 'Precision Industrial Bearings & Valve Spares',
    shipper: {
      name: 'Bimal Shrestha',
      company: 'Narayani Heavy Machinery Spares',
      city: 'Hetauda',
      country: 'Nepal',
      address: 'Kantirajpath, Hetauda-4',
      contact: '+977-57-520112'
    },
    consignee: {
      name: 'Rajesh Malhotra',
      company: 'NCR Industrial Engineering Ltd.',
      city: 'Faridabad (Delhi NCR)',
      country: 'India',
      address: 'Plot 88, Sector 25, Industrial Area, Faridabad',
      contact: '+91 129 401 9890'
    },
    origin: 'Hetauda, Nepal',
    originHub: 'Hetauda Global HQ Hub',
    destination: 'Delhi NCR, India',
    destinationGateway: 'Tughlakabad Dry Port / ICD Patparganj',
    carrierInfo: 'BC Cargo Fleet Truck #BA-2-KHA-8840',
    grossWeightKg: 14200,
    chargeableWeightKg: 14200,
    volumeCbm: 38.0,
    pieces: 22,
    incoterm: 'FOB - Free on Board',
    estimatedDelivery: 'Oct 26, 2026 • 09:00 IST',
    bookingDate: 'Oct 24, 2026',
    telemetry: {
      temperature: '+24.5°C Ambient',
      eSealStatus: 'Smart GPS E-Lock #BC-TRK-771',
      sealNumber: 'ECTS-IN-NP-9921',
      batteryLevel: '89%',
      currentCoordinates: { lat: 26.8467, lng: 80.9462 }, // Near Lucknow on NH27
      speed: '62 km/h',
      lastUpdated: '8 mins ago'
    },
    milestones: [
      {
        id: 'm1',
        title: 'Factory Stuffed & Multi-Axle Trailer Dispatched',
        location: 'Hetauda Industrial Estate Yard',
        timestamp: 'Oct 24, 14:00 NPT',
        status: 'completed',
        verifier: 'Transport Lead Saroj R.',
        notes: 'Hydraulic tie-downs inspected, electronic seal locked.'
      },
      {
        id: 'm2',
        title: 'Integrated Check Post (ICP) Birgunj-Raxaul Cleared',
        location: 'Nepal-India Border Raxaul ICP',
        timestamp: 'Oct 24, 22:30 NPT',
        status: 'completed',
        verifier: 'Indian Border Land Ports Authority',
        notes: 'Electronic Cargo Tracking System (ECTS) seal energized.'
      },
      {
        id: 'm3',
        title: 'Express Highway Linehaul (NH27 Corridor)',
        location: 'En route Uttar Pradesh to Delhi NCR',
        timestamp: 'Oct 25, 10:00 IST',
        status: 'current',
        verifier: 'Fleet Telemetry Unit #8840',
        notes: 'Driver rotation completed at Gorakhpur transshipment bay.'
      },
      {
        id: 'm4',
        title: 'Delivery to Industrial Plant Gate',
        location: 'Sector 25, Faridabad, Delhi NCR',
        timestamp: 'Estimated: Oct 26, 09:00 IST',
        status: 'pending',
        notes: 'Pre-scheduled dock slot confirmed.'
      }
    ]
  },
  {
    trackingNumber: 'BC-7731-SGN',
    bookingRef: 'BK-2026-7731',
    mode: 'ocean',
    serviceName: 'Ocean & Multimodal Container Freight',
    status: 'In Transit',
    commodity: 'Organic Orthodox Himalayan Tea & Cardamom',
    shipper: {
      name: 'Deepak Rai',
      company: 'Ilam High-Mountain Tea Estates',
      city: 'Biratnagar',
      country: 'Nepal',
      address: 'Main Road, Biratnagar-3',
      contact: '+977-21-523340'
    },
    consignee: {
      name: 'Nguyen Van Minh',
      company: 'Saigon Agro Import-Export Joint Stock',
      city: 'Ho Chi Minh City',
      country: 'Vietnam',
      address: 'District 4, Ben Nghe, Ho Chi Minh City',
      contact: '+84 28 3822 5590'
    },
    origin: 'Biratnagar, Nepal',
    originHub: 'Birgunj ICD Inland Container Depot',
    destination: 'Cat Lai Port, Ho Chi Minh City (SGN), Vietnam',
    destinationGateway: 'Cat Lai Port International Terminal',
    carrierInfo: 'Vessel: Maersk Danum / Rail ICD Train #NP-490',
    grossWeightKg: 21800,
    chargeableWeightKg: 21800,
    volumeCbm: 65.0,
    pieces: 1, // 1x 40ft High Cube Container
    incoterm: 'CIF - Cost, Insurance, Freight',
    estimatedDelivery: 'Nov 04, 2026 • 10:00 ICT',
    bookingDate: 'Oct 20, 2026',
    telemetry: {
      temperature: '+19.2°C (Dry Container Log)',
      eSealStatus: 'Maersk High-Security Bolt Seal #MS-99381',
      sealNumber: 'MS-99381',
      batteryLevel: '91%',
      currentCoordinates: { lat: 13.0827, lng: 80.2707 }, // Bay of Bengal / Chennai offshore
      speed: '16.4 knots',
      lastUpdated: '22 mins ago'
    },
    milestones: [
      {
        id: 'm1',
        title: 'Container Sealed at Birgunj Inland Port',
        location: 'Birgunj Dry Port (ICD Sirsiya)',
        timestamp: 'Oct 20, 16:00 NPT',
        status: 'completed',
        verifier: 'Customs Officer P. Nepal',
        notes: 'Phytosanitary inspection certificate attached.'
      },
      {
        id: 'm2',
        title: 'Bonded Rail Freight to Kolkata Port (Netaji Subhash Dock)',
        location: 'Concor Dedicated Freight Corridor',
        timestamp: 'Oct 22, 18:00 IST',
        status: 'completed',
        verifier: 'Kolkata Port Trust Yard Manager',
        notes: 'Container loaded to feeder vessel.'
      },
      {
        id: 'm3',
        title: 'Maritime Transit - Bay of Bengal Corridor',
        location: 'Vessel: Maersk Danum en route Singapore / SGN',
        timestamp: 'Oct 24, 06:00 UTC',
        status: 'current',
        verifier: 'AIS Marine Satellite',
        notes: 'Transshipment through Singapore hub on track.'
      },
      {
        id: 'm4',
        title: 'Vessel Berthing & Delivery at Cat Lai Terminal',
        location: 'Cat Lai Port, Ho Chi Minh City, Vietnam',
        timestamp: 'Estimated: Nov 04, 10:00 ICT',
        status: 'pending',
        notes: 'Saigon customs pre-lodgement verified.'
      }
    ]
  }
];

export const REGIONAL_HUBS: HubInfo[] = [
  {
    id: 'hetauda',
    name: 'Hetauda Global Headquarters & Central Operations',
    shortName: 'Hetauda Global HQ',
    role: 'Central Dispatch & Administrative HQ',
    location: 'Hetauda, Bagmati Province, Nepal',
    address: 'Kantirajpath, Hetauda-4, Makwanpur, Bagmati Province, Nepal',
    activeFleet: '42 Active Trucks & Trailers',
    warehouseCapacity: '85,000 SQ FT Bonded Depot',
    specialization: 'National transshipment routing, vehicle maintenance yard, temperature-controlled cold logistics, executive customs desk.',
    coordinates: { x: 48, y: 56 }
  },
  {
    id: 'birgunj',
    name: 'Birgunj Dry Port & Inland Container Depot (ICD)',
    shortName: 'Birgunj ICD Port',
    role: 'Rail & Maritime Intermodal Terminus',
    location: 'Sirsiya, Birgunj, Parsa, Nepal',
    address: 'Inland Container Depot (ICD) Terminal, Sirsiya, Birgunj, Nepal',
    activeFleet: '28 Linehaul Skeletal Chassis',
    warehouseCapacity: '120,000 SQ FT Container Yard',
    specialization: 'Direct ocean container rail link from Kolkata & Visakhapatnam ports under sealed transit, bulk raw materials, industrial machinery.',
    coordinates: { x: 50, y: 65 }
  },
  {
    id: 'kathmandu',
    name: 'Kathmandu Air Cargo Complex (TIA Gateways)',
    shortName: 'Kathmandu Air Hub',
    role: 'International Air Cargo Gateway',
    location: 'Tribhuvan International Airport, Kathmandu, Nepal',
    address: 'Air Cargo Building, TIA International Terminal Precinct, Sinamangal, Kathmandu',
    activeFleet: '18 Dedicated Airport Cargo Vans',
    warehouseCapacity: '40,000 SQ FT IATA Bonded Area',
    specialization: 'Priority air freighters, daily passenger belly cargo, express parcel sorting, high-value bullion/cash escort, pharma packaging.',
    coordinates: { x: 53, y: 48 }
  },
  {
    id: 'tatopani',
    name: 'Tatopani & Rasuwagadhi Checkpoints',
    shortName: 'Trans-Himalayan Gateways',
    role: 'Northern China Cross-Border Overland Port',
    location: 'Sindhupalchok / Rasuwa, Northern Border, Nepal',
    address: 'Trans-Himalayan Border Clearance Yard, Tatopani / Kerung Highway',
    activeFleet: '15 High-Altitude Heavy Trucks',
    warehouseCapacity: '25,000 SQ FT Transit Depot',
    specialization: 'Direct Sino-Nepal trade from Lhasa & Guangzhou, multi-axle pneumatic mountain haulage, cross-border customs escrow.',
    coordinates: { x: 57, y: 38 }
  },
  {
    id: 'pokhara',
    name: 'Pokhara Western Distribution Center',
    shortName: 'Pokhara Western Hub',
    role: 'Gandaki Province Logistics Depot',
    location: 'Pokhara Industrial Estate, Kaski, Nepal',
    address: 'Pokhara Industrial Area, Ward 8, Pokhara, Nepal',
    activeFleet: '12 Regional Delivery Trucks',
    warehouseCapacity: '30,000 SQ FT Transit Facility',
    specialization: 'Tourism goods, handicraft exports, western Nepal manufacturing distribution, Gautam Buddha Airport corridor link.',
    coordinates: { x: 38, y: 46 }
  }
];

export const CORRIDOR_BENCHMARKS = [
  {
    corridor: 'Kolkata Port ➔ Birgunj ICD',
    time: '4 to 6 Days Average',
    mode: 'Dedicated Container Freight Trains',
    highlight: 'Direct Rail-Port Link'
  },
  {
    corridor: 'Guangzhou / HKG ➔ Kathmandu',
    time: '24 to 36 Hours',
    mode: 'Daily Scheduled Charters & Belly Cargo',
    highlight: 'Fastest Transit SLA'
  },
  {
    corridor: 'Delhi NCR ➔ Hetauda HQ',
    time: '48 Hours Line-Haul',
    mode: 'Direct Fast-Track Border Highway Escort',
    highlight: 'Overland Expressway'
  },
  {
    corridor: 'Kathmandu ➔ Frankfurt / London',
    time: '48 to 72 Hours',
    mode: 'IATA Priority Bonded Cargo Network',
    highlight: 'Global Reach'
  }
];
