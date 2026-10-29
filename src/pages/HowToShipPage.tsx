import React, { useEffect, useState } from 'react';
import { 
  PackageCheck, 
  AlertCircle, 
  Ban, 
  FileCheck2, 
  Box, 
  Scale, 
  MessageSquare, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Phone,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { HowToShipData, HowToShipSection } from '../types/howToShip';
import { fetchPublishedHowToShip, subscribeToHowToShipUpdates } from '../services/howToShipService';
import { DEFAULT_HOW_TO_SHIP } from '../data/defaultHowToShip';
import { SEOHead } from '../components/SEOHead';
import { Spotlight } from '../components/ui/spotlight';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { BcLogo } from '../components/BcLogo';
import { ScrollTimeline, TimelineItem } from '../components/story/ScrollTimeline';
import { ShipRouteHero } from '../components/howtoship/ShipRouteHero';
import { ShipContact } from '../components/howtoship/ShipContact';
import { StepBody, kindOf } from '../components/howtoship/StepBodies';
import { PAGE_META } from '../data/pageMeta';

const SECTION_ICONS: Record<string, React.ElementType> = {
  PackageCheck,
  AlertCircle,
  Ban,
  FileCheck2,
  Box,
  Scale,
};

export const HowToShipPage: React.FC = () => {
  const [data, setData] = useState<HowToShipData>(DEFAULT_HOW_TO_SHIP);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setError(null);
        const result = await fetchPublishedHowToShip();
        if (isMounted) {
          setData(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Unable to sync with live database.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    // Subscribe to Supabase realtime broadcast
    const unsubscribe = subscribeToHowToShipUpdates((updated) => {
      if (isMounted && updated) {
        setData(updated);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const reduce = !!useReducedMotion();

  const whatsappHref = `https://wa.me/${data.whatsapp_number || '9779855019485'}?text=${encodeURIComponent(
    'Namaste The BC Cargo, I have a question about sending my parcel: '
  )}`;

  const bringStep = data.sections.find((sec) => kindOf(sec) === 'bring');

  return (
    <div className="w-full bg-[var(--bg,#F6F6F4)] text-[var(--text,#121211)] min-h-screen">
      <SEOHead
        title={PAGE_META['/how-to-ship'].title}
        description={PAGE_META['/how-to-ship'].description}
        canonicalUrl="https://thebccargo.com/how-to-ship"
        ogType="article"
      />

      {/* Hero: the guide's promise, with the route a parcel takes */}
      <section className="relative isolate overflow-hidden bg-[#EEF3FA] text-ox-900 px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-24 w-[44rem] max-w-[140%] aspect-square rounded-full -z-10"
          style={{ background: 'radial-gradient(closest-side, rgba(242,182,50,0.18), transparent)' }}
        />
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 items-center">
          <div className="flex flex-col gap-5 text-left min-w-0">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#8C6400]">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>Parcel guide • पार्सल निर्देशिका</span>
            </p>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
              className="font-heading font-black text-4xl sm:text-5xl tracking-tight leading-[1.1]"
            >
              {data.title_en}
              <span lang="ne" className="block mt-1 text-[#8C6400] text-3xl sm:text-4xl font-extrabold leading-snug">
                {data.title_np}
              </span>
            </motion.h1>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
              className="space-y-1.5 max-w-xl"
            >
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed">{data.intro_en}</p>
              {data.intro_np && (
                <p lang="ne" className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {data.intro_np}
                </p>
              )}
            </motion.div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] px-6 rounded-xl bg-gd-500 hover:bg-[#FAC623] text-ox-900 font-heading font-extrabold text-sm inline-flex items-center gap-2 leading-none shadow-[0_4px_0_#0B2D63] active:translate-y-1 active:shadow-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ox-900 focus-visible:ring-offset-2"
              >
                <MessageSquare className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Ask on WhatsApp</span>
              </a>
              {bringStep && (
                <a
                  href={`#step-${bringStep.section_number}`}
                  className="min-h-[48px] px-5 rounded-xl border-2 border-ox-900/40 hover:bg-ox-900/5 font-heading font-extrabold text-sm inline-flex items-center gap-2 leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gd-500 focus-visible:ring-offset-2"
                >
                  <FileCheck2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>What to bring</span>
                </a>
              )}
              <Link
                to="/rates"
                className="min-h-[48px] px-2 inline-flex items-center gap-2 text-sm font-semibold leading-none underline decoration-dashed decoration-gd-500 underline-offset-4 hover:decoration-solid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gd-500 rounded"
              >
                <span>Check price</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <ShipRouteHero className="w-full max-w-[300px] sm:max-w-md mx-auto lg:max-w-none" />
        </div>
      </section>

      {/* The guide, one step at a time */}
      <div className="bg-[#EEF3FA] px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-4xl mx-auto space-y-10">
          {loading && (
            <p className="flex items-center justify-center gap-2 text-sm text-slate-600 py-2" role="status">
              <RefreshCw className="w-4 h-4 text-gd-500 animate-spin" aria-hidden="true" />
              <span>Checking for the latest guide…</span>
            </p>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-center gap-2" role="status">
              <Info className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
              <span>Showing the saved copy of the shipping rules.</span>
            </div>
          )}

          <ScrollTimeline>
            {data.sections.map((section: HowToShipSection) => {
              const kind = kindOf(section);
              const Icon = SECTION_ICONS[section.icon || ''] || PackageCheck;
              const tone = kind === 'banned' ? 'danger' : kind === 'rules' ? 'warn' : 'default';
              const iconTone =
                kind === 'banned'
                  ? 'bg-red-100 text-red-700'
                  : kind === 'rules'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-ox-900 text-gd-500';

              return (
                <TimelineItem key={section.section_number} tone={tone} flat tapToHighlight={false}>
                  <div id={`step-${section.section_number}`} className="p-5 sm:p-7 space-y-5 scroll-mt-28">
                    <div className="flex items-start gap-4 border-b border-[#D5DEEA] pb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${iconTone}`}>
                        <Icon className="w-6 h-6" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#8C6400]">
                          Step {section.section_number} of {data.sections.length}
                        </p>
                        <h2 className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight leading-snug">
                          {section.title_en}
                          <span lang="ne" className="block text-lg sm:text-xl font-bold text-slate-600 leading-snug">
                            {section.title_np}
                          </span>
                        </h2>
                      </div>
                    </div>

                    <StepBody section={section} whatsappHref={whatsappHref} />

                    {kind !== 'banned' && (section.extra_text_en || section.extra_text_np) && (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm space-y-1.5">
                        {section.extra_text_en && <p className="font-medium">{section.extra_text_en}</p>}
                        {section.extra_text_np && (
                          <p lang="ne" className="text-slate-700">
                            {section.extra_text_np}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </TimelineItem>
              );
            })}

            {data.warnings && data.warnings.length > 0 && (
              <TimelineItem tone="warn" flat tapToHighlight={false}>
                <div className="p-5 sm:p-7 space-y-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-[#8C6400]">
                    <AlertCircle className="w-4 h-4 text-gd-500" aria-hidden="true" />
                    <span>Important notice • महत्त्वपूर्ण सूचना</span>
                  </p>
                  <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                    {data.warnings.map((warning, wIdx) => (
                      <p key={wIdx} lang={/[\u0900-\u097F]/.test(warning) ? 'ne' : undefined} className="font-medium">
                        {warning}
                      </p>
                    ))}
                  </div>
                </div>
              </TimelineItem>
            )}
          </ScrollTimeline>
        </div>
      </div>

      <ShipContact
        titleEn={data.contact_title_en}
        titleNp={data.contact_title_np}
        textEn={data.contact_text_en}
        textNp={data.contact_text_np}
        whatsappHref={whatsappHref}
        phoneHref="tel:+977057591816"
        phoneLabel="057-591816"
      />
    </div>
  );
};
