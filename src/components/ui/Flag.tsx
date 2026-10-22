import React, { useState } from 'react';

/**
 * Country flag served from our own /public/flags (SVG), so it never depends on a third-party
 * image host. If a file is missing the flag turns into a small code badge instead of a broken icon.
 */
export const Flag: React.FC<{ code: string; width?: number; className?: string }> = ({ code, width = 28, className = '' }) => {
  const [failed, setFailed] = useState(false);
  const height = Math.round((width * 2) / 3);
  if (failed) {
    return (
      <span
        aria-hidden="true"
        style={{ width, height }}
        className={`inline-grid place-items-center rounded-[3px] bg-[var(--ox-100)] text-[var(--oxford-deep)] text-[10px] font-bold uppercase border border-[var(--line)] ${className}`}
      >
        {code}
      </span>
    );
  }
  return (
    <img
      src={`/flags/${code.toLowerCase()}.svg`}
      alt=""
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`rounded-[3px] border border-[var(--line)] object-cover bg-[var(--surface-muted)] ${className}`}
    />
  );
};
