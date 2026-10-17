import React, { useMemo, useState } from 'react';
import DottedMap from 'dotted-map';
import { RouteLocation, HUBS, DESTINATIONS } from './route-data';
import { DestinationPanel } from './DestinationPanel';
import { Plane, Truck, Compass, List, MapPin } from 'lucide-react';

interface RouteTable2DProps {
  onSelectDestination?: (dest: RouteLocation) => void;
  onGetEstimate: (dest: RouteLocation) => void;
  onBookPickup: (dest: RouteLocation) => void;
  className?: string;
}

export const RouteTable2D: React.FC<RouteTable2DProps> = ({
  onSelectDestination,
  onGetEstimate,
  onBookPickup,
  className = '',
}) => {
  // The site is light only
  const isDark = false;

  const [selectedDest, setSelectedDest] = useState<RouteLocation | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'air' | 'road' | 'sea'>('all');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Generate lightweight dotted map SVG once
  const svgMap = useMemo(() => {
    try {
      const map = new DottedMap({ height: 80, grid: 'diagonal' });
      return map.getSVG({
        radius: 0.22,
        color: isDark ? '#D99B00' : '#002147',
        shape: 'circle',
        backgroundColor: 'transparent',
      });
    } catch {
      return '';
    }
  }, [isDark]);

  // Project lat/lng to 800x400 SVG viewBox
  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const ktmPoint = projectPoint(HUBS[0].lat, HUBS[0].lng);

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 35;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  const filteredDestinations = useMemo(() => {
    if (filterMode === 'all') return DESTINATIONS;
    return DESTINATIONS.filter((d) => d.mode === filterMode);
  }, [filterMode]);

  const handleSelect = (dest: RouteLocation) => {
    setSelectedDest(dest);
    if (onSelectDestination) {
      onSelectDestination(dest);
    }
  };

  return (
    <div className={`w-full flex flex-col gap-3 font-sans ${className}`}>
      {/* Top Controls: Filter Pills & List View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Route destination filters">
          {[
            { id: 'all', label: `All Corridors (${DESTINATIONS.length})` },
            { id: 'air', label: 'Air Freight' },
            { id: 'road', label: 'Overland Road' },
            { id: 'sea', label: 'Ocean Seaport' },
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={filterMode === tab.id}
              onClick={() => setFilterMode(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all duration-[var(--t-fast)] rounded-[var(--r-xs)] border shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 whitespace-nowrap shrink-0 cursor-pointer ${
                filterMode === tab.id
                  ? 'bg-[var(--oxford-deep)] text-white border-white/20'
                  : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--line)] hover:border-[#F2B705] hover:text-[#002147]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Mode Toggle: Map vs List */}
        <button
          onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--line)] rounded-[var(--r-xs)] bg-[var(--surface)] shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-[var(--t-fast)]"
          aria-label={viewMode === 'map' ? 'Switch to accessible route list view' : 'Switch to interactive route map view'}
        >
          {viewMode === 'map' ? (
            <>
              <List className="w-3.5 h-3.5" />
              <span>List view</span>
            </>
          ) : (
            <>
              <Compass className="w-3.5 h-3.5" />
              <span>Map view</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container */}
      {viewMode === 'map' ? (
        <div className="relative w-full aspect-[2/1] min-h-[300px] sm:min-h-[380px] bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] overflow-hidden shadow-hard-sm">
          {/* Background Dotted Map SVG */}
          {svgMap && (
            <img
              src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
              alt="Global route network map"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-20"
            />
          )}

          {/* Interactive SVG Overlay with Arcs and Markers */}
          <svg
            viewBox="0 0 800 400"
            className="absolute inset-0 w-full h-full"
            aria-label="Interactive shipping corridors from Nepal"
          >
            {/* Flight & Overland Arcs */}
            {filteredDestinations.map((dest) => {
              const pt = projectPoint(dest.lat, dest.lng);
              const isSelected = selectedDest?.id === dest.id;
              return (
                <path
                  key={`arc-${dest.id}`}
                  d={createCurvedPath(ktmPoint, pt)}
                  fill="none"
                  stroke={isSelected ? '#F2B705' : (isDark ? '#F2B70540' : '#00214730')}
                  strokeWidth={isSelected ? 2 : 1}
                  strokeDasharray={isSelected ? 'none' : '3 3'}
                  className="transition-all duration-300 pointer-events-none"
                />
              );
            })}

            {/* Hub Marker: Kathmandu */}
            <g className="cursor-pointer">
              <circle
                cx={ktmPoint.x}
                cy={ktmPoint.y}
                r="7"
                fill="#002147"
                stroke="#F2B705"
                strokeWidth="2.5"
              />
              <circle
                cx={ktmPoint.x}
                cy={ktmPoint.y}
                r="12"
                fill="none"
                stroke="#F2B705"
                strokeWidth="1"
                opacity="0.6"
              />
              <text
                x={ktmPoint.x + 10}
                y={ktmPoint.y + 4}
                fill={isDark ? '#F6F6F4' : '#121211'}
                fontSize="11"
                fontFamily="Public Sans, sans-serif"
                fontWeight="700"
              >
                KTM (Hub)
              </text>
            </g>

            {/* Destination Interactive Markers */}
            {filteredDestinations.map((dest) => {
              const pt = projectPoint(dest.lat, dest.lng);
              const isSelected = selectedDest?.id === dest.id;

              return (
                <g
                  key={`dot-${dest.id}`}
                  onClick={() => handleSelect(dest)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Select corridor to ${dest.name}, from ${dest.fromPrice}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(dest);
                    }
                  }}
                  className="cursor-pointer focus:outline-none group"
                >
                  {/* Expanded invisible touch hit target (>= 44px) */}
                  <circle cx={pt.x} cy={pt.y} r="22" fill="transparent" />

                  {/* Visual Node Dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 6 : 4}
                    fill={isSelected ? '#F2B705' : (dest.mode === 'air' ? '#002147' : dest.mode === 'sea' ? '#0E7490' : '#D99B00')}
                    stroke={isSelected ? '#002147' : (isDark ? '#F6F6F4' : '#FFFFFF')}
                    strokeWidth="1.5"
                    className="transition-all duration-200 group-hover:scale-125"
                  />

                  {/* Destination Label on Hover/Selected */}
                  <text
                    x={pt.x + 7}
                    y={pt.y + 3}
                    fill={isDark ? '#D99B00' : '#002147'}
                    fontSize={isSelected ? '10' : '9'}
                    fontFamily="Public Sans, sans-serif"
                    fontWeight={isSelected ? '700' : '500'}
                    opacity={isSelected ? 1 : 0.75}
                    className="pointer-events-none transition-opacity"
                  >
                    {dest.code}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Quick Destination Select Bar (Touch Ergonomics for Android) */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none z-10">
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] bg-[var(--surface)] px-2 py-1 rounded-[var(--r-xs)] border border-[var(--line)] shadow-hard-xs shrink-0">
              Quick tap:
            </span>
            {filteredDestinations.slice(0, 10).map((d) => (
              <button
                key={`pill-${d.id}`}
                onClick={() => handleSelect(d)}
                className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-[var(--r-xs)] border shrink-0 transition-all duration-[var(--t-fast)] shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 inline-flex items-center gap-1.5 ${
                  selectedDest?.id === d.id
                    ? 'bg-[var(--gold)] text-[var(--oxford-deep)] border-transparent font-bold'
                    : 'bg-[var(--surface)] text-[var(--text)] border-[var(--line)] hover:border-[var(--line-strong)]'
                }`}
              >
                <span>{d.flag}</span>
                <span>{d.code}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Accessible Table / List View */
        <div className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] overflow-hidden shadow-hard-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface-muted)] text-[var(--text-muted)] font-mono uppercase text-[10px] border-b border-[var(--line)]">
                <tr>
                  <th className="py-2.5 px-3">Destination</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Transit Time</th>
                  <th className="py-2.5 px-3 text-right">Starting From</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filteredDestinations.map((dest) => (
                  <tr
                    key={`row-${dest.id}`}
                    onClick={() => handleSelect(dest)}
                    className="hover:bg-[var(--surface-subtle,#FAFAF8)] cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-semibold text-[var(--text)]">
                      <div className="flex items-center gap-2">
                        <span className="text-base select-none">{dest.flag}</span>
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-[var(--surface-muted)] border border-[var(--line)] rounded">
                          {dest.code}
                        </span>
                        <span>{dest.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[var(--text-muted)]">
                      {dest.serviceName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[var(--text-muted)]">
                      {dest.transitTime}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[var(--oxford-deep)]">
                      {dest.fromPrice}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(dest);
                        }}
                        className="px-2.5 py-1 text-xs font-mono font-bold text-[var(--gold-dark)] hover:underline"
                      >
                        View Rate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile Destination Bottom Sheet */}
      <DestinationPanel
        destination={selectedDest}
        onClose={() => setSelectedDest(null)}
        onGetEstimate={onGetEstimate}
        onBookPickup={onBookPickup}
        isMobileBottomSheet={true}
      />
    </div>
  );
};
