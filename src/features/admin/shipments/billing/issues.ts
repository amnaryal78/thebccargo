/**
 * Field-level problems for the shipment form. Each issue says what is wrong in plain words and,
 * where one click can repair it, carries a `fix` the form applies to a draft copy.
 * Pure functions only, so the same rules are unit-tested and drive the UI.
 */
import { COUNTRIES } from '../../../../data/countries';
import { BOX_LIMIT_KG, autoBoxCount, effectiveBoxCount, generateBillNo, money, type BillDraft, type Party } from './model';

export interface IssueFix {
  label: string;
  apply: (d: BillDraft) => void;
}
export interface Issue {
  /** error blocks saving; warn is advice only. */
  level: 'error' | 'warn';
  message: string;
  fix?: IssueFix;
}
export type Issues = Record<string, Issue>;

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
};

const KNOWN_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];

/** Edit distance, small strings only. */
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

const closeDomain = (domain: string): string | null => {
  if (KNOWN_DOMAINS.includes(domain)) return null;
  return KNOWN_DOMAINS.find((k) => distance(domain, k) <= 2) ?? null;
};

/** A corrected address when the typo is obvious (gmal.com, missing @ before gmail.com), else null. */
export function suggestEmail(raw: string): string | null {
  const e = raw.trim().toLowerCase().replace(/\s+/g, '');
  if (!e) return null;
  const at = e.indexOf('@');
  if (at === -1) {
    const m = /^(.+?)(gmail|yahoo|hotmail|outlook)\.com$/.exec(e);
    return m ? `${m[1]}@${m[2]}.com` : null;
  }
  const [user, domain] = [e.slice(0, at), e.slice(at + 1)];
  const fixed = closeDomain(domain);
  if (user && fixed) return `${user}@${fixed}`;
  if (e !== raw.trim() && /^\S+@\S+\.\S+$/.test(e)) return e;
  return null;
}

const dialOf = (country: string): string => {
  const c = COUNTRIES.find((x) => x.name === country);
  return c ? `+${c.dial}` : '';
};

type Side = 'sender' | 'receiver';

function partyIssues(side: Side, p: Party, out: Issues, required: boolean): void {
  const who = side === 'sender' ? 'Sender' : 'Receiver';
  const set = (field: string, issue: Issue) => {
    out[`${side}-${field}`] = issue;
  };
  const fixParty = (fn: (p: Party) => void) => (d: BillDraft) => fn(d[side]);

  if (required && !p.name.trim()) set('name', { level: 'error', message: `Enter the ${who.toLowerCase()}'s full name, as on their ID.` });
  if (side === 'receiver' && !p.country.trim()) set('country', { level: 'error', message: 'Choose the destination country. Rates and meat rules depend on it.' });
  if (required && side === 'receiver' && !p.address.trim()) set('address', { level: 'error', message: `Enter the ${who.toLowerCase()}'s address: house, street, city and postcode.` });

  const dial = dialOf(p.country);
  const phone = p.phone.trim();
  const digits = phone.replace(/\D/g, '');
  const dialDigits = dial.replace(/\D/g, '');
  const typed = digits.length > dialDigits.length || (digits.length > 0 && !dialDigits);
  if (/[a-z]/i.test(phone)) {
    set('phone', {
      level: 'error',
      message: 'The phone number has letters. Use only digits, +, spaces and dashes.',
      fix: { label: 'Remove letters', apply: fixParty((x) => { x.phone = x.phone.replace(/[a-z]/gi, ''); }) },
    });
  } else if ((required && side === 'receiver') || typed) {
    if (!typed) {
      set('phone', { level: 'error', message: dial ? `Add the phone number after ${dial}.` : 'Enter the phone number with country code.' });
    } else if (digits.length < 7) {
      set('phone', { level: 'error', message: `This number has only ${digits.length} digits. Enter the full number, at least 7 digits.` });
    } else if (digits.length > 15) {
      set('phone', { level: 'error', message: `This number has ${digits.length} digits. International numbers have at most 15.` });
    } else if (dial && !phone.startsWith('+')) {
      set('phone', {
        level: 'warn',
        message: `Start with the country code ${dial} so the number works abroad.`,
        fix: { label: `Add ${dial}`, apply: fixParty((x) => { x.phone = `${dial} ${x.phone.trim().replace(/^0+/, '')}`; }) },
      });
    }
  }

  const email = p.email.trim();
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    const guess = suggestEmail(email);
    set('email', {
      level: 'error',
      message: guess ? `This email looks mistyped. Did you mean ${guess}?` : 'This email is not valid. Use the form name@gmail.com.',
      fix: guess ? { label: `Use ${guess}`, apply: fixParty((x) => { x.email = guess; }) } : undefined,
    });
  } else if (email) {
    const guess = suggestEmail(email);
    if (guess && guess !== email.toLowerCase()) {
      set('email', {
        level: 'warn',
        message: `Did you mean ${guess}?`,
        fix: { label: `Use ${guess}`, apply: fixParty((x) => { x.email = guess; }) },
      });
    }
  }
}

