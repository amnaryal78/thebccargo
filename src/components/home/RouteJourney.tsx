import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronLeft, ChevronRight, List, Pause, Play, Route as RouteIcon } from 'lucide-react';
import { DESTINATIONS, RouteLocation } from './route-data';
import { DestinationPanel } from './DestinationPanel';
import {
  JOURNEY_CYCLE_MS,
  JOURNEY_EXIT_MS,
  JourneyStage,
  Stop,
  buildStops,
  journeyClock,
  shortTransit,
  transitDays,
} from './journey-data';
import { flagUrl } from '../../data/countries';
import './route-journey.css';

interface RouteJourneyProps {
  onGetEstimate: (dest: RouteLocation) => void;
  onBookPickup: (dest: RouteLocation) => void;
  className?: string;
}

const STAGE_LABEL: Record<JourneyStage, string> = {
  pickup: 'Pickup in Hetauda',
  flight: 'In flight',
  customs: 'Customs & landing',
  delivered: 'Delivered',
};

const STEPS = ['Pickup', 'In flight', 'Customs', 'Delivered'];

/** Fixed confetti burst around the destination parcel (deterministic, no randomness at render). */
const CONFETTI = [
  [-34, -40, 120, '#F2B705'], [-22, -52, -90, '#002147'], [-8, -58, 200, '#F2B705'], [8, -56, -140, '#16A34A'],
  [22, -50, 80, '#F2B705'], [34, -38, -60, '#002147'], [-40, -22, 160, '#16A34A'], [40, -20, -180, '#F2B705'],
  [-28, -30, 30, '#F2B705'], [28, -28, -30, '#002147'], [0, -44, 90, '#16A34A'], [-14, -38, -120, '#002147'],
] as const;

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

const ARC = 'M60 138 Q200 -25 340 138';

