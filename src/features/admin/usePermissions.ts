import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getRolePermissions, type RolePermissions } from './types';

/** What the signed-in person can do. Mirrors the role lists in the RLS policies (see tests/permissions.test.ts). */
export function useMyPermissions(): RolePermissions {
  const { role } = useAuth();
  return useMemo(() => getRolePermissions(role), [role]);
}
