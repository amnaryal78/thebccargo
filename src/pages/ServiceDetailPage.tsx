import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getServiceBySlug, SERVICES_CATALOG } from '../services/servicesData';
import { RateEstimator } from '../features/estimator/RateEstimator';
import { SEOHead } from '../components/SEOHead';
import { Button } from '../design/primitives/Button';
import { Accordion } from '../design/primitives/Accordion';
import { RegistrationCorners, BarcodeStrip } from '../design/icons';
import { Spotlight } from '../components/ui/spotlight';
import { 
  Plane, 
  Truck, 
  Ship, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  Scale,
  MapPin,
  ChevronRight
} from 'lucide-react';

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const service = useMemo(() => {
    if (!slug) return undefined;
    return getServiceBySlug(slug);
  }, [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (!service) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-heading font-extrabold text-2xl text-[var(--text)] mb-2">
          Service Not Found
        </h2>
        <p className="text-sm text-[var(--text-muted)] max-w-md mb-6">
          The logistics service mode you requested is not catalogued or has been relocated.
        </p>
        <Link to="/services">
          <Button variant="primary">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to All Services
          </Button>
        </Link>
      </div>
    );
  }

  const ModeIcon = service.mode === 'air' ? Plane : service.mode === 'ocean' ? Ship : service.mode === 'customs' ? ShieldCheck : Truck;

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: 'The BC Cargo & Courier',
      url: 'https://thebccargo.com',
      logo: 'https://thebccargo.com/bc-logo.svg',
    },
    areaServed: service.category === 'international' ? 'Worldwide' : 'Nepal',
    serviceType: service.title,
  };

  return (
    <div className="w-full bg-[var(--bg,#F6F6F4)] text-[var(--text,#121211)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <SEOHead
        title={`${service.title} | The BC Cargo & Courier`}
        description={service.seoDescription}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* BREADCRUMB */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
          <Link to="/" className="hover:text-[var(--text)]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/services" className="hover:text-[var(--text)]">Services</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-[var(--text)] truncate">{service.title}</span>
        </nav>

        {/* HERO SECTION */}
        <Spotlight
          intensity="prominent"
          className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-6 sm:p-10 shadow-hard-md relative overflow-hidden"
        >
          <RegistrationCorners className="space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--surface-muted)] border border-[var(--line)] rounded-[var(--r-xs)] text-xs font-mono font-bold uppercase text-[var(--oxford-deep)]">
                <ModeIcon className="w-4 h-4" />
                <span>{service.category.toUpperCase()} LOGISTICS · {service.mode.toUpperCase()} CORRIDOR</span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--gold)]/20 text-[var(--gold-dark)] border border-[var(--gold)]/40">
                SLA: {service.sla}
              </span>
            </div>

            <div className="space-y-3 max-w-3xl">
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[var(--text)] tracking-tight leading-tight">
                {service.title}
              </h1>
              <p className="font-heading text-base sm:text-lg text-[var(--gold-dark)] font-medium">
                {service.tagline}
              </p>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed pt-1">
                {service.description}
              </p>
            </div>

            {/* Quick Spec Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-[var(--line)] text-xs font-mono">
              <div className="p-3 bg-[var(--surface-muted)] rounded-[var(--r-xs)] border border-[var(--line)]">
                <span className="text-[10px] text-[var(--text-muted)] block uppercase">Transit Speed</span>
                <span className="font-bold text-[var(--text)] text-xs sm:text-sm mt-0.5 block">{service.sla}</span>
              </div>

              <div className="p-3 bg-[var(--surface-muted)] rounded-[var(--r-xs)] border border-[var(--line)]">
                <span className="text-[10px] text-[var(--text-muted)] block uppercase">Capacity &amp; Limits</span>
                <span className="font-bold text-[var(--text)] text-xs sm:text-sm mt-0.5 block truncate" title={service.sizeLimit}>
                  {service.sizeLimit}
                </span>
              </div>

              <div className="p-3 bg-[var(--surface-muted)] rounded-[var(--r-xs)] border border-[var(--line)]">
                <span className="text-[10px] text-[var(--text-muted)] block uppercase">Regulatory Escort</span>
                <span className="font-bold text-[var(--green-mid,#16A34A)] text-xs sm:text-sm mt-0.5 block">License #B-409</span>
              </div>

              <div className="p-3 bg-[var(--surface-muted)] rounded-[var(--r-xs)] border border-[var(--line)]">
                <span className="text-[10px] text-[var(--text-muted)] block uppercase">Origin Gateways</span>
                <span className="font-bold text-[var(--text)] text-xs sm:text-sm mt-0.5 block">KTM &amp; HDA Yards</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                onClick={() => {
                  const elem = document.getElementById('service-estimator');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Estimate Rate for This Service
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <Link to={`/book?type=${service.category}`}>
                <Button variant="outline">
                  Book Consignment
                </Button>
              </Link>
            </div>

          </RegistrationCorners>
        </Spotlight>

        {/* WHAT WE CARRY / WHAT WE DO NOT CARRY (2-COLUMN CLEAR CHECKLIST) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--gold)]" />
            <h2 className="font-heading font-extrabold text-2xl text-[var(--text)] tracking-tight">
              Permitted Cargo &amp; Corridor Restrictions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Accepted Items */}
            <Spotlight
              intensity="subtle"
              className="p-6 bg-[var(--surface)] border border-[var(--green-mid,#16A34A)]/40 rounded-[var(--r-md)] shadow-hard-sm space-y-4"
            >
              <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--line)]">
                <CheckCircle2 className="w-5 h-5 text-[var(--green-mid,#16A34A)] shrink-0" />
                <h3 className="font-heading font-bold text-base text-[var(--text)]">
                  What We Carry (Accepted Cargo)
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                {service.whatWeCarry.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--green-mid,#16A34A)] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Spotlight>

            {/* Restricted / Prohibited Items */}
            <Spotlight
              intensity="subtle"
              className="p-6 bg-[var(--surface)] border border-[var(--danger,#C02E24)]/40 rounded-[var(--r-md)] shadow-hard-sm space-y-4"
            >
              <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--line)]">
                <XCircle className="w-5 h-5 text-[var(--danger,#C02E24)] shrink-0" />
                <h3 className="font-heading font-bold text-base text-[var(--text)]">
                  Prohibited &amp; Restricted Items
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                {service.whatWeDoNotCarry.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-[var(--danger,#C02E24)] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Spotlight>

          </div>
        </section>

        {/* 4-STEP PROCESS TIMELINE */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--gold)]" />
            <h2 className="font-heading font-extrabold text-2xl text-[var(--text)] tracking-tight">
              Verified 4-Stage Custody Pipeline
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {service.processSteps.map((step) => (
              <Spotlight
                key={step.stepNumber}
                intensity="subtle"
                elevateOnHover
                className="p-5 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-sm)] shadow-hard-sm space-y-2 relative"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--oxford-deep)] text-white font-heading font-bold text-xs flex items-center justify-center">
                  0{step.stepNumber}
                </div>
                <h4 className="font-heading font-bold text-sm text-[var(--text)] pt-1">
                  {step.title}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {step.description}
                </p>
              </Spotlight>
            ))}
          </div>
        </section>

        {/* PRESELECTED RATE ESTIMATOR */}
        <section id="service-estimator" className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--gold)]" />
              <h2 className="font-heading font-extrabold text-2xl text-[var(--text)] tracking-tight">
                Instant Freight Estimator for {service.title}
              </h2>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              Pre-selected mode: {service.category.toUpperCase()}
            </span>
          </div>

          <RateEstimator
            initialType={service.category}
            variant="full"
          />
        </section>

        {/* SERVICE SPECIFIC FAQS */}
        {service.faqs.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--gold)]" />
              <h2 className="font-heading font-extrabold text-2xl text-[var(--text)] tracking-tight">
                Frequently Asked Questions about {service.title}
              </h2>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-6 shadow-hard-md">
              <Accordion
                items={service.faqs.map((f, idx) => ({
                  id: `faq-${idx}`,
                  title: f.question,
                  content: <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">{f.answer}</p>,
                }))}
              />
            </div>
          </section>
        )}

      </div>
    </div>
  );
};
