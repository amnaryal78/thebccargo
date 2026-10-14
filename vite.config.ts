import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

function bcCargoApiPlugin(): Plugin {
  return {
    name: 'bc-cargo-api-dev-server',
    configureServer(server) {
      // 1. Health check dev endpoint
      server.middlewares.use('/api/health', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'healthy', env: 'development', timestamp: new Date().toISOString() }));
      });

      // 2. Chat API dev endpoint
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method Not Allowed');
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body || '{}');
            const userMessage = payload.message || '';
            const settings = payload.settings || {};
            const knowledge = payload.knowledge || [];
            const history = payload.history || [];

            const lowerMsg = userMessage.toLowerCase().trim();
            const forbidden = [
              'prime minister', 'president', 'write python', 'write code', 'medical advice',
              'tell me a joke', 'recipe', 'movie', 'actor', 'system prompt', 'api key', 'secret key',
              'crypto', 'bitcoin', 'stock market'
            ];

            if (forbidden.some(f => lowerMsg.includes(f))) {
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                reply: settings.fallbackMessage || 'I can help only with The BC Cargo services, pickup, delivery, tracking, rates, destinations, and contact information. Please ask me something about BC Cargo.',
                isFallback: true
              }));
            }

            const knowledgeText = knowledge.map((k: any) => `[${k.category}] ${k.title}: ${k.content}`).join('\n');
            const fallbackMsgText = settings.fallbackMessage || 'I can help only with The BC Cargo services, pickup, delivery, tracking, rates, destinations, and contact information. Please ask me something about BC Cargo.';

            const systemPrompt = `You are "BC Cargo AI", the official controlled digital customer service assistant for The BC Cargo & Courier.
Your sole job is to answer customer questions strictly based on approved BC Cargo information below.
Rules:
1. Represent ONLY The BC Cargo & Courier (Government Licensed #B-409).
2. Answer strictly using the approved knowledge below. Do NOT invent prices, delivery times, or policies.
3. If asked anything outside BC Cargo services, reply strictly with: "${fallbackMsgText}"
4. Keep answers concise, polite, professional, and clear.
5. Support English and Nepali naturally.

APPROVED BC CARGO KNOWLEDGE:
${knowledgeText}`;

            const openRouterKey = process.env.OPENROUTER_API_KEY;
            const reqModel = settings.model || process.env.DEFAULT_AI_MODEL || 'google/gemma-4-26b-a4b-it:free';
            const candidateModels = [reqModel, 'openrouter/auto', 'meta-llama/llama-3-8b-instruct:free'];

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
                        ...history.map((h: any) => ({ role: h.sender === 'user' ? 'user' : 'assistant', content: h.text })),
                        { role: 'user', content: userMessage }
                      ],
                      temperature: 0.2,
                      max_tokens: settings.maxTokens || 400
                    })
                  });

                  if (openRouterRes.ok) {
                    const data = await openRouterRes.json();
                    const aiText = data.choices?.[0]?.message?.content;
                    if (aiText) {
                      res.setHeader('Content-Type', 'application/json');
                      return res.end(JSON.stringify({ reply: aiText.trim() }));
                    }
                  }
                } catch (e) {}
              }
            }

            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({
              reply: `I am BC Cargo AI. I can assist you with our priority air freight, domestic courier, sea cargo, doorstep pickup, or package tracking. How can I help you with your shipment today?`
            }));

          } catch (e: any) {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: e.message }));
          }
        });
      });

      // 3. Blog Fixer API dev endpoint
      server.middlewares.use('/api/fix-blog', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method Not Allowed');
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body || '{}');
            const openRouterKey = process.env.OPENROUTER_API_KEY;

            if (!openRouterKey) {
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                improvedTitle: payload.title || '',
                improvedExcerpt: payload.excerpt || '',
                improvedContent: payload.content || '',
                changesSummary: ['OPENROUTER_API_KEY is not configured in .env. Original content preserved.']
              }));
            }

            const modelToUse = payload.model || process.env.DEFAULT_AI_MODEL || 'google/gemma-4-26b-a4b-it:free';
            const systemPrompt = `You are an expert editorial assistant for The BC Cargo & Courier Service.
Your task is to fix grammar, spelling, punctuation, and markdown formatting (H2/H3 headings, bold, italics, bullet lists) for the article.

RULES:
1. Preserve original facts, numbers, dates, prices, URLs, and intent EXACTLY.
2. DO NOT invent new facts or marketing claims.
3. Output MUST be ONLY a JSON object (no introductory conversation, no markdown wrappers around the JSON).

JSON SCHEMA TO RETURN:
{
  "improvedTitle": "corrected article title",
  "improvedExcerpt": "corrected excerpt text",
  "improvedContent": "corrected content formatted in clean markdown",
  "changesSummary": ["Bullet point 1 of fixes", "Bullet point 2 of fixes"]
}`;

            const userPrompt = `Mode: ${payload.mode || 'full'}
${payload.customRules ? `Custom Editorial Instructions: ${payload.customRules}\n` : ''}

Original Title:
${payload.title}

Original Excerpt:
${payload.excerpt}

Original Content:
${payload.content}

Return ONLY the raw JSON object conforming to the schema.`;

            const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openRouterKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://thebccargo.com',
                'X-Title': 'The BC Cargo Admin AI Fixer'
              },
              body: JSON.stringify({
                model: modelToUse,
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userPrompt }
                ],
                temperature: 0.1
              })
            });

            if (!aiResponse.ok) {
              const errText = await aiResponse.text();
              res.statusCode = aiResponse.status;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: `AI provider error: ${errText}` }));
            }

            const data = await aiResponse.json();
            const rawContent = data.choices?.[0]?.message?.content || '';

            let parsed: any = null;
            try {
              const cleaned = rawContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
              parsed = JSON.parse(cleaned);
            } catch (e) {
              const firstBrace = rawContent.indexOf('{');
              const lastBrace = rawContent.lastIndexOf('}');
              if (firstBrace !== -1 && lastBrace > firstBrace) {
                try {
                  parsed = JSON.parse(rawContent.substring(firstBrace, lastBrace + 1));
                } catch (e2) {}
              }
            }

            if (parsed && typeof parsed === 'object') {
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                improvedTitle: parsed.improvedTitle || payload.title,
                improvedExcerpt: parsed.improvedExcerpt || payload.excerpt,
                improvedContent: parsed.improvedContent || payload.content,
                changesSummary: Array.isArray(parsed.changesSummary) ? parsed.changesSummary : ['Grammar and formatting updated.'],
                rawResponse: rawContent
              }));
            }

            const cleanRawMarkdown = rawContent.replace(/^```markdown\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({
              improvedTitle: payload.title,
              improvedExcerpt: payload.excerpt,
              improvedContent: cleanRawMarkdown.length > 50 ? cleanRawMarkdown : payload.content,
              changesSummary: ['Formatting and text polished by AI assistant.'],
              rawResponse: rawContent
            }));

          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), bcCargoApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'framer-motion', 'dotted-map'],
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
  };
});
