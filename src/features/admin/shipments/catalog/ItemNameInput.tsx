import React, { useId, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { searchCatalog, type CatalogItem } from './index';

interface Props {
  id: string;
  value: string;
  items: CatalogItem[];
  placeholder?: string;
  className: string;
  ariaLabel?: string;
  /** Typing changes the text. */
  onChange: (text: string) => void;
  /** An item was chosen from the list: the form can also fill the unit. */
  onPick: (item: CatalogItem) => void;
  onEnter?: () => void;
  disabled?: boolean;
}

/**
 * Text box that suggests item names while typing. Large rows (48px) so it is easy to tap,
 * arrow keys and Enter work, and typing a name that is not listed still works (it is learned on save).
 */
export const ItemNameInput: React.FC<Props> = ({ id, value, items, placeholder, className, ariaLabel, onChange, onPick, onEnter, disabled }) => {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const results = useMemo(() => (open ? searchCatalog(value, items, 8) : []), [open, value, items]);
  const rows = results.length;
  const show = open && value.trim().length > 0 && (results.length > 0 || value.trim().length > 1);

  const choose = (item: CatalogItem) => {
    onPick(item);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && show) {
      e.preventDefault();
      setActive((a) => Math.min(rows - 1, a + 1));
    } else if (e.key === 'ArrowUp' && show) {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Escape' && show) {
      e.stopPropagation();
      setOpen(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (show && results[active]) choose(results[active]);
      else onEnter?.();
    }
  };

  return (
    <div className="relative">
      <input
        id={id}
        role="combobox"
        aria-expanded={show}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={show && results[active] ? `${listId}-${active}` : undefined}
        aria-label={ariaLabel}
        autoComplete="off"
        disabled={disabled}
        value={value}
        placeholder={placeholder}
        className={className}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {show && (
        <ul id={listId} role="listbox" className="absolute left-0 right-0 top-full mt-1 z-40 max-h-72 overflow-auto rounded-xl border border-ox-900/15 bg-white p-1 shadow-[0_12px_28px_-12px_rgba(11,45,99,0.35)] list-none m-0">
          {results.map((r, i) => (
            <li
              key={r.key}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              // mousedown, not click: the input must not lose focus before the choice registers
              onMouseDown={(e) => {
                e.preventDefault();
                choose(r);
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex items-center gap-3 min-h-[48px] px-3 rounded-lg cursor-pointer ${i === active ? 'bg-[#FFF6D8]' : ''}`}
            >
              <span className="text-xl shrink-0" aria-hidden="true">{r.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-slate-900 truncate">{r.name}</span>
                {(r.hint || r.custom) && <span className="block text-xs text-amber-900 truncate">{r.hint ?? 'Used before'}</span>}
              </span>
              <span className="text-xs font-semibold text-slate-600 shrink-0">{r.unit}</span>
            </li>
          ))}
          {!results.length && (
            <li role="presentation" className="flex items-center gap-2 min-h-[44px] px-3 text-sm text-slate-700">
              <Plus className="w-4 h-4 shrink-0" aria-hidden="true" /> Not in the list. Keep typing "{value.trim()}" and tap Add. It will be remembered.
            </li>
          )}
        </ul>
      )}
    </div>
  );
};
