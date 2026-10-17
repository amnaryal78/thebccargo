import React, { useState } from 'react';
import {
  Ban,
  Beef,
  BookOpen,
  Box,
  CheckCircle2,
  Droplets,
  FileText,
  Gift,
  Laptop,
  MessageSquare,
  Package,
  Pill,
  Plane,
  Receipt,
  Shirt,
  Soup,
  Wheat,
} from 'lucide-react';
import type { HowToShipItem, HowToShipSection } from '../../types/howToShip';

/**
 * How each guide step is drawn. The words always come from the saved guide (Supabase);
 * only the icons and layout live here. Steps are recognised by their saved icon name,
 * then by their number, so staff can edit the text freely.
 */

type Kind = 'send' | 'rules' | 'banned' | 'bring' | 'pack' | 'customs' | 'plain';

export const kindOf = (s: HowToShipSection): Kind => {
  switch (s.icon) {
    case 'PackageCheck':
      return 'send';
    case 'AlertCircle':
      return 'rules';
    case 'Ban':
      return 'banned';
    case 'FileCheck2':
      return 'bring';
    case 'Box':
      return 'pack';
    case 'Scale':
      return 'customs';
  }
  return (['send', 'rules', 'banned', 'bring', 'pack', 'customs'] as const)[s.section_number - 1] ?? 'plain';
};

/** English first, Nepali underneath. Wraps naturally, never forced onto one line. */
const Bi: React.FC<{ item: Pick<HowToShipItem, 'en' | 'np'>; enClass?: string }> = ({ item, enClass = '' }) => (
  <>
    <span className={`block leading-snug ${enClass}`}>{item.en}</span>
    {item.np && (
      <span lang="ne" className="block mt-1 text-sm leading-relaxed text-slate-600">
        {item.np}
      </span>
    )}
  </>
);

const pickIcon = (text: string, table: [RegExp, React.ElementType][], fallback: React.ElementType): React.ElementType => {
  const t = text.toLowerCase();
  return table.find(([re]) => re.test(t))?.[1] ?? fallback;
};

/* ---------- Step: what can you send ---------- */
const SEND_ICONS: [RegExp, React.ElementType][] = [
  [/cloth|shoe|bag|shirt/, Shirt],
  [/dry food|spice|tea|snack|food/, Wheat],
  [/document|book|certificate|paper/, BookOpen],
  [/gift|household|handicraft/, Gift],
  [/medicine|prescri/, Pill],
  [/pickle/, Soup],
];

const SendBody: React.FC<{ items: HowToShipItem[] }> = ({ items }) => (
  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0 m-0">
    {items.map((item, i) => {
      const Icon = pickIcon(item.en, SEND_ICONS, Package);
      return (
        <li
          key={i}
          className="group flex items-start gap-3.5 p-3.5 rounded-[var(--r-sm)] bg-[#F6F9FD] border border-[#D5DEEA] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#002147]/40 hover:shadow-md motion-reduce:hover:translate-y-0"
        >
          <span className="w-11 h-11 rounded-xl bg-[#002147] text-[#F2B705] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 motion-reduce:group-hover:scale-100">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 text-[15px]">
            <Bi item={item} enClass="font-semibold text-[#002147]" />
          </span>
        </li>
      );
    })}
  </ul>
);

/* ---------- Step: special rules ---------- */
const RULE_ICONS: [RegExp, React.ElementType][] = [
  [/medicine/, Pill],
  [/meat/, Beef],
  [/phone|laptop|mobile|battery/, Laptop],
  [/liquid|oil|jhol|झोल/, Droplets],
];

const RulesBody: React.FC<{ items: HowToShipItem[] }> = ({ items }) => (
  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none p-0 m-0">
    {items.map((item, i) => {
      const Icon = pickIcon(`${item.highlight_en ?? ''} ${item.en}`, RULE_ICONS, Package);
      return (
        <li key={i} className="flex flex-col gap-2.5 p-4 rounded-[var(--r-sm)] bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500">
          <span className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" aria-hidden="true" />
            </span>
            <span className="font-heading font-bold text-[#002147] leading-tight">
              {item.highlight_en}
              {item.highlight_np && (
                <span lang="ne" className="block text-sm font-semibold text-amber-900">
                  {item.highlight_np}
                </span>
              )}
            </span>
          </span>
          <span className="text-[15px] text-slate-800">
            <Bi item={item} />
          </span>
        </li>
      );
    })}
  </ul>
);

