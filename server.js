/**
 * The BC Cargo & Courier — Standalone Production HTTP Server
 * 
 * Features:
 * - Zero external dependencies (runs directly with standard Node.js 18+)
 * - High-performance static file serving from ./dist with proper MIME types
 * - Client-side SPA routing fallback (serves index.html for React Router paths)
 * - Server-side /api/chat AI endpoint with OpenRouter proxy & strict BC Cargo guardrails
 * - Server-side /api/fix-blog endpoint for editorial assistant (keeps API keys off client)
 * - Security headers & optimized caching headers (immutable for hashed assets)
 * - Health check endpoint (/api/health)
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// 1. Environment Variable Loader (Zero-dependency .env parser)
// ============================================================================
function loadEnv() {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    } catch (e) {
      console.warn('[SERVER] Could not load .env file:', e.message);
    }
  }
}
loadEnv();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const DIST_DIR = path.resolve(__dirname, 'dist');

// ============================================================================
// 2. MIME Types Dictionary
// ============================================================================
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.mjs': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.xml': 'application/xml; charset=UTF-8',
  '.txt': 'text/plain; charset=UTF-8',
  '.pdf': 'application/pdf',
  '.map': 'application/json; charset=UTF-8'
};

// ============================================================================
// 3. AI Assistant Backend Proxy (/api/chat)
// ============================================================================
async function handleChatApi(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
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
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          reply: settings.fallbackMessage || 'I can help only with The BC Cargo services, pickup, delivery, tracking, rates, destinations, and contact information. Please ask me something about BC Cargo.',
          isFallback: true
        }));
      }

      const knowledgeText = knowledge.map(k => `[${k.category}] ${k.title}: ${k.content}`).join('\n');
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
                  ...history.map(h => ({ role: h.sender === 'user' ? 'user' : 'assistant', content: h.text })),
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
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ reply: aiText.trim() }));
              }
            }
          } catch (e) {
            // Try next fallback model
          }
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        reply: `I am BC Cargo AI. I can assist you with our priority air freight, domestic courier, sea cargo, doorstep pickup, or package tracking. How can I help you with your shipment today?`
      }));

    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: e.message }));
    }
  });
}

// ============================================================================
// 4. AI Blog Fixer Proxy (/api/fix-blog)
// ============================================================================
async function handleFixBlogApi(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const payload = JSON.parse(body || '{}');
      const openRouterKey = process.env.OPENROUTER_API_KEY;

      if (!openRouterKey) {
        // Safe offline fallback: return cleaned original input with notice
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          improvedTitle: payload.title || '',
          improvedExcerpt: payload.excerpt || '',
          improvedContent: payload.content || '',
          changesSummary: ['OPENROUTER_API_KEY is not set on the server. Original content retained.'],
          rawResponse: null
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

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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

      if (!response.ok) {
        const errText = await response.text();
        res.writeHead(response.status, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: `AI provider error (${response.status}): ${errText}` }));
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content || '';

      let parsed = null;
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
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          improvedTitle: parsed.improvedTitle || payload.title,
          improvedExcerpt: parsed.improvedExcerpt || payload.excerpt,
          improvedContent: parsed.improvedContent || payload.content,
          changesSummary: Array.isArray(parsed.changesSummary) ? parsed.changesSummary : ['Grammar and markdown formatting improved.'],
          rawResponse: rawContent
        }));
      }

      const cleanRawMarkdown = rawContent.replace(/^```markdown\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        improvedTitle: payload.title,
        improvedExcerpt: payload.excerpt,
        improvedContent: cleanRawMarkdown.length > 50 ? cleanRawMarkdown : payload.content,
        changesSummary: ['Formatting and text polished by AI assistant.'],
        rawResponse: rawContent
      }));

    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: err.message || 'AI Blog Fixer processing failed.' }));
    }
  });
}

// ============================================================================
// 5. Static File Serving with SPA Fallback
// ============================================================================
function serveStaticFile(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Security check: prevent directory traversal
  const safePath = path.normalize(path.join(DIST_DIR, pathname));
  if (!safePath.startsWith(DIST_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Forbidden');
  }

  // Check if requested path points to a file
  fs.stat(safePath, (err, stats) => {
    let targetFile = safePath;
    let isFile = !err && stats.isFile();

    // If it's a directory, check for index.html inside it
    if (!err && stats.isDirectory()) {
      const dirIndex = path.join(safePath, 'index.html');
      if (fs.existsSync(dirIndex)) {
        targetFile = dirIndex;
        isFile = true;
      }
    }

    // SPA fallback: If file doesn't exist and there is no file extension (e.g. /rates, /track, /book, /admin)
    if (!isFile) {
      const ext = path.extname(pathname);
      if (!ext || ext === '.html') {
        targetFile = path.join(DIST_DIR, 'index.html');
        isFile = fs.existsSync(targetFile);
      }
    }

    if (!isFile) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(targetFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const headers = {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    if (pathname.startsWith('/assets/')) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else if (ext === '.html') {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    } else {
      headers['Cache-Control'] = 'public, max-age=3600';
    }

    const stream = fs.createReadStream(targetFile);
    stream.on('error', (readErr) => {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    });

    res.writeHead(200, headers);
    stream.pipe(res);
  });
}

// ============================================================================
// 6. Primary HTTP Request Dispatcher
// ============================================================================
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Health check endpoint
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'healthy',
      app: 'The BC Cargo & Courier',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }));
  }

  // AI Chat Assistant endpoint
  if (pathname === '/api/chat') {
    return handleChatApi(req, res);
  }

  // AI Blog Fixer endpoint
  if (pathname === '/api/fix-blog') {
    return handleFixBlogApi(req, res);
  }

  // Static files and SPA fallback
  serveStaticFile(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`================================================================`);
  console.log(` The BC Cargo & Courier — Standalone Production Server`);
  console.log(` Listening on: http://${HOST}:${PORT}`);
  console.log(` Static Directory: ${DIST_DIR}`);
  console.log(` Health Check: http://${HOST}:${PORT}/api/health`);
  console.log(`================================================================`);
});

// Graceful termination handling
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[SERVER] SIGINT received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});
