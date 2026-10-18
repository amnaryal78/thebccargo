import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MessageSquare, Phone } from 'lucide-react';

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
      className="relative isolate overflow-hidden rounded-t-[28px] bg-gradient-to-br from-[#002147] to-[#00152D] text-white px-4 sm:px-8 py-14 sm:py-20"
    >
      {/* route line arriving from the guide above */}
      <svg aria-hidden="true" viewBox="0 0 800 160" preserveAspectRatio="none" className="absolute inset-x-0 top-0 w-full h-24 sm:h-32 -z-10 opacity-60">
        <motion.path
          d="M-10 10 C 180 10, 260 130, 420 90 S 700 20, 810 110"
          fill="none"
          stroke="#F2B705"
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
            <span lang="ne" className="block mt-1 text-[#FAC623] font-bold text-2xl sm:text-3xl">
              {titleNp}
            </span>
          )}
        </h2>
        <div className="space-y-1.5 max-w-xl">
          <p className="text-base sm:text-lg text-slate-100 leading-relaxed">{textEn}</p>
          {textNp && (
            <p lang="ne" className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {textNp}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto pt-2">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[52px] px-7 rounded-xl bg-[#F2B705] hover:bg-[#FAC623] text-[#002147] font-heading font-extrabold text-base inline-flex items-center justify-center gap-2.5 leading-none shadow-[0_4px_0_#7a5a00] active:translate-y-1 active:shadow-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#002147]"
          >
            <MessageSquare className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>Message us on WhatsApp</span>
          </a>
          <a
            href={phoneHref}
            className="min-h-[52px] px-6 rounded-xl border border-white/40 hover:bg-white/10 text-white font-heading font-bold text-base inline-flex items-center justify-center gap-2.5 leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#002147]"
          >
            <Phone className="w-5 h-5 shrink-0 text-[#F2B705]" aria-hidden="true" />
            <span>{phoneLabel}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
