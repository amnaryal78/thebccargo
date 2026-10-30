import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  Clock,
  User,
  Tag,
  CheckCircle2,
  RefreshCw,
  X
} from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import { AdminAuditLog } from '../types';

export const AuditLogTab: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);

  const loadLogs = async () => {
    try {
      setError(null);
      const data = await adminDataService.fetchAuditLogs(150);
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter(l =>
    (l.actor_email && l.actor_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.target_entity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl lg:text-[28px] text-[var(--text)]">
              Audit log
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-bold">
              Append-Only
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all staff mutations, tariff edits, shipment updates, and role alterations.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-heading font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 shadow-hard-xs flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-hard-xs flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search actor, action, or entity..."
            aria-label="Search audit log"
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-900 focus:outline-none"
          />
        </div>
        <span className="text-xs font-mono text-slate-500">
          Showing {filtered.length} logged events
        </span>
      </div>

      {/* Dense Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-hard-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="stack-table w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-ox-900 text-white text-[11px] font-heading font-bold uppercase tracking-wider sticky top-0">
                <th className="py-2.5 px-4">Timestamp (UTC)</th>
                <th className="py-2.5 px-4">Staff Actor</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Target Entity</th>
                <th className="py-2.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                    {loading ? 'Retrieving audit logs...' : 'No events logged.'}
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td data-label="Timestamp (UTC)" className="py-2.5 px-4 text-slate-500 text-[11px]">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td data-label="Staff Actor" className="py-2.5 px-4 font-bold text-slate-900">
                      {l.actor_email || 'system'}
                    </td>
                    <td data-label="Action" className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold uppercase text-[10px]">
                        {l.action}
                      </span>
                    </td>
                    <td data-label="Target Entity" className="py-2.5 px-4 text-slate-700">
                      {l.target_entity}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {l.metadata && Object.keys(l.metadata).length > 0 ? (
                        <button
                          onClick={() => setSelectedLog(l)}
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          View JSON
                        </button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* METADATA INSPECTOR MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-hard-lg my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="font-heading font-bold text-sm text-slate-900 uppercase tracking-wider">
                  Audit Payload: {selectedLog.action}
                </h2>
                <span className="text-[10px] font-mono text-slate-400">
                  Target: {selectedLog.target_entity} · Actor: {selectedLog.actor_email}
                </span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-72">
              {JSON.stringify(selectedLog.metadata, null, 2)}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-heading font-bold uppercase inline-flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
