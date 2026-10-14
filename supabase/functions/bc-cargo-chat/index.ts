// Supabase Edge Function: BC Cargo AI Assistant
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    let payload: any = {};
    try {
      payload = await req.json();
    } catch (_e) {
      payload = {};
    }

    const { message, settings, knowledge, history } = payload;
    const userMessage = (message || '').trim();
    const fallbackMsg = settings?.fallbackMessage || 'I can help only with The BC Cargo services, pickup, delivery, tracking, rates, destinations, and contact information. Please ask me something about BC Cargo.';

    // Scope & Guardrails check
    const lowerMsg = userMessage.toLowerCase();
    const forbidden = [
      'prime minister', 'president', 'write python', 'write code', 'medical advice',
      'tell me a joke', 'recipe', 'movie', 'actor', 'system prompt', 'api key', 'secret key',
      'crypto', 'bitcoin', 'stock market'
    ];
    if (forbidden.some(f => lowerMsg.includes(f))) {
      return new Response(
        JSON.stringify({ reply: fallbackMsg, isFallback: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const knowledgeText = (knowledge || []).map((k: any) => `[${k.category}] ${k.title}: ${k.content}`).join('\n');
    const systemPrompt = `You are "BC Cargo AI", the official controlled digital customer service assistant for The BC Cargo & Courier.
Your sole job is to answer customer questions strictly based on approved BC Cargo information below.
Rules:
1. Represent ONLY The BC Cargo & Courier (Government Licensed #B-409).
2. Answer strictly using approved knowledge. Do NOT invent prices, delivery times, or policies.
3. If asked anything outside BC Cargo services, reply strictly with: "${fallbackMsg}"
4. Keep answers concise, polite, professional, and clear.

APPROVED BC CARGO KNOWLEDGE:
${knowledgeText}`;

    const openRouterKey = (typeof Deno !== 'undefined' && Deno.env?.get('OPENROUTER_API_KEY')) || '';
    const reqModel = settings?.model || 'google/gemma-2-9b-it:free';
    const candidateModels = [reqModel, 'openrouter/auto', 'meta-llama/llama-3.1-8b-instruct:free', 'google/gemma-2-9b-it:free'];

    if (openRouterKey) {
      for (const modelName of candidateModels) {
        try {
          const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openRouterKey}`,
              'HTTP-Referer': 'https://thebccargo.com',
              'X-Title': 'BC Cargo AI Assistant'
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                { role: 'system', content: systemPrompt },
                ...(history || []).map((h: any) => ({ role: h.sender === 'user' ? 'user' : 'assistant', content: h.text })),
                { role: 'user', content: userMessage }
              ],
              temperature: 0.2,
              max_tokens: settings?.maxTokens || 400
            })
          });

          if (openRouterRes.ok) {
            const data = await openRouterRes.json();
            const aiText = data.choices?.[0]?.message?.content;
            if (aiText) {
              return new Response(
                JSON.stringify({ reply: aiText.trim() }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
              );
            }
          }
        } catch (_err) {
          // try next candidate model
        }
      }
    }

    return new Response(
      JSON.stringify({ reply: `I am BC Cargo AI. I can assist you with our priority air freight, domestic courier, sea cargo, doorstep pickup, or package tracking. How can I help you today?` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
};

if (typeof Deno !== 'undefined' && Deno.serve) {
  Deno.serve(handler);
} else {
  // @ts-ignore
  import('https://deno.land/std@0.177.0/http/server.ts').then(({ serve }: any) => serve(handler)).catch(() => {});
}
