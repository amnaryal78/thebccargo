import React, { useId, useMemo, useState } from 'react';
import { Calculator, MessageCircle, Package } from 'lucide-react';
import type { SheetRateItem } from '../../services/ratesService';
import { calculateSheetShipmentQuote, isMeatAllowedForCountry } from '../estimator/engine';
import { Cta3D } from '../../components/ui/Cta3D';
import type { CountryGuide, Lang } from '../../data/countryGuides';
import { T } from './ui';
import { npr } from './useGuideRates';
import { WHATSAPP } from './contact';

/** Country-locked calculator. All maths is the estimator engine's; this only collects inputs. */
export const GuideEstimator: React.FC<{ guide: CountryGuide; rates: SheetRateItem[]; rateGroup: string; lang: Lang }> = ({
  guide,
  rates,
  rateGroup,
  lang,
}) => {
  const id = useId();
  const [kg, setKg] = useState(guide.exampleKg);
  const [liquid, setLiquid] = useState(false);
  const [medicine, setMedicine] = useState(false);
  const [meat, setMeat] = useState(false);
  const [meatKg, setMeatKg] = useState(1);
  const meatOk = isMeatAllowedForCountry(rateGroup) || isMeatAllowedForCountry(guide.rateCountry);

  const q = useMemo(
    () =>
      calculateSheetShipmentQuote(
        {
          destination: guide.rateCountry,
          actualWeightKg: kg,
          hasLiquid: liquid,
          hasMedicine: medicine,
          hasMeat: meat && meatOk,
          meatKg: Math.min(meatKg, kg),
        },
        rates
      ),
    [guide.rateCountry, kg, liquid, medicine, meat, meatOk, meatKg, rates]
  );

  const L = (b: { en: string; ne: string }) => b[lang];
  const rows: [string, number][] = [
    [`${L(T.shipping)} (${q.totalWeightKg} kg)`, q.baseShippingCharge],
    [`${L(T.boxes)} × ${q.boxCount}`, q.boxCharge],
    [L(T.liquidFee), q.liquidCharge],
    [L(T.medicineFee), q.medicineCharge],
    [L(T.meatFee), q.meatCharge],
  ];
  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
    `Hello BC Cargo, I want to send about ${kg} kg to ${guide.name.en}.${q.allowed ? ` Your website estimate shows ${npr(q.totalNpr)}.` : ''}`
  )}`;

  const check = (label: string, on: boolean, set: (v: boolean) => void, disabled = false, note?: string) => (
    <label className={`flex items-center gap-3 min-h-[48px] px-3.5 rounded-[var(--r-sm)] border cursor-pointer select-none transition-colors ${on ? 'border-[var(--gold)] bg-[var(--gd-50)]' : 'border-[var(--line)] bg-[var(--surface)]'} ${disabled ? 'opacity-55 cursor-not-allowed' : ''}`}>
      <input type="checkbox" className="w-5 h-5 accent-[var(--oxford-deep)]" checked={on} disabled={disabled} onChange={(e) => set(e.target.checked)} />
      <span className="text-[15px] text-[var(--text)]">{label}</span>
      {note && <span className="ml-auto text-xs text-[var(--text-muted)]">{note}</span>}
    </label>
  );

  return (
    <div className="cg-card rounded-[var(--r-lg,20px)] bg-[var(--surface)] border border-[var(--line)] overflow-hidden">
      <div className="p-5 sm:p-6 space-y-5">
        <h3 className="flex items-center gap-2 font-heading font-bold text-xl text-[var(--text)]">
          <Calculator className="w-5 h-5 text-[var(--gold-dark)]" aria-hidden="true" />
          {L(T.calcTitle)}
        </h3>

        <div>
          <label htmlFor={`${id}-kg`} className="block text-sm font-semibold text-[var(--text)] mb-1.5">{L(T.weight)}</label>
          <div className="flex items-center gap-3">
            <input
              id={`${id}-kg-range`}
              type="range"
              min={0.5}
              max={60}
              step={0.5}
              value={kg}
              onChange={(e) => setKg(Number(e.target.value))}
              className="flex-1 accent-[var(--oxford-deep)] h-11"
              aria-label={L(T.weight)}
            />
            <input
              id={`${id}-kg`}
              type="number"
              inputMode="decimal"
              min={0.5}
              max={500}
              step={0.5}
              value={kg}
              onChange={(e) => setKg(Math.max(0.5, Number(e.target.value) || 0.5))}
              className="w-24 h-12 px-3 rounded-[var(--r-sm)] border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--text)] text-lg font-bold text-center clay-inset focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
            />
          </div>
        </div>

        <div className="grid gap-2">
          {check(L(T.hasLiquid), liquid, setLiquid)}
          {check(L(T.hasMedicine), medicine, setMedicine)}
          {check(L(T.hasMeat), meat && meatOk, setMeat, !meatOk, meatOk ? undefined : L(T.meatNotHere))}
          {meat && meatOk && (
            <div className="flex items-center gap-3 pl-3.5">
              <label htmlFor={`${id}-meat`} className="text-sm text-[var(--text)]">{L(T.meatKg)}</label>
              <input
                id={`${id}-meat`}
                type="number"
                inputMode="decimal"
                min={0.5}
                step={0.5}
                value={meatKg}
                onChange={(e) => setMeatKg(Math.max(0.5, Number(e.target.value) || 0.5))}
                className="w-24 h-11 px-3 rounded-[var(--r-sm)] border border-[var(--line-strong)] bg-[var(--surface)] text-center font-bold clay-inset focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-[var(--surface-subtle)] border-t border-[var(--line)] p-5 sm:p-6" aria-live="polite">
        {q.allowed ? (
          <>
            <dl className="space-y-1.5 text-[15px]">
              {rows
                .filter(([, v], i) => i < 2 || v > 0)
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-[var(--text-muted)]">{k}</dt>
                    <dd className="font-semibold tabular-nums text-[var(--text)]">{npr(v)}</dd>
                  </div>
                ))}
            </dl>
            <div className="mt-3 pt-3 border-t border-[var(--line-strong)] flex items-end justify-between gap-4">
              <span className="font-semibold text-[var(--text)]">{L(T.total)}</span>
              <span className="font-heading font-extrabold text-3xl tabular-nums text-[var(--oxford-deep)]">{npr(q.totalNpr)}</span>
            </div>
          </>
        ) : (
          <p className="text-[15px] text-[var(--text)]">{L(T.priceUnavailable)}</p>
        )}
        <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-muted)]">{L(T.calcNote)}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Cta3D to={`/book?dest=${encodeURIComponent(guide.name.en)}&weight=${kg}`} icon={<Package className="w-4 h-4" />}>
            {L(T.book)}
          </Cta3D>
          <Cta3D tone="light" href={wa} newTab icon={<MessageCircle className="w-4 h-4" />}>
            {L(T.whatsapp)}
          </Cta3D>
        </div>
      </div>
    </div>
  );
};
