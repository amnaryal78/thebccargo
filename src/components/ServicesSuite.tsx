import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { ArrowRight, FileCheck2, MessageSquare, PackageCheck, Search } from 'lucide-react';
import { SERVICES_CATALOG } from '../services/servicesData';
import { SEOHead } from './SEOHead';
import { Button } from '../design/primitives/Button';
import { ServicesHero } from './services/ServicesHero';
import { ServiceCard } from './services/ServiceCard';
import { ServiceCompare } from './services/ServiceCompare';
import { PAGE_META } from '../data/pageMeta';

type Filter = 'all' | 'air' | 'overland' | 'ocean' | 'customs';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'air', label: 'Air' },
  { id: 'overland', label: 'Road' },
  { id: 'ocean', label: 'Sea' },
  { id: 'customs', label: 'Customs' },
];

const STEPS = [
  { Icon: PackageCheck, title: 'Book', text: 'Choose a service and book a pickup or drop-off.' },
  { Icon: FileCheck2, title: 'We handle the papers', text: 'We prepare the export papers and pass your cargo through customs.' },
  { Icon: Search, title: 'Track it', text: 'Use your tracking number to see where your cargo is.' },
];

const HowItMoves: React.FC = () => {
  const reduce = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 55%'] });
  const grow = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <section aria-labelledby="how-title" className="space-y-6">
      <h2 id="how-title" className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-[#002147]">
        How it works
      </h2>
      <div ref={ref} className="relative">
        {/* route line that fills as you scroll (left on phones, across on wide screens) */}
        <div aria-hidden="true" className="absolute left-5 top-0 bottom-0 w-[3px] md:left-0 md:right-0 md:top-5 md:bottom-auto md:h-[3px] md:w-auto rounded-full bg-[#002147]/10" />
        <motion.div
          aria-hidden="true"
          style={reduce ? undefined : { scaleY: grow }}
          className="absolute left-5 top-0 bottom-0 w-[3px] origin-top rounded-full bg-[#F2B705] md:hidden"
        />
        <motion.div
          aria-hidden="true"
          style={reduce ? undefined : { scaleX: grow }}
          className="hidden md:block absolute left-0 right-0 top-5 h-[3px] origin-left rounded-full bg-[#F2B705]"
        />
        <ol className="relative grid grid-cols-1 md:grid-cols-3 gap-6 list-none p-0 m-0">
          {STEPS.map(({ Icon, title, text }, i) => (
            <li key={title} className="relative pl-14 md:pl-0 md:pt-14">
              <span className="absolute left-0 top-0 md:left-0 w-10 h-10 rounded-full bg-[#002147] text-[#F2B705] flex items-center justify-center ring-4 ring-[var(--bg,#F6F6F4)]">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold text-[#8C6400]">Step {i + 1}</p>
              <h3 className="font-heading font-bold text-lg text-[#002147]">{title}</h3>
              <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed mt-1 max-w-sm">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export const ServicesSuite: React.FC = () => {
  const [filter, setFilter] = useState<Filter>('all');
  const shown = SERVICES_CATALOG.filter((s) => filter === 'all' || s.mode === filter);

  return (
    <div className="w-full bg-[var(--bg,#F6F6F4)] text-[var(--text,#121211)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title={PAGE_META['/services'].title}
        description={PAGE_META['/services'].description}
      />

      <div className="max-w-7xl mx-auto space-y-14 sm:space-y-20">
        <ServicesHero services={SERVICES_CATALOG} />

        {/* Services */}
        <section aria-labelledby="all-services" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h2 id="all-services" className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-[#002147]">
              Our services
            </h2>
            <div role="group" aria-label="Filter services" className="flex flex-wrap gap-2">
              {FILTERS.map((f) => {
                const on = filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setFilter(f.id)}
                    className={`min-h-[44px] px-4 rounded-full border text-sm font-semibold leading-none cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] focus-visible:ring-offset-2 ${
                      on
                        ? 'bg-[#002147] text-white border-[#002147]'
                        : 'bg-white text-[#002147] border-[#B9C6D8] hover:border-[#002147]'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 list-none p-0 m-0 items-stretch" aria-live="polite">
            {shown.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </ul>
        </section>

        <ServiceCompare services={SERVICES_CATALOG} />

        <HowItMoves />

        {/* Closing actions */}
        <section
          aria-labelledby="services-cta"
          className="rounded-[var(--r-lg)] bg-[#002147] text-white px-6 sm:px-10 py-10 sm:py-12 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="space-y-2 max-w-xl">
            <h2 id="services-cta" className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight">
              Not sure which service you need?
            </h2>
            <p className="text-base text-slate-200 leading-relaxed">Check the price, or message us and we will help you choose.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/rates">
              <Button variant="primary" size="lg" magnetic rightIcon={<ArrowRight className="w-4 h-4" />}>
                Price
              </Button>
            </Link>
            <a href="https://wa.me/9779855019485" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" leftIcon={<MessageSquare className="w-4 h-4" />} className="!text-white !border-white/40 hover:!bg-white/10">
                WhatsApp
              </Button>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};
