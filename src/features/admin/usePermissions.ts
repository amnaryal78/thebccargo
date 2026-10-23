import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getRolePermissions, mergePermissions, type RolePermissions } from './types';

/** What the signed-in person can do: their base role plus any custom roles. */
export function useMyPermissions(): RolePermissions {
  const { role, customPermissions } = useAuth();
  return useMemo(
    () => mergePermissions(getRolePermissions(role), customPermissions as Partial<RolePermissions>[]),
    [role, customPermissions],
  );
}
