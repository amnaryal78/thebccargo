import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  PhoneCall, 
  FileQuestion,
  MessageCircle,
  X
} from 'lucide-react';
import { Button } from '../design/primitives/Button';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEFAULT_FAQS, FaqItem } from '../components/FaqSection';
import { SEOHead } from '../components/SEOHead';
import { Spotlight } from '../components/ui/spotlight';
import { PAGE_META } from '../data/pageMeta';

const CATEGORIZED_FAQS: FaqItem[] = [
  ...DEFAULT_FAQS.map((f, i) => ({
    ...f,
    id: `FAQ-${i + 1}`,
    category: i < 2 ? 'General Logistics' : i === 2 ? 'Rates & Valuation' : i === 3 ? 'Doorstep Pickup' : 'Customs & Air Freight'
  })),
  {
    id: 'FAQ-7',
    category: 'Customs & Air Freight',
    question: 'How does customs clearance work for export from Nepal?',
    answer: 'Every commercial shipment leaving Nepal passes through the Department of Customs. Our in-house customs team submits the required electronic declarations (Pragyapan Patra) directly through the ASYCUDA World system, ensuring rapid export approval at TIA Kathmandu or Birgunj Dry Port without procedural hold-ups.'
  },
  {
    id: 'FAQ-8',
    category: 'Rates & Valuation',
    question: 'Are destination customs duties and import taxes included in freight charges?',
    answer: 'Standard quotes cover collection, export customs clearance, and linehaul freight to the destination port or door under DAT/DAP terms. Destination import tariffs and VAT are set by the recipient country\'s authorities and assessed on the consignee, unless contracted in advance under a Delivery Duty Paid (DDP) corporate arrangement.'
  },
  {
    id: 'FAQ-9',
    category: 'General Logistics',
    question: 'What packaging standards are mandatory for international air freight?',
    answer: 'Consignments must be packaged in multi-ply corrugated export cartons or wooden crates suitable for heavy stack loads and turbulent aerial handling. Fragile goods require cushioning with high-density foam or bubble wrap. Our packaging stations at Hetauda HQ and Kathmandu TIA provide standard strapping, banding, and e-seal application.'
  },
  {
    id: 'FAQ-10',
    category: 'Cross-Border Overland',
    question: 'What is the transit timeframe and process for cross-border road freight to India?',
    answer: 'Cross-border road linehaul connecting Hetauda and Kathmandu to India (via Birgunj ICD / Raxaul) typically completes within 2 to 4 business days, including bilateral customs clearance and Electronic Cargo Tracking System (ECTS) seal verification.'
  }
];

export const FaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>(CATEGORIZED_FAQS);
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
              category: f.category || 'General Logistics',
              question: f.question,
              answer: f.answer
            })));
          }
        } catch (e) {
          console.warn('Supabase faqs fetch error, using verified default catalog:', e);
        }
      }
    }
    loadFaqs();
    return () => { isMounted = false; };
  }, []);

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(faqs.map((f) => f.category || 'General Logistics')))];
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return faqs.filter((f) => {
      const matchCat = selectedCategory === 'All' || (f.category || 'General Logistics') === selectedCategory;
      const matchSearch = !q || 
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [faqs, selectedCategory, searchQuery]);

  // Generate FAQPage JSON-LD schema
  const faqSchema = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: filteredFaqs.slice(0, 15).map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer
        }
      }))
    };
  }, [filteredFaqs]);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full flex flex-col gap-10">
      <SEOHead
        title={PAGE_META['/faq'].title}
        description={PAGE_META['/faq'].description}
        jsonLd={faqSchema}
      />

      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--line-strong)] text-[var(--oxford-deep)] text-xs font-mono font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Knowledge &amp; Support</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[var(--text)] tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)]">
          Everything you need to know about air waybills, customs documents, dimensional weight, freight billing, and tracking your package.
        </p>
      </div>

      {/* Instant Search Bar & Category Filters */}
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Instant search questions (e.g. customs, dimensional weight, tracking, Birgunj, air waybill)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setOpenIndex(0);
            }}
            className="w-full pl-12 pr-10 py-3.5 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] text-xs sm:text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--oxford-deep)] clay-inset shadow-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setOpenIndex(0);
                }}
                className={`px-4 py-2 rounded-[var(--r-xs)] text-xs font-heading font-bold uppercase tracking-wider transition-all duration-[var(--t-fast)] whitespace-nowrap cursor-pointer border shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 ${
                  isSelected
                    ? 'bg-[var(--oxford-deep)] text-white border-white/20 shadow-hard-sm'
                    : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--line)] hover:border-[var(--line-strong)] hover:text-[var(--text)]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion FAQ Items */}
      <div className="flex flex-col gap-3">
        {filteredFaqs.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center gap-3 bg-[var(--surface)] rounded-[var(--r-md)] border border-[var(--line)] shadow-hard-sm">
            <FileQuestion className="w-10 h-10 text-[var(--text-muted)]" />
            <h2 className="font-heading font-bold text-base text-[var(--text)]">
              No Questions Found
            </h2>
            <p className="text-xs text-[var(--text-secondary)] max-w-md">
              No FAQs matched "{searchQuery}". Try different keywords or contact our dispatch team directly on WhatsApp or telephone.
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Spotlight
                key={faq.id || idx}
                intensity="subtle"
                className="bg-[var(--surface)] rounded-[var(--r-sm)] border border-[var(--line)] hover:border-[var(--line-strong)] shadow-hard-xs transition-all overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    {faq.category && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-[var(--r-xs)] bg-[var(--surface-2)] text-[var(--text-muted)] font-mono text-[10px] font-bold uppercase border border-[var(--line)] shadow-hard-xs">
                        {faq.category}
                      </span>
                    )}
                    <span className="font-heading font-bold text-sm sm:text-base text-[var(--text)]">
                      {faq.question}
                    </span>
                  </div>
                  <div className={`p-1.5 rounded-[var(--r-xs)] bg-[var(--surface-2)] text-[var(--text)] shrink-0 transition-transform ${isOpen ? 'rotate-180 bg-[var(--gold)] text-[var(--oxford-deep)]' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--line)] pt-4 bg-[var(--surface-2)]">
                    {faq.answer}
                  </div>
                )}
              </Spotlight>
            );
          })
        )}
      </div>

      {/* Support Box Card */}
      <Spotlight
        intensity="normal"
        className="p-6 sm:p-8 rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--line)] shadow-hard flex flex-col sm:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-full bg-[var(--oxford-deep)] text-[var(--gold)] flex items-center justify-center shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-base sm:text-lg text-[var(--text)]">
              Still have specific cargo questions?
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Our central operations team at School Road -4, Hetauda is available 6 days a week.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <Link to="/contact" className="flex-1 sm:flex-initial">
            <Button variant="outline" size="sm" className="w-full">
              <span>Send Message</span>
            </Button>
          </Link>
          <a
            href="https://wa.me/9779855019485?text=Hello%20BC%20Cargo%2C%20I%20have%20a%20question%20regarding%20shipping."
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial"
          >
            <Button
              variant="primary"
              size="sm"
              className="w-full whitespace-nowrap"
              leftIcon={<MessageCircle className="w-3.5 h-3.5 shrink-0" />}
            >
              WhatsApp Dispatch
            </Button>
          </a>
        </div>
      </Spotlight>

    </div>
  );
};
