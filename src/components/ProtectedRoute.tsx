import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabaseConfig';
import { AccessRestricted } from './AccessRestricted';

interface ProtectedRouteProps {
  children?: ReactNode;
  /** Admin pages need the staff allowlist. Pass false for pages any signed-in customer may open (profile, messages). */
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = true }) => {
  const { session, user, loading, isAuthorizedAdmin } = useAuth();
  const location = useLocation();

  // 0. Hard-fail when Supabase is not configured
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-heading text-slate-900 mb-2">
          Admin Portal Unavailable
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Supabase backend configuration is missing. The admin portal requires a connected Supabase instance with verified authentication and role-based access control.
        </p>
        <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 w-full text-left">
          Missing environment configuration:
          <br />• VITE_SUPABASE_URL
          <br />• VITE_SUPABASE_ANON_KEY
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-3 border-[#002147] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-slate-400 tracking-wider uppercase">Verifying Authorization...</span>
      </div>
    );
  }

  // 1. Not Authenticated -> Redirect to /login preserving intended destination
  if (!session || !user) {
    const targetRedirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${targetRedirect}`} replace />;
  }

  // 2. Authenticated but NOT an authorized admin -> Show Access Restricted screen
  if (adminOnly && !isAuthorizedAdmin) {
    return <AccessRestricted />;
  }

  // 3. Authenticated AND Authorized -> Render Admin content
  return <>{children}</>;
};
