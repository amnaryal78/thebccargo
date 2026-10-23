import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<boolean> {
  const secretKey = Deno.env.get('TURNSTILE_SECRET_KEY');
  
  if (!secretKey) {
    // Fail closed: a missing secret on a deployed function must not let bots through.
    if (Deno.env.get('ALLOW_TURNSTILE_DEV_BYPASS') !== 'true') {
      console.error('TURNSTILE_SECRET_KEY is not configured. Rejecting the request.');
      return false;
    }
    console.warn('TURNSTILE_SECRET_KEY is not configured. ALLOW_TURNSTILE_DEV_BYPASS is on (dev only).');
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
    const { turnstileToken, resumeBase64, resumeFileName, resumeMimeType, ...payload } = body;

    // 1. CAPTCHA Verification
    const clientIp = req.headers.get('x-forwarded-for') || undefined;
    const isValidCaptcha = await verifyTurnstileToken(turnstileToken, clientIp);

    if (!isValidCaptcha) {
      return new Response(
        JSON.stringify({ error: 'CAPTCHA verification failed. Security validation rejected submission.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Field Validation
    if (!payload.applicantName || !payload.email || !payload.jobTitle) {
      return new Response(
        JSON.stringify({ error: 'Applicant name, email, and target position title are required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid applicant email address.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Resume File Validation if provided
    let uploadedResumePath = null;
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const applicationId = crypto.randomUUID();

    if (resumeBase64 && resumeFileName) {
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      
      const mime = resumeMimeType || 'application/pdf';
      if (!allowedMimeTypes.includes(mime)) {
        return new Response(
          JSON.stringify({ error: 'Invalid resume file format. Only PDF, DOC, and DOCX files are allowed.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Convert Base64 to Uint8Array
      const binaryString = atob(resumeBase64.replace(/^data:.*?;base64,/, ''));
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      if (bytes.length > 10 * 1024 * 1024) { // 10MB limit
        return new Response(
          JSON.stringify({ error: 'Resume file size exceeds the 10MB limit.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const safeExt = resumeFileName.split('.').pop()?.replace(/[^a-z0-9]/gi, '') || 'pdf';
      const safeFileName = `resume_${Date.now()}.${safeExt}`;
      uploadedResumePath = `${applicationId}/${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('job-resumes')
        .upload(uploadedResumePath, bytes, {
          contentType: mime,
          upsert: true,
        });

      if (uploadError) {
        console.error('Resume storage upload error:', uploadError);
        return new Response(
          JSON.stringify({ error: 'Failed to upload resume document securely.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 4. DB Record Insertion
    const { data: app, error: insertError } = await supabase
      .from('job_applications')
      .insert({
        id: applicationId,
        job_title: payload.jobTitle,
        applicant_name: payload.applicantName.trim(),
        email: payload.email.trim(),
        phone: payload.phone ? payload.phone.trim() : null,
        experience_years: payload.experienceYears || 0,
        cover_letter: payload.coverLetter ? payload.coverLetter.trim() : null,
        resume_url: uploadedResumePath,
        status: 'new',
      })
      .select('*')
      .single();

    if (insertError || !app) {
      console.error('Job application DB insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Database transaction error storing application.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        record: {
          id: app.id,
          jobId: payload.jobId || '',
          jobTitle: app.job_title,
          applicantName: app.applicant_name,
          email: app.email,
          phone: app.phone,
          experienceYears: app.experience_years,
          coverLetter: app.cover_letter,
          resumeUrl: app.resume_url,
          status: app.status,
          createdAt: app.created_at
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Job application Edge Function error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server security error.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
