import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<boolean> {
  const secretKey = Deno.env.get('TURNSTILE_SECRET_KEY');
  
  // If Turnstile secret key is not set (e.g. dev/testing environment), allow development test tokens
  if (!secretKey) {
    console.warn('TURNSTILE_SECRET_KEY is not configured in environment. Dev bypass active.');
    return token && token.length > 5;
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const outcome = await res.json();
    return outcome.success === true;
  } catch (err) {
    console.error('Turnstile verification network error:', err);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { turnstileToken, ...payload } = body;

    // 1. Turnstile CAPTCHA Verification
    const clientIp = req.headers.get('x-forwarded-for') || undefined;
    const isValidCaptcha = await verifyTurnstileToken(turnstileToken, clientIp);

    if (!isValidCaptcha) {
      return new Response(
        JSON.stringify({ error: 'CAPTCHA verification failed. Please complete the security check.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Server-side Validation
    if (!payload.senderName || !payload.senderEmail || !payload.receiverName || !payload.origin || !payload.destination) {
      return new Response(
        JSON.stringify({ error: 'Missing required booking fields (sender, receiver, origin, or destination).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.senderEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid sender email format.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Database Insertion via Service Role Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const bookingRef = `BK-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const { data: booking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        booking_ref: bookingRef,
        sender_name: payload.senderName,
        sender_email: payload.senderEmail,
        sender_phone: payload.senderPhone || null,
        sender_address: payload.senderAddress || null,
        receiver_name: payload.receiverName,
        receiver_email: payload.receiverEmail || null,
        receiver_phone: payload.receiverPhone || null,
        receiver_address: payload.receiverAddress || null,
        origin: payload.origin,
        destination: payload.destination,
        service_mode: payload.serviceMode || 'Air Delivery',
        commodity: payload.commodity || 'General Cargo',
        weight_kg: payload.weightKg || 1,
        box_count: payload.boxCount || 1,
        dimensions: payload.dimensions || null,
        notes: payload.notes || null,
        estimated_price: payload.estimatedPrice || null,
        currency: payload.currency || 'USD',
        status: 'submitted',
      })
      .select('*')
      .single();

    if (insertError || !booking) {
      console.error('Booking DB insertion error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Unable to process booking reservation at this time.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Server-Side Automated AWB Generation
    const awbNumber = `BC-AWB-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const pdfPath = `awb-documents/${booking.id}_${awbNumber}.pdf`;

    await supabase.from('air_waybills').insert({
      booking_id: booking.id,
      awb_number: awbNumber,
      pdf_storage_path: pdfPath,
      status: 'generated',
      generated_by: 'submit-booking-edge-function'
    });

    // 5. Trigger Milestone Notification Event
    await supabase.from('shipment_notifications').insert({
      shipment_id: booking.id, // temporary ref
      recipient: payload.senderEmail,
      channel: 'email',
      event_type: 'booking_confirmed',
      status: 'pending'
    }).catch(err => console.warn('Notification queuing suppressed:', err));

    return new Response(
      JSON.stringify({
        success: true,
        record: {
          id: booking.id,
          bookingRef: booking.booking_ref,
          awbNumber,
          senderName: booking.sender_name,
          senderEmail: booking.sender_email,
          receiverName: booking.receiver_name,
          origin: booking.origin,
          destination: booking.destination,
          serviceMode: booking.service_mode,
          weightKg: Number(booking.weight_kg),
          status: booking.status,
          createdAt: booking.created_at
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Unexpected booking Edge Function error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server security error processing request.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
