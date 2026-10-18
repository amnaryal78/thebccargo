import React, { useState } from 'react';
import { REGIONAL_HUBS } from '../data/initialData';
import { Building2, MapPin, Truck, Warehouse, Compass, Phone, Mail, ArrowUpRight, Check } from 'lucide-react';

export const RegionalHubsMap: React.FC = () => {
  const [selectedHubId, setSelectedHubId] = useState<string>('hetauda');
  const selectedHub = REGIONAL_HUBS.find((h) => h.id === selectedHubId) || REGIONAL_HUBS[0];

  return (
    <section id="hubs" className="w-full py-16 sm:py-24 bg-[var(--surface-muted)] text-[var(--text)] border-t border-b border-[var(--line)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2.5 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 self-start px-2.5 py-1 bg-[var(--surface)] border border-[var(--line-strong)] rounded-[var(--r-xs)]">
              <span className="w-2 h-2 rounded-full bg-[var(--gold)]" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--gold-dark)]">
                Nepal Gateway Infrastructure
              </span>
            </div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[var(--text)] tracking-tight leading-tight">
              Operational Depots &amp; Logistics Hubs
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              Consolidation warehouses, bonded customs yards, and fleet sorting facilities anchored at Hetauda Central Headquarters and regional Nepal gateways.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] self-start md:self-end">
            <Compass className="w-4 h-4 text-[var(--gold)]" />
            <span>5 Primary Hubs Active</span>
          </div>
        </div>

        {/* Hub Selector Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--line)]" role="tablist">
          {REGIONAL_HUBS.filter((hub) => hub.id === 'hetauda').map((hub) => {
            const isSelected = hub.id === selectedHubId;
            return (
              <button
                key={hub.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedHubId(hub.id)}
                className={`min-h-[44px] px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-[var(--t-fast)] rounded-lg border inline-flex items-center gap-2 shrink-0 shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] ${
                  isSelected
                    ? 'bg-[var(--oxford-deep)] text-white border-white/20'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:text-[var(--text)]'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-[var(--gold)]' : 'text-[var(--text-muted)]'}`} />
                <span>{hub.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Hub Details & Vector Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Hub Dossier Card */}
          <div className="lg:col-span-6 bg-[var(--surface)] rounded-[var(--r-md)] border border-[var(--line)] p-6 sm:p-7 shadow-hard flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-[var(--line)]">
                <div>
                  <span className="text-[11px] font-mono uppercase font-bold text-[var(--gold-dark)] block">
                    {selectedHub.role}
                  </span>
                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-[var(--text)] mt-1">
                    {selectedHub.name}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-[var(--r-xs)] bg-[var(--surface-muted)] border border-[var(--line)] shadow-hard-xs flex items-center justify-center text-[var(--oxford-deep)] shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>

              {/* Facility Address */}
              <div className="p-3 bg-[var(--surface-subtle,#FAFAF8)] border border-[var(--line)] rounded-[var(--r-xs)] shadow-hard-xs flex items-start gap-2.5 text-xs">
                <MapPin className="w-4 h-4 text-[var(--gold)] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[var(--text)] font-mono text-[10px] uppercase">Facility Address:</strong>
                  <span className="text-[var(--text-secondary)]">{selectedHub.address}</span>
                </div>
              </div>

              {/* Stationed Fleet & Footprint */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[var(--surface-subtle,#FAFAF8)] border border-[var(--line)] rounded-[var(--r-xs)] shadow-hard-xs">
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] font-mono uppercase mb-1">
                    <Truck className="w-3.5 h-3.5 text-[var(--gold)]" />
                    <span>Stationed Fleet</span>
                  </div>
                  <span className="font-heading font-bold text-sm text-[var(--text)] block">
                    {selectedHub.activeFleet}
                  </span>
                </div>

                <div className="p-3 bg-[var(--surface-subtle,#FAFAF8)] border border-[var(--line)] rounded-[var(--r-xs)] shadow-hard-xs">
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] font-mono uppercase mb-1">
                    <Warehouse className="w-3.5 h-3.5 text-[var(--green-mid,#16A34A)]" />
                    <span>Facility Footprint</span>
                  </div>
                  <span className="font-heading font-bold text-sm text-[var(--text)] block">
                    {selectedHub.warehouseCapacity}
                  </span>
                </div>
              </div>

              {/* Specialization */}
              <div>
                <strong className="block text-[11px] font-mono uppercase text-[var(--text-muted)] mb-1.5">
                  Core Operational Specialization:
                </strong>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--surface-subtle,#FAFAF8)] p-3.5 rounded-[var(--r-xs)] border border-[var(--line)] shadow-hard-xs">
                  {selectedHub.specialization}
                </p>
              </div>
            </div>

            {/* Direct Contact & Status */}
            <div className="pt-4 border-t border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-[var(--text-secondary)] font-mono">
                <a href="tel:+977057591816" className="flex items-center gap-1 hover:underline">
                  <Phone className="w-3.5 h-3.5 text-[var(--gold)]" />
                  <span>057-591816 / 9855019485</span>
                </a>
                <a href="mailto:thebccargo@gmail.com" className="flex items-center gap-1 hover:underline">
                  <Mail className="w-3.5 h-3.5 text-[var(--gold)]" />
                  <span>thebccargo@gmail.com</span>
                </a>
              </div>

              <span className="px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase rounded-[var(--r-xs)] bg-[var(--green-subtle,#DCFCE7)] text-[var(--green-dark,#15803D)] border border-[var(--green-mid,#16A34A)]/30 self-start sm:self-auto shadow-hard-xs">
                Open Mon–Sat
              </span>
            </div>
          </div>

          {/* Right: Map Vector Visual */}
          <div className="lg:col-span-6 bg-[var(--surface)] rounded-[var(--r-md)] border border-[var(--line)] p-6 shadow-hard flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[var(--gold-dark)]">
                <Compass className="w-4 h-4 text-[var(--gold)]" />
                <span>Nepal Gateway Corridors</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">Live Node Status</span>
            </div>

            {/* Vector Map */}
            <div className="relative w-full h-[280px] sm:h-[320px] my-4 flex items-center justify-center">
              <svg 
                viewBox="0 0 500 280" 
                className="w-full h-full"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Map of Nepal logistics hubs"
              >
                {/* Stylized Nepal Territory Boundary Outline */}
                <path
                  d="M 50 140 
                     C 70 120, 110 90, 160 85 
                     C 210 80, 240 70, 280 65 
                     C 320 60, 360 80, 420 110 
                     C 470 135, 480 160, 450 180 
                     C 420 200, 380 205, 330 200 
                     C 280 195, 230 220, 170 215 
                     C 110 210, 80 180, 50 140 Z"
                  fill="var(--surface-muted)"
                  stroke="var(--line-strong)"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />

                {/* Major Corridors */}
                <path d="M 255 195 L 245 155 L 265 130" stroke="#F2B705" strokeWidth="3" strokeLinecap="round" />
                <path d="M 245 155 L 180 125" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
                <path d="M 265 130 L 295 95" stroke="#002147" strokeWidth="2" strokeDasharray="3 3" />

                {/* Hub Pin: Hetauda */}
                <g onClick={() => setSelectedHubId('hetauda')} className="cursor-pointer" transform="translate(245, 155)" role="button" aria-label="Select Hetauda HQ">
                  <circle cx="0" cy="0" r="18" fill="transparent" />
                  <circle cx="0" cy="0" r="7" fill={selectedHubId === 'hetauda' ? '#F2B705' : '#002147'} stroke="#FFFFFF" strokeWidth="2" />
                  <text x="12" y="4" fill="var(--text)" fontSize="10" fontWeight="bold" fontFamily="Public Sans">
                    Hetauda HQ
                  </text>
                </g>

                {/* Hub Pin: Birgunj */}
                <g onClick={() => setSelectedHubId('birgunj')} className="cursor-pointer" transform="translate(255, 195)" role="button" aria-label="Select Birgunj ICD">
                  <circle cx="0" cy="0" r="18" fill="transparent" />
                  <circle cx="0" cy="0" r="6" fill={selectedHubId === 'birgunj' ? '#F2B705' : '#002147'} stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x="12" y="4" fill="var(--text-muted)" fontSize="9" fontWeight="600" fontFamily="Public Sans">
                    Birgunj ICD
                  </text>
                </g>

                {/* Hub Pin: Kathmandu */}
                <g onClick={() => setSelectedHubId('kathmandu')} className="cursor-pointer" transform="translate(265, 130)" role="button" aria-label="Select Kathmandu TIA">
                  <circle cx="0" cy="0" r="18" fill="transparent" />
                  <circle cx="0" cy="0" r="6" fill={selectedHubId === 'kathmandu' ? '#F2B705' : '#002147'} stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x="12" y="-5" fill="var(--text)" fontSize="9" fontWeight="bold" fontFamily="Public Sans">
                    Kathmandu TIA
                  </text>
                </g>

                {/* Hub Pin: Pokhara */}
                <g onClick={() => setSelectedHubId('pokhara')} className="cursor-pointer" transform="translate(180, 125)" role="button" aria-label="Select Pokhara Hub">
                  <circle cx="0" cy="0" r="18" fill="transparent" />
                  <circle cx="0" cy="0" r="5" fill={selectedHubId === 'pokhara' ? '#F2B705' : '#002147'} stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x="-54" y="-5" fill="var(--text-muted)" fontSize="9" fontWeight="600" fontFamily="Public Sans">
                    Pokhara Hub
                  </text>
                </g>
              </svg>
            </div>

            {/* Quick Summary Footnote */}
            <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
              <span>Primary Corridor: Birgunj ICD ↔ Hetauda ↔ TIA Cargo</span>
              <span className="font-bold text-[var(--gold-dark)]">Direct Linehaul</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
