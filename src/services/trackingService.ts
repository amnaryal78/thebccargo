import { supabase } from '../lib/supabase';
import { Shipment, ShipmentStatus, ServiceMode } from '../types';

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
  if (s.includes('cancel')) return 'Cancelled';
  if (s.includes('delivered')) return 'Delivered';
  if (s.includes('transit')) return 'In Transit';
  if (s.includes('pickup') || s.includes('picked')) return 'Picked Up';
  if (s.includes('custom')) return 'Customs Clearance';
  if (s.includes('delivery') || s.includes('out')) return 'Out for Delivery';
  if (s.includes('exception') || s.includes('hold')) return 'Exception';
  return 'Order Placed';
};

export type TrackingFailure = 'invalid' | 'not_found' | 'unavailable';

export const fetchPublicTracking = async (
  trackingNumber: string
): Promise<{ data: Shipment | null; error: string | null; reason?: TrackingFailure }> => {
  const cleanCode = trackingNumber.trim().toUpperCase();
  if (!cleanCode) {
    return { data: null, error: 'Please enter a valid tracking number (e.g. BC-90214-HKG).', reason: 'invalid' };
  }

  if (cleanCode.length < 4) {
    return { data: null, error: 'Tracking number must be at least 4 characters.', reason: 'invalid' };
  }

  let reason: TrackingFailure = 'not_found';
  try {
    // Attempt Supabase RPC query (safe projection protecting PII)
    const { data, error } = await supabase.rpc('get_public_shipment', {
      tracking_num: cleanCode
    }).abortSignal(AbortSignal.timeout(15000)); // a hung request shows "not reachable" instead of loading forever

    if (error) reason = 'unavailable';
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
          name: 'Authorized Exporter',
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
          // empty when unknown: the page hides it rather than showing "now"
          lastUpdated: publicData.last_updated || '',
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
    console.warn('Tracking lookup failed:', err);
    reason = 'unavailable';
  }

  return { data: null, error: `No active shipment found with tracking code "${cleanCode}". Please verify your AWB or contact BC Cargo operations.`, reason };
};
