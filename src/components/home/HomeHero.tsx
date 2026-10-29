import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Calculator, Plane } from 'lucide-react';
import { COUNTRY_GUIDES } from '../../data/countryGuides';
import { CountrySearchSelect } from '../ui/CountrySearchSelect';
import { Flag } from '../ui/Flag';
import { Button } from '../../design/primitives/Button';
import { useGuideRates, npr } from '../../features/countryGuides/useGuideRates';
import { calculateSheetShipmentQuote } from '../../features/estimator/engine';
import { useTweenedNumber } from '../../design/useTweenedNumber';

interface HomeHeroProps {
  onNavigate: (page: string) => void;
  onSearchTrack: (code: string) => void;
}

const OPTIONS = COUNTRY_GUIDES.map((g) => ({ value: g.slug, label: g.name.en, hint: g.code }));
const DEFAULT_SLUG = COUNTRY_GUIDES.some((g) => g.slug === 'nepal-to-south-korea') ? 'nepal-to-south-korea' : COUNTRY_GUIDES[0].slug;

/** Hero: what we do, plus the two jobs people come for (price and tracking). All prices come from the live sheet via the estimator engine. */
export const HomeHero: React.FC<HomeHeroProps> = ({ onSearchTrack }) => {
  const [slug, setSlug] = useState(DEFAULT_SLUG);
  // What the user typed stays in the field; the quote uses a clamped number (0.5 to 500 kg).
  const [kgText, setKgText] = useState('5');
  const kg = Math.min(500, Math.max(0.5, Number(kgText) || 0.5));
  const [code, setCode] = useState('');
  const rates = useGuideRates();
  const guide = COUNTRY_GUIDES.find((g) => g.slug === slug) ?? COUNTRY_GUIDES[0];

  const quote = useMemo(
    () =>
      rates.status === 'ready'
        ? calculateSheetShipmentQuote(
            { destination: guide.rateCountry, actualWeightKg: kg, hasLiquid: false, hasMedicine: false, hasMeat: false, meatKg: 0 },
            rates.rates
          )
        : null,
    [rates, guide.rateCountry, kg]
  );

  const shownTotal = useTweenedNumber(quote && quote.allowed ? quote.totalNpr : 0);

  const exactRate = `/rates?dest=${encodeURIComponent(guide.name.en)}&weight=${kg}`;

  return (
    <section aria-labelledby="home-hero-title" className="relative w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-16 sm:pb-24 grid lg:grid-cols-12 gap-x-14 gap-y-8 lg:items-center">
        <div className="lg:col-span-6 lg:col-start-1 lg:row-start-1 lg:self-end flex flex-col">
          <p className="inline-flex self-start items-center gap-2 rounded-full bg-[var(--surface)] shadow-hard-xs px-3 py-1.5 text-[13px] font-medium text-[var(--text-muted)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
            International courier &amp; cargo from Hetauda, Nepal
          </p>
          <h1 id="home-hero-title" className="mt-6 font-heading font-bold text-[length:var(--fs-h1)] leading-[1.02] tracking-[-0.03em] text-[var(--brand)] text-balance">
            Send from Nepal.
            <span className="block text-[var(--text)]">We&rsquo;ll take it worldwide.</span>
          </h1>
          <p className="mt-6 text-[18px] leading-relaxed text-[var(--text-muted)] max-w-[34rem]">
            Parcels, documents and cargo from Hetauda to destinations worldwide. Clear prices from our live rate sheet, careful packing, and a tracking number for every shipment.
          </p>
        </div>

        <div className="lg:col-span-6 lg:col-start-1 lg:row-start-2 lg:self-start flex flex-col">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (code.trim()) onSearchTrack(code.trim());
            }}
            className="max-w-[34rem]"
            role="search"
            aria-label="Track a shipment"
          >
            <label htmlFor="hero-track" className="block text-[14px] font-semibold text-[var(--text)] mb-2">
              Already shipped? Track your parcel
            </label>
            <div className="flex gap-2 p-1.5 rounded-[var(--r-md)] bg-[var(--surface)] shadow-hard-sm focus-within:ring-2 focus-within:ring-[var(--focus-ring)]">
              <div className="flex-1 flex items-center gap-2 pl-3 min-w-0">
                <Search className="w-4 h-4 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
                <input
                  id="hero-track"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Tracking number, e.g. BC…"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="characters"
                  enterKeyHint="search"
                  spellCheck={false}
                  className="w-full min-w-0 h-11 bg-transparent text-[16px] font-mono uppercase placeholder:normal-case placeholder:font-sans text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none"
                />
              </div>
              <Button type="submit" variant="secondary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Track
              </Button>
            </div>
          </form>

          <p className="mt-6 text-[15px] text-[var(--text-muted)]">
            New to shipping abroad?{' '}
            <Link to="/how-to-ship" className="font-semibold text-[var(--brand)] underline decoration-[var(--accent)] decoration-2 underline-offset-4 hover:decoration-[var(--brand)]">
              See how it works
            </Link>
          </p>
        </div>

        {/* Quote card: second on phones, right column on desktop */}
        <div className="lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:row-span-2 row-start-2">
          <div className="relative rounded-[var(--r-lg)] bg-[var(--surface)] shadow-hard-lg">
            <div className="p-5 sm:p-8">
              <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--brand)]">
                <Calculator className="w-4 h-4 text-[var(--accent-text)]" aria-hidden="true" />
                Check your shipping rate
              </div>

              {/* Route: Nepal → destination */}
              <div className="mt-5 flex items-center gap-3 rounded-[var(--r-md)] bg-[var(--surface-2)] px-4 py-3.5">
                <span className="flex items-center gap-2 min-w-0">
                  <Flag code="np" width={24} />
                  <span className="font-semibold text-[var(--text)]">Nepal</span>
                </span>
                <span className="relative flex-1 min-w-8 h-px route-line" aria-hidden="true">
                  <Plane className="route-plane w-4 h-4 text-[var(--brand)]" />
                </span>
                <span className="flex items-center gap-2 min-w-0">
                  <Flag code={guide.code} width={24} />
                  <span className="font-semibold text-[var(--text)] leading-tight text-balance">{guide.name.en}</span>
                </span>
              </div>

              <div className="mt-5 grid sm:grid-cols-[1fr_9rem] gap-4">
                <CountrySearchSelect label="Where are you sending?" options={OPTIONS} value={slug} onChange={setSlug} placeholder="Search a country" />
                <div>
                  <label htmlFor="hero-kg" className="block text-[14px] font-semibold text-[var(--text)] mb-1.5">
                    Weight (kg)
                  </label>
                  <input
                    id="hero-kg"
                    type="number"
                    inputMode="decimal"
                    min={0.5}
                    max={500}
                    step={0.5}
                    value={kgText}
                    onChange={(e) => setKgText(e.target.value)}
                    onBlur={() => setKgText(String(kg))}
                    className="w-full h-12 px-3 rounded-[var(--r-sm)] border border-[var(--line-strong)] bg-[var(--surface)] text-[16px] font-semibold text-[var(--text)] tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--line)] bg-[var(--surface-subtle)] rounded-b-[var(--r-lg)] p-5 sm:p-8" aria-live="polite">
              <p className="text-[14px] text-[var(--text-muted)]">Estimated cost, International courier</p>
              {rates.status === 'loading' && <div className="mt-2 h-11 w-48 rounded-[var(--r-sm)] bg-[var(--surface-2)] animate-pulse" aria-label="Loading today's rates" />}
              {rates.status === 'unavailable' && (
                <p className="mt-2 text-[16px] text-[var(--text)]">Live rates are not available right now. Open the rates page or call us for a price.</p>
              )}
              {quote && !quote.allowed && <p className="mt-2 text-[16px] text-[var(--text)]">{quote.blockedReason || 'We need to quote this one by hand. Ask our team.'}</p>}
              {quote && quote.allowed && (
                <p className="mt-1 flex items-baseline gap-2">
                  <span className="font-heading font-bold text-[40px] leading-none tracking-tight tabular-nums text-[var(--brand)]"><span aria-hidden="true">{npr(shownTotal)}</span><span className="sr-only">{npr(quote.totalNpr)}</span></span>
                  <span className="text-[14px] text-[var(--text-muted)]">
                    {quote.totalWeightKg} kg · {quote.boxCount} {quote.boxCount === 1 ? 'box' : 'boxes'}
                  </span>
                </p>
              )}
              <p className="mt-3 text-[13px] text-[var(--text-muted)]">Includes boxes. Liquids, medicine or food can change the price; the rates page adds them.</p>
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <Link
                  to={exactRate}
                  className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-[var(--r-sm)] bg-[var(--accent)] text-[var(--on-accent)] font-heading font-semibold text-[15px] shadow-hard-xs hover:brightness-95 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  Get exact rate
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  to={`/blogs/${guide.slug}`}
                  className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-[var(--r-sm)] text-[var(--brand)] font-semibold text-[15px] hover:bg-[var(--surface-2)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  {guide.name.en} shipping guide
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
