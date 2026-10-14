import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (errMessage: string) => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: any) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onVerify,
  onExpire,
  onError,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'verified' | 'expired' | 'error' | 'dev_mock'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    // If no Turnstile site key is provided in environment, run in local offline Dev Mock mode
    if (!siteKey || siteKey.includes('placeholder')) {
      setStatus('dev_mock');
      const devToken = `dev_turnstile_token_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      onVerify(devToken);
      return;
    }

    let isMounted = true;

    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile) return;

      try {
        if (widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current);
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'auto',
          callback: (token: string) => {
            if (isMounted) {
              setStatus('verified');
              setErrorMessage(null);
              onVerify(token);
            }
          },
          'expired-callback': () => {
            if (isMounted) {
              setStatus('expired');
              if (onExpire) onExpire();
            }
          },
          'error-callback': (err: any) => {
            if (isMounted) {
              setStatus('error');
              const msg = 'Security verification failed. Please try again.';
              setErrorMessage(msg);
              if (onError) onError(msg);
            }
          },
        });
        setStatus('loading');
      } catch (e: any) {
        console.warn('Turnstile render exception:', e);
        if (isMounted) {
          setStatus('error');
          setErrorMessage('Unable to initialize CAPTCHA widget.');
        }
      }
    };

    // Load Turnstile Script if not already loaded
    if (window.turnstile) {
      renderWidget();
    } else {
      const existingScript = document.getElementById('cf-turnstile-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'cf-turnstile-script';
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit';
        script.async = true;
        script.defer = true;
        window.onTurnstileLoad = () => {
          if (isMounted) renderWidget();
        };
        document.head.appendChild(script);
      } else {
        window.onTurnstileLoad = () => {
          if (isMounted) renderWidget();
        };
      }
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {}
      }
    };
  }, [siteKey]);

  const handleReset = () => {
    if (status === 'dev_mock') {
      const devToken = `dev_turnstile_token_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      onVerify(devToken);
      return;
    }

    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      setStatus('loading');
      setErrorMessage(null);
    }
  };

  if (status === 'dev_mock') {
    return (
      <div className={`p-3 rounded-xl bg-slate-50 dark:bg-[#060919] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-300 ${className}`}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Cloudflare Turnstile Verified (Dev Mode)</span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-slate-400 hover:text-[#0B5ED7] transition-colors"
          title="Refresh Dev Token"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div ref={containerRef} className="min-h-[65px]" />
      
      {status === 'verified' && (
        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Anti-bot security check complete.</span>
        </div>
      )}

      {status === 'expired' && (
        <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center justify-between gap-2">
          <span>Security verification token expired.</span>
          <button type="button" onClick={handleReset} className="underline text-xs font-bold">
            Refresh CAPTCHA
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="text-[11px] text-red-600 dark:text-red-400 font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMessage || 'Verification error.'}</span>
          </div>
          <button type="button" onClick={handleReset} className="underline text-xs font-bold">
            Retry
          </button>
        </div>
      )}
    </div>
  );
};
