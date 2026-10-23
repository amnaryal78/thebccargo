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
import zlib from 'zlib';
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
// 3a. Shared request guards for the AI endpoints
// ============================================================================
// Only free models: the client cannot pick a paid model and spend the OpenRouter balance.
const ALLOWED_AI_MODELS = new Set([
  'google/gemma-4-26b-a4b-it:free',
  'poolside/laguna-s-2.1:free',
  'openrouter/free',
  'meta-llama/llama-3-8b-instruct:free',
  ...(process.env.DEFAULT_AI_MODEL ? [process.env.DEFAULT_AI_MODEL] : []),
]);
const FALLBACK_AI_MODEL = process.env.DEFAULT_AI_MODEL || 'google/gemma-4-26b-a4b-it:free';

function pickModel(requested) {
  return typeof requested === 'string' && ALLOWED_AI_MODELS.has(requested) ? requested : FALLBACK_AI_MODEL;
}

const clampText = (value, max) => (typeof value === 'string' ? value.slice(0, max) : '');

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...BASE_SECURITY_HEADERS });
  res.end(JSON.stringify(obj));
}

/** Reads a JSON body up to maxBytes. Resolves null (after answering 400/413) when it is unusable. */
function readJsonBody(req, res, maxBytes) {
  return new Promise((resolve) => {
    let size = 0;
    const chunks = [];
    let done = false;
    const fail = (status, error) => {
      if (done) return;
      done = true;
      sendJson(res, status, { error });
      req.resume();
      resolve(null);
    };
    req.on('data', (chunk) => {
      if (done) return;
      size += chunk.length;
      if (size > maxBytes) return fail(413, 'Request is too large.');
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (done) return;
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fail(400, 'Invalid request.');
        done = true;
        resolve(parsed);
      } catch {
        fail(400, 'Invalid request.');
      }
    });
    req.on('error', () => fail(400, 'Invalid request.'));
  });
}

/**
 * True when the request carries a Supabase session for active staff. Asks Supabase itself
 * (`is_active_staff()` with the caller's JWT), so the server never has to trust the client.
 */
async function isStaffRequest(req) {
  const match = /^Bearer\s+([A-Za-z0-9._-]+)$/.exec(req.headers.authorization || '');
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!match || !url || !anonKey) return false;
  try {
    const r = await fetch(`${url}/rest/v1/rpc/is_active_staff`, {
      method: 'POST',
      headers: { apikey: anonKey, Authorization: `Bearer ${match[1]}`, 'Content-Type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(5000),
    });
    return r.ok && (await r.json()) === true;
  } catch {
    return false;
  }
}

