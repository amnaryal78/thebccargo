import React, { useState } from 'react';
import {
  Ban,
  Beef,
  BookOpen,
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
import { ShipStepAnimation, type AnimKind } from './anim/ShipAnimations';

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
          className="group flex items-start gap-3.5 p-3.5 rounded-[var(--r-sm)] bg-[#F6F9FD] border border-[#D5DEEA] transition-all duration-200 hover:-translate-y-0.5 hover:border-ox-900/40 hover:shadow-md motion-reduce:hover:translate-y-0"
        >
          <span className="w-11 h-11 rounded-xl bg-ox-900 text-gd-500 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 motion-reduce:group-hover:scale-100">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 text-[15px]">
            <Bi item={item} enClass="font-semibold text-ox-900" />
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
            <span className="font-heading font-bold text-ox-900 leading-tight">
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
            <span className="block font-heading font-bold text-ox-900 leading-snug">
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
          className="min-h-[48px] px-5 rounded-xl bg-ox-900 text-white font-heading font-extrabold text-sm inline-flex items-center justify-center gap-2 leading-none shrink-0 hover:bg-[#123562] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gd-500 focus-visible:ring-offset-2"
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
                className={`flex items-start gap-3.5 p-3.5 rounded-[var(--r-sm)] border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-gd-500 ${
                  on ? 'bg-emerald-50 border-emerald-300' : 'bg-[#F6F9FD] border-[#D5DEEA] hover:border-ox-900/40'
                }`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(i)}
                  className="mt-1 w-5 h-5 shrink-0 accent-ox-900"
                />
                <span className={`min-w-0 text-[15px] ${on ? 'text-slate-600' : 'text-ox-900'}`}>
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
const PackBody: React.FC<{ items: HowToShipItem[] }> = ({ items }) => (
    <ol className="relative list-none m-0 p-0 space-y-4">
      {items.map((item, i) => (
        <li key={i} className="relative flex gap-4">
          {i < items.length - 1 && (
            <span aria-hidden="true" className="absolute left-[17px] top-10 bottom-[-1rem] w-px bg-ox-900/20" />
          )}
          <span className="w-9 h-9 rounded-full bg-ox-900 text-gd-500 font-heading font-extrabold flex items-center justify-center shrink-0">
            {i + 1}
          </span>
          <span className="min-w-0 pt-1 text-[15px] text-slate-800">
            <Bi item={item} enClass="font-semibold text-ox-900" />
          </span>
        </li>
      ))}
    </ol>
);

/* ---------- Step: customs and tax ---------- */
const CustomsBody: React.FC<{ items: HowToShipItem[] }> = ({ items }) => (
  <div className="space-y-5">
    {/* Nepal -> destination, so the two sides of customs are easy to tell apart */}
    <div className="flex items-center gap-2 sm:gap-4 p-4 rounded-[var(--r-sm)] bg-[#F6F9FD] border border-[#D5DEEA]" aria-hidden="true">
      <div className="flex flex-col items-center gap-1.5 text-center min-w-0">
        <span className="w-12 h-12 rounded-xl bg-ox-900 text-gd-500 flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </span>
        <span className="text-xs font-semibold text-ox-900">Nepal</span>
      </div>
      <div className="relative flex-1 h-px border-t-2 border-dashed border-ox-900/40">
        <Plane className="absolute left-1/2 -top-[11px] -translate-x-1/2 w-5 h-5 text-ox-900 bg-[#F6F9FD] px-0.5" />
      </div>
      <div className="flex flex-col items-center gap-1.5 text-center min-w-0">
        <span className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
          <Receipt className="w-6 h-6" />
        </span>
        <span className="text-xs font-semibold text-ox-900">Destination country</span>
      </div>
    </div>

    <ul className="space-y-3 list-none p-0 m-0">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-[15px] text-slate-800">
          <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-ox-900" aria-hidden="true" />
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
          <span className="block font-heading font-bold text-ox-900">
            {item.highlight_en}
            {item.highlight_np ? ` (${item.highlight_np})` : ''}
          </span>
        )}
        <Bi item={item} />
      </li>
    ))}
  </ul>
);

/** Step text plus its small illustration: above the list on phones and tablets, beside it from laptop width. */
const WithAnim: React.FC<{ kind: AnimKind; children: React.ReactNode }> = ({ kind, children }) => (
  <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_248px] gap-5 lg:gap-7 items-start">
    <div className="lg:order-2 lg:sticky lg:top-28">
      <ShipStepAnimation kind={kind} />
    </div>
    <div className="min-w-0 lg:order-1">{children}</div>
  </div>
);

export const StepBody: React.FC<{ section: HowToShipSection; whatsappHref: string }> = ({ section, whatsappHref }) => {
  switch (kindOf(section)) {
    case 'send':
      return (
        <WithAnim kind="send">
          <SendBody items={section.items} />
        </WithAnim>
      );
    case 'rules':
      return (
        <WithAnim kind="rules">
          <RulesBody items={section.items} />
        </WithAnim>
      );
    case 'banned':
      return (
        <WithAnim kind="banned">
          <BannedBody section={section} whatsappHref={whatsappHref} />
        </WithAnim>
      );
    case 'bring':
      return (
        <WithAnim kind="bring">
          <BringBody items={section.items} />
        </WithAnim>
      );
    case 'pack':
      return (
        <WithAnim kind="pack">
          <PackBody items={section.items} />
        </WithAnim>
      );
    case 'customs':
      return <CustomsBody items={section.items} />;
    default:
      return <PlainBody items={section.items} />;
  }
};