/** The animated scene for one country. Remount (change `key`) to replay it. */
const Scene: React.FC<{ stop: Stop }> = ({ stop }) => (
  <svg
    viewBox="0 0 400 220"
    className="w-full h-full block"
    role="img"
    aria-label={`Parcel journey from Nepal to ${stop.label}, ${shortTransit(stop.dest.transitTime)}`}
  >
    <defs>
      <linearGradient id="rj-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#E9F0FA" />
        <stop offset="1" stopColor="#FFFFFF" />
      </linearGradient>
    </defs>
    <g className="rj-scene">
      <rect width="400" height="220" fill="url(#rj-sky)" />

      {/* clouds drift across the sky for the whole loop */}
      <g fill="#fff" opacity=".9">
        <g className="rj-cloud"><ellipse cx="0" cy="40" rx="22" ry="7" /><ellipse cx="12" cy="35" rx="14" ry="8" /></g>
        <g className="rj-cloud rj-cloud-2"><ellipse cx="0" cy="78" rx="18" ry="6" /><ellipse cx="-9" cy="74" rx="11" ry="6" /></g>
        <g className="rj-cloud rj-cloud-3"><ellipse cx="0" cy="22" rx="16" ry="5" /><ellipse cx="8" cy="19" rx="10" ry="5.5" /></g>
      </g>

      {/* Nepal: Himalaya behind the origin, destination skyline behind the arrival */}
      <g>
        <path d="M0 160L18 118L34 138L52 94L70 140L88 120L112 160Z" fill="#D5DFEC" />
        <path d="M52 94L44.5 109L52 104.5L59.5 110Z" fill="#fff" />
        <path d="M18 118L12.5 128L18 125L23 130Z" fill="#fff" opacity=".9" />
        <g fill="#E2E1DC">
          <rect x="292" y="128" width="14" height="32" /><rect x="310" y="110" width="12" height="50" />
          <rect x="326" y="136" width="16" height="24" /><rect x="346" y="102" width="14" height="58" />
          <rect x="364" y="126" width="12" height="34" /><rect x="380" y="116" width="16" height="44" />
        </g>
      </g>

      {/* ground */}
      <rect x="0" y="160" width="400" height="60" fill="#F3F2EE" />
      <line x1="0" y1="160" x2="400" y2="160" stroke="#D9D8D2" strokeWidth="2" />

      {/* route: dashed flow + contrail that is drawn as the plane passes */}
      <path d={ARC} fill="none" stroke="#B9B8B0" strokeWidth="1.6" strokeDasharray="3 6" strokeLinecap="round" className="rj-arc-flow" />
      <path className="rj-arc-done" d={ARC} pathLength="1" fill="none" stroke="#002147" strokeWidth="2.2" strokeLinecap="round" />

      {/* origin node */}
      <g>
        <circle cx="60" cy="160" r="6" fill="#F2B705" stroke="#002147" strokeWidth="1.8" />
        <FlagTile iso2="NP" x={48} y={169} />
        <text x="60" y="206" textAnchor="middle" fontSize="11" fontWeight="700" fill="#002147">Nepal</text>
      </g>

      {/* destination node */}
      <g>
        <circle className="rj-dest-ring" cx="340" cy="160" r="6" fill="none" stroke="#F2B705" strokeWidth="2" />
        <circle cx="340" cy="160" r="6" fill="#F2B705" stroke="#002147" strokeWidth="1.8" />
        <FlagTile iso2={stop.iso2} x={328} y={169} />
        <text x="340" y="206" textAnchor="middle" fontSize="11" fontWeight="700" fill="#002147">{stop.label}</text>
      </g>

      {/* parcel lands, tick, confetti */}
      <g transform="translate(340 160)">
        <Parcel className="rj-box-land" />
        <g className="rj-tick">
          <circle cx="14" cy="-18" r="8" fill="#16A34A" stroke="#fff" strokeWidth="1.6" />
          <path d="M10.2 -18.2l2.7 2.7 4.7-5.1" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <g transform="translate(0 -14)">
          {CONFETTI.map(([dx, dy, rot, color], i) => (
            <rect
              key={i}
              className="rj-conf"
              x="-2"
              y="-2"
              width={i % 3 === 0 ? 5 : 4}
              height={i % 3 === 0 ? 3 : 4}
              rx={i % 2 === 0 ? 1 : 2}
              fill={color}
              style={{ '--dx': `${dx}px`, '--dy': `${dy}px`, '--rot': `${rot}deg` } as React.CSSProperties}
            />
          ))}
        </g>
      </g>

      {/* truck brings the parcel to the airport */}
      <g transform="translate(72 160)">
        <g className="rj-truck">
          <rect x="-36" y="-12" width="48" height="4.5" rx="2" fill="#002147" />
          <path d="M14 -8.5V-25a4 4 0 0 1 4-4h8a4 4 0 0 1 3 1.4L35 -20v11.5Z" fill="#002147" />
          <path d="M19 -25h5.5l4.2 5.6H19Z" fill="#ECEBE7" />
          <rect x="31" y="-12" width="5" height="3.6" rx="1" fill="#F2B705" />
          <g fill="#121211">
            <circle cx="-24" cy="-5" r="5" /><circle cx="-4" cy="-5" r="5" /><circle cx="24" cy="-5" r="5" />
          </g>
          <g fill="#F2B705">
            <circle className="rj-wheel" cx="-24" cy="-6.8" r="1.3" style={{ transformOrigin: '-24px -5px' }} />
            <circle className="rj-wheel" cx="-4" cy="-6.8" r="1.3" style={{ transformOrigin: '-4px -5px' }} />
            <circle className="rj-wheel" cx="24" cy="-6.8" r="1.3" style={{ transformOrigin: '24px -5px' }} />
          </g>
          <g transform="translate(-12 -12)"><Parcel className="rj-box-truck" /></g>
        </g>
      </g>

      {/* plane with the parcel underneath */}
      <g className="rj-plane-appear">
        <g className="rj-plane">
          <g className="rj-plane-exit">
            <path d="M-19 0a4 4 0 0 1 4-4H10c5 0 9 2 11 4-2 2-6 4-11 4h-25a4 4 0 0 1-4-4Z" fill="#fff" stroke="#002147" strokeWidth="1.4" />
            <path d="M-3 -1L-11 -11H-6L7 -1Z M-3 1L-11 11H-6L7 1Z" fill="#002147" />
            <path d="M-17 -3L-21 -9H-17L-12 -3Z" fill="#002147" />
            <circle className="rj-prop" cx="21" cy="0" r="1.6" fill="#F2B705" />
            <circle cx="13" cy="-0.6" r="1" fill="#002147" /><circle cx="9" cy="-0.6" r="1" fill="#002147" /><circle cx="5" cy="-0.6" r="1" fill="#002147" />
            <g transform="translate(0 25)"><Parcel className="rj-box-fly" /></g>
          </g>
        </g>
      </g>
    </g>
  </svg>
);

