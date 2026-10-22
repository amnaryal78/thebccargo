import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Key,
  X
} from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import { AdminUserRole, getRolePermissions } from '../types';
import { useAuth } from '../../../context/AuthContext';

export const UsersTab: React.FC = () => {
  const { role: currentUserRole } = useAuth();
  const permissions = getRolePermissions(currentUserRole);

  const [userRoles, setUserRoles] = useState<AdminUserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add User Modal
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<AdminUserRole['role']>('operations');

  const loadUserRoles = async () => {
    try {
      setError(null);
      const data = await adminDataService.fetchUserRoles();
      setUserRoles(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user roles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserRoles();
  }, []);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) return;
    try {
      const saved = await adminDataService.saveUserRole({
        email: newUserEmail.trim(),
        role: newUserRole,
        active: true
      });
      setUserRoles(prev => {
        const idx = prev.findIndex(u => u.email === saved.email);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [saved, ...prev];
      });
      setIsAddingUser(false);
      setNewUserEmail('');
    } catch (err: any) {
      alert(`Failed to save role: ${err.message}`);
    }
  };

  const handleToggleActive = async (u: AdminUserRole) => {
    if (u.role === 'super_admin' && u.active) {
      alert('Cannot deactivate a super administrator directly.');
      return;
    }
    try {
      const saved = await adminDataService.saveUserRole({
        email: u.email || '',
        role: u.role,
        active: !u.active
      });
      setUserRoles(prev => prev.map(x => x.id === saved.id ? saved : x));
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-black text-2xl lg:text-3xl text-slate-900 uppercase tracking-tight">
              User Roles &amp; RBAC Allowlist
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 text-[10px] font-mono font-bold">
              Database Allowlist Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict role-based authorization matrix enforced at database RLS and routing boundaries.
          </p>
        </div>

        {permissions.canManageUsers && (
          <button
            onClick={() => setIsAddingUser(true)}
            className="px-4 py-2 rounded-xl bg-[#002147] text-white font-heading font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-hard-xs flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Assign Role</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
          {error}
        </div>
      )}

      {/* Security Info Card */}
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs space-y-2">
        <span className="font-heading font-bold uppercase text-slate-900 flex items-center gap-2">
          <Key className="w-4 h-4 text-[#F2B705]" />
          <span>RBAC Privilege Hierarchy</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px] font-mono text-slate-600">
          <div><strong className="text-slate-900">super_admin:</strong> Full system &amp; user control</div>
          <div><strong className="text-slate-900">admin:</strong> Operations, blogs, rates, settings</div>
          <div><strong className="text-slate-900">operations:</strong> Shipments, custody, milestones</div>
          <div><strong className="text-slate-900">editor:</strong> Blog CMS, AI fixer, careers</div>
          <div><strong className="text-slate-900">support:</strong> Customer inquiries, read status</div>
          <div><strong className="text-slate-900">read_only:</strong> Inspection only, 0 mutations</div>
          <div><strong className="text-slate-900">reseller:</strong> Sees rates +Rs 50/kg. No admin access</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-hard-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#002147] text-white text-[11px] font-heading font-bold uppercase tracking-wider sticky top-0">
              <th className="py-2.5 px-4">Authorized User Email</th>
              <th className="py-2.5 px-4">Assigned Role</th>
              <th className="py-2.5 px-4">Account Status</th>
              <th className="py-2.5 px-4">Granted On</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {userRoles.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-4 font-bold text-slate-900">
                  {u.email}
                </td>
                <td className="py-2.5 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    u.role === 'super_admin'
                      ? 'bg-[var(--gd-500)]/20 text-[var(--gd-800)]'
                      : u.role === 'admin'
                      ? 'bg-[var(--ox-900)]/10 text-[var(--ox-900)]'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-2.5 px-4">
                  {u.active ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-500 font-bold">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Deactivated</span>
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="py-2.5 px-4 text-right">
                  {permissions.canManageUsers && u.role !== 'super_admin' && (
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase cursor-pointer ${
                        u.active
                          ? 'bg-red-50 hover:bg-red-100 text-red-600'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                      }`}
                    >
                      {u.active ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD USER MODAL */}
      {isAddingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-hard-lg my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-heading font-bold text-base text-slate-900 uppercase tracking-wider">
                Grant Admin Access
              </h2>
              <button
                onClick={() => setIsAddingUser(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Staff Google / Auth Email</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="employee@thebccargo.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Assigned Role</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as AdminUserRole['role'])}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono"
                >
                  <option value="operations">operations (Shipments &amp; Milestones)</option>
                  <option value="editor">editor (Blog CMS &amp; Careers)</option>
                  <option value="support">support (Inquiries &amp; Quotes)</option>
                  <option value="read_only">read_only (View Only)</option>
                  <option value="admin">admin (Full Ops &amp; Tariffs)</option>
                  <option value="reseller">reseller (Rate view +Rs 50/kg, no admin access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-heading font-bold uppercase tracking-wider text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#002147] text-white font-heading font-bold uppercase tracking-wider text-xs shadow-hard-xs cursor-pointer"
                >
                  Authorize User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
