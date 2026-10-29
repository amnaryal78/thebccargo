import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { ArrowRight, FileCheck2, PackageCheck, Plane, Search, Truck } from 'lucide-react';

interface Stage {
  title: string;
  text: string;
  Icon: React.ElementType;
}

const STAGES: Stage[] = [
  { title: 'We collect', text: 'Bring the parcel to our Hetauda office, or ask for pickup from your home.', Icon: Truck },
  { title: 'Customs and papers', text: 'We prepare the export papers and take your cargo through Nepal customs.', Icon: FileCheck2 },
  { title: 'International dispatch', text: 'Your cargo leaves Nepal with our carrier partners.', Icon: Plane },
  { title: 'Delivery', text: 'It is delivered to the address abroad. Use your tracking number to follow it.', Icon: PackageCheck },
];

export const HowItWorksTimeline: React.FC = () => {
  const reduce = !!useReducedMotion();
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] });
  const grow = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-10 sm:mb-14 border-b border-[var(--line)]">
        <div className="max-w-2xl space-y-2">
          <p className="font-mono text-xs font-bold tracking-[0.14em] text-[var(--gold-dark)]">SHIPPING GUIDE</p>
          <h2 id="how-it-works-heading" className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#002147] tracking-tight leading-tight">
            From Hetauda to your door abroad
          </h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed">Four steps. We handle each one.</p>
        </div>
        <Link
          to="/how-to-ship"
          className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-bold text-[#002147] hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] rounded"
        >
          <span>How to ship</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="relative">
        {/* route line: left on phones, across on wide screens; fills as you scroll */}
        <div aria-hidden="true" className="absolute left-5 top-0 bottom-0 w-[3px] lg:left-5 lg:right-5 lg:top-5 lg:bottom-auto lg:h-[3px] lg:w-auto rounded-full bg-[#002147]/10" />
        <motion.div
          aria-hidden="true"
          style={reduce ? undefined : { scaleY: grow }}
          className="absolute left-5 top-0 bottom-0 w-[3px] origin-top rounded-full bg-[#F2B705] lg:hidden"
        />
        <motion.div
          aria-hidden="true"
          style={reduce ? undefined : { scaleX: grow }}
          className="hidden lg:block absolute left-5 right-5 top-5 h-[3px] origin-left rounded-full bg-[#F2B705]"
        />

        <ol ref={ref} className="relative grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6 list-none p-0 m-0">
          {STAGES.map(({ title, text, Icon }, i) => (
            <li key={title} className="relative pl-16 lg:pl-0 lg:pt-16">
              <span className="absolute left-0 top-0 w-10 h-10 rounded-full bg-[#002147] text-[#F2B705] flex items-center justify-center ring-4 ring-[var(--bg,#F6F6F4)]">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <div className="h-full rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--line)] shadow-hard-xs p-5">
                <p className="text-sm font-semibold text-[#8C6400] pb-2 mb-2 border-b border-[var(--line)]">Step {i + 1}</p>
                <h3 className="font-heading font-bold text-lg text-[#002147] whitespace-nowrap">{title}</h3>
                <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed mt-1">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-10 pt-6 w-full border-t border-[var(--line)] flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <Search className="w-4 h-4 text-[#8C6400]" aria-hidden="true" />
        <span>Have a tracking number? Enter it at the top of this page.</span>
      </p>
    </section>
  );
};
