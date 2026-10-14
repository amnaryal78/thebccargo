export type AIProviderName = 'openrouter' | 'gemini' | 'deterministic';

export interface ChatbotSettings {
  enabled: boolean;
  name: string;
  welcomeMessage: string;
  inputPlaceholder: string;
  fallbackMessage: string;
  maintenanceMessage: string;
  provider: AIProviderName;
  model: string;
  maxTokens: number;
  maxInputLength: number;
  maxMessagesPerSession: number;
  languageMode: 'english' | 'nepali' | 'auto';
  updatedAt: string;
}

export type KnowledgeCategory = 
  | 'company'
  | 'contact'
  | 'locations'
  | 'services'
  | 'destinations'
  | 'pickup'
  | 'delivery'
  | 'tracking'
  | 'rates'
  | 'offers'
  | 'packaging'
  | 'restricted_items'
  | 'faqs'
  | 'policies'
  | 'support';

export interface KnowledgeItem {
  id: string;
  title: string;
  category: KnowledgeCategory;
  content: string;
  enabled: boolean;
  priority: number; // 1 (highest) to 10
  updatedAt: string;
}

export type RuleType = 
  | 'allowed_topic'
  | 'blocked_topic'
  | 'required_phrase'
  | 'disallowed_claim'
  | 'escalation';

export interface ChatbotRule {
  id: string;
  name: string;
  type: RuleType;
  content: string;
  enabled: boolean;
}

export interface ChatbotTool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  parametersSchema: string;
}

export interface ChatbotSuggestion {
  id: string;
  text: string;
  category: string;
  enabled: boolean;
}

export interface ChatAction {
  label: string;
  type: 'navigate' | 'track' | 'book' | 'call' | 'contact';
  payload: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  toolExecuted?: string;
  actions?: ChatAction[];
  isError?: boolean;
  isFallback?: boolean;
}

export interface ChatStats {
  totalConversations: number;
  totalMessages: number;
  fallbackCount: number;
  toolExecutionCount: number;
  lastActive: string;
}
