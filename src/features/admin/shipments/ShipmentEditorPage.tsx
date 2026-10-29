import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Calculator, Check, CircleAlert, CircleDot, FileText, Landmark, Lightbulb, Loader2, Lock, MapPin, Minus, Package, Pencil, Plus, Printer, Save, Scale, Send, ShieldCheck, Trash2, Wrench, X } from 'lucide-react';
import { Spotlight } from '../../../components/ui/spotlight';
import { adminDataService } from '../services/adminDataService';
import { useMyPermissions } from '../usePermissions';
import { roleLabel } from '../users/PersonDialog';
import { useAuth } from '../../../context/AuthContext';
import { COUNTRIES } from '../../../data/countries';
import { useEstimatorData } from '../../estimator/useEstimatorData';
import { calculateSheetShipmentQuote } from '../../estimator/engine';
import {
  GOODS_UNITS,
  LIQUID_KINDS,
  amountInWords,
  autoBoxCount,
  autoMeatRate,
  computeBill,
  effectiveBoxCount,
  fmtMoney,
  generateBillNo,
  newBillDraft,
  resizeBoxes,
  uid,
  validateBill,
  type BillDraft,
  type BoxDraft,
  type LiquidKind,
  type MeatItem,
  liquidName,
  liquidKindLabel,
  type Party,
} from './billing/model';
import { buildBoxSheetsHtml, buildCustomerBillHtml, openPrintWindow, type BillSnapshot } from './billing/print';
import { fromShipmentRow, toShipmentRow } from './billing/persist';
import { boxItemCount, collectIssues, type Issue } from './billing/issues';
import { ItemNameInput } from './catalog/ItemNameInput';
import { refreshLearnedItems, useItemCatalog } from './catalog/useItemCatalog';
import { declareName, type CatalogItem } from './catalog';

const STATUSES = [
  ['pending', 'Pending'],
  ['in_transit', 'In transit'],
  ['customs_cleared', 'Customs cleared'],
  ['out_for_delivery', 'Out for delivery'],
  ['delivered', 'Delivered'],
  ['cancelled', 'Cancelled'],
] as const;

const DRAFT_KEY = 'bc_shipment_draft_new_v1';
const todayIso = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
};

const inp =
  'w-full min-w-0 min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-500 transition-colors hover:border-ox-900/50 focus:outline-none focus:border-ox-900 focus:ring-4 focus:ring-gd-500/40 disabled:bg-slate-100 disabled:text-slate-500';
const lbl = 'block text-xs font-bold text-slate-700 mb-1.5';
const btnPrimary =
  'min-h-[44px] px-5 rounded-xl bg-ox-900 text-white font-bold text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer transition-colors hover:bg-[#123562] hover:text-gd-500 active:bg-[#001A38] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-ox-900 disabled:hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gd-500/70';
const btnGhost =
  'min-h-[44px] px-4 rounded-xl border border-slate-300 bg-white text-ox-900 font-bold text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer transition-colors hover:border-ox-900 hover:bg-[#FFF6D8] active:bg-[#FFEFB8] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gd-500/70';
const card = 'rounded-2xl bg-white border border-ox-900/10 shadow-[0_1px_2px_rgba(11,45,99,0.05),0_12px_28px_-16px_rgba(11,45,99,0.18)] p-4 sm:p-6 min-w-0';
const warnBox = 'flex items-start gap-2 text-sm font-semibold rounded-xl px-3 py-2.5 border text-amber-900 bg-[#FFF6D8] border-gd-500/60';

/** Icon chip + title + one-line hint. Every section header looks the same. */
const SectionHead: React.FC<{ icon: React.ComponentType<{ className?: string }>; id?: string; title: string; hint?: string; as?: 'h2' | 'h3'; aside?: React.ReactNode }> = ({ icon: Icon, id, title, hint, as: Tag = 'h2', aside }) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div className="flex items-start gap-3 min-w-0">
      <span className="shrink-0 w-9 h-9 rounded-xl bg-ox-900 text-gd-500 inline-flex items-center justify-center" aria-hidden="true"><Icon className="w-[18px] h-[18px]" /></span>
      <div className="min-w-0">
        <Tag id={id} className="font-heading font-extrabold text-lg leading-tight text-ox-900">{title}</Tag>
        {hint && <p className="text-xs text-slate-600 mt-0.5">{hint}</p>}
      </div>
    </div>
    {aside}
  </div>
);

const Req: React.FC = () => <span className="text-red-700" aria-hidden="true"> *</span>;

/** JSON with sorted keys, so a jsonb round trip (which reorders keys) never looks like an edit. */
const stable = (v: unknown): string =>
  JSON.stringify(v, (_k, val) => (val && typeof val === 'object' && !Array.isArray(val) ? Object.fromEntries(Object.entries(val).sort(([a], [b]) => a.localeCompare(b))) : val));

const dialOf = (country: string): string => {
  const c = COUNTRIES.find((x) => x.name === country);
  return c ? `+${c.dial}` : '';
};

/** Replace a leading dial code (from the previous country) with the new one; leave a typed number alone. */
function withDial(phone: string, prevCountry: string, nextCountry: string): string {
  const prev = dialOf(prevCountry);
  const next = dialOf(nextCountry);
  const trimmed = phone.trim();
  if (!next) return phone;
  if (!trimmed || trimmed === prev) return `${next} `;
  if (prev && trimmed.startsWith(prev)) return `${next}${trimmed.slice(prev.length)}`;
  return phone;
}

/** Everything a field needs to show a problem and fix it: shared by the party forms, boxes and charges. */
interface FieldCtx {
  /** The issue for a key, once the field was touched or a save was tried (warnings show at once). */
  issue: (key: string) => Issue | undefined;
  touch: (key: string) => void;
  fix: (key: string) => void;
}

const bad = (ctx: FieldCtx, key: string) => (ctx.issue(key)?.level === 'error' ? 'border-red-600! focus:ring-red-200!' : '');
const aria = (ctx: FieldCtx, key: string) => ({
  'aria-invalid': ctx.issue(key)?.level === 'error' ? (true as const) : undefined,
  'aria-describedby': ctx.issue(key) ? `${key}-msg` : undefined,
  onBlur: () => ctx.touch(key),
});

