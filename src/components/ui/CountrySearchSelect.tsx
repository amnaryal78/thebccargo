import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export interface CountryOption {
  value: string;
  label: string;
  /** Extra text matched by the search box (e.g. an ISO code). */
  hint?: string;
  flag?: string;
}

interface CountrySearchSelectProps {
  label: string;
  options: CountryOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

/** Same search-as-you-type country picker the Rates page uses, for any form that needs a country. */
export const CountrySearchSelect: React.FC<CountrySearchSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Choose a country',
  required,
  error,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q) || (o.hint || '').toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      document.removeEventListener('mousedown', onDown);
      clearTimeout(t);
    };
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(`${listId}-opt-${activeIdx}`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx, open, listId]);

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery('');
    triggerRef.current?.focus();
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const o = filtered[activeIdx];
      if (o) pick(o.value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div ref={rootRef} className={`relative flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-heading font-bold uppercase tracking-wider text-[var(--text)]">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        className={`min-h-[48px] w-full flex items-center justify-between gap-2 px-4 rounded-[var(--r-sm)] border bg-[var(--surface)] text-left text-sm text-[var(--text)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gd-500 ${
          error ? 'border-red-500' : 'border-[var(--line)]'
        }`}
      >
        <span className={`flex items-center gap-2 truncate ${selected ? '' : 'text-[var(--text-muted)]'}`}>
          {selected?.flag && <span aria-hidden="true">{selected.flag}</span>}
          <span className="truncate">{selected ? selected.label : placeholder}</span>
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)] shadow-xl overflow-hidden">
          <div className="relative border-b border-[var(--line)]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-label={`Search ${label}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKey}
              placeholder="Search country..."
              className="w-full min-h-[44px] pl-9 pr-3 bg-transparent text-sm text-[var(--text)] focus:outline-none"
            />
          </div>
          <ul id={listId} role="listbox" aria-label={label} className="max-h-60 overflow-y-auto p-1.5">
            {filtered.length === 0 && <li className="px-3 py-3 text-sm text-[var(--text-muted)]">No country found</li>}
            {filtered.map((o, i) => (
              <li
                key={o.value}
                id={`${listId}-opt-${i}`}
                role="option"
                aria-selected={o.value === value}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => pick(o.value)}
                className={`flex items-center gap-2 min-h-[40px] px-3 rounded-[var(--r-xs)] text-sm cursor-pointer ${
                  i === activeIdx ? 'bg-[var(--surface-2,#eef1f6)]' : ''
                } ${o.value === value ? 'font-bold text-ox-900' : 'text-[var(--text)]'}`}
              >
                {o.flag && <span aria-hidden="true">{o.flag}</span>}
                <span>{o.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};
