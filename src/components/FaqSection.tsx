import { PICKUP_POLICY_EN, PICKUP_AREAS, FREE_PICKUP_AREAS } from '../features/estimator/pickup';
import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  PhoneCall 
} from 'lucide-react';
import { Cta3D } from './ui/Cta3D';
import { Spotlight } from './ui/spotlight';


export interface FaqItem {
  id?: string;
  category?: string;
  question: string;
  answer: string;
}

export const DEFAULT_FAQS: FaqItem[] = [
  {
    question: 'How do I track my package?',
    answer: 'When you send a package with The BC Cargo, you get a tracking number (like BC-90214-HKG). Type your number into the search bar at the top of our website or on the Track Package page to see where your box is right now, step by step.'
  },
  {
    question: 'What documents do I need to send items outside Nepal?',
    answer: 'To send personal gifts or items abroad, you only need your ID, a list of what is inside the box, and the receiver’s address. For businesses sending goods for sale, our customs team will help you prepare and file all required paperwork quickly.'
  },
  {
    question: 'How is box size and weight calculated?',
    answer: 'We check two things: how heavy the box is on the scale, and how much space it takes up. If a box is very light but very big (like pillows), pricing is based on its size. If it is small and heavy, pricing is based on scale weight. Our online calculator does this automatically for you.'
  },
  {
    question: 'Can you pick up my package from my home or office in Nepal?',
    answer: `Yes. ${PICKUP_POLICY_EN} We also collect from ${PICKUP_AREAS.slice(FREE_PICKUP_AREAS.length).join(', ')}. Or drop your parcel at our office on School Road -4, Hetauda.`
  },
  {
    question: 'How long does delivery take to other countries?',
    answer: 'Fast air delivery to Europe, North America, the Middle East, and Asia usually takes 2 to 5 business days. Larger sea shipments take about 18 to 28 days. You can track your package every step of the way.'
  },
  {
    question: 'Can you handle delicate, fresh, or high-value items?',
    answer: 'Yes. We take extra care with fragile items, Nepali orthodox tea, herbs, and important packages. Everything is packed securely and handled with strict safety standards.'
  }
];

interface FaqSectionProps {
  faqs?: FaqItem[];
  title?: string;
  subtitle?: string;
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  faqs = DEFAULT_FAQS,
  title = "Frequently Asked Questions",
  subtitle = "Simple answers to common questions about sending packages, delivery times, and tracking."
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto transition-colors">
      <div className="flex flex-col gap-10">
        
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-ox-900 text-xs font-bold uppercase tracking-wider font-mono">
            <HelpCircle className="w-4 h-4" />
            <span>Support &amp; FAQ</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl">
            {subtitle}
          </p>
        </div>

        {/* Accordion List */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Spotlight
                key={faq.id || idx}
                intensity="subtle"
                className="interactive-card bg-[var(--surface)] rounded-[var(--r-md)] border border-[var(--line)] shadow-hard-xs overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full min-h-[48px] py-3.5 px-4 sm:px-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gd-500"
                  aria-expanded={isOpen}
                >
                  <span className="font-heading font-semibold text-sm sm:text-base text-slate-900 group-hover:text-ox-900 transition-colors">
                    {faq.question}
                  </span>
                  <div className={`p-1.5 rounded-lg bg-slate-100 text-slate-500 shrink-0 transition-all duration-300 ease-out ${isOpen ? 'rotate-180 bg-ox-900 text-white' : 'group-hover:bg-slate-200'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-[var(--line)] pt-3 bg-slate-50/50 animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </Spotlight>
            );
          })}
        </div>

        {/* Support Callout Box */}
        <Spotlight
          intensity="normal"
          className="p-6 rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-hard-sm"
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-11 h-11 rounded-[var(--r-sm)] bg-ox-900/10 text-ox-900 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900">
                Have a question or need help sending a package?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Call us Sunday to Friday, 9 am to 6 pm, or chat with us any time.
              </p>
            </div>
          </div>

          <Cta3D href="tel:+977057591816" icon={<PhoneCall aria-hidden="true" />}>
            Call 057-591816
          </Cta3D>
        </Spotlight>

      </div>
    </section>
  );
};