/** One problem message with its one-click fix. Slides in so a new error is noticed. */
const FieldMsg: React.FC<{ ctx: FieldCtx; k: string }> = ({ ctx, k }) => {
  const issue = ctx.issue(k);
  return (
    <AnimatePresence initial={false}>
      {issue && (
        <motion.div
          key={issue.message}
          id={`${k}-msg`}
          role={issue.level === 'error' ? 'alert' : 'status'}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className={`mt-1.5 flex flex-wrap items-start gap-x-2 gap-y-1 text-xs font-semibold ${issue.level === 'error' ? 'text-red-700' : 'text-amber-900'}`}
        >
          <span className="inline-flex items-start gap-1.5 min-w-0">
            {issue.level === 'error' ? <CircleAlert className="w-3.5 h-3.5 mt-px shrink-0" aria-hidden="true" /> : <AlertTriangle className="w-3.5 h-3.5 mt-px shrink-0" aria-hidden="true" />}
            <span className="min-w-0 break-words">{issue.message}</span>
          </span>
          {issue.fix && (
            <button type="button" onClick={() => ctx.fix(k)} className="inline-flex items-center gap-1 rounded-lg bg-ox-900 text-white px-2 py-1 text-xs font-bold cursor-pointer transition-colors hover:bg-[#123562] hover:text-gd-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gd-500/70">
              <Wrench className="w-3 h-3" aria-hidden="true" /> {issue.fix.label}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** Small count pill. Pops when the number changes so adding or removing an item is visible. */
const Count: React.FC<{ n: number; label: string }> = ({ n, label }) => (
  <motion.span
    key={n}
    initial={{ scale: 1.35 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
    aria-label={`${n} ${label}`}
    className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-bold ${n ? 'bg-ox-900 text-gd-500' : 'bg-slate-100 text-slate-600'}`}
  >
    {n}
  </motion.span>
);

const Num: React.FC<{
  value: number | null;
  onChange: (n: number | null) => void;
  step?: string;
  ariaLabel?: string;
  className?: string;
  placeholder?: string;
  id?: string;
  ctx?: FieldCtx;
  k?: string;
}> = ({ id, value, onChange, step = 'any', ariaLabel, className = '', placeholder, ctx, k }) => (
  <input
    id={id ?? k}
    type="number"
    inputMode="decimal"
    min="0"
    step={step}
    aria-label={ariaLabel}
    placeholder={placeholder}
    value={value === null ? '' : value}
    onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
    className={`${inp} ${ctx && k ? bad(ctx, k) : ''} ${className}`}
    {...(ctx && k ? aria(ctx, k) : {})}
  />
);

const PartyForm: React.FC<{
  title: string;
  party: Party;
  onChange: (p: Party) => void;
  lockCountryNote?: string;
  idp: 'sender' | 'receiver';
  required: boolean;
  ctx: FieldCtx;
}> = ({ title, party, onChange, lockCountryNote, idp, required, ctx }) => (
  <fieldset className={`${card} space-y-4`}>
    <legend className="sr-only">{title}</legend>
    <SectionHead icon={idp === 'sender' ? Send : MapPin} title={title} hint={idp === 'sender' ? '📤 Who is handing the parcel over.' : '📥 Who receives it, and where it goes.'} />
    <div>
      <label htmlFor={`${idp}-name`} className={lbl}>Full name{required && <Req />}</label>
      <input id={`${idp}-name`} value={party.name} onChange={(e) => onChange({ ...party, name: e.target.value })} className={`${inp} ${bad(ctx, `${idp}-name`)}`} autoComplete="off" placeholder={idp === 'sender' ? 'e.g. Sita Sharma' : 'e.g. John Smith'} {...aria(ctx, `${idp}-name`)} />
      <FieldMsg ctx={ctx} k={`${idp}-name`} />
    </div>
    <div>
      <label htmlFor={`${idp}-country`} className={lbl}>Country{required && <Req />}</label>
      <select
        id={`${idp}-country`}
        value={party.country}
        onChange={(e) => onChange({ ...party, country: e.target.value, phone: withDial(party.phone, party.country, e.target.value) })}
        className={`${inp} ${bad(ctx, `${idp}-country`)}`}
        {...aria(ctx, `${idp}-country`)}
      >
        <option value="">Choose a country</option>
        {COUNTRIES.map((c) => (
          <option key={c.iso2} value={c.name}>{c.name}</option>
        ))}
      </select>
      <FieldMsg ctx={ctx} k={`${idp}-country`} />
      {lockCountryNote && <p className="text-xs text-slate-600 mt-1.5">{lockCountryNote}</p>}
    </div>
    <div>
      <label htmlFor={`${idp}-phone`} className={lbl}>Phone{required && idp === 'receiver' && <Req />}</label>
      <input id={`${idp}-phone`} type="tel" inputMode="tel" autoComplete="off" value={party.phone} onChange={(e) => onChange({ ...party, phone: e.target.value })} className={`${inp} ${bad(ctx, `${idp}-phone`)}`} placeholder={dialOf(party.country) ? `${dialOf(party.country)} 98XXXXXXXX` : 'Choose the country first'} {...aria(ctx, `${idp}-phone`)} />
      <FieldMsg ctx={ctx} k={`${idp}-phone`} />
      {!ctx.issue(`${idp}-phone`) && dialOf(party.country) && <p className="text-xs text-slate-600 mt-1.5">Country code {dialOf(party.country)} is added for you.</p>}
    </div>
    <div>
      <label htmlFor={`${idp}-address`} className={lbl}>Address{required && idp === 'receiver' && <Req />}</label>
      <textarea id={`${idp}-address`} rows={2} value={party.address} onChange={(e) => onChange({ ...party, address: e.target.value })} className={`${inp} py-2 resize-y ${bad(ctx, `${idp}-address`)}`} placeholder="House no., street, city, postcode" {...aria(ctx, `${idp}-address`)} />
      <FieldMsg ctx={ctx} k={`${idp}-address`} />
    </div>
    <div>
      <label htmlFor={`${idp}-email`} className={lbl}>Email (optional)</label>
      <input id={`${idp}-email`} type="email" inputMode="email" autoComplete="off" value={party.email} onChange={(e) => onChange({ ...party, email: e.target.value })} className={`${inp} ${bad(ctx, `${idp}-email`)}`} placeholder="name@gmail.com" {...aria(ctx, `${idp}-email`)} />
      <FieldMsg ctx={ctx} k={`${idp}-email`} />
    </div>
  </fieldset>
);

/**
 * One saved item. Shows as a tidy summary with a pencil; the pencil opens the same inputs the add row
 * uses so it can be corrected later. Trash removes it.
 */
const ItemRow: React.FC<{
  emoji: string;
  title: string;
  detail: string;
  what: string;
  editing: boolean;
  onEdit: () => void;
  onDone: () => void;
  onRemove: () => void;
  cols: string;
  children: React.ReactNode;
}> = ({ emoji, title, detail, what, editing, onEdit, onDone, onRemove, cols, children }) => {
  const iconBtn = 'min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gd-500/70';
  return (
    <motion.li layout="position" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.18 }} className="py-2 border-b border-slate-100 last:border-b-0">
      {editing ? (
        <div className={`grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_92px] ${cols} gap-2 items-center rounded-xl bg-[#FFF6D8]/60 p-2`}>
          {children}
          <div className="col-start-3 row-start-1 sm:col-start-auto sm:row-start-auto flex gap-1 justify-end">
            <button type="button" onClick={onDone} aria-label={`Done editing ${what}`} title="Done" className={`${iconBtn} bg-ox-900 text-gd-500 hover:bg-[#123562]`}><Check className="w-4 h-4" aria-hidden="true" /></button>
            <button type="button" onClick={onRemove} aria-label={`Remove ${what}`} title="Remove" className={`${iconBtn} text-red-700 hover:bg-red-50`}><Trash2 className="w-4 h-4" aria-hidden="true" /></button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="shrink-0 w-9 h-9 rounded-xl bg-[#EEF3F9] inline-flex items-center justify-center text-lg" aria-hidden="true">{emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900 truncate">{title}</p>
            <p className="text-xs text-slate-600 truncate">{detail}</p>
          </div>
          <button type="button" onClick={onEdit} aria-label={`Edit ${what}`} title="Edit" className={`${iconBtn} text-ox-900 hover:bg-[#FFF6D8]`}><Pencil className="w-4 h-4" aria-hidden="true" /></button>
          <button type="button" onClick={onRemove} aria-label={`Remove ${what}`} title="Remove" className={`${iconBtn} text-red-700 hover:bg-red-50`}><Trash2 className="w-4 h-4" aria-hidden="true" /></button>
        </div>
      )}
    </motion.li>
  );
};

/** Meat to a country that does not normally take it needs three deliberate yeses. */
const MeatConfirm: React.FC<{ country: string; name: string; kg: number; qty: number; rate: number; onCancel: () => void; onConfirm: () => void }> = ({ country, name, kg, qty, rate, onCancel, onConfirm }) => {
  const [step, setStep] = useState(1);
  const nextRef = React.useRef<HTMLButtonElement>(null);
  useEffect(() => { nextRef.current?.focus(); }, [step]);
  const steps = [
    { emoji: '🥩', title: `Meat to ${country}?`, body: `Meat is normally allowed only for Europe, the UK and Hong Kong. ${country} is not on that list.`, back: 'Cancel', next: 'Continue' },
    { emoji: '⚠️', title: 'Customs may stop this parcel', body: `A parcel with meat to ${country} can be held, sent back or destroyed, usually at the customer's cost. Has the customer been told?`, back: 'Go back', next: 'Yes, they know' },
    { emoji: '🧾', title: 'Final check', body: rate > 0 ? `You are adding ${name} (${money2(kg * qty)} kg) at Rs ${money2(rate)} per kg. It will print on the customer bill and the box sheet.` : `You are adding ${name} (${money2(kg * qty)} kg). There is no meat rate for ${country}, so it bills at Rs 0 unless you type a meat charge under Charges. It will print on the bill.`, back: 'Go back', next: 'Add meat anyway' },
  ];
  const s = steps[step - 1];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00152D]/60 p-4" role="dialog" aria-modal="true" aria-labelledby="meat-t" onKeyDown={(e) => e.key === 'Escape' && onCancel()}>
      <motion.div key={step} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.18 }} className="w-full max-w-md bg-white rounded-2xl p-6 space-y-4 shadow-xl border-t-4 border-gd-500">
        <p className="text-xs font-bold text-slate-600">Step {step} of 3</p>
        <div className="flex items-start gap-3">
          <span className="text-3xl leading-none" aria-hidden="true">{s.emoji}</span>
          <div>
            <h2 id="meat-t" className="font-heading font-extrabold text-xl text-ox-900">{s.title}</h2>
            <p className="text-sm text-slate-700 mt-1">{s.body}</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={() => (step === 1 ? onCancel() : setStep(step - 1))} className={btnGhost}>{s.back}</button>
          <button type="button" ref={nextRef} onClick={() => (step === 3 ? onConfirm() : setStep(step + 1))} className={btnPrimary}>{s.next}</button>
        </div>
      </motion.div>
    </div>
  );
};
const money2 = (n: number) => fmtMoney(n);

const BoxSection: React.FC<{
  box: BoxDraft;
  index: number;
  total: number;
  country: string;
  meatAllowed: boolean;
  meatRate: number;
  onChange: (b: BoxDraft) => void;
  ctx: FieldCtx;
  goodsCatalog: CatalogItem[];
  meatCatalog: CatalogItem[];
}> = ({ box, index, total, country, meatAllowed, meatRate, onChange, ctx, goodsCatalog, meatCatalog }) => {
  const [g, setG] = useState({ name: '', unit: 'pcs', qty: '' });
  const [l, setL] = useState<{ kind: LiquidKind; other: string; unit: string; qty: string }>({ kind: 'Ghee', other: '', unit: 'btl', qty: '' });
  const [m, setM] = useState({ name: '', kg: '', qty: '' });
  const [gErr, setGErr] = useState<string | null>(null);
  const [lErr, setLErr] = useState<string | null>(null);
  const [mErr, setMErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [meatAsk, setMeatAsk] = useState<MeatItem | null>(null);

  const addGoods = () => {
    const qty = Number(g.qty);
    if (!g.name.trim()) return setGErr('Enter the item name, for example "Dhaka topi".');
    if (!(qty > 0)) return setGErr('Enter how many. The quantity must be more than 0.');
    onChange({ ...box, goods: [...box.goods, { id: uid(), name: declareName(g.name.trim()), unit: g.unit || 'pcs', qty }] });
    setG({ ...g, name: '', qty: '' });
    setGErr(null);
  };
  const addLiquid = () => {
    const qty = Number(l.qty);
    if (l.kind === 'Other' && !l.other.trim()) return setLErr('Enter the liquid name, or pick Ghee, Oil or Honey.');
    if (!(qty > 0)) return setLErr('Enter how many bottles. The quantity must be more than 0.');
    onChange({ ...box, liquids: [...box.liquids, { id: uid(), kind: l.kind, otherName: l.kind === 'Other' ? declareName(l.other.trim()) : '', unit: l.unit || 'btl', qty }] });
    setL({ ...l, other: '', qty: '' });
    setLErr(null);
  };
  const addMeat = () => {
    const qty = Number(m.qty);
    const kg = Number(m.kg);
    if (!m.name.trim()) return setMErr('Enter the meat name, for example "Dried buffalo".');
    if (!(kg > 0)) return setMErr('Enter the weight of one piece in kg, more than 0.');
    if (!(qty > 0)) return setMErr('Enter how many pieces. The quantity must be more than 0.');
    const item: MeatItem = { id: uid(), name: declareName(m.name.trim()), kgPerUnit: kg, qty };
    setMErr(null);
    if (!meatAllowed) return setMeatAsk(item);
    commitMeat(item);
  };
  const commitMeat = (item: MeatItem) => {
    onChange({ ...box, meats: [...box.meats, item] });
    setM({ name: '', kg: '', qty: '' });
    setMeatAsk(null);
  };
  const onEnter = (fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fn();
    }
  };
  const mapGoods = (id: string, patch: Partial<BoxDraft['goods'][number]>) => onChange({ ...box, goods: box.goods.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  const mapLiquid = (id: string, patch: Partial<BoxDraft['liquids'][number]>) => onChange({ ...box, liquids: box.liquids.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  const mapMeat = (id: string, patch: Partial<BoxDraft['meats'][number]>) => onChange({ ...box, meats: box.meats.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  const key = `box${index}`;
  const items = boxItemCount(box);
  const rowErr = (msg: string | null) => (
    <AnimatePresence initial={false}>
      {msg && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="flex items-start gap-1.5 text-xs font-semibold text-red-700">
          <CircleAlert className="w-3.5 h-3.5 mt-px shrink-0" aria-hidden="true" /> {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
  const sub = (emoji: string, label: string, n: number) => (
    <h4 className="text-sm font-extrabold text-ox-900 flex items-center gap-2"><span aria-hidden="true">{emoji}</span> {label} <Count n={n} label={`${label.toLowerCase()} added`} /></h4>
  );
  const issueKey = `box-${index}`;
  return (
    <section aria-labelledby={`${key}-t`} className={`${card} space-y-5 border-l-4 border-l-gd-500`}>
      <SectionHead
        icon={Package}
        as="h3"
        id={`${key}-t`}
        title={`Box ${index + 1} of ${total}`}
        hint={items ? `${items} item${items === 1 ? '' : 's'} packed in this box.` : 'Add the goods, liquid or meat packed in this box.'}
        aside={
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 shrink-0">
            <span>Box weight (kg, optional)</span>
            <Num id={`${key}-w`} value={box.weightKg} onChange={(n) => onChange({ ...box, weightKg: n })} placeholder="e.g. 18" className="w-24!" ctx={ctx} k={`box-${index}-weight`} />
          </label>
        }
      />
      <FieldMsg ctx={ctx} k={`box-${index}-weight`} />
      <FieldMsg ctx={ctx} k={issueKey} />

      {/* GOODS */}
      <div className="space-y-2">
        {sub('🧺', 'Goods', box.goods.length)}
        <div className="grid grid-cols-2 sm:grid-cols-[minmax(0,1fr)_110px_90px_auto] gap-2 items-end">
          <div className="col-span-2 sm:col-span-1">
            <label className={lbl} htmlFor={`${key}-gn`}>Item name</label>
            <ItemNameInput id={`${key}-gn`} value={g.name} items={goodsCatalog} placeholder="e.g. Shoes, chocolate, socks" onChange={(t) => { setG({ ...g, name: t }); setGErr(null); }} onPick={(it) => { setG({ ...g, name: it.name, unit: it.unit }); setGErr(null); document.getElementById(`${key}-gq`)?.focus(); }} onEnter={addGoods} className={`${inp} ${gErr ? 'border-red-600!' : ''}`} />
          </div>
          <div>
            <label className={lbl} htmlFor={`${key}-gu`}>Type</label>
            <input id={`${key}-gu`} list="unit-list" value={g.unit} placeholder="pcs" onChange={(e) => setG({ ...g, unit: e.target.value })} className={inp} />
          </div>
          <div>
            <label className={lbl} htmlFor={`${key}-gq`}>Quantity</label>
            <input id={`${key}-gq`} type="number" min="0" inputMode="decimal" value={g.qty} placeholder="e.g. 5" onChange={(e) => { setG({ ...g, qty: e.target.value }); setGErr(null); }} onKeyDown={onEnter(addGoods)} className={`${inp} ${gErr ? 'border-red-600!' : ''}`} />
          </div>
          <button type="button" onClick={addGoods} className={`${btnPrimary} col-span-2 sm:col-span-1`}><Plus className="w-4 h-4" aria-hidden="true" /> Add</button>
        </div>
        {rowErr(gErr)}
        {box.goods.length > 0 && (
          <ul className="list-none p-0 m-0" aria-label={`Goods in box ${index + 1}`}>
            <AnimatePresence initial={false}>
              {box.goods.map((it) => (
                <ItemRow key={it.id} emoji="🧺" title={it.name || 'Unnamed item'} detail={`${it.qty} ${it.unit}`} what={it.name || 'item'} editing={editing === it.id} onEdit={() => setEditing(it.id)} onDone={() => setEditing(null)} cols="sm:grid-cols-[minmax(0,1fr)_110px_90px_92px]" onRemove={() => { setEditing(null); onChange({ ...box, goods: box.goods.filter((x) => x.id !== it.id) }); }}>
                  <div className="col-span-2 sm:col-span-1"><ItemNameInput id={`${key}-ge-${it.id}`} ariaLabel="Item name" placeholder="Item name" value={it.name} items={goodsCatalog} onChange={(t) => mapGoods(it.id, { name: t })} onPick={(c) => mapGoods(it.id, { name: c.name, unit: c.unit })} className={`${inp} ${it.name.trim() ? '' : 'border-red-600!'}`} /></div>
                  <input aria-label="Type" list="unit-list" placeholder="pcs" value={it.unit} onChange={(e) => mapGoods(it.id, { unit: e.target.value })} className={inp} />
                  <Num value={it.qty} ariaLabel="Quantity" placeholder="Qty" onChange={(n) => mapGoods(it.id, { qty: n ?? 0 })} />
                </ItemRow>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* LIQUID */}
      <div className="space-y-2 pt-4 border-t border-slate-200">
        {sub('🧴', 'Liquid', box.liquids.length)}
        <div className="grid grid-cols-2 sm:grid-cols-[130px_minmax(0,1fr)_90px_90px_auto] gap-2 items-end">
          <div>
            <label className={lbl} htmlFor={`${key}-lk`}>Kind</label>
            <select id={`${key}-lk`} value={l.kind} onChange={(e) => { setL({ ...l, kind: e.target.value as LiquidKind }); setLErr(null); }} className={inp}>
              {LIQUID_KINDS.map((k) => <option key={k} value={k}>{liquidKindLabel(k)}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl} htmlFor={`${key}-lo`}>{l.kind === 'Other' ? 'Liquid name' : 'Name'}</label>
            <input id={`${key}-lo`} disabled={l.kind !== 'Other'} value={l.kind === 'Other' ? l.other : liquidKindLabel(l.kind)} placeholder="e.g. Mustard oil" onChange={(e) => { setL({ ...l, other: e.target.value }); setLErr(null); }} className={`${inp} ${lErr && l.kind === 'Other' ? 'border-red-600!' : ''}`} />
          </div>
          <div>
            <label className={lbl} htmlFor={`${key}-lu`}>Type</label>
            <input id={`${key}-lu`} list="unit-list" value={l.unit} placeholder="btl" onChange={(e) => setL({ ...l, unit: e.target.value })} className={inp} />
          </div>
          <div>
            <label className={lbl} htmlFor={`${key}-lq`}>Quantity</label>
            <input id={`${key}-lq`} type="number" min="0" inputMode="decimal" value={l.qty} placeholder="e.g. 2" onChange={(e) => { setL({ ...l, qty: e.target.value }); setLErr(null); }} onKeyDown={onEnter(addLiquid)} className={`${inp} ${lErr && l.kind !== 'Other' ? 'border-red-600!' : ''}`} />
          </div>
          <button type="button" onClick={addLiquid} className={`${btnPrimary} col-span-2 sm:col-span-1`}><Plus className="w-4 h-4" aria-hidden="true" /> Add</button>
        </div>
        {rowErr(lErr)}
        {box.liquids.length > 0 && (
          <ul className="list-none p-0 m-0" aria-label={`Liquids in box ${index + 1}`}>
            <AnimatePresence initial={false}>
              {box.liquids.map((it) => (
                <ItemRow key={it.id} emoji="🧴" title={liquidName(it)} detail={`${it.qty} ${it.unit}`} what={liquidName(it)} editing={editing === it.id} onEdit={() => setEditing(it.id)} onDone={() => setEditing(null)} cols="sm:grid-cols-[130px_minmax(0,1fr)_90px_90px_92px]" onRemove={() => { setEditing(null); onChange({ ...box, liquids: box.liquids.filter((x) => x.id !== it.id) }); }}>
                  <select aria-label="Kind" value={it.kind} onChange={(e) => mapLiquid(it.id, { kind: e.target.value as LiquidKind })} className={inp}>
                    {LIQUID_KINDS.map((k) => <option key={k} value={k}>{liquidKindLabel(k)}</option>)}
                  </select>
                  <input aria-label="Liquid name" disabled={it.kind !== 'Other'} placeholder="Liquid name" value={it.kind === 'Other' ? it.otherName : liquidKindLabel(it.kind)} onChange={(e) => mapLiquid(it.id, { otherName: e.target.value })} className={inp} />
                  <input aria-label="Type" list="unit-list" placeholder="btl" value={it.unit} onChange={(e) => mapLiquid(it.id, { unit: e.target.value })} className={inp} />
                  <Num value={it.qty} ariaLabel="Quantity" placeholder="Qty" onChange={(n) => mapLiquid(it.id, { qty: n ?? 0 })} />
                </ItemRow>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* MEAT */}
      <div className="space-y-2 pt-4 border-t border-slate-200">
        {sub('🥩', 'Meat', box.meats.length)}
        {!meatAllowed && <p className={warnBox}><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />Meat is normally allowed only for Europe, UK and Hong Kong. {country || 'This country'} is not on that list, so you will be asked to confirm three times before adding.</p>}
        <div className="grid grid-cols-2 sm:grid-cols-[minmax(0,1fr)_100px_90px_auto] gap-2 items-end">
          <div className="col-span-2 sm:col-span-1">
            <label className={lbl} htmlFor={`${key}-mn`}>Meat name</label>
            <ItemNameInput id={`${key}-mn`} value={m.name} items={meatCatalog} placeholder="e.g. Sukuti, chicken, fish" onChange={(t) => { setM({ ...m, name: t }); setMErr(null); }} onPick={(it) => { setM({ ...m, name: it.name }); setMErr(null); document.getElementById(`${key}-mk`)?.focus(); }} onEnter={addMeat} className={inp} />
          </div>
          <div>
            <label className={lbl} htmlFor={`${key}-mk`}>Kg each</label>
            <input id={`${key}-mk`} type="number" min="0" step="0.1" inputMode="decimal" value={m.kg} placeholder="e.g. 0.5" onChange={(e) => { setM({ ...m, kg: e.target.value }); setMErr(null); }} className={inp} />
          </div>
          <div>
            <label className={lbl} htmlFor={`${key}-mq`}>Quantity</label>
            <input id={`${key}-mq`} type="number" min="0" inputMode="decimal" value={m.qty} placeholder="e.g. 4" onChange={(e) => { setM({ ...m, qty: e.target.value }); setMErr(null); }} onKeyDown={onEnter(addMeat)} className={inp} />
          </div>
          <button type="button" onClick={addMeat} className={`${btnPrimary} col-span-2 sm:col-span-1`}><Plus className="w-4 h-4" aria-hidden="true" /> Add</button>
        </div>
        {rowErr(mErr)}
        {box.meats.length > 0 && (
          <ul className="list-none p-0 m-0" aria-label={`Meat in box ${index + 1}`}>
            <AnimatePresence initial={false}>
              {box.meats.map((it) => (
                <ItemRow key={it.id} emoji="🥩" title={it.name || 'Unnamed meat'} detail={`${it.qty} × ${it.kgPerUnit} kg = ${money2(it.qty * it.kgPerUnit)} kg`} what={it.name || 'meat'} editing={editing === it.id} onEdit={() => setEditing(it.id)} onDone={() => setEditing(null)} cols="sm:grid-cols-[minmax(0,1fr)_100px_90px_92px]" onRemove={() => { setEditing(null); onChange({ ...box, meats: box.meats.filter((x) => x.id !== it.id) }); }}>
                  <div className="col-span-2 sm:col-span-1"><ItemNameInput id={`${key}-me-${it.id}`} ariaLabel="Meat name" placeholder="Meat name" value={it.name} items={meatCatalog} onChange={(t) => mapMeat(it.id, { name: t })} onPick={(c) => mapMeat(it.id, { name: c.name })} className={inp} /></div>
                  <Num value={it.kgPerUnit} ariaLabel="Kg each" placeholder="Kg" onChange={(n) => mapMeat(it.id, { kgPerUnit: n ?? 0 })} />
                  <Num value={it.qty} ariaLabel="Quantity" placeholder="Qty" onChange={(n) => mapMeat(it.id, { qty: n ?? 0 })} />
                </ItemRow>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
      {meatAsk && <MeatConfirm country={country || 'this country'} name={meatAsk.name} kg={meatAsk.kgPerUnit} qty={meatAsk.qty} rate={meatRate} onCancel={() => setMeatAsk(null)} onConfirm={() => commitMeat(meatAsk)} />}
    </section>
  );
};

export const ShipmentEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const { role } = useAuth();
  const canEdit = useMyPermissions().canManageShipments;
  const { sheetRates } = useEstimatorData();
  const catalog = useItemCatalog();

  const [draft, setDraft] = useState<BillDraft>(() => {
    if (isNew) {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) return JSON.parse(raw) as BillDraft;
      } catch { /* ignore broken draft */ }
    }
    const d = newBillDraft(todayIso());
    d.billNo = generateBillNo();
    return d;
  });
  const [status, setStatus] = useState('pending');
  // Who referred this order: '' = independent. Only written to the database when a reseller is chosen or was already set.
  const [resellerId, setResellerId] = useState('');
  const [resellers, setResellers] = useState<{ id: string; label: string }[]>([]);
  const [savedId, setSavedId] = useState<string | null>(isNew ? null : id!);
  const savedIdRef = React.useRef<string | null>(isNew ? null : id!);
  const [savedJson, setSavedJson] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [printOpen, setPrintOpen] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [restored, setRestored] = useState(() => isNew && !!localStorage.getItem(DRAFT_KEY));
  const [newExtra, setNewExtra] = useState({ name: '', amount: '' });
  const [extraErr, setExtraErr] = useState<string | null>(null);
  const [editingExtra, setEditingExtra] = useState<string | null>(null);
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  const [submitted, setSubmitted] = useState(false);

  // Load a saved shipment for editing.
  useEffect(() => {
    if (isNew || savedIdRef.current === id && !loading) return;
    let live = true;
    adminDataService
      .fetchShipment(id!)
      .then((row) => {
        if (!live) return;
        if (!row) {
          setErrors(['This shipment was not found. It may have been deleted.']);
        } else {
          const { draft: d } = fromShipmentRow(row);
          setDraft(d);
          setStatus(row.status || 'pending');
          setResellerId(row.reseller_id ?? '');
          setSavedId(row.id);
          setSavedJson(stable(d) + '|' + (row.status || 'pending') + '|' + (row.reseller_id ?? ''));
          if (search.get('print') === '1') setPrintOpen(true);
        }
      })
      .catch((e: Error) => live && setErrors([e.message]))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [id, isNew]);

  const update = useCallback((fn: (d: BillDraft) => void) => setDraft((prev) => {
    const next = structuredClone(prev);
    fn(next);
    next.boxes = resizeBoxes(next.boxes, effectiveBoxCount(next));
    return next;
  }), []);

  // Free-text recovery for new shipments: nothing typed is lost if the tab is closed by mistake.
  useEffect(() => {
    if (!isNew || savedId) return;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch { /* storage full or blocked */ }
  }, [draft, isNew, savedId]);

  useEffect(() => {
    let live = true;
    adminDataService
      .fetchResellers()
      .then((rows) => live && setResellers(rows.map((r) => ({ id: r.id, label: r.full_name || r.email || 'Reseller' }))))
      .catch(() => undefined); // the picker simply stays on "Independent" if resellers cannot be loaded
    return () => {
      live = false;
    };
  }, []);

  const currentJson = stable(draft) + '|' + status + '|' + resellerId;
  const dirty = savedJson === null ? true : savedJson !== currentJson;
  const hasTyped = !!(draft.receiver.name || draft.sender.name || draft.totalWeightKg || draft.boxes.some((b) => b.goods.length || b.liquids.length || b.meats.length));

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty && hasTyped) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, hasTyped]);

  // Freight from the rate sheet for this country + weight (same engine as the public rate page).
  const baseAuto = useMemo(() => {
    if (!draft.receiver.country || !(draft.totalWeightKg > 0) || !sheetRates.length) return null;
    const q = calculateSheetShipmentQuote(
      { destination: draft.receiver.country, actualWeightKg: draft.totalWeightKg, hasLiquid: false, hasMedicine: false, hasMeat: false, meatKg: 0 },
      sheetRates
    );
    return q.allowed ? q.baseShippingCharge : null;
  }, [draft.receiver.country, draft.totalWeightKg, sheetRates]);

  const result = useMemo(() => computeBill(draft, baseAuto), [draft, baseAuto]);
  const boxCount = result.boxCount;
  const allIssues = useMemo(() => collectIssues(draft), [draft]);
  const ctx = useMemo(() => ({
    issue: (key: string): Issue | undefined => {
      const i = allIssues[key];
      if (!i) return undefined;
      return i.level === 'warn' || submitted || touched.has(key) ? i : undefined;
    },
    touch: (key: string) => setTouched((t) => (t.has(key) ? t : new Set(t).add(key))),
    fix: (key: string) => {
      const fix = allIssues[key]?.fix;
      if (fix) update((d) => fix.apply(d));
    },
  }), [allIssues, submitted, touched, update]);
  const blocking = useMemo(() => Object.entries(allIssues).filter(([, i]) => i.level === 'error'), [allIssues]);
  const itemTotal = draft.boxes.slice(0, boxCount).reduce((n, b) => n + boxItemCount(b), 0);

  const leave = () => {
    if (dirty && hasTyped && !window.confirm('You have changes that are not saved. Leave this page and lose them?')) return;
    navigate('/admin/shipments');
  };

  const save = async (thenPrint: boolean) => {
    setSubmitted(true);
    const errs = blocking.length ? blocking.map(([, i]) => i.message) : validateBill(draft);
    setErrors(errs);
    setNotice(null);
    if (errs.length) {
      document.getElementById('form-errors')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    setSaving(true);
    try {
      const row = toShipmentRow(draft, result, status);
      // Skipped for a new independent order so saving keeps working before the reseller migration is applied.
      if (resellerId || (savedId && savedJson !== null && !savedJson.endsWith('|'))) row.reseller_id = resellerId || null;
      const saved = savedId ? await adminDataService.updateShipment(savedId, row) : await adminDataService.createShipment(row);
      // Read it back so we know it really is in the database before saying so.
      const check = await adminDataService.fetchShipment(saved.id);
      if (!check || Number(check.total_npr) !== result.total) throw new Error('Saved, but the stored total does not match. Please reload and check.');
      setSavedId(saved.id);
      savedIdRef.current = saved.id;
      setSavedJson(currentJson);
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      setRestored(false);
      // Remember every item name on this bill so it is suggested next time. Never blocks or fails the save.
      void adminDataService
        .recordItemUsage(
          draft.boxes.slice(0, result.boxCount).flatMap((b) => [
            ...b.goods.map((g) => ({ name: g.name, unit: g.unit })),
            ...b.liquids.map((q) => ({ name: liquidName(q), unit: q.unit })),
            ...b.meats.map((m) => ({ name: m.name, unit: 'pcs' })),
          ])
        )
        .then(refreshLearnedItems)
        .catch(() => undefined);
      setNotice(`Saved ${draft.billNo}. Total Rs ${fmtMoney(result.total)}.`);
      if (isNew) navigate(`/admin/shipments/${saved.id}`, { replace: true });
      if (thenPrint) setPrintOpen(true);
    } catch (e) {
      const msg = (e as Error).message || 'Save failed.';
      setErrors([/duplicate|unique|23505/i.test(msg) ? `Bill number ${draft.billNo} is already used. Change it and save again.` : `Not saved: ${msg}`]);
    } finally {
      setSaving(false);
    }
  };

  const snap: BillSnapshot = useMemo(() => ({ draft, result }), [draft, result]);
  const canPrint = !!savedId && !dirty;
  const doPrint = (html: string) => setPopupBlocked(!openPrintWindow(html));

  if (!canEdit) {
    return (
      <div className={`${card} max-w-xl mx-auto text-center space-y-3`}>
        <span className="mx-auto w-12 h-12 rounded-2xl bg-[#FFF6D8] text-[#8C6400] inline-flex items-center justify-center" aria-hidden="true"><Lock className="w-6 h-6" /></span>
        <h1 className="font-heading font-extrabold text-xl text-ox-900">You can view shipments, not edit them</h1>
        <p className="text-sm text-slate-700">Your role is <strong>{role ? roleLabel(role) : 'Staff'}</strong>. Creating and editing shipments needs the Admin or Manager role. Ask an admin to change your role in Users &amp; Roles.</p>
        <button type="button" onClick={() => navigate('/admin/shipments')} className={btnPrimary}><ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to shipments</button>
      </div>
    );
  }
  if (loading) return <p className="p-6 text-slate-700" role="status">Loading shipment…</p>;

  const rateRow = (rid: string, label: string, hint: string, auto: string, ov: number | null, setOv: (n: number | null) => void, extra?: React.ReactNode) => (
    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto_170px] gap-x-4 gap-y-2 items-end py-3 border-b border-slate-100 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-900">{label}</p>
        <p className="text-xs text-slate-600">{hint}</p>
        {extra}
      </div>
      <p className="text-sm font-mono text-slate-800 sm:text-right whitespace-nowrap">Auto: <strong className={auto === 'no rate' ? 'text-amber-900' : ''}>{auto}</strong></p>
      <div>
        <label htmlFor={rid} className="sr-only">{label} manual amount</label>
        <Num id={rid} value={ov} onChange={setOv} placeholder="Manual Rs" ctx={ctx} k={rid} />
        <FieldMsg ctx={ctx} k={rid} />
      </div>
    </div>
  );

  return (
    <MotionConfig reducedMotion="user">
    <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6 pb-8">
      <datalist id="unit-list">{GOODS_UNITS.map((u) => <option key={u} value={u} />)}</datalist>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={leave} className={btnGhost} aria-label="Back to shipments"><ArrowLeft className="w-4 h-4" aria-hidden="true" /> <span className="hidden sm:inline">Shipments</span></button>
          <div className="min-w-0">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl leading-tight text-ox-900 break-words">{isNew && !savedId ? 'New shipment' : `Shipment ${draft.billNo}`}</h1>
            <p className="text-xs text-slate-600 mt-0.5">International shipment from Nepal. Fields marked <span className="text-red-700">*</span> are required.</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border whitespace-nowrap ${!savedId ? 'bg-slate-100 text-slate-700 border-slate-300' : dirty ? 'bg-[#FFF6D8] text-amber-900 border-gd-500' : 'bg-emerald-50 text-emerald-800 border-emerald-300'}`} role="status">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : !savedId ? <CircleDot className="w-3.5 h-3.5" aria-hidden="true" /> : dirty ? <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" /> : <Check className="w-3.5 h-3.5" aria-hidden="true" />}
          {saving ? 'Saving…' : savedId ? (dirty ? 'Unsaved changes' : 'Saved to database') : 'Not saved yet'}
        </span>
      </header>

      <details className="group rounded-2xl border border-ox-900/10 bg-white shadow-sm">
        <summary className="flex items-center gap-2.5 px-4 py-3 cursor-pointer list-none text-sm font-bold text-ox-900 rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gd-500/70">
          <Lightbulb className="w-4 h-4 text-[#8C6400]" aria-hidden="true" /> How to fill this form
          <span className="ml-auto text-xs font-semibold text-slate-600 group-open:hidden">Show</span>
          <span className="ml-auto text-xs font-semibold text-slate-600 hidden group-open:inline">Hide</span>
        </summary>
        <div className="px-4 pb-4 grid gap-3 sm:grid-cols-2 text-sm text-slate-700">
          <ol className="list-decimal pl-5 space-y-1.5">
            <li><span aria-hidden="true">📝 </span>Check the bill number and date at the top.</li>
            <li><span aria-hidden="true">📤 </span>Fill in the sender, then the receiver and destination country.</li>
            <li><span aria-hidden="true">⚖️ </span>Enter the total weight. One box is added for every 20 kg.</li>
            <li><span aria-hidden="true">🧺 </span>In each box add goods, liquid and meat, then tap <strong>Add</strong>.</li>
            <li><span aria-hidden="true">💰 </span>Check the charges. Type an amount to replace an automatic one.</li>
            <li><span aria-hidden="true">💾 </span>Save, then print the bill and box sheets.</li>
          </ol>
          <ul className="list-none p-0 m-0 space-y-1.5">
            <li className="flex gap-2"><Pencil className="w-4 h-4 mt-0.5 shrink-0 text-ox-900" aria-hidden="true" /> The pencil on any added item lets you change it later.</li>
            <li className="flex gap-2"><Wrench className="w-4 h-4 mt-0.5 shrink-0 text-ox-900" aria-hidden="true" /> A navy fix button under an error repairs it in one tap.</li>
            <li className="flex gap-2"><ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-ox-900" aria-hidden="true" /> You are signed in as <strong>{role || 'Staff'}</strong> and can create and edit shipments.</li>
            <li className="flex gap-2"><span aria-hidden="true">🥩</span> Meat to a country that does not allow it asks for three confirmations.</li>
          </ul>
        </div>
      </details>

      {restored && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ox-900/20 bg-[#EEF3F9] px-4 py-3 text-sm text-ox-900">
          <span>We restored the form you were filling in earlier.</span>
          <button
            type="button"
            className="font-bold underline cursor-pointer"
            onClick={() => {
              if (!window.confirm('Clear this form and start a new one?')) return;
              try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
              const d = newBillDraft(todayIso());
              d.billNo = generateBillNo();
              setDraft(d);
              setRestored(false);
            }}
          >
            Start a new form
          </button>
        </div>
      )}

      {(errors.length > 0 || notice) && (
        <div id="form-errors" role={errors.length ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${errors.length ? 'border-red-300 bg-red-50 text-red-900' : 'border-emerald-300 bg-emerald-50 text-emerald-900'}`}>
          {errors.length ? (
            <div className="space-y-1"><p className="font-bold flex items-center gap-2"><CircleAlert className="w-4 h-4" aria-hidden="true" /> Not saved yet. Fix {errors.length === 1 ? 'this' : `these ${errors.length}`}:</p><ul className="list-disc pl-5 space-y-0.5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>{blocking[0] && <button type="button" className="font-bold underline cursor-pointer" onClick={() => { const el = document.getElementById(blocking[0][0]); el?.scrollIntoView({ block: 'center', behavior: 'smooth' }); (el as HTMLElement | null)?.focus({ preventScroll: true }); }}>Go to the first problem</button>}</div>
          ) : (
            <p className="flex items-center gap-2"><Check className="w-4 h-4" aria-hidden="true" /> {notice}</p>
          )}
        </div>
      )}

      <section className={`${card} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`} aria-label="Bill details">
        <div>
          <label htmlFor="bill-no" className={lbl}>Bill number<Req /></label>
          <input id="bill-no" value={draft.billNo} onChange={(e) => update((d) => { d.billNo = e.target.value.toUpperCase().replace(/\s/g, ''); })} className={`${inp} font-mono font-bold ${bad(ctx, 'bill-no')}`} placeholder="BC1810AB" {...aria(ctx, 'bill-no')} />
          <FieldMsg ctx={ctx} k="bill-no" />
        </div>
        <div>
          <label htmlFor="bill-date" className={lbl}>Billing date</label>
          <input id="bill-date" type="date" value={draft.date} onChange={(e) => update((d) => { d.date = e.target.value; })} className={inp} />
        </div>
        <div>
          <label htmlFor="bill-status" className={lbl}>Status</label>
          <select id="bill-status" value={status} onChange={(e) => setStatus(e.target.value)} className={inp}>
            {STATUSES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="bill-reseller" className={lbl}>Referred by</label>
          <select id="bill-reseller" value={resellerId} onChange={(e) => setResellerId(e.target.value)} className={inp}>
            <option value="">Independent (no reseller)</option>
            {resellers.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PartyForm idp="sender" title="Sender" required party={draft.sender} onChange={(p) => update((d) => { d.sender = p; })} lockCountryNote="Nepal by default. Change it only if needed." ctx={ctx} />
        <PartyForm idp="receiver" title="Receiver" required party={draft.receiver} onChange={(p) => update((d) => { d.receiver = p; })} ctx={ctx} />
      </div>

      {/* WEIGHT + BOXES */}
      <section className={`${card} space-y-4`} aria-labelledby="wb-t">
        <SectionHead icon={Scale} id="wb-t" title="Weight and boxes" hint="One box is added for every 20 kg unless you set the count yourself." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="total-weight" className={lbl}>Total weight (kg)<Req /></label>
            <Num id="total-weight" value={draft.totalWeightKg || null} placeholder="e.g. 18.5" onChange={(n) => update((d) => { d.totalWeightKg = n ?? 0; })} ctx={ctx} k="total-weight" />
            <FieldMsg ctx={ctx} k="total-weight" />
          </div>
          <div>
            <label htmlFor="box-count" className={lbl}>Number of boxes</label>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="One box fewer" className={`${btnGhost} shrink-0 w-11 px-0!`} onClick={() => update((d) => { d.boxCountMode = 'manual'; d.boxCountManual = Math.max(1, boxCount - 1); })}><Minus className="w-4 h-4" aria-hidden="true" /></button>
              <input
                id="box-count"
                type="number"
                min="1"
                max="200"
                value={boxCount}
                onChange={(e) => update((d) => { d.boxCountMode = 'manual'; d.boxCountManual = Math.max(1, Math.floor(Number(e.target.value)) || 1); })}
                className={`${inp} text-center font-mono font-bold`}
              />
              <button type="button" aria-label="One box more" className={`${btnGhost} shrink-0 w-11 px-0!`} onClick={() => update((d) => { d.boxCountMode = 'manual'; d.boxCountManual = boxCount + 1; })}><Plus className="w-4 h-4" aria-hidden="true" /></button>
            </div>
            <p className="text-xs text-slate-700 mt-1.5 flex flex-wrap items-center gap-x-2">
              {draft.boxCountMode === 'auto' ? (
                <span>Automatic: one box per 20 kg.</span>
              ) : (
                <>
                  <span>Set by hand. Automatic would be {autoBoxCount(draft.totalWeightKg)}.</span>
                  <button type="button" className="font-bold underline cursor-pointer" onClick={() => update((d) => { d.boxCountMode = 'auto'; })}>Use automatic</button>
                </>
              )}
            </p>
          </div>
        </div>
        <FieldMsg ctx={ctx} k="box-count" />
        <FieldMsg ctx={ctx} k="box-weights" />
        <p className="flex items-center gap-2 text-sm text-slate-700"><span aria-hidden="true">📦</span> Items added across all boxes <Count n={itemTotal} label="items in total" /></p>
      </section>

      {draft.boxes.slice(0, boxCount).map((b, i) => (
        <BoxSection
          key={b.id}
          box={b}
          index={i}
          total={boxCount}
          country={draft.receiver.country}
          meatAllowed={result.meatAllowed || !draft.receiver.country}
          meatRate={result.meatRate}
          ctx={ctx}
          goodsCatalog={catalog.goods}
          meatCatalog={catalog.meat}
          onChange={(nb) => update((d) => { d.boxes[i] = nb; })}
        />
      ))}

      {/* CHARGES */}
      <section className={`${card} space-y-3`} aria-labelledby="ch-t">
        <SectionHead icon={Landmark} id="ch-t" title="Charges" hint="Calculated automatically. Type an amount in the right-hand box to replace one." />
        {rateRow(
          'r-freight',
          'Freight (weight)',
          draft.receiver.country ? 'From the rate sheet for this country and weight.' : 'Choose the receiver country first.',
          baseAuto === null ? 'no rate' : `Rs ${fmtMoney(baseAuto)}`,
          draft.weightChargeOverride,
          (n) => update((d) => { d.weightChargeOverride = n; })
        )}
        {rateRow(
          'r-liquid',
          'Liquid',
          `${result.liquidUnits} bottle(s) × Rs ${fmtMoney(draft.liquidRate)} per bottle.`,
          `Rs ${fmtMoney(draft.liquidRate * result.liquidUnits)}`,
          draft.liquidChargeOverride,
          (n) => update((d) => { d.liquidChargeOverride = n; }),
          <label className="text-xs text-slate-700 flex flex-wrap items-center gap-2 mt-1.5">Rate per bottle <Num value={draft.liquidRate} ariaLabel="Liquid rate per bottle" className="w-24! min-h-[36px]!" ctx={ctx} k="rate-liquid" onChange={(n) => update((d) => { d.liquidRate = n ?? 0; })} /></label>
        )}
        {rateRow(
          'r-meat',
          'Meat',
          `${result.meatKg} kg × Rs ${fmtMoney(result.meatRate)} per kg.`,
          `Rs ${fmtMoney(result.meatKg * (draft.meatRateOverride ?? autoMeatRate(draft.receiver.country)))}`,
          draft.meatChargeOverride,
          (n) => update((d) => { d.meatChargeOverride = n; }),
          <label className="text-xs text-slate-700 flex flex-wrap items-center gap-2 mt-1.5">Rate per kg (auto {fmtMoney(autoMeatRate(draft.receiver.country))}) <Num value={draft.meatRateOverride} placeholder="Auto" ariaLabel="Meat rate per kg" className="w-24! min-h-[36px]!" ctx={ctx} k="rate-meat" onChange={(n) => update((d) => { d.meatRateOverride = n; })} /></label>
        )}
        {rateRow(
          'r-box',
          'Custom box',
          `${boxCount} box(es) × Rs ${fmtMoney(draft.boxRate)} per box.`,
          `Rs ${fmtMoney(boxCount * draft.boxRate)}`,
          draft.boxChargeOverride,
          (n) => update((d) => { d.boxChargeOverride = n; }),
          <label className="text-xs text-slate-700 flex flex-wrap items-center gap-2 mt-1.5">Rate per box <Num value={draft.boxRate} ariaLabel="Custom box rate" className="w-24! min-h-[36px]!" ctx={ctx} k="rate-box" onChange={(n) => update((d) => { d.boxRate = n ?? 0; })} /></label>
        )}

        <div className="pt-4 border-t border-slate-200 space-y-2">
          <h3 className="text-sm font-extrabold text-ox-900 flex items-center gap-2"><span aria-hidden="true">💰</span> Additional charges <Count n={draft.extras.length} label="additional charges" /></h3>
          <div className="grid grid-cols-2 sm:grid-cols-[minmax(0,1fr)_130px_auto] gap-2 items-end">
            <div className="col-span-2 sm:col-span-1">
              <label className={lbl} htmlFor="extra-name">Charge name</label>
              <input id="extra-name" value={newExtra.name} placeholder="e.g. Packing fee" onChange={(e) => { setNewExtra({ ...newExtra, name: e.target.value }); setExtraErr(null); }} className={`${inp} ${extraErr ? 'border-red-600!' : ''}`} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className={lbl} htmlFor="extra-amt">Amount (Rs)</label>
              <input id="extra-amt" type="number" inputMode="decimal" value={newExtra.amount} placeholder="e.g. 500" onChange={(e) => { setNewExtra({ ...newExtra, amount: e.target.value }); setExtraErr(null); }} className={`${inp} ${extraErr ? 'border-red-600!' : ''}`} />
            </div>
            <button
              type="button"
              className={`${btnPrimary} col-span-2 sm:col-span-1`}
              onClick={() => {
                const amount = Number(newExtra.amount);
                if (!newExtra.name.trim()) return setExtraErr('Name the charge so it prints on the bill, for example "Packing fee".');
                if (newExtra.amount === '' || !Number.isFinite(amount) || amount === 0) return setExtraErr('Enter the amount in Rs. It cannot be empty or 0.');
                update((d) => { d.extras.push({ id: uid(), name: newExtra.name.trim(), amount }); });
                setNewExtra({ name: '', amount: '' });
                setExtraErr(null);
              }}
            >
              <Plus className="w-4 h-4" aria-hidden="true" /> Add
            </button>
          </div>
          <AnimatePresence initial={false}>
            {extraErr && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="flex items-start gap-1.5 text-xs font-semibold text-red-700">
                <CircleAlert className="w-3.5 h-3.5 mt-px shrink-0" aria-hidden="true" /> {extraErr}
              </motion.p>
            )}
          </AnimatePresence>
          {draft.extras.length > 0 && (
            <ul className="list-none p-0 m-0" aria-label="Additional charges">
              <AnimatePresence initial={false}>
                {draft.extras.map((x, i) => (
                  <React.Fragment key={x.id}>
                    <ItemRow emoji="💰" title={x.name || 'Unnamed charge'} detail={`Rs ${fmtMoney(x.amount)}`} what={x.name || 'charge'} editing={editingExtra === x.id} onEdit={() => setEditingExtra(x.id)} onDone={() => setEditingExtra(null)} cols="sm:grid-cols-[minmax(0,1fr)_130px_92px]" onRemove={() => { setEditingExtra(null); update((d) => { d.extras.splice(i, 1); }); }}>
                      <input id={`extra-${i}`} aria-label="Charge name" placeholder="Charge name" value={x.name} onChange={(e) => update((d) => { d.extras[i].name = e.target.value; })} className={`${inp} col-span-2 sm:col-span-1 ${bad(ctx, `extra-${i}`)}`} />
                      <Num value={x.amount} ariaLabel="Charge amount" placeholder="Rs" onChange={(n) => update((d) => { d.extras[i].amount = n ?? 0; })} />
                    </ItemRow>
                    {ctx.issue(`extra-${i}`) && <li className="list-none"><FieldMsg ctx={ctx} k={`extra-${i}`} /></li>}
                  </React.Fragment>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        <div className="pt-3">
          <label htmlFor="value-up-to" className={lbl}>Value of item, up to (Rs, printed on the bill)</label>
          <Num id="value-up-to" value={draft.valueUpToNpr} className="sm:max-w-[220px]" onChange={(n) => update((d) => { d.valueUpToNpr = n ?? 0; })} />
        </div>
      </section>

      {/* CALCULATION */}
      <Spotlight intensity="subtle" className="rounded-2xl">
      <section className={`${card} space-y-4 border-2 border-ox-900`} aria-labelledby="calc-t">
        <SectionHead icon={Calculator} id="calc-t" title="Calculation" hint="What the customer is billed. Amounts follow the charges above." />
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Bill calculation</caption>
            <thead>
              <tr className="text-left text-xs text-slate-600 border-b-2 border-slate-300">
                <th scope="col" className="py-2 pr-3 font-bold">Description</th><th scope="col" className="py-2 px-2 text-right font-bold">Qty</th><th scope="col" className="py-2 px-2 text-right font-bold">Rate</th><th scope="col" className="py-2 pl-2 text-right font-bold">Amount (Rs)</th>
              </tr>
            </thead>
            <tbody>
              {result.lines.map((l) => (
                <tr key={l.key} className="border-b border-slate-100">
                  <td className="py-2 pr-3 break-words">{l.description}</td><td className="py-2 px-2 text-right font-mono">{l.qty}</td><td className="py-2 px-2 text-right font-mono">{l.rate}</td><td className="py-2 pl-2 text-right font-mono font-bold">{fmtMoney(l.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="sm:hidden list-none p-0 m-0 divide-y divide-slate-100" aria-label="Bill lines">
          {result.lines.map((l) => (
            <li key={l.key} className="py-2.5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 break-words">{l.description}</p>
                <p className="text-xs font-mono text-slate-600">{l.qty} × {l.rate}</p>
              </div>
              <p className="font-mono font-bold text-sm text-slate-900 shrink-0">{fmtMoney(l.amount)}</p>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between gap-3 rounded-xl bg-ox-900 text-white px-4 py-3">
          <span className="font-extrabold">Grand total</span>
          <span className="font-mono font-extrabold text-xl text-gd-500">Rs {fmtMoney(result.total)}</span>
        </div>
        <p className="text-sm text-slate-700"><strong>In words:</strong> {amountInWords(result.total)}</p>
        {result.warnings.map((w) => (
          <p key={w} role="status" className={warnBox}><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />{w}</p>
        ))}
      </section>
      </Spotlight>

      {/* ACTION BAR */}
      <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] md:bottom-0 z-30 -mx-4 sm:mx-0 px-4 py-3 bg-white/95 backdrop-blur-sm border-t border-slate-200 sm:rounded-2xl sm:border flex flex-wrap items-center justify-between gap-3 shadow-[0_-6px_16px_-8px_rgba(11,45,99,0.18)]">
        <p className="text-sm font-mono font-extrabold text-ox-900"><span className="font-body font-semibold text-slate-600 mr-2">Total</span>Rs {fmtMoney(result.total)}</p>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
          <button type="button" onClick={leave} className={btnGhost}><X className="w-4 h-4" aria-hidden="true" /> Close</button>
          <button type="button" disabled={saving} onClick={() => void save(false)} className={btnGhost}>{saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Save className="w-4 h-4" aria-hidden="true" />} {saving ? 'Saving…' : 'Save only'}</button>
          <button type="button" disabled={!canPrint} onClick={() => setPrintOpen(true)} className={btnGhost} title={canPrint ? '' : 'Save first so the paper matches the database'}><FileText className="w-4 h-4" aria-hidden="true" /> Print…</button>
          <button type="button" disabled={saving} onClick={() => void save(true)} className={btnPrimary}><Printer className="w-4 h-4" aria-hidden="true" /> Save + print</button>
        </div>
      </div>

      {/* PRINT CHOOSER */}
      {printOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" role="dialog" aria-modal="true" aria-labelledby="print-t" onKeyDown={(e) => e.key === 'Escape' && setPrintOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl p-6 space-y-4 shadow-xl max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 id="print-t" className="font-heading font-extrabold text-xl text-ox-900">Print {draft.billNo}</h2>
              <button type="button" onClick={() => setPrintOpen(false)} aria-label="Close print options" className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl hover:bg-slate-100 cursor-pointer"><X className="w-5 h-5" aria-hidden="true" /></button>
            </div>
            {!canPrint && <p role="alert" className="text-sm text-amber-900 bg-amber-50 border border-amber-300 rounded-xl px-3 py-2">There are unsaved changes. Save first so the printed bill matches the database.</p>}
            {popupBlocked && <p role="alert" className="text-sm text-red-900 bg-red-50 border border-red-300 rounded-xl px-3 py-2">The browser blocked the print window. Allow pop-ups for this site and try again.</p>}
            <button type="button" disabled={!canPrint} className={`${btnPrimary} w-full`} onClick={() => doPrint(buildCustomerBillHtml(snap))}><FileText className="w-4 h-4" aria-hidden="true" /> Customer bill (A5)</button>
            <button type="button" disabled={!canPrint} className={`${btnGhost} w-full`} onClick={() => doPrint(buildBoxSheetsHtml(snap))}><Package className="w-4 h-4" aria-hidden="true" /> All {boxCount} box sheet{boxCount > 1 ? 's' : ''}</button>
            {boxCount > 1 && (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Print one box sheet">
                {Array.from({ length: boxCount }, (_, i) => (
                  <button key={i} type="button" disabled={!canPrint} className={btnGhost} onClick={() => doPrint(buildBoxSheetsHtml(snap, [i]))}>Box {i + 1}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </MotionConfig>
  );
};
