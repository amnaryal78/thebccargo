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

      // 2. Chat API dev endpoint: the same pipeline as server.js (server/ai/)
      server.middlewares.use('/api/chat', async (req, res) => {
        const send = (status: number, body: unknown) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        };
        if (req.method !== 'POST') return send(405, { error: 'Method Not Allowed' });
        let raw = '';
        req.on('data', (chunk) => { raw += chunk; });
        req.on('end', async () => {
          try {
            const [{ handleChat }, { getAiConfig }] = await Promise.all([
              server.ssrLoadModule('/server/ai/chatHandler.js'),
              server.ssrLoadModule('/server/ai/config.js'),
            ]);
            const payload = JSON.parse(raw || '{}');
            const { status, body } = await handleChat(payload, { config: getAiConfig(process.env) });
            send(status, body);
          } catch {
            send(500, { type: 'error', retryable: true, reply: "I'm having trouble responding right now. Please try again in a moment, or contact BC Cargo directly." });
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

/**
 * Preloads the two above-the-fold font files (heading + body, latin subset) so text paints in its
 * final font without waiting for the stylesheet to be parsed first. Hashed names are resolved at build.
 */
function preloadCriticalFonts(): Plugin {
  return {
    name: 'bc-preload-critical-fonts',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const files = Object.keys(ctx.bundle ?? {}).filter((f) =>
          /(archivo|public-sans)-latin-wght-normal-[\w-]+\.woff2$/.test(f),
        );
        return files.map((f) => ({
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: '/' + f, crossorigin: '' },
          injectTo: 'head-prepend' as const,
        }));
      },
    },
  };
}

/**
 * main.tsx loads the app with a dynamic import (so the loader paints first). Dynamic chunks are normally
 * only fetched once the import() runs, so modulepreload the app chunk and everything it needs up front.
 */
function preloadAppChunks(): Plugin {
  return {
    name: 'bc-preload-app-chunks',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const bundle = ctx.bundle ?? {};
        const entry = Object.values(bundle).find((c) => c.type === 'chunk' && c.isEntry) as
          | { dynamicImports: string[] }
          | undefined;
        if (!entry) return [];
        const seen = new Set<string>();
        const visit = (file: string) => {
          if (seen.has(file)) return;
          const chunk = bundle[file];
          if (!chunk || chunk.type !== 'chunk') return;
          seen.add(file);
          chunk.imports.forEach(visit);
        };
        entry.dynamicImports.filter((f) => /bootstrap-/.test(f)).forEach(visit);
        return [...seen].filter((f) => !html.includes('href="/' + f + '"')).map((f) => ({
          tag: 'link',
          attrs: { rel: 'modulepreload', crossorigin: '', href: '/' + f },
          injectTo: 'head' as const,
        }));
      },
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), bcCargoApiPlugin(), preloadCriticalFonts(), preloadAppChunks()],
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
  allowedHosts: [
    'destiny-pedometer-radar.ngrok-free.dev',
  ],
},
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || 'https://xtipmcthdyyubohspjro.supabase.co'),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || ''),
    },
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          // React core + router (incl. the JSX runtime) stay in one chunk so the entry never has to
          // download an unrelated vendor chunk (it used to pull all of framer-motion just for jsx-runtime).
          codeSplitting: {
            groups: [
              { name: 'vendor-react', test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|@remix-run)[\\/]/, priority: 40 },
              { name: 'vendor-motion', test: /[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/, priority: 30 },
              { name: 'vendor-supabase', test: /[\\/]node_modules[\\/]@supabase[\\/]/, priority: 30 },
              { name: 'vendor-icons', test: /[\\/]node_modules[\\/]lucide-react[\\/]/, priority: 30 },
            ],
          },
        } as Record<string, unknown>,
      },
    }
  };
});
