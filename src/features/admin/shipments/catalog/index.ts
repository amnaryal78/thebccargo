/**
 * Item-name catalog: expands the grouped data into one flat list and finds matches while someone types.
 * Matching is forgiving on purpose (Roman Nepali spellings, doubled letters, one or two wrong letters)
 * because the people typing are not always comfortable in English.
 */
import { CATEGORY_EMOJI, GROUPS, type CatKey } from './data';
import { MORE_GROUPS } from './data2';

export interface CatalogItem {
  name: string;
  /** Normalised full name, used to dedupe. */
  key: string;
  aliases: string[];
  cat: CatKey;
  emoji: string;
  unit: string;
  /** How often staff used this name (from Supabase). */
  uses: number;
  /** True when learned from past bills rather than built in. */
  custom: boolean;
  /** Shown under the name, e.g. why a word was replaced. */
  hint?: string;
  tokens: string[];
}

export const MEAT_NAMES = [
  'Sukuti|dried meat|sukuti meat|sukutti', 'Chicken|kukhura|kukhura ko masu|murgi', 'Dried chicken', 'Mutton|khasi|khasi ko masu|goat meat', 'Dried mutton', 'Buffalo meat|raango|raangako masu|buff|buff meat', 'Dried buffalo meat|buff sukuti', 'Pork|bangur|bangur ko masu|sungur|sungur ko masu', 'Dried pork', 'Smoked pork|sipsipe', 'Beef', 'Yak meat|yak ko masu|chauri ko masu', 'Dried yak meat', 'Fish|machha|machhaa', 'Dried fish|sukeko machha', 'Smoked fish', 'Duck meat', 'Lamb', 'Sausage|sausages|sausage chicken', 'Salami', 'Bacon', 'Meat pickle|masu ko achar', 'Meat masala snack', 'Jerky|meat jerky', 'Chicken momo frozen', 'Buff momo frozen', 'Dried meat mix', 'Meat powder', 'Meat soup cube',
];

const norm = (s: string): string =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

/** Sound-alike form of one word: 'ajwin' and 'ajwain', 'chocolet' and 'chocolate' end up close together. */
const phon = (w: string): string =>
  w
    .replace(/ph/g, 'f').replace(/ck/g, 'k').replace(/ee/g, 'i').replace(/oo/g, 'u').replace(/ai/g, 'a').replace(/aa/g, 'a')
    .replace(/w/g, 'v').replace(/z/g, 'j').replace(/q/g, 'k')
    .replace(/(.)\1+/g, '$1');

const tokensOf = (...parts: string[]): string[] => {
  const set = new Set<string>();
  for (const p of parts) for (const w of norm(p).split(' ')) if (w) set.add(phon(w));
  return [...set];
};

const unitFor = (name: string, groupUnit: string): string => {
  if (/\b(socks|gloves|shoes|sandals|slippers|boots|sneakers|flats|heels|loafers|crocs|earrings|insoles)\b/i.test(name)) return 'pair';
  if (/\bset\b/i.test(name) && groupUnit !== 'btl') return 'set';
  return groupUnit;
};

/** The courier does not allow the word "ghee" on a bill. */
export const declareName = (name: string): string => name.replace(/\b(ghee|ghi|ghyu|ghiu)\b/gi, 'Butter');

function build(): CatalogItem[] {
  const out = new Map<string, CatalogItem>();
  const push = (name: string, aliases: string[], cat: CatKey, unit: string) => {
    const key = norm(name);
    if (!key || out.has(key)) return;
    const hint = aliases.some((a) => /\bghee\b/i.test(a)) && /butter/i.test(name) ? 'Write Butter. Ghee is not allowed on the bill.' : undefined;
    out.set(key, { name, key, aliases, cat, emoji: CATEGORY_EMOJI[cat], unit: unitFor(name, unit), uses: 0, custom: false, hint, tokens: tokensOf(name, ...aliases) });
  };
  for (const g of [...GROUPS, ...MORE_GROUPS]) {
    for (const raw of g.items) {
      const [base, ...aliases] = raw.split('|');
      push(base, aliases, g.cat, g.unit);
      for (const p of g.prefixes ?? []) if (p) push(`${p}${base}`.replace(/\s+/g, ' ').trim(), aliases, g.cat, g.unit);
      for (const s of g.suffixes ?? []) push(`${base}${s}`, aliases, g.cat, g.unit);
      for (const v of g.variants ?? []) push(`${base} (${v})`, aliases, g.cat, g.unit);
    }
  }
  return [...out.values()];
}

let builtin: CatalogItem[] | null = null;
export const builtinItems = (): CatalogItem[] => (builtin ??= build());

let meat: CatalogItem[] | null = null;
export const meatItems = (): CatalogItem[] =>
  (meat ??= MEAT_NAMES.map((raw) => {
    const [name, ...aliases] = raw.split('|');
    return { name, key: norm(name), aliases, cat: 'food' as CatKey, emoji: '🥩', unit: 'pcs', uses: 0, custom: false, tokens: tokensOf(name, ...aliases) };
  }));

/** Names staff typed on earlier bills (from Supabase). They sit in front of the built-in list. */
export function withLearned(base: CatalogItem[], learned: { name: string; unit?: string | null; category?: string | null; uses?: number | null }[]): CatalogItem[] {
  if (!learned.length) return base;
  const seen = new Set<string>();
  const extra: CatalogItem[] = [];
  const boost = new Map<string, number>();
  for (const l of learned) {
    const key = norm(l.name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    boost.set(key, l.uses ?? 1);
    if (!base.some((b) => b.key === key)) {
      extra.push({ name: l.name, key, aliases: [], cat: 'other', emoji: '🕘', unit: l.unit || 'pcs', uses: l.uses ?? 1, custom: true, tokens: tokensOf(l.name) });
    }
  }
  return [...extra, ...base.map((b) => (boost.has(b.key) ? { ...b, uses: boost.get(b.key)! } : b))];
}

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

/** Score one query word against one item word. 0 means no match. */
function wordScore(q: string, t: string): number {
  if (q === t) return 100;
  if (t.startsWith(q)) return 80 - Math.min(10, t.length - q.length);
  if (q.length >= 3 && t.includes(q)) return 50;
  if (q.length >= 3 && Math.abs(q.length - t.length) <= 2) {
    const d = distance(q, t.length > q.length + 1 ? t.slice(0, q.length + 1) : t);
    if (d <= (q.length <= 4 ? 1 : 2)) return 40 - d * 8;
  }
  return 0;
}

export function searchCatalog(query: string, items: CatalogItem[], limit = 8): CatalogItem[] {
  const q = norm(query);
  if (!q) return [];
  const qWords = q.split(' ').map(phon).filter(Boolean);
  const first = phon(q.replace(/\s+/g, ' '));
  const scored: { item: CatalogItem; score: number }[] = [];
  for (const item of items) {
    let total = 0;
    let ok = true;
    for (const w of qWords) {
      let best = 0;
      for (const t of item.tokens) {
        const s = wordScore(w, t);
        if (s > best) best = s;
        if (best === 100) break;
      }
      if (!best) {
        ok = false;
        break;
      }
      total += best;
    }
    if (!ok) continue;
    const nm = phon(norm(item.name));
    if (nm === first) total += 120;
    else if (nm.startsWith(first)) total += 40;
    total += Math.min(item.uses, 20) - item.name.length * 0.1;
    scored.push({ item, score: total });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}
