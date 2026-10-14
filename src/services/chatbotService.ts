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

// ============================================================================
// ADMIN CONFIGURATION STORAGE & UTILITIES
// ============================================================================

export function getChatbotSettings(): ChatbotSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return DEFAULT_CHATBOT_SETTINGS;
}

export function saveChatbotSettings(settings: ChatbotSettings): void {
  settings.updatedAt = new Date().toISOString();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getKnowledgeItems(): KnowledgeItem[] {
  try {
    const saved = localStorage.getItem(KNOWLEDGE_KEY);
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
  localStorage.setItem(KNOWLEDGE_KEY, JSON.stringify(items));
  return items;
}

export function deleteKnowledgeItem(id: string): KnowledgeItem[] {
  const items = getKnowledgeItems().filter(k => k.id !== id);
  localStorage.setItem(KNOWLEDGE_KEY, JSON.stringify(items));
  return items;
}

export function getRules(): ChatbotRule[] {
  try {
    const saved = localStorage.getItem(RULES_KEY);
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
  localStorage.setItem(RULES_KEY, JSON.stringify(rules));
  return rules;
}

export function getTools(): ChatbotTool[] {
  try {
    const saved = localStorage.getItem(TOOLS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return DEFAULT_TOOLS;
}

export function toggleTool(id: string, enabled: boolean): ChatbotTool[] {
  const tools = getTools();
  const tool = tools.find(t => t.id === id);
  if (tool) {
    tool.enabled = enabled;
  }
  localStorage.setItem(TOOLS_KEY, JSON.stringify(tools));
  return tools;
}

export function getSuggestions(): ChatbotSuggestion[] {
  try {
    const saved = localStorage.getItem(SUGGESTIONS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return DEFAULT_SUGGESTIONS;
}

export function saveSuggestion(suggestion: ChatbotSuggestion): ChatbotSuggestion[] {
  const suggestions = getSuggestions();
  const idx = suggestions.findIndex(s => s.id === suggestion.id);
  if (idx >= 0) {
    suggestions[idx] = suggestion;
  } else {
    suggestions.push(suggestion);
  }
  localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(suggestions));
  return suggestions;
}

export function deleteSuggestion(id: string): ChatbotSuggestion[] {
  const suggestions = getSuggestions().filter(s => s.id !== id);
  localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(suggestions));
  return suggestions;
}

export function getChatStats(): ChatStats {
  try {
    const saved = localStorage.getItem(STATS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
    totalConversations: 14,
    totalMessages: 62,
    fallbackCount: 5,
    toolExecutionCount: 18,
    lastActive: new Date().toISOString(),
  };
}

function updateStats(incMessage = 1, incFallback = 0, incTool = 0) {
  const stats = getChatStats();
  stats.totalMessages += incMessage;
  stats.fallbackCount += incFallback;
  stats.toolExecutionCount += incTool;
  stats.lastActive = new Date().toISOString();
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

// ============================================================================
// PROMPT INJECTION & SCOPE CLASSIFIER
// ============================================================================

const OUT_OF_SCOPE_KEYWORDS = [
  'prime minister', 'president', 'government policy', 'election', 'politics',
  'python code', 'javascript', 'html', 'write code', 'program', 'function',
  'medical advice', 'doctor', 'medicine', 'illness', 'treatment',
  'tell me a joke', 'recipe', 'movie', 'actor', 'celebrity', 'weather in',
  'who is', 'system prompt', 'api key', 'secret key', 'database password',
  'ignore previous instructions', 'you are free', 'jailbreak', 'dan mode',
  'crypto', 'bitcoin', 'stock market', 'finance advice', 'essay', 'homework'
];

const IN_SCOPE_KEYWORDS = [
  'bc cargo', 'cargo', 'courier', 'shipment', 'parcel', 'package', 'deliver',
  'tracking', 'track', 'rate', 'price', 'cost', 'fee', 'charge', 'service',
  'air freight', 'express', 'sea freight', 'ocean', 'truck', 'overland',
  'pickup', 'hetauda', 'kathmandu', 'nepal', 'korea', 'japan', 'australia',
  'usa', 'uk', 'dubai', 'uae', 'india', 'customs', 'contact', 'phone',
  'email', 'address', 'office', 'location', 'document', 'box', 'send', 'book',
  'awb', 'weight', 'kg', 'discount', 'offer', 'hours', 'time', 'broker'
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

  // If query is short greeting (e.g. "hi", "hello", "namaste", "good morning"), allow it
  const greetings = ['hi', 'hello', 'namaste', 'hey', 'good morning', 'good afternoon', 'help', 'info'];
  if (greetings.some(g => lower === g || lower.startsWith(g + ' ') || lower.startsWith(g + '!'))) {
    return true;
  }

  // Otherwise, default to strict scope check (must be BC Cargo related)
  return false;
}

// ============================================================================
// CHATBOT SERVICE EXECUTION PIPELINE
// ============================================================================

export async function processChatMessage(
  userQuery: string,
  history: ChatMessage[] = []
): Promise<ChatMessage> {
  const settings = getChatbotSettings();
  const knowledge = getKnowledgeItems().filter(k => k.enabled);
  const tools = getTools().filter(t => t.enabled);

  if (!settings.enabled) {
    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: settings.maintenanceMessage,
      timestamp: new Date().toISOString(),
    };
  }

  const cleanQuery = userQuery.trim();

  // Step 1: Prompt Injection & Scope Guardrail
  if (!isQueryInScope(cleanQuery)) {
    updateStats(1, 1, 0);
    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: settings.fallbackMessage,
      timestamp: new Date().toISOString(),
      isFallback: true,
      actions: [
        { label: 'View Services', type: 'navigate', payload: 'services' },
        { label: 'Contact Support', type: 'contact', payload: 'contact' },
      ],
    };
  }

  // Step 2: Tool Execution Check (Fast Deterministic Response)
  const lower = cleanQuery.toLowerCase();

  // Tracking query tool
  const trackingMatch = cleanQuery.match(/(BC-\d+-[A-Z]+|NP-\d+-[A-Z]+)/i);
  if (trackingMatch || (lower.includes('track') && (lower.includes('bc-') || lower.includes('np-')))) {
    const trackingCode = trackingMatch ? trackingMatch[1].toUpperCase() : 'BC-90214-HKG';
    updateStats(1, 0, 1);
    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: `I can help you track shipment **${trackingCode}**. Please click the button below to view live shipment milestones, carrier details, and real-time status.`,
      timestamp: new Date().toISOString(),
      toolExecuted: 'get_tracking_status',
      actions: [
        { label: `Track ${trackingCode}`, type: 'track', payload: trackingCode },
      ],
    };
  }

  // Contact info tool
  if (lower.includes('phone') || lower.includes('contact') || lower.includes('email') || lower.includes('whatsapp') || lower.includes('address') || lower.includes('located') || lower.includes('location') || lower.includes('office')) {
    updateStats(1, 0, 1);
    const contactItem = knowledge.find(k => k.category === 'contact' || k.category === 'locations');
    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: `**The BC Cargo & Courier Contact Information:**\n\n• **Central HQ:** Kantipath, Hetauda, Nepal\n• **Kathmandu Hub:** TIA Cargo Complex & Gongabu Gateway\n• **Phone:** +977-9855012345, +977-057-520123\n• **Email:** info@thebccargo.com\n• **WhatsApp/Viber:** +977-9855012345\n• **Hours:** Sunday – Friday, 9:00 AM – 6:00 PM NPT`,
      timestamp: new Date().toISOString(),
      toolExecuted: 'get_contact_info',
      actions: [
        { label: 'Call HQ', type: 'call', payload: '+977-9855012345' },
        { label: 'Go to Contact Page', type: 'contact', payload: 'contact' },
      ],
    };
  }

  // Services tool
  if (lower.includes('service') || lower.includes('what do you offer') || lower.includes('what we offer') || lower.includes('delivery option')) {
    updateStats(1, 0, 1);
    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: `**The BC Cargo & Courier Services:**\n\n1. **Priority Air Freight:** Fast 2–5 day worldwide delivery (Korea, Japan, USA, Australia, Europe, UAE).\n2. **Fast Domestic Courier:** 1–2 day door-to-door delivery across major Nepal cities.\n3. **Road Delivery Linehaul:** Heavy cargo trucking for commercial freight.\n4. **Sea Delivery:** 2–4 week ocean freight for large containerized items.\n5. **Doorstep Pickup & Packaging:** Free Kathmandu & Hetauda pickup for orders over 5kg.\n6. **Customs Clearance:** Licensed EXIM brokerage (License #B-409).`,
      timestamp: new Date().toISOString(),
      toolExecuted: 'get_services',
      actions: [
        { label: 'Explore Services', type: 'navigate', payload: 'services' },
        { label: 'Book Package', type: 'book', payload: 'book' },
      ],
    };
  }

  // Rates tool
  if (lower.includes('rate') || lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
    updateStats(1, 0, 1);
    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: `**Current Indicative Shipping Rates:**\n\n• **Domestic Nepal Courier:** Starting at NPR 150/kg.\n• **Express Air (South Korea & Japan):** Starting at $8.50/kg.\n• **Express Air (Australia & USA):** Starting at $9.90/kg.\n\n*Note: Final rate depends on actual vs volumetric weight and destination customs fees.*`,
      timestamp: new Date().toISOString(),
      toolExecuted: 'get_current_rates',
      actions: [
        { label: 'Calculate Rates', type: 'navigate', payload: 'rates' },
        { label: 'Book Now', type: 'book', payload: 'book' },
      ],
    };
  }

  // Step 3: Server API Call / AI Provider Integration
  try {
    const serverResponse = await callServerChatApi(cleanQuery, history, settings, knowledge);
    if (serverResponse) {
      updateStats(1, 0, 0);
      return serverResponse;
    }
  } catch (e) {
    console.warn('AI API Call failed, falling back to knowledge engine:', e);
  }

  // Step 4: Fallback Knowledge Engine (Safe Deterministic Match)
  const matchedKnowledge = knowledge.filter(k => {
    const kContent = (k.title + ' ' + k.content).toLowerCase();
    const words = cleanQuery.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    return words.some(w => kContent.includes(w));
  });

  if (matchedKnowledge.length > 0) {
    const bestMatch = matchedKnowledge[0];
    updateStats(1, 0, 0);
    return {
      id: `bot-${Date.now()}`,
      sender: 'assistant',
      text: `**${bestMatch.title}**\n\n${bestMatch.content}`,
      timestamp: new Date().toISOString(),
      actions: [
        { label: 'Book a Shipment', type: 'book', payload: 'book' },
        { label: 'Contact BC Cargo', type: 'contact', payload: 'contact' },
      ],
    };
  }

  // Default Controlled Fallback
  updateStats(1, 1, 0);
  return {
    id: `bot-${Date.now()}`,
    sender: 'assistant',
    text: settings.fallbackMessage,
    timestamp: new Date().toISOString(),
    isFallback: true,
    actions: [
      { label: 'Our Services', type: 'navigate', payload: 'services' },
      { label: 'Contact Us', type: 'contact', payload: 'contact' },
    ],
  };
}

// ============================================================================
// SERVER API ADAPTER (Server-Side LLM Call via POST /api/chat)
// ============================================================================

async function callServerChatApi(
  userQuery: string,
  history: ChatMessage[],
  settings: ChatbotSettings,
  knowledge: KnowledgeItem[]
): Promise<ChatMessage | null> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userQuery,
        history: history.slice(-6),
        settings,
        knowledge: knowledge.map(k => ({ title: k.title, content: k.content, category: k.category })),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.reply) {
        return {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toISOString(),
          actions: data.actions || [
            { label: 'Book Package', type: 'book', payload: 'book' },
            { label: 'Contact Staff', type: 'contact', payload: 'contact' },
          ],
        };
      }
    }
  } catch (e) {
    // API endpoint unavailable or client offline
  }
  return null;
}