/* ---------- Step: cannot send ---------- */
const BannedBody: React.FC<{ section: HowToShipSection; whatsappHref: string }> = ({ section, whatsappHref }) => (
  <div className="space-y-5">
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 list-none p-0 m-0">
      {section.items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 py-2.5 border-b border-red-100">
          <Ban className="w-5 h-5 mt-0.5 shrink-0 text-red-600" aria-hidden="true" />
          <span className="min-w-0 text-[15px] text-slate-800">
            <span className="block font-heading font-bold text-[#002147] leading-snug">
              {item.highlight_en}
              {item.highlight_np && (
                <span lang="ne" className="block text-sm font-semibold text-red-800">
                  {item.highlight_np}
                </span>
              )}
            </span>
            <Bi item={item} enClass="mt-0.5" />
          </span>
        </li>
      ))}
    </ul>

    {(section.extra_text_en || section.extra_text_np) && (
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-[var(--r-sm)] bg-red-50 border-2 border-red-300">
        <div className="min-w-0 flex-1 space-y-1">
          {section.extra_text_en && <p className="font-semibold text-red-900 leading-snug">{section.extra_text_en}</p>}
          {section.extra_text_np && (
            <p lang="ne" className="text-sm text-red-900 leading-relaxed">
              {section.extra_text_np}
            </p>
          )}
        </div>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[48px] px-5 rounded-xl bg-[#002147] text-white font-heading font-extrabold text-sm inline-flex items-center justify-center gap-2 leading-none shrink-0 hover:bg-[#123562] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] focus-visible:ring-offset-2"
        >
          <MessageSquare className="w-4 h-4" aria-hidden="true" />
          <span>Ask on WhatsApp</span>
        </a>
      </div>
    )}
  </div>
);

