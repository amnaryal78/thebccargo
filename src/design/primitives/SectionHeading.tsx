import React from 'react';

interface SectionHeadingProps {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  /** Right-aligned slot on wide screens, e.g. a "See all" link */
  action?: React.ReactNode;
  as?: 'h1' | 'h2';
  className?: string;
}

/** One heading style for every section: small gold label, display title, short lead. */
export const SectionHeading: React.FC<SectionHeadingProps> = ({ id, eyebrow, title, lead, action, as: Tag = 'h2', className = '' }) => (
  <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 ${className}`}>
    <div className="max-w-2xl">
      {eyebrow && <p className="text-[15px] font-semibold text-[var(--accent-text)] mb-2">{eyebrow}</p>}
      <Tag id={id} className="font-heading font-bold text-[length:var(--fs-h2)] leading-[1.1] tracking-[-0.02em] text-[var(--brand)] text-balance">
        {title}
      </Tag>
      {lead && <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)] max-w-xl">{lead}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
