import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, ArrowLeft, Loader2, Globe2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BcLogo } from '../components/BcLogo';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SEOHead } from '../components/SEOHead';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, isAuthorizedAdmin, loginWithGoogle, loading: authLoading } = useAuth();

  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract redirect target safely
  const queryParams = new URLSearchParams(location.search);
  const rawRedirect = queryParams.get('redirect') || '';
  const redirectTarget = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/';

  // Automatically handle logged-in user redirection
  useEffect(() => {
    if (!authLoading && session) {
      if (isAuthorizedAdmin && redirectTarget.startsWith('/admin')) {
        navigate(redirectTarget, { replace: true });
      } else if (!redirectTarget.startsWith('/admin')) {
        navigate(redirectTarget, { replace: true });
      }
    }
  }, [session, isAuthorizedAdmin, authLoading, redirectTarget, navigate]);

  const handleGoogleLogin = async () => {
    setError(null);
    setOauthLoading(true);

    try {
      const res = await loginWithGoogle(redirectTarget);
      if (res.error) {
        setError(res.error);
        setOauthLoading(false);
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      setError('Unable to initialize Google Sign In. Please check network connection.');
      setOauthLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12">
      <SEOHead
        title="Account Sign In | The BC Cargo & Courier"
        description="Sign in with your Google account to access BC Cargo services, package history, and administration portals."
      />

      <div className="w-full max-w-md flex flex-col gap-6">
        
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#0B5ED7] transition-colors self-start cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Public Site</span>
        </Link>

        {/* Main Login Card */}
        <Card className="p-8 sm:p-10 flex flex-col gap-6 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071A33]">
          
          <div className="flex flex-col items-center text-center gap-2">
            <div className="mb-2">
              <BcLogo size="lg" showSubtitle={false} />
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white uppercase tracking-tight">
              Sign In to The BC Cargo
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in with your authorized Google account to access your account &amp; operational portals.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary Action: Google OAuth Button */}
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={oauthLoading || authLoading}
              className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0B2445] text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 font-heading font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-[#0E2F5A] active:scale-[0.99] transition-all shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {oauthLoading || authLoading ? (
                <>
                  <Loader2 className="w-5 h-5 text-[#0B5ED7] animate-spin" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400 font-mono">
              Secure single sign-on powered by Supabase Auth &amp; Google Cloud OAuth.
            </p>
          </div>

          <div className="text-center border-t border-slate-100 dark:border-slate-800 pt-4">
            <span className="text-[11px] text-slate-400 font-mono flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Database Allowlist &amp; RBAC Access Control Active</span>
            </span>
          </div>

        </Card>

      </div>
    </div>
  );
};
