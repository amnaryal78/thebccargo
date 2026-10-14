import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AccessRestricted } from './AccessRestricted';

interface ProtectedRouteProps {
  children?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, user, loading, isAuthorizedAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-3 border-[#0B5ED7] border-t-transparent rounded-full animate-spin" />
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
  if (!isAuthorizedAdmin) {
    return <AccessRestricted />;
  }

  // 3. Authenticated AND Authorized -> Render Admin content
  return <>{children}</>;
};
