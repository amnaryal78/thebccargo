import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import { AdminCustomRole, PERMISSION_LABELS } from '../types';

interface Props {
  roles: AdminCustomRole[];
  canEdit: boolean;
  unavailable: boolean;
  onChange: (next: AdminCustomRole[]) => void;
  onMessage: (msg: string) => void;
  onError: (msg: string) => void;
}

/** Create, edit and delete custom roles. Each role is just a set of pages a person is allowed to open. */
export const CustomRolesPanel: React.FC<Props> = ({ roles, canEdit, unavailable, onChange, onMessage, onError }) => {
  const [editing, setEditing] = useState<Partial<AdminCustomRole> | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminCustomRole | null>(null);
  const [busy, setBusy] = useState(false);

  const togglePerm = (key: string) =>
    setEditing((e) => (e ? { ...e, permissions: { ...e.permissions, [key]: !e.permissions?.[key as keyof typeof e.permissions] } } : e));

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!editing?.name?.trim()) return;
    const granted = Object.fromEntries(Object.entries(editing.permissions ?? {}).filter(([, v]) => v));
    if (!Object.keys(granted).length) {
      onError('Pick at least one page this role can open.');
      return;
    }
    setBusy(true);
    try {
      const saved = await adminDataService.saveCustomRole({
        id: editing.id,
        name: editing.name,
        description: editing.description ?? '',
        permissions: granted,
      });
      onChange(editing.id ? roles.map((r) => (r.id === saved.id ? saved : r)) : [...roles, saved].sort((a, b) => a.name.localeCompare(b.name)));
      onMessage(`Role "${saved.name}" saved.`);
      setEditing(null);
    } catch (err: any) {
      onError(`Could not save role: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      await adminDataService.deleteCustomRole(pendingDelete.id, pendingDelete.name);
      onChange(roles.filter((r) => r.id !== pendingDelete.id));
      onMessage(`Role "${pendingDelete.name}" deleted. People who had it keep their base role.`);
    } catch (err: any) {
      onError(`Could not delete role: ${err.message}`);
    } finally {
      setBusy(false);
      setPendingDelete(null);
    }
  };

  if (unavailable) {
    return (
      <div className="p-5 rounded-3xl bg-[var(--gd-50)] text-sm text-[var(--gd-900)] space-y-1">
        <p className="font-heading font-bold">Custom roles are not switched on yet</p>
        <p>The database update for custom roles and profiles has not been applied. Once it is, you can create roles here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-slate-600 max-w-[60ch]">
          A custom role lists exactly which pages someone can open. Give it to a person on top of their base role.
        </p>
        {canEdit && (
          <button
            onClick={() => setEditing({ name: '', description: '', permissions: {} })}
            className="min-h-[44px] px-5 rounded-2xl bg-[var(--ox-900)] text-white font-heading font-bold text-sm shadow-[var(--shadow-hard-sm)] hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New role</span>
          </button>
        )}
      </div>

      {roles.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[var(--surface-subtle)] text-center space-y-1">
          <p className="font-heading font-bold text-[var(--ox-900)]">No custom roles yet</p>
          <p className="text-sm text-slate-600">For example "Rates clerk" who can only open Rates.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {roles.map((r) => (
            <li key={r.id} className="p-4 rounded-3xl bg-white shadow-[var(--shadow-hard-xs)] space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-heading font-bold text-[var(--ox-900)]">{r.name}</p>
                  {r.description && <p className="text-sm text-slate-600">{r.description}</p>}
                </div>
                {canEdit && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setEditing(r)} aria-label={`Edit ${r.name}`} className="min-h-[40px] min-w-[40px] grid place-items-center rounded-xl border border-[var(--line-strong)] text-[var(--ox-900)] hover:bg-[var(--ox-50)] cursor-pointer"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setPendingDelete(r)} aria-label={`Delete ${r.name}`} className="min-h-[40px] min-w-[40px] grid place-items-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PERMISSION_LABELS.filter((p) => r.permissions[p.key]).map((p) => (
                  <span key={p.key} className="px-2 py-0.5 rounded-full bg-[var(--ox-50)] text-[11px] font-medium text-[var(--ox-900)] border border-[var(--line-strong)]">{p.label}</span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--ox-950)]/60 p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="role-title">
          <form onSubmit={save} className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto p-5 sm:p-6 shadow-[var(--shadow-hard-lg)] space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="role-title" className="font-heading font-extrabold text-lg text-[var(--ox-900)]">{editing.id ? 'Edit role' : 'New role'}</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="min-h-[40px] min-w-[40px] grid place-items-center rounded-xl text-slate-500 hover:bg-[var(--ox-50)] cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2">
              <label htmlFor="cr-name" className="block text-sm font-semibold text-[var(--ox-900)]">Role name</label>
              <input id="cr-name" required minLength={2} maxLength={60} value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Rates clerk" className="w-full min-h-[44px] px-3 rounded-xl border border-[var(--line-strong)] bg-white text-[var(--ox-900)] placeholder:text-slate-500" />
            </div>
            <div className="space-y-2">
              <label htmlFor="cr-desc" className="block text-sm font-semibold text-[var(--ox-900)]">What it is for</label>
              <input id="cr-desc" maxLength={300} value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Keeps the rate tables up to date" className="w-full min-h-[44px] px-3 rounded-xl border border-[var(--line-strong)] bg-white text-[var(--ox-900)] placeholder:text-slate-500" />
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-[var(--ox-900)]">Pages this role can open</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PERMISSION_LABELS.map((p) => (
                  <label key={p.key} className="flex items-center gap-3 min-h-[44px] px-3 rounded-xl border border-[var(--line-strong)] bg-white cursor-pointer has-[:checked]:bg-[var(--gd-50)] has-[:checked]:border-[var(--gd-500)]">
                    <input type="checkbox" checked={!!editing.permissions?.[p.key]} onChange={() => togglePerm(p.key)} className="w-4 h-4 accent-[var(--ox-900)]" />
                    <span className="text-sm text-[var(--ox-900)]">{p.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="min-h-[44px] px-4 rounded-xl border border-[var(--line-strong)] text-slate-700 font-bold text-sm cursor-pointer">Cancel</button>
              <button type="submit" disabled={busy} className="min-h-[44px] px-5 rounded-xl bg-[var(--ox-900)] text-white font-bold text-sm active:scale-[0.98] transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}Save role
              </button>
            </div>
          </form>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--ox-950)]/60 p-0 sm:p-4" role="alertdialog" aria-modal="true" aria-labelledby="crdel-title">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-5 sm:p-6 shadow-[var(--shadow-hard-lg)] space-y-4">
            <h2 id="crdel-title" className="font-heading font-extrabold text-lg text-[var(--ox-900)]">Delete "{pendingDelete.name}"?</h2>
            <p className="text-sm text-slate-700">Everyone who has this role loses the pages it gave them. Their base role stays.</p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button onClick={() => setPendingDelete(null)} className="min-h-[44px] px-4 rounded-xl border border-[var(--line-strong)] text-slate-700 font-bold text-sm cursor-pointer">Keep</button>
              <button onClick={remove} disabled={busy} className="min-h-[44px] px-5 rounded-xl bg-red-600 text-white font-bold text-sm active:scale-[0.98] transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
