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

export const RatesTab: React.FC = () => {
  const { role } = useAuth();
  const permissions = useMyPermissions();

  const [activeSubtab, setActiveSubtab] = useState<'international' | 'csv'>('international');
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
                ? 'bg-[#F2B705] text-[#002147] shadow-sm font-extrabold'
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

      {/* SUBTAB 1: INTERNATIONAL RATES */}
      {activeSubtab === 'international' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-hard-xs flex items-center justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country name or code..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-900 focus:outline-none"
              />
            </div>
            <span className="text-xs font-mono text-slate-500">
              {filteredInternational.length} destinations active
            </span>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-hard-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#002147] text-white text-[11px] font-heading font-bold uppercase tracking-wider sticky top-0">
                    <th className="py-2.5 px-4">Destination Country</th>
                    <th className="py-2.5 px-4">Service</th>
                    <th className="py-2.5 px-4">Weight Band</th>
                    <th className="py-2.5 px-4">Base Rate (USD)</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono">
                  {filteredInternational.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4">
                        <span className="font-heading font-bold text-slate-900 block">
                          {r.country_name} ({r.country_code})
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {r.service_name}
                      </td>
                      <td className="py-2.5 px-4">
                        {r.min_weight_kg} – {r.max_weight_kg} kg
                      </td>
                      <td className="py-2.5 px-4 font-bold text-emerald-600">
                        ${r.rate_usd} USD
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        {permissions.canManageRates && (
                          <button
                            onClick={() => handleDeleteInternational(r.id)}
                            className="p-1 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer"
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
