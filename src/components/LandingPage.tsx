import React, { lazy, Suspense } from 'react';
import { ServiceMode, Shipment } from '../types';
import { Seo } from './Seo';
import { RouteTableHero } from './home/RouteTableHero';
import { HomeServicePicker } from './home/HomeServicePicker';
import { LazyMount, IdleMount } from './home/LazyMount';
import { Button } from '../design/primitives/Button';
import { PackageCheck, Phone } from 'lucide-react';
import { organizationJsonLd, websiteJsonLd } from '../data/business';
import { PAGE_META } from '../data/pageMeta';

// Below-the-fold sections are code-split; LazyMount only fetches them as they near the viewport.
const HowItWorksTimeline = lazy(() => import('./home/HowItWorksTimeline').then((m) => ({ default: m.HowItWorksTimeline })));
const PartnerSlider = lazy(() => import('./PartnerSlider').then((m) => ({ default: m.PartnerSlider })));
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
    <div className="w-full flex flex-col divide-y divide-[var(--line)] bg-[var(--bg,#F6F6F4)] text-[var(--text,#121211)] transition-colors">
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

      {/* 1. HERO SECTION: Route Table (Adaptive 2D Android / 3D Desktop) */}
      <RouteTableHero
        onNavigate={onNavigate}
        onSearchTrack={onSearchTrack}
      />

      {/* Everything below mounts only when the visitor scrolls near it */}
      <LazyMount minHeight={420}>
        <HomeCountryGuides onNavigate={onNavigate} />
      </LazyMount>
      {/* Reserved height: the assistant now sits mid-page, so its late (idle) mount must not push content down */}
      <div className="min-h-[690px] sm:min-h-[640px]">
        <IdleMount>
          <Suspense fallback={null}>
            <BcCargoChatbot onNavigate={onNavigate} onSearchTrack={onSearchTrack} />
          </Suspense>
        </IdleMount>
      </div>
      <LazyMount minHeight={520}>
        <HowItWorksTimeline />
      </LazyMount>
      <LazyMount minHeight={400}>
        <BlogSection onNavigate={onNavigate} />
      </LazyMount>
      <HomeServicePicker onNavigate={onNavigate} />
      <LazyMount minHeight={200}>
        <PartnerSlider />
      </LazyMount>
      <LazyMount minHeight={400}>
        <FaqSection />
      </LazyMount>
      <LazyMount minHeight={300}>
        <FeedbackSection />
      </LazyMount>

      {/* FINAL CTA */}
      <LazyMount minHeight={260}>
      <section className="w-full py-16 sm:py-20 bg-[var(--oxford-deep,#002147)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-3 max-w-xl text-center md:text-left">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
              Ready to ship? Book a pickup or ask us anything.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Book a pickup online, check your price, or call our team in Hetauda and Kathmandu.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate('book')}
              className="text-xs sm:text-sm font-semibold tracking-wide"
            >
              <PackageCheck className="w-4 h-4 mr-2" />
              Book
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onNavigate('contact')}
              className="text-xs sm:text-sm font-semibold bg-white/10 text-white border-white/30 hover:bg-white/20"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
          </div>
        </div>
      </section>
      </LazyMount>

    </div>
  );
};
