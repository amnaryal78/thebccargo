import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MessageSquare, Phone } from 'lucide-react';
import { Cta3D } from '../ui/Cta3D';

interface ShipContactProps {
  titleEn: string;
  titleNp: string;
  textEn: string;
  textNp: string;
  whatsappHref: string;
  phoneHref: string;
  phoneLabel: string;
}

/** The last stop of the guide: a route line lands in the contact panel. */
export const ShipContact: React.FC<ShipContactProps> = ({ titleEn, titleNp, textEn, textNp, whatsappHref, phoneHref, phoneLabel }) => {
  const reduce = !!useReducedMotion();

  return (
    <section
      aria-labelledby="ship-contact-title"
      className="relative isolate overflow-hidden bg-gradient-to-b from-[#EEF3F9] to-white text-ox-900 px-4 sm:px-8 py-14 sm:py-20 border-t border-[var(--line)]"
    >
      {/* route line arriving from the guide above */}
      <svg aria-hidden="true" viewBox="0 0 800 160" preserveAspectRatio="none" className="absolute inset-x-0 top-0 w-full h-24 sm:h-32 -z-10 opacity-70">
        <motion.path
          d="M-10 10 C 180 10, 260 130, 420 90 S 700 20, 810 110"
          fill="none"
          stroke="#F2B632"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="2 10"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
        />
      </svg>

      <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-5">
        <h2 id="ship-contact-title" className="font-heading font-black text-3xl sm:text-4xl tracking-tight leading-tight">
          {titleEn}
          {titleNp && (
            <span lang="ne" className="block mt-1 text-[#8A6200] font-bold text-2xl sm:text-3xl">
              {titleNp}
            </span>
          )}
        </h2>
        <div className="space-y-1.5 max-w-xl">
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed">{textEn}</p>
          {textNp && (
            <p lang="ne" className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {textNp}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto pt-2">
          <Cta3D href={whatsappHref} newTab icon={<MessageSquare aria-hidden="true" />}>
            Message us on WhatsApp
          </Cta3D>
          <Cta3D href={phoneHref} tone="light" icon={<Phone aria-hidden="true" />}>
            {phoneLabel}
          </Cta3D>
        </div>
      </div>
    </section>
  );
};