// ============================================================================
// 3. AI Assistant Backend Proxy (/api/chat)
// ============================================================================
async function handleChatApi(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  const payload = await readJsonBody(req, res, 32 * 1024);
  if (!payload) return;
  {
    try {
      const userMessage = clampText(payload.message, 1000).trim();
      const settings = payload.settings && typeof payload.settings === 'object' ? payload.settings : {};
      const history = (Array.isArray(payload.history) ? payload.history : [])
        .slice(-10)
        .map(h => ({ sender: h && h.sender === 'user' ? 'user' : 'assistant', text: clampText(h && h.text, 1000) }));

      const WHATSAPP_ACTION = { label: 'WhatsApp', type: 'whatsapp', payload: '9779855019485' };
      const CALL_ACTION = { label: 'Call', type: 'call', payload: '+9779855019485' };
      const PRICE_ACTION = { label: 'Price', type: 'navigate', payload: 'rates' };

      const lowerMsg = userMessage.toLowerCase();
      const forbidden = [
        'prime minister', 'president', 'write python', 'write code', 'medical advice',
        'tell me a joke', 'recipe', 'movie', 'actor', 'system prompt', 'api key', 'secret key',
        'crypto', 'bitcoin', 'stock market'
      ];

      if (forbidden.some(f => lowerMsg.includes(f))) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          reply: settings.fallbackMessage || 'I only help with cargo, shipping, and BC Cargo services. For other inquiries, please message our team on WhatsApp at +977 9855019485 or call 057-591816.',
          isFallback: true,
          actions: [WHATSAPP_ACTION, CALL_ACTION]
        }));
      }

      // Meat rule check
      if (lowerMsg.includes('meat') || lowerMsg.includes('sukuti') || lowerMsg.includes('buff') || lowerMsg.includes('मासु')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        if (lowerMsg.includes('uk') || lowerMsg.includes('united kingdom') || lowerMsg.includes('europe') || lowerMsg.includes('hong kong') || lowerMsg.includes('hkg')) {
          return res.end(JSON.stringify({
            reply: 'Meat items (including dried/sukuti) are allowed for Europe, UK, and Hong Kong under special export packaging. Prohibited for other destinations.',
            actions: [WHATSAPP_ACTION, PRICE_ACTION]
          }));
        }
        return res.end(JSON.stringify({
          reply: 'Meat is accepted ONLY for Europe, UK, and Hong Kong. Meat shipments to USA, Australia, Gulf countries, Japan, Canada, and other destinations are strictly prohibited by customs.',
          actions: [WHATSAPP_ACTION, PRICE_ACTION]
        }));
      }

      // Pickup rule check
      if (lowerMsg.includes('pickup') || lowerMsg.includes('pick up') || lowerMsg.includes('collect') || lowerMsg.includes('उठाउने')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        if (lowerMsg.includes('london') || lowerMsg.includes('usa') || lowerMsg.includes('korea') || lowerMsg.includes('uk') || lowerMsg.includes('dubai') || lowerMsg.includes('australia') || lowerMsg.includes('outside nepal')) {
          return res.end(JSON.stringify({
            reply: 'We only pick up shipments within Nepal. We deliver worldwide. We do not pick up from outside Nepal.',
            actions: [WHATSAPP_ACTION, PRICE_ACTION]
          }));
        }
        return res.end(JSON.stringify({
          reply: 'Yes! We provide doorstep pickup anywhere in Nepal (Hetauda, Kathmandu, Pokhara, Chitwan, Birgunj, and all districts). Consignments are dispatched internationally from Nepal.',
          actions: [WHATSAPP_ACTION, PRICE_ACTION]
        }));
      }

      // Booking inquiry
      if (lowerMsg.includes('book') || lowerMsg.includes('booking') || lowerMsg.includes('बुकिङ')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          reply: 'Booking a shipment needs human staff to confirm customs paperwork and dispatch. Please message our team on WhatsApp or call our Hetauda office.',
          actions: [WHATSAPP_ACTION, CALL_ACTION]
        }));
      }

      // Tracking inquiry
      if (lowerMsg.includes('track') || lowerMsg.includes('tracking')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          reply: 'Live tracking updates need human staff assistance. Please message our WhatsApp with your tracking code, or call us.',
          actions: [WHATSAPP_ACTION, CALL_ACTION]
        }));
      }

      // Rates inquiry
      if (lowerMsg.includes('rate') || lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('how much') || lowerMsg.includes('भाडा')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          reply: 'Prices come strictly from our live rates tariff engine. Please click Price below to view exact live rates, or message our team on WhatsApp for a custom quotation.',
          actions: [PRICE_ACTION, WHATSAPP_ACTION]
        }));
      }

      const systemPrompt = `You are "BC Cargo AI", the official customer service assistant for The BC Cargo & Courier (Govt License #B-409, School Road -4, Hetauda, Nepal, Phone: +977 9855019485 / 057-591816, WhatsApp: +977 9855019485).
Strict Rules:
1. Talk ONLY about cargo, shipping, and BC Cargo. Reject non-cargo questions politely.
2. Use short, easy words. Be concise.
3. Pickup is ONLY within Nepal (doorstep pickup anywhere in Nepal). Delivery is worldwide.
4. Meat is ONLY accepted for Europe, UK, and Hong Kong. Prohibited everywhere else.
5. Prices come ONLY from the live rates function. NEVER guess or invent a price.
6. Booking and tracking need a human: tell the user to contact WhatsApp (+977 9855019485).
7. If you do not know the answer, tell the user to message on WhatsApp (+977 9855019485).
8. Answer in the same language the user asks (Nepali, English, etc.).`;

      const openRouterKey = process.env.OPENROUTER_API_KEY;
      const reqModel = pickModel(settings.model);
      // 'openrouter/auto' used to be here; it can route to paid models.
      const candidateModels = [...new Set([reqModel, 'openrouter/free', 'meta-llama/llama-3-8b-instruct:free'])];
      const maxTokens = Math.min(Math.max(Number(settings.maxTokens) || 300, 50), 400);

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
                  ...history.map(h => ({ role: h.sender, content: h.text })),
                  { role: 'user', content: userMessage }
                ],
                temperature: 0.1,
                max_tokens: maxTokens
              }),
              signal: AbortSignal.timeout(20000)
            });

            if (openRouterRes.ok) {
              const data = await openRouterRes.json();
              const aiText = data.choices?.[0]?.message?.content;
              if (aiText) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                  reply: aiText.trim(),
                  actions: [WHATSAPP_ACTION, PRICE_ACTION]
                }));
              }
            }
          } catch (e) {
            // Try next fallback model
          }
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        reply: `The BC Cargo Central HQ is at School Road -4, Hetauda, Nepal. We provide doorstep pickup across Nepal and worldwide express cargo delivery. How can we help you?`,
        actions: [WHATSAPP_ACTION, PRICE_ACTION]
      }));

    } catch (e) {
      console.error('[SERVER] /api/chat failed:', e.message);
      return sendJson(res, 500, { error: 'Chat is not available right now.' });
    }
  }
}

