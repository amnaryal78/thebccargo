import { ChatAction, ChatContext, ChatMessage } from '../types/chatbot';
import { BUSINESS } from '../data/business';
import { LookupParams, runLookup } from './chatbotTools';

export const ASSISTANT_NAME = 'BC Cargo Assistant';
export const MAX_INPUT_CHARS = 500;
export const WELCOME_MESSAGE = 'Ask me about shipping rates to any country, what you can send, our services, or tracking a parcel.';
export const QUICK_PROMPTS = ['Japan 10 kg price', 'Track my shipment', 'What documents do I need?', 'What countries do you serve?'];

const GENERIC_ERROR = "I'm having trouble responding right now. Please try again in a moment, or contact BC Cargo directly.";

const whatsapp = (): ChatAction => ({ label: 'WhatsApp', type: 'whatsapp', payload: BUSINESS.mobile.replace(/\D/g, '') });
const call = (): ChatAction => ({ label: 'Call', type: 'call', payload: BUSINESS.mobile.replace(/\s/g, '') });

function actionsFor(intent: string, params: LookupParams): ChatAction[] {
  switch (intent) {
    case 'RATE_QUERY':
    case 'COUNTRY_AVAILABILITY':
      return [{ label: 'Rates', type: 'navigate', payload: 'rates' }, whatsapp()];
    case 'TRACKING_QUERY':
      return params.trackingCode
        ? [{ label: 'Track', type: 'track', payload: params.trackingCode }, whatsapp()]
        : [{ label: 'Track', type: 'navigate', payload: 'track' }, whatsapp()];
    case 'SHIPPING_REQUIREMENTS':
      return [{ label: 'How to ship', type: 'navigate', payload: 'how-to-ship' }, whatsapp()];
    case 'SERVICE_QUERY':
      return [{ label: 'Services', type: 'navigate', payload: 'services' }, { label: 'Book', type: 'book', payload: 'book' }];
    default:
      return [whatsapp(), call()];
  }
}

const botMessage = (patch: Partial<ChatMessage> & { text: string }): ChatMessage => ({
  id: `bot-${Date.now()}`,
  sender: 'assistant',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  ...patch,
});

async function post(body: Record<string, unknown>): Promise<Record<string, any>> {
  const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => null);
  if (!data || typeof data.type !== 'string') throw new Error('bad response');
  return data;
}

/**
 * One customer turn: the server gates scope and works out the intent, this browser runs the real BC Cargo
 * service for it, and the server then words the verified result. Never throws; failures become a retryable message.
 */
export async function processChatMessage(
  text: string,
  history: ChatMessage[],
  context: ChatContext = {},
): Promise<{ message: ChatMessage; context: ChatContext }> {
  const message = text.trim();
  const turns = history.filter((m) => !m.isError).slice(-6).map((m) => ({ sender: m.sender, text: m.text }));
  const failure = (reply?: string) => ({ message: botMessage({ text: reply || GENERIC_ERROR, isError: true, retryText: message }), context });

  try {
    const first = await post({ message, history: turns, context });
    if (first.type !== 'lookup') {
      return first.type === 'error' ? failure(first.reply) : { message: botMessage({ text: first.reply }), context };
    }

    const params: LookupParams = first.params && typeof first.params === 'object' ? first.params : {};
    const facts = await runLookup(first.intent, params);
    const second = await post({ message, history: turns, context, intent: first.intent, params, facts });
    if (second.type !== 'reply') return failure(second.reply);

    const next: ChatContext = { ...context, lastIntent: first.intent };
    if (first.intent === 'RATE_QUERY') {
      const dest = (facts.destination ?? params.destination) as string | undefined;
      next.destination = dest || context.destination;
      next.weightKg = (facts.weightKg as number | null | undefined) ?? params.weightKg ?? context.weightKg ?? null;
    }
    return { message: botMessage({ text: second.reply, actions: actionsFor(first.intent, params) }), context: next };
  } catch {
    return failure();
  }
}
