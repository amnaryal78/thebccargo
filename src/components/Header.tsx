import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  Search, 
  Menu, 
  X, 
  PackageCheck,
  Moon,
  Sun,
  ChevronDown,
  MapPin,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  LogIn
} from 'lucide-react';
import { BcLogo } from './BcLogo';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onNavigate: (sectionId: string) => void;
  activeSection: string;
  onQuickTrack: (trackingCode: string) => void;
  onOpenBooking: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  activeSection,
  onQuickTrack,
  onOpenBooking
}) => {
  const [headerQuery, setHeaderQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, isAuthorizedAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 32);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setAboutDropdownOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleHeaderTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerQuery.trim()) {
      onQuickTrack(headerQuery.trim());
      setHeaderQuery('');
      setMobileMenuOpen(false);
    }
  };

  const mainNavItems = [
    { id: 'home', label: 'Home' },
    { id: 'track', label: 'Track Package' },
    { id: 'services', label: 'Our Services' },
    { id: 'rates', label: 'Prices' },
    { id: 'blogs', label: 'Blog' }
  ];

  const aboutSubItems = [
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact Us' },
    { id: 'policies', label: 'Policies' },
    { id: 'careers', label: 'Careers' },
    { id: 'faq', label: 'FAQs' }
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    setAboutDropdownOpen(false);
    setUserMenuOpen(false);
  };

  const isAboutActive = ['about', 'contact', 'policies', 'careers', 'faq'].includes(activeSection);

  return (
    <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300">
      {/* Top Operational Status Bar (Collapses smoothly on scroll) */}
      <div 
        className={`bg-[#071A33] text-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between text-[11px] font-medium tracking-wide border-b border-white/10 transition-all duration-300 overflow-hidden ${
          isScrolled ? 'max-h-0 py-0 opacity-0 border-none' : 'max-h-9 py-1.5 opacity-100'
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse shrink-0" />
          <span className="truncate text-slate-300 font-mono text-[10px] sm:text-[11px]">
            The BC Cargo &amp; Courier Service
          </span>
        </div>

        <div className="hidden md:flex items-center gap-5 text-slate-300 shrink-0 font-mono text-[11px]">
          <a
            href="https://maps.app.goo.gl/pYyv4DPf69xwDV9J7"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#F5C84C] hover:text-white transition-colors"
          >
            <span>Hetauda HQ Map</span>
          </a>
          <a href="tel:+977057520000" className="flex items-center gap-1 hover:text-white transition-colors">
            <Phone className="w-3 h-3 text-[#2F80ED]" />
            <span>+977-057-520000</span>
          </a>
          <a href="mailto:thebcargo@gmail.com" className="flex items-center gap-1 hover:text-white transition-colors">
            <Mail className="w-3 h-3 text-[#2F80ED]" />
            <span>thebcargo@gmail.com</span>
          </a>
        </div>
      </div>

      {/* Main Corporate Navigation Bar */}
      <div 
        className={`px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${
          isScrolled
            ? 'h-14 bg-white/85 dark:bg-[#071A33]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm'
            : 'h-20 bg-white/95 dark:bg-[#071A33]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800'
        }`}
      >
        {/* Logo Section */}
        <div 
          onClick={() => handleNavClick('home')} 
          className="cursor-pointer transition-opacity hover:opacity-90 flex items-center gap-2 shrink-0"
          title="The BC Cargo & Courier Pvt. Ltd."
        >
          <BcLogo size={isScrolled ? 'sm' : 'md'} showSubtitle={false} />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-[#0B2445]/80 border border-slate-200 dark:border-slate-800">
          {mainNavItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0B5ED7] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#F5C84C] dark:hover:text-[#F5C84C] hover:bg-slate-200/60 dark:hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* About Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setAboutDropdownOpen(true)}
            onMouseLeave={() => setAboutDropdownOpen(false)}
          >
            <button
              onClick={() => handleNavClick('about')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1 cursor-pointer ${
                isAboutActive
                  ? 'bg-[#0B5ED7] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#F5C84C] dark:hover:text-[#F5C84C] hover:bg-slate-200/60 dark:hover:bg-white/10'
              }`}
            >
              <span>About</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {aboutDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 z-50 animate-fadeIn">
                {aboutSubItems.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => handleNavClick(sub.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      activeSection === sub.id
                        ? 'bg-[#0B5ED7] text-white font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-[#F5C84C]/15 hover:text-[#F5C84C] dark:hover:text-[#F5C84C]'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Action Controls & User Account Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Header Quick Tracking Bar (Desktop Large) */}
          <form 
            onSubmit={handleHeaderTrackSubmit}
            className="hidden xl:flex items-center bg-slate-100 dark:bg-[#0B2445] border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 py-1 focus-within:border-[#0B5ED7] focus-within:ring-2 focus-within:ring-[#0B5ED7]/15 transition-all"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={headerQuery}
              onChange={(e) => setHeaderQuery(e.target.value)}
              placeholder="Tracking number..."
              className="bg-transparent text-xs font-mono text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none w-32"
            />
            <button
              type="submit"
              className="bg-[#0B5ED7] hover:bg-[#084298] text-white px-2.5 py-1 rounded text-[11px] font-semibold tracking-wider uppercase transition-colors ml-1 cursor-pointer"
            >
              Track
            </button>
          </form>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-[#0B2445] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Toggle Light / Dark Mode"
            aria-label="Toggle Theme"
          >
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-[#F5C84C]" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>



          {/* Authentication & User Account Control */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0B2445] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer border border-slate-200 dark:border-slate-800"
              >
                <div className="w-5 h-5 rounded-full bg-[#0B5ED7] text-white text-[10px] font-bold flex items-center justify-center font-mono">
                  {(user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate hidden sm:inline">{user.email?.split('@')[0]}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50 flex flex-col gap-1 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-mono text-slate-400 uppercase">Signed in as</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.email}</p>
                  </div>

                  {isAuthorizedAdmin && (
                    <button
                      onClick={() => handleNavClick('admin')}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#0B5ED7] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => handleNavClick('login')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0E1638] dark:bg-[#0B5ED7] hover:bg-[#084298] text-white text-xs font-semibold tracking-wide transition-all shadow-sm cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-[#0B2445] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (Theme-aware, accessible) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#071A33] text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 px-4 py-5 shadow-2xl transition-all animate-fadeIn">
          {/* Quick Tracking input in mobile */}
          <form onSubmit={handleHeaderTrackSubmit} className="flex gap-2 mb-4">
            <input
              type="text"
              value={headerQuery}
              onChange={(e) => setHeaderQuery(e.target.value)}
              placeholder="Enter tracking number, e.g. BC-90214-HKG"
              className="w-full bg-slate-100 dark:bg-[#0B2445] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0B5ED7] font-mono"
            />
            <button
              type="submit"
              className="bg-[#0B5ED7] hover:bg-[#084298] text-white px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider shrink-0 cursor-pointer"
            >
              Track
            </button>
          </form>

          {/* Mobile Navigation Links */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[...mainNavItems, ...aboutSubItems].map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#0B5ED7] text-white font-semibold'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-2.5 bg-[#0B5ED7] hover:bg-[#084298] text-white font-semibold rounded-lg text-xs tracking-wide flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <PackageCheck className="w-4 h-4 text-[#F5C84C]" />
              <span>Send a Package</span>
            </button>

            {user ? (
              <div className="flex flex-col gap-2 pt-2">
                <div className="text-xs text-slate-400 font-mono px-1">
                  Logged in as: <strong className="text-slate-900 dark:text-white">{user.email}</strong>
                </div>
                {isAuthorizedAdmin && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="w-full py-2 bg-[#0B5ED7] text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#F5C84C]" />
                    <span>Admin Dashboard</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="w-full py-2 bg-slate-100 dark:bg-[#0B2445] text-slate-800 dark:text-slate-200 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#0B5ED7]" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
