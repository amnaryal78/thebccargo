import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Trash2,
  Search
} from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import { AdminInternationalRate } from '../types';
import { useMyPermissions } from '../usePermissions';
import { useAuth } from '../../../context/AuthContext';
import { SheetRatesGrid } from './SheetRatesGrid';
import { useAdminDialogs } from '../AdminConfirmDialog';

export const RatesTab: React.FC = () => {
  const { confirm, notify } = useAdminDialogs();
  const { role } = useAuth();
  const permissions = useMyPermissions();

  const [activeSubtab, setActiveSubtab] = useState<'sheet' | 'international'>('sheet');
  const [internationalRates, setInternationalRates] = useState<AdminInternationalRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadRates = async () => {
    try {
      setError(null);
      const intl = await adminDataService.fetchInternationalRates();
      setInternationalRates(intl);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch rates from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  const handleDeleteInternational = async (id: string) => {
    if (!(await confirm({ title: 'Delete this fallback rate?', body: 'The row is removed from the fallback rate table. The live Google Sheet prices are not affected.', confirmLabel: 'Delete rate', danger: true }))) return;
    try {
      await adminDataService.deleteInternationalRate(id);
      setInternationalRates(prev => prev.filter(r => r.id !== id));
    } catch (e: any) {
      void notify(e.message, 'Rate not deleted');
    }
  };

  const filteredInternational = internationalRates.filter(r =>
    r.country_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.country_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.service_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl lg:text-[28px] text-[var(--text)]">
            Rates
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Website prices come from the live Google Sheet. The International tab is the old fallback table.
          </p>
        </div>

        {/* Subtabs Switcher */}
        <div className="p-1 rounded-2xl bg-slate-200 border border-slate-300 flex items-center gap-1 self-start sm:self-auto shadow-hard-xs">
          <button
            onClick={() => setActiveSubtab('sheet')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold uppercase transition-all cursor-pointer ${
              activeSubtab === 'sheet'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Rates (NPR)
          </button>
          <button
            onClick={() => setActiveSubtab('international')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold uppercase transition-all cursor-pointer ${
              activeSubtab === 'international'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            International ({internationalRates.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
          {error}
        </div>
      )}

      {activeSubtab === 'sheet' && <SheetRatesGrid />}

      {/* SUBTAB 1: INTERNATIONAL RATES */}
      {activeSubtab === 'international' && (
        <div className="space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              ['Rate rules', internationalRates.length],
              ['Destinations', new Set(internationalRates.map((r) => r.country_code)).size],
              ['Services', new Set(internationalRates.map((r) => r.service_name)).size],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white border border-slate-200 shadow-hard-xs px-4 py-3">
                <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-500">{label}</div>
                <div className="font-heading font-black text-2xl text-ox-900 tabular-nums">{value}</div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-hard-xs grid grid-cols-1 sm:grid-cols-[minmax(0,24rem)_1fr] items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country, code or service..."
                aria-label="Search rates"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gd-500"
              />
            </div>
            <span className="text-xs font-mono text-slate-500 sm:text-right">
              Showing {filteredInternational.length} of {internationalRates.length}
            </span>
          </div>

          {/* Table: fixed columns so every row lines up */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-hard-sm overflow-hidden">
            <div className="overflow-auto max-h-[65vh]">
              <table className="stack-table w-full min-w-[720px] table-fixed text-left border-collapse">
                <colgroup>
                  <col className="w-[30%]" />
                  <col className="w-[26%]" />
                  <col className="w-[18%]" />
                  <col className="w-[16%]" />
                  <col className="w-[10%]" />
                </colgroup>
                <thead className="sticky top-0 z-10">
                  <tr className="bg-ox-900 text-white text-[11px] font-heading font-bold uppercase tracking-wider">
                    <th scope="col" className="py-3 px-4">Destination</th>
                    <th scope="col" className="py-3 px-4">Service</th>
                    <th scope="col" className="py-3 px-4">Weight band</th>
                    <th scope="col" className="py-3 px-4 text-right">Base rate (USD)</th>
                    <th scope="col" className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono">
                  {loading && (
                    <tr><td colSpan={5} className="py-10 text-center text-slate-500">Loading rates...</td></tr>
                  )}
                  {!loading && filteredInternational.length === 0 && (
                    <tr><td colSpan={5} className="py-10 text-center text-slate-500">No rates match.</td></tr>
                  )}
                  {filteredInternational.map((r) => (
                    <tr key={r.id} className="odd:bg-white even:bg-slate-50/60 hover:bg-amber-50/60 transition-colors">
                      <td data-label="Destination" className="py-3 px-4 align-middle">
                        <span className="font-heading font-bold text-slate-900 block truncate">{r.country_name}</span>
                        <span className="text-[11px] text-slate-500">{r.country_code}</span>
                      </td>
                      <td data-label="Service" className="py-3 px-4 align-middle text-slate-600 truncate" title={r.service_name}>
                        {r.service_name}
                      </td>
                      <td data-label="Weight band" className="py-3 px-4 align-middle tabular-nums whitespace-nowrap">
                        {r.min_weight_kg} – {r.max_weight_kg} kg
                      </td>
                      <td data-label="Base rate (USD)" className="py-3 px-4 align-middle text-right font-bold text-emerald-700 tabular-nums">
                        ${r.rate_usd}
                      </td>
                      <td className="py-3 px-4 align-middle text-right">
                        {permissions.canManageRates && (
                          <button
                            onClick={() => handleDeleteInternational(r.id)}
                            aria-label={`Delete ${r.country_name} ${r.service_name} rate`}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer focus-visible:outline-2 focus-visible:outline-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
