import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BcLogo } from './BcLogo';
import { Card, Button } from '../design/primitives';

export const AccessRestricted: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, authReason } = useAuth();

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-6">
        
        {/* Back link */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-[#002147] transition-colors self-start cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Public Site</span>
        </button>

        <Card className="p-8 sm:p-10 flex flex-col items-center text-center gap-6 shadow-2xl border border-slate-200 bg-white">
          
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="mb-1">
              <BcLogo size="md" showSubtitle={false} />
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 uppercase tracking-tight">
              Access Restricted
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your account <strong className="text-slate-900 font-mono">{user?.email}</strong> is authenticated, but it does not have permission to access the BC Cargo Admin Portal.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 w-full text-xs font-mono text-slate-500 flex flex-col gap-1">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Status Check</span>
            <span className="text-amber-600 font-bold">
              {authReason === 'deactivated'
                ? 'Account Access Disabled by Administrator'
                : 'Account Not in Database Admin Allowlist'}
            </span>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Button
              variant="primary"
              onClick={() => navigate('/')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Return to Website</span>
            </Button>

            <Button
              variant="secondary"
              onClick={logout}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Sign Out Account</span>
            </Button>
          </div>

          <div className="border-t border-slate-100 pt-4 w-full">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#002147]" />
              <span>Need access? Contact <a href="mailto:thebccargo@gmail.com" className="text-[#002147] hover:underline font-semibold">thebccargo@gmail.com</a></span>
            </p>
          </div>

        </Card>

      </div>
    </div>
  );
};
