import React, { useState } from 'react';
import { RouteJourney } from './RouteJourney';
import { RouteLocation } from './route-data';
import { Button } from '../../design/primitives/Button';
import { Input } from '../../design/primitives/Input';
import { Search, ArrowRight, ShieldCheck, Clock, BookOpen, Handshake } from 'lucide-react';

interface RouteTableHeroProps {
  onNavigate: (page: string) => void;
  onSearchTrack: (code: string) => void;
}

export const RouteTableHero: React.FC<RouteTableHeroProps> = ({
  onNavigate,
  onSearchTrack,
}) => {
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      onSearchTrack(trackingNumber.trim());
    }
  };

  const handleGetEstimate = (dest?: RouteLocation) => {
    if (dest) {
      onNavigate(`rates?dest=${encodeURIComponent(dest.country)}&code=${encodeURIComponent(dest.code)}`);
    } else {
      onNavigate('rates');
    }
  };

  const handleBookPickup = (dest?: RouteLocation) => {
    if (dest) {
      onNavigate(`book?dest=${encodeURIComponent(dest.country)}`);
    } else {
      onNavigate('book');
    }
  };

  return (
    <section className="relative w-full py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-[var(--surface-subtle,#FAFAF8)] border-b border-[var(--line)]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Headline, CTAs, Compact Tracking */}
        <div className="lg:col-span-5 flex flex-col gap-6 text-left">
          
          {/* Headline: ≤ 8 words, left-aligned, natural wrap, NO whitespace-nowrap */}
          <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[var(--text)] leading-[1.15] headline-3d">
            Send parcels from Nepal to the world
          </h1>

          {/* Operational logistics copy */}
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-xl">
            Fast, safe cargo and courier from Hetauda to 190+ countries. We handle customs and you can track every parcel.
          </p>

          {/* Three actions: Price, Become a partner, How to ship (text link) */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              variant="primary"
              size="lg"
              magnetic
              onClick={() => handleGetEstimate()}
              rightIcon={<ArrowRight className="w-4 h-4 shrink-0" />}
              className="text-xs sm:text-sm"
            >
              Price
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onNavigate('become-a-partner')}
              leftIcon={<Handshake className="w-4 h-4 shrink-0" />}
              className="text-xs sm:text-sm"
            >
              Become a Partner
            </Button>
            <button
              type="button"
              onClick={() => onNavigate('how-to-ship')}
              className="inline-flex items-center gap-2 min-h-[48px] px-2 text-sm font-semibold leading-none text-[var(--oxford-deep)] underline decoration-dashed decoration-[var(--gold)] underline-offset-4 hover:decoration-solid hover:text-[var(--gold-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring,#F2B705)] rounded"
            >
              <BookOpen className="w-4 h-4 text-[var(--gold)] shrink-0" aria-hidden="true" />
              <span>How to ship</span>
            </button>
          </div>

          {/* Secondary Compact Track Field */}
          <div className="pt-2">
            <div className="p-3.5 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-sm)] shadow-hard-xs space-y-2">
              <form onSubmit={handleTrackSubmit} className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    label="Tracking number"
                    hideLabelVisually={true}
                    id="hero-quick-track"
                    type="text"
                    placeholder="Enter tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="text-sm uppercase"
                    leftAdornment={<Search className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
                  />
                </div>
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  className="shrink-0 text-xs px-3 h-12"
                >
                  Track
                </Button>
              </form>
            </div>
          </div>

          {/* Key Guarantee Badges */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[var(--green-mid,#16A34A)]" />
              <span>Safe packing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[var(--gold)]" />
              <span>Same-day drop-off</span>
            </div>
          </div>
        </div>

        {/* Right Column: animated Nepal -> destination journeys (no globe: nothing captures touch scrolling) */}
        <div className="lg:col-span-7 w-full min-w-0 flex flex-col">
          <RouteJourney onGetEstimate={handleGetEstimate} onBookPickup={handleBookPickup} />
        </div>

      </div>
    </section>
  );
};
