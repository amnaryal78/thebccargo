import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Plus,
  Edit,
  Save,
  CheckCircle2,
  XCircle,
  HelpCircle,
  X,
  FileText,
  Info
} from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import { AdminHandlingRule } from '../types';
import { useMyPermissions } from '../usePermissions';
import { useAuth } from '../../../context/AuthContext';
import { useAdminDialogs } from '../AdminConfirmDialog';

export const HandlingRulesTab: React.FC = () => {
  const { confirm, notify } = useAdminDialogs();
  const { role } = useAuth();
  const permissions = useMyPermissions();

  const [rules, setRules] = useState<AdminHandlingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [editingRule, setEditingRule] = useState<AdminHandlingRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [ruleDraft, setRuleDraft] = useState<Partial<AdminHandlingRule>>({
    flag: 'liquid',
    country_code: null,
    mode: null,
    allowed: true,
    surcharge_type: 'percent',
    surcharge_value: 15,
    requirements_md: '[PLACEHOLDER] Leak-proof sealed packaging required. Include Material Safety Data Sheet (MSDS).',
    is_placeholder: true,
    active: true
  });

  const loadRules = async () => {
    try {
      setError(null);
      const data = await adminDataService.fetchHandlingRules();
      setRules(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch handling rules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleOpenEdit = (rule: AdminHandlingRule) => {
    setEditingRule(rule);
    setRuleDraft({ ...rule });
  };

  const handleOpenCreate = () => {
    setRuleDraft({
      flag: 'other',
      country_code: null,
      mode: null,
      allowed: true,
      surcharge_type: 'flat_npr',
      surcharge_value: 500,
      requirements_md: '[PLACEHOLDER] Special documentation and packaging verification required.',
      is_placeholder: true,
      active: true
    });
    setIsCreating(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Changing an existing rule changes what customers are told on the website straight away.
    if (editingRule && !(await confirm({ title: 'Save this rule change?', body: 'Customers will see the new rule on the website as soon as it is saved.', confirmLabel: 'Save rule' }))) return;
    try {
      const saved = await adminDataService.saveHandlingRule({
        ...ruleDraft,
        id: editingRule?.id
      });
      if (editingRule) {
        setRules(prev => prev.map(r => r.id === saved.id ? saved : r));
        setEditingRule(null);
      } else {
        setRules(prev => [...prev, saved]);
        setIsCreating(false);
      }
    } catch (err: any) {
      void notify(err.message, 'Rule not saved');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl lg:text-[28px] text-[var(--text)]">
              Handling rules
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 text-[10px] font-mono font-bold">
              Rate Estimator Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic packaging mandates and surcharge calculations for liquid, meat, medicine, and hazardous freight.
          </p>
        </div>

        {permissions.canManageHandlingRules && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-ox-900 text-white font-heading font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-hard-xs flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Rule</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
          {error}
        </div>
      )}

      {/* Rules Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 space-y-1">
          <p className="font-bold">Notice Regarding Regulatory Agency Decrees</p>
          <p className="text-[11px] leading-relaxed">
            Per project contract, agents and staff must never invent regulatory claims or decrees. Rules marked with the
            <strong className="text-amber-900 font-mono"> [PLACEHOLDER] </strong>
            flag will display a clear advisory banner to customers on the public Rate Estimator until verified with official civil aviation or customs documentation.
          </p>
        </div>
      </div>

      {/* Rules Grid / Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-hard-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="stack-table w-full text-left border-collapse">
            <thead>
              <tr className="bg-ox-900 text-white text-[11px] font-heading font-bold uppercase tracking-wider sticky top-0">
                <th className="py-2.5 px-4">Cargo Flag</th>
                <th className="py-2.5 px-4">Corridor / Mode</th>
                <th className="py-2.5 px-4">Permitted</th>
                <th className="py-2.5 px-4">Surcharge</th>
                <th className="py-2.5 px-4">Packaging &amp; Requirements</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                    {loading ? 'Loading handling rules...' : 'No handling rules found.'}
                  </td>
                </tr>
              ) : (
                rules.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td data-label="Cargo Flag" className="py-2.5 px-4 font-mono font-bold uppercase text-slate-900">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100">
                        {r.flag}
                      </span>
                    </td>
                    <td data-label="Corridor / Mode" className="py-2.5 px-4 font-mono text-slate-600">
                      {r.country_code ? `Country: ${r.country_code}` : 'Global'} {r.mode ? `(${r.mode})` : ''}
                    </td>
                    <td data-label="Permitted" className="py-2.5 px-4">
                      {r.allowed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Allowed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                          <XCircle className="w-4 h-4" />
                          <span>Prohibited</span>
                        </span>
                      )}
                    </td>
                    <td data-label="Surcharge" className="py-2.5 px-4 font-mono font-semibold text-slate-900">
                      {r.surcharge_type === 'percent' && `+${r.surcharge_value}% of freight`}
                      {r.surcharge_type === 'flat_npr' && `NPR ${r.surcharge_value} flat`}
                      {r.surcharge_type === 'per_kg_npr' && `NPR ${r.surcharge_value} / kg`}
                      {!r.surcharge_type && 'None'}
                    </td>
                    <td data-label="Packaging & Requirements" className="py-2.5 px-4 max-w-xs">
                      <p className="text-[11px] text-slate-500 truncate" title={r.requirements_md}>
                        {r.requirements_md}
                      </p>
                      {r.is_placeholder && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 font-mono text-[9px] font-bold">
                          [PLACEHOLDER]
                        </span>
                      )}
                    </td>
                    <td data-label="Status" className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        r.active ? 'bg-emerald-500/15 text-emerald-600' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {r.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {permissions.canManageHandlingRules && (
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-heading font-bold text-[10px] uppercase tracking-wider cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT RULE MODAL */}
      {(isCreating || editingRule) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-hard-lg my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-heading font-bold text-base text-slate-900 uppercase tracking-wider">
                {editingRule ? `Edit Rule: ${editingRule.flag}` : 'Add Handling Rule'}
              </h2>
              <button
                onClick={() => { setIsCreating(false); setEditingRule(null); }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Flag Category</label>
                  <select
                    value={ruleDraft.flag}
                    onChange={(e) => setRuleDraft({ ...ruleDraft, flag: e.target.value as AdminHandlingRule['flag'] })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono"
                  >
                    <option value="liquid">Liquid</option>
                    <option value="meat">Meat &amp; Perishables</option>
                    <option value="medicine">Medicine</option>
                    <option value="other">Other Regulated Goods</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Country Corridor (ISO Alpha-3)</label>
                  <input
                    type="text"
                    value={ruleDraft.country_code || ''}
                    onChange={(e) => setRuleDraft({ ...ruleDraft, country_code: e.target.value ? e.target.value.toUpperCase() : null })}
                    placeholder="Leave empty for global"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Allowed?</label>
                  <select
                    value={ruleDraft.allowed ? 'true' : 'false'}
                    onChange={(e) => setRuleDraft({ ...ruleDraft, allowed: e.target.value === 'true' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono"
                  >
                    <option value="true">Allowed</option>
                    <option value="false">Prohibited</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Surcharge Type</label>
                  <select
                    value={ruleDraft.surcharge_type || 'none'}
                    onChange={(e) => setRuleDraft({ ...ruleDraft, surcharge_type: e.target.value === 'none' ? null : (e.target.value as any) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat_npr">Flat (NPR)</option>
                    <option value="per_kg_npr">Per Kg (NPR)</option>
                    <option value="none">No Surcharge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Surcharge Value</label>
                  <input
                    type="number"
                    step="any"
                    value={ruleDraft.surcharge_value ?? 0}
                    onChange={(e) => setRuleDraft({ ...ruleDraft, surcharge_value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Requirements &amp; Packaging Notes (Markdown)</label>
                <textarea
                  rows={4}
                  required
                  value={ruleDraft.requirements_md || ''}
                  onChange={(e) => setRuleDraft({ ...ruleDraft, requirements_md: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ruleDraft.is_placeholder}
                    onChange={(e) => setRuleDraft({ ...ruleDraft, is_placeholder: e.target.checked })}
                    className="rounded text-ox-900 focus:ring-0"
                  />
                  <span className="text-[11px] font-bold text-amber-600">Mark as [PLACEHOLDER] Notice</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ruleDraft.active}
                    onChange={(e) => setRuleDraft({ ...ruleDraft, active: e.target.checked })}
                    className="rounded text-ox-900 focus:ring-0"
                  />
                  <span className="text-[11px] font-bold text-slate-700">Active in Estimator</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsCreating(false); setEditingRule(null); }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-heading font-bold uppercase tracking-wider text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-ox-900 text-white font-heading font-bold uppercase tracking-wider text-xs shadow-hard-xs cursor-pointer"
                >
                  Save Handling Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
