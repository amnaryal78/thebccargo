import React, { useState } from 'react';
import { Home, Calculator, Search, PackageCheck, Menu, X, Phone, MessageSquare } from 'lucide-react';
import { BottomSheet } from '../design/primitives/BottomSheet';

interface AndroidBottomNavProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenBooking: () => void;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeSection,
  onNavigate,
  onOpenBooking,
}) => {
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'rates', label: 'Rates', icon: Calculator },
    { id: 'track', label: 'Track', icon: Search },
    { id: 'book', label: 'Book', icon: PackageCheck, isAction: true },
    { id: 'more', label: 'More', icon: Menu, isAction: true },
  ];

  const moreLinks = [
    { id: 'how-to-ship', label: 'How to Ship' },
    { id: 'become-a-partner', label: 'Become a Partner' },
    { id: 'services', label: 'Services' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
    { id: 'blogs', label: 'Blog' },
    { id: 'careers', label: 'Careers' },
    { id: 'faq', label: 'FAQ' },
    { id: 'policies', label: 'Policies' },
  ];

  const handleItemClick = (id: string, isAction?: boolean) => {
    if (id === 'book') {
      onOpenBooking();
      return;
    }
    if (id === 'more') {
      setMoreSheetOpen(true);
      return;
    }
    onNavigate(id);
  };

  const handleSubItemClick = (id: string) => {
    setMoreSheetOpen(false);
    onNavigate(id);
  };

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)] border-t border-white/60 pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5 px-2 select-none shadow-[0_-4px_20px_rgba(0,33,71,0.08)]"
      >
        <div className="grid grid-cols-5 items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id, item.isAction)}
                className={`min-h-[48px] py-1 flex flex-col items-center justify-center gap-1 rounded-[var(--r-sm)] transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#002147] font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                <div
                  className={`p-1 rounded-[var(--r-sm)] flex items-center justify-center transition-transform active:scale-90 ${
                    isActive ? 'bg-[#F2B705] text-[#002147] shadow-hard-xs' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-heading font-semibold uppercase tracking-wider leading-none whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* More Bottom Sheet */}
      <BottomSheet
        isOpen={moreSheetOpen}
        onClose={() => setMoreSheetOpen(false)}
        title="BC Cargo Directory"
      >
        <div className="flex flex-col gap-2">
          {/* Quick Call & WhatsApp shortcuts in sheet */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <a
              href="tel:+977057591816"
              className="min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 bg-[#002147] text-white rounded-[var(--r-sm)] border border-white/20 text-xs font-heading font-bold uppercase tracking-wider shadow-hard-sm hover:bg-[#F2B705] hover:text-[#002147] hover:border-[#FAC623] active:translate-y-0.5 transition-all whitespace-nowrap"
            >
              <Phone className="w-4 h-4 text-[#F2B705] shrink-0" />
              <span className="whitespace-nowrap">Call Dispatch</span>
            </a>
            <a
              href="https://wa.me/9779855019485"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 bg-[#F2B705] text-[#002147] rounded-[var(--r-sm)] border border-white/60 text-xs font-heading font-bold uppercase tracking-wider shadow-hard-sm hover:bg-[#002147] hover:text-[#FAC623] hover:border-[#123562] active:translate-y-0.5 transition-all whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">WhatsApp</span>
            </a>
          </div>

          <div className="flex flex-col divide-y divide-[var(--line)] border border-[var(--line)] rounded-[var(--r-sm)] overflow-hidden">
            {moreLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => handleSubItemClick(link.id)}
                className="w-full min-h-[44px] px-4 py-3 text-left text-xs font-heading font-bold uppercase tracking-wider text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>{link.label}</span>
                <span className="text-[var(--text-muted)] font-mono text-sm">→</span>
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>
    </>
  );
};
