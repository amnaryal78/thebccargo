import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, Boxes, Calculator, Check, ChevronDown, Drumstick, Droplet, FileText, Flame, Gift,
  ListTree, MapPin, MessageCircle, Palette, Pill, Share2, ShieldAlert, Shirt, Soup, Truck,
} from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';
import { Cta3D } from '../../components/ui/Cta3D';
import { Flag } from '../../components/ui/Flag';
import { calculateSheetShipmentQuote } from '../estimator/engine';
import {
  DEFAULT_SECTION_ORDER, relatedGuides,
  type CountryGuide, type GuideSectionId, type Bi, type LocalPack,
} from '../../data/countryGuides';
import type { ItemIcon } from '../../data/countryGuides/types';
import { LOCAL_LANG_OF, loadLocalPack } from '../../data/countryGuides/localLangs';
import { RouteMap } from './RouteMap';
import { GuideEstimator } from './GuideEstimator';
import { useGuideRates, groupPrices, bulkRate, npr } from './useGuideRates';
import { UI_BASE, fill } from './ui';
import { localizeGuide, localizeUi } from './localize';
import { WHATSAPP } from './contact';
import './country-guide.css';

const Globe3D = lazy(() => import('./Globe3D'));

const ICONS: Record<ItemIcon, React.ElementType> = {
  clothes: Shirt, documents: FileText, food: Soup, gift: Gift, medicine: Pill, personal: Flame,
  craft: Palette, samples: Boxes, meat: Drumstick, liquid: Droplet,
};

type PageLang = 'en' | 'ne' | 'local';
const LANG_KEY = 'bc_guide_lang';
const BASE_URL = 'https://thebccargo.com';

function useLang(): [PageLang, (l: PageLang) => void] {
  const [lang, setLang] = useState<PageLang>(() => {
    try {
      const v = sessionStorage.getItem(LANG_KEY);
      return v === 'ne' || v === 'local' ? v : 'en';
    } catch {
      return 'en';
    }
  });
  const set = (l: PageLang) => {
    setLang(l);
    try {
      sessionStorage.setItem(LANG_KEY, l);
    } catch {
      /* private mode: the switch still works for this page */
    }
  };
  return [lang, set];
}

/** Gold bar across the top plus the active section id, without re-rendering on every scroll frame. */
function useReadingProgress(ids: string[]) {
  const bar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        if (bar.current) bar.current.style.transform = `scaleX(${p})`;
        let current = ids[0];
        for (const id of ids) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top < window.innerHeight * 0.3) current = id;
        }
        setActive((a) => (a === current ? a : current));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ids]);
  return { bar, active };
}

const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className, delay = 0 }) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

const SectionHead: React.FC<{ n: number; title: string }> = ({ n, title }) => (
  <header className="mb-5 sm:mb-6">
    <p className="font-mono text-xs font-bold tracking-[0.12em] text-[var(--gold-dark)]">{String(n).padStart(2, '0')}</p>
    <h2 className="mt-1 font-heading font-extrabold text-[26px] sm:text-[32px] leading-tight tracking-tight text-[var(--text)]">{title}</h2>
  </header>
);

