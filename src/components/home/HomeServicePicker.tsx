import React from 'react';
import { Plane, Truck, PackageCheck, ShieldCheck, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Card3D } from '../../design/primitives/Card3D';

interface HomeServicePickerProps {
  onNavigate: (page: string) => void;
}

interface ServiceItem {
  id: string;
  slug: string;
  code: string;
  name: string;
  scope: 'International' | 'Regulatory';
  leadTime: string;
  description: string;
  highlight: string;
  specs: string[];
}

const SERVICES: ServiceItem[] = [
  {
    id: 'svc-air',
    slug: 'international-air-freight',
    code: '',
    name: 'Air cargo',
    scope: 'International',
    leadTime: '2–4 days',
    description: 'Our fastest option. Flights leave Kathmandu airport for cities all over the world.',
    highlight: 'Best for urgent parcels and documents.',
    specs: ['Daily departures', 'Safe handling for fragile items'],
  },
  {
    id: 'svc-surface',
    slug: 'cross-border-overland',
    code: '',
    name: 'Road cargo',
    scope: 'International',
    leadTime: '2–4 days',
    description: 'Trucks carry your goods from Hetauda and Kathmandu to India and onward.',
    highlight: 'Best for large and heavy loads.',
    specs: ['Full or shared trucks', 'Vehicles tracked by GPS'],
  },
  {
    id: 'svc-ocean',
    slug: 'ocean-freight-intermodal',
    code: '',
    name: 'Sea cargo',
    scope: 'International',
    leadTime: '18–35 days',
    description: 'Containers travel by rail to the Indian ports, then by ship to your country.',
    highlight: 'Lowest cost for big shipments that can wait.',
    specs: ['Full or shared containers', 'Ships to most countries'],
  },
  {
    id: 'svc-customs',
    slug: 'customs-brokerage-clearance',
    code: '',
    name: 'Customs help',
    scope: 'Regulatory',
    leadTime: '1–2 days',
    description: 'Our licensed agents prepare the papers and clear your goods through Nepal customs.',
    highlight: 'No paperwork stress. We do it for you.',
    specs: ['Invoice and document check', 'Licensed customs agents'],
  },
];

export const HomeServicePicker: React.FC<HomeServicePickerProps> = ({ onNavigate }) => {
  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col gap-3 max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 self-start px-2.5 py-1 bg-[var(--surface-muted)] border border-[var(--line)] rounded-[var(--r-xs)] shadow-hard-xs">
            <span className="text-sm font-semibold text-[var(--gold-dark)]">
              Our services
            </span>
          </div>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[var(--text)] tracking-tight leading-tight">
            Choose how you want to ship
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            Air, road, sea, or customs help. Pick what fits your parcel.
          </p>
        </div>

        <button
          onClick={() => onNavigate('services')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--gold-dark)] hover:underline self-start md:self-end"
        >
          <span>All services</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Asymmetric 4-Card Service Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SERVICES.map((svc) => (
          <Card3D
            key={svc.id}
            maxTilt={2.5}
            className="group relative p-6 sm:p-7 bg-[var(--surface)] border border-[var(--line)] hover:border-[#F2B705] rounded-[var(--r-md)] transition-all duration-[var(--t-normal)] flex flex-col justify-between shadow-hard hover:shadow-[0_8px_24px_-4px_rgba(242,183,5,0.22)]"
          >
            <div>
              {/* Service Title & Lead Time */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-heading font-bold text-xl text-[var(--text)] group-hover:text-[var(--gold-dark)] transition-colors">
                  {svc.name}
                </h3>
                <span className="text-xs font-semibold px-2 py-1 bg-[var(--surface-muted)] border border-[var(--line)] rounded-[var(--r-xs)] text-[var(--text-muted)] shrink-0 shadow-hard-xs whitespace-nowrap">
                  {svc.leadTime}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                {svc.description}
              </p>

              {/* Operational highlight banner */}
              <div className="p-3 bg-[var(--surface-subtle,#FAFAF8)] border-l-4 border-[var(--gold)] rounded-r-[var(--r-xs)] shadow-hard-xs text-sm text-[var(--text)] font-sans mb-5">
                {svc.highlight}
              </div>

              {/* Specs bullet list */}
              <ul className="space-y-1.5 mb-6 text-sm text-[var(--text-muted)]">
                {svc.specs.map((spec, sIdx) => (
                  <li key={sIdx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[var(--line-strong)] rounded-full shrink-0" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Action */}
            <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onNavigate('book')}
                className="inline-flex items-center gap-1.5 leading-none text-sm font-bold text-[var(--oxford-deep)] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className="whitespace-nowrap">Book</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate(`rates?mode=${svc.slug}`)}
                className="inline-flex items-center gap-1.5 leading-none text-sm font-semibold text-[var(--text-muted)] hover:text-[#002147] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Price</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </Card3D>
        ))}
      </div>
    </section>
  );
};
