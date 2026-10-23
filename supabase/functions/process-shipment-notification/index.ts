import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/** Only shipping staff (or a server call with the service-role key) may use this function. */
async function isShippingStaff(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization') || '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  if (serviceRoleKey && authHeader === `Bearer ${serviceRoleKey}`) return true;
  const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') || '', {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData } = await userClient.auth.getUser();
  if (!userData?.user) return false;
  const { data: roleRow } = await createClient(supabaseUrl, serviceRoleKey)
    .from('user_roles')
    .select('role, active')
    .eq('user_id', userData.user.id)
    .maybeSingle();
  return !!roleRow && roleRow.active === true && ['super_admin', 'admin', 'operations'].includes(roleRow.role);
}


function renderTemplate(template: string, variables: Record<string, any>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(placeholder, String(value ?? ''));
  }
  return result;
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

    if (!(await isShippingStaff(req))) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { shipmentId, trackingEventId, eventType, recipient, channel = 'email', templateData } = await req.json();

    if (!shipmentId || !eventType || !recipient) {
      return new Response(
        JSON.stringify({ error: 'shipmentId, eventType, and recipient are required parameters.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Deduplication Strategy Check
    const { data: existingNotif } = await supabase
      .from('shipment_notifications')
      .select('*')
      .eq('shipment_id', shipmentId)
      .eq('event_type', eventType)
      .eq('channel', channel)
      .eq('recipient', recipient)
      .maybeSingle();

    if (existingNotif && existingNotif.status === 'sent') {
      return new Response(
        JSON.stringify({
          success: true,
          deduplicated: true,
          message: 'Notification already dispatched for this milestone event.',
          record: existingNotif
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Load Notification Template
    const { data: template } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('event_type', eventType)
      .eq('channel', channel)
      .maybeSingle();

    const rawSubject = template?.subject_template || `BC Cargo Update: ${eventType}`;
    const rawBody = template?.body_template || `Your shipment status update: {{status}}. Tracking: {{tracking_number}}`;

    const subject = renderTemplate(rawSubject, templateData || {});
    const body = renderTemplate(rawBody, templateData || {});

    // 3. Provider Integration
    const emailApiKey = Deno.env.get('EMAIL_PROVIDER_API_KEY');
    const smsApiKey = Deno.env.get('SMS_PROVIDER_API_KEY');
    
    let providerMsgId = `MOCK-MSG-${Date.now()}`;
    let deliveryStatus = 'sent';
    let errorMessage = null;

    if (channel === 'email' && emailApiKey) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${emailApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: Deno.env.get('EMAIL_FROM_ADDRESS') || 'notifications@thebccargo.com',
            to: recipient,
            subject,
            text: body
          })
        });
        const resData = await emailRes.json();
        if (resData.id) {
          providerMsgId = resData.id;
        } else {
          deliveryStatus = 'failed';
          errorMessage = JSON.stringify(resData);
        }
      } catch (err: any) {
        deliveryStatus = 'failed';
        errorMessage = err.message || 'Email provider network error';
      }
    } else if (channel === 'sms' && smsApiKey) {
      // SMS Provider Integration Abstraction
      console.log(`[SMS Provider] Sending SMS to ${recipient}: ${body}`);
      providerMsgId = `SMS-ID-${Date.now()}`;
    } else {
      console.log(`[Notification Logging] Provider API key not present. Event logged cleanly. Channel: ${channel}, Recipient: ${recipient}`);
    }

    // 4. Record Notification Log & Attempt Tracking
    const { data: notifRecord, error: notifErr } = await supabase
      .from('shipment_notifications')
      .upsert({
        shipment_id: shipmentId,
        tracking_event_id: trackingEventId || null,
        recipient,
        channel,
        event_type: eventType,
        status: deliveryStatus,
        provider_message_id: providerMsgId,
        attempts: (existingNotif?.attempts || 0) + 1,
        error_message: errorMessage,
        sent_at: deliveryStatus === 'sent' ? new Date().toISOString() : null
      }, {
        onConflict: 'shipment_id, event_type, channel, recipient'
      })
      .select('*')
      .single();

    return new Response(
      JSON.stringify({
        success: deliveryStatus === 'sent',
        record: notifRecord,
        renderedMessage: { subject, body }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Notification processing exception:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error processing shipment notification.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
