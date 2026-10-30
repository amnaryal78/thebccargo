import React, { lazy, Suspense } from 'react';
import { ServiceMode, Shipment } from '../types';
import { Seo } from './Seo';
import { HomeHero } from './home/HomeHero';
import { HomeServicePicker } from './home/HomeServicePicker';
import { LazyMount, IdleMount } from './home/LazyMount';
import { Link } from 'react-router-dom';
import { PackageCheck, Phone, Search, FileCheck2, Package, Globe2 } from 'lucide-react';
import { BUSINESS } from '../data/business';
import { organizationJsonLd, websiteJsonLd } from '../data/business';

// Only claims the site already backs up elsewhere (How it works, tracking, rates).
const BENEFITS = [
  { Icon: Globe2, title: 'Worldwide delivery', text: 'From Hetauda to destinations abroad.' },
  { Icon: FileCheck2, title: 'Customs handled', text: 'We prepare the export papers for you.' },
  { Icon: Package, title: 'Careful packing', text: 'Packed by our team in strong boxes.' },
  { Icon: Search, title: 'Shipment tracking', text: 'Follow it with your BC tracking number.' },
];
import { PAGE_META } from '../data/pageMeta';

// Below-the-fold sections are code-split; LazyMount only fetches them as they near the viewport.
const HowItWorksTimeline = lazy(() => import('./home/HowItWorksTimeline').then((m) => ({ default: m.HowItWorksTimeline })));
const FeedbackSection = lazy(() => import('./FeedbackSection').then((m) => ({ default: m.FeedbackSection })));
const BlogSection = lazy(() => import('./BlogSection').then((m) => ({ default: m.BlogSection })));
const HomeCountryGuides = lazy(() => import('./BlogSection').then((m) => ({ default: m.HomeCountryGuides })));
const FaqSection = lazy(() => import('./FaqSection').then((m) => ({ default: m.FaqSection })));
const BcCargoChatbot = lazy(() => import('./BcCargoChatbot').then((m) => ({ default: m.BcCargoChatbot })));

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onSearchTrack: (trackingCode: string, mode?: ServiceMode) => void;
  activeShipment?: Shipment;
}

const HOME_SCHEMAS = [organizationJsonLd(), websiteJsonLd()];

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onSearchTrack,
}) => {
  return (
    <div className="w-full flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <Seo
        title={PAGE_META['/'].title}
        description={PAGE_META['/'].description}
        canonicalUrl="https://thebccargo.com/"
        jsonLd={HOME_SCHEMAS}
        keywords={[
          'cargo from Nepal',
          'air cargo Hetauda',
          'cargo from Hetauda to Korea',
          'parcel Nepal to UK',
          'cargo Nepal to Malaysia',
          'courier Nepal to USA',
          'Hetauda courier',
          'customs clearance Nepal',
          'freight forwarder Nepal'
        ]}
      />

      <HomeHero onNavigate={onNavigate} onSearchTrack={onSearchTrack} />

      {/* Benefits strip */}
      <section aria-label="Why ship with BC Cargo" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-[var(--r-lg)] bg-[var(--line)] shadow-hard-xs">
          {BENEFITS.map(({ Icon, title, text }) => (
            <li key={title} className="bg-[var(--surface)] p-5 sm:p-6 flex flex-col gap-3">
              <span className="w-10 h-10 rounded-[var(--r-sm)] bg-[var(--gd-50)] text-[var(--accent-text)] grid place-items-center">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <span className="font-heading font-semibold text-[16px] text-[var(--brand)]">{title}</span>
              <span className="text-[14px] leading-relaxed text-[var(--text-muted)]">{text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Everything below mounts only when the visitor scrolls near it */}
      <LazyMount minHeight={420}>
        <HomeCountryGuides onNavigate={onNavigate} />
      </LazyMount>
      <LazyMount minHeight={520}>
        <HowItWorksTimeline />
      </LazyMount>
      <HomeServicePicker onNavigate={onNavigate} />
      {/* Reserved height: the assistant mounts late (idle), so it must not push content down */}
      <div className="min-h-[690px] sm:min-h-[640px]">
        <IdleMount>
          <Suspense fallback={null}>
            <BcCargoChatbot onNavigate={onNavigate} onSearchTrack={onSearchTrack} />
          </Suspense>
        </IdleMount>
      </div>
      <LazyMount minHeight={400}>
        <BlogSection onNavigate={onNavigate} />
      </LazyMount>
      <HomeServicePicker onNavigate={onNavigate} />
      <LazyMount minHeight={400}>
        <FaqSection />
      </LazyMount>
      <LazyMount minHeight={300}>
        <FeedbackSection />
      </LazyMount>

      {/* Final CTA: light card so it does not run into the navy footer */}
      <section aria-labelledby="home-cta-title" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-[var(--section-y)]">
        <div className="rounded-[var(--r-lg)] bg-[var(--surface)] shadow-hard-md p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8 border-l-4 border-[var(--accent)]">
          <div className="max-w-xl">
            <h2 id="home-cta-title" className="font-heading font-bold text-[length:var(--fs-h3)] leading-tight tracking-tight text-[var(--brand)]">
              Ready to send something abroad?
            </h2>
            <p className="mt-3 text-[16px] leading-relaxed text-[var(--text-muted)]">
              Book online, or call our Hetauda office and we will help you pack, price and ship it.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link to="/book" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[var(--r-sm)] bg-[var(--brand)] text-[var(--on-brand)] font-heading font-semibold text-[15px] hover:bg-[var(--ox-700)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]">
              <PackageCheck className="w-4 h-4" aria-hidden="true" />
              Book a shipment
            </Link>
            <a href={`tel:${BUSINESS.phone}`} className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[var(--r-sm)] text-[var(--brand)] font-semibold text-[15px] border border-[var(--line-strong)] hover:bg-[var(--surface-2)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]">
              <Phone className="w-4 h-4" aria-hidden="true" />
              Call {BUSINESS.phoneDisplay}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
