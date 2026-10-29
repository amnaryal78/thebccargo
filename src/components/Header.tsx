import React, { useState, useEffect, useRef } from 'react';
import { Phone, Mail, MapPin, ChevronDown, Menu, X, User as UserIcon, LogOut, LayoutDashboard, LogIn, Calculator } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { BcLogo } from './BcLogo';
import { useAuth } from '../context/AuthContext';
import { Button } from '../design/primitives/Button';
import { BUSINESS } from '../data/business';

interface HeaderProps {
  onNavigate: (sectionId: string) => void;
  activeSection: string;
  onQuickTrack: (trackingCode: string) => void;
  onOpenBooking: () => void;
}

// Destinations = the country-guide hub at the top of /blogs.
const MAIN_NAV = [
  { id: 'home', label: 'Home' },
  { id: 'rates', label: 'Rates' },
  { id: 'services', label: 'Services' },
  { id: 'track', label: 'Track' },
  { id: 'blogs', label: 'Destinations' },
  { id: 'how-to-ship', label: 'How to ship' },
  { id: 'about', label: 'About' },
];

const MORE_NAV = [
  { id: 'book', label: 'Book a shipment' },
  { id: 'contact', label: 'Contact' },
  { id: 'faq', label: 'FAQ' },
  { id: 'careers', label: 'Careers' },
  { id: 'policies', label: 'Policies' },
];

// Menus stay mounted and transition both ways, so a second tap mid-animation reverses from where it is.
// Dropdowns grow from their trigger (top-right); the mobile menu drops from the header and leaves the same way.
const popover = (open: boolean, origin = 'top right') => ({
  inert: !open,
  'aria-hidden': !open,
  style: {
    transformOrigin: origin,
    opacity: open ? 1 : 0,
    transform: open ? 'none' : 'translateY(-6px) scale(0.97)',
    visibility: open ? ('visible' as const) : ('hidden' as const),
    transition: `opacity 160ms ease, transform 240ms cubic-bezier(0.2, 0.9, 0.25, 1), visibility 0s linear ${open ? 0 : 240}ms`,
  },
});

const navItemClass = (active: boolean) =>
  `relative min-h-[44px] px-3 rounded-[var(--r-sm)] text-[14px] font-heading font-semibold transition-[color,transform] active:scale-[0.97] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${
    active ? 'text-[var(--brand)]' : 'text-[var(--text-muted)] hover:text-[var(--brand)]'
  }`;