/* ---------- Step: what to bring (a real checklist) ---------- */
const BringBody: React.FC<{ items: HowToShipItem[] }> = ({ items }) => {
  const [done, setDone] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600" aria-live="polite">
        Tick each item as you get it ready: {done.size} of {items.length}. Your ticks are not saved when you leave this page.
      </p>
      <ul className="space-y-2.5 list-none p-0 m-0">
        {items.map((item, i) => {
          const on = done.has(i);
          return (
            <li key={i}>
              <label
                className={`flex items-start gap-3.5 p-3.5 rounded-[var(--r-sm)] border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#F2B705] ${
                  on ? 'bg-emerald-50 border-emerald-300' : 'bg-[#F6F9FD] border-[#D5DEEA] hover:border-[#002147]/40'
                }`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(i)}
                  className="mt-1 w-5 h-5 shrink-0 accent-[#002147]"
                />
                <span className={`min-w-0 text-[15px] ${on ? 'text-slate-600' : 'text-[#002147]'}`}>
                  <Bi item={item} enClass={`font-semibold ${on ? 'line-through decoration-emerald-600/60' : ''}`} />
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/* ---------- Step: how to pack ---------- */
const PackBox: React.FC = () => (
  <svg viewBox="0 0 160 150" className="w-full max-w-[180px] h-auto mx-auto" aria-hidden="true">
    <ellipse cx="80" cy="132" rx="62" ry="9" fill="#002147" opacity="0.14" />
    <polygon points="14,48 80,24 146,48 80,74" fill="#F2B705" />
    <polygon points="14,48 80,74 80,128 14,102" fill="#123562" />
    <polygon points="146,48 80,74 80,128 146,102" fill="#002147" />
    <polygon points="62,31 98,31 112,38 76,46" fill="#fff" fillOpacity="0.6" />
    <polygon points="72,74 88,74 88,128 72,128" fill="#F2B705" />
    <rect x="30" y="82" width="26" height="14" rx="2" fill="#F6F6F4" opacity="0.9" transform="skewY(24)" />
  </svg>
);

const PackBody: React.FC<{ items: HowToShipItem[] }> = ({ items }) => (
  <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6 items-start">
    <ol className="relative list-none m-0 p-0 space-y-4">
      {items.map((item, i) => (
        <li key={i} className="relative flex gap-4">
          {i < items.length - 1 && (
            <span aria-hidden="true" className="absolute left-[17px] top-10 bottom-[-1rem] w-px bg-[#002147]/20" />
          )}
          <span className="w-9 h-9 rounded-full bg-[#002147] text-[#F2B705] font-heading font-extrabold flex items-center justify-center shrink-0">
            {i + 1}
          </span>
          <span className="min-w-0 pt-1 text-[15px] text-slate-800">
            <Bi item={item} enClass="font-semibold text-[#002147]" />
          </span>
        </li>
      ))}
    </ol>
    <div className="hidden md:block pt-2">
      <PackBox />
    </div>
  </div>
);

/* ---------- Step: customs and tax ---------- */
const CustomsBody: React.FC<{ items: HowToShipItem[] }> = ({ items }) => (
  <div className="space-y-5">
    {/* Nepal -> destination, so the two sides of customs are easy to tell apart */}
    <div className="flex items-center gap-2 sm:gap-4 p-4 rounded-[var(--r-sm)] bg-[#F6F9FD] border border-[#D5DEEA]" aria-hidden="true">
      <div className="flex flex-col items-center gap-1.5 text-center min-w-0">
        <span className="w-12 h-12 rounded-xl bg-[#002147] text-[#F2B705] flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </span>
        <span className="text-xs font-semibold text-[#002147]">Nepal</span>
      </div>
      <div className="relative flex-1 h-px border-t-2 border-dashed border-[#002147]/40">
        <Plane className="absolute left-1/2 -top-[11px] -translate-x-1/2 w-5 h-5 text-[#002147] bg-[#F6F9FD] px-0.5" />
      </div>
      <div className="flex flex-col items-center gap-1.5 text-center min-w-0">
        <span className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
          <Receipt className="w-6 h-6" />
        </span>
        <span className="text-xs font-semibold text-[#002147]">Destination country</span>
      </div>
    </div>

    <ul className="space-y-3 list-none p-0 m-0">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-[15px] text-slate-800">
          <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-[#002147]" aria-hidden="true" />
          <span className="min-w-0">
            <Bi item={item} enClass="font-medium" />
          </span>
        </li>
      ))}
    </ul>
  </div>
);

/* ---------- Fallback for any step added by staff ---------- */
const PlainBody: React.FC<{ items: HowToShipItem[] }> = ({ items }) => (
  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none p-0 m-0">
    {items.map((item, i) => (
      <li key={i} className="p-3.5 rounded-[var(--r-sm)] bg-[#F6F9FD] border border-[#D5DEEA] text-[15px] text-slate-800">
        {(item.highlight_en || item.highlight_np) && (
          <span className="block font-heading font-bold text-[#002147]">
            {item.highlight_en}
            {item.highlight_np ? ` (${item.highlight_np})` : ''}
          </span>
        )}
        <Bi item={item} />
      </li>
    ))}
  </ul>
);

export const StepBody: React.FC<{ section: HowToShipSection; whatsappHref: string }> = ({ section, whatsappHref }) => {
  switch (kindOf(section)) {
    case 'send':
      return <SendBody items={section.items} />;
    case 'rules':
      return <RulesBody items={section.items} />;
    case 'banned':
      return <BannedBody section={section} whatsappHref={whatsappHref} />;
    case 'bring':
      return <BringBody items={section.items} />;
    case 'pack':
      return <PackBody items={section.items} />;
    case 'customs':
      return <CustomsBody items={section.items} />;
    default:
      return <PlainBody items={section.items} />;
  }
};
