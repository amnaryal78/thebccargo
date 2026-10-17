import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { Button } from '../../design/primitives/Button';
import type { ServiceDetail } from '../../services/servicesData';
import { CargoJourney } from './CargoJourney';

const MODE_NAME: Record<ServiceDetail['mode'], string> = { air: 'Air', overland: 'Road', ocean: 'Sea', customs: 'Customs' };

/** "2 to 5 Days Door-to-Door Worldwide" becomes "2 to 5 Days". */
const shortTime = (sla: string): string => sla.match(/^\d+\s*(?:to|-|–)?\s*\d*\s*(?:Days|Hours)/i)?.[0] ?? sla;

export const ServicesHero: React.FC<{ services: ServiceDetail[] }> = ({ services }) => {
  const reduce = !!useReducedMotion();

  return (
    <section aria-labelledby="services-title" className="relative isolate overflow-hidden rounded-[var(--r-lg)] bg-white border border-[var(--line)] shadow-hard-sm">
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6 lg:gap-10 items-center p-6 sm:p-10">
        <div className="flex flex-col gap-5 min-w-0">
          <p className="text-sm font-semibold text-[#8C6400]">International freight from Nepal</p>
          <motion.h1
            id="services-title"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="font-heading font-extrabold text-4xl sm:text-5xl tracking-tight leading-[1.1] text-[#002147]"
          >
            Services and freight solutions
          </motion.h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.2, 0.8, 0.2, 1] }}
            className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl"
          >
            Air, road, sea and customs help, all from our head office in Hetauda. Pick the way that fits your cargo, or compare two side by side.
          </motion.p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link to="/rates">
              <Button variant="primary" size="lg" magnetic rightIcon={<ArrowRight className="w-4 h-4" />}>
                Price
              </Button>
            </Link>
            <a href="#compare">
              <Button variant="outline" size="lg">
                Compare services
              </Button>
            </a>
          </div>

          {/* typical transit, straight from the service data */}
          <ul className="flex flex-wrap gap-2 pt-2 list-none p-0 m-0" aria-label="Typical transit time of each service">
            {services.map((s) => (
              <li
                key={s.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EEF3F9] border border-[#D5DEEA] text-xs font-semibold text-[#002147] leading-none"
              >
                <Clock className="w-3.5 h-3.5 shrink-0 text-[#8C6400]" aria-hidden="true" />
                <span>
                  {MODE_NAME[s.mode]}: {shortTime(s.sla)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full max-w-md mx-auto lg:max-w-none">
          <CargoJourney />
        </div>
      </div>
    </section>
  );
};
