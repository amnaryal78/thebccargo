import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  location?: string;
  timestamp?: string;
  status: 'completed' | 'current' | 'pending' | 'exception';
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, className = '' }) => {
  return (
    <div className={`flex flex-col relative pl-6 sm:pl-8 ${className}`}>
      {/* Continuous Timeline Rule */}
      <div
        className="absolute left-[11px] sm:left-[15px] top-3 bottom-3 w-0.5 bg-[var(--line)]"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-6">
        {items.map((item) => {
          const isCompleted = item.status === 'completed';
          const isCurrent = item.status === 'current';
          const isException = item.status === 'exception';

          const markerStyles = isCompleted
            ? 'bg-ox-900 text-gd-500 border-white/20 shadow-hard-xs'
            : isCurrent
            ? 'bg-gd-500 text-ox-900 border-white/60 shadow-hard-sm'
            : isException
            ? 'bg-[var(--danger)] text-white border-white/20 shadow-hard-xs'
            : 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--line)] shadow-hard-xs';

          return (
            <div key={item.id} className="relative flex items-start gap-4 group">
              {/* Marker Node */}
              <div
                className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center shrink-0 z-10 font-bold transition-transform group-hover:scale-105 ${markerStyles}`}
                aria-hidden="true"
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : isCurrent ? (
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                ) : isException ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[var(--line-strong)]" />
                )}
              </div>

              {/* Node Details */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4
                    className={`font-heading font-semibold text-[15px] ${
                      isCurrent
                        ? 'text-ox-900'
                        : isCompleted
                        ? 'text-[var(--text)]'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {item.title}
                  </h4>
                  {item.timestamp && (
                    <span className="font-data text-xs text-[var(--text-muted)]">
                      {item.timestamp}
                    </span>
                  )}
                </div>

                {item.location && (
                  <span className="font-data text-xs text-[var(--accent-text)] font-semibold mt-0.5">
                    {item.location}
                  </span>
                )}

                {item.description && (
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 leading-normal">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
