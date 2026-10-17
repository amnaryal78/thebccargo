import React from 'react';
import { ServiceMode, Shipment } from '../types';
import { Seo } from './Seo';
import { RouteTableHero } from './home/RouteTableHero';
import { HomeServicePicker } from './home/HomeServicePicker';
import { HowItWorksTimeline } from './home/HowItWorksTimeline';
import { LazyMount } from './home/LazyMount';
import { PartnerSlider } from './PartnerSlider';
import { FeedbackSection } from './FeedbackSection';
import { BlogSection } from './BlogSection';
import { FaqSection } from './FaqSection';
import { BcCargoChatbot } from './BcCargoChatbot';
import { Button } from '../design/primitives/Button';
import { PackageCheck, Phone } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onSearchTrack: (trackingCode: string, mode?: ServiceMode) => void;
  activeShipment?: Shipment;
}

const HOME_SCHEMAS = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The BC Cargo & Courier',
    url: 'https://thebccargo.com',
    logo: 'https://thebccargo.com/icon-512.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '057-591816',
      contactType: 'Customer Service & Dispatch',
      areaServed: ['NP', 'IN', 'US', 'GB', 'DE', 'AE', 'AU', 'JP'],
      availableLanguage: ['English', 'Nepali']
    }
  },
  {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'The BC Cargo & Courier - Hetauda Central HQ',
    image: 'https://thebccargo.com/og-banner.png',
    telephone: '057-591816',
    email: 'thebccargo@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'School Road -4',
      addressLocality: 'Hetauda',
      addressRegion: 'Bagmati Province',
      postalCode: '44107',
      addressCountry: 'NP'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 27.4287,
      longitude: 85.0331
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '19:00'
    },
    priceRange: '$$'
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onSearchTrack,
}) => {
  return (
    <div className="w-full flex flex-col bg-[var(--bg,#F6F6F4)] text-[var(--text,#121211)] transition-colors">
      <Seo
        title="BC Cargo & Courier — Freight & Express Courier from Nepal"
        description="Reliable air cargo, overland cross-border freight, ocean shipping, and express courier from Nepal to 220+ destinations. Central operations in Hetauda & TIA."
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

      {/* 2. SERVICES (second and last section shown on first load) */}
      <HomeServicePicker onNavigate={onNavigate} />

      {/* Everything below mounts only when the visitor scrolls near it */}
      <LazyMount minHeight={360}>
        <HowItWorksTimeline />
      </LazyMount>
      <LazyMount minHeight={200}>
        <PartnerSlider />
      </LazyMount>
      <LazyMount minHeight={300}>
        <FeedbackSection />
      </LazyMount>
      <LazyMount minHeight={400}>
        <BlogSection onNavigate={onNavigate} />
      </LazyMount>
      <LazyMount minHeight={400}>
        <FaqSection />
      </LazyMount>
      <BcCargoChatbot onNavigate={onNavigate} onSearchTrack={onSearchTrack} />

      {/* FINAL CTA */}
      <LazyMount minHeight={260}>
      <section className="w-full py-16 sm:py-20 bg-[var(--oxford-deep,#002147)] text-white border-t-2 border-[var(--line-strong)]">
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