// ============================================================================
// 4. AI Blog Fixer Proxy (/api/fix-blog)
// ============================================================================
async function handleFixBlogApi(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  // Staff only: without this anyone could use the OpenRouter key as a free AI proxy.
  if (!(await isStaffRequest(req))) {
    req.resume();
    return sendJson(res, 401, { error: 'Sign in as staff to use the AI fixer.' });
  }

  const raw = await readJsonBody(req, res, 200 * 1024);
  if (!raw) return;
  {
    try {
      const payload = {
        title: clampText(raw.title, 300),
        excerpt: clampText(raw.excerpt, 1000),
        content: clampText(raw.content, 60000),
        mode: ['grammar', 'formatting', 'full'].includes(raw.mode) ? raw.mode : 'full',
        customRules: clampText(raw.customRules, 1000),
        model: raw.model,
      };
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

      const modelToUse = pickModel(payload.model);
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
        }),
        signal: AbortSignal.timeout(60000)
      });

      if (!response.ok) {
        console.error('[SERVER] /api/fix-blog provider error:', response.status);
        return sendJson(res, 502, { error: `AI provider error (${response.status}). Try again later.` });
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
      console.error('[SERVER] /api/fix-blog failed:', err.message);
      return sendJson(res, 500, { error: 'AI Blog Fixer processing failed.' });
    }
  }
}

// ============================================================================
// 5. In-Memory Sliding Window Rate Limiter
// ============================================================================
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests/min per IP
const ipRequestCounts = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  let record = ipRequestCounts.get(ip);
  if (!record || now - record.startTime > RATE_LIMIT_WINDOW_MS) {
    record = { count: 1, startTime: now };
    ipRequestCounts.set(ip, record);
    return true;
  }
  record.count++;
  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  return true;
}

// Clean up stale rate limit records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequestCounts.entries()) {
    if (now - record.startTime > RATE_LIMIT_WINDOW_MS) {
      ipRequestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref();

// ============================================================================
// 6. Security Headers Specification
// ============================================================================
const BASE_SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https://flagcdn.com https://*.supabase.co https://images.unsplash.com https://*.gstatic.com https://thebccargo.com; connect-src 'self' https://cdn.jsdelivr.net https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com https://www.google.com https://maps.google.com; object-src 'none'; base-uri 'self'; form-action 'self';",
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// ============================================================================
// 7. Stream with Brotli & Gzip Compression
// ============================================================================
function streamWithCompression(req, res, targetFile, headers, statusCode = 200) {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const ext = path.extname(targetFile).toLowerCase();
  
  // Compress text-based assets
  const isCompressible = ['.html', '.js', '.mjs', '.css', '.json', '.xml', '.txt', '.svg', '.map'].includes(ext);

  headers['Vary'] = 'Accept-Encoding';

  const rawStream = fs.createReadStream(targetFile);
  rawStream.on('error', () => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  });

  if (isCompressible && acceptEncoding.includes('br')) {
    headers['Content-Encoding'] = 'br';
    delete headers['Content-Length'];
    res.writeHead(statusCode, headers);
    rawStream.pipe(zlib.createBrotliCompress()).pipe(res);
  } else if (isCompressible && acceptEncoding.includes('gzip')) {
    headers['Content-Encoding'] = 'gzip';
    delete headers['Content-Length'];
    res.writeHead(statusCode, headers);
    rawStream.pipe(zlib.createGzip()).pipe(res);
  } else {
    res.writeHead(statusCode, headers);
    rawStream.pipe(res);
  }
}

