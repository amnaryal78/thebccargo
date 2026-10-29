export interface ChatAction {
  label: string;
  type: 'navigate' | 'track' | 'book' | 'call' | 'contact' | 'whatsapp';
  payload: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actions?: ChatAction[];
  isError?: boolean;
  /** The user text to resend when this message is an error with a Retry button. */
  retryText?: string;
}

/** Short memory of the last shipping question so "What about Korea?" works. Sent with each request, bounded server-side. */
export interface ChatContext {
  destination?: string;
  weightKg?: number | null;
  lastIntent?: string;
}
