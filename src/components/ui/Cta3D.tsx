import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import './cta3d.css';

/**
 * The site's call-to-action: a clay key that sits on a visible edge, leans toward the pointer,
 * lifts on hover and sinks onto its edge when pressed. Pointer tilt writes CSS variables
 * directly (no React state), so moving the mouse never re-renders. Static under reduced motion.
 */

type Tone = 'gold' | 'light';

interface Cta3DProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  tone?: Tone;
  /** Internal route (uses the router) */
  to?: string;
  /** External link, tel: or mailto: */
  href?: string;
  newTab?: boolean;
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
}

export const Cta3D: React.FC<Cta3DProps> = ({
  children,
  icon,
  tone = 'gold',
  to,
  href,
  newTab,
  onClick,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const ref = useRef<HTMLElement | null>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--cta-x', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    el.style.setProperty('--cta-y', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };
  const onLeave = () => {
    ref.current?.style.setProperty('--cta-x', '0');
    ref.current?.style.setProperty('--cta-y', '0');
  };

  const inner = (
    <>
      <span className="cta3d-edge" aria-hidden="true" />
      <span className="cta3d-face">
        {icon && <span className="cta3d-icon">{icon}</span>}
        <span>{children}</span>
        <span className="cta3d-shine" aria-hidden="true" />
      </span>
    </>
  );
  const common = {
    className: `cta3d cta3d-${tone} ${className}`,
    onPointerMove: onMove,
    onPointerLeave: onLeave,
    'aria-label': ariaLabel,
  };

  if (to) {
    return (
      <Link ref={(n) => { ref.current = n; }} to={to} onClick={onClick} {...common}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a
        ref={(n) => { ref.current = n; }}
        href={href}
        onClick={onClick}
        target={newTab ? '_blank' : undefined}
        rel={newTab ? 'noopener noreferrer' : undefined}
        {...common}
      >
        {inner}
      </a>
    );
  }
  return (
    <button ref={(n) => { ref.current = n; }} type="button" onClick={onClick} {...common}>
      {inner}
    </button>
  );
};
