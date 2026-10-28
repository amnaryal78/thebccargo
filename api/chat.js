// Vercel function for /api/chat (takes precedence over the /api/* rewrite to the old Render server). Same pipeline as server.js.
import { getAiConfig } from '../server/ai/config.js';
import { handleChat } from '../server/ai/chatHandler.js';
import { createRateLimiter } from '../server/ai/rateLimit.js';

const config = getAiConfig();
// shortcut: per-instance counter, so the limit is approximate on serverless; use a shared store if abuse shows up.
const allowed = createRateLimiter(20, 60 * 1000);
const SAFE = "I'm having trouble responding right now. Please try again in a moment, or contact BC Cargo directly.";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (!allowed(ip)) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({ type: 'error', retryable: true, reply: 'You are sending messages very quickly. Please wait a moment and try again.' });
  }
  const payload = req.body;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return res.status(400).json({ error: 'Invalid request.' });
  try {
    const { status, body } = await handleChat(payload, { config });
    return res.status(status).json(body);
  } catch {
    return res.status(500).json({ type: 'error', retryable: true, reply: SAFE });
  }
}
