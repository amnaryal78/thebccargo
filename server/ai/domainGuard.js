/**
 * Deterministic scope gate. Runs before any model sees the message, so a system prompt is never the only defence.
 * assessScope -> 'out' (refuse), 'in' (BC Cargo / shipping signal) or 'unclear' (let the classifier decide).
 */
const INJECTION = [
  /\b(ignore|disregard|forget|override|bypass)\b.{0,40}\b(instructions?|rules?|prompts?|guidelines?|restrictions?|everything)\b/i,
  /\byou are (now|no longer)\b/i,
  /\b(pretend|act|behave)\b.{0,20}\b(as|like|to be)\b/i,
  /\b(system|developer|hidden|initial) (prompt|message|instructions?)\b/i,
  /\b(jailbreak|dan mode|developer mode|god mode)\b/i,
  /\b(reveal|show|print|repeat)\b.{0,30}\b(prompt|instructions?|api key|secret|password)\b/i,
  /\b(general|unrestricted|unfiltered)\b.{0,15}\b(ai|assistant|chatbot|model)\b/i,
];

// Never allowed, even when a shipping word appears ("write python to calculate shipping rates").
const HARD_OUT = [
  /\b(python|javascript|typescript|java script|c\+\+|html|css|sql|react|regex)\b/i,
  /\b(write|generate|create|make|give|compose)\b.{0,40}\b(code|program|script|function|app|website|essay|poem|story|song|lyrics|joke|email to my)\b/i,
  /\b(joke|jokes|riddle|poem|essay|homework|assignment|recipe|lyrics|horoscope|movie|movies|song|songs)\b/i,
  /\b(exchange rate|dollar rate|usd to|convert .{0,20} (to|into) (usd|dollars?|euros?))\b/i,
];

// Off-topic questions that only count as out of scope when there is no shipping signal.
const SOFT_OUT = /\b(capital|president|prime minister|king|queen|currency|population|weather|temperature|forecast|news|score|election|politic\w*|religion|stock|stocks|crypto|bitcoin|translate|calculate|solve|who is|who was|who invented|meaning of|history of|how old|tallest|biggest|famous)\b/i;

const SHIP_SIGNAL = /\b(ship|shipping|shipped|send|sending|courier|cargo|parcel|parcels|package|packages|deliver|delivers|delivery|freight|pickup|pick up|customs|kg|kgs|kilo|kilos|bc cargo|bccargo|track|tracking|awb|price|prices|rate|rates|pathau\w*|parcha|lagcha|lagchha)\b|पठाउ|पार्सल|कार्गो|कुरियर|ट्र्याक/iu;

const BC_MENTION = /\b(bc cargo|bccargo|the bc|your company|you guys)\b/i;

export const hasShippingSignal = (text) => SHIP_SIGNAL.test(text);

export function detectInjection(text) {
  return INJECTION.some((re) => re.test(text));
}

export function assessScope(text) {
  if (detectInjection(text)) return { scope: 'out', reason: 'injection' };
  if (HARD_OUT.some((re) => re.test(text))) return { scope: 'out', reason: 'off_topic' };
  const ship = SHIP_SIGNAL.test(text);
  if (SOFT_OUT.test(text) && !ship && !BC_MENTION.test(text)) return { scope: 'out', reason: 'off_topic' };
  return { scope: ship || BC_MENTION.test(text) ? 'in' : 'unclear', reason: '' };
}

const REFUSALS = {
  en: [
    "I'm the BC Cargo assistant, so I can only help with shipping, rates, tracking and our services. Ask me about any of those and I'll sort it out.",
    "That one's outside what I can help with here. I can check shipping rates, the countries we deliver to, what you can send, or track a parcel.",
    "I stick to BC Cargo topics, like the price to a country, shipping requirements or tracking. Want to try one of those?",
  ],
  ne: [
    'म BC Cargo को सहायक हुँ, त्यसैले ढुवानी, रेट, ट्र्याकिङ र हाम्रा सेवाबारे मात्र सहयोग गर्न सक्छु। ती मध्ये केही सोध्नुहोस्।',
    'यो प्रश्नमा म सहयोग गर्न सक्दिनँ। म कुन देशमा कति लाग्छ, के पठाउन मिल्छ वा पार्सल ट्र्याक गर्न मद्दत गर्न सक्छु।',
    'म BC Cargo सम्बन्धी कुरामा मात्र सीमित छु, जस्तै देश अनुसारको रेट, पठाउने नियम वा ट्र्याकिङ। ती मध्ये केही सोध्न चाहनुहुन्छ?',
  ],
};

const DEVANAGARI = /[ऀ-ॿ]/;
const ROMAN_NEPALI = /\b(ko|ma|lai|kati|parcha|parchha|lagcha|lagchha|lagxa|pathau\w*|chha|cha|xa|hajur|garna|garnu|huncha|hunchha|ho|ke|kasari|chahiyo|bhanda)\b/i;

/** 'ne' (Devanagari), 'ne-roman' (romanised Nepali, often mixed with English) or 'en'. */
export function detectLanguage(text) {
  if (DEVANAGARI.test(text)) return 'ne';
  return ROMAN_NEPALI.test(text) ? 'ne-roman' : 'en';
}

export function refusalMessage(text) {
  const pool = REFUSALS[DEVANAGARI.test(text) ? 'ne' : 'en'];
  return pool[text.length % pool.length];
}

const SAFE_ERROR = {
  en: "I'm having trouble responding right now. Please try again in a moment, or contact BC Cargo directly.",
  ne: 'म अहिले जवाफ दिन सकिरहेको छैन। कृपया केही बेरमा फेरि प्रयास गर्नुहोस्, वा BC Cargo लाई सिधै सम्पर्क गर्नुहोस्।',
};

export const safeErrorMessage = (text = '') => SAFE_ERROR[DEVANAGARI.test(text) ? 'ne' : 'en'];
