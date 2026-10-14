import React from 'react';

export interface BadgeProps {
  status: 'in_transit' | 'delivered' | 'exception' | 'pending' | 'customs';
  label?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, label, className = '' }) => {
  const config = {
    in_transit: {
      bg: 'bg-[#F59E0B]/12 text-[#B45309] dark:text-[#FBBF24] border-[#F59E0B]/30',
      dot: 'bg-[#F59E0B]',
      defaultLabel: 'IN TRANSIT',
    },
    delivered: {
      bg: 'bg-[#10B981]/12 text-[#047857] dark:text-[#34D399] border-[#10B981]/30',
      dot: 'bg-[#10B981]',
      defaultLabel: 'DELIVERED',
    },
    exception: {
      bg: 'bg-[#DC2626]/12 text-[#B91C1C] dark:text-[#F87171] border-[#DC2626]/30',
      dot: 'bg-[#DC2626]',
      defaultLabel: 'EXCEPTION',
    },
    pending: {
      bg: 'bg-[#1A56DB]/12 text-[#1E40AF] dark:text-[#60A5FA] border-[#1A56DB]/30',
      dot: 'bg-[#1A56DB]',
      defaultLabel: 'PENDING',
    },
    customs: {
      bg: 'bg-purple-500/12 text-purple-700 dark:text-purple-300 border-purple-500/30',
      dot: 'bg-purple-500',
      defaultLabel: 'CUSTOMS HOLD',
    },
  };

  const style = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold tracking-wider uppercase border ${style.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
      <span>{label || style.defaultLabel}</span>
    </span>
  );
};
