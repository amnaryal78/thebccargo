import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Calculator, Check, CircleDot, FileText, Landmark, Loader2, MapPin, Minus, Package, Plus, Printer, Save, Scale, Send, Trash2, X } from 'lucide-react';
import { Spotlight } from '../../../components/ui/spotlight';
import { adminDataService } from '../services/adminDataService';
import { getRolePermissions } from '../types';
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
  type Party,
} from './billing/model';
import { buildBoxSheetsHtml, buildCustomerBillHtml, openPrintWindow, type BillSnapshot } from './billing/print';
import { fromShipmentRow, toShipmentRow } from './billing/persist';

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
  'w-full min-w-0 min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-500 transition-colors hover:border-[#002147]/50 focus:outline-none focus:border-[#002147] focus:ring-4 focus:ring-[#F2B705]/40 disabled:bg-slate-100 disabled:text-slate-500';
const lbl = 'block text-xs font-bold text-slate-700 mb-1.5';
const btnPrimary =
  'min-h-[44px] px-5 rounded-xl bg-[#002147] text-white font-bold text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer transition-colors hover:bg-[#123562] hover:text-[#F2B705] active:bg-[#001A38] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#002147] disabled:hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F2B705]/70';
const btnGhost =
  'min-h-[44px] px-4 rounded-xl border border-slate-300 bg-white text-[#002147] font-bold text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer transition-colors hover:border-[#002147] hover:bg-[#FFF6D8] active:bg-[#FFEFB8] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F2B705]/70';
const card = 'rounded-2xl bg-white border border-[#002147]/10 shadow-[0_1px_2px_rgba(0,33,71,0.05),0_12px_28px_-16px_rgba(0,33,71,0.18)] p-4 sm:p-6 min-w-0';
const warnBox = 'flex items-start gap-2 text-sm font-semibold rounded-xl px-3 py-2.5 border text-amber-900 bg-[#FFF6D8] border-[#F2B705]/60';

/** Icon chip + title + one-line hint. Every section header looks the same. */
const SectionHead: React.FC<{ icon: React.ComponentType<{ className?: string }>; id?: string; title: string; hint?: string; as?: 'h2' | 'h3'; aside?: React.ReactNode }> = ({ icon: Icon, id, title, hint, as: Tag = 'h2', aside }) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div className="flex items-start gap-3 min-w-0">
      <span className="shrink-0 w-9 h-9 rounded-xl bg-[#002147] text-[#F2B705] inline-flex items-center justify-center" aria-hidden="true"><Icon className="w-[18px] h-[18px]" /></span>
      <div className="min-w-0">
        <Tag id={id} className="font-heading font-extrabold text-lg leading-tight text-[#002147]">{title}</Tag>
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

const Num: React.FC<{ value: number | null; onChange: (n: number | null) => void; step?: string; ariaLabel?: string; className?: string; placeholder?: string; id?: string }> = ({
  id,
  value,
  onChange,
  step = 'any',
  ariaLabel,
  className = '',
  placeholder,
}) => (
  <input
    id={id}
    type="number"
    inputMode="decimal"
    min="0"
    step={step}
    aria-label={ariaLabel}
    placeholder={placeholder}
    value={value === null ? '' : value}
    onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
    className={`${inp} ${className}`}
  />
);

