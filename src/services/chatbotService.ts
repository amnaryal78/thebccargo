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
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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

const IN_SCOPE_KEYWORDS = [
  'bc cargo', 'cargo', 'courier', 'shipment', 'parcel', 'package', 'deliver',
  'tracking', 'track', 'rate', 'price', 'cost', 'fee', 'charge', 'service',
  'air freight', 'express', 'sea freight', 'ocean', 'truck', 'overland',
  'pickup', 'hetauda', 'kathmandu', 'nepal', 'korea', 'japan', 'australia',
  'usa', 'uk', 'dubai', 'uae', 'india', 'customs', 'contact', 'phone',
  'email', 'address', 'office', 'location', 'document', 'box', 'send', 'book',
  'awb', 'weight', 'kg', 'discount', 'offer', 'hours', 'time', 'broker',
  'meat', 'sukuti', 'buff', 'liquid', 'medicine', 'pokhara', 'chitwan', 'birgunj'
];

export function isQueryInScope(query: string): boolean {
  const lower = query.toLowerCase().trim();
  
  // Check explicit prompt injection / out-of-scope keywords
  for (const word of OUT_OF_SCOPE_KEYWORDS) {
    if (lower.includes(word)) {
      return false;
    }
  }

  // Check if query contains any BC Cargo domain context
  for (const word of IN_SCOPE_KEYWORDS) {
    if (lower.includes(word)) {
      return true;
    }
  }

  // Short greetings are allowed
  const greetings = ['hi', 'hello', 'namaste', 'hey', 'good morning', 'good afternoon', 'help', 'info', 'नमस्ते'];
  if (greetings.some(g => lower === g || lower.startsWith(g + ' ') || lower.startsWith(g + '!'))) {
    return true;
  }

  return false;
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

  // Rule 2: Meat policy (strict)
  if (lower.includes('meat') || lower.includes('sukuti') || lower.includes('buff') || lower.includes('मासु')) {
    updateStats(1, 0, 1);
    if (lower.includes('uk') || lower.includes('united kingdom') || lower.includes('europe') || lower.includes('hong kong') || lower.includes('hkg')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: 'Meat items (including dried/sukuti) are allowed for Europe, UK, and Hong Kong under special export packaging. Prohibited for other destinations.',
        timestamp: new Date().toISOString(),
        actions: [ACTION_WHATSAPP, ACTION_PRICE],
      };
    }
    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: 'Meat is accepted ONLY for Europe, UK, and Hong Kong. Meat shipments to USA, Australia, Gulf countries, Japan, Canada, and other destinations are strictly prohibited by customs.',
      timestamp: new Date().toISOString(),
      actions: [ACTION_WHATSAPP, ACTION_PRICE],
    };
  }

  // Rule 3: Pickup location (Nepal only; worldwide delivery)
  if (lower.includes('pickup') || lower.includes('pick up') || lower.includes('collect') || lower.includes('उठाउने')) {
    updateStats(1, 0, 1);
    if (lower.includes('london') || lower.includes('usa') || lower.includes('korea') || lower.includes('uk') || lower.includes('dubai') || lower.includes('australia') || lower.includes('outside nepal')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: 'We only pick up shipments within Nepal. We deliver worldwide to 190+ countries. We do not pick up from outside Nepal.',
        timestamp: new Date().toISOString(),
        actions: [ACTION_WHATSAPP, ACTION_PRICE],
      };
    }
    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: 'Yes! We provide doorstep pickup anywhere in Nepal (Hetauda, Kathmandu, Pokhara, Chitwan, Birgunj, and all 77 districts). Consignments are dispatched internationally from Nepal.',
      timestamp: new Date().toISOString(),
      actions: [ACTION_WHATSAPP, ACTION_PRICE],
    };
  }

  // Rule 4: Booking & Tracking require human staff
  if (lower.includes('book') || lower.includes('booking') || lower.includes('बुकिङ')) {
    updateStats(1, 0, 1);
    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: 'Booking a shipment needs human staff to confirm customs paperwork and dispatch. Please message our team on WhatsApp or call our Hetauda office.',
      timestamp: new Date().toISOString(),
      actions: [ACTION_WHATSAPP, ACTION_CALL],
    };
  }

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

  // Rule 5: Rates inquiry - never guess prices; use live rates engine
  if (lower.includes('rate') || lower.includes('price') || lower.includes('cost') || lower.includes('how much') || lower.includes('भाडा')) {
    updateStats(1, 0, 1);
    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: 'Prices come strictly from our live rates tariff engine. Please click Price below to view exact live rates, or message our team on WhatsApp for a custom quotation.',
      timestamp: new Date().toISOString(),
      actions: [ACTION_PRICE, ACTION_WHATSAPP],
    };
  }

  // Rule 6: Contact info inquiry
  if (lower.includes('phone') || lower.includes('contact') || lower.includes('email') || lower.includes('whatsapp') || lower.includes('address') || lower.includes('located') || lower.includes('location') || lower.includes('office') || lower.includes('hetauda')) {
    updateStats(1, 0, 1);
    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: '**The BC Cargo & Courier Contact Information:**\n\n• **Central HQ:** School Road -4, Hetauda, Nepal\n• **Phone:** 057-591816 / 9855019485\n• **WhatsApp:** +977-9855019485\n• **Email:** thebccargo@gmail.com\n• **Hours:** Sunday – Friday, 9:00 AM – 6:00 PM NPT',
      timestamp: new Date().toISOString(),
      actions: [ACTION_WHATSAPP, ACTION_CALL],
    };
  }

  // Step 3: Remote AI Call (Supabase Edge Function 'chat' -> 'bc-cargo-chat' -> Server API /api/chat)
  try {
    const remoteResponse = await callRemoteChatApi(cleanQuery, history, settings, turnstileToken);
    if (remoteResponse) {
      updateStats(1, 0, 0);
      return remoteResponse;
    }
  } catch (e) {
    console.warn('Remote AI chat call failed, falling back:', e);
  }

  // Fallback: Safe polite response
  updateStats(1, 0, 0);
  return {
    id: `bot-${Date.now()}`,
    sender: 'assistant',
    text: 'I help with international cargo shipping, doorstep pickup across Nepal, and rates. For custom quotes, booking, or tracking, please message our team on WhatsApp.',
    timestamp: new Date().toISOString(),
    actions: [ACTION_WHATSAPP, ACTION_PRICE],
  };
}

