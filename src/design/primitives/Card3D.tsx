import React, { useRef, useState, useEffect } from 'react';
import { Spotlight, SpotlightIntensity } from '../../components/ui/spotlight';

export interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
  maxTilt?: number; // Maximum tilt angle in degrees (default 3.5deg, strictly bounded)
  disabled?: boolean;
  /** Whether to enable spotlight illumination. Defaults to true */
  enableSpotlight?: boolean;
  /** Spotlight intensity preset */
  spotlightIntensity?: SpotlightIntensity;
}

export const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  maxTilt = 3.5,
  disabled = false,
  enableSpotlight = true,
  spotlightIntensity = 'strong',
  style,
  onMouseMove,
  onMouseLeave,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [canTilt, setCanTilt] = useState(false);
  const [transformStyle, setTransformStyle] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkCapability = () => {
      const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setCanTilt(finePointer && !reducedMotion && !disabled);
    };

    checkCapability();
    const m1 = window.matchMedia('(hover: hover) and (pointer: fine)');
    const m2 = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handler = () => checkCapability();
    m1.addEventListener('change', handler);
    m2.addEventListener('change', handler);

    return () => {
      m1.removeEventListener('change', handler);
      m2.removeEventListener('change', handler);
    };
  }, [disabled]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (canTilt && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const normY = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

      const rotateY = Number((normX * maxTilt * 2).toFixed(2));
      const rotateX = Number((-normY * maxTilt * 2).toFixed(2));

      setIsHovered(true);
      setTransformStyle(
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`
      );
    }
    if (onMouseMove) onMouseMove(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (canTilt) {
      setIsHovered(false);
      setTransformStyle(
        'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
      );
    }
    if (onMouseLeave) onMouseLeave(e);
  };

  const mergedStyles: React.CSSProperties = {
    transform: transformStyle || undefined,
    transition: isHovered
      ? 'transform 90ms ease-out'
      : 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 380ms cubic-bezier(0.16, 1, 0.3, 1)',
    willChange: isHovered ? 'transform' : 'auto',
    ...style,
  };

  if (enableSpotlight) {
    return (
      <Spotlight
        ref={cardRef}
        intensity={spotlightIntensity}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={mergedStyles}
        className={`will-change-transform ${className}`}
        {...props}
      >
        {children}
      </Spotlight>
    );
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={mergedStyles}
      className={`will-change-transform ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

