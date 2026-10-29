import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe } from 'lucide-react';
import { COUNTRY_GUIDES, REGION_LABEL, getCountryGuide, type GuideRegion } from '../../data/countryGuides';
import { Flag } from '../../components/ui/Flag';
import { useGuideRates, bulkRate, npr } from './useGuideRates';
import './country-guide.css';

const REGIONS = (['asia', 'middle-east', 'europe', 'north-america', 'oceania'] as GuideRegion[]).filter((r) =>
  COUNTRY_GUIDES.some((g) => g.region === r)
);

/** The routes most senders ask about, shown on the home page. */
const MAIN_SLUGS = [
  'nepal-to-south-korea',
  'nepal-to-japan',
  'nepal-to-united-kingdom',
  'nepal-to-australia',
  'nepal-to-usa',
  'nepal-to-uae',
];

/** Short names for the compact cards. */
const SHORT: Record<string, string> = { 'nepal-to-south-korea': 'Korea', 'nepal-to-united-kingdom': 'UK', 'nepal-to-usa': 'USA', 'nepal-to-uae': 'UAE' };

/** Short price line: today's per-kg rate for big parcels, from the live sheet. */
const PriceLine: React.FC<{ country: string; rates: ReturnType<typeof useGuideRates>; compact?: boolean }> = ({ country, rates, compact }) => {
  const b = rates.status === 'ready' ? bulkRate(rates.rates, country) : null;
  if (b && compact) {
    return (
      <span className="text-[13px] text-[var(--text-muted)] whitespace-nowrap">
        <strong className="text-[var(--text)]">{npr(b.perKg)}</strong>/kg <span className="text-[12px]">for {b.minKg} kg+</span>
      </span>
    );
  }
  if (b) {
    return (
      <span className="text-[13px] text-[var(--text-muted)]">
        From <strong className="text-[var(--text)]">{npr(b.perKg)}</strong>/kg for {b.minKg} kg+
      </span>
    );
  }
  if (rates.status === 'loading') return <span className="inline-block h-3.5 w-28 rounded bg-[var(--line)] animate-pulse align-middle" />;
  return <span className="text-[13px] text-[var(--text-muted)]">Ask us for today&rsquo;s price</span>;
};

/**
 * Country guide cards. `compact` is the home-page version: only the main routes, flag + name + price.
 * The full version (blog page) has search, region filters and a one-line description.
 */
export const CountryGuideGrid: React.FC<{ query?: string; compact?: boolean }> = ({ query = '', compact = false }) => {
  const [region, setRegion] = useState<GuideRegion | 'all'>('all');
  const rates = useGuideRates();

  const list = useMemo(() => {
    if (compact) return MAIN_SLUGS.map((s) => getCountryGuide(s)!).filter(Boolean);
    const q = query.trim().toLowerCase();
    return COUNTRY_GUIDES.filter(
      (g) =>
        (region === 'all' || g.region === region) &&
        (!q ||
          g.name.en.toLowerCase().includes(q) ||
          g.name.ne.includes(q) ||
          g.slug.includes(q) ||
          g.rateCountry.toLowerCase().includes(q) ||
          g.cities.some((c) => c.toLowerCase().includes(q)))
    );
  }, [query, region, compact]);

  if (query && list.length === 0) return null;

  return (
    <section id="country-guides" aria-labelledby="country-guides-title" className="scroll-mt-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.14em] text-[var(--gold-dark)]">
            <Globe className="w-4 h-4" aria-hidden="true" /> COUNTRY SHIPPING GUIDES
          </p>
          <h2 id="country-guides-title" className="mt-1 font-heading font-extrabold text-[26px] sm:text-[34px] leading-tight tracking-tight text-[var(--text)]">
            Where can we ship?
          </h2>
          <p className="mt-1 text-[15px] text-[var(--text-secondary)]">
            {compact ? 'Our main routes. Tap one for prices and rules.' : 'Simple guides for sending parcels from Nepal, one country at a time. English and नेपाली.'}
          </p>
        </div>
        {!compact && (
          <div role="group" aria-label="Filter by region" className="flex flex-wrap gap-2">
            {(['all', ...REGIONS] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRegion(r)}
                aria-pressed={region === r}
                className={`min-h-[40px] px-3.5 rounded-full text-sm font-bold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] ${
                  region === r
                    ? 'bg-[var(--oxford-deep)] text-white border-transparent'
                    : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--line)] hover:text-[var(--text)]'
                }`}
              >
                {r === 'all' ? 'All' : REGION_LABEL[r].en}
              </button>
            ))}
          </div>
        )}
      </div>

      <ul className={compact ? 'grid grid-cols-2 lg:grid-cols-3 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'}>
        {list.map((g) => (
          <li key={g.slug}>
            <Link
              to={`/blogs/${g.slug}`}
              className={`cg-card cg-lift group flex flex-col h-full rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--line)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] ${compact ? 'p-3.5 gap-2' : 'p-4'}`}
            >
              <span className="flex items-center gap-3">
                <Flag code={g.code} width={compact ? 32 : 36} />
                <span className="min-w-0">
                  <span className="block font-heading font-bold text-[16px] leading-tight text-[var(--text)]">
                    {compact ? SHORT[g.slug] ?? g.name.en : `Nepal to ${g.name.en}`}
                  </span>
                  {!compact && <span className="block text-[13px] text-[var(--text-muted)]">{g.name.ne}</span>}
                </span>
                <ArrowRight className="ml-auto w-4 h-4 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
              {!compact && <span className="mt-3 text-[14px] leading-snug text-[var(--text-secondary)]">{g.blurb.en}</span>}
              <span className={compact ? '' : 'mt-auto pt-3'}>
                <PriceLine country={g.rateCountry} rates={rates} compact={compact} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
