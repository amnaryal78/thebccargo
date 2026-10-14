import React, { useState } from 'react';
import { Globe, CheckCircle2 } from 'lucide-react';

interface Partner {
  name: string;
  code: string;
  type: string;
  badge: string;
  brandBg: string;      // official logo brand bg color
  brandText: string;    // contrasting logo text color
  description: string;
}

export const PartnerSlider: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const partners: Partner[] = [
    {
      name: 'DHL Express',
      code: 'DHL',
      type: 'Global Air & Express Courier',
      badge: 'Air Priority',
      brandBg: '#FFCC00',
      brandText: '#D40000',
      description: 'Daily scheduled cargo connections & rapid customs gateway'
    },
    {
      name: 'FedEx Express',
      code: 'FEDEX',
      type: 'Air Freight & Expedited Parcel',
      badge: 'Priority Cargo',
      brandBg: '#4D148C',
      brandText: '#FF6600',
      description: 'Global express air charter & door-to-door network'
    },
    {
      name: 'UPS Supply Chain',
      code: 'UPS',
      type: 'Global Logistics & Overland',
      badge: 'Integrated Cargo',
      brandBg: '#351C15',
      brandText: '#FFB500',
      description: 'Heavy commercial freight forwarding and global logistics'
    },
    {
      name: 'Aramex International',
      code: 'ARAMEX',
      type: 'Middle East & Asia Express',
      badge: 'GCC Hub Network',
      brandBg: '#E31837',
      brandText: '#FFFFFF',
      description: 'Middle East & GCC transit corridors and fast courier delivery'
    },
    {
      name: 'TNT Express',
      code: 'TNT',
      type: 'European & Global Express Delivery',
      badge: 'Express Network',
      brandBg: '#FF6600',
      brandText: '#FFFFFF',
      description: 'Time-definite international parcel and express road-air transit'
    },
    {
      name: 'EMS Nepal Post',
      code: 'EMS',
      type: 'Universal Postal Union International Express',
      badge: 'National Postal Gateway',
      brandBg: '#002D62',
      brandText: '#FFD700',
      description: 'Global 190+ country diplomatic and parcel express network'
    },
    {
      name: 'SF Express',
      code: 'SF',
      type: 'Asia-Pacific Courier & Air Freight',
      badge: 'Direct Gateway',
      brandBg: '#E60012',
      brandText: '#FFFFFF',
      description: 'Fast cross-border express courier connecting East Asia & Nepal'
    },
    {
      name: 'DPD Geopost',
      code: 'DPD',
      type: 'Pan-European Parcel Courier',
      badge: 'Parcel Network',
      brandBg: '#DC0032',
      brandText: '#FFFFFF',
      description: 'European cross-border e-commerce logistics and express delivery'
    },
    {
      name: 'DTDC Global Express',
      code: 'DTDC',
      type: 'Cross-Border India-Nepal Courier',
      badge: 'Bilateral Hub',
      brandBg: '#003B73',
      brandText: '#FFFFFF',
      description: 'Direct bilateral linehaul courier & parcel forwarding network'
    },
    {
      name: 'Cathay Cargo',
      code: 'CATHAY',
      type: 'Trans-Pacific Air Freighter',
      badge: 'HKG Gateway',
      brandBg: '#006564',
      brandText: '#FFFFFF',
      description: 'Hong Kong hub cargo charters & palletized aircraft belly space'
    },
    {
      name: 'Qatar Airways Cargo',
      code: 'QATAR',
      type: 'Global Belly & Freighter Carrier',
      badge: 'Doha Air Hub',
      brandBg: '#5C0632',
      brandText: '#FFFFFF',
      description: 'Scheduled widebody freighters into Kathmandu Tribhuvan TIA'
    },
    {
      name: 'Maersk Sealand',
      code: 'MAERSK',
      type: 'Ocean & Maritime Container Lines',
      badge: 'FCL & LCL Lines',
      brandBg: '#002447',
      brandText: '#42B0D5',
      description: 'Intermodal rail from Birgunj ICD to deep seaport berths'
    },
    {
      name: 'BlueDart Express',
      code: 'BLUEDART',
      type: 'South Asia Overland Linehaul',
      badge: 'India Transit Hub',
      brandBg: '#003366',
      brandText: '#FFCC00',
      description: 'Cross-border road freight linehaul & parcel transit'
    }
  ];

  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="py-14 bg-slate-100/70 dark:bg-[#071A33]/70 border-t border-b border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#0B5ED7] dark:text-[#2F80ED] uppercase tracking-wider mb-1 font-semibold">
            <Globe className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Global Carrier Interline Network</span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
            Integrated with Leading International Carriers
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
          <span>Interline EDI Tracking Synchronized</span>
        </div>
      </div>

      {/* Marquee Slider */}
      <div className="relative w-full overflow-hidden">
        <div className="flex gap-4 animate-marquee w-max py-2">
          {duplicatedPartners.map((partner, index) => {
            const isHovered = hoveredIdx === index;
            return (
              <div
                key={`${partner.code}-${index}`}
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  borderColor: isHovered ? partner.brandBg : undefined,
                }}
                className="group w-72 sm:w-80 bg-white dark:bg-[#0B2445] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all duration-300 shrink-0 flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div 
                    style={{
                      backgroundColor: isHovered ? partner.brandBg : undefined,
                      color: isHovered ? partner.brandText : undefined,
                      borderColor: isHovered ? partner.brandBg : undefined,
                    }}
                    className="px-3 py-1.5 rounded-lg font-extrabold font-mono text-xs tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-all duration-300 shadow-xs"
                  >
                    {partner.name}
                  </div>

                  <span 
                    style={{
                      borderColor: isHovered ? partner.brandBg : undefined,
                      color: isHovered ? partner.brandBg : undefined,
                    }}
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all duration-300"
                  >
                    {partner.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <span 
                    style={{
                      color: isHovered ? partner.brandBg : undefined
                    }}
                    className="text-xs font-extrabold text-slate-900 dark:text-slate-100 block truncate transition-colors duration-300"
                  >
                    {partner.type}
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    {partner.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1 text-[#10B981]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    EDI Live Sync
                  </span>
                  <span style={{ color: isHovered ? partner.brandBg : undefined }} className="font-semibold transition-colors">
                    Interline Hub
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
