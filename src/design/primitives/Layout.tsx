import React from 'react';

type Width = 'page' | 'narrow';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: Width;
}

/** Centres content at the page or reading width with the shared side gutter. */
export const Container: React.FC<ContainerProps> = ({ width = 'page', className = '', ...props }) => (
  <div className={`${width === 'narrow' ? 'container-narrow' : 'container-page'} ${className}`} {...props} />
);

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** canvas = ivory page, raised = white band, brand = Oxford band (light text) */
  tone?: 'canvas' | 'raised' | 'brand';
  width?: Width;
}

const SECTION_TONE = {
  canvas: '',
  raised: 'bg-[var(--surface)] border-y border-[var(--line)]',
  brand: 'bg-[var(--surface-oxford)] text-white',
};

/** One vertical rhythm for every page section. */
export const Section: React.FC<SectionProps> = ({ tone = 'canvas', width = 'page', className = '', children, ...props }) => (
  <section className={`section-y ${SECTION_TONE[tone]} ${className}`} {...props}>
    <Container width={width}>{children}</Container>
  </section>
);

export interface PageHeaderProps {
  title: React.ReactNode;
  /** Short line above the title naming where the reader is, e.g. "Shipping to Japan" */
  kicker?: React.ReactNode;
  lead?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/** The top of an inner page: the page's h1, one sentence of context, optional actions. */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, kicker, lead, actions, className = '' }) => (
  <header className={`container-page pt-8 sm:pt-12 pb-8 sm:pb-10 ${className}`}>
    {kicker && <p className="text-[15px] font-semibold text-[var(--accent-text)] mb-2">{kicker}</p>}
    <h1 className="font-heading font-bold text-[length:var(--fs-h1)] leading-[var(--lh-tight)] tracking-[var(--tracking-display)] text-[var(--brand)] text-balance max-w-4xl">
      {title}
    </h1>
    {lead && <p className="mt-4 text-[length:var(--fs-lead)] leading-relaxed text-[var(--text-muted)] measure">{lead}</p>}
    {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
  </header>
);
