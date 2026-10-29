import type { Bi, CountryGuide, LocalGuide, LocalUi } from '../../data/countryGuides';
import { UI_BASE, type UiBundle } from './ui';

/**
 * Local-language mode reuses the page as it is: every Bi gets the local text in BOTH slots, and the
 * page keeps reading `.en`. Anything a pack does not translate keeps its English text.
 */
const same = (s: string | undefined, fallback: Bi): Bi => (s ? { en: s, ne: s } : fallback);

export function localizeUi(ui: LocalUi): UiBundle {
  const T = Object.fromEntries(
    Object.entries(UI_BASE.T).map(([k, v]) => [k, same(ui.T[k], v)])
  ) as UiBundle['T'];
  return {
    T,
    sections: Object.fromEntries(Object.entries(UI_BASE.sections).map(([k, v]) => [k, same(ui.sections[k as keyof typeof ui.sections], v)])) as UiBundle['sections'],
    journey: UI_BASE.journey.map((j, i) => ({ title: same(ui.journey[i]?.title, j.title), body: same(ui.journey[i]?.body, j.body) })),
    checklist: UI_BASE.checklist.map((c, i) => same(ui.checklist[i], c)),
    stages: UI_BASE.stages.map((c, i) => same(ui.stages[i], c)),
    faqs: UI_BASE.faqs.map((f, i) => ({ q: same(ui.faqs[i]?.q, f.q), a: same(ui.faqs[i]?.a, f.a) })),
    regions: Object.fromEntries(Object.entries(UI_BASE.regions).map(([k, v]) => [k, same(ui.regions[k as keyof typeof ui.regions], v)])) as UiBundle['regions'],
    policy: same(ui.T.policy, UI_BASE.policy),
  };
}

export function localizeGuide(g: CountryGuide, l: LocalGuide): CountryGuide {
  const item = (orig: CountryGuide['send'], loc: LocalGuide['send']) =>
    orig.map((o, i) => ({ ...o, title: same(loc[i]?.title, o.title), note: same(loc[i]?.note, o.note) }));
  return {
    ...g,
    name: same(l.name, g.name),
    hub: { ...g.hub, city: same(l.city, g.hub.city) },
    blurb: same(l.blurb, g.blurb),
    hero: { title: same(l.hero.title, g.hero.title), lede: same(l.hero.lede, g.hero.lede) },
    intro: g.intro.map((p, i) => same(l.intro[i], p)),
    send: item(g.send, l.send),
    avoid: item(g.avoid, l.avoid),
    receiver: {
      ...g.receiver,
      lead: same(l.receiver.lead, g.receiver.lead),
      needs: g.receiver.needs.map((n, i) => same(l.receiver.needs[i], n)),
      tip: same(l.receiver.tip, g.receiver.tip),
    },
    arrival: { customs: same(l.arrival.customs, g.arrival.customs), delivery: same(l.arrival.delivery, g.arrival.delivery) },
    faqs: g.faqs.map((f, i) => ({ q: same(l.faqs[i]?.q, f.q), a: same(l.faqs[i]?.a, f.a) })),
  };
}
