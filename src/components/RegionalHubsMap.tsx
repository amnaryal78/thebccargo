import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Truck, 
  Warehouse, 
  CheckCircle2, 
  ArrowRight, 
  Navigation, 
  Compass, 
  Clock, 
  Zap,
  Phone,
  Mail
} from 'lucide-react';
import { REGIONAL_HUBS, CORRIDOR_BENCHMARKS } from '../data/initialData';
import { HubInfo } from '../types';

export const RegionalHubsMap: React.FC = () => {
  const [selectedHubId, setSelectedHubId] = useState<string>('hetauda');

  const selectedHub = REGIONAL_HUBS.find(h => h.id === selectedHubId) || REGIONAL_HUBS[0];

  return (
    <section id="hubs" className="w-full py-16 lg:py-24 bg-slate-50 dark:bg-[#071A33] text-slate-900 dark:text-white transition-colors border-t border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col gap-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-2 text-[#0B5ED7] dark:text-[#2F80ED] text-xs font-bold uppercase tracking-wider font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0B5ED7] dark:bg-[#2F80ED] animate-pulse" />
              <span>Our Network in Nepal</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl uppercase text-slate-900 dark:text-white tracking-tight leading-tight">
              Our Offices &amp; Delivery Hubs
            </h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
              Convenient pickup centers, central offices, and customs clearance hubs across Nepal anchored in Hetauda and Kathmandu.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <Compass className="w-4 h-4 text-[#0B5ED7] dark:text-[#2F80ED]" />
            <span>5 Main Delivery Hubs</span>
          </div>
        </div>

        {/* Hub Selector Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
          {REGIONAL_HUBS.map((hub) => {
            const isSelected = hub.id === selectedHubId;
            return (
              <button
                key={hub.id}
                onClick={() => setSelectedHubId(hub.id)}
                className={`px-4 py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0B5ED7] text-white shadow-md'
                    : 'bg-white dark:bg-[#0B2445] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-[#F5C84C]' : 'text-slate-400'}`} />
                <span>{hub.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Hub Visual & Detail Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Detailed Hub Dossier Card */}
          <div className="lg:col-span-6 bg-white dark:bg-[#0B2445] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl hover:border-[#F5C84C] transition-all flex flex-col justify-between gap-6 group">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono uppercase font-bold text-[#0B5ED7] dark:text-[#2F80ED] group-hover:text-[#F5C84C] transition-colors tracking-wider block">
                    {selectedHub.role}
                  </span>
                  <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white mt-1 group-hover:text-[#F5C84C] transition-colors">
                    {selectedHub.name}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#071A33] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-[#0B5ED7] dark:text-[#2F80ED] shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071A33] border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-[#0B5ED7] dark:text-[#2F80ED] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 dark:text-white font-mono text-[11px] uppercase">Facility Address:</strong>
                  <span>{selectedHub.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071A33] border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono uppercase mb-1">
                    <Truck className="w-3.5 h-3.5 text-[#0B5ED7] dark:text-[#2F80ED]" />
                    <span>Stationed Fleet</span>
                  </div>
                  <span className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white block">
                    {selectedHub.activeFleet}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071A33] border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono uppercase mb-1">
                    <Warehouse className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Facility Footprint</span>
                  </div>
                  <span className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white block">
                    {selectedHub.warehouseCapacity}
                  </span>
                </div>
              </div>

              <div>
                <strong className="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Core Specialization &amp; Operational Capabilities:
                </strong>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#071A33] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  {selectedHub.specialization}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-[#0B5ED7] dark:text-[#2F80ED]" />
                  +977-057-520000
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Mail className="w-3.5 h-3.5 text-[#0B5ED7] dark:text-[#2F80ED]" />
                  thebcargo@gmail.com
                </span>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold uppercase self-start sm:self-auto">
                Open Daily
              </span>
            </div>
          </div>

          {/* Right: Interactive Geographic Map Canvas */}
          <div className="lg:col-span-6 bg-[#060919] rounded-2xl border border-white/10 p-6 shadow-xl flex flex-col justify-between text-white relative overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FFD600] uppercase">
                <Navigation className="w-4 h-4 text-[#FFD600]" />
                <span>Nepal Delivery Hubs &amp; Network</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Live Active Node Beacon</span>
            </div>

            {/* Interactive Vector Map of Nepal */}
            <div className="relative w-full h-[280px] sm:h-[340px] my-4 flex items-center justify-center">
              <svg 
                viewBox="0 0 500 280" 
                className="w-full h-full drop-shadow-lg"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
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
                  fill="#0E1638"
                  stroke="#1A56DB"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />

                {/* Major Corridors Arterial Lines */}
                {/* Birgunj -> Hetauda -> Kathmandu corridor */}
                <path
                  d="M 255 195 L 245 155 L 265 130"
                  stroke="#FFD600"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Hetauda -> Pokhara corridor */}
                <path
                  d="M 245 155 L 180 125"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Kathmandu -> Tatopani northern pass */}
                <path
                  d="M 265 130 L 295 95"
                  stroke="#FF4444"
                  strokeWidth="2.5"
                  strokeDasharray="3 3"
                />
                {/* Birgunj to Kolkata Port projection */}
                <path
                  d="M 255 195 L 275 260"
                  stroke="#1A56DB"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                />

                {/* Regional Node Pins */}
                {/* 1. Hetauda HQ */}
                <g 
                  onClick={() => setSelectedHubId('hetauda')} 
                  className="cursor-pointer group"
                  transform="translate(245, 155)"
                >
                  <circle cx="0" cy="0" r="14" fill="#0B5ED7" fillOpacity="0.2" className="animate-ping" />
                  <circle cx="0" cy="0" r="8" fill={selectedHubId === 'hetauda' ? '#FFD600' : '#0B5ED7'} stroke="#FFFFFF" strokeWidth="2" />
                  <text x="12" y="4" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="system-ui">
                    Hetauda HQ
                  </text>
                </g>

                {/* 2. Birgunj ICD */}
                <g 
                  onClick={() => setSelectedHubId('birgunj')} 
                  className="cursor-pointer"
                  transform="translate(255, 195)"
                >
                  <circle cx="0" cy="0" r="7" fill={selectedHubId === 'birgunj' ? '#FFD600' : '#1A56DB'} stroke="#FFFFFF" strokeWidth="2" />
                  <text x="12" y="4" fill="#bac7e1" fontSize="9" fontWeight="600" fontFamily="system-ui">
                    Birgunj ICD
                  </text>
                </g>

                {/* 3. Kathmandu TIA */}
                <g 
                  onClick={() => setSelectedHubId('kathmandu')} 
                  className="cursor-pointer"
                  transform="translate(265, 130)"
                >
                  <circle cx="0" cy="0" r="7" fill={selectedHubId === 'kathmandu' ? '#FFD600' : '#1A56DB'} stroke="#FFFFFF" strokeWidth="2" />
                  <text x="12" y="-5" fill="#bac7e1" fontSize="9" fontWeight="600" fontFamily="system-ui">
                    Kathmandu TIA
                  </text>
                </g>

                {/* 4. Pokhara */}
                <g 
                  onClick={() => setSelectedHubId('pokhara')} 
                  className="cursor-pointer"
                  transform="translate(180, 125)"
                >
                  <circle cx="0" cy="0" r="6" fill={selectedHubId === 'pokhara' ? '#FFD600' : '#1A56DB'} stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x="-48" y="-5" fill="#bac7e1" fontSize="9" fontWeight="600" fontFamily="system-ui">
                    Pokhara Hub
                  </text>
                </g>

                {/* 5. Tatopani / Kerung */}
                <g 
                  onClick={() => setSelectedHubId('tatopani')} 
                  className="cursor-pointer"
                  transform="translate(295, 95)"
                >
                  <circle cx="0" cy="0" r="6" fill={selectedHubId === 'tatopani' ? '#FFD600' : '#FF4444'} stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x="10" y="3" fill="#FF8888" fontSize="8" fontWeight="600" fontFamily="system-ui">
                    Tatopani Pass
                  </text>
                </g>
              </svg>
            </div>

            {/* Map Footer Note */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FFD600]" />
                Selected: {selectedHub.shortName}
              </span>
              <span>Coordinates: 27.428°N, 85.032°E</span>
            </div>
          </div>

        </div>

        {/* Corridor Benchmarks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {CORRIDOR_BENCHMARKS.map((bench, idx) => (
            <div key={idx} className="group p-5 rounded-xl bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#F5C84C] transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0B5ED7] dark:text-[#2F80ED] group-hover:text-[#F5C84C] transition-colors block">
                  {bench.highlight}
                </span>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white mt-1 group-hover:text-[#F5C84C] transition-colors">
                  {bench.corridor}
                </h4>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#0B5ED7] dark:text-[#2F80ED]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{bench.time}</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  {bench.mode}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
