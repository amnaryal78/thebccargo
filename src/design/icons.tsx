import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * 1. Air Freight Icon — Crisp Cargo Jetliner Silhouette
 */
export const AirFreightIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 20.5 3s-3 .5-4.5 1L12.5 7.5 4.3 5.7c-.8-.2-1.6.3-1.8 1.1-.1.4 0 .9.3 1.2l4.7 4-2.5 2.5-2.2-.4c-.5-.1-1 .1-1.3.5l-.2.2c-.4.4-.3 1.1.2 1.4l3.1 1.8 1.8 3.1c.3.5 1 .6 1.4.2l.2-.2c.4-.3.6-.8.5-1.3l-.4-2.2 2.5-2.5 4 4.7c.3.3.8.4 1.2.3.8-.2 1.3-1 1.1-1.8z" />
  </svg>
);

/**
 * 2. Road Freight Linehaul Truck Icon
 */
export const RoadFreightIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M1 3h15v13H1z" />
    <path d="M16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
    <path d="M4 8h5" />
    <path d="M4 11h7" />
  </svg>
);

/**
 * 3. Sea Ocean Freight Container Vessel Icon
 */
export const SeaFreightIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M2 17l2 4h16l2-4H2z" />
    <path d="M4 10h4v7H4z" />
    <path d="M10 7h4v10h-4z" />
    <path d="M16 10h4v7h-4z" />
    <line x1="12" y1="3" x2="12" y2="7" />
    <line x1="2" y1="21" x2="22" y2="21" />
  </svg>
);

/**
 * 4. Customs Clearance Official Seal / Document Icon
 */
export const CustomsIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

/**
 * 5. Waybill Perforation Tear-Line Motif
 */
export const TearLine: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`w-full h-0 border-t-2 border-dashed border-[var(--line)] my-4 relative ${className}`}
    aria-hidden="true"
  >
    <div className="absolute -left-3 -top-2 w-4 h-4 rounded-full bg-[var(--bg)] border border-[var(--line)]" />
    <div className="absolute -right-3 -top-2 w-4 h-4 rounded-full bg-[var(--bg)] border border-[var(--line)]" />
  </div>
);

/**
 * 6. Scannable Barcode Strip
 */
export const BarcodeStrip: React.FC<{
  code?: string;
  className?: string;
  height?: number;
}> = ({ code, className = '', height = 40 }) => (
  <div className={`flex flex-col items-center select-none ${className}`}>
    <svg
      viewBox="0 0 120 40"
      preserveAspectRatio="none"
      className="w-full text-current"
      style={{ height }}
      aria-hidden="true"
    >
      <rect x="0" y="0" width="3" height="40" fill="currentColor" />
      <rect x="5" y="0" width="1" height="40" fill="currentColor" />
      <rect x="8" y="0" width="4" height="40" fill="currentColor" />
      <rect x="14" y="0" width="2" height="40" fill="currentColor" />
      <rect x="18" y="0" width="1" height="40" fill="currentColor" />
      <rect x="21" y="0" width="5" height="40" fill="currentColor" />
      <rect x="28" y="0" width="2" height="40" fill="currentColor" />
      <rect x="32" y="0" width="3" height="40" fill="currentColor" />
      <rect x="37" y="0" width="1" height="40" fill="currentColor" />
      <rect x="40" y="0" width="4" height="40" fill="currentColor" />
      <rect x="46" y="0" width="2" height="40" fill="currentColor" />
      <rect x="50" y="0" width="6" height="40" fill="currentColor" />
      <rect x="58" y="0" width="1" height="40" fill="currentColor" />
      <rect x="61" y="0" width="3" height="40" fill="currentColor" />
      <rect x="66" y="0" width="2" height="40" fill="currentColor" />
      <rect x="70" y="0" width="5" height="40" fill="currentColor" />
      <rect x="77" y="0" width="1" height="40" fill="currentColor" />
      <rect x="80" y="0" width="4" height="40" fill="currentColor" />
      <rect x="86" y="0" width="3" height="40" fill="currentColor" />
      <rect x="91" y="0" width="1" height="40" fill="currentColor" />
      <rect x="94" y="0" width="5" height="40" fill="currentColor" />
      <rect x="101" y="0" width="2" height="40" fill="currentColor" />
      <rect x="105" y="0" width="4" height="40" fill="currentColor" />
      <rect x="111" y="0" width="2" height="40" fill="currentColor" />
      <rect x="115" y="0" width="3" height="40" fill="currentColor" />
    </svg>
    {code && (
      <span className="font-mono text-[10px] tracking-widest text-[var(--text-muted)] mt-1 uppercase">
        *{code}*
      </span>
    )}
  </div>
);

/**
 * 7. Official Freight Stamp Mark Motif
 */
export const StampMark: React.FC<{
  label: string;
  sublabel?: string;
  variant?: 'gold' | 'oxford' | 'danger';
  className?: string;
}> = ({ label, sublabel = 'BC CARGO INSPECTED', variant = 'gold', className = '' }) => {
  const variantStyles = {
    gold: 'border-gd-500 text-[#8C6400]',
    oxford: 'border-ox-900 text-ox-900',
    danger: 'border-[#C02E24] text-[#C02E24]',
  };

  return (
    <div
      className={`inline-flex flex-col items-center justify-center border-2 border-dashed px-3 py-1 font-mono uppercase tracking-wider text-center rotate-[-3deg] select-none ${variantStyles[variant]} ${className}`}
      aria-label={`${label} - ${sublabel}`}
    >
      <span className="text-[11px] font-bold leading-tight">{label}</span>
      <span className="text-[8px] tracking-widest opacity-85">{sublabel}</span>
    </div>
  );
};

/**
 * 8. Waybill Corner Registration Ticks
 */
export const RegistrationCorners: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`relative ${className}`}>
    {/* Top Left */}
    <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[var(--line-strong)] pointer-events-none" />
    {/* Top Right */}
    <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[var(--line-strong)] pointer-events-none" />
    {/* Bottom Left */}
    <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[var(--line-strong)] pointer-events-none" />
    {/* Bottom Right */}
    <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[var(--line-strong)] pointer-events-none" />
    {children}
  </div>
);

/**
 * 9. Content Flag: Liquid / Hazardous Fluid Icon
 */
export const LiquidIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    <path d="M7 14.5c1.5 1 3.5 1 5 0s3.5-1 5 0" />
  </svg>
);

/**
 * 10. Content Flag: Meat / Food of Animal Origin Icon
 */
export const MeatIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M19 8.5C19 5.5 16 3 12 3S5 5.5 5 8.5c0 4 3 6.5 7 12 4-5.5 7-8 7-12z" />
    <circle cx="12" cy="8.5" r="2.5" />
    <path d="M10 16.5c1.2-1.5 2.8-1.5 4 0" />
  </svg>
);

/**
 * 11. Content Flag: Medicine / Scheduled Pharmaceuticals Icon
 */
export const MedicineIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
    <path d="m8.5 8.5 7 7" />
    <path d="M4 4h4v4" />
  </svg>
);

