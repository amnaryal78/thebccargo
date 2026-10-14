import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  PhoneCall 
} from 'lucide-react';

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
    answer: 'To send personal gifts or items abroad, you only need your ID, a list of what is inside the box, and the receiver’s address. For businesses sending goods for sale, our licensed customs brokers (License #B-409) will help you prepare and file all required paperwork quickly.'
  },
  {
    question: 'How is box size and weight calculated?',
    answer: 'We check two things: how heavy the box is on the scale, and how much space it takes up. If a box is very light but very big (like pillows), pricing is based on its size. If it is small and heavy, pricing is based on scale weight. Our online calculator does this automatically for you.'
  },
  {
    question: 'Can you pick up my package from my home or office?',
    answer: 'Yes! We pick up packages across Nepal, including Hetauda, Kathmandu, Birgunj, Pokhara, Chitwan, Butwal, Biratnagar, and many other cities. Just give us your address when booking or call our nearest office.'
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
          <div className="flex items-center gap-2 text-[#0B5ED7] dark:text-[#2F80ED] text-xs font-bold uppercase tracking-wider font-mono">
            <HelpCircle className="w-4 h-4" />
            <span>Support &amp; FAQ</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl">
            {subtitle}
          </p>
        </div>

        {/* Accordion List */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.id || idx}
                className="interactive-card bg-white dark:bg-[#0B2445] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                  aria-expanded={isOpen}
                >
                  <span className="font-heading font-semibold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-[#0B5ED7] dark:group-hover:text-[#2F80ED] transition-colors">
                    {faq.question}
                  </span>
                  <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-[#071A33] text-slate-500 dark:text-slate-300 shrink-0 transition-all duration-300 ease-out ${isOpen ? 'rotate-180 bg-[#0B5ED7] text-white dark:bg-[#0B5ED7]' : 'group-hover:bg-slate-200 dark:group-hover:bg-white/10'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3 bg-slate-50/50 dark:bg-white/5 animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Callout Box */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-11 h-11 rounded-xl bg-[#0B5ED7]/10 dark:bg-[#0B5ED7]/20 text-[#0B5ED7] dark:text-[#2F80ED] flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Have a question or need help sending a package?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Our customer support team is available 24/7 to help you.
              </p>
            </div>
          </div>

          <a
            href="tel:+977057520000"
            className="px-4 py-2.5 rounded-lg bg-[#0B5ED7] hover:bg-[#084298] text-white font-semibold text-xs uppercase tracking-wider transition-colors shrink-0 whitespace-nowrap cursor-pointer shadow-sm"
          >
            Call: +977-057-520000
          </a>
        </div>

      </div>
    </section>
  );
};
