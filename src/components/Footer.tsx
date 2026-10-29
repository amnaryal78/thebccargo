import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ArrowUp, ExternalLink, MessageCircle } from 'lucide-react';
import { BcLogo } from './BcLogo';
import { BUSINESS } from '../data/business';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

const COLUMNS: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: 'Ship',
    links: [
      { to: '/rates', label: 'Rates' },
      { to: '/book', label: 'Book a shipment' },
      { to: '/track', label: 'Track a parcel' },
      { to: '/how-to-ship', label: 'How to ship' },
      { to: '/blogs', label: 'Destinations' },
    ],
  },
  {
    title: 'Services',
    links: [
      { to: '/services', label: 'All services' },
      { to: '/services/international-air-freight', label: 'Air freight' },
      { to: '/services/cross-border-overland', label: 'Overland' },
      { to: '/services/ocean-freight-intermodal', label: 'Ocean freight' },
      { to: '/services/customs-brokerage-clearance', label: 'Customs clearance' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/contact', label: 'Contact' },
      { to: '/faq', label: 'FAQ' },
      { to: '/careers', label: 'Careers' },
      { to: '/become-a-partner', label: 'Become a partner' },
      { to: '/policies', label: 'Policies' },
    ],
  },
];

const SOCIAL: { href: string; label: string; path: string }[] = [
  { href: BUSINESS.sameAs[0], label: 'Facebook', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
  { href: BUSINESS.sameAs[1], label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
  { href: BUSINESS.sameAs[2], label: 'TikTok', path: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.69 6.34 6.34 0 0 0 9.35 22a6.33 6.33 0 0 0 6.33-6.31V9.22a8.16 8.16 0 0 0 4.91 1.62V7.4a4.85 4.85 0 0 1-1-.71z' },
  { href: BUSINESS.sameAs[3], label: 'YouTube', path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
];

const linkClass =
  'inline-flex items-center min-h-[36px] pointer-coarse:min-h-[44px] text-[14px] text-white/70 hover:text-white transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gd-500)]';

export const Footer: React.FC<FooterProps> = () => (
  <footer className="w-full bg-[var(--brand)] text-white pt-16 pb-28 lg:pb-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-10 pb-12 border-b border-white/10">
        <div className="col-span-2 lg:col-span-4 flex flex-col gap-5">
          {/* Logo artwork is colour; sit it on a white tile so it reads on navy */}
          <Link to="/" className="self-start rounded-[var(--r-sm)] bg-white px-3 py-2" aria-label="The BC Cargo & Courier home">
            <BcLogo size="md" theme="light" showSubtitle />
          </Link>
          <p className="text-[14px] leading-relaxed text-white/70 max-w-sm">
            International courier and cargo from Hetauda, Nepal. Parcels, documents and commercial cargo to destinations worldwide, with shipment tracking.
          </p>
          <div className="flex items-center gap-2">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${s.label} (opens in a new tab)`}
                className="w-11 h-11 rounded-[var(--r-sm)] bg-white/10 hover:bg-[var(--gd-500)] hover:text-[var(--ox-900)] flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gd-500)]"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title} className="lg:col-span-2 flex flex-col gap-2">
            <h2 className="font-heading text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--gd-500)] mb-1">{col.title}</h2>
            <ul className="flex flex-col">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="col-span-2 lg:col-span-2 flex flex-col gap-3">
          <h2 className="font-heading text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--gd-500)] mb-1">Head office</h2>
          <address className="not-italic flex flex-col gap-3 text-[14px] text-white/70">
            <a href={BUSINESS.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-white">
              <MapPin className="w-4 h-4 text-[var(--gd-500)] shrink-0 mt-0.5" aria-hidden="true" />
              {BUSINESS.street}, {BUSINESS.city}, Nepal
            </a>
            <a href={`tel:${BUSINESS.phone}`} className="flex items-center gap-2 hover:text-white">
              <Phone className="w-4 h-4 text-[var(--gd-500)] shrink-0" aria-hidden="true" />
              <span className="font-mono">{BUSINESS.phoneDisplay}</span>
            </a>
            <a href={BUSINESS.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white">
              <MessageCircle className="w-4 h-4 text-[var(--gd-500)] shrink-0" aria-hidden="true" />
              <span className="font-mono">{BUSINESS.mobileDisplay}</span>
              <span className="sr-only">(WhatsApp)</span>
            </a>
            <a href={`mailto:${BUSINESS.email}`} className="flex items-center gap-2 hover:text-white break-all">
              <Mail className="w-4 h-4 text-[var(--gd-500)] shrink-0" aria-hidden="true" />
              {BUSINESS.email}
            </a>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--gd-500)] shrink-0" aria-hidden="true" />
              Sun – Fri, {BUSINESS.hours.opens} – {BUSINESS.hours.closes}
            </span>
          </address>
        </div>
      </div>

      <div className="pt-8 flex flex-col md:flex-row md:items-center justify-between gap-5 text-[13px] text-white/60">
        <p>© {new Date().getFullYear()} {BUSINESS.legalName}. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {/* Site credit: who built it, a direct line, and their portfolio */}
          <span className="flex items-center gap-2">
            <img src="/team/ayush-aryal.jpg" alt="" width={24} height={24} loading="lazy" decoding="async" className="w-6 h-6 rounded-full object-cover" />
            Website by <strong className="font-semibold text-white">Ayush Aryal</strong>
          </span>
          <a href="tel:+9779823716862" className="font-mono hover:text-white">9823716862</a>
          <a href="https://dumarwana.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-white">
            Portfolio
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-[var(--r-sm)] bg-white/10 text-white hover:bg-white/15 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gd-500)]"
          >
            Back to top
            <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </footer>
);
