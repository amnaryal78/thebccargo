import React, { useEffect, useMemo, useRef, useState } from 'react';
import { List, Route as RouteIcon } from 'lucide-react';
import { DESTINATIONS, RouteLocation } from './route-data';
import { JOURNEY_CYCLE_MS, Stop, buildStops, shortTransit } from './journey-data';
import { DestinationPanel } from './DestinationPanel';
import { flagUrl } from '../../data/countries';
import './route-journey.css';

interface RouteJourneyProps {
  onGetEstimate: (dest: RouteLocation) => void;
  onBookPickup: (dest: RouteLocation) => void;
  className?: string;
}

const FlagTile: React.FC<{ iso2: string; x: number; y: number }> = ({ iso2, x, y }) => (
  <g>
    <rect x={x - 1} y={y - 1} width="26" height="19" rx="3" fill="#fff" stroke="#D9D8D2" />
    <image href={flagUrl(iso2, 40)} x={x + 1} y={y + 1} width="22" height="15" preserveAspectRatio="xMidYMid slice" />
  </g>
);

const Parcel: React.FC<{ className?: string }> = ({ className }) => (
  <g className={className}>
    <rect x="-9" y="-16" width="18" height="16" rx="3.5" fill="#F2B705" />
    <path d="M-7.5 -2V-12.5a2.5 2.5 0 0 1 2.5-2.5H6" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1" strokeLinecap="round" />
    <path d="M0 -16V0" stroke="#002147" strokeWidth="3" />
    <rect x="3" y="-8" width="4.6" height="3.6" rx=".8" fill="#fff" fillOpacity=".92" />
  </g>
);

/** The animated scene for one country. Remount (change `key`) to replay it. */
const Scene: React.FC<{ stop: Stop }> = ({ stop }) => (
  <svg
    viewBox="0 0 400 200"
    className="w-full h-full block"
    role="img"
    aria-label={`Parcel journey from Nepal to ${stop.label}, ${shortTransit(stop.dest.transitTime)}`}
  >
    <g className="rj-scene">
      {/* ground + route */}
      <line x1="20" y1="150" x2="380" y2="150" stroke="#D9D8D2" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 128 Q200 -12 350 128" fill="none" stroke="#B9B8B0" strokeWidth="1.6" strokeDasharray="3 6" strokeLinecap="round" />
      <path
        className="rj-arc-done"
        d="M50 128 Q200 -12 350 128"
        pathLength="1"
        fill="none"
        stroke="#002147"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* nodes */}
      <g className="rj-node-origin">
        <circle cx="50" cy="150" r="5.5" fill="#F2B705" stroke="#002147" strokeWidth="1.6" />
        <FlagTile iso2="NP" x={38} y={158} />
        <text x="50" y="190" textAnchor="middle" fontSize="11" fontWeight="700" fill="#002147">Nepal</text>
      </g>
      <g className="rj-node-dest">
        <circle cx="350" cy="150" r="5.5" fill="#F2B705" stroke="#002147" strokeWidth="1.6" />
        <FlagTile iso2={stop.iso2} x={338} y={158} />
        <text x="350" y="190" textAnchor="middle" fontSize="11" fontWeight="700" fill="#002147">{stop.label}</text>
      </g>

      {/* parcel waiting at the destination, then the delivered tick */}
      <g transform="translate(350 150)">
        <Parcel className="rj-box-land" />
        <g className="rj-tick">
          <circle cx="13" cy="-17" r="7" fill="#002147" stroke="#F6F6F4" strokeWidth="1.5" />
          <path d="M9.6 -17.2l2.4 2.4 4.2-4.6" fill="none" stroke="#F2B705" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* truck brings the parcel to the airport */}
      <g transform="translate(60 150)">
        <g className="rj-truck">
          <rect x="-36" y="-12" width="48" height="4.5" rx="2" fill="#002147" />
          <path d="M14 -8.5V-25a4 4 0 0 1 4-4h8a4 4 0 0 1 3 1.4L35 -20v11.5Z" fill="#002147" />
          <path d="M19 -25h5.5l4.2 5.6H19Z" fill="#ECEBE7" />
          <rect x="31" y="-12" width="5" height="3.6" rx="1" fill="#F2B705" />
          <g fill="#121211">
            <circle cx="-24" cy="-5" r="5" />
            <circle cx="-4" cy="-5" r="5" />
            <circle cx="24" cy="-5" r="5" />
          </g>
          <g fill="#F2B705">
            <circle className="rj-wheel" cx="-24" cy="-6.8" r="1.3" style={{ transformOrigin: '-24px -5px' }} />
            <circle className="rj-wheel" cx="-4" cy="-6.8" r="1.3" style={{ transformOrigin: '-4px -5px' }} />
            <circle className="rj-wheel" cx="24" cy="-6.8" r="1.3" style={{ transformOrigin: '24px -5px' }} />
          </g>
          <g transform="translate(-12 -12)">
            <Parcel className="rj-box-truck" />
          </g>
        </g>
      </g>

      {/* plane with the parcel underneath */}
      <g className="rj-plane-appear">
        <g className="rj-plane">
          <g className="rj-plane-exit">
            <path d="M-19 0a4 4 0 0 1 4-4H10c5 0 9 2 11 4-2 2-6 4-11 4h-25a4 4 0 0 1-4-4Z" fill="#fff" stroke="#002147" strokeWidth="1.4" />
            <path d="M-3 -1L-11 -11H-6L7 -1Z M-3 1L-11 11H-6L7 1Z" fill="#002147" />
            <path d="M-17 -3L-21 -9H-17L-12 -3Z" fill="#002147" />
            <circle cx="13" cy="-0.6" r="1" fill="#002147" />
            <circle cx="9" cy="-0.6" r="1" fill="#002147" />
            <circle cx="5" cy="-0.6" r="1" fill="#002147" />
            <g transform="translate(0 25)">
              <Parcel className="rj-box-fly" />
            </g>
          </g>
        </g>
      </g>
    </g>
  </svg>
);

