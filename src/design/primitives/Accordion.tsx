import React, { useState, useId } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItemData {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItemData[];
  defaultOpenId?: string;
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultOpenId,
  allowMultiple = false,
  className = '',
}) => {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenId ? [defaultOpenId] : []);
  const baseId = useId();

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    } else {
      setOpenIds(prev => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={`flex flex-col border border-white/60 rounded-[var(--r-md)] shadow-hard-xs divide-y divide-[var(--line)] bg-[var(--surface)] overflow-hidden ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        const headerId = `${baseId}-header-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;

        return (
          <div key={item.id} className="flex flex-col">
            <h3>
              <button
                type="button"
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleItem(item.id)}
                className="w-full min-h-[48px] px-5 py-4 text-left font-heading font-bold text-sm sm:text-base text-[var(--text)] flex items-center justify-between gap-4 cursor-pointer hover:bg-[var(--surface-2)] transition-colors"
              >
                <span>{item.title}</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-[var(--t-fast)] ease-[var(--ease-out)] ${
                    isOpen ? 'rotate-180 text-[var(--accent-text)]' : 'text-[var(--text-muted)]'
                  }`}
                  aria-hidden="true"
                />
              </button>
            </h3>

            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                className="px-5 pb-5 pt-1 text-sm text-[var(--text-muted)] leading-relaxed border-t border-[var(--line)] bg-[var(--surface)]"
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
