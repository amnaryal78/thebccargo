import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Upload,
  Trash2,
  Search
} from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import { AdminNationalRate, AdminInternationalRate } from '../types';
import { useMyPermissions } from '../usePermissions';
import { useAuth } from '../../../context/AuthContext';
import { CsvImporterSection } from './CsvImporterSection';
import { SheetRatesGrid } from './SheetRatesGrid';

export const RatesTab: React.FC = () => {
  const { role } = useAuth();
  const permissions = useMyPermissions();

  const [activeSubtab, setActiveSubtab] = useState<'sheet' | 'international' | 'csv'>('sheet');
  const [internationalRates, setInternationalRates] = useState<AdminInternationalRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // CSV Import State
  const [csvTarget, setCsvTarget] = useState<'international'>('international');
  const [csvRawText, setCsvRawText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<any[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

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
    if (!confirm('Are you sure you want to remove this international tariff rule?')) return;
    try {
      await adminDataService.deleteInternationalRate(id);
      setInternationalRates(prev => prev.filter(r => r.id !== id));
    } catch (e: any) {
      alert(`Delete failed: ${e.message}`);
    }
  };

  // CSV Parsing Engine (International Rates Only)
  const handleParseCsv = (text: string) => {
    setCsvRawText(text);
    setCsvError(null);
    setImportSuccess(null);

    const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      setParsedPreview([]);
      if (text.trim().length > 0) setCsvError('CSV must contain a header row and at least one data row.');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim().replace(/^['"]|['"]$/g, ''));
      if (parts.length < headers.length) continue;

      const rowObj: Record<string, any> = {};
      headers.forEach((h, idx) => {
        rowObj[h] = parts[idx];
      });
      rows.push(rowObj);
    }

    const valid = rows.map(r => ({
      country_code: (r.country_code || r.code || 'USA').toUpperCase(),
      country_name: r.country_name || r.country || 'United States',
      service_name: r.service_name || r.service || 'International Priority Air Express',
      min_weight_kg: parseFloat(r.min_weight_kg || r.min_weight || '0') || 0,
      max_weight_kg: parseFloat(r.max_weight_kg || r.max_weight || '5') || 5,
      rate_usd: parseFloat(r.rate_usd || r.rate || '25') || 25,
      effective_date: r.effective_date || new Date().toISOString().split('T')[0]
    }));
    setParsedPreview(valid);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleParseCsv(text);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (parsedPreview.length === 0) return;
    setImporting(true);
    setCsvError(null);
    try {
      const count = await adminDataService.bulkUpsertInternationalRates(parsedPreview);
      setImportSuccess(`Successfully imported ${count} international rate corridors into database!`);
      await loadRates();
      setParsedPreview([]);
      setCsvRawText('');
    } catch (err: any) {
      setCsvError(err.message || 'CSV Import failed on database insertion.');
    } finally {
      setImporting(false);
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
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-slate-900 uppercase tracking-tight">
            Tariffs &amp; Rate Matrices
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage corridor pricing matrices, base tariffs, and bulk import rate tables from CSV.
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
          <button
            onClick={() => setActiveSubtab('csv')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubtab === 'csv'
                ? 'bg-gd-500 text-ox-900 shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>CSV Importer</span>
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
              <table className="w-full min-w-[720px] table-fixed text-left border-collapse">
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
                      <td className="py-3 px-4 align-middle">
                        <span className="font-heading font-bold text-slate-900 block truncate">{r.country_name}</span>
                        <span className="text-[11px] text-slate-500">{r.country_code}</span>
                      </td>
                      <td className="py-3 px-4 align-middle text-slate-600 truncate" title={r.service_name}>
                        {r.service_name}
                      </td>
                      <td className="py-3 px-4 align-middle tabular-nums whitespace-nowrap">
                        {r.min_weight_kg} – {r.max_weight_kg} kg
                      </td>
                      <td className="py-3 px-4 align-middle text-right font-bold text-emerald-700 tabular-nums">
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

      {/* SUBTAB 3: CSV IMPORTER WITH LIVE PREVIEW */}
      {activeSubtab === 'csv' && (
        <CsvImporterSection
          csvTarget={csvTarget}
          setCsvTarget={setCsvTarget}
          csvRawText={csvRawText}
          onParseCsv={handleParseCsv}
          onFileUpload={handleFileUpload}
          parsedPreview={parsedPreview}
          csvError={csvError}
          importSuccess={importSuccess}
          importing={importing}
          onExecuteImport={handleExecuteImport}
          canManageRates={permissions.canManageRates}
        />
      )}
    </div>
  );
};
