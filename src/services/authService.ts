import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Permission maps from the custom roles assigned to the signed-in person.
 * Returns [] when the custom-roles migration has not been applied yet, so sign-in is never affected.
 */
export async function fetchCustomRolePermissions(): Promise<Record<string, boolean>[]> {
  try {
    const { data, error } = await supabase.rpc('get_my_admin_access');
    if (error || !data) return [];
    const roles = (data as { custom_roles?: { permissions?: Record<string, boolean> }[] }).custom_roles ?? [];
    return roles.map((r) => r.permissions ?? {});
  } catch {
    return [];
  }
}

export type UserRoleType = 'super_admin' | 'admin' | 'editor' | 'operations' | 'support' | 'read_only' | 'reseller';

export interface UserRoleRecord {
  id: string;
  userId?: string;
  email: string;
  role: UserRoleType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MFAFactor {
  id: string;
  qrCode?: string;
  secret?: string;
  uri?: string;
}

export async function enrollMfa(): Promise<{ factor: MFAFactor | null; error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      });
      if (error) return { factor: null, error: error.message };
      if (data) {
        return {
          factor: {
            id: data.id,
            qrCode: data.totp?.qr_code,
            secret: data.totp?.secret,
            uri: data.totp?.uri
          },
          error: null
        };
      }
    } catch (e: any) {
      return { factor: null, error: e.message || 'Failed to initialize MFA enrollment.' };
    }
  }

  return {
    factor: null,
    error: 'Supabase authentication service is not configured. MFA enrollment is unavailable.'
  };
}

export interface AuthCheckResult {
  isAuthorized: boolean;
  role: UserRoleType | null;
  active: boolean;
  reason: 'authorized' | 'deactivated' | 'not_found';
  email?: string;
}

export async function verifyMfaEnrollment(factorId: string, code: string): Promise<{ success: boolean; error: string | null }> {

  if (isSupabaseConfigured) {
    try {
      const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeErr) return { success: false, error: challengeErr.message };

      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: code.trim()
      });

      if (verifyErr) return { success: false, error: verifyErr.message };
      return { success: true, error: null };
    } catch (e: any) {
      return { success: false, error: e.message || 'MFA activation failed.' };
    }
  }

  return { success: false, error: 'Supabase authentication service is not configured.' };
}


/**
 * Checks staff authorization for the signed-in user via `check_admin_authorization`.
 * Pass the current session's own id and email. Since migration 20261027 the database ignores
 * these arguments and reads the session instead (they stay so the pre-20261027 function keeps
 * working until that migration is applied). Signed-out callers are never authorized.
 */
export async function checkUserAdminStatus(userId?: string, email?: string): Promise<AuthCheckResult> {
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!isSupabaseConfigured || !userId) {
    return {
      isAuthorized: false,
      role: null,
      active: false,
      reason: 'not_found'
    };
  }

  try {
    // 1. Try RPC check_admin_authorization
    const { data, error } = await supabase.rpc('check_admin_authorization', {
      p_user_id: userId || null,
      p_email: cleanEmail || null
    });

    if (!error && data) {
      const res = data as any;
      return {
        isAuthorized: Boolean(res.is_authorized),
        role: res.role ? (res.role as UserRoleType) : null,
        active: Boolean(res.active),
        reason: res.reason || (res.is_authorized ? 'authorized' : 'not_found'),
        email: res.email || cleanEmail
      };
    }
  } catch (err) {
    console.warn('RPC check_admin_authorization fallback to table query:', err);
  }

  // 2. Direct Table Query Fallback
  try {
    // RLS ("Users read own role") limits this to the caller's own row.
    const { data, error } = await supabase.from('user_roles').select('*').eq('user_id', userId).maybeSingle();

    if (!error && data) {
      const isAuth = Boolean(data.active);
      return {
        isAuthorized: isAuth,
        role: data.role as UserRoleType,
        active: data.active,
        reason: isAuth ? 'authorized' : 'deactivated',
        email: data.email
      };
    }
  } catch (e) {
    console.warn('Database query user_roles exception:', e);
  }

  return {
    isAuthorized: false,
    role: null,
    active: false,
    reason: 'not_found'
  };
}

// ============================================================================
// ADMIN USER MANAGEMENT (ADMIN DASHBOARD USERS & ACCESS MODULE)
// ============================================================================

export async function fetchUserRoles(): Promise<UserRoleRecord[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          email: r.email,
          role: r.role as UserRoleType,
          active: Boolean(r.active ?? true),
          createdAt: r.created_at,
          updatedAt: r.updated_at || r.created_at
        }));
      }
    } catch (e) {
      console.warn('Failed to fetch user roles from Supabase:', e);
    }
  }

  return [];
}

export async function grantUserAccess(
  email: string,
  role: UserRoleType,
  actorEmail?: string
): Promise<{ record: UserRoleRecord | null; error: string | null }> {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { record: null, error: 'Please enter a valid Google email address.' };
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .upsert({
          email: cleanEmail,
          role,
          active: true,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { record: null, error: error.message };
      }

      if (data) {
        // Log Audit Event
        await logAuthAudit(actorEmail || 'System Admin', 'GRANT_ADMIN_ACCESS', cleanEmail, { role });

        return {
          record: {
            id: data.id,
            userId: data.user_id,
            email: data.email,
            role: data.role as UserRoleType,
            active: data.active,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          },
          error: null
        };
      }
    } catch (err: any) {
      return { record: null, error: err.message || 'Failed to grant admin access.' };
    }
  }

  return { record: null, error: 'Database service unavailable.' };
}

export async function updateUserRole(
  id: string,
  role: UserRoleType,
  targetEmail?: string,
  actorEmail?: string
): Promise<{ success: boolean; error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) return { success: false, error: error.message };

      await logAuthAudit(actorEmail || 'System Admin', 'UPDATE_ADMIN_ROLE', targetEmail || id, { newRole: role });
      return { success: true, error: null };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
  return { success: false, error: 'Database service unavailable.' };
}

export async function toggleUserActiveStatus(
  id: string,
  active: boolean,
  targetEmail?: string,
  actorEmail?: string
): Promise<{ success: boolean; error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ active, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) return { success: false, error: error.message };

      await logAuthAudit(actorEmail || 'System Admin', active ? 'ENABLE_ADMIN_ACCESS' : 'DISABLE_ADMIN_ACCESS', targetEmail || id, { active });
      return { success: true, error: null };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
  return { success: false, error: 'Database service unavailable.' };
}

export async function revokeUserAccess(
  id: string,
  targetEmail?: string,
  actorEmail?: string
): Promise<{ success: boolean; error: string | null }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('user_roles').delete().eq('id', id);
      if (error) return { success: false, error: error.message };

      await logAuthAudit(actorEmail || 'System Admin', 'REVOKE_ADMIN_ACCESS', targetEmail || id, {});
      return { success: true, error: null };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
  return { success: false, error: 'Database service unavailable.' };
}

export async function logAuthAudit(
  actorEmail: string,
  action: string,
  targetEntity: string,
  metadata?: any
): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('audit_logs').insert({
        actor_email: actorEmail,
        action,
        target_entity: targetEntity,
        metadata: metadata || {}
      });
    } catch (e) {
      console.warn('Failed to insert audit log:', e);
    }
  }
}
