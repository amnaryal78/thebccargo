import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { bookingId } = await req.json();

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: 'bookingId is required to generate Air Waybill.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Idempotency Check: Query existing AWB for booking_id
    const { data: existingAwb } = await supabase
      .from('air_waybills')
      .select('*')
      .eq('booking_id', bookingId)
      .maybeSingle();

    if (existingAwb) {
      return new Response(
        JSON.stringify({
          success: true,
          idempotent: true,
          record: existingAwb,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Fetch Booking Data
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingErr || !booking) {
      return new Response(
        JSON.stringify({ error: 'Associated booking not found for AWB generation.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Generate Unique Server-Side AWB Number
    const awbNumber = `BC-AWB-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const pdfPath = `${booking.id}_${awbNumber}.pdf`;

    // Mock PDF binary content representation
    const pdfHeader = `%PDF-1.4\n1 0 obj\n<< /Title (BC Cargo AWB ${awbNumber}) /Author (The BC Cargo & Courier) >>\nendobj\n`;
    const encoder = new TextEncoder();
    const pdfBytes = encoder.encode(pdfHeader + `Booking Ref: ${booking.booking_ref}\nSender: ${booking.sender_name}\nReceiver: ${booking.receiver_name}\nWeight: ${booking.weight_kg}kg`);

    // 4. Upload to Private awb-documents Bucket
    const { error: storageErr } = await supabase.storage
      .from('awb-documents')
      .upload(pdfPath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (storageErr) {
      console.error('AWB PDF Storage upload error:', storageErr);
    }

    // 5. Insert Air Waybill Record
    const { data: awbRecord, error: awbErr } = await supabase
      .from('air_waybills')
      .insert({
        booking_id: booking.id,
        awb_number: awbNumber,
        pdf_storage_path: pdfPath,
        status: 'generated',
        generated_by: 'generate-awb-edge-function',
      })
      .select('*')
      .single();

    if (awbErr || !awbRecord) {
      console.error('AWB Record insertion error:', awbErr);
      return new Response(
        JSON.stringify({ error: 'Failed to record Air Waybill document in database.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        idempotent: false,
        record: awbRecord,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('generate-awb Edge Function exception:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error during AWB generation.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
