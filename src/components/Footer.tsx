import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ArrowUp,
  ShieldCheck,
  Globe2,
  ExternalLink
} from 'lucide-react';
import { BcLogo } from './BcLogo';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-white text-[#121211] border-t-2 border-[#F2B705] shadow-[0_-4px_24px_rgba(242,183,5,0.15)] transition-colors pt-16 pb-24 lg:pb-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-12">
        {/* Main Multi-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-[var(--line)]">
          
          {/* Brand & Governance (Col 1-4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <BcLogo size="md" theme="light" showSubtitle={true} />
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mt-1">
              The BC Cargo &amp; Courier Pvt. Ltd. connects individuals, exporters, and businesses with dependable cross-border road linehaul and worldwide air &amp; ocean forwarding from Nepal.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#8C6400]">
                <ShieldCheck className="w-4 h-4 text-[#8C6400]" />
                <span className="font-bold">Government Authorized Logistics</span>
              </div>
              <span className="text-[11px] text-slate-600 font-mono">
                Customs Brokerage License #B-409 • Hetauda Head Office
              </span>
            </div>

            {/* Official Social Links (Clay Tactile Buttons) */}
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <a
                href="https://facebook.com/thebccargo"
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-[var(--r-sm)] bg-[#EEF3F9] hover:bg-[#F2B705] text-[#002147] hover:text-[#002147] flex items-center justify-center transition-all duration-[var(--t-fast)] border border-[var(--line)] shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-press focus-visible:ring-2 focus-visible:ring-[#F2B705]"
                aria-label="Facebook @thebccargo"
                title="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com/thebccargo"
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-[var(--r-sm)] bg-[#EEF3F9] hover:bg-[#F2B705] text-[#002147] hover:text-[#002147] flex items-center justify-center transition-all duration-[var(--t-fast)] border border-[var(--line)] shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-press focus-visible:ring-2 focus-visible:ring-[#F2B705]"
                aria-label="Instagram @thebccargo"
                title="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://tiktok.com/@thebccargo"
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-[var(--r-sm)] bg-[#EEF3F9] hover:bg-[#F2B705] text-[#002147] hover:text-[#002147] flex items-center justify-center transition-all duration-[var(--t-fast)] border border-[var(--line)] shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-press focus-visible:ring-2 focus-visible:ring-[#F2B705]"
                aria-label="TikTok @thebccargo"
                title="TikTok"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.69 6.34 6.34 0 0 0 9.35 22a6.33 6.33 0 0 0 6.33-6.31V9.22a8.16 8.16 0 0 0 4.91 1.62V7.4a4.85 4.85 0 0 1-1-.71z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com/@thebccargo"
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-[var(--r-sm)] bg-[#EEF3F9] hover:bg-[#F2B705] text-[#002147] hover:text-[#002147] flex items-center justify-center transition-all duration-[var(--t-fast)] border border-[var(--line)] shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-press focus-visible:ring-2 focus-visible:ring-[#F2B705]"
                aria-label="YouTube @thebccargo"
                title="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/9779855019485"
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-[var(--r-sm)] bg-[#EEF3F9] hover:bg-[#F2B705] text-[#002147] hover:text-[#002147] flex items-center justify-center transition-all duration-[var(--t-fast)] border border-[var(--line)] shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-press focus-visible:ring-2 focus-visible:ring-[#F2B705]"
                aria-label="WhatsApp @thebccargo"
                title="WhatsApp Direct"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation Links (Col 5-7) */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h2 className="font-heading font-bold text-xs uppercase tracking-widest text-[#002147]">
              Services &amp; Tools
            </h2>
            <ul className="flex flex-col gap-2 text-xs font-heading">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="text-slate-700 hover:text-[#002147] hover:translate-x-1 transition-colors text-xs font-semibold tracking-wider py-1 inline-flex items-center text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F2B705] rounded"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('rates')}
                  className="text-slate-700 hover:text-[#002147] hover:translate-x-1 transition-colors text-xs font-semibold tracking-wider py-1 inline-flex items-center text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F2B705] rounded"
                >
                  Rates
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('track')}
                  className="text-slate-700 hover:text-[#002147] hover:translate-x-1 transition-colors text-xs font-semibold tracking-wider py-1 inline-flex items-center text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F2B705] rounded"
                >
                  Track
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services/international-air-freight')}
                  className="text-slate-700 hover:text-[#002147] hover:translate-x-1 transition-colors text-xs font-semibold tracking-wider py-1 inline-flex items-center text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F2B705] rounded"
                >
                  Air Freight
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services/cross-border-overland')}
                  className="text-slate-700 hover:text-[#002147] hover:translate-x-1 transition-colors text-xs font-semibold tracking-wider py-1 inline-flex items-center text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F2B705] rounded"
                >
                  Overland Linehaul
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services/customs-brokerage-clearance')}
                  className="text-slate-700 hover:text-[#002147] hover:translate-x-1 transition-colors text-xs font-semibold tracking-wider py-1 inline-flex items-center text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F2B705] rounded"
                >
                  Customs Clearance
                </button>
              </li>
            </ul>
          </div>

          {/* Governance & Information (Col 8-9) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h2 className="font-heading font-bold text-xs uppercase tracking-widest text-[#002147]">
              Company
            </h2>
            <ul className="flex flex-col gap-2 text-xs font-heading">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="text-slate-700 hover:text-[#002147] hover:translate-x-1 transition-colors text-xs font-semibold tracking-wider py-1 inline-flex items-center text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F2B705] rounded"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="text-slate-700 hover:text-[#002147] hover:translate-x-1 transition-colors text-xs font-semibold tracking-wider py-1 inline-flex items-center text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F2B705] rounded"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('blogs')}
                  className="text-slate-700 hover:text-[#002147] hover:translate-x-1 transition-colors text-xs font-semibold tracking-wider py-1 inline-flex items-center text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F2B705] rounded"
                >
                  Blog
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('become-a-partner')}
                  className="text-[#8C6400] hover:text-[#002147] hover:translate-x-1 transition-colors text-xs font-semibold tracking-wider py-1 inline-flex items-center text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F2B705] rounded"
                >
                  Become a Partner
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('careers')}
                  className="text-slate-700 hover:text-[#002147] hover:translate-x-1 transition-colors text-xs font-semibold tracking-wider py-1 inline-flex items-center text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F2B705] rounded"
                >
                  Careers
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('faq')}
                  className="text-slate-700 hover:text-[#002147] hover:translate-x-1 transition-colors text-xs font-semibold tracking-wider py-1 inline-flex items-center text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F2B705] rounded"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('policies')}
                  className="text-slate-700 hover:text-[#002147] hover:translate-x-1 transition-colors text-xs font-semibold tracking-wider py-1 inline-flex items-center text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F2B705] rounded"
                >
                  Policies
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('how-to-ship')}
                  className="text-[#8C6400] hover:text-[#002147] hover:translate-x-1 transition-colors text-xs font-semibold tracking-wider py-1 inline-flex items-center text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F2B705] rounded"
                >
                  How to Ship
                </button>
              </li>
            </ul>
          </div>

          {/* Central Terminal HQ Info (Col 10-12) */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h2 className="font-heading font-bold text-xs uppercase tracking-widest text-[#002147]">
              Hetauda Central HQ
            </h2>
            <div className="flex flex-col gap-2 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#8C6400] shrink-0 mt-0.5" />
                <span>School Road -4, Hetauda, Nepal</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#8C6400] shrink-0" />
                <a
                  href="tel:+977057591816"
                  className="hover:text-[#002147] transition-colors whitespace-nowrap font-mono"
                >
                  057-591816 / 9855019485
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#8C6400] shrink-0" />
                <a
                  href="mailto:thebccargo@gmail.com"
                  className="hover:text-[#002147] transition-colors whitespace-nowrap"
                >
                  thebccargo@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#8C6400] shrink-0" />
                <span className="whitespace-nowrap">Sun – Fri: 09:00 – 18:00 NPT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Metadata & Return to Top Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex flex-col items-center sm:items-start gap-1 text-center sm:text-left">
            <p>© {new Date().getFullYear()} The BC Cargo &amp; Courier Pvt. Ltd. All rights reserved.</p>
            {/* Site credit: who built it, a direct line, and their portfolio */}
            <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-2 rounded-[var(--r-sm)] border border-[var(--line-strong)] bg-white/70 pl-1.5 pr-1.5 py-1.5">
              <span className="flex items-center gap-2 min-w-0">
                <img
                  src="/team/ayush-aryal.jpg"
                  alt=""
                  width={28}
                  height={28}
                  loading="lazy"
                  decoding="async"
                  className="w-7 h-7 rounded-full object-cover border border-[var(--line-strong)] shrink-0"
                />
                <span className="text-slate-700 leading-tight">
                  Website by <strong className="font-semibold text-[#002147]">Ayush Aryal</strong>
                </span>
              </span>
              <a
                href="tel:+9779823716862"
                className="inline-flex items-center gap-1.5 min-h-[32px] px-2 rounded-[var(--r-xs)] text-[#002147] font-mono hover:bg-[#EEF3F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 shrink-0 text-[#8C6400]" aria-hidden="true" />
                <span>9823716862</span>
              </a>
              <a
                href="https://dumarwana.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 min-h-[32px] px-3 rounded-[var(--r-xs)] bg-[#002147] text-white font-heading font-bold hover:bg-[#123562] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] focus-visible:ring-offset-1 transition-all whitespace-nowrap"
              >
                <span>View portfolio</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 text-[#F2B705]" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--r-sm)] border border-[var(--line)] bg-[#EEF3F9] text-xs font-mono text-[#002147] hover:bg-[#F2B705] hover:text-[#002147] hover:border-[#FAC623] hover:shadow-[0_0_14px_rgba(242,183,5,0.35)] transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Top of Page</span>
            <ArrowUp className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>
    </footer>
  );
};
