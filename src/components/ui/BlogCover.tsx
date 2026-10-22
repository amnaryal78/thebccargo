import React, { useState } from 'react';
import { Package } from 'lucide-react';

/**
 * Blog cover with a built-in fallback. Posts often point at images on other sites; when one
 * cannot load (blocked, expired, offline) this shows a clean branded cover instead of a broken
 * image with alt text spilling over the card.
 */
export const BlogCover: React.FC<{ src?: string | null; alt: string; label?: string; className?: string }> = ({
  src,
  alt,
  label,
  className = '',
}) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`bc-cover relative overflow-hidden grid place-items-center bg-[var(--ox-900)] ${className}`}
        style={{
          backgroundImage:
            'radial-gradient(420px 200px at 85% 0%, rgba(242,183,5,0.28), transparent 70%), radial-gradient(360px 220px at 0% 100%, rgba(79,118,168,0.45), transparent 70%)',
        }}
      >
        <span className="grid place-items-center w-16 h-16 rounded-2xl bg-[var(--gd-500)] text-[var(--ox-900)] shadow-[0_10px_24px_-8px_rgba(0,0,0,0.5),inset_0_2px_0_rgba(255,255,255,0.5)]">
          <Package className="w-8 h-8" aria-hidden="true" />
        </span>
        {label && (
          <span className="absolute bottom-3 left-4 right-4 truncate font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">{label}</span>
        )}
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} className={className} />;
};