export const RouteJourney: React.FC<RouteJourneyProps> = ({ onGetEstimate, onBookPickup, className = '' }) => {
  const stops = useMemo(() => buildStops(), []);
  const [index, setIndex] = useState(0);
  const [run, setRun] = useState(0);
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [panelDest, setPanelDest] = useState<RouteLocation | null>(null);
  const [viewMode, setViewMode] = useState<'journey' | 'list'>('journey');
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = stops.find((s) => s.iso2 === selectedIso) ?? stops[index % stops.length];
  const playing = viewMode === 'journey' && inView && tabVisible;

  // Only animate while on screen and the tab is visible (saves battery on phones).
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => setInView(entries.some((e) => e.isIntersecting)), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Next country every cycle. A chosen country keeps replaying until it is cleared.
  useEffect(() => {
    if (!playing) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t = window.setTimeout(() => {
      if (!selectedIso) setIndex((i) => (i + 1) % stops.length);
      setRun((r) => r + 1);
    }, reduced ? JOURNEY_CYCLE_MS + 1500 : JOURNEY_CYCLE_MS);
    return () => window.clearTimeout(t);
  }, [playing, run, selectedIso, stops.length]);

  const clearSelection = () => {
    setSelectedIso(null);
    setPanelDest(null);
  };

  const select = (stop: Stop) => {
    setSelectedIso(stop.iso2);
    setPanelDest(stop.dest);
    setRun((r) => r + 1);
  };

  const selectedStop = selectedIso ? stops.find((s) => s.iso2 === selectedIso) : undefined;

  return (
    <div ref={rootRef} className={`w-full flex flex-col gap-3 font-sans ${className}`}>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-heading font-bold text-[var(--gold-dark)]">Where do you want to ship?</span>
          <span className="hidden sm:inline text-[11px] text-[var(--text-muted)] font-mono">Tap a country to see its route.</span>
        </div>
        <button
          type="button"
          onClick={() => setViewMode(viewMode === 'journey' ? 'list' : 'journey')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--line)] rounded-[var(--r-xs)] bg-[var(--surface)] transition-colors"
          aria-label={viewMode === 'journey' ? 'Switch to route list view' : 'Switch to animated route view'}
        >
          {viewMode === 'journey' ? (
            <>
              <List className="w-3.5 h-3.5" />
              <span>List view</span>
            </>
          ) : (
            <>
              <RouteIcon className="w-3.5 h-3.5" />
              <span>Route view</span>
            </>
          )}
        </button>
      </div>

      {viewMode === 'journey' ? (
        <div className="w-full bg-[var(--surface)] border-2 border-[var(--line)] rounded-[var(--r-md)] overflow-hidden shadow-hard-sm select-none">
          {/* Scene. aria-live off: the loop changes every few seconds, so the label is on the svg itself. */}
          <div className="relative w-full aspect-[2/1] min-h-[220px]">
            <div key={`${current.iso2}-${run}`} className="absolute inset-0">
              <div className="rj-title absolute top-3 left-0 right-0 z-10 flex flex-col items-center gap-1.5 pointer-events-none">
                <span className="text-sm sm:text-base font-heading font-bold text-[var(--oxford-deep,#002147)]">
                  Nepal <span className="text-[var(--gold-dark)]">→</span> {current.label}
                </span>
              </div>
              <div className="rj-chip absolute left-1/2 top-[50%] -translate-x-1/2 z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--oxford-deep,#002147)] text-white text-xs sm:text-sm font-bold shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold,#F2B705)]" aria-hidden="true" />
                  {shortTransit(current.dest.transitTime)}
                </span>
              </div>
              <Scene stop={current} />
            </div>
          </div>

          {/* Country chips: horizontal scroll only, vertical page scroll is never captured. */}
          <div className="flex items-center gap-1.5 overflow-x-auto px-3 pb-3 pt-1 scrollbar-none" style={{ touchAction: 'pan-x pan-y' }}>
            <span className="text-xs font-semibold text-[var(--text-muted)] bg-[var(--surface)] px-2 py-1.5 rounded-[var(--r-xs)] border border-[var(--line)] shadow-hard-xs shrink-0">
              Countries:
            </span>
            {stops.map((stop) => {
              const isCurrent = stop.iso2 === current.iso2;
              return (
                <button
                  key={`chip-${stop.iso2}`}
                  type="button"
                  onClick={() => select(stop)}
                  aria-pressed={selectedIso === stop.iso2}
                  className={`inline-flex items-center gap-1.5 leading-none px-2.5 py-1.5 text-xs font-semibold rounded-[var(--r-xs)] border shrink-0 transition-all duration-[var(--t-fast)] shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 ${
                    isCurrent
                      ? 'bg-[var(--gold)] text-[var(--oxford-deep)] border-transparent font-bold'
                      : 'bg-[var(--surface)] text-[var(--text)] border-[var(--line)] hover:border-[var(--line-strong)]'
                  }`}
                >
                  <img src={flagUrl(stop.iso2, 20)} alt="" width={16} height={12} loading="lazy" decoding="async" className="w-4 h-3 rounded-[2px] object-cover shrink-0" />
                  <span>{stop.label}</span>
                </button>
              );
            })}
            {selectedStop && (
              <button
                type="button"
                onClick={clearSelection}
                className="inline-flex items-center leading-none px-2.5 py-1.5 text-xs font-semibold rounded-[var(--r-xs)] border shrink-0 bg-[var(--surface-muted)] text-[var(--text-muted)] border-[var(--line)] hover:text-[var(--text)]"
              >
                Show all
              </button>
            )}
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="inline-flex items-center leading-none px-2.5 py-1.5 text-xs font-semibold rounded-[var(--r-xs)] border shrink-0 bg-[var(--surface-muted)] text-[var(--text-muted)] border-[var(--line)] hover:text-[var(--text)] hover:border-[var(--line-strong)]"
            >
              All routes
            </button>
          </div>
        </div>
      ) : (
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
                    onClick={() => setPanelDest(dest)}
                    className="hover:bg-[var(--surface-subtle,#FAFAF8)] cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-semibold text-[var(--text)]">{dest.country}</td>
                    <td className="py-2.5 px-3 text-[var(--text-muted)]">{dest.transitTime}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPanelDest(dest);
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

      {panelDest && (
        <div className="max-w-md">
          <DestinationPanel
            destination={panelDest}
            onClose={clearSelection}
            onGetEstimate={onGetEstimate}
            onBookPickup={onBookPickup}
            isMobileBottomSheet={false}
          />
        </div>
      )}
    </div>
  );
};
