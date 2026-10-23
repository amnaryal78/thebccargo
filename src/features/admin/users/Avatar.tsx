import React, { useState } from 'react';

const initialsOf = (name?: string | null, email?: string | null) => {
  const source = (name || email || '?').trim();
  const parts = source.includes('@') ? [source[0]] : source.split(/\s+/).slice(0, 2).map((p) => p[0]);
  return parts.join('').toUpperCase();
};

/** Profile photo with an initials fallback, so a missing or broken image never leaves a blank circle. */
export const Avatar: React.FC<{ name?: string | null; email?: string | null; src?: string | null; size?: number }> = ({
  name,
  email,
  src,
  size = 44,
}) => {
  const [broken, setBroken] = useState(false);
  const style = { width: size, height: size, fontSize: Math.round(size * 0.36) };
  return src && !broken ? (
    <img
      src={src}
      alt={name || email || 'Profile photo'}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setBroken(true)}
      style={style}
      className="shrink-0 rounded-full object-cover shadow-[var(--shadow-hard-xs)]"
    />
  ) : (
    <span
      aria-hidden="true"
      style={style}
      className="shrink-0 grid place-items-center rounded-full bg-[var(--ox-100)] text-[var(--ox-900)] font-heading font-bold shadow-[var(--shadow-hard-xs)]"
    >
      {initialsOf(name, email)}
    </span>
  );
};
