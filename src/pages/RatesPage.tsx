import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { RateEstimator } from '../features/estimator/RateEstimator';
import { Seo } from '../components/SEOHead';
import { PAGE_META } from '../data/pageMeta';
import { SectionHeading } from '../design/primitives/SectionHeading';

export const RatesPage: React.FC = () => {
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // URL query params for preselection
  const destParam = searchParams.get('dest') || searchParams.get('code') || '';
  const weightParam = parseFloat(searchParams.get('weight') || '') || 10;

  return (
    <div className="w-full bg-[var(--bg)] text-[var(--text)] pt-12 sm:pt-16 pb-16 px-4 sm:px-6 lg:px-8">
      <Seo
        title={PAGE_META['/rates'].title}
        description={PAGE_META['/rates'].description}
        canonicalUrl="https://thebccargo.com/rates"
      />
      <div className="max-w-7xl mx-auto space-y-8">
        <SectionHeading
          as="h1"
          eyebrow="Rates"
          title="What will it cost to send?"
          lead="Choose the country, enter the weight and tell us what is inside. Prices come from our live rate sheet, in Nepali rupees."
          className="max-w-6xl mx-auto"
        />
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
