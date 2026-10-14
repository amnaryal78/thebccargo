import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  PhoneCall, 
  ArrowRight,
  ShieldCheck,
  FileQuestion
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEFAULT_FAQS, FaqItem } from '../components/FaqSection';
import { SEOHead } from '../components/SEOHead';

const CATEGORIZED_FAQS: FaqItem[] = [
  ...DEFAULT_FAQS.map((f, i) => ({
    ...f,
    id: `FAQ-${i + 1}`,
    category: i < 2 ? 'General Questions' : i === 2 ? 'Prices & Billing' : i === 3 ? 'Delivery Across Nepal' : 'Worldwide & Customs'
  })),
  {
    id: 'FAQ-7',
    category: 'Worldwide & Customs',
    question: 'How does customs clearance work for export from Nepal?',
    answer: 'Every item leaving Nepal passes through government customs. Our licensed in-house customs brokers (License #B-409) file the required electronic paperwork directly with Nepal Customs for you, ensuring smooth approval without delays.'
  },
  {
    id: 'FAQ-8',
    category: 'Prices & Billing',
    question: 'Are customs taxes and duties included in the delivery price?',
    answer: 'Our delivery prices cover pickup, safe transport, and export processing from Nepal. Depending on the destination country, the receiver may need to pay local import tax or customs fees set by their government. We can also arrange all-inclusive payment options for businesses.'
  },
  {
    id: 'FAQ-9',
    category: 'General Questions',
    question: 'How should I pack my box before sending?',
    answer: 'Use a strong cardboard box and wrap fragile items with bubble wrap or protective padding. Make sure the box is firmly taped on all edges. If you need help, bring your items to any of our branch offices in Hetauda, Kathmandu, or Birgunj, and our team will pack them safely for you.'
  }
];

export const FaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>(CATEGORIZED_FAQS);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    let isMounted = true;
    async function loadFaqs() {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('faqs')
            .select('*')
            .eq('published', true)
            .order('sort_order', { ascending: true });

          if (!error && data && data.length > 0 && isMounted) {
            setFaqs(data.map((f: any) => ({
              id: f.id,
              category: f.category || 'General Questions',
              question: f.question,
              answer: f.answer
            })));
          }
        } catch (e) {
          console.warn('Supabase faqs fetch error, using default FAQs:', e);
        }
      }
    }
    loadFaqs();
    return () => { isMounted = false; };
  }, []);

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(faqs.map((f) => f.category || 'General Questions')))];
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      const matchCat = selectedCategory === 'All' || (f.category || 'General Questions') === selectedCategory;
      const matchSearch = 
        f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [faqs, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full flex flex-col gap-10">
      <SEOHead
        title="Frequently Asked Questions (FAQ) | The BC Cargo & Courier"
        description="Find clear answers to common questions about sending packages across Nepal and worldwide, delivery times, pricing, and tracking."
      />

      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-[#0B5ED7] text-xs font-mono font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Support &amp; Answers</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white uppercase tracking-tight">
          Help &amp; Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          Everything you need to know about sending packages, delivery times, prices, and tracking your shipment.
        </p>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions (e.g. tracking, prices, box size, customs)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#0B5ED7] shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setOpenIndex(0);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#0E1638] dark:bg-[#0B5ED7] text-white shadow-sm'
                  : 'bg-white dark:bg-[#0B2445] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion FAQ Items */}
      <div className="flex flex-col gap-3">
        {filteredFaqs.length === 0 ? (
          <Card className="p-10 text-center flex flex-col items-center gap-3">
            <FileQuestion className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              No Questions Found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No FAQs matched "{searchQuery}". Try a different keyword or contact our dispatch team directly.
            </p>
          </Card>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.id || idx}
                className="bg-white dark:bg-[#0B2445] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    {faq.category && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 font-mono text-[10px] font-bold uppercase">
                        {faq.category}
                      </span>
                    )}
                    <span className="font-heading font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                      {faq.question}
                    </span>
                  </div>
                  <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-[#071A33] text-slate-500 dark:text-slate-300 shrink-0 transition-transform ${isOpen ? 'rotate-180 bg-[#0B5ED7] text-white dark:bg-[#0B5ED7]' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-4 bg-slate-50/50 dark:bg-white/5">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Support Box */}
      <Card className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-[#0B2445] dark:to-[#071A33]">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-[#0B5ED7]/10 text-[#0B5ED7] flex items-center justify-center shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              Still have questions about your package?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Our customer support team in Hetauda HQ is ready to assist you.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/contact">
            <Button variant="secondary" size="sm">
              <span>Send Message</span>
            </Button>
          </Link>
          <a href="tel:+977057520000">
            <Button variant="primary" size="sm">
              <span>Call +977-057-520000</span>
            </Button>
          </a>
        </div>
      </Card>

    </div>
  );
};