// ============================================================================
// 8. Static File Serving with Prerender & SPA Fallback
// ============================================================================
function serveStaticFile(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname;
  try {
    pathname = decodeURIComponent(parsedUrl.pathname);
  } catch {
    // A malformed escape such as /%E0%A4%A used to throw here and crash the process.
    res.writeHead(400, { 'Content-Type': 'text/plain', ...BASE_SECURITY_HEADERS });
    return res.end('Bad Request');
  }

  // Security check: prevent directory traversal (the separator stops "../dist-old" passing)
  const safePath = path.normalize(path.join(DIST_DIR, pathname));
  if (safePath !== DIST_DIR && !safePath.startsWith(DIST_DIR + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Forbidden');
  }

  // Check if requested path points to a file
  fs.stat(safePath, (err, stats) => {
    let targetFile = safePath;
    let isFile = !err && stats.isFile();

    // 1. If it's a directory, check for index.html inside it
    if (!err && stats.isDirectory()) {
      const dirIndex = path.join(safePath, 'index.html');
      if (fs.existsSync(dirIndex)) {
        targetFile = dirIndex;
        isFile = true;
      }
    }

    // 2. Prerendered HTML: If route without extension (e.g. /rates, /services/air-freight-express)
    // Check if dist/<route>/index.html exists first!
    if (!isFile) {
      const cleanPath = pathname.replace(/^\//, '').replace(/\/$/, '');
      if (cleanPath && !path.extname(cleanPath)) {
        const prerenderedCandidate = path.join(DIST_DIR, cleanPath, 'index.html');
        if (fs.existsSync(prerenderedCandidate)) {
          targetFile = prerenderedCandidate;
          isFile = true;
        }
      }
    }

    // 3. SPA Fallback: If still not a file and no extension, serve main dist/index.html
    if (!isFile) {
      const ext = path.extname(pathname);
      if (!ext || ext === '.html') {
        targetFile = path.join(DIST_DIR, 'index.html');
        isFile = fs.existsSync(targetFile);
      }
    }

    if (!isFile) {
      res.writeHead(404, { 'Content-Type': 'text/plain', ...BASE_SECURITY_HEADERS });
      return res.end('404 Not Found');
    }

    const ext = path.extname(targetFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const headers = {
      ...BASE_SECURITY_HEADERS,
      'Content-Type': contentType
    };

    // Private app areas are never search results, whatever robots.txt says.
    if (/^\/(admin|login)(\/|$)/.test(pathname)) headers['X-Robots-Tag'] = 'noindex, nofollow';

    if (pathname.startsWith('/assets/')) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else if (ext === '.html') {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    } else {
      headers['Cache-Control'] = 'public, max-age=3600';
    }

    streamWithCompression(req, res, targetFile, headers);
  });
}

const PERMANENT_REDIRECTS = {
  '/rates/national': '/rates',
  '/rates/calculator': '/rates',
  '/services/courier-nat': '/services',
  '/services/haulage-nat': '/services',
  '/services/nepal-domestic-express': '/services',
  '/services/domestic-express-cargo': '/services'
};

// ============================================================================
// 9. Primary HTTP Request Dispatcher
// ============================================================================
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  // First hop only: the raw header ("client, proxy, ...") made a new bucket per proxy chain.
  // Direct calls to the Render origin can still spoof it; fronting proxies should overwrite it.
  const clientIp = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';

  // 301 Permanent Redirects for legacy routes
  if (PERMANENT_REDIRECTS[pathname]) {
    res.writeHead(301, {
      Location: PERMANENT_REDIRECTS[pathname],
      ...BASE_SECURITY_HEADERS
    });
    return res.end();
  }

  // Apply rate limiting to all /api/* endpoints
  if (pathname.startsWith('/api/')) {
    if (!checkRateLimit(clientIp)) {
      res.writeHead(429, { 
        'Content-Type': 'application/json',
        'Retry-After': '60',
        ...BASE_SECURITY_HEADERS 
      });
      return res.end(JSON.stringify({ 
        error: 'Rate limit exceeded. Please wait a moment before sending more requests.' 
      }));
    }
  }

  // Health check endpoint
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...BASE_SECURITY_HEADERS });
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

  // Static files with prerender and compression
  serveStaticFile(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`================================================================`);
  console.log(` The BC Cargo & Courier — Standalone Production Server`);
  console.log(` Listening on: http://${HOST}:${PORT}`);
  console.log(` Compression: Brotli & Gzip Active`);
  console.log(` Security Headers: CSP, HSTS, Permissions-Policy Active`);
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