export function collectIssues(d: BillDraft): Issues {
  const out: Issues = {};
  if (!d.billNo.trim()) {
    out['bill-no'] = { level: 'error', message: 'Enter a bill number.', fix: { label: 'Generate one', apply: (x) => { x.billNo = generateBillNo(); } } };
  }
  partyIssues('sender', d.sender, out, true);
  partyIssues('receiver', d.receiver, out, true);

  const total = num(d.totalWeightKg);
  const boxCount = effectiveBoxCount(d);
  if (!(total > 0)) {
    out['total-weight'] = { level: 'error', message: 'Enter the total weight in kg. It must be more than 0.' };
  } else if (total / boxCount > BOX_LIMIT_KG + 1e-9) {
    const need = autoBoxCount(total);
    out['box-count'] = {
      level: 'warn',
      message: `${(total / boxCount).toFixed(2)} kg per box is over the ${BOX_LIMIT_KG} kg limit. Use at least ${need} boxes.`,
      fix: { label: `Use ${need} boxes`, apply: (x) => { x.boxCountMode = 'auto'; } },
    };
  }

  const entered = d.boxes.slice(0, boxCount).filter((b) => b.weightKg !== null && num(b.weightKg) > 0);
  if (entered.length > 0 && total > 0) {
    const sum = money(entered.reduce((s, b) => s + num(b.weightKg), 0));
    if (entered.length === boxCount && Math.abs(sum - total) > 0.01) {
      out['box-weights'] = {
        level: 'warn',
        message: `Box weights add up to ${sum} kg, but the total is ${total} kg.`,
        fix: { label: `Set total to ${sum} kg`, apply: (x) => { x.totalWeightKg = sum; } },
      };
    }
  }
  d.boxes.slice(0, boxCount).forEach((b, i) => {
    if (num(b.weightKg) < 0) out[`box-${i}-weight`] = { level: 'error', message: 'Box weight cannot be negative.', fix: { label: 'Clear it', apply: (x) => { x.boxes[i].weightKg = null; } } };
    if (!b.goods.length && !b.liquids.length && !b.meats.length) {
      out[`box-${i}`] = { level: 'warn', message: `Box ${i + 1} is empty. Add goods, liquid or meat, or use fewer boxes.` };
    }
  });

  const neg = (key: string, label: string, value: number | null, clear: (x: BillDraft) => void) => {
    if (value !== null && num(value) < 0) out[key] = { level: 'error', message: `${label} cannot be negative.`, fix: { label: 'Clear it', apply: clear } };
  };
  neg('r-freight', 'Freight', d.weightChargeOverride, (x) => { x.weightChargeOverride = null; });
  neg('r-liquid', 'Liquid charge', d.liquidChargeOverride, (x) => { x.liquidChargeOverride = null; });
  neg('r-meat', 'Meat charge', d.meatChargeOverride, (x) => { x.meatChargeOverride = null; });
  neg('r-box', 'Box charge', d.boxChargeOverride, (x) => { x.boxChargeOverride = null; });
  if (num(d.liquidRate) < 0) out['rate-liquid'] = { level: 'error', message: 'The liquid rate cannot be negative.', fix: { label: 'Reset to 600', apply: (x) => { x.liquidRate = 600; } } };
  if (num(d.boxRate) < 0) out['rate-box'] = { level: 'error', message: 'The box rate cannot be negative.', fix: { label: 'Reset to 1,100', apply: (x) => { x.boxRate = 1100; } } };
  if (d.meatRateOverride !== null && num(d.meatRateOverride) < 0) out['rate-meat'] = { level: 'error', message: 'The meat rate cannot be negative.', fix: { label: 'Use automatic', apply: (x) => { x.meatRateOverride = null; } } };

  d.extras.forEach((e, i) => {
    if (!e.name.trim() && num(e.amount) !== 0) out[`extra-${i}`] = { level: 'error', message: 'Name this charge so it prints on the bill.' };
    else if (e.name.trim() && !(num(e.amount) !== 0)) out[`extra-${i}`] = { level: 'error', message: `Enter an amount for "${e.name.trim()}", or remove it.` };
  });
  return out;
}

/** Item counts for one box, used by the badges. */
export const boxItemCount = (b: { goods: unknown[]; liquids: unknown[]; meats: unknown[] }): number => b.goods.length + b.liquids.length + b.meats.length;
