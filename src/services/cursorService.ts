import { secureDataStorage } from '../lib/secureStorage';

export interface CursorMessageItem {
  id: string;
  text: string;
  category: 'brand' | 'location' | 'service' | 'trust' | 'cta' | 'international' | 'ad';
  enabled: boolean;
  order?: number;
}

export const DEFAULT_CURSOR_MESSAGES: CursorMessageItem[] = [
  { id: 'cm-1', text: 'The BC Cargo', category: 'brand', enabled: true, order: 1 },
  { id: 'cm-2', text: 'Our Location Hetauda', category: 'location', enabled: true, order: 2 },
  { id: 'cm-3', text: 'Courier your product now', category: 'cta', enabled: true, order: 3 },
  { id: 'cm-4', text: 'Worldwide Freight Forwarding', category: 'service', enabled: true, order: 4 },
  { id: 'cm-5', text: 'Connecting Nepal & the World', category: 'international', enabled: true, order: 5 },
  { id: 'cm-7', text: 'Fast. Safe. Reliable.', category: 'trust', enabled: true, order: 7 },
  { id: 'cm-8', text: 'Send With Confidence', category: 'cta', enabled: true, order: 8 },
  { id: 'cm-10', text: 'International Cargo & Courier', category: 'international', enabled: true, order: 10 },
  { id: 'cm-12', text: 'Daily Global Air & Road Dispatch', category: 'service', enabled: true, order: 12 },
  { id: 'cm-13', text: 'Book Online & Track Live AWB', category: 'ad', enabled: true, order: 13 }
];

const LOCAL_STORAGE_KEY = 'bc_cargo_cursor_messages';

/**
 * Get all cursor messages (Encrypted Local Storage + Supabase fallback)
 */
export function getCursorMessages(): CursorMessageItem[] {
  return secureDataStorage.getItem<CursorMessageItem[]>(LOCAL_STORAGE_KEY, DEFAULT_CURSOR_MESSAGES);
}

/**
 * Save cursor messages
 */
export function saveCursorMessages(messages: CursorMessageItem[]): void {
  secureDataStorage.setItem(LOCAL_STORAGE_KEY, messages);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bc_cursor_messages_changed', { detail: messages }));
  }
}

/**
 * Get a random enabled message (ensuring variety on refresh)
 */
export function getRandomCursorMessage(previousMessageId?: string): CursorMessageItem {
  const allMessages = getCursorMessages();
  const enabledMessages = allMessages.filter(m => m.enabled);
  
  if (enabledMessages.length === 0) {
    return DEFAULT_CURSOR_MESSAGES[0];
  }

  if (enabledMessages.length === 1) {
    return enabledMessages[0];
  }

  const pool = previousMessageId 
    ? enabledMessages.filter(m => m.id !== previousMessageId)
    : enabledMessages;

  const candidatePool = pool.length > 0 ? pool : enabledMessages;
  const randomIndex = Math.floor(Math.random() * candidatePool.length);
  return candidatePool[randomIndex];
}

/**
 * Add a new cursor message
 */
export function addCursorMessage(
  text: string, 
  category: CursorMessageItem['category'] = 'brand'
): CursorMessageItem[] {
  const current = getCursorMessages();
  const newMessage: CursorMessageItem = {
    id: `cm-${Date.now()}`,
    text: text.trim(),
    category,
    enabled: true,
    order: current.length + 1
  };
  const updated = [...current, newMessage];
  saveCursorMessages(updated);
  return updated;
}

/**
 * Update an existing cursor message
 */
export function updateCursorMessage(
  id: string, 
  updates: Partial<CursorMessageItem>
): CursorMessageItem[] {
  const current = getCursorMessages();
  const updated = current.map(msg => msg.id === id ? { ...msg, ...updates } : msg);
  saveCursorMessages(updated);
  return updated;
}

/**
 * Delete a cursor message
 */
export function deleteCursorMessage(id: string): CursorMessageItem[] {
  const current = getCursorMessages();
  const updated = current.filter(msg => msg.id !== id);
  saveCursorMessages(updated);
  return updated;
}
