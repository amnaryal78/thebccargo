/**
 * /api/chat pipeline:
 *   validate -> scope gate -> intent routing -> (browser runs the real BC Cargo service) -> LLM wording -> validation.
 * Phase 1 (no `facts`): returns a refusal, or { type: 'lookup', intent, params } for the browser to resolve.
 * Phase 2 (`facts` present): words the verified facts. Prices are never produced by the model.
 */
import { randomUUID } from 'node:crypto';
import { chatCompletion, AiUnavailableError } from './openrouterClient.js';
import { assessScope, detectLanguage, refusalMessage, safeErrorMessage } from './domainGuard.js';
import { DATA_INTENTS, extractDestinationCandidate, parseWeightKg, routeMessage } from './intentRouter.js';
import { buildClassifierMessages, buildWordingMessages, parseClassifierIntent, validateReply } from './responseGenerator.js';

export const MAX_MESSAGE_CHARS = 500;
const MAX_HISTORY = 6;
const MAX_FACTS_CHARS = 8000;

const clamp = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');

export function sanitizeHistory(raw) {
  return (Array.isArray(raw) ? raw : [])
    .slice(-MAX_HISTORY)
    .map((h) => ({ role: h && h.sender === 'user' ? 'user' : 'assistant', content: clamp(h && h.text, 300).trim() }))
    .filter((h) => h.content);
}

export function sanitizeContext(raw) {
  const c = raw && typeof raw === 'object' ? raw : {};
  const w = Number(c.weightKg);
  return {
    destination: clamp(c.destination, 60).trim(),
    weightKg: Number.isFinite(w) && w > 0 && w <= 5000 ? w : null,
    lastIntent: DATA_INTENTS.includes(c.lastIntent) ? c.lastIntent : '',
  };
}

const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

const logAi = (log, entry) => log(JSON.stringify({ evt: 'ai_chat', ...entry }));

/**
 * deps: { config, fetchImpl?, sleep?, log? }. Returns { status, body }.
 * Bodies: { type: 'reply'|'lookup'|'error', ... } — never raw provider errors.
 */
export async function handleChat(payload, deps) {
  const { config, fetchImpl, sleep, log = console.log } = deps;
  const requestId = randomUUID().slice(0, 8);
  const started = Date.now();
  const message = clamp(payload.message, MAX_MESSAGE_CHARS + 1).trim();
  const done = (status, body, extra = {}) => {
    logAi(log, { requestId, ms: Date.now() - started, ok: body.type !== 'error', ...extra });
    return { status, body: { requestId, ...body } };
  };

  if (!message) return done(400, { type: 'error', reply: 'Please type a message.' }, { intent: 'INVALID' });
  if (message.length > MAX_MESSAGE_CHARS) {
    return done(200, { type: 'reply', intent: 'INVALID', reply: `Could you shorten that a little? I can read up to ${MAX_MESSAGE_CHARS} characters.` }, { intent: 'INVALID' });
  }

  const history = sanitizeHistory(payload.history);
  const context = sanitizeContext(payload.context);
  const language = detectLanguage(message);
  const complete = (messages, maxTokens) => chatCompletion({ messages, config, maxTokens, fetchImpl, sleep });
  const failed = (intent, e) =>
    done(200, { type: 'error', intent, retryable: true, reply: safeErrorMessage(message) }, {
      intent, reason: e instanceof AiUnavailableError ? e.reason : 'internal', failures: e?.failures, attempts: e?.attempts,
    });

  try {
    // Phase 2: word the facts the browser retrieved. The gate runs again so facts cannot launder an off-topic question.
    if (payload.facts !== undefined) {
      const intent = payload.intent;
      const facts = payload.facts;
      const factsJson = isPlainObject(facts) ? JSON.stringify(facts) : '';
      if (!DATA_INTENTS.includes(intent) || !factsJson || factsJson.length > MAX_FACTS_CHARS || assessScope(message).scope === 'out') {
        return done(200, { type: 'reply', intent: 'OUT_OF_SCOPE', reply: refusalMessage(message) }, { intent: 'OUT_OF_SCOPE', phase: 2 });
      }
      let last;
      for (const strict of [false, true]) {
        last = await complete(buildWordingMessages({ message, history, facts, language, strict }), 350);
        if (validateReply(last.text, facts, message)) {
          return done(200, { type: 'reply', intent, reply: last.text }, { intent, phase: 2, model: last.model, fallbackCount: last.fallbackCount });
        }
      }
      return done(200, { type: 'error', intent, retryable: true, reply: safeErrorMessage(message) }, { intent, phase: 2, reason: 'validation_failed', model: last.model });
    }

    // Phase 1
    let routed = routeMessage(message, context);
    let model;
    if (routed.intent === null) {
      // No signal at all: ask the model to classify, but only its enum answer is used.
      const r = await complete(buildClassifierMessages(message), 30);
      model = r.model;
      const intent = parseClassifierIntent(r.text);
      routed = { intent: intent || 'OUT_OF_SCOPE', params: { destination: extractDestinationCandidate(message), weightKg: parseWeightKg(message) } };
    }
    if (routed.intent === 'OUT_OF_SCOPE') {
      return done(200, { type: 'reply', intent: 'OUT_OF_SCOPE', reply: refusalMessage(message) }, { intent: 'OUT_OF_SCOPE', phase: 1, reason: routed.reason, model });
    }
    return done(200, { type: 'lookup', intent: routed.intent, params: routed.params }, { intent: routed.intent, phase: 1, model });
  } catch (e) {
    return failed('UNKNOWN', e);
  }
}
