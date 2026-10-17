import { HubInfo } from '../types';

export const REGIONAL_HUBS: HubInfo[] = [
  {
    id: 'hetauda',
    name: 'Hetauda Global Headquarters & Central Operations',
    shortName: 'Hetauda Global HQ',
    role: 'Central Dispatch & Administrative HQ',
    location: 'Hetauda, Bagmati Province, Nepal',
    address: 'School Road -4, Hetauda, Nepal',
    activeFleet: '42 Active Trucks & Trailers',
    warehouseCapacity: '85,000 SQ FT Bonded Depot',
    specialization: 'Cross-border transshipment routing, vehicle maintenance yard, temperature-controlled cold logistics, executive customs desk.',
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
