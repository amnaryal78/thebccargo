/**
 * Intent + parameter extraction. Deterministic first (cheap, testable); the LLM only classifies messages
 * that carry no signal at all (see chatHandler). Extraction never decides a price: it only produces parameters
 * that the browser-side services (the same engine as the Rates page) resolve against live data.
 */
import { assessScope, hasShippingSignal } from './domainGuard.js';

export const INTENTS = [
  'RATE_QUERY', 'SERVICE_QUERY', 'TRACKING_QUERY', 'COMPANY_INFO', 'CONTACT_INFO',
  'SHIPPING_REQUIREMENTS', 'COUNTRY_AVAILABILITY', 'GENERAL_BC_CARGO_QUERY', 'OUT_OF_SCOPE',
];
export const DATA_INTENTS = INTENTS.filter((i) => i !== 'OUT_OF_SCOPE');

const WEIGHT = /(\d+(?:[.,]\d+)?)\s*(?:kgs?\.?|kilos?|kilograms?|k\.g\.?|केजी|किलो(?:ग्राम)?|किग्रा)(?![a-z])/iu;
const TRACK_CODE = /\b(?:BC|NP)-\d+-[A-Z]+\b/i;
const PRICE = /\b(price|prices|pricing|rate|rates|cost|costs|charge|charges|fee|fees|quote|tariff|how much|kati|parcha|parchha|lagcha|lagchha|lagxa|lagne|paisa|rs|npr|rupees?|bhada|dar)\b|कति|लाग्छ|लाग्ने|भाडा|दर\b|मूल्य|रेट|शुल्क|खर्च/iu;
const TRACK = /\b(track|tracking|trace|awb|where is my|status of|parcel kaha|kaha pugyo)\b|ट्र्याक|कहाँ पुग्यो/iu;
const REQUIREMENTS = /\b(documents?|docs?|requirements?|required|allowed|permitted|prohibited|restricted|banned|illegal|packing|pack|packed|customs|passport|kyc|battery|batteries|medicine|medicines|meat|sukuti|liquids?|food|what can i (send|ship)|can i (send|ship)|what (to|do i) need)\b|कागजात|के पठाउन|प्रतिबन्धित|औषधि|मासु/iu;
const AVAILABILITY = /\b(do|does|can|could) (you|bc cargo|u) (ship|send|deliver|courier|reach)\b|\b(ship|send|deliver)(ing)? (\w+ )?(to|in)\b|\bcountries\b|\b(serve|cover|coverage|available (in|to|for))\b/i;
const CONTACT = /\b(contact|phone|call|whatsapp|email|e-mail|address|location|located|where is|office|branch|hours|open|opening|timing|timings|reach)\b|सम्पर्क|ठेगाना|फोन|कार्यालय/iu;
const SERVICE = /\b(services?|offer|offers|provide|do you do|air|overland|door to door|express|pickup|pick up|collect|collection|home pickup)\b|सेवा/iu;
const COMPANY = /\b(about (you|us|bc cargo|the company)|who are you|company|licen[cs]e|registered|owner|founded|established|since|bc cargo)\b/i;
const LIQUID = /\b(liquid|liquids|oil|ghee|juice|sauce|jhol)\b/i;
const MEDICINE = /\b(medicine|medicines|aushadhi|tablet|tablets)\b|औषधि/iu;
const MEAT = /\b(meat|sukuti|masu)\b|मासु/iu;

// Function words, shipping vocabulary and Nepali particles. What is left over is the destination candidate.
const STOP = new Set(`a an the is are was am do does did can could would will you your u i me my we our to for from of in on at by with and or but if so
how what whats which who where when why much many about also please pls kindly tell give show need want like get send sending sent ship shipping shipped deliver delivery
courier cargo parcel parcels package packages price prices pricing rate rates cost costs charge charges fee fees quote tariff kg kgs kilo kilos kilogram kilograms there this that it any some
bc international abroad overseas country countries nepal nepali hetauda per total weight weighing heavy around approx approximately just only now today hello hi hey namaste thanks thank ok okay
yes no rs npr rupees rupee again then too more other another next same instead check know find info information details estimate liquid liquids oil ghee medicine meat sukuti
ko ma lai ra ani ya pathauda pathau pathaune pathaunu kati parcha parchha lagcha lagchha lagxa lagne hunchha huncha ho hola ke k ta chha cha xa bhane bata dinus bhannus chahiyo chaiyo bhada dar paisa kasari kun yo tyo hajur sir dai didi bhai
let lets be have has had will would should might may does doing done go going come into out up down over under`.split(/\s+/));

export const parseWeightKg = (text) => {
  const m = WEIGHT.exec(text);
  const kg = m ? Number(m[1].replace(',', '.')) : NaN;
  return Number.isFinite(kg) ? kg : null;
};

/** Leftover words once weight, tracking codes and function words are removed (max 4 words). */
export function extractDestinationCandidate(text) {
  const words = text
    .toLowerCase()
    .replace(WEIGHT, ' ')
    .replace(TRACK_CODE, ' ')
    .replace(/[^\p{L}\p{N}\s'.-]/gu, ' ')
    .replace(/'s\b/g, '')
    .split(/\s+/)
    .map((w) => w.replace(/^[.'-]+|[.'-]+$/g, ''))
    .filter((w) => w && !/\d/.test(w) && !STOP.has(w) && !/[ऀ-ॿ]/.test(w));
  return words.slice(0, 4).join(' ');
}

const wordCount = (t) => t.trim().split(/\s+/).length;

/**
 * context: { destination?: string, weightKg?: number, lastIntent?: string } from the previous turn.
 * Returns { intent, params, reason? }. intent is null when nothing matched and the message carries no signal.
 */
export function routeMessage(message, context = {}) {
  const scope = assessScope(message);
  if (scope.scope === 'out') return { intent: 'OUT_OF_SCOPE', params: {}, reason: scope.reason };

  const weightKg = parseWeightKg(message);
  const code = TRACK_CODE.exec(message)?.[0]?.toUpperCase();
  const candidate = extractDestinationCandidate(message);
  const inRateContext = context.lastIntent === 'RATE_QUERY';

  const rateParams = () => ({
    destination: candidate || (inRateContext || weightKg !== null ? context.destination || '' : ''),
    weightKg: weightKg ?? (inRateContext ? context.weightKg ?? null : null),
    liquid: LIQUID.test(message),
    medicine: MEDICINE.test(message),
    meat: MEAT.test(message),
  });

  if (code || TRACK.test(message)) return { intent: 'TRACKING_QUERY', params: { trackingCode: code || '' } };
  if (weightKg !== null || PRICE.test(message)) return { intent: 'RATE_QUERY', params: rateParams() };
  if (REQUIREMENTS.test(message)) return { intent: 'SHIPPING_REQUIREMENTS', params: { destination: candidate } };
  if (AVAILABILITY.test(message)) return { intent: 'COUNTRY_AVAILABILITY', params: { destination: candidate } };
  if (CONTACT.test(message)) return { intent: 'CONTACT_INFO', params: {} };
  if (SERVICE.test(message)) return { intent: 'SERVICE_QUERY', params: {} };
  if (COMPANY.test(message)) return { intent: 'COMPANY_INFO', params: {} };
  if (inRateContext && candidate && wordCount(message) <= 6) return { intent: 'RATE_QUERY', params: rateParams() };
  if (hasShippingSignal(message)) return { intent: 'GENERAL_BC_CARGO_QUERY', params: {} };
  return { intent: null, params: {} };
}
