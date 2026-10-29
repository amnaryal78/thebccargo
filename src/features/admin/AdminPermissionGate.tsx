import React from 'react';
import { ErrorState } from '../../design/primitives';
import { useMyPermissions } from './usePermissions';
import type { RolePermissions } from './types';

interface Props {
  /** The permission flag needed. Omit to allow everyone who reached the admin. */
  needs?: keyof RolePermissions;
  /** Gate a whole page: show an explanation instead of nothing. */
  page?: boolean;
  children: React.ReactNode;
}

/**
 * Shows its children only to roles that hold `needs`. This is display only: the database
 * policies enforce the same rule (tests/permissions.test.ts keeps them in step).
 */
export const AdminPermissionGate: React.FC<Props> = ({ needs, page = false, children }) => {
  const permissions = useMyPermissions();
  if (!needs || permissions[needs]) return <>{children}</>;
  if (!page) return null;
  return (
    <ErrorState
      title="You don't have access to this page"
      description="Your role can't open this page. If you need it for your work, ask a super admin to change your role."
    />
  );
};
