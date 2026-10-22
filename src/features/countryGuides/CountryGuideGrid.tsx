import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe } from 'lucide-react';
import { COUNTRY_GUIDES, REGION_LABEL, type GuideRegion } from '../../data/countryGuides';
import { calculateSheetShipmentQuote } from '../estimator/engine';
import { useGuideRates, npr } from './useGuideRates';
import './country-guide.css';

const REGIONS = (['asia', 'middle-east', 'europe', 'north-america', 'oceania'] as GuideRegion[]).filter((r) =>
  COUNTRY_GUIDES.some((g) => g.region === r)
);

/** Searchable country-guide cards with region filters; the "from" price is today's 1 kg total. */
export const CountryGuideGrid: React.FC<{ query?: string; limit?: number; showFilters?: boolean }> = ({
  query = '',
  limit,
  showFilters = true,
}) => {
  const [region, setRegion] = useState<GuideRegion | 'all'>('all');
  const rates = useGuideRates();

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const found = COUNTRY_GUIDES.filter(
      (g) =>
        (region === 'all' || g.region === region) &&
        (!q ||
          g.name.en.toLowerCase().includes(q) ||
          g.name.ne.includes(q) ||
          g.slug.includes(q) ||
          g.rateCountry.toLowerCase().includes(q) ||
          g.cities.some((c) => c.toLowerCase().includes(q)))
    );
    return limit ? found.slice(0, limit) : found;
  }, [query, region, limit]);

  if (query && list.length === 0) return null;

  return (
    <section id="country-guides" aria-labelledby="country-guides-title" className="scroll-mt-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
        <div>
          <p className="inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-[0.14em] text-[var(--gold-dark)]">
            <Globe className="w-4 h-4" aria-hidden="true" /> COUNTRY SHIPPING GUIDES
          </p>
          <h2 id="country-guides-title" className="mt-1 font-heading font-extrabold text-[26px] sm:text-[34px] leading-tight tracking-tight text-[var(--text)]">
            Where can we ship?
          </h2>
          <p className="mt-1 text-[15px] text-[var(--text-secondary)]">
            Simple guides for sending parcels from Nepal, one country at a time. English and नेपाली.
          </p>
        </div>
        {showFilters && (
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

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {list.map((g) => {
          const q = rates.status === 'ready' ? calculateSheetShipmentQuote({ destination: g.rateCountry, actualWeightKg: 1 }, rates.rates) : null;
          return (
            <li key={g.slug}>
              <Link
                to={`/blogs/${g.slug}`}
                className="cg-card cg-lift group flex flex-col h-full rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--line)] p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
              >
                <span className="flex items-center gap-3">
                  <img
                    src={`https://flagcdn.com/w80/${g.code}.png`}
                    alt=""
                    width={36}
                    height={24}
                    loading="lazy"
                    className="rounded-[3px] border border-[var(--line)] object-cover"
                  />
                  <span className="min-w-0">
                    <span className="block font-heading font-bold text-[16px] leading-tight text-[var(--text)]">Nepal to {g.name.en}</span>
                    <span className="block text-[13px] text-[var(--text-muted)]">{g.name.ne}</span>
                  </span>
                  <ArrowRight className="ml-auto w-4 h-4 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
                <span className="mt-3 text-[14px] leading-snug text-[var(--text-secondary)]">{g.blurb.en}</span>
                <span className="mt-auto pt-3 text-[13px] text-[var(--text-muted)]">
                  {q?.allowed ? (
                    <>From <strong className="text-[var(--text)]">{npr(q.totalNpr)}</strong> for 1 kg</>
                  ) : rates.status === 'loading' ? (
                    <span className="inline-block h-3.5 w-24 rounded bg-[var(--line)] animate-pulse align-middle" />
                  ) : (
                    'Ask us for today’s price'
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
