import React from 'react';
import { RouteLocation } from './route-data';
import { BottomSheet } from '../../design/primitives/BottomSheet';
import { Button } from '../../design/primitives/Button';
import { Spotlight } from '../ui/spotlight';
import { COUNTRY_BY_ISO2, flagUrl } from '../../data/countries';
import { X, Clock, Plane } from 'lucide-react';

interface DestinationPanelProps {
  destination: RouteLocation | null;
  onClose: () => void;
  onGetEstimate: (dest: RouteLocation) => void;
  onBookPickup: (dest: RouteLocation) => void;
  isMobileBottomSheet?: boolean;
}

const iso2Of = (dest: RouteLocation): string => {
  const fromCode = dest.id.startsWith('country-') ? dest.id.slice(8) : '';
  if (fromCode) return fromCode;
  const byName = Object.values(COUNTRY_BY_ISO2).find((c) => c.name === dest.country);
  return byName?.iso2 ?? '';
};

export const DestinationPanel: React.FC<DestinationPanelProps> = ({
  destination,
  onClose,
  onGetEstimate,
  onBookPickup,
  isMobileBottomSheet = false,
}) => {
  if (!destination) return null;

  const iso2 = iso2Of(destination);

  const body = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        {iso2 && (
          <img
            src={flagUrl(iso2, 80)}
            alt=""
            width={45}
            height={30}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            className="w-[45px] h-[30px] rounded-[4px] object-cover ring-1 ring-black/10 shadow-sm bg-[#EEF3F9] shrink-0"
          />
        )}
        <div className="min-w-0">
          <p className="text-xs text-[var(--text-muted)]">Shipping from Nepal to</p>
          <h4 className="font-heading font-bold text-lg leading-tight text-[var(--text)] truncate">
            {destination.country}
          </h4>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-[var(--r-sm)] bg-[var(--surface-muted)] border border-[var(--line)] px-3.5 py-3">
        <Clock className="w-5 h-5 shrink-0 text-[var(--gold-dark)]" aria-hidden="true" />
        <div className="leading-tight">
          <p className="text-xs text-[var(--text-muted)]">Delivery time</p>
          <p className="font-heading font-bold text-base text-[var(--text)]">{destination.transitTime}</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <Plane className="w-3.5 h-3.5" aria-hidden="true" />
          By air
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="primary" size="sm" className="w-full" onClick={() => onGetEstimate(destination)}>
          Price
        </Button>
        <Button variant="outline" size="sm" className="w-full" onClick={() => onBookPickup(destination)}>
          Book
        </Button>
      </div>
    </div>
  );

  if (isMobileBottomSheet) {
    return (
      <BottomSheet isOpen onClose={onClose} title={`Shipping to ${destination.country}`}>
        <div className="px-5 py-4">{body}</div>
      </BottomSheet>
    );
  }

  return (
    <Spotlight
      intensity="normal"
      className="relative w-72 p-4 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-[var(--r-md)] shadow-hard-lg"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-2 right-2 z-20 p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      {body}
    </Spotlight>
  );
};
