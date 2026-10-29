import React from 'react';
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
  const inner = (
    <>
      <span className="cta3d-face">
        {icon && <span className="cta3d-icon">{icon}</span>}
        <span>{children}</span>
      </span>
    </>
  );
  const common = {
    className: `cta3d cta3d-${tone} ${className}`,
    'aria-label': ariaLabel,
  };

  if (to) {
    return (
      <Link to={to} onClick={onClick} {...common}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a
       
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
    <button type="button" onClick={onClick} {...common}>
      {inner}
    </button>
  );
};
