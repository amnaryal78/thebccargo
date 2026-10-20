import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Plane,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calculator,
  MessageSquare,
  HelpCircle,
  Package,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { COUNTRY_LANDING_DATA } from '../../data/countryLandingData';
import { SEOHead } from '../../components/SEOHead';
import { useEstimatorData } from '../../features/estimator/useEstimatorData';
import { calculateSheetShipmentQuote } from '../../features/estimator/engine';
import { NotFoundPage } from '../NotFoundPage';
import { Card3D } from '../../design/primitives/Card3D';
import { Spotlight } from '../../components/ui/spotlight';

interface CountryLandingPageProps {
  forcedSlug?: string;
}

export const CountryLandingPage: React.FC<CountryLandingPageProps> = ({ forcedSlug }) => {
  const { slug } = useParams<{ slug: string }>();
  const activeSlug = forcedSlug || slug || '';
  const country = COUNTRY_LANDING_DATA[activeSlug];

  const { sheetRates, loading: ratesLoading } = useEstimatorData();

  // Calculate live sample quote for this country
  const sampleQuote = useMemo(() => {
    if (!country || sheetRates.length === 0) return null;
    return calculateSheetShipmentQuote(
      {
        destination: country.countryName,
        actualWeightKg: country.sampleWeightKg,
      },
      sheetRates
    );
  }, [country, sheetRates]);

  // Construct structured schemas for Google (LocalBusiness + Service + FAQ)
  const schemas = useMemo(() => {
    if (!country) return [];
    const BASE_URL = 'https://thebccargo.com';

    return [
      {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'The BC Cargo & Courier - Hetauda Central HQ',
        image: `${BASE_URL}/og-banner.png`,
        telephone: '057-591816',
        email: 'thebccargo@gmail.com',
        url: `${BASE_URL}/${country.slug}`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'School Road -4',
          addressLocality: 'Hetauda',
          addressRegion: 'Bagmati Province',
          postalCode: '44107',
          addressCountry: 'NP',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 27.4284,
          longitude: 85.0322,
        },
        priceRange: 'NPR',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: `Cargo Service from Nepal to ${country.countryName}`,
        provider: {
          '@type': 'Organization',
          name: 'The BC Cargo & Courier',
        },
        areaServed: [country.countryName, 'Nepal'],
        serviceType: 'International Air Freight & Courier',
        description: country.metaDescription,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: country.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ];
  }, [country]);

  if (!country) {
    return <NotFoundPage />;
  }

  const getWhatsAppInquiryUrl = () => {
    const msg = encodeURIComponent(
      `Hello The BC Cargo (Hetauda HQ), I want to inquire about sending cargo from Hetauda/Nepal to ${country.countryName}.`
    );
    return `https://wa.me/9779855019485?text=${msg}`;
  };

  return (
    <div className="w-full bg-[var(--bg,#F6F6F4)] text-[var(--text,#121211)] transition-colors">
      <SEOHead
        title={country.metaTitle}
        description={country.metaDescription}
        canonicalUrl={`https://thebccargo.com/${country.slug}`}
        jsonLd={schemas}
        keywords={[
          `cargo from Hetauda to ${country.countryName}`,
          `send parcel Nepal to ${country.countryName}`,
          `air cargo Nepal to ${country.countryName}`,
          `courier Hetauda to ${country.countryName}`,
          `parcel rates Nepal to ${country.countryName}`,
          'The BC Cargo Hetauda',
        ]}
      />

      {/* =============================================================== */}
      {/* 1. HERO HEADER */}
      {/* =============================================================== */}
      <section className="relative overflow-hidden pt-12 pb-16 bg-[#002147] text-white border-b-2 border-[#16345B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#F2B705] text-xs font-mono font-bold uppercase tracking-wider mb-6">
            <span className="text-base">{country.flag}</span>
            <span>Nepal to {country.countryName} Air Cargo</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4 text-left">
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-[1.15]">
                {country.headline}
              </h1>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
                {country.subheadline}
              </p>

              {/* Quick Specs Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#F2B705]" />
                    Transit Time
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">{country.transitTime}</div>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-[#F2B705]" />
                    Departure
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">{country.departureFrequency}</div>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-xl col-span-2 sm:col-span-1">
                  <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#F2B705]" />
                    Central Office
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">School Road -4, Hetauda</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Link
                  to={`/rates?dest=${encodeURIComponent(country.countryName)}`}
                  className="min-h-[48px] px-6 py-3 rounded-xl bg-[#F2B705] hover:bg-[#FAC623] text-[#002147] font-heading font-extrabold text-sm uppercase tracking-wider inline-flex items-center gap-2 shadow-[0_4px_0_#00152D] active:translate-y-1 transition-all"
                >
                  <Calculator className="w-4 h-4 text-[#002147]" />
                  <span>Price</span>
                </Link>

                <a
                  href={getWhatsAppInquiryUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-heading font-extrabold text-sm uppercase tracking-wider inline-flex items-center gap-2 border border-white/20 transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-[#F2B705]" />
                  <span>Chat</span>
                </a>
              </div>
            </div>

            {/* Right Card: Live Tariff Sample with Card3D */}
            <div className="lg:col-span-5">
              <Card3D
                maxTilt={3}
                className="bg-white text-[#002147] rounded-3xl p-6 sm:p-7 border-2 border-white/20 shadow-2xl space-y-4 text-left"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                      Verified Sheet Tariff
                    </span>
                    <span className="font-heading font-extrabold text-lg text-[#002147]">
                      Live Pricing Example
                    </span>
                  </div>
                  <span className="text-2xl">{country.flag}</span>
                </div>

                {sampleQuote && sampleQuote.allowed ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-600">
                          Sample Parcel Weight
                        </div>
                        <div className="text-xl font-heading font-black text-[#002147]">
                          {country.sampleWeightKg} kg
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {sampleQuote.boxCount} box (max 20 kg)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold text-slate-600">
                          Total Live Estimate
                        </div>
                        <div className="text-2xl font-mono font-black text-[#002147]">
                          Rs {sampleQuote.totalNpr.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-green-700 font-semibold flex items-center justify-end gap-1">
                          <Sparkles className="w-3 h-3" />
                          Live Google Sheet Tariff
                        </div>
                      </div>
                    </div>

                    <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
                      <li className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span>Base Shipping Charge:</span>
                        <span className="font-mono font-bold text-slate-900">
                          Rs {sampleQuote.baseShippingCharge.toLocaleString()}
                        </span>
                      </li>
                      <li className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span>Box Packaging ({sampleQuote.boxCount} box):</span>
                        <span className="font-mono font-bold text-slate-900">
                          Rs {sampleQuote.boxCharge.toLocaleString()}
                        </span>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-600">
                    {ratesLoading ? 'Loading verified rates...' : 'Live pricing ready. Click below to enter your exact weight.'}
                  </div>
                )}

                <Link
                  to={`/rates?dest=${encodeURIComponent(country.countryName)}&weight=${country.sampleWeightKg}`}
                  className="w-full min-h-[44px] rounded-xl bg-[#002147] hover:bg-[#123562] text-white font-heading font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <span>Price</span>
                  <ArrowRight className="w-4 h-4 text-[#F2B705]" />
                </Link>
              </Card3D>
            </div>
          </div>

        </div>
      </section>

      {/* =============================================================== */}
      {/* 2. PACKING RULES & ALLOWED / RESTRICTED ITEMS */}
      {/* =============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-left">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Packing Standards */}
          <Spotlight
            intensity="normal"
            className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4"
          >
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#002147]" />
              <h2 className="font-heading font-extrabold text-xl text-[#002147]">
                Export Packaging Guidelines
              </h2>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
              {country.packingRules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </Spotlight>

          {/* Permitted & Special Items */}
          <Spotlight
            intensity="normal"
            className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#002147]" />
              <h2 className="font-heading font-extrabold text-xl text-[#002147]">
                Permitted &amp; Special Cargo
              </h2>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
              {country.allowedSpecial.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Spotlight>
        </div>

        {/* Restricted Items Warning Box */}
        {country.restrictedItems.length > 0 && (
          <div className="p-6 bg-amber-50 border-2 border-amber-300 rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <h3 className="font-heading font-bold text-base">
                Customs Restrictions for {country.countryName}
              </h3>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-amber-800">
              {country.restrictedItems.map((r, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </section>

      {/* =============================================================== */}
      {/* 3. HETAUDA CENTRAL OFFICE & DISPATCH */}
      {/* =============================================================== */}
      <section className="bg-white border-t border-b border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-mono font-bold text-[#8A6200] uppercase tracking-wider">
              Central Operations Hub
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#002147]">
              Drop Off or Book Pickup in Hetauda
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Consignments for {country.countryName} are received, inspected, certified on electronic scales, and prepared for IATA air carriage directly at our Hetauda headquarters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Spotlight
              intensity="subtle"
              elevateOnHover
              className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1"
            >
              <div className="text-xs font-bold text-slate-600 uppercase">Headquarters</div>
              <div className="text-base font-heading font-bold text-[#002147]">
                School Road -4, Hetauda
              </div>
              <div className="text-xs text-slate-600">Walk-in counter &amp; commercial booking</div>
            </Spotlight>

            <Spotlight
              intensity="subtle"
              elevateOnHover
              className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1"
            >
              <div className="text-xs font-bold text-slate-600 uppercase">Direct Helpline</div>
              <div className="text-base font-heading font-bold text-[#002147]">
                057-591816 / 9855019485
              </div>
              <div className="text-xs text-slate-600">Sunday – Friday, 9:00 AM – 6:00 PM</div>
            </Spotlight>

            <Spotlight
              intensity="subtle"
              elevateOnHover
              className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1"
            >
              <div className="text-xs font-bold text-slate-600 uppercase">Doorstep Pickup</div>
              <div className="text-base font-heading font-bold text-[#002147]">
                Makwanpur &amp; Kathmandu
              </div>
              <div className="text-xs text-slate-600">Scheduled home &amp; warehouse collection</div>
            </Spotlight>
          </div>
        </div>
      </section>

      {/* =============================================================== */}
      {/* 4. COUNTRY FAQS */}
      {/* =============================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-left">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#002147] uppercase">
            <HelpCircle className="w-4 h-4 text-[#F2B705]" />
            Frequently Asked Questions
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#002147]">
            Sending to {country.countryName} FAQs
          </h2>
        </div>

        <div className="space-y-4">
          {country.faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2"
            >
              <h3 className="font-heading font-bold text-base text-[#002147]">
                {faq.question}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =============================================================== */}
      {/* 5. BOTTOM CTA */}
      {/* =============================================================== */}
      <section className="bg-[#002147] text-white py-12 border-t-2 border-[#16345B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-heading font-extrabold text-2xl text-white">
              Ready to send your package to {country.countryName}?
            </h3>
            <p className="text-sm text-slate-300">
              Calculate your rate instantly or visit our office at School Road -4, Hetauda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/rates?dest=${encodeURIComponent(country.countryName)}`}
              className="min-h-[48px] px-6 py-3 rounded-xl bg-[#F2B705] hover:bg-[#FAC623] text-[#002147] font-heading font-extrabold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-sm"
            >
              <Calculator className="w-4 h-4" />
              <span>Price</span>
            </Link>

            <a
              href={getWhatsAppInquiryUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-heading font-extrabold text-xs uppercase tracking-wider inline-flex items-center gap-2 border border-white/20"
            >
              <MessageSquare className="w-4 h-4 text-[#F2B705]" />
              <span>Chat</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
