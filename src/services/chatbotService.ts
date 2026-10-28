import { 
  ChatbotSettings, 
  KnowledgeItem, 
  ChatbotRule, 
  ChatbotTool, 
  ChatbotSuggestion, 
  ChatMessage,
  ChatAction,
  ChatStats
} from '../types/chatbot';
import { 
  DEFAULT_CHATBOT_SETTINGS, 
  DEFAULT_KNOWLEDGE_BASE, 
  DEFAULT_RULES, 
  DEFAULT_TOOLS, 
  DEFAULT_SUGGESTIONS 
} from '../data/chatbotData';
import { fetchSheetRates } from './ratesService';
import { calculateSheetShipmentQuote } from '../features/estimator/engine';

const SETTINGS_KEY = 'bc_cargo_chatbot_settings';
const KNOWLEDGE_KEY = 'bc_cargo_chatbot_knowledge';
const RULES_KEY = 'bc_cargo_chatbot_rules';
const TOOLS_KEY = 'bc_cargo_chatbot_tools';
const SUGGESTIONS_KEY = 'bc_cargo_chatbot_suggestions';
const STATS_KEY = 'bc_cargo_chatbot_stats';

// Standard action buttons (single words, matching Lucide icons)
const ACTION_WHATSAPP: ChatAction = { label: 'WhatsApp', type: 'whatsapp', payload: '9779855019485' };
const ACTION_PRICE: ChatAction = { label: 'Price', type: 'navigate', payload: 'rates' };
const ACTION_CALL: ChatAction = { label: 'Call', type: 'call', payload: '+9779855019485' };

function getStorageItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage.getItem(key);
    }
  } catch {}
  return null;
}

function setStorageItem(key: string, val: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, val);
      return;
    }
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      (globalThis as any).localStorage.setItem(key, val);
    }
  } catch {}
}

// ============================================================================
// ADMIN CONFIGURATION STORAGE & UTILITIES
// ============================================================================

