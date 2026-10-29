export type ServiceMode = 'express' | 'air' | 'ocean' | 'overland' | 'customs';

export type ShipmentStatus = 
  | 'Order Placed'
  | 'Picked Up'
  | 'In Transit'
  | 'Customs Clearance'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Exception'
  | 'Cancelled';

export interface Milestone {
  id: string;
  title: string;
  location: string;
  timestamp: string;
  status: 'completed' | 'current' | 'pending';
  verifier?: string;
  notes?: string;
}

export interface TelemetryData {
  temperature?: string;
  eSealStatus?: string;
  sealNumber?: string;
  batteryLevel?: string;
  currentCoordinates?: { lat: number; lng: number };
  altitude?: string;
  speed?: string;
  lastUpdated: string;
}

export interface Shipment {
  id?: string;
  trackingNumber: string;
  bookingRef: string;
  mode: ServiceMode;
  serviceName: string;
  status: ShipmentStatus;
  commodity: string;
  currentLocation?: string;
  shipper: {
    name: string;
    company: string;
    city: string;
    country: string;
    address?: string;
    contact?: string;
  };
  consignee: {
    name: string;
    company: string;
    city: string;
    country: string;
    address?: string;
    contact?: string;
  };
  origin: string;
  originHub: string;
  destination: string;
  destinationGateway: string;
  carrierInfo: string;
  grossWeightKg: number;
  chargeableWeightKg: number;
  volumeCbm: number;
  pieces: number;
  incoterm: string;
  estimatedDelivery: string;
  bookingDate: string;
  telemetry: TelemetryData;
  milestones: Milestone[];
}

export interface HubInfo {
  id: string;
  name: string;
  shortName: string;
  role: string;
  location: string;
  address: string;
  activeFleet: string;
  warehouseCapacity: string;
  specialization: string;
  coordinates: { x: number; y: number };
  imageUrl?: string;
}

export interface BookingFormData {
  serviceMode: ServiceMode;
  originCity: string;
  originHub: string;
  pickupAddress: string;
  pickupDate: string;
  destinationCountry: string;
  destinationCity: string;
  deliveryAddress: string;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  pieces: number;
  commodityType: string;
  declaredValueNpr: number;
  incoterm: string;
  needsTemperatureControl: boolean;
  targetTemp?: string;
  needsInsurance: boolean;
  shipperName: string;
  shipperCompany: string;
  shipperPhone: string;
  shipperEmail: string;
  shipperPanExim: string;
  consigneeName: string;
  consigneeCompany: string;
  consigneePhone: string;
  consigneeEmail: string;
  specialInstructions: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  features: string[];
  iconName: string;
}
