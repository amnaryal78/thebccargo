import React from 'react';

export type BadgeTone = 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-[var(--surface-2)] text-[var(--text)] border-[var(--line)]',
  brand: 'bg-[var(--ox-900)] text-white border-transparent',
  accent: 'bg-[var(--gd-100)] text-[var(--gd-800)] border-[var(--gd-200)]',
  success: 'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]/20',
  warning: 'bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--gd-200)]',
  danger: 'bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger)]/20',
  info: 'bg-[var(--info-bg)] text-[var(--info)] border-[var(--ox-100)]',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  icon?: React.ReactNode;
}

/** Small label for a fact about something: "Air", "New", "Restricted". Not a button. */
export const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', icon, className = '', children, ...props }) => (
  <span
    className={`inline-flex items-center gap-1.5 max-w-full px-2 py-0.5 rounded-[var(--r-xs)] border text-[13px] font-semibold leading-5 [overflow-wrap:anywhere] ${TONES[tone]} ${className}`}
    {...props}
  >
    {icon && <span className="shrink-0 inline-flex" aria-hidden="true">{icon}</span>}
    {children}
  </span>
);

export type ShipmentStage = 'booked' | 'transit' | 'hold' | 'delivered' | 'problem';

const STAGE_COLOR: Record<ShipmentStage, string> = {
  booked: 'var(--status-booked)',
  transit: 'var(--status-transit)',
  hold: 'var(--status-hold)',
  delivered: 'var(--status-delivered)',
  problem: 'var(--status-problem)',
};

/** Free-text status from staff -> one of five stages. Unknown text stays "booked" (neutral blue), never red. */
export function stageOf(status: string): ShipmentStage {
  const s = status.toLowerCase();
  if (/deliver(ed)?\b/.test(s) && !/out for/.test(s)) return 'delivered';
  if (/exception|return|fail|lost|damag|cancel/.test(s)) return 'problem';
  if (/hold|held|customs|await|document/.test(s)) return 'hold';
  if (/transit|depart|left|arriv|flight|out for|dispatch|shipped/.test(s)) return 'transit';
  return 'booked';
}

export interface StatusBadgeProps {
  status: string;
  stage?: ShipmentStage;
  className?: string;
}

/** Shipment status: a coloured dot carries the stage, the words carry the detail. Wraps instead of truncating. */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, stage, className = '' }) => {
  if (!status.trim()) return null;
  const color = STAGE_COLOR[stage ?? stageOf(status)];
  return (
    <span
      className={`inline-flex items-start gap-2 max-w-full px-2.5 py-1 rounded-[var(--r-xs)] bg-[var(--surface)] border border-[var(--line-strong)] text-sm font-semibold leading-5 text-[var(--text)] [overflow-wrap:anywhere] ${className}`}
    >
      <span className="mt-[6px] size-2 shrink-0 rounded-full" style={{ background: color }} aria-hidden="true" />
      {status}
    </span>
  );
};
