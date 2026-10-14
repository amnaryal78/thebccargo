import React, { useState } from 'react';
import { 
  Plane, 
  Ship, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  X,
  Box,
  Layers,
  FileCheck2,
  PackageCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ServiceItem {
  id: string;
  category: 'national' | 'international';
  title: string;
  tag: string;
  desc: string;
  sla: string;
  icon: React.ReactNode;
  highlights: string[];
  details: {
    equipment: string;
    corridors: string;
    compliance: string;
    capabilities: string;
  };
}

export const ServicesSuite: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'all' | 'national' | 'international'>('all');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const services: ServiceItem[] = [
    {
      id: 'air-intl',
      category: 'international',
      title: 'Fast International Air Delivery',
      tag: 'Daily Flights Worldwide',
      desc: 'Fast delivery by air from Kathmandu to destinations across the globe. Ideal for packages, documents, urgent items, and commercial goods.',
      sla: '2 to 5 Days Worldwide',
      icon: <Plane className="w-6 h-6" />,
      highlights: [
        'Direct flights to Frankfurt, Dubai, Bangkok & Hong Kong',
        'Secure storage at Kathmandu airport cargo terminal',
        'Special handling for tea, handicrafts, garments & electronics',
        'Full tracking from pickup to international delivery'
      ],
      details: {
        equipment: 'Modern commercial cargo and passenger aircraft with secured cargo holds',
        corridors: 'Kathmandu (KTM) ➔ Frankfurt, Dubai, Bangkok, Hong Kong, USA, UK, Australia',
        compliance: 'IATA Cargo Agent Regd, Civil Aviation Authority of Nepal (CAAN) Escort License',
        capabilities: 'Handicrafts, garments, tea, electronics, documents, personal parcels.'
      }
    },
    {
      id: 'ocean-intl',
      category: 'international',
      title: 'International Sea Delivery',
      tag: 'Best for Large & Heavy Shipments',
      desc: 'Cost-effective sea transport from Nepal to seaports around the world. Ideal for bulk goods, large boxes, and full containers.',
      sla: '2 to 4 Weeks Delivery',
      icon: <Ship className="w-6 h-6" />,
      highlights: [
        'Both small shared boxes (LCL) and full containers (FCL)',
        'Direct train connection from Birgunj to Kolkata and Visakhapatnam ports',
        'Electronic GPS tracking across all rail and sea legs',
        'Affordable rates for heavy cargo and commercial exports'
      ],
      details: {
        equipment: 'Standard 20ft and 40ft shipping containers, temperature-controlled reefer boxes',
        corridors: 'Birgunj Dry Port Rail Yard ➔ Kolkata / Visakhapatnam Seaports ➔ Global Seaports',
        compliance: 'CONCOR India transit agreements, International Maritime Dangerous Goods (IMDG)',
        capabilities: 'Industrial goods, handicrafts, raw materials, agricultural products, export orders.'
      }
    },
    {
      id: 'road-intl',
      category: 'international',
      title: 'Cross-Border Road Delivery',
      tag: 'Nepal, India & China Routes',
      desc: 'Reliable truck transport connecting Nepal with India and border gateways. Tracked with satellite GPS from pickup to delivery.',
      sla: '2 to 3 Days Regional Delivery',
      icon: <Truck className="w-6 h-6" />,
      highlights: [
        'Direct truck delivery between Hetauda, Delhi NCR, and Kolkata',
        'Northern border crossings via Kerung and Tatopani into China',
        'Modern fleet of GPS-monitored trucks and container carriers',
        'Safe border crossing and clearance support included'
      ],
      details: {
        equipment: 'Covered container trucks, multi-axle cargo trailers, low-bed heavy equipment trucks',
        corridors: 'Hetauda / Birgunj / Kathmandu ➔ Raxaul, Kanpur, Delhi, Patna, Kolkata, Lhasa',
        compliance: 'Nepal-India Transit Treaty Authorized Carrier, Bilateral Motor Vehicle Protocol',
        capabilities: 'Commercial goods, machinery, parts, raw materials, trade consignments.'
      }
    },
    {
      id: 'customs-intl',
      category: 'international',
      title: 'Customs & Clearance Support',
      tag: 'Govt. License #B-409',
      desc: 'Our licensed in-house team handles all customs paperwork, permits, and declarations so your items clear border checks without delays.',
      sla: 'Fast Border Clearance',
      icon: <ShieldCheck className="w-6 h-6" />,
      highlights: [
        'Direct online filing with the Department of Customs Nepal',
        'On-site customs desks at Birgunj Dry Port, Kathmandu Airport, and Mechi',
        'Complete paperwork: Certificates of Origin, export documents & permits',
        'Safe bonded storage in Hetauda HQ'
      ],
      details: {
        equipment: 'Direct customs computer terminals, bonded warehouse storage, certified scales',
        corridors: 'Birgunj ICP, Sirsiya Dry Port, TIA Air Cargo Building, Tatopani Customs, Mechi ICP',
        compliance: 'Nepal Customs Broker License #B-409, NEFFA Registered Forwarder',
        capabilities: 'Zero-delay border clearance, duty calculations, trade certificates, import/export papers.'
      }
    },
    {
      id: 'courier-nat',
      category: 'national',
      title: 'Fast Delivery Across Nepal',
      tag: 'Doorstep Pickup & Delivery',
      desc: 'Send parcels, documents, and gifts quickly between Kathmandu, Hetauda, Pokhara, Biratnagar, and major cities across Nepal.',
      sla: '1 to 2 Days Across Nepal',
      icon: <Box className="w-6 h-6" />,
      highlights: [
        'Door-to-door pickup and delivery in all major towns',
        'Central sorting hub in Hetauda for fast regional dispatch',
        'Live tracking and SMS delivery updates',
        'Careful handling and strong protective packaging provided'
      ],
      details: {
        equipment: 'Delivery vans, light cargo trucks, city motorcycle courier fleet',
        corridors: 'Kathmandu, Pokhara, Chitwan, Biratnagar, Butwal, Nepalgunj, Dhangadhi, Hetauda',
        compliance: 'Nepal Postal Authority Registered Operator, Goods in Transit Insured',
        capabilities: 'Documents, business samples, electronics, gift packages, online shopping orders.'
      }
    },
    {
      id: 'haulage-nat',
      category: 'national',
      title: 'Truck Delivery for Heavy Items',
      tag: 'Daily Highway Routes',
      desc: 'Dedicated truck transport for heavy boxes, commercial goods, and factory supplies along Nepal\'s main highway corridors.',
      sla: 'Daily Scheduled Departures',
      icon: <Layers className="w-6 h-6" />,
      highlights: [
        'Daily departures connecting Hetauda HQ to Tarai and Hill regions',
        'Spacious cargo loading at Hetauda Industrial District hub',
        'Options for full truckloads or shared box shipments',
        'Friendly support and corporate delivery accounts available'
      ],
      details: {
        equipment: '10-ton to 25-ton covered container trucks and open flatbed trailers',
        corridors: 'Mahendra Highway, Tribhuvan Highway, Prithvi Highway corridors',
        compliance: 'Department of Transport Management certified fleet, comprehensive cargo insurance',
        capabilities: 'Commercial goods, construction materials, wholesale merchandise, packaged food.'
      }
    }
  ];

  const filteredServices = services.filter(s => {
    if (activeFilter === 'all') return true;
    return s.category === activeFilter;
  });

  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors">
      <div className="flex flex-col gap-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B5ED7] dark:text-[#2F80ED] font-mono">
              Our Services
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
              Simple &amp; Reliable Delivery Services
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Whether you need fast delivery by air across the world, truck delivery for heavy items, or local package pickup in Nepal, we take care of it for you.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#0B5ED7] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              All Services ({services.length})
            </button>
            <button
              onClick={() => setActiveFilter('national')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeFilter === 'national'
                  ? 'bg-[#0B5ED7] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Inside Nepal ({services.filter(s => s.category === 'national').length})
            </button>
            <button
              onClick={() => setActiveFilter('international')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeFilter === 'international'
                  ? 'bg-[#0B5ED7] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Worldwide ({services.filter(s => s.category === 'international').length})
            </button>
          </div>
        </div>

        {/* Services Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white dark:bg-[#0B2445] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#D97706] dark:hover:border-[#F5C84C] hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:bg-[#D97706]/15 dark:group-hover:bg-[#F5C84C]/15 group-hover:text-[#D97706] dark:group-hover:text-[#F5C84C] transition-all duration-300 flex items-center justify-center">
                    {service.icon}
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    service.category === 'national'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-blue-100 dark:bg-blue-950 text-[#0B5ED7] dark:text-blue-300'
                  }`}>
                    {service.category === 'national' ? 'Inside Nepal' : 'Worldwide'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0B5ED7] dark:text-[#2F80ED] group-hover:text-[#D97706] dark:group-hover:text-[#F5C84C] transition-colors block">
                    {service.tag}
                  </span>
                  <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white mt-1 group-hover:text-[#D97706] dark:group-hover:text-[#F5C84C] transition-colors">
                    {service.title}
                  </h3>
                  <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                    Speed: {service.sla}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {service.desc}
                </p>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  {service.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedService(service)}
                  className="text-xs font-semibold uppercase tracking-wider text-[#0B5ED7] dark:text-[#2F80ED] hover:text-[#D97706] dark:hover:text-[#F5C84C] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => navigate('/book')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-[#D97706] dark:hover:bg-[#F5C84C] hover:text-white dark:hover:text-slate-950 text-slate-700 dark:text-slate-200 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Send a Package
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Technical Specs Modal Dialog */}
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white dark:bg-[#0B2445] rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B5ED7] flex items-center justify-center text-white">
                    {selectedService.icon}
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-base sm:text-lg">{selectedService.title}</h4>
                    <span className="text-xs text-slate-300 font-mono">{selectedService.tag}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs text-slate-700 dark:text-slate-300">
                <div>
                  <strong className="block text-slate-900 dark:text-white text-xs font-mono uppercase mb-1">How It Moves:</strong>
                  <p className="bg-slate-50 dark:bg-[#071A33] p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] leading-relaxed">
                    {selectedService.details.equipment}
                  </p>
                </div>

                <div>
                  <strong className="block text-slate-900 dark:text-white text-xs font-mono uppercase mb-1">Main Routes:</strong>
                  <p className="bg-slate-50 dark:bg-[#071A33] p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] leading-relaxed">
                    {selectedService.details.corridors}
                  </p>
                </div>

                <div>
                  <strong className="block text-slate-900 dark:text-white text-xs font-mono uppercase mb-1">Official Licenses:</strong>
                  <p className="bg-slate-50 dark:bg-[#071A33] p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] leading-relaxed">
                    {selectedService.details.compliance}
                  </p>
                </div>

                <div>
                  <strong className="block text-slate-900 dark:text-white text-xs font-mono uppercase mb-1">What You Can Send:</strong>
                  <p className="bg-slate-50 dark:bg-[#071A33] p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] leading-relaxed">
                    {selectedService.details.capabilities}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-[#071A33] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setSelectedService(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase cursor-pointer"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    setSelectedService(null);
                    navigate('/book');
                  }}
                  className="px-5 py-2 rounded-lg bg-[#0B5ED7] hover:bg-[#084298] text-white font-semibold text-xs uppercase tracking-wider cursor-pointer shadow-sm"
                >
                  Send a Package
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
