import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'underline' | 'segmented';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  variant = 'underline',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;
    if (e.key === 'ArrowRight') {
      newIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = tabs.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    onChange(tabs[newIndex].id);
  };

  if (variant === 'segmented') {
    return (
      <div
        role="tablist"
        className={`inline-flex p-1 bg-[var(--surface-2)] border border-[var(--line)] rounded-[var(--r-md)] clay-inset gap-1 overflow-x-auto ${className}`}
      >
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`min-h-[38px] px-4 py-1.5 rounded-[var(--r-sm)] text-xs font-heading font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#002147] text-white border border-white/20 shadow-hard-sm'
                  : 'text-[var(--text-muted)] hover:text-[#002147] hover:bg-[var(--surface)]'
              }`}
            >
              {tab.icon && <span className="shrink-0 inline-flex items-center">{tab.icon}</span>}
              <span className="whitespace-nowrap">{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-mono rounded-xs shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[var(--line)] text-[var(--text)]'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      className={`flex border-b-2 border-[var(--line)] overflow-x-auto gap-1 sm:gap-2 ${className}`}
    >
      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`min-h-[44px] px-4 py-2.5 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider relative transition-colors flex items-center gap-2 shrink-0 cursor-pointer whitespace-nowrap ${
              isActive
                ? 'text-[#002147]'
                : 'text-[var(--text-muted)] hover:text-[#002147]'
            }`}
          >
            {tab.icon && <span className="shrink-0 inline-flex items-center">{tab.icon}</span>}
            <span className="whitespace-nowrap">{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] rounded-xs shrink-0">
                {tab.badge}
              </span>
            )}
            {isActive && (
              <span
                className="absolute bottom-[-2px] left-0 right-0 h-1 bg-[#F2B705]"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
