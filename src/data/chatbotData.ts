import { 
  ChatbotSettings, 
  KnowledgeItem, 
  ChatbotRule, 
  ChatbotTool, 
  ChatbotSuggestion 
} from '../types/chatbot';

export const DEFAULT_CHATBOT_SETTINGS: ChatbotSettings = {
  enabled: true,
  name: 'BC Cargo AI',
  welcomeMessage: 'Hi! I’m BC Cargo AI. I can help with shipping rates, home pickup around Hetauda, delivery worldwide, and cargo guidelines.',
  inputPlaceholder: 'Ask about rates, doorstep pickup in Nepal, delivery countries...',
  fallbackMessage: 'I can only help with cargo, shipping, and BC Cargo services. For other inquiries, please message our team on WhatsApp at +977 9855019485 or call 057-591816.',
  maintenanceMessage: 'BC Cargo AI is currently unavailable. Please reach our Hetauda office at 057-591816 / 9855019485 or thebccargo@gmail.com.',
  provider: 'openrouter',
  model: 'google/gemma-4-26b-a4b-it:free',
  maxTokens: 350,
  maxInputLength: 400,
  maxMessagesPerSession: 30,
  languageMode: 'auto',
  updatedAt: new Date().toISOString(),
};

/**
 * Knowledge base stripped of bulky FAQ trees.
 * Keeps only verified company contact details, location, and core cargo rules.
 */
export const DEFAULT_KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'k-contact',
    title: 'Hetauda Central HQ & Contact',
    category: 'contact',
    content: 'The BC Cargo & Courier (Govt License #B-409). Central HQ: School Road -4, Hetauda, Nepal. Phone: 057-591816 / 9855019485. WhatsApp: +977-9855019485. Email: thebccargo@gmail.com. Hours: Sun–Fri 9:00 AM – 6:00 PM NPT.',
    enabled: true,
    priority: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'k-pickup',
    title: 'Nepal Pickup Policy',
    category: 'pickup',
    content: 'Pickup is ONLY available within Nepal. Home pickup is free in Hetauda, Pathlaiya, Jitpur and Simara for parcels over 20 kg (otherwise Rs 200). We also pick up in Birgunj, Chitwan and Kathmandu for Rs 200. From other places, please bring your parcel to our Hetauda office. Consignments are dispatched internationally from Nepal to 190+ countries.',
    enabled: true,
    priority: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'k-meat',
    title: 'Meat Shipping Restrictions',
    category: 'restricted_items',
    content: 'Meat items (including dried/sukuti) are ONLY accepted for Europe, United Kingdom, and Hong Kong. Meat shipments to USA, Australia, Gulf countries, Japan, Canada, and all other destinations are strictly prohibited by customs regulations.',
    enabled: true,
    priority: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'k-rates',
    title: 'Live Rates & Tariffs',
    category: 'rates',
    content: 'Prices come strictly from our live rates tariff engine and Google Sheet data. We never guess or fabricate prices. Check the Rate Estimator for exact tariffs by country and weight.',
    enabled: true,
    priority: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'k-human',
    title: 'Booking & Tracking Assistance',
    category: 'support',
    content: 'Booking shipments and live parcel tracking require human staff confirmation. Please contact our team directly on WhatsApp (+977 9855019485) or phone (057-591816 / 9855019485) for booking and tracking support.',
    enabled: true,
    priority: 1,
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_RULES: ChatbotRule[] = [
  {
    id: 'r-scope',
    name: 'Cargo & BC Cargo Only',
    type: 'blocked_topic',
    content: 'Talk only about cargo, shipping, logistics, and BC Cargo. Reject any non-cargo topic politely.',
    enabled: true,
  },
  {
    id: 'r-words',
    name: 'Short Easy Words',
    type: 'required_phrase',
    content: 'Keep responses short, simple, concise, and easy to understand. Avoid long filler sentences.',
    enabled: true,
  },
  {
    id: 'r-rates',
    name: 'Live Rates Only',
    type: 'disallowed_claim',
    content: 'Prices come only from the live rates function / official tariff engine. Never guess or invent a price.',
    enabled: true,
  },
  {
    id: 'r-meat',
    name: 'Meat Restriction',
    type: 'disallowed_claim',
    content: 'Meat items are strictly accepted ONLY for Europe, UK, and Hong Kong. Prohibited for all other destinations.',
    enabled: true,
  },
  {
    id: 'r-escalation',
    name: 'WhatsApp Escalation',
    type: 'escalation',
    content: 'If you do not know the answer, send the user to WhatsApp (+977 9855019485). Booking and tracking need a human.',
    enabled: true,
  },
  {
    id: 'r-pickup',
    name: 'Nepal Pickup Only',
    type: 'disallowed_claim',
    content: 'Pickup is only within Nepal. Home pickup is free in Hetauda, Pathlaiya, Jitpur and Simara for parcels over 20 kg (otherwise Rs 200). We also pick up in Birgunj, Chitwan and Kathmandu for Rs 200. From other places, please bring your parcel to our Hetauda office. Delivery is worldwide.',
    enabled: true,
  },
  {
    id: 'r-language',
    name: 'Same Language Response',
    type: 'required_phrase',
    content: 'Answer in the same language the user asks (Nepali, English, or others).',
    enabled: true,
  },
];

export const DEFAULT_TOOLS: ChatbotTool[] = [
  {
    id: 't-rates',
    name: 'get_live_rate',
    description: 'Calculates verified tariff from official live rate sheet by country and weight.',
    enabled: true,
    parametersSchema: '{"country": "string", "weightKg": "number"}',
  },
  {
    id: 't-contact',
    name: 'get_contact_info',
    description: 'Returns official Hetauda HQ address, phones, email, and WhatsApp.',
    enabled: true,
    parametersSchema: '{}',
  },
  {
    id: 't-escalate',
    name: 'escalate_whatsapp',
    description: 'Connects customer with human staff on WhatsApp for booking or tracking.',
    enabled: true,
    parametersSchema: '{"topic": "string"}',
  },
];

export const DEFAULT_SUGGESTIONS: ChatbotSuggestion[] = [
  { id: 's-1', text: 'How much to send 5 kg to Korea?', category: 'rates', enabled: true },
  { id: 's-2', text: 'Can you pick up from Pokhara?', category: 'pickup', enabled: true },
  { id: 's-3', text: 'Can I ship meat to UK?', category: 'meat', enabled: true },
  { id: 's-4', text: 'Where is your Hetauda office?', category: 'contact', enabled: true },
  { id: 's-5', text: 'How do I book a shipment?', category: 'booking', enabled: true },
];