const PartyForm: React.FC<{
  title: string;
  party: Party;
  onChange: (p: Party) => void;
  lockCountryNote?: string;
  idp: string;
  required: boolean;
}> = ({ title, party, onChange, lockCountryNote, idp, required }) => (
  <fieldset className={`${card} space-y-4`}>
    <legend className="sr-only">{title}</legend>
    <SectionHead icon={idp === 'sender' ? Send : MapPin} title={title} hint={idp === 'sender' ? 'Who is handing the parcel over.' : 'Who receives it, and where it goes.'} />
    <div>
      <label htmlFor={`${idp}-name`} className={lbl}>Full name{required && <Req />}</label>
      <input id={`${idp}-name`} value={party.name} onChange={(e) => onChange({ ...party, name: e.target.value })} className={inp} autoComplete="off" />
    </div>
    <div>
      <label htmlFor={`${idp}-country`} className={lbl}>Country{required && <Req />}</label>
      <select
        id={`${idp}-country`}
        value={party.country}
        onChange={(e) => onChange({ ...party, country: e.target.value, phone: withDial(party.phone, party.country, e.target.value) })}
        className={inp}
      >
        <option value="">Choose a country</option>
        {COUNTRIES.map((c) => (
          <option key={c.iso2} value={c.name}>{c.name}</option>
        ))}
      </select>
      {lockCountryNote && <p className="text-xs text-slate-600 mt-1.5">{lockCountryNote}</p>}
    </div>
    <div>
      <label htmlFor={`${idp}-phone`} className={lbl}>Phone{required && <Req />}</label>
      <input id={`${idp}-phone`} type="tel" inputMode="tel" value={party.phone} onChange={(e) => onChange({ ...party, phone: e.target.value })} className={inp} autoComplete="off" placeholder={dialOf(party.country) ? `${dialOf(party.country)} …` : ''} />
      {dialOf(party.country) && <p className="text-xs text-slate-600 mt-1">Country code {dialOf(party.country)} is added for you.</p>}
    </div>
    <div>
      <label htmlFor={`${idp}-address`} className={lbl}>Address{required && <Req />}</label>
      <textarea id={`${idp}-address`} rows={2} value={party.address} onChange={(e) => onChange({ ...party, address: e.target.value })} className={`${inp} py-2 resize-y`} />
    </div>
    <div>
      <label htmlFor={`${idp}-email`} className={lbl}>Email (optional)</label>
      <input id={`${idp}-email`} type="email" inputMode="email" autoComplete="off" value={party.email} onChange={(e) => onChange({ ...party, email: e.target.value })} className={inp} />
    </div>
  </fieldset>
);

/** Small row with inputs + remove; used for every saved item so everything stays editable. */
const RowShell: React.FC<{ onRemove: () => void; children: React.ReactNode; what: string; cols?: string }> = ({ onRemove, children, what, cols = 'sm:grid-cols-[minmax(0,1fr)_110px_90px_44px]' }) => (
  <li className={`grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] ${cols} gap-2 items-center py-2 border-b border-slate-100 last:border-b-0`}>
    {children}
    <button type="button" onClick={onRemove} aria-label={`Remove ${what}`} className="col-start-3 row-start-1 sm:col-start-auto sm:row-start-auto min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F2B705]/70 cursor-pointer">
      <Trash2 className="w-4 h-4" aria-hidden="true" />
    </button>
  </li>
);

