import React, { useState, useEffect } from 'react';
import { UserPlus, ShieldCheck, Trash2, Pencil, X, Check, Loader2, Phone } from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import { AdminUserRole, ResellerStats, getRolePermissions, PERMISSION_LABELS, ROLE_SUMMARY } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { useMyPermissions } from '../usePermissions';
import { Avatar } from './Avatar';
import { RequestsPanel } from './RequestsPanel';
import { PersonDialog, ASSIGNABLE_ROLES, roleLabel } from './PersonDialog';

type Role = AdminUserRole['role'];

const rolePill = (r: Role) =>
  r === 'super_admin'
    ? 'bg-[var(--gd-100)] text-[var(--gd-800)]'
    : r === 'admin'
    ? 'bg-[var(--ox-100)] text-[var(--ox-900)]'
    : 'bg-[var(--surface-muted)] text-slate-700';

/** Chips showing exactly which areas a role can open, so access is never a guess. */
const AccessChips: React.FC<{ role: Role }> = ({ role }) => {
  const perms = getRolePermissions(role);
  const allowed = PERMISSION_LABELS.filter((p) => perms[p.key]);
  if (!allowed.length) return <span className="text-xs text-slate-500">No admin pages</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {allowed.map((p) => (
        <span key={p.key} className="px-2 py-0.5 rounded-full bg-white text-[11px] font-medium text-[var(--ox-900)] border border-[var(--line-strong)]">
          {p.label}
        </span>
      ))}
      {perms.isReadOnly && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[11px] font-semibold text-amber-900">View only</span>}
    </div>
  );
};

