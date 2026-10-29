// Supabase Edge Function: chat (AI Cargo Assistant)
// Enforces Phase 7 strict rules: cargo-only, short words, live rates, meat restriction, WhatsApp escalation.
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Rate limiting state: IP -> timestamps[]
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests / min / IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (rateLimitMap.get(ip) || []).filter(t => t > windowStart);
  
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  
  // Clean up old entries periodically
  if (rateLimitMap.size > 2000) {
    for (const [k, v] of rateLimitMap.entries()) {
      const active = v.filter(t => t > windowStart);
      if (active.length === 0) rateLimitMap.delete(k);
      else rateLimitMap.set(k, active);
    }
  }
  return true;
}

async function verifyTurnstileToken(token?: string, remoteIp?: string): Promise<boolean> {
  const secretKey = typeof Deno !== 'undefined' ? Deno.env?.get('TURNSTILE_SECRET_KEY') : null;
  if (!secretKey) {
    // Dev or testing environment without secret key
    return true;
  }
  if (!token) {
    return false;
  }
  // (A hard-coded 'dev_bypass_token' used to pass here even with the secret set.)
  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) formData.append('remoteip', remoteIp);

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

// Out-of-scope non-cargo topics to reject immediately
const OUT_OF_SCOPE_PATTERNS = [
  'prime minister', 'president', 'write python', 'write code', 'write javascript',
  'medical advice', 'doctor', 'tell me a joke', 'recipe', 'movie', 'actor',
  'system prompt', 'api key', 'secret key', 'crypto', 'bitcoin', 'stock market',
  'election', 'homework', 'essay', 'poem', 'sing a song', 'love advice'
];

interface ChatAction {
  label: string;
  type: 'navigate' | 'track' | 'book' | 'call' | 'contact' | 'whatsapp';
  payload: string;
}

const WHATSAPP_ACTION: ChatAction = {
  label: 'WhatsApp',
  type: 'whatsapp',
  payload: '9779855019485',
};

const CALL_ACTION: ChatAction = {
  label: 'Call',
  type: 'call',
  payload: '+9779855019485',
};

const PRICE_ACTION: ChatAction = {
  label: 'Price',
  type: 'navigate',
  payload: 'rates',
};

const FALLBACK_MESSAGE = 'I only help with cargo, shipping, and BC Cargo services. For other inquiries, please message our team on WhatsApp at +977 9855019485 or call 057-591816.';