export const Header: React.FC<HeaderProps> = ({ onNavigate, activeSection }) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user, isAuthorizedAdmin, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 28);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close every menu on route change, Escape, or a click outside.
  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setMoreOpen(false);
        setUserMenuOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const go = (id: string) => {
    setMobileOpen(false);
    setMoreOpen(false);
    onNavigate(id);
  };

  const isMoreActive = MORE_NAV.some((i) => i.id === activeSection);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top,0px)] bg-[var(--surface)]">
      {/* Contact strip: desktop only, collapses on scroll */}
      <div
        className={`hidden lg:block bg-[var(--brand)] text-white/85 text-[12px] overflow-hidden transition-[height,opacity] duration-200 ${
          isScrolled ? 'h-0 opacity-0' : 'h-9 opacity-100'
        }`}
      >
        <div className="max-w-7xl mx-auto h-9 px-8 flex items-center justify-between gap-6">
          <a href={BUSINESS.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white">
            <MapPin className="w-3.5 h-3.5 text-[var(--gd-500)]" aria-hidden="true" />
            {BUSINESS.street}, {BUSINESS.city}, Nepal
          </a>
          <div className="flex items-center gap-6">
            <a href={`tel:${BUSINESS.phone}`} className="inline-flex items-center gap-1.5 hover:text-white">
              <Phone className="w-3.5 h-3.5 text-[var(--gd-500)]" aria-hidden="true" />
              <span className="font-mono">{BUSINESS.phoneDisplay} / {BUSINESS.mobileDisplay}</span>
            </a>
            <a href={`mailto:${BUSINESS.email}`} className="inline-flex items-center gap-1.5 hover:text-white">
              <Mail className="w-3.5 h-3.5 text-[var(--gd-500)]" aria-hidden="true" />
              {BUSINESS.email}
            </a>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className={`bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--line)] transition-shadow ${isScrolled ? 'shadow-hard-sm' : ''}`}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 transition-[height] duration-200 ${isScrolled ? 'h-16' : 'h-[72px]'}`}>
          <Link to="/" className="flex items-center shrink-0 rounded-[var(--r-sm)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]" aria-label="The BC Cargo & Courier home">
            <BcLogo size={isScrolled ? 'sm' : 'md'} showSubtitle={!isScrolled} compactOnMobile />
          </Link>

          <nav aria-label="Main" className="hidden xl:flex items-center gap-0.5">
            {MAIN_NAV.map((item) => {
              const active = activeSection === item.id;
              return (
                <button key={item.id} type="button" onClick={() => go(item.id)} aria-current={active ? 'page' : undefined} className={navItemClass(active)}>
                  {item.label}
                  {active && <span className="absolute left-3 right-3 bottom-1.5 h-[2px] rounded-full bg-[var(--accent)]" aria-hidden="true" />}
                </button>
              );
            })}
            <div ref={moreRef} className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-expanded={moreOpen}
                aria-haspopup="true"
                className={`${navItemClass(isMoreActive)} inline-flex items-center gap-1`}
              >
                More
                <ChevronDown className={`w-4 h-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {(
                <div {...popover(moreOpen)} className="absolute right-0 top-full mt-2 w-52 bg-[var(--surface)] rounded-[var(--r-md)] shadow-hard-lg p-1.5">
                  {MORE_NAV.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => go(sub.id)}
                      aria-current={activeSection === sub.id ? 'page' : undefined}
                      className={`w-full text-left min-h-[40px] px-3 rounded-[var(--r-sm)] text-[14px] font-medium transition-[background-color,transform] active:scale-[0.98] ${
                        activeSection === sub.id ? 'bg-[var(--gd-50)] text-[var(--brand)]' : 'text-[var(--text)] hover:bg-[var(--surface-2)]'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <div ref={userRef} className="relative">
                <button
                  type="button"
                  aria-label="Account menu"
                  aria-expanded={userMenuOpen}
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="h-11 min-w-[44px] px-3 inline-flex items-center justify-center gap-1.5 rounded-[var(--r-sm)] text-[14px] font-semibold text-[var(--brand)] hover:bg-[var(--surface-2)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  <UserIcon className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden md:inline">Account</span>
                </button>
                {(
                  <div {...popover(userMenuOpen)} className="absolute right-0 top-full mt-2 w-[min(14rem,calc(100vw-2rem))] bg-[var(--surface)] rounded-[var(--r-md)] shadow-hard-lg p-1.5">
                    <div className="px-3 py-2 border-b border-[var(--line)] text-xs">
                      <p className="font-semibold truncate text-[var(--text)]">{user.email}</p>
                      <p className="text-[var(--text-muted)] mt-0.5">{isAuthorizedAdmin ? 'Staff' : 'Customer'}</p>
                    </div>
                    {isAuthorizedAdmin && (
                      <button type="button" onClick={() => go('admin')} className="w-full text-left min-h-[40px] px-3 rounded-[var(--r-sm)] text-[14px] flex items-center gap-2 hover:bg-[var(--surface-2)] text-[var(--text)]">
                        <LayoutDashboard className="w-4 h-4 text-[var(--accent-text)]" aria-hidden="true" />
                        Admin console
                      </button>
                    )}
                    <Link to="/profile" className="w-full min-h-[40px] px-3 rounded-[var(--r-sm)] text-[14px] flex items-center gap-2 hover:bg-[var(--surface-2)] text-[var(--text)]">
                      <UserIcon className="w-4 h-4 text-[var(--accent-text)]" aria-hidden="true" />
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left min-h-[40px] px-3 rounded-[var(--r-sm)] text-[14px] flex items-center gap-2 text-[var(--danger)] hover:bg-[var(--surface-2)]"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="h-11 min-w-[44px] px-3 inline-flex items-center justify-center gap-1.5 rounded-[var(--r-sm)] text-[14px] font-semibold text-[var(--brand)] hover:bg-[var(--surface-2)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Sign in</span>
                <span className="sr-only sm:hidden">Sign in</span>
              </Link>
            )}

            <span className="hidden sm:inline-flex">
              <Button variant="primary" size="sm" onClick={() => go('rates')} leftIcon={<Calculator className="w-4 h-4 shrink-0" />}>
                Get a quote
              </Button>
            </span>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="xl:hidden h-11 w-11 inline-flex items-center justify-center rounded-[var(--r-sm)] text-[var(--brand)] hover:bg-[var(--surface-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              {mobileOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / tablet menu */}
      {(
        <div id="mobile-menu" {...popover(mobileOpen, 'top center')} className={`xl:hidden fixed inset-x-0 bottom-0 ${isScrolled ? 'top-[calc(4rem+env(safe-area-inset-top,0px))]' : 'top-[calc(72px+env(safe-area-inset-top,0px))] lg:top-[calc(108px+env(safe-area-inset-top,0px))]'} bg-[var(--bg)] overflow-y-auto`}>
          <nav aria-label="Mobile" className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-1">
            {[...MAIN_NAV, ...MORE_NAV].map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`text-left min-h-[52px] px-4 rounded-[var(--r-sm)] font-heading text-[18px] font-semibold transition-[background-color,transform] active:scale-[0.98] ${
                    active ? 'bg-[var(--surface)] text-[var(--brand)] shadow-hard-xs' : 'text-[var(--text)] hover:bg-[var(--surface)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <Button variant="primary" size="lg" onClick={() => go('rates')} leftIcon={<Calculator className="w-5 h-5" />} className="mt-4 w-full justify-center">
              Get a quote
            </Button>
            <div className="mt-6 pt-6 border-t border-[var(--line)] space-y-3 text-[15px] text-[var(--text-muted)]">
              <a href={`tel:${BUSINESS.phone}`} className="flex items-center gap-3 min-h-[44px]">
                <Phone className="w-4 h-4 text-[var(--accent-text)]" aria-hidden="true" />
                <span className="font-mono">{BUSINESS.phoneDisplay} / {BUSINESS.mobileDisplay}</span>
              </a>
              <a href={`mailto:${BUSINESS.email}`} className="flex items-center gap-3 min-h-[44px]">
                <Mail className="w-4 h-4 text-[var(--accent-text)]" aria-hidden="true" />
                {BUSINESS.email}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
