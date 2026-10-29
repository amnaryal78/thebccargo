import React from 'react';
import type { User } from '@supabase/supabase-js';
import { AuthContext } from '../context/AuthContext';
import type { UserRoleType } from '../services/authService';

/**
 * DEV ONLY. Shows the admin as a given role without signing in, so the shell and screens can be
 * checked in a browser. Loaded by App.tsx only when import.meta.env.DEV, so it is not in the
 * production build. The database still applies its own rules: as an anonymous visitor, data
 * calls return nothing or fail, which is also a useful empty/error-state check.
 * Use: /admin?previewRole=operations (remembered for the tab; ?previewRole=off to stop).
 */
export const AdminPreview: React.FC<{ role: UserRoleType; children: React.ReactNode }> = ({ role, children }) => (
  <AuthContext.Provider
    value={{
      user: { id: '00000000-0000-4000-8000-000000000000', email: `preview-${role}@bc.invalid` } as User,
      session: null,
      loading: false,
      role,
      isAuthorizedAdmin: true,
      active: true,
      authReason: 'authorized',
      loginWithGoogle: async () => ({ error: null }),
      logout: async () => undefined,
      refreshAuth: async () => undefined,
    }}
  >
    <p className="fixed bottom-2 right-2 z-[999] rounded-[var(--r-xs)] bg-[var(--danger)] px-2 py-1 text-xs font-semibold text-white pointer-events-none">
      Dev preview as {role}
    </p>
    {children}
  </AuthContext.Provider>
);
