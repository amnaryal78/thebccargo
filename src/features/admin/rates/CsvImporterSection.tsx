import React from 'react';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CsvImporterSectionProps {
  csvTarget?: 'international';
  setCsvTarget?: (target: 'international') => void;
  csvRawText: string;
  onParseCsv: (text: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  parsedPreview: any[];
  csvError: string | null;
  importSuccess: string | null;
  importing: boolean;
  onExecuteImport: () => void;
  canManageRates: boolean;
}

export const CsvImporterSection: React.FC<CsvImporterSectionProps> = ({
  csvTarget,
  setCsvTarget,
  csvRawText,
  onParseCsv,
  onFileUpload,
  parsedPreview,
  csvError,
  importSuccess,
  importing,
  onExecuteImport,
  canManageRates
}) => {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-hard-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading font-black text-base uppercase text-slate-900">
              Bulk CSV Tariff Uploader &amp; Parser
            </h2>
            <p className="text-xs text-slate-500">
              Import international carrier spreadsheets into Postgres. Validate rows and inspect before confirming insertion.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-ox-900 text-white text-xs font-mono font-bold uppercase">
              International Tariffs
            </span>
          </div>
        </div>

        {/* Template sample hint */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-600">
          <span className="font-bold text-slate-800">Required CSV Format:</span>
          <div className="mt-1 text-slate-500">
            country_code,country_name,service_name,min_weight_kg,max_weight_kg,rate_usd
            <br />
            USA,United States,International Air Express,0,5,35
          </div>
        </div>

        {/* Upload or Paste */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-heading font-bold uppercase text-slate-700">
              Paste Raw CSV or Choose File:
            </label>
            <label className="cursor-pointer text-xs font-bold text-ox-900 hover:underline flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              <span>Browse .csv file</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={onFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            rows={5}
            value={csvRawText}
            onChange={(e) => onParseCsv(e.target.value)}
            placeholder="Paste CSV rows here..."
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-900"
          />
        </div>

        {csvError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{csvError}</span>
          </div>
        )}

        {importSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{importSuccess}</span>
          </div>
        )}

        {/* Parsed Preview Table */}
        {parsedPreview.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-bold uppercase text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Parsed {parsedPreview.length} Valid Rows for Preview:</span>
              </span>

              {canManageRates && (
                <button
                  onClick={onExecuteImport}
                  disabled={importing}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-hard-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{importing ? 'Importing to DB...' : 'Confirm & Insert into Supabase'}</span>
                </button>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 text-[10px] uppercase font-bold sticky top-0">
                  <tr>
                    {Object.keys(parsedPreview[0]).map((k) => (
                      <th key={k} scope="col" className={`py-2 px-3 whitespace-nowrap ${typeof parsedPreview[0][k] === 'number' ? 'text-right' : ''}`}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedPreview.slice(0, 15).map((row, idx) => (
                    <tr key={idx} className="odd:bg-white even:bg-slate-50/60 hover:bg-amber-50/60">
                      {Object.values(row).map((val: any, vIdx) => (
                        <td key={vIdx} className={`py-1.5 px-3 whitespace-nowrap ${typeof val === 'number' ? 'text-right tabular-nums' : ''}`}>{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedPreview.length > 15 && (
                <div className="p-2 text-center text-[10px] font-mono text-slate-500 bg-slate-50 border-t border-slate-200">
                  ...and {parsedPreview.length - 15} more rows ready for batch insertion.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
