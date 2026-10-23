import React, { useRef, useState } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import { AdminCustomRole, AdminUserRole, AdminProfileFields, ROLE_SUMMARY } from '../types';
import { Avatar } from './Avatar';

type Role = AdminUserRole['role'];

export const ASSIGNABLE_ROLES: Role[] = ['admin', 'operations', 'editor', 'support', 'read_only', 'reseller'];
export const roleLabel = (r: Role) => r.replace('_', ' ');

interface Props {
  person: AdminUserRole | null; // null = adding someone new
  customRoles: AdminCustomRole[];
  assignedRoleIds: string[];
  lockRole: boolean; // super admins and your own row keep their role
  profileReady: boolean; // false until the staff-profiles migration is applied
  onClose: () => void;
  onSaved: (saved: AdminUserRole, roleIds: string[]) => void;
}

const input = 'w-full min-h-[44px] px-3 rounded-xl border border-[var(--line-strong)] bg-white text-[var(--ox-900)] placeholder:text-slate-500';
const label = 'block text-sm font-semibold text-[var(--ox-900)]';

/** One form for adding or editing a person: who they are, their base role and any custom roles. */
export const PersonDialog: React.FC<Props> = ({ person, customRoles, assignedRoleIds, lockRole, profileReady, onClose, onSaved }) => {
  const isNew = !person;
  const fileRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState(person?.email ?? '');
  const [role, setRole] = useState<Role>(person?.role ?? 'operations');
  const [roleIds, setRoleIds] = useState<string[]>(assignedRoleIds);
  const [profile, setProfile] = useState<Partial<AdminProfileFields>>({
    full_name: person?.full_name ?? '',
    phone: person?.phone ?? '',
    job_title: person?.job_title ?? '',
    department: person?.department ?? '',
    avatar_url: person?.avatar_url ?? '',
    notes: person?.notes ?? '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof AdminProfileFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setProfile((p) => ({ ...p, [k]: e.target.value }));

  const pickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) return setError('Photo must be a JPG, PNG or WebP image.');
    if (f.size > 2 * 1024 * 1024) return setError('Photo must be 2 MB or smaller.');
    setError(null);
    setPhoto(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      let saved = await adminDataService.saveUserRole({ email, role: lockRole && person ? person.role : role, active: person?.active ?? true });
      if (profileReady) {
        const avatar_url = photo ? await adminDataService.uploadAvatar(photo, saved.id) : profile.avatar_url;
        saved = await adminDataService.saveUserProfile(saved.id, saved.email, { ...profile, avatar_url });
      }
      if (customRoles.length) await adminDataService.setRoleAssignments(saved.id, saved.email, roleIds);
      onSaved(saved, roleIds);
    } catch (err: any) {
      setError(err.message || 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--ox-950)]/60 p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="person-title">
      <form onSubmit={submit} className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-xl max-h-[92dvh] overflow-y-auto p-5 sm:p-6 shadow-[var(--shadow-hard-lg)] space-y-5">
        <div className="flex items-center justify-between">
          <h2 id="person-title" className="font-heading font-extrabold text-lg text-[var(--ox-900)]">{isNew ? 'Add person' : 'Edit profile'}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="min-h-[40px] min-w-[40px] grid place-items-center rounded-xl text-slate-500 hover:bg-[var(--ox-50)] cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        {error && <div role="alert" className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

        {profileReady && (
          <div className="flex items-center gap-4">
            <Avatar name={profile.full_name} email={email} src={preview || profile.avatar_url} size={72} />
            <div className="space-y-1">
              <button type="button" onClick={() => fileRef.current?.click()} className="min-h-[40px] px-3 rounded-xl border border-[var(--line-strong)] text-sm font-bold text-[var(--ox-900)] hover:bg-[var(--ox-50)] flex items-center gap-2 cursor-pointer">
                <Camera className="w-4 h-4" />{preview || profile.avatar_url ? 'Change photo' : 'Add photo'}
              </button>
              <p className="text-xs text-slate-600">JPG, PNG or WebP, up to 2 MB</p>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={pickPhoto} className="sr-only" aria-label="Profile photo" />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="p-email" className={label}>Google email</label>
          <input id="p-email" type="email" required readOnly={!isNew} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@gmail.com" className={`${input} ${!isNew ? 'bg-[var(--surface-subtle)]' : ''}`} />
        </div>

        {profileReady && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="p-name" className={label}>Full name</label>
              <input id="p-name" maxLength={120} value={profile.full_name ?? ''} onChange={set('full_name')} placeholder="Sita Gurung" className={input} />
            </div>
            <div className="space-y-2">
              <label htmlFor="p-phone" className={label}>Phone</label>
              <input id="p-phone" type="tel" maxLength={32} value={profile.phone ?? ''} onChange={set('phone')} placeholder="+977 98XXXXXXXX" className={input} />
            </div>
            <div className="space-y-2">
              <label htmlFor="p-title" className={label}>Job title</label>
              <input id="p-title" maxLength={80} value={profile.job_title ?? ''} onChange={set('job_title')} placeholder="Dispatch lead" className={input} />
            </div>
            <div className="space-y-2">
              <label htmlFor="p-dept" className={label}>Department</label>
              <input id="p-dept" maxLength={80} value={profile.department ?? ''} onChange={set('department')} placeholder="Operations" className={input} />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="p-role" className={label}>Base role</label>
          {lockRole && !isNew ? (
            <p className="text-sm text-slate-700">This role is protected and can't be changed here.</p>
          ) : (
            <>
              <select id="p-role" value={role} onChange={(e) => setRole(e.target.value as Role)} className={`${input} capitalize`}>
                {ASSIGNABLE_ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
              </select>
              <p className="text-xs text-slate-600">{ROLE_SUMMARY[role]}</p>
            </>
          )}
        </div>

        {customRoles.length > 0 && (
          <fieldset className="space-y-2">
            <legend className={label}>Extra custom roles</legend>
            <p className="text-xs text-slate-600">Each one adds its pages on top of the base role.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {customRoles.map((r) => (
                <label key={r.id} className="flex items-center gap-3 min-h-[44px] px-3 rounded-xl border border-[var(--line-strong)] bg-white cursor-pointer has-[:checked]:bg-[var(--gd-50)] has-[:checked]:border-[var(--gd-500)]">
                  <input type="checkbox" checked={roleIds.includes(r.id)} onChange={() => setRoleIds((ids) => (ids.includes(r.id) ? ids.filter((x) => x !== r.id) : [...ids, r.id]))} className="w-4 h-4 accent-[var(--ox-900)]" />
                  <span className="text-sm text-[var(--ox-900)]">{r.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {profileReady && (
          <div className="space-y-2">
            <label htmlFor="p-notes" className={label}>Notes</label>
            <textarea id="p-notes" rows={2} maxLength={1000} value={profile.notes ?? ''} onChange={set('notes')} placeholder="Shift times, who to call, anything useful" className={`${input} py-2`} />
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="min-h-[44px] px-4 rounded-xl border border-[var(--line-strong)] text-slate-700 font-bold text-sm cursor-pointer">Cancel</button>
          <button type="submit" disabled={busy} className="min-h-[44px] px-5 rounded-xl bg-[var(--ox-900)] text-white font-bold text-sm active:scale-[0.98] transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}{isNew ? 'Give access' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
