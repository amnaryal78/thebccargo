import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login?redirect=/admin', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-3 border-ox-900 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-mono text-slate-400">Redirecting to sign in...</span>
    </div>
  );
};
