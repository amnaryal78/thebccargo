import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Card3D } from '../../design/primitives/Card3D';
import { Button } from '../../design/primitives/Button';
import { LimitedText } from '../about/LimitedText';
import { ServiceIllustration } from './ServiceIllustration';
import type { ServiceDetail } from '../../services/servicesData';

const MODE_LABEL: Record<ServiceDetail['mode'], string> = {
  air: 'Air',
  overland: 'Road',
  ocean: 'Sea',
  customs: 'Customs',
};

export const ServiceCard: React.FC<{ service: ServiceDetail; index: number }> = ({ service, index }) => {
  const reduce = !!useReducedMotion();

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.5, delay: Math.min(index, 3) * 0.07, ease: [0.2, 0.8, 0.2, 1] }}
      className="list-none h-full"
    >
      <Card3D
        maxTilt={2}
        disabled={reduce}
        spotlightIntensity="subtle"
        className="group h-full overflow-hidden rounded-[var(--r-md)] border border-[var(--line)] bg-white shadow-hard-sm hover:shadow-hard-md hover:border-[#002147]/40 transition-[box-shadow,border-color] duration-200"
      >
        <article className="flex flex-col h-full" aria-labelledby={`svc-${service.id}`}>
          <div className="relative h-28 border-b border-[var(--line)]">
            <ServiceIllustration mode={service.mode} />
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 border border-[var(--line)] text-xs font-bold text-[#002147] leading-none">
              {MODE_LABEL[service.mode]}
            </span>
          </div>

          <div className="flex flex-col gap-4 p-5 sm:p-6 flex-1">
            <div className="space-y-2">
              <h3 id={`svc-${service.id}`} className="font-heading font-extrabold text-xl leading-snug text-[#002147]">
                {service.title}
              </h3>
              <p className="inline-flex items-start gap-1.5 text-sm font-semibold text-[#8C6400] leading-snug">
                <Clock className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span className="min-w-0 break-words">{service.sla}</span>
              </p>
            </div>

            <LimitedText text={service.description} lines={3} />

            <ul className="space-y-2 list-none p-0 m-0 pt-1 border-t border-[var(--line)]">
              {service.highlights.slice(0, 3).map((hl, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)] pt-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-[#15803D]" aria-hidden="true" />
                  <span className="min-w-0">{hl}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-3">
              <Link
                to={`/services/${service.slug}`}
                className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-bold text-[#002147] hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] rounded"
              >
                <span>Full details and FAQs</span>
                <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <Link to={`/book?mode=${service.mode}`}>
                <Button variant="primary" size="sm">
                  Book
                </Button>
              </Link>
            </div>
          </div>
        </article>
      </Card3D>
    </motion.li>
  );
};