export function getChatbotSettings(): ChatbotSettings {
  try {
    const saved = getStorageItem(SETTINGS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return DEFAULT_CHATBOT_SETTINGS;
}

export function saveChatbotSettings(settings: ChatbotSettings): void {
  settings.updatedAt = new Date().toISOString();
  setStorageItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getKnowledgeItems(): KnowledgeItem[] {
  try {
    const saved = getStorageItem(KNOWLEDGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return DEFAULT_KNOWLEDGE_BASE;
}

export function saveKnowledgeItem(item: KnowledgeItem): KnowledgeItem[] {
  const items = getKnowledgeItems();
  const existingIdx = items.findIndex(k => k.id === item.id);
  item.updatedAt = new Date().toISOString();
  if (existingIdx >= 0) {
    items[existingIdx] = item;
  } else {
    items.push(item);
  }
  setStorageItem(KNOWLEDGE_KEY, JSON.stringify(items));
  return items;
}

export function deleteKnowledgeItem(id: string): KnowledgeItem[] {
  const items = getKnowledgeItems().filter(k => k.id !== id);
  setStorageItem(KNOWLEDGE_KEY, JSON.stringify(items));
  return items;
}

export function getRules(): ChatbotRule[] {
  try {
    const saved = getStorageItem(RULES_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return DEFAULT_RULES;
}

export function saveRule(rule: ChatbotRule): ChatbotRule[] {
  const rules = getRules();
  const idx = rules.findIndex(r => r.id === rule.id);
  if (idx >= 0) {
    rules[idx] = rule;
  } else {
    rules.push(rule);
  }
  setStorageItem(RULES_KEY, JSON.stringify(rules));
  return rules;
}

export function getTools(): ChatbotTool[] {
  try {
    const saved = getStorageItem(TOOLS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return DEFAULT_TOOLS;
}

export function toggleTool(id: string, enabled: boolean): ChatbotTool[] {
  const tools = getTools();
  const idx = tools.findIndex(t => t.id === id);
  if (idx >= 0) {
    tools[idx].enabled = enabled;
    setStorageItem(TOOLS_KEY, JSON.stringify(tools));
  }
  return tools;
}

export function getSuggestions(): ChatbotSuggestion[] {
  try {
    const saved = getStorageItem(SUGGESTIONS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return DEFAULT_SUGGESTIONS;
}

export function saveSuggestion(suggestion: ChatbotSuggestion): ChatbotSuggestion[] {
  const list = getSuggestions();
  const idx = list.findIndex(s => s.id === suggestion.id);
  if (idx >= 0) {
    list[idx] = suggestion;
  } else {
    list.push(suggestion);
  }
  setStorageItem(SUGGESTIONS_KEY, JSON.stringify(list));
  return list;
}

export function deleteSuggestion(id: string): ChatbotSuggestion[] {
  const list = getSuggestions().filter(s => s.id !== id);
  setStorageItem(SUGGESTIONS_KEY, JSON.stringify(list));
  return list;
}

export function getChatStats(): ChatStats {
  try {
    const saved = getStorageItem(STATS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
    totalConversations: 1,
    totalMessages: 0,
    fallbackCount: 0,
    toolExecutionCount: 0,
    lastActive: new Date().toISOString()
  };
}

export function updateStats(incMessage = 1, incFallback = 0, incTool = 0): void {
  const stats = getChatStats();
  stats.totalMessages += incMessage;
  stats.fallbackCount += incFallback;
  stats.toolExecutionCount += incTool;
  stats.lastActive = new Date().toISOString();
  setStorageItem(STATS_KEY, JSON.stringify(stats));
}

// ============================================================================
// PROMPT INJECTION & SCOPE CLASSIFIER
// ============================================================================

const OUT_OF_SCOPE_KEYWORDS = [
  'prime minister', 'president', 'government policy', 'election', 'politics',
  'python code', 'javascript', 'html', 'write code', 'program', 'function',
  'medical advice', 'doctor', 'illness', 'treatment',
  'tell me a joke', 'recipe', 'movie', 'actor', 'celebrity', 'weather in',
  'who is', 'system prompt', 'api key', 'secret key', 'database password',
  'ignore previous instructions', 'you are free', 'jailbreak', 'dan mode',
  'crypto', 'bitcoin', 'stock market', 'finance advice', 'essay', 'homework',
  'poem', 'sing a song', 'joke'
];

/** Cheap pre-filter for obvious off-topic or injection attempts. Everything else is judged by the AI's own cargo-only rules. */
export function isQueryInScope(query: string): boolean {
  const lower = query.toLowerCase().trim();
  return !OUT_OF_SCOPE_KEYWORDS.some(word => lower.includes(word));
}

// ============================================================================
// CHATBOT SERVICE EXECUTION PIPELINE
// ============================================================================

export async function processChatMessage(
  userQuery: string,
  history: ChatMessage[] = [],
  turnstileToken?: string
): Promise<ChatMessage> {
  const settings = getChatbotSettings();

  if (!settings.enabled) {
    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: settings.maintenanceMessage,
      timestamp: new Date().toISOString(),
    };
  }

  const cleanQuery = userQuery.trim();

  // Rule 1: Out-of-scope & Prompt Injection guardrail
  if (!isQueryInScope(cleanQuery)) {
    updateStats(1, 1, 0);
    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: settings.fallbackMessage,
      timestamp: new Date().toISOString(),
      isFallback: true,
      actions: [ACTION_WHATSAPP, ACTION_CALL],
    };
  }

  const lower = cleanQuery.toLowerCase();

  const trackingMatch = cleanQuery.match(/(BC-\d+-[A-Z]+|NP-\d+-[A-Z]+)/i);
  if (trackingMatch || (lower.includes('track') && (lower.includes('bc-') || lower.includes('np-') || lower.includes('shipment')))) {
    const trackingCode = trackingMatch ? trackingMatch[1].toUpperCase() : '';
    updateStats(1, 0, 1);
    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: trackingCode
        ? `Live tracking for ${trackingCode} needs human verification. Click Track below or message our staff on WhatsApp.`
        : 'Live tracking needs human staff assistance. Please message our WhatsApp with your tracking code, or call us.',
      timestamp: new Date().toISOString(),
      actions: trackingCode
        ? [{ label: 'Track', type: 'track', payload: trackingCode }, ACTION_WHATSAPP]
        : [ACTION_WHATSAPP, ACTION_CALL],
    };
  }

  // Real AI (server /api/chat). It may ask for the live-rates tool, which runs here on the same engine as the Rates page.
  try {
    let reply = await callRemoteChatApi(cleanQuery, history, settings, turnstileToken);
    if (reply?.toolCall) {
      const toolResult = await runQuoteTool(reply.toolCall);
      updateStats(1, 0, 1);
      reply = await callRemoteChatApi(cleanQuery, history, settings, turnstileToken, toolResult);
    } else {
      updateStats(1, 0, 0);
    }
    if (reply?.text) return { ...reply, actions: reply.actions ?? [ACTION_PRICE, ACTION_WHATSAPP] };
  } catch (e) {
    console.warn('AI chat call failed:', e);
  }

  // Honest fallback: say the AI is down, never pretend to answer.
  updateStats(1, 1, 0);
  return {
    id: `bot-${Date.now()}`,
    sender: 'assistant',
    text: 'Our AI assistant is not available right now. Please use the Rates page for prices, or message our team on WhatsApp +977 9855019485 or call 057-591816.',
    timestamp: new Date().toISOString(),
    isFallback: true,
    actions: [ACTION_PRICE, ACTION_WHATSAPP, ACTION_CALL],
  };
}

interface QuoteToolCall { country?: unknown; weight_kg?: unknown; liquid?: unknown; medicine?: unknown; meat_kg?: unknown }

/** Runs the real Rates-page engine on live rates. Returns plain facts for the AI to explain. */
export async function runQuoteTool(call: QuoteToolCall): Promise<Record<string, unknown>> {
  const country = typeof call.country === 'string' ? call.country.trim().slice(0, 80) : '';
  const weight = Number(call.weight_kg);
  if (!country || !(weight > 0) || weight > 5000) return { available: false, reason: 'Need a destination country and a weight in kg.' };
  const { rates } = await fetchSheetRates();
  if (!rates.length) return { available: false, reason: 'Live rates are not loadable right now.' };
  const meatKg = Math.max(0, Number(call.meat_kg) || 0);
  const q = calculateSheetShipmentQuote(
    { destination: country, actualWeightKg: weight, hasLiquid: call.liquid === true, hasMedicine: call.medicine === true, hasMeat: meatKg > 0, meatKg },
    rates,
  );
  if (!q.allowed) return { available: false, reason: q.blockedReason };
  if (q.meatBlocked) return { available: false, reason: q.meatBlockedReason };
  return {
    available: true,
    destination: q.destinationName,
    totalWeightKg: q.totalWeightKg,
    boxes: q.boxCount,
    shippingNpr: q.baseShippingCharge,
    boxChargeNpr: q.boxCharge,
    liquidNpr: q.liquidCharge,
    medicineNpr: q.medicineCharge,
    meatNpr: q.meatCharge,
    totalNpr: q.totalNpr,
    note: 'Excludes home pickup fee. Final price confirmed by staff.',
  };
}

// ============================================================================
// REMOTE API ADAPTER (Edge Function 'chat' & 'bc-cargo-chat' & POST /api/chat)
// ============================================================================

async function callRemoteChatApi(
  userQuery: string,
  history: ChatMessage[],
  settings: ChatbotSettings,
  turnstileToken?: string,
  toolResult?: Record<string, unknown>
): Promise<(ChatMessage & { toolCall?: QuoteToolCall }) | null> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: userQuery,
      history: history.slice(-6),
      settings,
      // Only a real widget token; the server no longer accepts a placeholder.
      turnstileToken: turnstileToken || undefined,
      toolResult,
    }),
  });
  if (!response.ok) return null;
  const data = await response.json();
  if (data?.toolCall) return { id: '', sender: 'assistant', text: '', timestamp: '', toolCall: data.toolCall };
  if (!data?.reply) return null;
  return {
    id: `bot-${Date.now()}`,
    sender: 'assistant',
    text: data.reply,
    timestamp: new Date().toISOString(),
    isFallback: data.isFallback,
    actions: data.actions,
  };
}
