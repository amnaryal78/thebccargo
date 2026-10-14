import React, { useRef, useState } from 'react';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  maxDistance?: number;
  className?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  maxDistance = 4,
  className = '',
  onMouseMove,
  onMouseLeave,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Only execute on desktop fine pointer
    if (window.matchMedia('(hover: none) or (pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);

      setTransform({
        x: Math.max(-maxDistance, Math.min(maxDistance, deltaX * maxDistance)),
        y: Math.max(-maxDistance, Math.min(maxDistance, deltaY * maxDistance)),
      });
      setIsHovered(true);
    }

    if (onMouseMove) onMouseMove(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    setTransform({ x: 0, y: 0 });
    setIsHovered(false);
    if (onMouseLeave) onMouseLeave(e);
  };

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: isHovered
          ? 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms ease, background-color 200ms ease'
          : 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms ease, background-color 200ms ease',
      }}
      className={`interactive-btn will-change-transform ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
