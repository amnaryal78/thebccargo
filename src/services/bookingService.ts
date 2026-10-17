import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface BookingPayload {
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  senderAddress?: string;
  receiverName: string;
  receiverEmail?: string;
  receiverPhone?: string;
  receiverAddress?: string;
  origin: string;
  destination: string;
  serviceMode: string;
  commodity?: string;
  weightKg: number;
  boxCount?: number;
  dimensions?: string;
  notes?: string;
  estimatedPrice?: number;
  currency?: string;
  turnstileToken?: string;
}

export interface BookingRecord extends BookingPayload {
  id: string;
  bookingRef: string;
  awbNumber?: string;
  status: string;
  createdAt: string;
}

export async function submitBooking(
  payload: BookingPayload,
  turnstileToken?: string
): Promise<{ record: BookingRecord | null; error: string | null }> {
  // Reject Nepal as destination
  const dest = String(payload.destination || '').trim().toLowerCase();
  const destAddr = String(payload.receiverAddress || '').trim().toLowerCase();
  if (dest === 'nepal' || dest.endsWith(', nepal') || destAddr === 'nepal' || destAddr.endsWith(', nepal')) {
    return { record: null, error: 'We ship from Nepal to other countries. Destination cannot be Nepal.' };
  }

  const bookingRef = `BK-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  if (isSupabaseConfigured) {
    const id = crypto.randomUUID();
    const { error } = await supabase.from('bookings').insert({
      id,
      booking_ref: bookingRef,
      sender_name: payload.senderName,
      sender_email: payload.senderEmail,
      sender_phone: payload.senderPhone ?? null,
      sender_address: payload.senderAddress ?? null,
      receiver_name: payload.receiverName,
      receiver_email: payload.receiverEmail ?? null,
      receiver_phone: payload.receiverPhone ?? null,
      receiver_address: payload.receiverAddress ?? null,
      origin: payload.origin,
      destination: payload.destination,
      service_mode: payload.serviceMode,
      commodity: payload.commodity ?? null,
      weight_kg: payload.weightKg,
      box_count: payload.boxCount ?? null,
      dimensions: payload.dimensions ?? null,
      notes: payload.notes ?? null,
      estimated_price: payload.estimatedPrice ?? null,
      currency: payload.currency ?? null,
    });
    if (error) {
      console.warn('Booking insert failed:', error.message);
      return { record: null, error: 'We could not send your booking. Please try again or call us.' };
    }
    const { turnstileToken: _t, ...rest } = payload;
    return {
      record: { ...rest, id, bookingRef, status: 'submitted', createdAt: new Date().toISOString() },
      error: null,
    };
  }

  // Local development only (Supabase not configured)
  const { turnstileToken: _unused, ...rest } = payload;
  return {
    record: { id: `BK-ID-${Date.now()}`, bookingRef, ...rest, status: 'submitted', createdAt: new Date().toISOString() },
    error: null,
  };
}

export async function fetchAllBookings(): Promise<BookingRecord[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((b: any) => ({
          id: b.id,
          bookingRef: b.booking_ref,
          senderName: b.sender_name,
          senderEmail: b.sender_email,
          senderPhone: b.sender_phone,
          senderAddress: b.sender_address,
          receiverName: b.receiver_name,
          receiverEmail: b.receiver_email,
          receiverPhone: b.receiver_phone,
          receiverAddress: b.receiver_address,
          origin: b.origin,
          destination: b.destination,
          serviceMode: b.service_mode,
          commodity: b.commodity,
          weightKg: Number(b.weight_kg),
          boxCount: b.box_count,
          dimensions: b.dimensions,
          notes: b.notes,
          estimatedPrice: Number(b.estimated_price),
          currency: b.currency,
          status: b.status,
          createdAt: b.created_at,
        }));
      }
    } catch (e) {}
  }
  return [];
}