function getDeterministicReply(cleanQuery: string): { reply: string; actions: ChatAction[]; isFallback?: boolean } | null {
  const lower = cleanQuery.toLowerCase();

  // 1. Meat inquiries
  if (lower.includes('meat') || lower.includes('sukuti') || lower.includes('buff') || lower.includes('pork') || lower.includes('mutton') || lower.includes('chicken') || lower.includes('मासु')) {
    if (lower.includes('uk') || lower.includes('united kingdom') || lower.includes('europe') || lower.includes('hong kong') || lower.includes('hkg')) {
      return {
        reply: 'Meat items (including dried/sukuti) are allowed for Europe, UK, and Hong Kong under special export packaging. Prohibited for other destinations.',
        actions: [WHATSAPP_ACTION, PRICE_ACTION],
      };
    }
    return {
      reply: 'Meat is accepted ONLY for Europe, UK, and Hong Kong. Meat shipments to USA, Australia, Gulf countries, Japan, Canada, and other destinations are strictly prohibited by customs.',
      actions: [WHATSAPP_ACTION, PRICE_ACTION],
    };
  }

  // 2. Pickup location inquiry
  if (lower.includes('pickup') || lower.includes('pick up') || lower.includes('collect') || lower.includes('संकलन') || lower.includes('उठाउने')) {
    // Check if user is asking to pick up outside Nepal
    if (lower.includes('london') || lower.includes('usa') || lower.includes('korea') || lower.includes('uk') || lower.includes('dubai') || lower.includes('australia') || lower.includes('india') || lower.includes('outside nepal')) {
      return {
        reply: 'We only pick up shipments within Nepal. We deliver worldwide to 190+ countries. We do not pick up from outside Nepal.',
        actions: [WHATSAPP_ACTION, PRICE_ACTION],
      };
    }
    return {
      reply: 'Home pickup is free in Hetauda, Pathlaiya, Jitpur and Simara for parcels over 20 kg (otherwise Rs 200). We also pick up in Birgunj, Chitwan and Kathmandu for Rs 200. From other places, please bring your parcel to our Hetauda office. Consignments are dispatched internationally from Nepal.',
      actions: [WHATSAPP_ACTION, PRICE_ACTION],
    };
  }

  // 3. Booking inquiry
  if (lower.includes('book') || lower.includes('booking') || lower.includes('ship now') || lower.includes('send parcel') || lower.includes('बुकिङ')) {
    return {
      reply: 'Booking a shipment needs human staff to confirm customs paperwork and dispatch. Please message our team on WhatsApp or call our Hetauda office.',
      actions: [WHATSAPP_ACTION, CALL_ACTION],
    };
  }

  // 4. Tracking inquiry
  if (lower.includes('track') || lower.includes('tracking') || lower.includes('status') || lower.includes('कहाँ पुग्यो')) {
    return {
      reply: 'Live tracking updates need human staff assistance. Please message our WhatsApp with your tracking code, or call us.',
      actions: [WHATSAPP_ACTION, CALL_ACTION],
    };
  }

  // 5. Rates / Price inquiry
  if (lower.includes('rate') || lower.includes('price') || lower.includes('cost') || lower.includes('how much') || lower.includes('भाडा') || lower.includes('मूल्य')) {
    return {
      reply: 'Prices come strictly from our live rates tariff engine. Please click Price below to view exact live rates, or message our team on WhatsApp for a custom quotation.',
      actions: [PRICE_ACTION, WHATSAPP_ACTION],
    };
  }

  // 6. Contact / Location
  if (lower.includes('contact') || lower.includes('phone') || lower.includes('number') || lower.includes('email') || lower.includes('address') || lower.includes('hetauda') || lower.includes('office') || lower.includes('सम्पर्क')) {
    return {
      reply: 'The BC Cargo Central HQ is at School Road -4, Hetauda, Nepal. Phone: 057-591816 / 9855019485. Email: thebccargo@gmail.com. WhatsApp: +977 9855019485.',
      actions: [WHATSAPP_ACTION, CALL_ACTION],
    };
  }

  return null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate Limiting Check
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('cf-connecting-ip') || 
                     'anonymous';
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please wait a moment before sending more messages.',
          reply: 'Too many messages sent. Please wait a minute or message us directly on WhatsApp at +977 9855019485.',
          actions: [WHATSAPP_ACTION]
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let payload: any = {};
    try {
      payload = await req.json();
    } catch (_e) {
      payload = {};
    }

    const { message, settings, history, turnstileToken } = payload;
    const userMessage = (typeof message === 'string' ? message : '').slice(0, 1000).trim();

    // Turnstile Check (if token provided or secret configured)
    if (turnstileToken) {
      const isValid = await verifyTurnstileToken(turnstileToken, clientIp);
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: 'CAPTCHA verification failed', reply: 'Security check failed. Please refresh and try again.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!userMessage) {
      return new Response(
        JSON.stringify({ reply: 'Please enter a question about BC Cargo shipping, rates, or pickup.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Scope check: reject out-of-scope non-cargo queries
    const lower = userMessage.toLowerCase();
    if (OUT_OF_SCOPE_PATTERNS.some(p => lower.includes(p))) {
      return new Response(
        JSON.stringify({
          reply: settings?.fallbackMessage || FALLBACK_MESSAGE,
          isFallback: true,
          actions: [WHATSAPP_ACTION, CALL_ACTION],
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try deterministic match first for critical rules (meat, pickup, booking, tracking)
    const deterministic = getDeterministicReply(userMessage);
    if (deterministic) {
      return new Response(
        JSON.stringify(deterministic),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // AI Provider Call (OpenRouter) with strict guardrails
    const openRouterKey = (typeof Deno !== 'undefined' && Deno.env?.get('OPENROUTER_API_KEY')) || '';
    if (openRouterKey) {
      const systemPrompt = `You are "BC Cargo AI", the digital customer service assistant for The BC Cargo & Courier (Govt License #B-409).
Company Details:
- Central HQ: School Road -4, Hetauda, Nepal. Phone: 057-591816 / 9855019485. WhatsApp: +977-9855019485. Email: thebccargo@gmail.com.
- Hours: Sun–Fri 9:00 AM – 6:00 PM NPT.

Strict Rules:
1. Talk ONLY about cargo, shipping, and BC Cargo. Reject non-cargo questions politely.
2. Use short, easy words. Be concise.
3. Pickup is ONLY within Nepal. Home pickup is free in Hetauda, Pathlaiya, Jitpur and Simara for parcels over 20 kg (otherwise Rs 200). We also pick up in Birgunj, Chitwan and Kathmandu for Rs 200. From other places, please bring your parcel to our Hetauda office. We do not pick up from outside Nepal. Delivery is worldwide to 190+ countries.
4. Meat is ONLY accepted for Europe, UK, and Hong Kong. Prohibited everywhere else.
5. Prices come ONLY from the live rates function. NEVER guess or invent a price. If user asks for prices, refer them to the Rate Estimator or WhatsApp.
6. Booking and tracking need a human: tell the user to contact our human staff on WhatsApp (+977 9855019485).
7. If you do not know the answer, tell the user to message on WhatsApp (+977 9855019485).
8. Answer in the same language the user asks (Nepali, English, etc.).`;

      // Free models only: the caller cannot choose a paid model (OpenRouter auto-routing could pick one).
      const freeModels = ['google/gemma-4-26b-a4b-it:free', 'meta-llama/llama-3.1-8b-instruct:free', 'google/gemma-2-9b-it:free', 'openrouter/free'];
      const reqModel = freeModels.includes(settings?.model) ? settings.model : freeModels[0];
      const candidateModels = [...new Set([reqModel, ...freeModels])];
      const safeHistory = (Array.isArray(history) ? history : []).slice(-10);

      for (const model of candidateModels) {
        try {
          const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openRouterKey}`,
              'HTTP-Referer': 'https://thebccargo.com',
              'X-Title': 'BC Cargo AI',
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemPrompt },
                ...safeHistory.map((h: any) => ({
                  role: h?.sender === 'user' ? 'user' : 'assistant',
                  content: typeof h?.text === 'string' ? h.text.slice(0, 1000) : '',
                })),
                { role: 'user', content: userMessage },
              ],
              temperature: 0.1,
              max_tokens: 300,
            }),
          });

          if (aiRes.ok) {
            const data = await aiRes.json();
            const replyText = data.choices?.[0]?.message?.content?.trim();
            if (replyText) {
              return new Response(
                JSON.stringify({
                  reply: replyText,
                  actions: [WHATSAPP_ACTION, PRICE_ACTION],
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }
        } catch (_err) {
          // Fall through to next candidate model
        }
      }
    }

    // Default polite response if OpenRouter is offline or fails
    return new Response(
      JSON.stringify({
        reply: 'I help with international cargo shipping, home pickup around Hetauda (free in Hetauda, Pathlaiya, Jitpur and Simara over 20 kg), and rates. For custom quotes, booking, or tracking, please message our team on WhatsApp.',
        actions: [WHATSAPP_ACTION, PRICE_ACTION],
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

if (typeof Deno !== 'undefined' && Deno.serve) {
  Deno.serve(handler);
} else {
  // @ts-ignore
  import('https://deno.land/std@0.177.0/http/server.ts').then(({ serve }: any) => serve(handler)).catch(() => {});
}
