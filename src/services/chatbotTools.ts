/**
 * Data retrieval for the assistant. Each lookup calls the same service the rest of the site uses
 * (rates sheet + estimator engine, tracking RPC, how-to-ship content, services catalog, BUSINESS facts)
 * and returns plain facts. The model only phrases these facts; it never produces a price.
 */
import { fetchSheetRates, SheetRateItem } from './ratesService';
import { fetchPublicTracking } from './trackingService';
import { fetchPublishedHowToShip } from './howToShipService';
import { SERVICES_CATALOG } from './servicesData';
import { BUSINESS, organizationJsonLd } from '../data/business';
import { PICKUP_POLICY_EN } from '../features/estimator/pickup';
import {
  COUNTRY_NAME_ALIASES,
  calculateSheetShipmentQuote,
  findRateGroupForCountry,
  getMeatRatePerKg,
  isMeatAllowedForCountry,
} from '../features/estimator/engine';

export type Facts = Record<string, unknown>;

export interface LookupParams {
  destination?: string;
  weightKg?: number | null;
  liquid?: boolean;
  medicine?: boolean;
  meat?: boolean;
  trackingCode?: string;
}

const MAX_WEIGHT_KG = 5000;
const norm = (s: string) => s.trim().toLowerCase();

/**
 * Finds the rate group for free text such as "south korea" or "Japan please". The engine's matcher also accepts
 * substring hits (e.g. "ukraine" contains "uk"), so a match only counts when the text is a whole name, an alias,
 * or inside a listed name. Otherwise we say "not listed" instead of quoting another country's rate.
 */
export function resolveDestination(text: string, rates: SheetRateItem[]): { rateGroup: string; displayName: string } | null {
  const words = norm(text).split(/\s+/).filter(Boolean);
  const candidates = new Set<string>([words.join(' ')]);
  for (let n = 3; n >= 1; n--) for (let i = 0; i + n <= words.length; i++) candidates.add(words.slice(i, i + n).join(' '));

  for (const c of candidates) {
    if (c.length < 2) continue;
    const match = findRateGroupForCountry(c, rates);
    if (!match) continue;
    const names = rates
      .filter((r) => r.rate_group === match.rateGroup)
      .flatMap((r) => [r.rate_group, r.display_name, ...(r.supported_countries || [])].map(norm));
    const aliases = Object.values(COUNTRY_NAME_ALIASES).find((list) => list.includes(c)) || [];
    if (names.some((n) => n === c || n.includes(c)) || aliases.length > 0) return match;
  }
  return null;
}

async function loadRates() {
  const { rates } = await fetchSheetRates();
  return rates.filter((r) => r.active);
}

async function rateFacts(p: LookupParams): Promise<Facts> {
  const rates = await loadRates();
  if (!rates.length) return { kind: 'quote', status: 'rates_unavailable' };

  const requested = (p.destination || '').trim();
  const weight = typeof p.weightKg === 'number' ? p.weightKg : null;
  if (!requested) return { kind: 'quote', status: 'needs_destination', weightKg: weight };

  const match = resolveDestination(requested, rates);
  if (!match) return { kind: 'quote', status: 'unsupported_destination', requested };
  if (weight === null) return { kind: 'quote', status: 'needs_weight', destination: match.displayName };
  if (!(weight > 0) || weight > MAX_WEIGHT_KG) {
    return { kind: 'quote', status: 'needs_staff_quote', destination: match.displayName, reason: 'This weight needs a manual quote from BC Cargo staff.' };
  }

  const q = calculateSheetShipmentQuote(
    { destination: match.displayName, actualWeightKg: weight, hasLiquid: p.liquid === true, hasMedicine: p.medicine === true },
    rates,
  );
  if (!q.allowed) return { kind: 'quote', status: 'unsupported_destination', requested };

  const facts: Facts = {
    kind: 'quote',
    status: 'quote',
    destination: q.destinationName,
    weightKg: q.totalWeightKg,
    boxes: q.boxCount,
    shippingNpr: q.baseShippingCharge,
    boxChargeNpr: q.boxCharge,
    totalNpr: q.totalNpr,
    notes: ['Excludes the home pickup fee. The final price is confirmed by BC Cargo staff.'],
  };
  if (q.liquidCharge) facts.liquidChargeNpr = q.liquidCharge;
  if (q.medicineCharge) facts.medicineChargeNpr = q.medicineCharge;
  if (p.meat) {
    const allowed = [q.rateGroup, q.destinationName].some(isMeatAllowedForCountry);
    const perKg = getMeatRatePerKg(q.rateGroup) || getMeatRatePerKg(q.destinationName);
    facts.meat = allowed ? { allowed: true, extraChargePerKgNpr: perKg, note: 'Meat is charged extra per kg of meat and is not included in the total above.' } : { allowed: false };
  }
  return facts;
}

