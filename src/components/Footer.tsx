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
    <footer className="w-full bg-slate-900 text-slate-300 dark:bg-[#040E1C] dark:text-slate-300 border-t border-slate-200/20 dark:border-slate-800 transition-colors pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        
        {/* Main Multi-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & Governance (Col 1-4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <BcLogo size="md" theme="dark" showSubtitle={true} />
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mt-1">
              The BC Cargo &amp; Courier helps you send packages, documents, and cargo safely from Nepal to destinations across the country and around the world.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#10B981]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>Licensed &amp; Trusted Courier</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Customs Brokerage License #B-409 • NEFFA Charter
              </span>
            </div>

            {/* Official Social Links */}
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <a
                href="https://facebook.com/bccargo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#0B5ED7] text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700/60"
                aria-label="Facebook @bccargo"
                title="Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com/bccargo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-600 hover:to-purple-600 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700/60"
                aria-label="Instagram @bccargo"
                title="Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://tiktok.com/@thebccargo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-black text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700/60"
                aria-label="TikTok @thebccargo"
                title="TikTok"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .59.043.87.127V9.4a6.33 6.33 0 0 0-.87-.06A6.34 6.34 0 0 0 3.14 15.7a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.86-4.5V8.84a8.18 8.18 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.27z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com/@thebccargo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#FF0000] text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700/60"
                aria-label="YouTube @thebccargo"
                title="YouTube"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/977057520000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#25D366] text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700/60"
                aria-label="WhatsApp @bccargo"
                title="WhatsApp"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links (Col 5-7) */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-[#F5C84C] hover:translate-x-1 transition-all inline-block cursor-pointer text-left">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-[#F5C84C] hover:translate-x-1 transition-all inline-block cursor-pointer text-left">
                  Our Services
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('track')} className="hover:text-[#F5C84C] hover:translate-x-1 transition-all inline-block cursor-pointer text-left">
                  Track Your Package
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('rates')} className="hover:text-[#F5C84C] hover:translate-x-1 transition-all inline-block cursor-pointer text-left">
                  Price Calculator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('book')} className="hover:text-[#F5C84C] hover:translate-x-1 transition-all inline-block cursor-pointer text-left">
                  Send a Package
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-[#F5C84C] hover:translate-x-1 transition-all inline-block cursor-pointer text-left">
                  Our Offices &amp; Hubs
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Resources (Col 8-9) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
              Company
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-[#F5C84C] hover:translate-x-1 transition-all inline-block cursor-pointer text-left">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('blogs')} className="hover:text-[#F5C84C] hover:translate-x-1 transition-all inline-block cursor-pointer text-left">
                  Articles &amp; Updates
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-[#F5C84C] hover:translate-x-1 transition-all inline-block cursor-pointer text-left">
                  Questions &amp; Answers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('careers')} className="hover:text-[#F5C84C] hover:translate-x-1 transition-all inline-block cursor-pointer text-left">
                  Jobs &amp; Careers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-[#F5C84C] hover:translate-x-1 transition-all inline-block cursor-pointer text-left">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policies')} className="hover:text-[#F5C84C] hover:translate-x-1 transition-all inline-block cursor-pointer text-left">
                  Policies &amp; Rules
                </button>
              </li>
            </ul>
          </div>

          {/* Central Headquarters & Contact (Col 10-12) */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0B5ED7]" />
              <span>Main Office (Hetauda)</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Kantirajpath, Hetauda-4, Makwanpur District, Bagmati Province, Nepal
            </p>
            <a
              href="https://maps.app.goo.gl/pYyv4DPf69xwDV9J7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#F5C84C] hover:text-white font-mono transition-colors"
            >
              <span>View Office on Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="space-y-1.5 text-xs text-slate-400 font-mono mt-1">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#0B5ED7]" />
                <span>+977-057-520000 / 521190</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#0B5ED7]" />
                <span>thebcargo@gmail.com</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Customer Support</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Policies, Copyright & Back to Top */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
            <button onClick={() => onNavigate('policies')} className="hover:text-white transition-colors cursor-pointer">
              Terms of Delivery
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('policies')} className="hover:text-white transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('policies')} className="hover:text-white transition-colors cursor-pointer">
              Package Protection
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('policies')} className="hover:text-white transition-colors cursor-pointer">
              What You Cannot Send
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} The BC Cargo &amp; Courier Pvt. Ltd.</span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-slate-800 hover:bg-[#0B5ED7] text-white transition-colors border border-slate-700 cursor-pointer"
              aria-label="Scroll to top of page"
              title="Scroll to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