export const UsersTab: React.FC = () => {
  const { user, role: myRole } = useAuth();
  const permissions = useMyPermissions();
  const myEmail = (user?.email || '').toLowerCase();

  const [userRoles, setUserRoles] = useState<AdminUserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [dialog, setDialog] = useState<{ person: AdminUserRole | null } | null>(null);
  const [tab, setTab] = useState<'people' | 'requests'>('people');
  const [pendingRequests, setPendingRequests] = useState(0);
  // True until the custom-roles / profiles migration has been applied to the database.

  const [pendingDelete, setPendingDelete] = useState<AdminUserRole | null>(null);
  const [pendingPause, setPendingPause] = useState<AdminUserRole | null>(null);
  const [typedEmail, setTypedEmail] = useState('');
  const [resellerStats, setResellerStats] = useState<Record<string, ResellerStats>>({});

  const flash = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 3500);
  };

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        setUserRoles(await adminDataService.fetchUserRoles());
        void adminDataService.fetchResellerStats().then(setResellerStats);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user roles.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const upsertLocal = (saved: AdminUserRole) =>
    setUserRoles((prev) => (prev.some((u) => u.id === saved.id) ? prev.map((u) => (u.id === saved.id ? saved : u)) : [saved, ...prev]));

  const handleSaved = (saved: AdminUserRole) => {
    const wasNew = !userRoles.some((u) => u.id === saved.id);
    upsertLocal(saved);
    setDialog(null);
    flash(wasNew ? `${saved.email} can now sign in.` : 'Profile saved.');
  };

  const update = async (u: AdminUserRole, patch: { role?: Role; active?: boolean }, done: string) => {
    setBusyId(u.id);
    setError(null);
    try {
      const saved = await adminDataService.saveUserRole({
        email: u.email || '',
        role: patch.role ?? u.role,
        active: patch.active ?? u.active,
      });
      upsertLocal(saved);
      flash(done);
    } catch (err: any) {
      setError(`Update failed: ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    const u = pendingDelete;
    if (!u) return;
    setBusyId(u.id);
    setError(null);
    try {
      await adminDataService.deleteUserRole(u.id, u.email);
      setUserRoles((prev) => prev.filter((x) => x.id !== u.id));
      flash(`${u.email} no longer has admin access.`);
    } catch (err: any) {
      setError(`Delete failed: ${err.message}`);
    } finally {
      setBusyId(null);
      setPendingDelete(null);
    }
  };

  /** Super admins and your own row are protected so nobody can lock the team out. */
  const isProtected = (u: AdminUserRole) => u.role === 'super_admin' || (u.email || '').toLowerCase() === myEmail;
  const canEdit = permissions.canManageUsers;

  /** Roles are changed only inside the edit dialog (with a confirm step), never from a one-click control in the list. */
  const RoleSelect = ({ u }: { u: AdminUserRole }): React.ReactElement => (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold capitalize ${rolePill(u.role)}`}>{roleLabel(u.role)}</span>
  );

  const RowActions = ({ u }: { u: AdminUserRole }): React.ReactElement => {
    const editBtn = (
      <button
        type="button"
        onClick={() => setDialog({ person: u })}
        aria-label={`Edit ${u.full_name || u.email}`}
        className="min-h-[40px] min-w-[40px] grid place-items-center rounded-xl border border-[var(--line-strong)] bg-white text-[var(--ox-900)] hover:bg-[var(--ox-50)] active:scale-[0.98] transition cursor-pointer"
      >
        <Pencil className="w-4 h-4" />
      </button>
    );
    if (!canEdit) return <span className="text-xs text-slate-600">View only</span>;
    if (isProtected(u)) {
      return (
        <div className="flex items-center gap-2">
          {editBtn}
          <span className="text-xs text-slate-600">{u.email?.toLowerCase() === myEmail ? 'You' : 'Protected'}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        {editBtn}
        <button
          type="button"
          disabled={busyId === u.id}
          onClick={() => (u.active ? setPendingPause(u) : update(u, { active: true }, `${u.email} activated.`))}
          className="min-h-[40px] px-3 rounded-xl border border-[var(--line-strong)] bg-white text-xs font-bold text-[var(--ox-900)] hover:bg-[var(--ox-50)] active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
        >
          {u.active ? 'Pause access' : 'Restore access'}
        </button>
        <button
          type="button"
          onClick={() => { setTypedEmail(''); setPendingDelete(u); }}
          aria-label={`Remove ${u.email}`}
          className="min-h-[40px] min-w-[40px] grid place-items-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 active:scale-[0.98] transition cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const PersonInfo = ({ u }: { u: AdminUserRole }): React.ReactElement => (
    <div className="min-w-0">
      <p className="font-semibold text-[var(--ox-900)] text-sm truncate">{u.full_name || u.email}</p>
      {u.full_name && <p className="text-xs text-slate-600 break-all">{u.email}</p>}
      {(u.job_title || u.department) && (
        <p className="text-xs text-slate-600">{[u.job_title, u.department].filter(Boolean).join(', ')}</p>
      )}
      {u.role === 'reseller' && resellerStats[u.id] && (
        <p className="text-xs text-slate-600">
          {resellerStats[u.id].total_orders} orders, {resellerStats[u.id].completed_orders} delivered, {resellerStats[u.id].orders_this_month} this month
        </p>
      )}
      {u.phone && (
        <a href={`tel:${u.phone}`} className="inline-flex items-center gap-1 text-xs font-medium text-[var(--ox-600)] hover:underline">
          <Phone className="w-3 h-3" />{u.phone}
        </a>
      )}
    </div>
  );


  const StatusBadge: React.FC<{ active: boolean }> = ({ active }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${active ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
      {active ? 'Active' : 'Paused'}
    </span>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading font-extrabold text-2xl lg:text-3xl text-[var(--ox-900)] tracking-tight">Users &amp; roles</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-[60ch]">
            Only emails listed here can sign in to the admin desk. A role decides which pages that person can open.
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setDialog({ person: null })}
            className="min-h-[44px] px-5 rounded-2xl bg-[var(--ox-900)] text-white font-heading font-bold text-sm shadow-[var(--shadow-hard-sm)] hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add person</span>
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss" className="shrink-0 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}
      {notice && (
        <div role="status" className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
          <Check className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div role="tablist" aria-label="Users and roles" className="inline-flex p-1 rounded-2xl bg-[var(--surface-muted)] shadow-[var(--clay-inset)]">
        {([['people', 'People'], ['requests', 'Requests']] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`min-h-[40px] px-4 rounded-xl text-sm font-bold transition cursor-pointer ${tab === k ? 'bg-white text-[var(--ox-900)] shadow-[var(--shadow-hard-xs)]' : 'text-slate-600 hover:text-[var(--ox-900)]'}`}>
            {l}
            {k === 'requests' && pendingRequests > 0 && <span className="ml-2 inline-grid place-items-center min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--gd-500)] text-[var(--ox-900)] text-[11px] font-bold">{pendingRequests}</span>}
          </button>
        ))}
      </div>

      {!canEdit && (
        <div role="note" className="p-4 rounded-2xl bg-[var(--gd-50)] border border-[var(--gd-300)] text-sm text-[var(--gd-900)]">
          You are signed in as <strong className="break-all">{user?.email}</strong>{myRole ? <> with the <strong>{roleLabel(myRole)}</strong> role</> : null}.
          Only a super admin can add people, remove access or delete it. Ask a super admin to change your role if you need these buttons.
        </div>
      )}

      {tab === 'requests' && (
        <RequestsPanel canDecide={canEdit} decidedBy={user?.email || ''} onMessage={flash} onError={setError} onPendingCount={setPendingRequests} />
      )}

      {tab === 'people' && (<>
      {/* What each role can open */}
      <section aria-label="Role access" className="space-y-3">
        <h2 className="font-heading font-bold text-base text-[var(--ox-900)]">What each role can open</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {(['super_admin', ...ASSIGNABLE_ROLES] as Role[]).map((r) => (
            <div key={r} className="p-4 rounded-3xl bg-[var(--surface-subtle)] shadow-[var(--shadow-hard-xs)] space-y-2.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${rolePill(r)}`}>{roleLabel(r)}</span>
                <span className="text-sm text-slate-700">{ROLE_SUMMARY[r]}</span>
              </div>
              <AccessChips role={r} />
            </div>
          ))}
        </div>
      </section>

      {/* People */}
      <section aria-label="People with access" className="space-y-3">
        <h2 className="font-heading font-bold text-base text-[var(--ox-900)]">
          People with access {!loading && <span className="text-slate-500 font-medium">({userRoles.length})</span>}
        </h2>

        {loading ? (
          <div className="space-y-3" aria-busy="true">
            {[0, 1, 2].map((i) => <div key={i} className="h-20 rounded-3xl bg-[var(--surface-muted)] animate-pulse" />)}
          </div>
        ) : userRoles.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[var(--surface-subtle)] text-center space-y-1">
            <ShieldCheck className="w-6 h-6 mx-auto text-[var(--ox-500)]" />
            <p className="font-heading font-bold text-[var(--ox-900)]">No one has been added yet</p>
            <p className="text-sm text-slate-600">Use Add person to give a teammate access.</p>
          </div>
        ) : (
          <>
            {/* Mobile: one card per person, nothing hidden */}
            <ul className="md:hidden space-y-3">
              {userRoles.map((u) => (
                <li key={u.id} className="p-4 rounded-3xl bg-white shadow-[var(--shadow-hard-xs)] space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar name={u.full_name} email={u.email} src={u.avatar_url} />
                    <div className="min-w-0 flex-1">{PersonInfo({ u })}</div>
                    <StatusBadge active={u.active} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-600">Base role</p>
                    {RoleSelect({ u })}
                  </div>
                  <p className="text-xs text-slate-600">Added {new Date(u.created_at).toLocaleDateString()}</p>
                  {RowActions({ u })}
                </li>
              ))}
            </ul>

            {/* Desktop: table */}
            <div className="hidden md:block rounded-3xl bg-white shadow-[var(--shadow-hard-sm)] overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-slate-600 bg-[var(--surface-subtle)]">
                    <th className="py-3 px-4">Person</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Added</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userRoles.map((u) => (
                    <tr key={u.id} className="border-t border-[var(--line)] hover:bg-[var(--surface-subtle)] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.full_name} email={u.email} src={u.avatar_url} />
                          <div className="min-w-0">{PersonInfo({ u })}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4"><div className="space-y-1.5">{RoleSelect({ u })}</div></td>
                      <td className="py-3 px-4"><StatusBadge active={u.active} /></td>
                      <td className="py-3 px-4 text-slate-600">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4"><div className="flex justify-end">{RowActions({ u })}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      </>)}

      {/* Add / edit person */}
      {dialog && (
        <PersonDialog
          person={dialog.person}
          lockRole={!!dialog.person && isProtected(dialog.person)}
          profileReady
          onClose={() => setDialog(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Pause confirmation */}
      {pendingPause && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--ox-950)]/60 p-0 sm:p-4" role="alertdialog" aria-modal="true" aria-labelledby="pause-title">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-5 sm:p-6 shadow-[var(--shadow-hard-lg)] space-y-4">
            <h2 id="pause-title" className="font-heading font-extrabold text-lg text-[var(--ox-900)]">Pause access?</h2>
            <p className="text-sm text-slate-700">
              <strong className="break-all">{pendingPause.email}</strong> loses access straight away. Their profile stays and you can restore access at any time.
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button onClick={() => setPendingPause(null)} className="min-h-[44px] px-4 rounded-xl border border-[var(--line-strong)] text-slate-700 font-bold text-sm cursor-pointer">Cancel</button>
              <button
                onClick={async () => { const u = pendingPause; setPendingPause(null); await update(u, { active: false }, `${u.email} paused.`); }}
                className="min-h-[44px] px-5 rounded-xl bg-amber-600 text-white font-bold text-sm active:scale-[0.98] transition cursor-pointer"
              >
                Pause access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--ox-950)]/60 p-0 sm:p-4" role="alertdialog" aria-modal="true" aria-labelledby="del-title">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-5 sm:p-6 shadow-[var(--shadow-hard-lg)] space-y-4">
            <h2 id="del-title" className="font-heading font-extrabold text-lg text-[var(--ox-900)]">Remove access?</h2>
            <p className="text-sm text-slate-700">
              <strong className="break-all">{pendingDelete.email}</strong> will no longer be able to sign in to the admin desk. You can add them again later.
            </p>
            <div className="space-y-1.5">
              <label htmlFor="del-confirm" className="block text-sm font-semibold text-[var(--ox-900)]">Type their email to confirm</label>
              <input id="del-confirm" autoComplete="off" value={typedEmail} onChange={(e) => setTypedEmail(e.target.value)} placeholder={pendingDelete.email || ''} className="w-full min-h-[44px] px-3 rounded-xl border border-[var(--line-strong)] bg-white text-[var(--ox-900)] placeholder:text-slate-400" />
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button onClick={() => setPendingDelete(null)} className="min-h-[44px] px-4 rounded-xl border border-[var(--line-strong)] text-slate-700 font-bold text-sm cursor-pointer">Keep</button>
              <button
                onClick={confirmDelete}
                disabled={busyId === pendingDelete.id || typedEmail.trim().toLowerCase() !== (pendingDelete.email || '').toLowerCase()}
                className="min-h-[44px] px-5 rounded-xl bg-red-600 text-white font-bold text-sm active:scale-[0.98] transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {busyId === pendingDelete.id && <Loader2 className="w-4 h-4 animate-spin" />}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
