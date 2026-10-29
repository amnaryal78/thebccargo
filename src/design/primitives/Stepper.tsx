import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: string;
  label: string;
  description?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStepIndex,
  onStepClick,
  className = '',
}) => {
  return (
    <nav aria-label="Progress" className={`w-full ${className}`}>
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isUpcoming = idx > currentStepIndex;

          const circleStyles = isCompleted
            ? 'bg-ox-900 text-gd-500 border-white/20 shadow-hard-xs'
            : isCurrent
            ? 'bg-gd-500 text-ox-900 border-white/60 shadow-hard-sm'
            : 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--line)] shadow-hard-xs';

          return (
            <li
              key={step.id}
              className={`relative flex-1 flex flex-col items-center ${
                idx !== steps.length - 1 ? 'pr-2 sm:pr-4' : ''
              }`}
            >
              {/* Connector Line */}
              {idx !== steps.length - 1 && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-0.5 -z-10 ${
                    idx < currentStepIndex ? 'bg-ox-900' : 'bg-[var(--line)]'
                  }`}
                  aria-hidden="true"
                />
              )}

              <button
                type="button"
                disabled={!onStepClick || isUpcoming}
                onClick={() => onStepClick && onStepClick(idx)}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex flex-col items-center group cursor-pointer disabled:cursor-default disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] rounded-[var(--r-sm)]`}
              >
                {/* Step Circle Node */}
                <span
                  className={`w-8 h-8 rounded-full border flex items-center justify-center font-heading font-bold text-xs transition-transform group-hover:scale-105 ${circleStyles}`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </span>

                {/* Step Label (Responsive & Natural Word Break) */}
                <span
                  className={`mt-2 font-heading text-xs sm:text-[13px] text-center leading-tight max-w-[85px] sm:max-w-none ${
                    isCurrent
                      ? 'font-bold text-ox-900'
                      : isCompleted
                      ? 'font-semibold text-[var(--text)]'
                      : 'text-[var(--text-muted)]'
                  }`}
                  style={{ wordBreak: 'normal', overflowWrap: 'normal' }}
                >
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
