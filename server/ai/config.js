/**
 * OpenRouter configuration. Models are configuration, not business logic: change them with env vars.
 * Only free models are accepted so a bad env value can never spend the OpenRouter balance.
 */
const DEFAULT_PRIMARY = 'poolside/laguna-s-2.1:free';
const DEFAULT_FALLBACKS = ['poolside/laguna-s-2.1:free', 'google/gemma-4-26b-a4b-it:free', 'google/gemma-4-31b-it:free', 'openrouter/free'];

export const isFreeModel = (id) => typeof id === 'string' && (id === 'openrouter/free' || id.endsWith(':free'));

const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);

export function getAiConfig(env = process.env) {
  const primary = [env.OPENROUTER_PRIMARY_MODEL, env.DEFAULT_AI_MODEL].map((m) => (m || '').trim()).find(isFreeModel) || DEFAULT_PRIMARY;
  const fallbacks = (env.OPENROUTER_FALLBACK_MODELS ? list(env.OPENROUTER_FALLBACK_MODELS) : DEFAULT_FALLBACKS).filter(isFreeModel);
  return {
    apiKey: env.OPENROUTER_API_KEY || '',
    models: [...new Set([primary, ...fallbacks])],
    siteUrl: env.OPENROUTER_SITE_URL || 'https://thebccargo.com',
    appName: env.OPENROUTER_APP_NAME || 'BC Cargo Assistant',
    timeoutMs: 15000,
    maxAttempts: 3,
    deadlineMs: 30000,
  };
}
