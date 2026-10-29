import React, { useEffect, useMemo, useState } from 'react';
import { fetchSheetRates, SheetRateItem } from '../../../services/ratesService';

const fmt = (n: number) => n.toLocaleString('en-IN');

/** Read-only pivot of the live sheet rates: one row per destination group, one column per weight. */
export const SheetRatesGrid: React.FC = () => {
  const [rates, setRates] = useState<SheetRateItem[]>([]);
  const [meta, setMeta] = useState<{ updatedAt: string; source: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSheetRates()
      .then((p) => {
        setRates(p.rates.filter((r) => r.active));
        setMeta({ updatedAt: p.updatedAt, source: p.source });
      })
      .catch((e: any) => setError(e?.message || 'Failed to load the live rate sheet.'))
      .finally(() => setLoading(false));
  }, []);

  const { weights, groups } = useMemo(() => {
    const weights = [...new Set(rates.filter((r) => r.weight_tier === 'standard' && r.weight_kg != null).map((r) => r.weight_kg as number))].sort((a, b) => a - b);
    const byGroup = new Map<string, { name: string; std: Map<number, number>; p10?: number; p20?: number }>();
    for (const r of rates) {
      const g: { name: string; std: Map<number, number>; p10?: number; p20?: number } =
        byGroup.get(r.rate_group) ?? { name: r.display_name || r.rate_group, std: new Map() };
      if (r.weight_tier === '10_plus') g.p10 = r.price_npr;
      else if (r.weight_tier === '20_plus') g.p20 = r.price_npr;
      else if (r.weight_kg != null) g.std.set(r.weight_kg, r.price_npr);
      byGroup.set(r.rate_group, g);
    }
    return { weights, groups: [...byGroup.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name)) };
  }, [rates]);

  if (loading) return <div className="p-10 text-center text-xs text-slate-500">Loading live rates...</div>;
  if (error) return <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">{error}</div>;

  const th = 'py-3 px-3 text-right whitespace-nowrap';
  const td = 'py-2.5 px-3 text-right tabular-nums whitespace-nowrap';
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          ['Destination groups', groups.length],
          ['Weight steps (kg)', weights.length],
          ['Last synced', meta ? new Date(meta.updatedAt).toLocaleDateString() : '-'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white border border-slate-200 shadow-hard-xs px-4 py-3">
            <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-500">{label}</div>
            <div className="font-heading font-black text-2xl text-ox-900 tabular-nums">{value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-hard-sm overflow-hidden">
        <div className="overflow-auto max-h-[65vh]">
          <table className="w-full border-collapse text-xs font-mono">
            <thead className="sticky top-0 z-20">
              <tr className="bg-ox-900 text-white text-[11px] font-heading font-bold uppercase tracking-wider">
                <th scope="col" className="sticky left-0 z-30 bg-ox-900 py-3 px-4 text-left whitespace-nowrap">Destination</th>
                {weights.map((w) => <th key={w} scope="col" className={th}>{w} kg</th>)}
                <th scope="col" className={`${th} bg-gd-500 text-ox-900`}>10+ kg /kg</th>
                <th scope="col" className={`${th} bg-gd-500 text-ox-900`}>20+ kg /kg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groups.map(([key, g]) => (
                <tr key={key} className="group odd:bg-white even:bg-slate-50 hover:bg-amber-50">
                  <th scope="row" className="sticky left-0 z-10 bg-inherit py-2.5 px-4 text-left font-heading font-bold text-slate-900 whitespace-nowrap">{g.name}</th>
                  {weights.map((w) => <td key={w} className={td}>{g.std.has(w) ? fmt(g.std.get(w)!) : '-'}</td>)}
                  <td className={`${td} font-bold`}>{g.p10 != null ? fmt(g.p10) : '-'}</td>
                  <td className={`${td} font-bold`}>{g.p20 != null ? fmt(g.p20) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[11px] text-slate-500">
        Prices in NPR per box, before the box charge and pickup fee. Read-only: edit rates in the Google Sheet and they sync here.
      </p>
    </div>
  );
};
