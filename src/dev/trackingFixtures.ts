import type { Shipment } from '../types';

/**
 * Dev-only tracking fixtures, loaded by TrackingSection when `?fixture=<name>` is in the URL in dev.
 * Worst case is realistic, not random: long real place names, a long staff note in Nepali, a code
 * with a customer reference appended, a status the service never maps, a timestamp that is not ISO.
 * Never imported in production (the import sits behind import.meta.env.DEV).
 */
const base = {
  bookingRef: 'REF',
  serviceName: 'Air',
  commodity: '',
  shipper: { name: '', company: '', city: '', country: '' },
  consignee: { name: '', company: '', city: '', country: '' },
  originHub: '',
  destinationGateway: '',
  carrierInfo: '',
  grossWeightKg: 0,
  chargeableWeightKg: 0,
  volumeCbm: 0,
  pieces: 1,
  incoterm: '',
  bookingDate: '2026-10-20T09:00:00Z',
} as const;

export const TRACKING_FIXTURES: Record<string, Shipment> = {
  demo: {
    ...base,
    trackingNumber: 'BC-90214-KOR',
    mode: 'air',
    status: 'In Transit',
    origin: 'Hetauda',
    destination: 'Seoul',
    estimatedDelivery: '3 Nov 2026',
    telemetry: { lastUpdated: '2026-10-29T06:00:00Z', batteryLevel: '', eSealStatus: '' },
    milestones: [
      { id: '1', title: 'Shipment booked', location: 'Hetauda', timestamp: '2026-10-28T09:00:00Z', status: 'completed' },
      { id: '2', title: 'Left Nepal', location: 'Kathmandu', timestamp: '2026-10-29T06:00:00Z', status: 'completed' },
      { id: '3', title: 'Delivered', location: 'Seoul', timestamp: '', status: 'pending' },
    ],
  } as unknown as Shipment,

  worst: {
    ...base,
    trackingNumber: 'BC-2026-1029-000123456-LLANFAIRPWLLGWYNGYLL-CUSTREF-77812093',
    mode: 'ocean',
    status: 'Held at destination customs awaiting importer documents',
    origin: 'Hetauda Sub-Metropolitan City, Makwanpur, Bagmati Province',
    destination: 'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch, Anglesey, United Kingdom',
    estimatedDelivery: 'Pending customs release (usually 5 to 10 working days after documents arrive)',
    telemetry: { lastUpdated: 'not-a-date', batteryLevel: '', eSealStatus: '' },
    milestones: [
      { id: '1', title: 'बुकिङ भयो — हेटौंडा कार्यालयमा पार्सल बुझियो र तौल गरियो', location: 'हेटौंडा उप-महानगरपालिका, मकवानपुर', timestamp: '2026-10-20T09:00:00Z', status: 'completed', notes: 'ग्राहकले थप दुई बट्टा अचार र एक प्याकेट मसला थप्नुभयो, त्यसैले बाकस फेरि प्याक गरियो। कुल तौल २३.५ केजी, दुई बाकसमा विभाजन गरियो।' },
      { id: '2', title: 'Export customs cleared at Tribhuvan International Airport cargo terminal after physical inspection', location: 'Kathmandu', timestamp: '2026-10-22', status: 'completed', notes: 'Receiver contact: bartholomew.fitzgerald@northwind-industries-holdings.example.com / https://tracking.example-partner-carrier.co.uk/consignments/BC20261029000123456?ref=nepal' },
      { id: '3', title: 'In transit', location: '', timestamp: '', status: 'completed' },
      { id: '4', title: 'Held at destination customs', location: 'Holyhead', timestamp: 'yesterday afternoon', status: 'pending', notes: '' },
      { id: '5', title: 'Delivered', location: 'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch', timestamp: '', status: 'pending' },
    ],
  } as unknown as Shipment,

  empty: {
    ...base,
    trackingNumber: 'BC1',
    mode: 'air',
    status: '',
    origin: '',
    destination: '',
    estimatedDelivery: '',
    telemetry: { lastUpdated: '', batteryLevel: '', eSealStatus: '' },
    milestones: [],
  } as unknown as Shipment,
};