async function availabilityFacts(p: LookupParams): Promise<Facts> {
  const rates = await loadRates();
  if (!rates.length) return { kind: 'availability', status: 'rates_unavailable' };
  const requested = (p.destination || '').trim();
  if (requested) {
    const match = resolveDestination(requested, rates);
    return match ? { kind: 'availability', status: 'served', destination: match.displayName } : { kind: 'availability', status: 'not_in_rate_list', requested };
  }
  const names = [...new Set(rates.map((r) => r.display_name))].sort();
  return { kind: 'availability', status: 'list', total: names.length, destinations: names.slice(0, 80) };
}

async function trackingFacts(p: LookupParams): Promise<Facts> {
  const code = (p.trackingCode || '').trim();
  if (!code) return { kind: 'tracking', status: 'needs_tracking_code' };
  const { data } = await fetchPublicTracking(code);
  if (!data) return { kind: 'tracking', status: 'not_found', trackingCode: code.toUpperCase() };
  return {
    kind: 'tracking',
    status: 'found',
    trackingCode: data.trackingNumber,
    shipmentStatus: data.status,
    origin: data.origin,
    destination: data.destination,
    lastUpdated: data.telemetry?.lastUpdated,
    recentMilestones: (data.milestones || [])
      .filter((m) => m.status === 'completed')
      .slice(-3)
      .map((m) => ({ title: m.title, location: m.location, time: m.timestamp })),
  };
}

const contactFacts = (): Facts => ({
  phone: BUSINESS.phone,
  mobileAndWhatsApp: BUSINESS.mobile,
  email: BUSINESS.email,
  address: `${BUSINESS.street}, ${BUSINESS.city}, Nepal`,
  openDays: `${BUSINESS.hours.days[0]} to ${BUSINESS.hours.days[BUSINESS.hours.days.length - 1]}`,
  openHours: `${BUSINESS.hours.opens} to ${BUSINESS.hours.closes} Nepal time`,
  languages: BUSINESS.languages,
});

const companyFacts = (): Facts => ({
  name: BUSINESS.name,
  legalName: BUSINESS.legalName,
  about: organizationJsonLd().description,
  headOffice: `${BUSINESS.street}, ${BUSINESS.city}, Nepal`,
  scope: 'International shipping from Nepal only.',
});

async function requirementsFacts(): Promise<Facts> {
  const d = await fetchPublishedHowToShip();
  return {
    kind: 'requirements',
    intro: d.intro_en,
    sections: d.sections.map((s) => ({ title: s.title_en, items: s.items.map((i) => (i.highlight_en ? `${i.highlight_en}: ${i.en}` : i.en)) })),
    warnings: (d.warnings || []).filter((w) => !/[ऀ-ॿ]/.test(w)),
    contactAdvice: d.contact_text_en,
  };
}

const servicesFacts = (): Facts => ({
  kind: 'services',
  services: SERVICES_CATALOG.map((s) => ({ title: s.title, summary: s.tagline, bestFor: s.bestFor })),
  nepalPickup: PICKUP_POLICY_EN,
  scope: 'International shipping from Nepal only.',
});

export async function runLookup(intent: string, params: LookupParams): Promise<Facts> {
  switch (intent) {
    case 'RATE_QUERY':
      return rateFacts(params);
    case 'COUNTRY_AVAILABILITY':
      return availabilityFacts(params);
    case 'TRACKING_QUERY':
      return trackingFacts(params);
    case 'SHIPPING_REQUIREMENTS':
      return requirementsFacts();
    case 'SERVICE_QUERY':
      return servicesFacts();
    case 'CONTACT_INFO':
      return { kind: 'contact', ...contactFacts() };
    case 'COMPANY_INFO':
      return { kind: 'company', ...companyFacts(), contact: contactFacts() };
    default:
      return { kind: 'general', company: companyFacts(), contact: contactFacts(), services: servicesFacts().services };
  }
}