/** Scene + live status for one country. Re-keyed by the parent to replay from the start. */
const Journey: React.FC<{ stop: Stop; running: boolean }> = ({ stop, running }) => {
  const total = transitDays(stop.dest.transitTime);
  const elapsed = useRef(0);
  const [clock, setClock] = useState(() => journeyClock(0, total));

  // The day counter and stage text follow the same timeline as the CSS. They only tick while running.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      elapsed.current += 120;
      const next = journeyClock(elapsed.current, total);
      setClock((c) => (c.day === next.day && c.stage === next.stage ? c : next));
    }, 120);
    return () => window.clearInterval(id);
  }, [running, total]);

  const stageIndex = ['pickup', 'flight', 'customs', 'delivered'].indexOf(clock.stage);
  const delivered = clock.stage === 'delivered';

  return (
    <>
      <div className="relative w-full aspect-[400/220] min-h-[200px]">
        <div className="rj-title absolute top-2.5 left-0 right-0 z-10 flex justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1.5 text-sm sm:text-base font-heading font-bold text-[var(--oxford-deep,#002147)] bg-white/80 rounded-full px-3 py-0.5">
            Nepal <ArrowRight className="w-4 h-4 text-[var(--gold-dark)]" aria-hidden="true" /> {stop.label}
          </span>
        </div>
        <div className="absolute left-1/2 top-[52%] -translate-x-1/2 z-10 pointer-events-none" aria-hidden="true">
          {delivered ? (
            <span className="rj-banner inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16A34A] text-white text-xs sm:text-sm font-bold shadow-md">
              <Check className="w-4 h-4" /> Delivered in {total} days
            </span>
          ) : (
            <span className="rj-chip inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--oxford-deep,#002147)] text-white text-xs sm:text-sm font-bold shadow-md whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold,#F2B705)]" />
              Day {clock.day} of {total}
              <span className="font-medium opacity-80">· {STAGE_LABEL[clock.stage]}</span>
            </span>
          )}
        </div>
        <div className="absolute inset-0">
          <Scene stop={stop} />
        </div>
        <span className="sr-only" role="status">
          {stop.label}: {STAGE_LABEL[clock.stage]}, day {clock.day} of {total}
        </span>
      </div>

      <ol className="grid grid-cols-4 gap-1 px-4 pt-2 pb-1" aria-hidden="true">
        {STEPS.map((label, i) => (
          <li key={label} className={`rj-step rj-step-${i + 1} relative flex flex-col items-center gap-1`}>
            {i > 0 && (
              <span className={`rj-step-line rj-step-line-${i} absolute top-[5px] right-1/2 w-full h-[2px] bg-[var(--line)] overflow-hidden -z-0`}>
                <b className="block w-full h-full bg-[var(--oxford-deep,#002147)]" />
              </span>
            )}
            <i className="relative z-10 block w-3 h-3 rounded-full border-2 border-[var(--oxford-deep,#002147)] bg-white" />
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wide ${i <= stageIndex ? 'text-[var(--oxford-deep,#002147)]' : 'text-[var(--text-muted)]'}`}>
              {label}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
};

export const RouteJourney: React.FC<RouteJourneyProps> = ({ onGetEstimate, onBookPickup, className = '' }) => {
  const stops = useMemo(() => buildStops(), []);
  const [index, setIndex] = useState(0);
  const [run, setRun] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [panelDest, setPanelDest] = useState<RouteLocation | null>(null);
  const [viewMode, setViewMode] = useState<'journey' | 'list'>('journey');
  const [userPaused, setUserPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = stops.find((s) => s.iso2 === selectedIso) ?? stops[index % stops.length];
  // Frozen while off-screen, in a hidden tab, or paused by the visitor (saves battery; WCAG 2.2.2 pause control).
  const running = viewMode === 'journey' && inView && tabVisible && !userPaused;

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => setInView(entries.some((e) => e.isIntersecting)), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Next country every cycle (a chosen country replays). The scene only fades out in the last 450ms,
  // and only here in JS, so a stalled timer leaves the final frame on screen instead of a blank card.
  useEffect(() => {
    if (!running) {
      setLeaving(false);
      return;
    }
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const total = reduced ? JOURNEY_CYCLE_MS + 2000 : JOURNEY_CYCLE_MS;
    const exit = window.setTimeout(() => setLeaving(true), total - JOURNEY_EXIT_MS);
    const next = window.setTimeout(() => {
      if (!selectedIso) setIndex((i) => (i + 1) % stops.length);
      setRun((r) => r + 1);
      setLeaving(false);
    }, total);
    return () => {
      window.clearTimeout(exit);
      window.clearTimeout(next);
    };
  }, [running, run, selectedIso, stops.length]);

  const replay = () => {
    setLeaving(false);
    setRun((r) => r + 1);
  };

  const go = (delta: number) => {
    setSelectedIso(null);
    setPanelDest(null);
    setIndex((i) => (i + delta + stops.length) % stops.length);
    replay();
  };

  const clearSelection = () => {
    setSelectedIso(null);
    setPanelDest(null);
  };

  const select = (stop: Stop) => {
    setSelectedIso(stop.iso2);
    setPanelDest(stop.dest);
    setIndex(stops.findIndex((s) => s.iso2 === stop.iso2));
    replay();
  };

  const toggleListView = () => setViewMode(viewMode === 'journey' ? 'list' : 'journey');

  return (
    <div ref={rootRef} className={`w-full min-w-0 max-w-full flex flex-col gap-3 font-sans ${className}`}>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-heading font-bold text-[var(--gold-dark)]">Where do you want to ship?</span>
          <span className="hidden sm:inline text-[11px] text-[var(--text-muted)] font-mono">Tap a country to see its route.</span>
        </div>
        <button
          type="button"
          onClick={toggleListView}
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
          <div
            key={`${current.iso2}-${run}`}
            className={`rj-wrap ${leaving ? 'rj-leaving' : ''} ${running ? '' : 'rj-paused'}`}
          >
            <Journey stop={current} running={running} />
          </div>

          {/* Controls: previous / pause / next, position, and the price button for this country */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 border-t border-[var(--line)] bg-[var(--surface-subtle,#FAFAF8)] min-w-0">
            <button type="button" onClick={() => go(-1)} aria-label="Previous country" className="w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--line-strong)]">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (userPaused) replay();
                setUserPaused((p) => !p);
              }}
              aria-label={userPaused ? 'Play animation' : 'Pause animation'}
              aria-pressed={userPaused}
              className="w-8 h-8 inline-flex items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--line-strong)]"
            >
              {userPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next country" className="w-8 h-8 inline-flex items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--line-strong)]">
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-[var(--text-muted)] tabular-nums">{stops.findIndex((s) => s.iso2 === current.iso2) + 1}/{stops.length}</span>
            <button
              type="button"
              onClick={() => onGetEstimate(current.dest)}
              className="ml-auto min-w-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--gold,#F2B705)] text-[var(--oxford-deep,#002147)] text-xs font-bold hover:brightness-95 active:translate-y-px transition whitespace-nowrap"
            >
              <span className="truncate">Get price<span className="hidden min-[430px]:inline"> to {current.label}</span></span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>

          {/* Country chips: horizontal scroll only, vertical page scroll is never captured. */}
          <div className="flex items-center gap-1.5 overflow-x-auto px-3 pb-3 pt-2 scrollbar-none" style={{ touchAction: 'pan-x pan-y' }}>
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
            {selectedIso && (
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
                  <tr key={`list-${dest.id}`} onClick={() => setPanelDest(dest)} className="hover:bg-[var(--surface-subtle,#FAFAF8)] cursor-pointer transition-colors">
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
