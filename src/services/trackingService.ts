import { supabase } from '../lib/supabase';
import { Shipment, ShipmentStatus, ServiceMode } from '../types';
import { INITIAL_SHIPMENTS } from '../data/initialData';

export interface PublicTrackingResponse {
  tracking_number: string;
  service_mode: string;
  origin: string;
  destination: string;
  status: string;
  estimated_delivery?: string;
  current_location?: string;
  last_updated?: string;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    location: string;
    timestamp: string;
    status: string;
    completed: boolean;
  }>;
}

const mapStatus = (rawStatus: string): ShipmentStatus => {
  const s = rawStatus.toLowerCase();
  if (s.includes('delivered')) return 'Delivered';
  if (s.includes('transit')) return 'In Transit';
  if (s.includes('pickup') || s.includes('picked')) return 'Picked Up';
  if (s.includes('custom')) return 'Customs Clearance';
  if (s.includes('delivery') || s.includes('out')) return 'Out for Delivery';
  if (s.includes('exception') || s.includes('hold')) return 'Exception';
  return 'Order Placed';
};

export const fetchPublicTracking = async (trackingNumber: string): Promise<{ data: Shipment | null; error: string | null }> => {
  const cleanCode = trackingNumber.trim().toUpperCase();
  if (!cleanCode) {
    return { data: null, error: 'Please enter a valid tracking number (e.g. BC-90214-HKG).' };
  }

  if (cleanCode.length < 4) {
    return { data: null, error: 'Tracking number must be at least 4 characters.' };
  }

  try {
    // Attempt Supabase RPC query (safe projection protecting PII)
    const { data, error } = await supabase.rpc('get_public_shipment', {
      tracking_num: cleanCode
    });

    if (!error && data && (data as any).tracking_number) {
      const publicData = data as PublicTrackingResponse;
      const formattedShipment: Shipment = {
        trackingNumber: publicData.tracking_number,
        bookingRef: `REF-${publicData.tracking_number}`,
        mode: (publicData.service_mode as ServiceMode) || 'air',
        serviceName: 
          publicData.service_mode === 'ocean' ? 'Ocean Multimodal Lines' :
          publicData.service_mode === 'overland' ? 'Cross-Border Linehaul' :
          publicData.service_mode === 'express' ? 'Express Courier' : 'Air Freight Express',
        status: mapStatus(publicData.status),
        commodity: 'Commercial Air/General Cargo',
        shipper: {
          name: 'Verified Exporter',
          company: 'BC Cargo Verified Shipper',
          city: publicData.origin,
          country: 'Nepal'
        },
        consignee: {
          name: 'Authorized Consignee',
          company: 'Destination Partner',
          city: publicData.destination,
          country: 'International'
        },
        origin: publicData.origin,
        originHub: `${publicData.origin} Logistics Hub`,
        destination: publicData.destination,
        destinationGateway: `${publicData.destination} Gateway Hub`,
        carrierInfo: 'BC Multimodal Linehaul Unit',
        grossWeightKg: 15,
        chargeableWeightKg: 15,
        volumeCbm: 0.08,
        pieces: 1,
        incoterm: 'DDP',
        estimatedDelivery: publicData.estimated_delivery || 'In Scheduled Transit',
        bookingDate: new Date().toISOString(),
        telemetry: {
          lastUpdated: publicData.last_updated || new Date().toISOString(),
          batteryLevel: '100%',
          eSealStatus: 'Active & Secured'
        },
        milestones: Array.isArray(publicData.milestones) ? publicData.milestones.map(m => ({
          id: m.id,
          title: m.title,
          location: m.location,
          timestamp: m.timestamp,
          status: m.completed ? 'completed' : 'pending',
          notes: m.description
        })) : []
      };
      return { data: formattedShipment, error: null };
    }
  } catch (err) {
    console.warn('Supabase query fallback to seed manifests:', err);
  }

  // Local verified seed manifests for development/demo fallback
  const localMatch = INITIAL_SHIPMENTS.find(s => s.trackingNumber.toUpperCase() === cleanCode);
  if (localMatch) {
    // Sanitize seed data to ensure no PII is exposed publicly
    const sanitizedMatch: Shipment = {
      ...localMatch,
      shipper: {
        name: 'Authorized Exporter',
        company: localMatch.shipper.company,
        city: localMatch.shipper.city,
        country: localMatch.shipper.country
      },
      consignee: {
        name: 'Authorized Consignee',
        company: localMatch.consignee.company,
        city: localMatch.consignee.city,
        country: localMatch.consignee.country
      }
    };
    return { data: sanitizedMatch, error: null };
  }

  return { data: null, error: `No active shipment found with tracking code "${cleanCode}". Please verify your AWB or contact BC Cargo operations.` };
};