const BoxSection: React.FC<{
  box: BoxDraft;
  index: number;
  total: number;
  meatAllowed: boolean;
  onChange: (b: BoxDraft) => void;
}> = ({ box, index, total, meatAllowed, onChange }) => {
  const [g, setG] = useState({ name: '', unit: 'pcs', qty: '' });
  const [l, setL] = useState<{ kind: LiquidKind; other: string; unit: string; qty: string }>({ kind: 'Ghee', other: '', unit: 'btl', qty: '' });
  const [m, setM] = useState({ name: '', kg: '', qty: '' });
  const addGoods = () => {
    const qty = Number(g.qty);
    if (!g.name.trim() || !(qty > 0)) return;
    onChange({ ...box, goods: [...box.goods, { id: uid(), name: g.name.trim(), unit: g.unit, qty }] });
    setG({ ...g, name: '', qty: '' });
  };
  const addLiquid = () => {
    const qty = Number(l.qty);
    if (!(qty > 0) || (l.kind === 'Other' && !l.other.trim())) return;
    onChange({ ...box, liquids: [...box.liquids, { id: uid(), kind: l.kind, otherName: l.kind === 'Other' ? l.other.trim() : '', unit: l.unit || 'btl', qty }] });
    setL({ ...l, other: '', qty: '' });
  };
  const addMeat = () => {
    const qty = Number(m.qty);
    const kg = Number(m.kg);
    if (!m.name.trim() || !(kg > 0) || !(qty > 0)) return;
    onChange({ ...box, meats: [...box.meats, { id: uid(), name: m.name.trim(), kgPerUnit: kg, qty }] });
    setM({ name: '', kg: '', qty: '' });
  };
  const onEnter = (fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fn();
    }
  };
  const key = `box${index}`;
  return (
    <section aria-labelledby={`${key}-t`} className={`${card} space-y-5 border-l-4 border-l-[#F2B705]`}>
      <SectionHead
        icon={Package}
        as="h3"
        id={`${key}-t`}
        title={`Box ${index + 1} of ${total}`}
        hint="Goods, liquids and meat packed in this box."
        aside={
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 shrink-0">
            <span>Box weight (kg, optional)</span>
            <Num value={box.weightKg} onChange={(n) => onChange({ ...box, weightKg: n })} ariaLabel={`Weight of box ${index + 1} in kg`} className="w-24!" />
          </label>
        }
      />

      {/* GOODS */}
      <div className="space-y-2">
        <h4 className="text-sm font-extrabold text-[#002147]">Goods</h4>
        <div className="grid grid-cols-2 sm:grid-cols-[minmax(0,1fr)_110px_90px_auto] gap-2 items-end">
          <div className="col-span-2 sm:col-span-1">
            <label className={lbl} htmlFor={`${key}-gn`}>Item name</label>
            <input id={`${key}-gn`} value={g.name} onChange={(e) => setG({ ...g, name: e.target.value })} onKeyDown={onEnter(addGoods)} className={inp} />
          </div>
          <div>
            <label className={lbl} htmlFor={`${key}-gu`}>Type</label>
            <input id={`${key}-gu`} list="unit-list" value={g.unit} onChange={(e) => setG({ ...g, unit: e.target.value })} className={inp} />
          </div>
          <div>
            <label className={lbl} htmlFor={`${key}-gq`}>Quantity</label>
            <input id={`${key}-gq`} type="number" min="0" inputMode="decimal" value={g.qty} onChange={(e) => setG({ ...g, qty: e.target.value })} onKeyDown={onEnter(addGoods)} className={inp} />
          </div>
          <button type="button" onClick={addGoods} className={`${btnPrimary} col-span-2 sm:col-span-1`}><Plus className="w-4 h-4" aria-hidden="true" /> Add</button>
        </div>
        {box.goods.length > 0 && (
          <ul className="list-none p-0 m-0" aria-label={`Goods in box ${index + 1}`}>
            {box.goods.map((it) => (
              <RowShell key={it.id} what={it.name} onRemove={() => onChange({ ...box, goods: box.goods.filter((x) => x.id !== it.id) })}>
                <input aria-label="Item name" placeholder="Item name" value={it.name} onChange={(e) => onChange({ ...box, goods: box.goods.map((x) => (x.id === it.id ? { ...x, name: e.target.value } : x)) })} className={`${inp} col-span-2 sm:col-span-1`} />
                <input aria-label="Type" list="unit-list" value={it.unit} onChange={(e) => onChange({ ...box, goods: box.goods.map((x) => (x.id === it.id ? { ...x, unit: e.target.value } : x)) })} className={inp} />
                <Num value={it.qty} ariaLabel="Quantity" onChange={(n) => onChange({ ...box, goods: box.goods.map((x) => (x.id === it.id ? { ...x, qty: n ?? 0 } : x)) })} />
              </RowShell>
            ))}
          </ul>
        )}
      </div>

      {/* LIQUID */}
      <div className="space-y-2 pt-4 border-t border-slate-200">
        <h4 className="text-sm font-extrabold text-[#002147]">Liquid</h4>
        <div className="grid grid-cols-2 sm:grid-cols-[130px_minmax(0,1fr)_90px_90px_auto] gap-2 items-end">
          <div>
            <label className={lbl} htmlFor={`${key}-lk`}>Kind</label>
            <select id={`${key}-lk`} value={l.kind} onChange={(e) => setL({ ...l, kind: e.target.value as LiquidKind })} className={inp}>
              {LIQUID_KINDS.map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl} htmlFor={`${key}-lo`}>{l.kind === 'Other' ? 'Liquid name' : 'Name'}</label>
            <input id={`${key}-lo`} disabled={l.kind !== 'Other'} value={l.kind === 'Other' ? l.other : l.kind} onChange={(e) => setL({ ...l, other: e.target.value })} className={`${inp} disabled:bg-slate-100`} />
          </div>
          <div>
            <label className={lbl} htmlFor={`${key}-lu`}>Type</label>
            <input id={`${key}-lu`} list="unit-list" value={l.unit} onChange={(e) => setL({ ...l, unit: e.target.value })} className={inp} />
          </div>
          <div>
            <label className={lbl} htmlFor={`${key}-lq`}>Quantity</label>
            <input id={`${key}-lq`} type="number" min="0" inputMode="decimal" value={l.qty} onChange={(e) => setL({ ...l, qty: e.target.value })} onKeyDown={onEnter(addLiquid)} className={inp} />
          </div>
          <button type="button" onClick={addLiquid} className={`${btnPrimary} col-span-2 sm:col-span-1`}><Plus className="w-4 h-4" aria-hidden="true" /> Add</button>
        </div>
        {box.liquids.length > 0 && (
          <ul className="list-none p-0 m-0" aria-label={`Liquids in box ${index + 1}`}>
            {box.liquids.map((it) => (
              <RowShell key={it.id} what={it.kind} cols="sm:grid-cols-[130px_minmax(0,1fr)_90px_90px_44px]" onRemove={() => onChange({ ...box, liquids: box.liquids.filter((x) => x.id !== it.id) })}>
                <select aria-label="Kind" value={it.kind} onChange={(e) => onChange({ ...box, liquids: box.liquids.map((x) => (x.id === it.id ? { ...x, kind: e.target.value as LiquidKind } : x)) })} className={inp}>
                  {LIQUID_KINDS.map((k) => <option key={k}>{k}</option>)}
                </select>
                <input aria-label="Liquid name" disabled={it.kind !== 'Other'} value={it.kind === 'Other' ? it.otherName : it.kind} onChange={(e) => onChange({ ...box, liquids: box.liquids.map((x) => (x.id === it.id ? { ...x, otherName: e.target.value } : x)) })} className={inp} />
                <input aria-label="Type" list="unit-list" value={it.unit} onChange={(e) => onChange({ ...box, liquids: box.liquids.map((x) => (x.id === it.id ? { ...x, unit: e.target.value } : x)) })} className={inp} />
                <Num value={it.qty} ariaLabel="Quantity" onChange={(n) => onChange({ ...box, liquids: box.liquids.map((x) => (x.id === it.id ? { ...x, qty: n ?? 0 } : x)) })} />
              </RowShell>
            ))}
          </ul>
        )}
      </div>

      {/* MEAT */}
      <div className="space-y-2 pt-4 border-t border-slate-200">
        <h4 className="text-sm font-extrabold text-[#002147]">Meat</h4>
        {!meatAllowed && <p className={warnBox}><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />Meat is normally allowed only for Europe, UK and Hong Kong. You can still add it, but check first.</p>}
        <div className="grid grid-cols-2 sm:grid-cols-[minmax(0,1fr)_100px_90px_auto] gap-2 items-end">
          <div className="col-span-2 sm:col-span-1">
            <label className={lbl} htmlFor={`${key}-mn`}>Meat name</label>
            <input id={`${key}-mn`} value={m.name} onChange={(e) => setM({ ...m, name: e.target.value })} onKeyDown={onEnter(addMeat)} className={inp} />
          </div>
          <div>
            <label className={lbl} htmlFor={`${key}-mk`}>Kg each</label>
            <input id={`${key}-mk`} type="number" min="0" step="0.1" inputMode="decimal" value={m.kg} onChange={(e) => setM({ ...m, kg: e.target.value })} className={inp} />
          </div>
          <div>
            <label className={lbl} htmlFor={`${key}-mq`}>Quantity</label>
            <input id={`${key}-mq`} type="number" min="0" inputMode="decimal" value={m.qty} onChange={(e) => setM({ ...m, qty: e.target.value })} onKeyDown={onEnter(addMeat)} className={inp} />
          </div>
          <button type="button" onClick={addMeat} className={`${btnPrimary} col-span-2 sm:col-span-1`}><Plus className="w-4 h-4" aria-hidden="true" /> Add</button>
        </div>
        {box.meats.length > 0 && (
          <ul className="list-none p-0 m-0" aria-label={`Meat in box ${index + 1}`}>
            {box.meats.map((it) => (
              <RowShell key={it.id} what={it.name} cols="sm:grid-cols-[minmax(0,1fr)_100px_90px_44px]" onRemove={() => onChange({ ...box, meats: box.meats.filter((x) => x.id !== it.id) })}>
                <input aria-label="Meat name" placeholder="Meat name" value={it.name} onChange={(e) => onChange({ ...box, meats: box.meats.map((x) => (x.id === it.id ? { ...x, name: e.target.value } : x)) })} className={`${inp} col-span-2 sm:col-span-1`} />
                <Num value={it.kgPerUnit} ariaLabel="Kg each" onChange={(n) => onChange({ ...box, meats: box.meats.map((x) => (x.id === it.id ? { ...x, kgPerUnit: n ?? 0 } : x)) })} />
                <Num value={it.qty} ariaLabel="Quantity" onChange={(n) => onChange({ ...box, meats: box.meats.map((x) => (x.id === it.id ? { ...x, qty: n ?? 0 } : x)) })} />
              </RowShell>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export const ShipmentEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const { role } = useAuth();
  const canEdit = getRolePermissions(role).canManageShipments;
  const { sheetRates } = useEstimatorData();

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
          setSavedId(row.id);
          setSavedJson(stable(d) + '|' + (row.status || 'pending'));
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

  const currentJson = stable(draft) + '|' + status;
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

  const leave = () => {
    if (dirty && hasTyped && !window.confirm('You have changes that are not saved. Leave this page and lose them?')) return;
    navigate('/admin/shipments');
  };

  const save = async (thenPrint: boolean) => {
    const errs = validateBill(draft);
    setErrors(errs);
    setNotice(null);
    if (errs.length) {
      document.getElementById('form-errors')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    setSaving(true);
    try {
      const row = toShipmentRow(draft, result, status);
      const saved = savedId ? await adminDataService.updateShipment(savedId, row) : await adminDataService.createShipment(row);
      // Read it back so we know it really is in the database before saying so.
      const check = await adminDataService.fetchShipment(saved.id);
      if (!check || Number(check.total_npr) !== result.total) throw new Error('Saved, but the stored total does not match. Please reload and check.');
      setSavedId(saved.id);
      savedIdRef.current = saved.id;
      setSavedJson(currentJson);
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      setRestored(false);
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
    return <p className="p-6 text-slate-700">You do not have permission to create or edit shipments.</p>;
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
        <Num id={rid} value={ov} onChange={setOv} placeholder="Manual Rs" />
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6 pb-8">
      <datalist id="unit-list">{GOODS_UNITS.map((u) => <option key={u} value={u} />)}</datalist>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={leave} className={btnGhost} aria-label="Back to shipments"><ArrowLeft className="w-4 h-4" aria-hidden="true" /> <span className="hidden sm:inline">Shipments</span></button>
          <div className="min-w-0">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl leading-tight text-[#002147] break-words">{isNew && !savedId ? 'New shipment' : `Shipment ${draft.billNo}`}</h1>
            <p className="text-xs text-slate-600 mt-0.5">International shipment from Nepal. Fields marked <span className="text-red-700">*</span> are required.</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border whitespace-nowrap ${!savedId ? 'bg-slate-100 text-slate-700 border-slate-300' : dirty ? 'bg-[#FFF6D8] text-amber-900 border-[#F2B705]' : 'bg-emerald-50 text-emerald-800 border-emerald-300'}`} role="status">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : !savedId ? <CircleDot className="w-3.5 h-3.5" aria-hidden="true" /> : dirty ? <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" /> : <Check className="w-3.5 h-3.5" aria-hidden="true" />}
          {saving ? 'Saving…' : savedId ? (dirty ? 'Unsaved changes' : 'Saved to database') : 'Not saved yet'}
        </span>
      </header>

      {restored && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#002147]/20 bg-[#EEF3F9] px-4 py-3 text-sm text-[#002147]">
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
            <ul className="list-disc pl-5 space-y-0.5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
          ) : (
            <p className="flex items-center gap-2"><Check className="w-4 h-4" aria-hidden="true" /> {notice}</p>
          )}
        </div>
      )}

      <section className={`${card} grid grid-cols-1 sm:grid-cols-3 gap-4`} aria-label="Bill details">
        <div>
          <label htmlFor="bill-no" className={lbl}>Bill number<Req /></label>
          <input id="bill-no" value={draft.billNo} onChange={(e) => update((d) => { d.billNo = e.target.value.toUpperCase().replace(/\s/g, ''); })} className={`${inp} font-mono font-bold`} />
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
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PartyForm idp="sender" title="Sender" required party={draft.sender} onChange={(p) => update((d) => { d.sender = p; })} lockCountryNote="Nepal by default. Change it only if needed." />
        <PartyForm idp="receiver" title="Receiver" required party={draft.receiver} onChange={(p) => update((d) => { d.receiver = p; })} />
      </div>

      {/* WEIGHT + BOXES */}
      <section className={`${card} space-y-4`} aria-labelledby="wb-t">
        <SectionHead icon={Scale} id="wb-t" title="Weight and boxes" hint="One box is added for every 20 kg unless you set the count yourself." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="total-weight" className={lbl}>Total weight (kg)<Req /></label>
            <Num id="total-weight" value={draft.totalWeightKg || null} onChange={(n) => update((d) => { d.totalWeightKg = n ?? 0; })} />
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
        {draft.totalWeightKg > 0 && draft.totalWeightKg / boxCount > 20 && (
          <p role="status" className={warnBox}>
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{(draft.totalWeightKg / boxCount).toFixed(2)} kg per box is over the 20 kg box limit.</span>
          </p>
        )}
      </section>

      {draft.boxes.slice(0, boxCount).map((b, i) => (
        <BoxSection
          key={b.id}
          box={b}
          index={i}
          total={boxCount}
          meatAllowed={result.meatAllowed || !draft.receiver.country}
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
          <label className="text-xs text-slate-700 flex flex-wrap items-center gap-2 mt-1.5">Rate per bottle <Num value={draft.liquidRate} ariaLabel="Liquid rate per bottle" className="w-24! min-h-[36px]!" onChange={(n) => update((d) => { d.liquidRate = n ?? 0; })} /></label>
        )}
        {rateRow(
          'r-meat',
          'Meat',
          `${result.meatKg} kg × Rs ${fmtMoney(result.meatRate)} per kg.`,
          `Rs ${fmtMoney(result.meatKg * (draft.meatRateOverride ?? autoMeatRate(draft.receiver.country)))}`,
          draft.meatChargeOverride,
          (n) => update((d) => { d.meatChargeOverride = n; }),
          <label className="text-xs text-slate-700 flex flex-wrap items-center gap-2 mt-1.5">Rate per kg (auto {fmtMoney(autoMeatRate(draft.receiver.country))}) <Num value={draft.meatRateOverride} placeholder="Auto" ariaLabel="Meat rate per kg" className="w-24! min-h-[36px]!" onChange={(n) => update((d) => { d.meatRateOverride = n; })} /></label>
        )}
        {rateRow(
          'r-box',
          'Custom box',
          `${boxCount} box(es) × Rs ${fmtMoney(draft.boxRate)} per box.`,
          `Rs ${fmtMoney(boxCount * draft.boxRate)}`,
          draft.boxChargeOverride,
          (n) => update((d) => { d.boxChargeOverride = n; }),
          <label className="text-xs text-slate-700 flex flex-wrap items-center gap-2 mt-1.5">Rate per box <Num value={draft.boxRate} ariaLabel="Custom box rate" className="w-24! min-h-[36px]!" onChange={(n) => update((d) => { d.boxRate = n ?? 0; })} /></label>
        )}

        <div className="pt-4 border-t border-slate-200 space-y-2">
          <h3 className="text-sm font-extrabold text-[#002147]">Additional charges</h3>
          <div className="grid grid-cols-2 sm:grid-cols-[minmax(0,1fr)_130px_auto] gap-2 items-end">
            <div className="col-span-2 sm:col-span-1">
              <label className={lbl} htmlFor="extra-name">Charge name</label>
              <input id="extra-name" value={newExtra.name} onChange={(e) => setNewExtra({ ...newExtra, name: e.target.value })} className={inp} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className={lbl} htmlFor="extra-amt">Amount (Rs)</label>
              <input id="extra-amt" type="number" inputMode="decimal" value={newExtra.amount} onChange={(e) => setNewExtra({ ...newExtra, amount: e.target.value })} className={inp} />
            </div>
            <button
              type="button"
              className={`${btnPrimary} col-span-2 sm:col-span-1`}
              onClick={() => {
                const amount = Number(newExtra.amount);
                if (!newExtra.name.trim() || !Number.isFinite(amount) || newExtra.amount === '') return;
                update((d) => { d.extras.push({ id: uid(), name: newExtra.name.trim(), amount }); });
                setNewExtra({ name: '', amount: '' });
              }}
            >
              <Plus className="w-4 h-4" aria-hidden="true" /> Add
            </button>
          </div>
          {draft.extras.length > 0 && (
            <ul className="list-none p-0 m-0" aria-label="Additional charges">
              {draft.extras.map((x, i) => (
                <RowShell key={x.id} what={x.name} cols="sm:grid-cols-[minmax(0,1fr)_130px_44px]" onRemove={() => update((d) => { d.extras.splice(i, 1); })}>
                  <input aria-label="Charge name" value={x.name} onChange={(e) => update((d) => { d.extras[i].name = e.target.value; })} className={`${inp} col-span-2 sm:col-span-1`} />
                  <Num value={x.amount} ariaLabel="Charge amount" onChange={(n) => update((d) => { d.extras[i].amount = n ?? 0; })} />
                </RowShell>
              ))}
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
      <section className={`${card} space-y-4 border-2 border-[#002147]`} aria-labelledby="calc-t">
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
        <div className="flex items-center justify-between gap-3 rounded-xl bg-[#002147] text-white px-4 py-3">
          <span className="font-extrabold">Grand total</span>
          <span className="font-mono font-extrabold text-xl text-[#F2B705]">Rs {fmtMoney(result.total)}</span>
        </div>
        <p className="text-sm text-slate-700"><strong>In words:</strong> {amountInWords(result.total)}</p>
        {result.warnings.map((w) => (
          <p key={w} role="status" className={warnBox}><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />{w}</p>
        ))}
      </section>
      </Spotlight>

      {/* ACTION BAR */}
      <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] md:bottom-0 z-30 -mx-4 sm:mx-0 px-4 py-3 bg-white/95 backdrop-blur-sm border-t border-slate-200 sm:rounded-2xl sm:border flex flex-wrap items-center justify-between gap-3 shadow-[0_-6px_16px_-8px_rgba(0,33,71,0.18)]">
        <p className="text-sm font-mono font-extrabold text-[#002147]"><span className="font-body font-semibold text-slate-600 mr-2">Total</span>Rs {fmtMoney(result.total)}</p>
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
          <div className="w-full max-w-md bg-white rounded-2xl p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 id="print-t" className="font-heading font-extrabold text-xl text-[#002147]">Print {draft.billNo}</h2>
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
  );
};
