import React, { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, ArrowRight, Clock, Layers, MapPin, Scale, Truck, Wrench } from 'lucide-react';
import type { ServiceDetail } from '../../services/servicesData';

interface Row {
  key: keyof ServiceDetail | 'link';
  label: string;
  /** Plain-language meaning of the row */
  hint: string;
  Icon: React.ElementType;
}

const ROWS: Row[] = [
  { key: 'sla', label: 'Speed', hint: 'How long delivery usually takes', Icon: Clock },
  { key: 'sizeLimit', label: 'Weight and size', hint: 'The biggest load it can take', Icon: Scale },
  { key: 'bestFor', label: 'Best for', hint: 'The kind of cargo it suits', Icon: Layers },
  { key: 'equipment', label: 'Equipment', hint: 'What carries your cargo', Icon: Truck },
  { key: 'corridors', label: 'Routes', hint: 'The main places it connects', Icon: MapPin },
  { key: 'link', label: 'Details', hint: 'Full specifications and FAQs', Icon: Wrench },
];

const optionLabel = (s: ServiceDetail) => s.title;

export const ServiceCompare: React.FC<{ services: ServiceDetail[] }> = ({ services }) => {
  const [aId, setAId] = useState(services[0].id);
  const [bId, setBId] = useState((services[1] ?? services[0]).id);
  const idA = useId();
  const idB = useId();

  const a = services.find((s) => s.id === aId) ?? services[0];
  const b = services.find((s) => s.id === bId) ?? services[0];
  const same = a.id === b.id;

  const cell = (s: ServiceDetail, row: Row) =>
    row.key === 'link' ? (
      <Link
        to={`/services/${s.slug}`}
        className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-bold text-ox-900 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gd-500 rounded"
      >
        <span>View {s.title}</span>
        <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
      </Link>
    ) : (
      <span>{String(s[row.key as keyof ServiceDetail])}</span>
    );

  const selectCls =
    'w-full min-h-[48px] px-3.5 bg-white text-ox-900 border border-[#B9C6D8] rounded-[var(--r-sm)] text-sm font-semibold hover:border-ox-900/60 focus:outline-none focus:ring-2 focus:ring-gd-500 focus:border-ox-900 transition-colors';

  return (
    <section
      id="compare"
      aria-labelledby="compare-title"
      className="scroll-mt-28 rounded-[var(--r-lg)] bg-white border border-[var(--line)] shadow-hard-sm p-5 sm:p-8 space-y-6"
    >
      <div className="space-y-1.5 max-w-2xl">
        <h2 id="compare-title" className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-ox-900">
          Compare two services
        </h2>
        <p className="text-base text-[var(--text-secondary)]">Choose any two. The table shows how they differ.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
        <div className="space-y-1.5">
          <label htmlFor={idA} className="block text-sm font-bold text-ox-900">
            First service
          </label>
          <select id={idA} value={aId} onChange={(e) => setAId(e.target.value)} className={selectCls}>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {optionLabel(s)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setAId(bId);
            setBId(aId);
          }}
          aria-label="Swap the two services"
          className="hidden md:inline-flex w-12 h-12 items-center justify-center rounded-full border border-[#B9C6D8] text-ox-900 hover:bg-[#EEF3F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gd-500 cursor-pointer"
        >
          <ArrowLeftRight className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="space-y-1.5">
          <label htmlFor={idB} className="block text-sm font-bold text-ox-900">
            Second service
          </label>
          <select id={idB} value={bId} onChange={(e) => setBId(e.target.value)} className={selectCls}>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {optionLabel(s)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {same && (
        <p role="status" className="text-sm font-semibold text-amber-900 bg-amber-50 border border-amber-200 rounded-[var(--r-sm)] px-3.5 py-2.5">
          You picked the same service twice. Choose a different one to see the differences.
        </p>
      )}

      {/* Tablet and desktop: one table, both services side by side */}
      <div className="hidden md:block overflow-x-auto rounded-[var(--r-sm)] border border-[var(--line)]">
        <table className="w-full table-fixed text-left border-collapse">
          <caption className="sr-only">
            Comparison of {a.title} and {b.title}
          </caption>
          <colgroup>
            <col className="w-[20%]" />
            <col className="w-[40%]" />
            <col className="w-[40%]" />
          </colgroup>
          <thead>
            <tr className="bg-[#EEF3F9]">
              <th scope="col" className="p-4 text-sm font-bold text-ox-900">
                What to compare
              </th>
              <th scope="col" className="p-4 font-heading font-extrabold text-ox-900 break-words">
                {a.title}
              </th>
              <th scope="col" className="p-4 font-heading font-extrabold text-ox-900 break-words">
                {b.title}
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-t border-[var(--line)] align-top hover:bg-[#F6F9FD] transition-colors">
                <th scope="row" className="p-4 font-normal">
                  <span className="flex items-start gap-2.5">
                    <row.Icon className="w-4 h-4 mt-1 shrink-0 text-[#8C6400]" aria-hidden="true" />
                    <span>
                      <span className="block font-bold text-ox-900 leading-snug">{row.label}</span>
                      <span className="block text-xs text-[var(--text-muted)] leading-snug mt-0.5">{row.hint}</span>
                    </span>
                  </span>
                </th>
                <td className="p-4 text-[15px] leading-relaxed text-[var(--text)] break-words">{cell(a, row)}</td>
                <td className="p-4 text-[15px] leading-relaxed text-[var(--text)] break-words">{cell(b, row)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones: each row becomes a small block with the two services stacked */}
      <div className="md:hidden space-y-3" role="list" aria-label={`Comparison of ${a.title} and ${b.title}`}>
        {ROWS.map((row) => (
          <div key={row.label} role="listitem" className="rounded-[var(--r-sm)] border border-[var(--line)] overflow-hidden">
            <div className="flex items-start gap-2.5 px-4 py-3 bg-[#EEF3F9]">
              <row.Icon className="w-4 h-4 mt-1 shrink-0 text-[#8C6400]" aria-hidden="true" />
              <div>
                <p className="font-bold text-ox-900 leading-snug">{row.label}</p>
                <p className="text-xs text-[var(--text-muted)] leading-snug">{row.hint}</p>
              </div>
            </div>
            {[a, b].map((s, i) => (
              <div key={i} className={`px-4 py-3 ${i === 1 ? 'border-t border-[var(--line)]' : ''}`}>
                <p className="text-xs font-bold text-[#8C6400] mb-1 break-words">{s.title}</p>
                <div className="text-[15px] leading-relaxed text-[var(--text)] break-words">{cell(s, row)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};
