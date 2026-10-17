import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<boolean> {
  const secretKey = Deno.env.get('TURNSTILE_SECRET_KEY');
  
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
    console.error('Turnstile verification error:', err);
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

    // 1. CAPTCHA Verification
    const clientIp = req.headers.get('x-forwarded-for') || undefined;
    const isValidCaptcha = await verifyTurnstileToken(turnstileToken, clientIp);

    if (!isValidCaptcha) {
      return new Response(
        JSON.stringify({ error: 'CAPTCHA verification failed. Please complete the security check.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Payload Validation
    if (!payload.name || !payload.email || !payload.message) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and message are required fields.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address provided.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (payload.message.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: 'Inquiry message must be at least 5 characters long.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Secure Service Role DB Insertion
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: inquiry, error: insertError } = await supabase
      .from('inquiries')
      .insert({
        name: payload.name.trim(),
        email: payload.email.trim(),
        phone: payload.phone ? payload.phone.trim() : null,
        subject: payload.subject ? payload.subject.trim() : null,
        message: payload.message.trim(),
        service_mode: payload.serviceMode || null,
        status: 'new',
      })
      .select('*')
      .single();

    if (insertError || !inquiry) {
      console.error('Inquiry DB error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Database transaction error storing inquiry.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        record: {
          id: inquiry.id,
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone,
          subject: inquiry.subject,
          message: inquiry.message,
          serviceMode: inquiry.service_mode,
          status: inquiry.status,
          createdAt: inquiry.created_at
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Inquiry Edge Function exception:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server security error.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
