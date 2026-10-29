import React, { useEffect, useState } from 'react';
import {
  Home,
  Calculator,
  Info,
  BookOpen,
  Menu,
  Phone,
  MessageSquare,
  Search,
  PackagePlus,
  Truck,
  Mail,
  Handshake,
  Newspaper,
  Briefcase,
  HelpCircle,
  FileText,
  Inbox,
  LayoutDashboard,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BottomSheet } from '../design/primitives/BottomSheet';
import { BUSINESS } from '../data/business';

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
  const { isAuthorizedAdmin } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'rates', label: 'Rates', icon: Calculator },
    { id: 'track', label: 'Track', icon: Search },
    { id: 'how-to-ship', label: 'How to Ship', icon: BookOpen },
    { id: 'more', label: 'More', icon: Menu, isAction: true },
  ];

  // The things people come for, as big tiles
  const primaryLinks = [
    { id: 'about', label: 'About us', icon: Info },
    { id: 'book', label: 'Book pickup', icon: PackagePlus },
    { id: 'services', label: 'Services', icon: Truck },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];
  const moreLinks = [
    { id: 'become-a-partner', label: 'Become a partner', icon: Handshake },
    { id: 'blogs', label: 'Destinations & blog', icon: Newspaper },
    { id: 'careers', label: 'Careers', icon: Briefcase },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'policies', label: 'Policies', icon: FileText },
  ];

  // Staff see how many customer messages are waiting. The service is loaded only for staff,
  // so the Supabase client never lands in the main bundle for normal visitors.
  const [newMessages, setNewMessages] = useState<number | null>(null);
  useEffect(() => {
    if (!moreSheetOpen || !isAuthorizedAdmin) return;
    let alive = true;
    import('../services/chatService')
      .then((m) => m.countThreadsNeedingReply())
      .then((n) => alive && setNewMessages(n))
      .catch(() => alive && setNewMessages(null));
    return () => {
      alive = false;
    };
  }, [moreSheetOpen, isAuthorizedAdmin]);

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
    if (id === 'book') {
      onOpenBooking();
      return;
    }
    onNavigate(id);
  };

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        data-hide-on-keyboard
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--line)] pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5 px-2 select-none shadow-[0_-4px_20px_rgba(11,45,99,0.08)]"
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
                    ? 'text-[var(--ox-900)] font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                <div
                  className={`p-1 rounded-[var(--r-sm)] flex items-center justify-center transition-transform active:scale-90 ${
                    isActive ? 'bg-[var(--gd-500)] text-[var(--ox-900)] shadow-hard-xs' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[11px] font-heading font-semibold leading-none whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* More Bottom Sheet */}
      <BottomSheet isOpen={moreSheetOpen} onClose={() => setMoreSheetOpen(false)} title="More">
        <div className="flex flex-col gap-4">
          {isAuthorizedAdmin && (
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <button
                type="button"
                onClick={() => handleSubItemClick('messages')}
                className="min-h-[56px] flex items-center gap-3 px-3.5 rounded-[var(--r-sm)] bg-[var(--ox-900)] text-white text-left active:scale-[0.98] transition-transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gd-500)]"
              >
                <span className="relative w-9 h-9 rounded-xl bg-white/10 grid place-items-center shrink-0">
                  <Inbox className="w-5 h-5 text-[var(--gd-500)]" aria-hidden="true" />
                  {!!newMessages && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-[var(--gd-500)] text-[var(--ox-900)] text-[11px] font-bold grid place-items-center">
                      {newMessages > 99 ? '99+' : newMessages}
                    </span>
                  )}
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block font-heading font-bold text-sm">Customer chats</span>
                  <span className="block text-[12px] text-white/70">
                    {newMessages === null ? 'Read and reply' : newMessages === 0 ? 'All replied' : `${newMessages} waiting for a reply`}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleSubItemClick('admin')}
                aria-label="Open admin panel"
                className="min-h-[56px] w-14 grid place-items-center rounded-[var(--r-sm)] border border-[var(--line-strong)] text-[var(--ox-900)] active:scale-[0.98] transition-transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gd-500)]"
              >
                <LayoutDashboard className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {primaryLinks.map(({ id, label, icon: Icon }) => {
              const active = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSubItemClick(id)}
                  aria-current={active ? 'page' : undefined}
                  className={`min-h-[76px] flex flex-col items-start justify-between gap-2 p-3 rounded-[var(--r-sm)] border text-left active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gd-500)] ${
                    active ? 'bg-[var(--gd-50)] border-[var(--gd-500)]' : 'bg-[var(--ox-50)] border-transparent hover:border-[var(--ox-900)]/20'
                  }`}
                >
                  <span className="w-8 h-8 rounded-lg bg-[var(--ox-900)] text-[var(--gd-500)] grid place-items-center">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="font-heading font-bold text-sm text-[var(--ox-900)]">{label}</span>
                </button>
              );
            })}
          </div>

          <ul className="flex flex-col rounded-[var(--r-sm)] border border-[var(--line)] overflow-hidden list-none m-0 p-0">
            {moreLinks.map(({ id, label, icon: Icon }, i) => (
              <li key={id} className={i > 0 ? 'border-t border-[var(--line)]' : ''}>
                <button
                  type="button"
                  onClick={() => handleSubItemClick(id)}
                  aria-current={activeSection === id ? 'page' : undefined}
                  className="w-full min-h-[48px] px-3.5 flex items-center gap-3 text-left text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] active:bg-[var(--surface-2)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:bg-[var(--surface-2)]"
                >
                  <Icon className="w-4 h-4 text-[var(--gold-dark)] shrink-0" aria-hidden="true" />
                  <span className="flex-1">{label}</span>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${BUSINESS.phone}`}
              className="min-h-[48px] flex items-center justify-center gap-2 px-3 rounded-[var(--r-sm)] bg-[var(--ox-900)] text-white text-sm font-heading font-bold active:scale-[0.98] transition-transform whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gd-500)]"
            >
              <Phone className="w-4 h-4 text-[var(--gd-500)] shrink-0" aria-hidden="true" />
              <span>Call office</span>
            </a>
            <a
              href={BUSINESS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] flex items-center justify-center gap-2 px-3 rounded-[var(--r-sm)] bg-[var(--gd-500)] text-[var(--ox-900)] text-sm font-heading font-bold active:scale-[0.98] transition-transform whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ox-900)]"
            >
              <MessageSquare className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </BottomSheet>
    </>
  );
};