// ============================================================================
// REMOTE API ADAPTER (Edge Function 'chat' & 'bc-cargo-chat' & POST /api/chat)
// ============================================================================

async function callRemoteChatApi(
  userQuery: string,
  history: ChatMessage[],
  settings: ChatbotSettings,
  turnstileToken?: string
): Promise<ChatMessage | null> {
  const payload = {
    message: userQuery,
    history: history.slice(-6),
    settings,
    turnstileToken: turnstileToken || 'dev_bypass_token',
  };

  // 1. Try Supabase Edge Function 'chat'
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.functions.invoke('chat', { body: payload });
      if (!error && data && data.reply) {
        return {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toISOString(),
          isFallback: data.isFallback,
          actions: data.actions || [ACTION_WHATSAPP, ACTION_PRICE],
        };
      }
    } catch (_err) {
      // Try next endpoint
    }

    // 2. Try Supabase Edge Function 'bc-cargo-chat'
    try {
      const { data, error } = await supabase.functions.invoke('bc-cargo-chat', { body: payload });
      if (!error && data && data.reply) {
        return {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toISOString(),
          isFallback: data.isFallback,
          actions: data.actions || [ACTION_WHATSAPP, ACTION_PRICE],
        };
      }
    } catch (_err) {
      // Try next endpoint
    }
  }

  // 3. Fallback to /api/chat (Server.js proxy)
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.reply) {
        return {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toISOString(),
          isFallback: data.isFallback,
          actions: data.actions || [ACTION_WHATSAPP, ACTION_PRICE],
        };
      }
    }
  } catch (_e) {
    // API endpoint unavailable or client offline
  }

  return null;
}
