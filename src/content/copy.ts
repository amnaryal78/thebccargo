/**
 * The BC Cargo & Courier — Plain English Copy Tokens & Navigation Labels
 * 
 * Strict word-count and plain-language rules per Phase 10:
 * - Sentence: <= 15 words average, max 22 words
 * - Paragraph: max 45 words on cards, 70 on pages
 * - Page H1: max 8 words
 * - Nav label: max 10 characters
 * - Button / chip / badge: max 3 words, 20 characters
 */

export const NAV_COPY = {
  home: 'Home',
  rates: 'Rates',
  track: 'Track',
  services: 'Services',
  blog: 'Blog',
  about: 'About',
  more: 'More',
  contact: 'Contact',
  careers: 'Careers',
  faq: 'FAQ',
  policies: 'Policies',
  login: 'Login',
  book: 'Book',
  bookPickup: 'Book Pickup',
} as const;

export const PLAIN_TERMS = {
  trackingNumber: 'Tracking number',
  receiver: 'Receiver',
  sender: 'Sender',
  shipment: 'Shipment',
  mainTransport: 'Main transport',
  handling: 'Handling',
  cargoList: 'Cargo list',
  sizeWeight: 'Size-based weight',
  itemCode: 'Item code',
  customsPaperwork: 'Customs paperwork',
  route: 'Route',
} as const;

export const HERO_METRICS = [
  { label: 'Worldwide', detail: 'Air, Road & Sea Routes' },
  { label: '2 Hubs', detail: 'Kathmandu (Air) & Hetauda (HQ)' },
  { label: 'Daily', detail: 'Export Dispatch from Nepal' },
  { label: '#B-409', detail: 'Customs Brokerage License' },
] as const;