export const CountryGuidePage: React.FC<{ guide: CountryGuide }> = ({ guide: base }) => {
  const [pageLang, setPageLang] = useLang();
  const localInfo = LOCAL_LANG_OF[base.slug];
  const lang: PageLang = pageLang === 'local' && !localInfo ? 'en' : pageLang;

  // the local-language pack loads only when someone asks for it
  const [pack, setPack] = useState<LocalPack | null>(null);
  useEffect(() => {
    if (lang !== 'local' || !localInfo || pack) return;
    let alive = true;
    loadLocalPack(localInfo.code)
      .then((p) => alive && setPack(p))
      .catch(() => alive && setPageLang('en'));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, localInfo, pack]);

  const view = useMemo(() => {
    const local = lang === 'local' && pack ? pack.guides[base.slug] : undefined;
    if (local && pack) {
      return { g: localizeGuide(base, local), ui: localizeUi(pack.ui), k: 'en' as const, htmlLang: pack.ui.locale, rtl: !!pack.ui.rtl };
    }
    return { g: base, ui: UI_BASE, k: (lang === 'ne' ? 'ne' : 'en') as 'en' | 'ne', htmlLang: lang === 'ne' ? 'ne' : 'en', rtl: false };
  }, [lang, pack, base]);
  const { g: guide, ui, k, htmlLang, rtl } = view;
  const L = (b: Bi) => b[k];
  const T = ui.T;
  const name = L(guide.name);

  const order = guide.order ?? DEFAULT_SECTION_ORDER;
  const ids = useMemo(() => order.map((s) => `cg-${s}`), [order]);
  const { bar, active } = useReadingProgress(ids);
  const [tocOpen, setTocOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ticked, setTicked] = useState<boolean[]>(() => UI_BASE.checklist.map(() => false));
  const [globeFailed, setGlobeFailed] = useState(false);
  const reduceMotion = !!useReducedMotion();

  const rates = useGuideRates();
  const prices = rates.status === 'ready' ? groupPrices(rates.rates, guide.rateCountry) : null;
  const bulk = rates.status === 'ready' ? bulkRate(rates.rates, guide.rateCountry) : null;
  const quote = (kg: number) =>
    prices ? calculateSheetShipmentQuote({ destination: guide.rateCountry, actualWeightKg: kg }, rates.rates) : null;
  const example = quote(guide.exampleKg);

  // Quick cards: only weights the live sheet actually prices.
  const cards = useMemo(() => {
    if (!prices) return [];
    const want = [1, 2, 5, 10, 20];
    return want
      .filter((kg) => (kg < 10 ? prices.flat.some((f) => f.kg === kg) : kg < 20 ? prices.per10 != null : prices.per20 != null))
      .map((kg) => ({ kg, q: calculateSheetShipmentQuote({ destination: guide.rateCountry, actualWeightKg: kg }, rates.rates) }))
      .filter((c) => c.q.allowed);
  }, [prices, guide.rateCountry, rates.rates]);

  const policy = L(ui.policy);
  const vars = { country: name, policy };
  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hello BC Cargo, I want to send a parcel to ${base.name.en}.`)}`;
  const ratesHref = `/rates?dest=${encodeURIComponent(base.name.en)}&weight=${guide.exampleKg}`;
  const related = relatedGuides(base, 3);
  const allFaqs = [...guide.faqs, ...ui.faqs];
  const dateLocale = lang === 'local' && pack ? pack.ui.locale : lang === 'ne' ? 'ne-NP' : 'en-GB';
  const arrow = 'w-4 h-4 rtl:rotate-180';

  const share = async () => {
    const url = `${BASE_URL}/blogs/${base.slug}`;
    try {
      if (navigator.share) await navigator.share({ title: base.seo.title, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user closed the share sheet */
    }
  };

  // structured data always describes the English page, which is what search engines index
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: base.seo.title.split(' | ')[0],
      description: base.seo.description,
      inLanguage: ['en', 'ne'],
      mainEntityOfPage: `${BASE_URL}/blogs/${base.slug}`,
      author: { '@type': 'Organization', name: 'The BC Cargo & Courier' },
      publisher: { '@type': 'Organization', name: 'The BC Cargo & Courier', logo: { '@type': 'ImageObject', url: `${BASE_URL}/icon-512.png` } },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [...base.faqs, ...UI_BASE.faqs].map((f) => ({
        '@type': 'Question',
        name: f.q.en,
        acceptedAnswer: { '@type': 'Answer', text: fill(f.a.en, { policy: UI_BASE.policy.en }) },
      })),
    },
  ];

  const section = (id: GuideSectionId, n: number): React.ReactNode => {
    const head = <SectionHead n={n} title={L(ui.sections[id])} />;
    switch (id) {
      case 'intro':
        return (
          <>
            {head}
            <div className="space-y-4 text-[17px] leading-[1.75] text-[var(--text-secondary)] max-w-[65ch]">
              {guide.intro.map((p, i) => <p key={i}>{L(p)}</p>)}
            </div>
            <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                [L(T.mainCities), guide.cities.slice(0, 5).join(', ')],
                [L(T.currency), guide.currency],
                [L(T.transit), L(T.transitValue)],
                [L(T.tracking), L(T.trackingValue)],
              ].map(([key, v]) => (
                <div key={key} className="cg-card rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--line)] px-4 py-3">
                  <dt className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{key}</dt>
                  <dd className="mt-1 text-[15px] font-semibold text-[var(--text)]">{v}</dd>
                </div>
              ))}
            </dl>
          </>
        );
      case 'journey': {
        const steps = [
          ...ui.journey.map((s) => ({ title: L(s.title), body: fill(L(s.body), vars) })),
          { title: fill(L(T.customsOf), vars), body: L(guide.arrival.customs) },
          { title: L(T.delivered), body: L(guide.arrival.delivery) },
        ];
        return (
          <>
            {head}
            <ol className="cg-journey relative space-y-3">
              {steps.map((s, i) => (
                <li key={i} className="relative ps-14">
                  {/* the number is not animated, so it never jumps; only the card fades in */}
                  <span className="cg-journey-dot absolute start-0 top-1 grid place-items-center w-10 h-10 rounded-full font-mono font-bold text-sm" aria-hidden="true">
                    {i + 1}
                  </span>
                  <Reveal delay={Math.min(i, 4) * 0.04}>
                    <div className="cg-card rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--line)] px-4 py-3.5">
                      <h3 className="font-heading font-bold text-[17px] text-[var(--text)]">{s.title}</h3>
                      <p className="mt-1 text-[15px] leading-relaxed text-[var(--text-secondary)]">{s.body}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </>
        );
      }
      case 'send':
        return (
          <>
            {head}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guide.send.map((item, i) => {
                const Icon = ICONS[item.icon];
                return (
                  <Reveal key={i} delay={(i % 2) * 0.05} className="h-full">
                    <div className="cg-card cg-lift h-full rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--line)] p-4 flex gap-3.5">
                      <span className="shrink-0 grid place-items-center w-11 h-11 rounded-[var(--r-sm)] bg-[var(--ox-50)] text-[var(--oxford-deep)]">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-heading font-bold text-[16px] text-[var(--text)]">{L(item.title)}</h3>
                        <p className="mt-1 text-[14.5px] leading-relaxed text-[var(--text-secondary)]">{L(item.note)}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </>
        );
      case 'avoid':
        return (
          <>
            {head}
            <div className="cg-avoid rounded-[var(--r-lg,20px)] border p-4 sm:p-6">
              <ul className="space-y-4">
                {guide.avoid.map((item, i) => {
                  const Icon = ICONS[item.icon];
                  return (
                    <li key={i} className="flex gap-3.5">
                      <span className="relative shrink-0 grid place-items-center w-10 h-10 rounded-full bg-[var(--surface)] text-[var(--danger)] border border-[var(--rd-100)]">
                        <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
                        <span className="cg-strike" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-heading font-bold text-[16px] text-[var(--text)]">{L(item.title)}</h3>
                        <p className="mt-0.5 text-[14.5px] leading-relaxed text-[var(--text-secondary)]">{L(item.note)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-5 pt-4 border-t border-[var(--rd-100)] flex items-start gap-2 text-[14px] text-[var(--text)]">
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-[var(--danger)]" aria-hidden="true" />
                {L(T.rulesChange)}
              </p>
            </div>
          </>
        );
      case 'receiver':
        return (
          <>
            {head}
            <p className="text-[17px] leading-relaxed text-[var(--text-secondary)] max-w-[65ch]">{L(guide.receiver.lead)}</p>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-[1fr_1.05fr] gap-4 items-start">
              <ul className="space-y-2.5">
                {guide.receiver.needs.map((r, i) => (
                  <li key={i} className="flex gap-2.5 text-[15.5px] text-[var(--text)]">
                    <Check className="w-5 h-5 shrink-0 text-[var(--green-dark)]" aria-hidden="true" />
                    {L(r)}
                  </li>
                ))}
              </ul>
              <figure className="cg-label rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--line-strong)] overflow-hidden">
                <figcaption className="flex items-center justify-between px-4 py-2 bg-[var(--oxford-deep)] text-white text-xs font-bold uppercase tracking-wider">
                  <span>{L(T.exampleAddress)}</span>
                  <Flag code={guide.code} width={24} className="!border-white/30" />
                </figcaption>
                <address dir="ltr" className="not-italic text-left px-4 py-3.5 font-mono text-[13.5px] leading-[1.7] text-[var(--text)] break-words">
                  {guide.receiver.addressExample.map((line, i) => <div key={i}>{line}</div>)}
                </address>
              </figure>
            </div>
            <p className="mt-4 rounded-[var(--r-sm)] bg-[var(--gd-50)] border border-[var(--gd-200)] px-4 py-3 text-[15px] leading-relaxed text-[var(--text)]">
              {L(guide.receiver.tip)}
            </p>
          </>
        );
      case 'price':
        return (
          <>
            {head}
            {rates.status === 'loading' && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3" aria-label={L(T.priceLoading)}>
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 rounded-[var(--r-md)] bg-[var(--line)] animate-pulse" />)}
              </div>
            )}
            {rates.status !== 'loading' && !prices && (
              <div className="rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] p-5">
                <p className="text-[16px] text-[var(--text)]">{L(T.priceUnavailable)}</p>
                <div className="mt-4"><Cta3D href={wa} newTab icon={<MessageCircle className="w-4 h-4" />}>{L(T.whatsapp)}</Cta3D></div>
              </div>
            )}
            {prices && (
              <>
                {example?.allowed && (
                  <div className="mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                    <div>
                      <p className="font-heading font-bold text-[19px] text-[var(--text)]">{fill(L(T.planning), { kg: guide.exampleKg })}</p>
                      <p className="text-[15px] text-[var(--text-secondary)] max-w-[52ch]">{L(T.planningBody)}</p>
                    </div>
                    <p dir="ltr" className="font-heading font-extrabold text-[34px] leading-none tabular-nums text-[var(--oxford-deep)]">{npr(example.totalNpr)}</p>
                  </div>
                )}
                <ul className="cg-rates grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {cards.map((c, i) => (
                    <li key={c.kg}>
                      <Reveal delay={i * 0.05} className="h-full">
                        <div dir="ltr" className={`cg-card cg-lift h-full rounded-[var(--r-md)] border px-3.5 py-3 text-left ${c.kg === guide.exampleKg ? 'bg-[var(--oxford-deep)] text-white border-transparent' : 'bg-[var(--surface)] border-[var(--line)]'}`}>
                          <p className={`font-mono text-sm font-bold ${c.kg === guide.exampleKg ? 'text-[var(--gold)]' : 'text-[var(--gold-dark)]'}`}>{c.kg} kg</p>
                          <p className="mt-1 font-heading font-extrabold text-[22px] tabular-nums">{npr(c.q.totalNpr)}</p>
                          <p className={`text-xs ${c.kg === guide.exampleKg ? 'text-white/75' : 'text-[var(--text-muted)]'}`}>{L(T.boxIncluded)}</p>
                        </div>
                      </Reveal>
                    </li>
                  ))}
                </ul>
                {(prices.per10 != null || prices.per20 != null) && (
                  <p className="mt-3 text-[14px] text-[var(--text-secondary)]">
                    {L(T.heavier)}:{' '}
                    {prices.per10 != null && <><strong className="text-[var(--text)]">10+ kg {npr(prices.per10)}</strong> {L(T.perKg)}</>}
                    {prices.per10 != null && prices.per20 != null && ' · '}
                    {prices.per20 != null && <><strong className="text-[var(--text)]">20+ kg {npr(prices.per20)}</strong> {L(T.perKg)}</>}
                  </p>
                )}
                {rates.updatedAt && (
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {L(T.updated)}: {new Date(rates.updatedAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
                <div className="mt-6">
                  <GuideEstimator guide={guide} englishName={base.name.en} rates={rates.rates} rateGroup={prices.rateGroup} k={k} ui={ui} />
                </div>
              </>
            )}
          </>
        );
      case 'checklist':
        return (
          <>
            {head}
            <p className="-mt-3 mb-4 text-sm text-[var(--text-muted)]">{L(T.checklistHint)}</p>
            <ul className="grid gap-2">
              {ui.checklist.map((c, i) => (
                <li key={i}>
                  <label className={`flex items-center gap-3 min-h-[52px] px-4 rounded-[var(--r-sm)] border cursor-pointer transition-colors ${ticked[i] ? 'bg-[var(--green-subtle)] border-[var(--green-mid)]' : 'bg-[var(--surface)] border-[var(--line)]'}`}>
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-[var(--green-dark)]"
                      checked={ticked[i] ?? false}
                      onChange={(e) => setTicked((t) => t.map((v, j) => (j === i ? e.target.checked : v)))}
                    />
                    <span className={`text-[15.5px] ${ticked[i] ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text)]'}`}>{L(c)}</span>
                  </label>
                </li>
              ))}
            </ul>
          </>
        );
      case 'track':
        return (
          <>
            {head}
            <div className="cg-card rounded-[var(--r-lg,20px)] bg-[var(--surface)] border border-[var(--line)] p-5 sm:p-6">
              <p className="font-heading font-bold text-[19px] text-[var(--text)]">{L(T.trackTitle)}</p>
              <p className="mt-1 text-[15px] text-[var(--text-secondary)] max-w-[60ch]">{L(T.trackBody)}</p>
              <ol className="cg-stages mt-5 grid grid-cols-3 sm:grid-cols-6 gap-y-4">
                {ui.stages.map((s, i) => (
                  <li key={i} className="relative flex flex-col items-center text-center gap-2">
                    <span className="cg-stage-dot relative z-[1] w-4 h-4 rounded-full" aria-hidden="true" />
                    <span className="text-[13px] font-semibold text-[var(--text)]">{i === 5 ? name : L(s)}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-6">
                <Cta3D to="/track" icon={<Truck className="w-4 h-4" />}>{L(T.track)}</Cta3D>
              </div>
            </div>
          </>
        );
      case 'faq':
        return (
          <>
            {head}
            <div className="cg-card rounded-[var(--r-lg,20px)] bg-[var(--surface)] border border-[var(--line)] divide-y divide-[var(--line)] overflow-hidden">
              {allFaqs.map((f, i) => (
                <details key={i} className="cg-faq group">
                  <summary className="flex items-center justify-between gap-4 min-h-[56px] px-5 py-3 cursor-pointer list-none font-heading font-bold text-[16px] text-[var(--text)] hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--gold)]">
                    {L(f.q)}
                    <ChevronDown className="w-5 h-5 shrink-0 text-[var(--text-muted)] transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
                  </summary>
                  <p className="px-5 pb-4 text-[15.5px] leading-relaxed text-[var(--text-secondary)]">{fill(L(f.a), vars)}</p>
                </details>
              ))}
            </div>
          </>
        );
    }
  };

  const langButtons: { id: PageLang; label: string; code: string }[] = [
    { id: 'en', label: 'English', code: 'en' },
    { id: 'ne', label: 'नेपाली', code: 'ne' },
    ...(localInfo ? [{ id: 'local' as PageLang, label: localInfo.label, code: localInfo.code }] : []),
  ];
  const LangSwitch = (
    <div role="group" aria-label="Language / भाषा" className="inline-flex p-1 rounded-full bg-[var(--surface)] border border-[var(--line)] shadow-[var(--clay-outer-xs)]">
      {langButtons.map((b) => (
        <button
          key={b.id}
          type="button"
          lang={b.code}
          onClick={() => setPageLang(b.id)}
          aria-pressed={lang === b.id}
          className={`min-h-[36px] pointer-coarse:min-h-[44px] px-3.5 sm:px-4 rounded-full text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] ${lang === b.id ? 'bg-[var(--oxford-deep)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text)]'}`}
        >
          {b.label}
        </button>
      ))}
    </div>
  );

  const toc = (
    <nav aria-label={L(T.onThisPage)}>
      <ol className="space-y-0.5">
        {order.map((s, i) => {
          const on = active === `cg-${s}`;
          return (
            <li key={s}>
              <a
                href={`#cg-${s}`}
                onClick={() => setTocOpen(false)}
                aria-current={on ? 'location' : undefined}
                className={`flex items-center gap-2.5 min-h-[40px] px-3 rounded-[var(--r-sm)] text-[14.5px] transition-colors ${on ? 'bg-[var(--surface)] text-[var(--text)] font-bold shadow-[var(--clay-outer-xs)]' : 'text-[var(--text-secondary)] hover:text-[var(--text)]'}`}
              >
                <span className={`font-mono text-[11px] ${on ? 'text-[var(--gold-dark)]' : 'text-[var(--text-muted)]'}`}>{String(i + 1).padStart(2, '0')}</span>
                {L(ui.sections[s])}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );

  const originLabel = L(T.hetaudaWord);
  const destLabel = L(guide.hub.city);
  const routeAria = `${originLabel}, ${L(T.nepalWord)} → ${destLabel}, ${name}`;

  return (
    <article lang={htmlLang} dir={rtl ? 'rtl' : undefined} className="cg-root w-full bg-[var(--bg)] text-[var(--text)]">
      <SEOHead
        title={base.seo.title}
        description={base.seo.description}
        canonicalUrl={`${BASE_URL}/blogs/${base.slug}`}
        ogType="article"
        jsonLd={jsonLd}
      />
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none" aria-hidden="true" dir="ltr">
        <div ref={bar} className="h-full origin-left bg-[var(--gold)]" style={{ transform: 'scaleX(0)' }} />
      </div>

      {/* HERO */}
      <header className="cg-hero relative overflow-hidden border-b border-[var(--line)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 sm:pt-8 sm:pb-14">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav aria-label="Breadcrumb" className="text-sm text-[var(--text-muted)]">
              <Link to="/" className="inline-flex items-center pointer-coarse:min-h-[44px] hover:text-[var(--text)]">{L(T.home)}</Link>
              <span aria-hidden="true"> / </span>
              <Link to="/blogs" className="inline-flex items-center pointer-coarse:min-h-[44px] hover:text-[var(--text)]">{L(T.guidesCrumb)}</Link>
              <span aria-hidden="true"> / </span>
              <span className="text-[var(--text)]">{name}</span>
            </nav>
            {LangSwitch}
          </div>

          <div className="mt-6 sm:mt-10 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-center">
            <div>
              <p className="inline-flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold tracking-wider uppercase text-[var(--gold-dark)]">
                <Flag code="np" width={22} />
                {L(T.nepalWord)}
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden="true" />
                <Flag code={guide.code} width={22} />
                {name}
              </p>
              <h1 className="mt-3 font-heading font-extrabold text-[34px] sm:text-[48px] lg:text-[56px] leading-[1.08] tracking-tight text-[var(--text)] text-balance">
                {L(guide.hero.title)}
              </h1>
              <p className="mt-4 text-[17px] sm:text-[19px] leading-relaxed text-[var(--text-secondary)] max-w-[56ch]">{L(guide.hero.lede)}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Cta3D to={ratesHref} icon={<Calculator className="w-4 h-4" />}>{L(T.calculate)}</Cta3D>
                <Cta3D tone="light" href={wa} newTab icon={<MessageCircle className="w-4 h-4" />}>{L(T.whatsapp)}</Cta3D>
              </div>
            </div>

            <div className="cg-hero-card relative rounded-[var(--r-lg,20px)] bg-[var(--surface)] border border-[var(--line)] p-3 sm:p-4">
              <div className="cg-stage rounded-[var(--r-md)] overflow-hidden text-[var(--oxford-deep)]" dir="ltr">
                {globeFailed ? (
                  <RouteMap guide={guide} originLabel={originLabel} destLabel={destLabel} ariaLabel={routeAria} />
                ) : (
                  <Suspense fallback={<div className="w-full aspect-[5/4] sm:aspect-[16/11] cg-globe-skeleton" aria-hidden="true" />}>
                    <Globe3D
                      guide={guide}
                      originLabel={originLabel}
                      destLabel={destLabel}
                      ariaLabel={routeAria}
                      reducedMotion={reduceMotion}
                      onFail={() => setGlobeFailed(true)}
                    />
                  </Suspense>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-[var(--r-sm)] bg-[var(--surface-subtle)] border border-[var(--line)] px-3.5 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{L(T.from)}</p>
                  {rates.status === 'loading' ? (
                    <div className="mt-1.5 h-7 w-28 rounded bg-[var(--line)] animate-pulse" aria-label={L(T.priceLoading)} />
                  ) : bulk ? (
                    <>
                      <p dir="ltr" className="font-heading font-extrabold text-[24px] tabular-nums text-[var(--oxford-deep)] text-start">{npr(bulk.perKg)}</p>
                      <p className="text-xs text-[var(--text-muted)]">{fill(L(T.perKgBulk), { kg: bulk.minKg })}</p>
                    </>
                  ) : (
                    <p className="mt-1 text-[13px] text-[var(--text)]">{L(T.priceUnavailable)}</p>
                  )}
                </div>
                <div className="rounded-[var(--r-sm)] bg-[var(--surface-subtle)] border border-[var(--line)] px-3.5 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{L(T.dropOff)}</p>
                  <p className="mt-0.5 flex items-start gap-1.5 text-[14px] font-semibold text-[var(--text)]">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[var(--gold-dark)]" aria-hidden="true" />
                    {L(T.officeAddr)}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{L(ui.regions[guide.region])}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)] gap-8 lg:gap-12">
        <aside className="lg:sticky lg:top-24 self-start">
          {/* mobile: collapsible */}
          <div className="lg:hidden rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--line)] shadow-[var(--clay-outer-xs)]">
            <button
              type="button"
              onClick={() => setTocOpen((o) => !o)}
              aria-expanded={tocOpen}
              aria-controls="cg-toc-mobile"
              className="w-full flex items-center justify-between gap-3 min-h-[52px] px-4 font-bold text-[15px] text-[var(--text)]"
            >
              <span className="flex items-center gap-2"><ListTree className="w-4 h-4" aria-hidden="true" />{L(T.onThisPage)}</span>
              <span className="flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)] truncate">
                {L(ui.sections[(active?.replace('cg-', '') || order[0]) as GuideSectionId])}
                <ChevronDown className={`w-4 h-4 transition-transform ${tocOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </span>
            </button>
            {tocOpen && <div id="cg-toc-mobile" className="px-2 pb-2">{toc}</div>}
          </div>
          {/* desktop: sticky */}
          <div className="hidden lg:block">
            <p className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{L(T.onThisPage)}</p>
            {toc}
            <button
              type="button"
              onClick={share}
              className="mt-4 mx-3 inline-flex items-center gap-2 min-h-[44px] text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text)]"
            >
              {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Share2 className="w-4 h-4" aria-hidden="true" />}
              {copied ? L(T.copied) : L(T.share)}
            </button>
          </div>
        </aside>

        <div className="min-w-0 max-w-[820px] space-y-14 sm:space-y-16">
          {order.map((s, i) => (
            <section key={s} id={`cg-${s}`} className="scroll-mt-24">
              {section(s, i + 1)}
            </section>
          ))}

          {/* READY */}
          <section className="cg-ready relative overflow-hidden rounded-[var(--r-lg,20px)] p-6 sm:p-8">
            <h2 className="font-heading font-extrabold text-[26px] sm:text-[32px] leading-tight text-[var(--text)]">{fill(L(T.readyTitle), vars)}</h2>
            <p className="mt-2 text-[16px] leading-relaxed text-[var(--text-secondary)] max-w-[56ch]">{L(T.readyBody)}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Cta3D to={ratesHref} icon={<Calculator className="w-4 h-4" />}>{L(T.calculate)}</Cta3D>
              <Cta3D tone="light" to="/track" icon={<Truck className="w-4 h-4" />}>{L(T.trackParcel)}</Cta3D>
              <Cta3D tone="light" href={wa} newTab icon={<MessageCircle className="w-4 h-4" />}>{L(T.talkWhatsapp)}</Cta3D>
            </div>
            <button type="button" onClick={share} className="lg:hidden mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
              {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Share2 className="w-4 h-4" aria-hidden="true" />}
              {copied ? L(T.copied) : L(T.share)}
            </button>
          </section>

          {/* RELATED */}
          <section aria-labelledby="cg-related">
            <h2 id="cg-related" className="font-heading font-extrabold text-[22px] sm:text-[26px] text-[var(--text)] mb-4">{L(T.related)}</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {related.map((g) => {
                const b = rates.status === 'ready' ? bulkRate(rates.rates, g.rateCountry) : null;
                return (
                  <li key={g.slug}>
                    <Link
                      to={`/blogs/${g.slug}`}
                      className="cg-card cg-lift group flex flex-col h-full rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--line)] p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                    >
                      <span className="flex items-center gap-2.5">
                        <Flag code={g.code} width={32} />
                        <span className="font-heading font-bold text-[16px] text-[var(--text)]">{g.name[k === 'ne' ? 'ne' : 'en']}</span>
                        <ArrowRight className="ms-auto w-4 h-4 text-[var(--text-muted)] transition-transform group-hover:translate-x-1 rtl:rotate-180" aria-hidden="true" />
                      </span>
                      <span className="mt-2 text-[14px] leading-snug text-[var(--text-secondary)]">{g.blurb[k === 'ne' ? 'ne' : 'en']}</span>
                      {b && (
                        <span dir="ltr" className="mt-auto pt-3 text-[13px] text-[var(--text-muted)] text-start">
                          {L(T.from)} <strong className="text-[var(--text)]">{npr(b.perKg)}</strong>{fill(L(T.perKgShort), { kg: b.minKg })}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link to="/blogs#country-guides" className="mt-4 inline-flex items-center gap-1.5 min-h-[44px] text-sm font-bold text-[var(--gold-dark)] hover:underline">
              {L(T.allGuides)} <ArrowRight className={arrow} aria-hidden="true" />
            </Link>
          </section>
        </div>
      </div>
    </article>
  );
};
