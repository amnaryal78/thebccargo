import React, { useState, useEffect } from 'react';
import { RouteLocation, DESTINATIONS } from './route-data';
import { DestinationPanel } from './DestinationPanel';
import { TacticalGlobe3D } from './TacticalGlobe3D';
import { List, Compass } from 'lucide-react';
import { flagUrl } from '../../data/countries';
import { DEST_BY_ISO2, SHOWN_COUNTRIES, destinationForCountry } from './country-destination';

interface RouteTable3DProps {
  onSelectDestination?: (dest: RouteLocation) => void;
  onGetEstimate: (dest: RouteLocation) => void;
  onBookPickup: (dest: RouteLocation) => void;
  className?: string;
}

export const RouteTable3D: React.FC<RouteTable3DProps> = ({
  onSelectDestination,
  onGetEstimate,
  onBookPickup,
  className = '',
}) => {
  const [selectedDest, setSelectedDest] = useState<RouteLocation | null>(null);
  const [viewMode, setViewMode] = useState<'globe' | 'list'>('globe');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelectDestination = (dest: RouteLocation) => {
    setSelectedDest(dest);
    if (onSelectDestination) {
      onSelectDestination(dest);
    }
  };

  return (
    <div className={`w-full flex flex-col gap-3 font-sans ${className}`}>
      {/* Top Controls: List/Globe Mode Switch */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-heading font-bold text-[var(--gold-dark)]">
            Where do you want to ship?
          </span>
          <span className="hidden sm:inline text-[11px] text-[var(--text-muted)] font-mono">
            Tap a flag. Drag to turn the globe.
          </span>
        </div>

        <button
          onClick={() => setViewMode(viewMode === 'globe' ? 'list' : 'globe')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--line)] rounded-[var(--r-xs)] bg-[var(--surface)] transition-colors"
          aria-label={viewMode === 'globe' ? 'Switch to accessible route list view' : 'Switch to interactive 3D globe view'}
        >
          {viewMode === 'globe' ? (
            <>
              <List className="w-3.5 h-3.5" />
              <span>List view</span>
            </>
          ) : (
            <>
              <Compass className="w-3.5 h-3.5" />
              <span>Globe</span>
            </>
          )}
        </button>
      </div>

      {viewMode === 'globe' ? (
        <div className="relative w-full h-[340px] sm:h-[390px] lg:h-[430px] bg-[var(--surface)] border-2 border-[var(--line)] rounded-[var(--r-md)] overflow-hidden shadow-hard-sm select-none">
          {/* Tactical 3D Globe */}
          <TacticalGlobe3D
            onSelectDestination={handleSelectDestination}
            selectedDest={selectedDest}
            onGetEstimate={onGetEstimate}
            onBookPickup={onBookPickup}
          />

          {/* Destination HUD Panel (Floating overlay on desktop, slide-up BottomSheet on mobile) */}
          {selectedDest && (
            isMobile ? (
              <DestinationPanel
                destination={selectedDest}
                onClose={() => setSelectedDest(null)}
                onGetEstimate={onGetEstimate}
                onBookPickup={onBookPickup}
                isMobileBottomSheet={true}
              />
            ) : (
              <div className="absolute top-4 right-4 z-20 max-w-xs animate-fadeIn">
                <DestinationPanel
                  destination={selectedDest}
                  onClose={() => setSelectedDest(null)}
                  onGetEstimate={onGetEstimate}
                  onBookPickup={onBookPickup}
                  isMobileBottomSheet={false}
                />
              </div>
            )
          )}

          {/* Quick Node Navigator Chips per Phase 5 spec */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none z-10 pointer-events-auto">
            <span className="text-xs font-semibold text-[var(--text-muted)] bg-[var(--surface)] px-2 py-1.5 rounded-[var(--r-xs)] border border-[var(--line)] shadow-hard-xs shrink-0">
              Countries:
            </span>
            {SHOWN_COUNTRIES.map((chip) => {
              const dest = DEST_BY_ISO2[chip.iso2];
              const isSelected = selectedDest?.code === chip.iso2 || selectedDest?.id === dest?.id;
              return (
                <button
                  key={`chip-${chip.iso2}`}
                  onClick={() =>
                    dest && handleSelectDestination(destinationForCountry(chip.iso2, chip.label, dest.lat, dest.lng))
                  }
                  className={`inline-flex items-center gap-1.5 leading-none px-2.5 py-1.5 text-xs font-semibold rounded-[var(--r-xs)] border shrink-0 transition-all duration-[var(--t-fast)] shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 ${
                    isSelected
                      ? 'bg-[var(--gold)] text-[var(--oxford-deep)] border-transparent font-bold'
                      : 'bg-[var(--surface)] text-[var(--text)] border-[var(--line)] hover:border-[var(--line-strong)]'
                  }`}
                >
                  <img src={flagUrl(chip.iso2, 20)} alt="" width={16} height={12} className="w-4 h-3 rounded-[2px] object-cover shrink-0" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => setViewMode('list')}
              className="inline-flex items-center leading-none px-2.5 py-1.5 text-xs font-semibold rounded-[var(--r-xs)] border shrink-0 transition-all duration-[var(--t-fast)] shadow-hard-xs bg-[var(--surface-muted)] text-[var(--text-muted)] border-[var(--line)] hover:text-[var(--text)] hover:border-[var(--line-strong)]"
            >
              All routes
            </button>
          </div>
        </div>
      ) : (
        /* Accessible List View */
        <div className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] overflow-hidden shadow-hard-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface-muted)] text-[var(--text-muted)] font-mono uppercase text-[10px] border-b border-[var(--line)]">
                <tr>
                  <th className="py-2.5 px-3">Destination</th>
                                    <th className="py-2.5 px-3">Delivery time</th>
                  <th className="py-2.5 px-3 text-right"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {DESTINATIONS.map((dest) => (
                  <tr
                    key={`list-${dest.id}`}
                    onClick={() => handleSelectDestination(dest)}
                    className="hover:bg-[var(--surface-subtle,#FAFAF8)] cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-semibold text-[var(--text)]">
                      <div className="flex items-center gap-2">
                        <span>{dest.country}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[var(--text-muted)]">{dest.transitTime}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDestination(dest);
                        }}
                        className="px-2.5 py-1 text-xs font-mono font-bold text-[var(--gold-dark)] hover:underline"
                      >
                        See details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
