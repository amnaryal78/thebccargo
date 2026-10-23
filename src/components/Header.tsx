import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail,
  ChevronDown, 
  PackageCheck,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  LogIn
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BcLogo } from './BcLogo';
import { useAuth } from '../context/AuthContext';
import { Button } from '../design/primitives/Button';

interface HeaderProps {
  onNavigate: (sectionId: string) => void;
  activeSection: string;
  onQuickTrack: (trackingCode: string) => void;
  onOpenBooking: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  activeSection,
  onOpenBooking,
}) => {
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { user, role, isAuthorizedAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 28);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mainNavItems = [
    { id: 'home', label: 'Home' },
    { id: 'rates', label: 'Rates' },
    { id: 'about', label: 'About' },
    { id: 'how-to-ship', label: 'How to ship' },
    { id: 'services', label: 'Services' },
    { id: 'blogs', label: 'Blog' },
  ];

  const moreSubItems = [
    { id: 'track', label: 'Track parcel' },
    { id: 'contact', label: 'Contact' },
    { id: 'careers', label: 'Careers' },
    { id: 'faq', label: 'FAQ' },
    { id: 'policies', label: 'Policies' },
  ];

  const isMoreActive = moreSubItems.some((i) => i.id === activeSection);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[var(--line)] transition-all duration-300">
      {/* 1. Top Industrial Dispatch Bar (Desktop only, collapses on scroll) */}
      <div
        className={`hidden lg:flex bg-[#EEF3F9] text-[#002147] px-6 lg:px-12 items-center justify-between text-xs border-b border-[var(--line)] transition-all duration-200 overflow-hidden ${
          isScrolled ? 'h-0 py-0 opacity-0' : 'h-8 py-1 opacity-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[12px] text-[#002147]">
            The BC Cargo &amp; Courier Pvt. Ltd., Hetauda, Nepal
          </span>
        </div>

        <div className="flex items-center gap-6 text-[11px]">
          <a
            href="https://maps.app.goo.gl/pYyv4DPf69xwDV9J7"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8A6200] font-semibold hover:underline whitespace-nowrap"
          >
            Find our office
          </a>
          <a
            href="tel:+977057591816"
            className="flex items-center gap-1.5 hover:text-[#8A6200] transition-colors whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5 text-[#8A6200] shrink-0" />
            <span className="whitespace-nowrap font-mono">057-591816 / 9855019485</span>
          </a>
          <a
            href="mailto:thebccargo@gmail.com"
            className="flex items-center gap-1.5 hover:text-[#8A6200] transition-colors whitespace-nowrap"
          >
            <Mail className="w-3.5 h-3.5 text-[#8A6200] shrink-0" />
            <span className="whitespace-nowrap">thebccargo@gmail.com</span>
          </a>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div
        className={`px-3 min-[400px]:px-4 sm:px-6 lg:px-12 gap-2 flex items-center justify-between transition-all duration-200 bg-[var(--surface)] border-b border-[var(--line)] shadow-hard-xs ${
          isScrolled ? 'h-16' : 'h-18'
        }`}
      >
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="cursor-pointer transition-transform hover:scale-[1.01] flex items-center gap-2 shrink-0 border-none bg-transparent p-0 text-left"
          title="The BC Cargo & Courier Home"
        >
          <BcLogo size={isScrolled ? 'sm' : 'md'} showSubtitle={!isScrolled} compactOnMobile />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {mainNavItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`min-h-[44px] px-3.5 py-2 rounded-[var(--r-sm)] text-[13px] font-heading font-bold transition-colors cursor-pointer relative whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[#002147] bg-[var(--surface-2)]'
                    : 'text-[var(--text-muted)] hover:text-[#002147] hover:bg-[var(--surface-2)]'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#F2B705]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}

          {/* More Menu Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setAboutDropdownOpen(true)}
            onMouseLeave={() => setAboutDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
              aria-expanded={aboutDropdownOpen}
              className={`min-h-[44px] px-3.5 py-2 rounded-[var(--r-sm)] text-[13px] font-heading font-bold transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                isMoreActive
                  ? 'text-[#002147] bg-[var(--surface-2)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
              }`}
            >
              <span>More</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {aboutDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-[var(--surface)] border border-white/60 rounded-[var(--r-md)] shadow-hard-lg p-1.5 z-50 animate-fadeIn">
                {moreSubItems.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setAboutDropdownOpen(false);
                      onNavigate(sub.id);
                    }}
                    className={`w-full text-left px-3.5 py-2 rounded-[var(--r-sm)] text-[13px] font-heading font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      activeSection === sub.id
                        ? 'bg-[#FFF9E0] text-[#002147]'
                        : 'text-[var(--text)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right Actions: Header Track Form, Booking CTA, Theme Switch */}
        <div className="flex items-center gap-1 min-[400px]:gap-2.5 sm:gap-3 shrink-0">
          {/* Staff Login / Profile Status */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="h-9 px-2.5 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface-2)] shadow-hard-xs text-xs font-mono flex items-center gap-1.5 cursor-pointer text-[var(--text)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-press transition-all duration-[var(--t-fast)]"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#002147]" />
                <span className="hidden md:inline font-bold">Account</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-[var(--surface)] border border-white/60 rounded-[var(--r-md)] shadow-hard-lg p-1.5 z-50">
                  <div className="px-3 py-2 border-b border-[var(--line)] text-xs">
                    <p className="font-bold truncate text-[var(--text)]">{user.email}</p>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase font-mono mt-0.5">
                      {isAuthorizedAdmin ? 'Staff Operator' : 'Authenticated'}
                    </p>
                  </div>
                  {isAuthorizedAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onNavigate('admin');
                      }}
                      className="w-full text-left px-3 py-2 rounded-[var(--r-sm)] text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[var(--surface-2)] text-[var(--text)]"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#F2B705]" />
                      <span>Admin Console</span>
                    </button>
                  )}
                  {role === 'reseller' && (
                    <Link
                      to="/reseller"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full text-left px-3 py-2 rounded-[var(--r-sm)] text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[var(--surface-2)] text-[var(--text)]"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#F2B705]" />
                      <span>My reseller profile</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-[var(--r-sm)] text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-2 text-[var(--danger)] hover:bg-[var(--surface-2)]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="h-9 px-2.5 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface-2)] shadow-hard-xs text-xs font-mono flex items-center gap-1.5 text-[var(--text)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-press transition-all duration-[var(--t-fast)]"
            >
              <LogIn className="w-3.5 h-3.5 text-[#002147]" />
              <span className="font-bold">Sign in</span>
            </Link>
          )}

          {/* Primary Action Button: Book */}
          <Button
            variant="primary"
            size="sm"
            magnetic
            onClick={onOpenBooking}
            leftIcon={<PackageCheck className="w-4 h-4 shrink-0" />}
            className="inline-flex shrink-0 whitespace-nowrap"
          >
            <span className="hidden min-[360px]:inline">Book</span>
            <span className="sr-only min-[360px]:hidden">Book a shipment</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
