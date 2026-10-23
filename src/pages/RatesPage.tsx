import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { RateEstimator } from '../features/estimator/RateEstimator';
import { Seo } from '../components/SEOHead';
import { PAGE_META } from '../data/pageMeta';

export const RatesPage: React.FC = () => {
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // URL query params for preselection
  const destParam = searchParams.get('dest') || searchParams.get('code') || '';
  const weightParam = parseFloat(searchParams.get('weight') || '') || 10;

  return (
    <div className="w-full bg-[var(--bg,#F6F6F4)] text-[var(--text,#121211)] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <Seo
        title={PAGE_META['/rates'].title}
        description={PAGE_META['/rates'].description}
        canonicalUrl="https://thebccargo.com/rates"
      />
      <div className="max-w-7xl mx-auto space-y-4">
        <header className="max-w-6xl mx-auto space-y-1.5">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl tracking-tight text-[#002147]">Shipping price</h1>
          <p className="text-base text-[var(--text-secondary)]">Five quick steps to see what it costs to send from Nepal.</p>
        </header>
        {/* RATE ESTIMATOR */}
        <div className="py-2">
          <RateEstimator
            initialDestination={destParam || undefined}
            initialWeight={weightParam}
            variant="full"
          />
        </div>
      </div>
    </div>
  );
};
