import type { LocalGuide } from '../types';

/**
 * The European guides (and Philippines) share one structure, so each language gives its wording once
 * (with {c} for the country name) and then only the details that differ per country.
 * The country name is always used as written in the language, never inflected: put it after a colon or a dash.
 */
export interface EuStrings {
  meatTitle: string;
  meatNote: string;
  dryTitle: string;
  dryNote: string;
  clothesTitle: string;
  clothesNote: string;
  docsTitle: string;
  docsNote: string;
  craftTitle: string;
  craftNote: string;
  medTitle: string;
  medNote: string;
  freshTitle: string;
  freshNote: string;
  dangerTitle: string;
  dangerNote: string;
  fakeTitle: string;
  fakeNote: string;
  customs: string;
  delivery: string;
  lead: string;
  need1: string;
  need2: string;
  sukuti: string;
  ledeTail: string;
  q1: string;
  a1: string;
  q2: string;
  a2: string;
}

export interface EuCountry {
  name: string;
  city: string;
  /** Used for the card blurb and the receiver tip */
  tip: string;
  heroTitle: string;
  story: string;
  postcode: string;
  phone: string;
}

const f = (s: string, c: string) => s.split('{c}').join(c);

export function euGuide(s: EuStrings, c: EuCountry): LocalGuide {
  const n = c.name;
  return {
    name: n,
    city: c.city,
    blurb: c.tip,
    hero: { title: c.heroTitle, lede: `${c.story} ${s.ledeTail}` },
    intro: [c.story, f(s.sukuti, n)],
    send: [
      { title: s.meatTitle, note: f(s.meatNote, n) },
      { title: s.dryTitle, note: s.dryNote },
      { title: s.clothesTitle, note: s.clothesNote },
      { title: s.docsTitle, note: s.docsNote },
      { title: s.craftTitle, note: s.craftNote },
      { title: s.medTitle, note: s.medNote },
    ],
    avoid: [
      { title: s.freshTitle, note: s.freshNote },
      { title: s.dangerTitle, note: s.dangerNote },
      { title: s.fakeTitle, note: s.fakeNote },
    ],
    receiver: { lead: f(s.lead, n), needs: [s.need1, s.need2, c.postcode, c.phone], tip: c.tip },
    arrival: { customs: s.customs, delivery: f(s.delivery, n) },
    faqs: [
      { q: f(s.q1, n), a: s.a1 },
      { q: f(s.q2, n), a: s.a2 },
    ],
  };
}
