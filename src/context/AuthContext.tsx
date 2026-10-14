import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserRoleType, checkUserAdminStatus } from '../services/authService';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: UserRoleType | null;
  isAuthorizedAdmin: boolean;
  active: boolean;
  authReason: 'authorized' | 'deactivated' | 'not_found' | null;
  loginWithGoogle: (redirectTo?: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRoleType | null>(null);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);
  const [active, setActive] = useState(false);
  const [authReason, setAuthReason] = useState<'authorized' | 'deactivated' | 'not_found' | null>(null);

  const evaluateAuthorization = async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setUser(null);
      setRole(null);
      setIsAuthorizedAdmin(false);
      setActive(false);
      setAuthReason(null);
      return;
    }

    const usr = currentSession.user;
    setUser(usr);

    try {
      const authResult = await checkUserAdminStatus(usr.id, usr.email || '');
      setRole(authResult.role);
      setIsAuthorizedAdmin(authResult.isAuthorized);
      setActive(authResult.active);
      setAuthReason(authResult.reason);
    } catch (err) {
      console.warn('Failed to verify user authorization status:', err);
      setRole(null);
      setIsAuthorizedAdmin(false);
      setActive(false);
      setAuthReason('not_found');
    }
  };

  const refreshAuth = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data } = await supabase.auth.getSession();
        setSession(data?.session || null);
        await evaluateAuthorization(data?.session || null);
      }
    } catch (err) {
      console.error('Error refreshing session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(data?.session || null);
          await evaluateAuthorization(data?.session || null);
        }
      } catch (err) {
        console.warn('Error fetching initial session:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (isMounted) {
          setSession(newSession);
          await evaluateAuthorization(newSession);
          setLoading(false);
        }
      });

      return () => {
        isMounted = false;
        authListener.subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const loginWithGoogle = async (redirectTo?: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase configuration is missing. Please verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' };
    }

    try {
      const baseUrl = window.location.origin;
      const targetRedirect = `${baseUrl}/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: targetRedirect,
          queryParams: {
            prompt: 'select_account'
          }
        }
      });

      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Google OAuth failed to initialize.' };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Error during sign out:', e);
    } finally {
      setSession(null);
      setUser(null);
      setRole(null);
      setIsAuthorizedAdmin(false);
      setActive(false);
      setAuthReason(null);
      localStorage.removeItem('bc_cargo_admin_user');
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        role,
        isAuthorizedAdmin,
        active,
        authReason,
        loginWithGoogle,
        logout,
        refreshAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
