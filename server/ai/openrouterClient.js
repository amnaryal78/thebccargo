/**
 * OpenRouter chat client. Sends the model list in OpenRouter's native `models` fallback field (max 3 per request),
 * and on transient failures retries with backoff, rotating which models lead the list.
 * Deterministic failures (bad request, auth, billing) are not retried.
 */
export class AiUnavailableError extends Error {
  constructor(reason, detail = {}) {
    super(reason);
    this.reason = reason;
    Object.assign(this, detail);
  }
}

const RETRYABLE_STATUS = new Set([404, 408, 409, 429, 500, 502, 503, 504, 529]);
const MODELS_PER_REQUEST = 3;
const defaultSleep = (ms) => new Promise((r) => setTimeout(r, ms));


function retryAfterMs(res) {
  const secs = Number(res.headers?.get?.('retry-after'));
  return Number.isFinite(secs) && secs > 0 ? Math.min(secs * 1000, 4000) : 0;
}

/** Returns { text, model, attempts, fallbackCount } or throws AiUnavailableError. */
export async function chatCompletion({ messages, config, maxTokens = 300, temperature = 0.2, fetchImpl = fetch, sleep = defaultSleep }) {
  if (!config.apiKey) throw new AiUnavailableError('not_configured');
  const started = Date.now();
  const failures = [];

  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    const start = attempt % config.models.length;
    const group = [...config.models.slice(start), ...config.models.slice(0, start)].slice(0, MODELS_PER_REQUEST);
    let wait = Math.min(400 * 2 ** attempt, 3000) + Math.floor(Math.random() * 200);
    try {
      const res = await fetchImpl('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
          'HTTP-Referer': config.siteUrl,
          'X-Title': config.appName,
        },
        body: JSON.stringify({ model: group[0], models: group, messages, max_tokens: maxTokens, temperature }),
        signal: AbortSignal.timeout(config.timeoutMs),
      });

      if (!res.ok) {
        if (!RETRYABLE_STATUS.has(res.status)) throw new AiUnavailableError(`http_${res.status}`, { failures: [...failures, `http_${res.status}`], attempts: attempt + 1 });
        failures.push(`http_${res.status}`);
        wait = retryAfterMs(res) || wait;
      } else {
        const data = await res.json().catch(() => null);
        const content = data?.choices?.[0]?.message?.content;
        if (typeof content === 'string' && content.trim()) {
          const model = typeof data.model === 'string' ? data.model : group[0];
          return { text: content.trim(), model, attempts: attempt + 1, fallbackCount: attempt + (model !== config.models[0] ? 1 : 0) };
        }
        // 200 with an error body, or no usable text: both are provider hiccups.
        failures.push(data?.error ? `body_error_${data.error.code ?? 'unknown'}` : 'malformed');
      }
    } catch (e) {
      if (e instanceof AiUnavailableError) throw e;
      failures.push(e?.name === 'TimeoutError' || e?.name === 'AbortError' ? 'timeout' : 'network');
    }
    if (attempt + 1 >= config.maxAttempts || Date.now() - started + wait > config.deadlineMs) break;
    await sleep(wait);
  }
  throw new AiUnavailableError('exhausted', { failures, attempts: failures.length });
}
