import './route-loader.css';

/**
 * In-app Suspense fallback for route changes (the first page load uses the
 * full-screen boot loader in index.html). Same layout footprint as the old
 * spinner; a package slides along a route line. Hidden for the first 200ms so
 * quick route swaps never flash it.
 */
export function RouteLoader() {
  return (
    <div className="bc-route-loader min-h-[60vh] flex flex-col items-center justify-center gap-3" role="status">
      <svg viewBox="0 0 120 36" width="120" height="36" aria-hidden="true" focusable="false">
        <line x1="10" y1="28" x2="110" y2="28" stroke="var(--ink-200, #D9D8D2)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="10" cy="28" r="3" fill="var(--brand, #002147)" />
        <circle cx="110" cy="28" r="3" fill="var(--gold, #F2B705)" stroke="var(--brand, #002147)" strokeWidth="1.2" />
        <g className="bc-route-loader__pkg">
          <rect x="-8" y="-16" width="16" height="14" rx="3" fill="var(--gold, #F2B705)" />
          <path d="M0 -16V-2" stroke="var(--brand, #002147)" strokeWidth="2.6" />
        </g>
      </svg>
      <span className="text-xs font-mono text-[var(--text-muted)] tracking-wider">On the way…</span>
    </div>
  );
}
