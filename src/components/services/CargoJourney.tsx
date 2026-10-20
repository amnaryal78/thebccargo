import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * A 7-stage parcel journey: pickup, local transit, sorting hub, air freight,
 * customs, final delivery, delivered. Positions and sizes follow the supplied
 * animation exactly; only colours and the logo are the brand's.
 * With reduced motion the stages stop cycling; the progress bars still pick a stage.
 */

const LOGO = '/brand/bc-logo-320.webp';
const STAGE_MS = 1400;

const STAGES: { title: string; note: string }[] = [
  { title: '1. Package pickup', note: 'Loaded onto courier dispatch' },
  { title: '2. Local transit', note: 'On the way to the sorting facility' },
  { title: '3. Origin sorting hub', note: 'Scanned, verified and barcoded' },
  { title: '4. Air cargo freight', note: 'Direct flight to the destination' },
  { title: "5. Customs and int'l hub", note: 'Cleared customs and inspection' },
  { title: '6. Out for final delivery', note: 'Driver nearing the address' },
  { title: '7. Package handed over', note: 'Received by the customer' },
];

/** The parcel with the BC logo on its label. Sizes are the original ones. */
const PARCELS = {
  /* stage 1: loaded beside the van */ pickup: { box: 'w-7 h-6', badge: 'w-4 h-3 p-0.5' },
  /* stages 3, 5, 7 */ std: { box: 'w-8 h-7', badge: 'w-5 h-3.5 p-0.5' },
  /* stage 6: waiting on the porch */ porch: { box: 'w-4 h-3.5', badge: 'w-2.5 h-2 p-[1px]' },
} as const;

const Parcel: React.FC<{ kind: keyof typeof PARCELS; className?: string; scan?: boolean }> = ({ kind, className = '', scan }) => (
  <div className={`relative ${PARCELS[kind].box} bg-amber-500 rounded border border-amber-600 flex items-center justify-center overflow-hidden ${className}`}>
    <span className="absolute inset-x-0 h-0.5 bg-amber-600" />
    <span className="absolute inset-y-0 w-0.5 bg-amber-600" />
    <span className={`relative z-10 bg-white rounded-[2px] flex items-center justify-center ${PARCELS[kind].badge}`}>
      <img src={LOGO} alt="" className="w-full h-full object-contain" />
    </span>
    {scan && <span className="cj-scan absolute inset-x-0 top-0 h-0.5 bg-red-500" />}
  </div>
);

/** The courier van. `driving` adds the logo panel, side stripe and spinning wheels; the others are parked. */
const Van: React.FC<{ className?: string; driving?: boolean; badge?: { x: number; y: number; w: number; h: number } }> = ({
  className = '',
  driving,
  badge = { x: 18, y: 14, w: 22, h: 15 },
}) => (
  <svg className={className} viewBox="0 0 100 56" fill="none" aria-hidden="true">
    <path d="M4 12C4 8 7 6 11 6H64C66 6 68 8 68 11V38H4V12Z" fill="#123562" />
    <path d="M68 18H82C84 18 86 19 88 22L94 30C95 32 96 34 96 36V38H68V18Z" fill="#002147" />
    <path d="M72 21H82L88 29H72V21Z" fill="#D6E1EF" />
    {!driving && (
      <>
        <path d="M24 8V36M46 8V36" stroke="#082A52" strokeWidth="1.5" strokeDasharray="2 2" />
      </>
    )}
    <g transform={`translate(${badge.x} ${badge.y})`}>
      <rect width={badge.w} height={badge.h} rx="2" fill="#fff" />
      <image href={LOGO} x="1" y="1" width={badge.w - 2} height={badge.h - 2} preserveAspectRatio="xMidYMid meet" />
    </g>
    {driving && <path d="M41 24H62" stroke="#F2B705" strokeWidth="2.5" strokeLinecap="round" />}
    <rect x="93" y="32" width="3" height="4" rx="1" fill="#F2B705" />
    {[24, 78].map((cx) => (
      <g key={cx} className={driving ? 'cj-wheel' : ''} style={{ transformOrigin: `${cx}px 40px` }}>
        <circle cx={cx} cy="40" r={driving ? 7.5 : 7} fill="#0F172A" />
        <circle cx={cx} cy="40" r={driving ? 3.5 : 3} fill={driving ? '#CBD5E1' : '#94A3B8'} />
        {driving && <path d={`M${cx} 37V43M${cx - 3} 40H${cx + 3}`} stroke="#0F172A" strokeWidth="1" />}
      </g>
    ))}
  </svg>
);

const Building: React.FC<{ door?: 'single' | 'dual' }> = ({ door = 'single' }) => (
  <svg className="w-32 h-24" viewBox="0 0 120 90" fill="none" aria-hidden="true">
    <rect x="8" y="74" width="104" height="3" rx="1.5" fill={door === 'single' ? '#E2E8F0' : '#CBD5E1'} />
    <polygon
      points={door === 'single' ? '16,38 60,16 104,38 104,74 16,74' : '16,36 60,18 104,36 104,74 16,74'}
      fill="#F8FAFC"
      stroke={door === 'single' ? '#94A3B8' : '#64748B'}
      strokeWidth="2"
    />
    <polygon points={door === 'single' ? '60,16 104,38 16,38' : '60,18 104,36 16,36'} fill="#E2E8F0" />
    <g transform={door === 'single' ? 'translate(45 20)' : 'translate(44 22)'}>
      <rect width={door === 'single' ? 30 : 32} height="12" rx="2" fill="#fff" stroke="#CBD5E1" strokeWidth="0.75" />
      <image href={LOGO} x="1" y="1" width={door === 'single' ? 28 : 30} height="10" preserveAspectRatio="xMidYMid meet" />
    </g>
    {door === 'single' ? (
      <>
        <rect x="41" y="42" width="38" height="32" rx="3" fill="#0F172A" />
        <path d="M41 50H79M41 58H79M41 66H79" stroke="#334155" strokeWidth="1.5" />
        <path d="M60 16V8" stroke="#2F5A8F" strokeWidth="2" strokeLinecap="round" />
        <circle cx="60" cy="7" r="2.5" fill="#DC2626" />
      </>
    ) : (
      <>
        <rect x="28" y="46" width="26" height="28" rx="2" fill="#334155" />
        <rect x="66" y="46" width="26" height="28" rx="2" fill="#1E293B" />
        <circle cx="60" cy="28" r="5" fill="#123562" />
        <circle cx="60" cy="28" r="2.5" fill="#AEC3DE" />
      </>
    )}
  </svg>
);

const Cloud: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
  </svg>
);

const Scene: React.FC<{ index: number }> = ({ index }) => {
  switch (index) {
    case 0: /* pickup: courier, parcel, parked van */
      return (
        <div className="relative w-44 h-24 flex items-center justify-center">
          <span className="absolute bottom-2 left-0 right-0 h-1 bg-slate-200 rounded-full" />
          <div className="absolute left-3 bottom-2 flex flex-col items-center">
            <svg className="w-8 h-14" viewBox="0 0 32 56" fill="none" aria-hidden="true">
              <circle cx="16" cy="8" r="5" fill="#2F5A8F" />
              <path d="M11 16C11 14 13 13 16 13C19 13 21 14 21 16V30C21 31 20 32 18 32H14C12 32 11 31 11 30V16Z" fill="#002147" />
              <path d="M12 32V48H15V33M17 32V48H20V33" stroke="#1E293B" strokeLinecap="round" strokeWidth="2.5" />
              <path d="M14 20L22 25" stroke="#2F5A8F" strokeLinecap="round" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="absolute left-11 bottom-6 flex items-center justify-center">
            <Parcel kind="pickup" />
          </div>
          <div className="absolute right-1 bottom-2">
            <Van className="w-24 h-14" />
          </div>
        </div>
      );
    case 1: /* local transit: van centred on a moving road */
      return (
        <div className="relative w-44 h-24 flex items-center justify-center overflow-hidden">
          <span className="absolute bottom-2 left-0 right-0 h-3 bg-slate-200 rounded-sm overflow-hidden flex items-center">
            <span className="cj-road flex gap-3 w-[240px]">
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} className="w-4 h-0.5 bg-slate-400/70 rounded shrink-0" />
              ))}
            </span>
          </span>
          <div className="cj-bounce relative bottom-0 flex items-center">
            <span className="absolute -left-5 top-5 flex flex-col gap-1 opacity-70">
              <span className="w-4 h-0.5 bg-[#7F9DC4] rounded-full" />
              <span className="w-6 h-0.5 bg-[#2F5A8F] rounded-full" />
              <span className="w-3 h-0.5 bg-[#7F9DC4] rounded-full" />
            </span>
            <Van className="w-28 h-16" driving badge={{ x: 10, y: 10, w: 28, h: 18 }} />
          </div>
        </div>
      );
    case 2: /* origin hub: parcel under the scanner */
      return (
        <div className="relative w-44 h-24 flex items-center justify-center">
          <Building />
          <div className="absolute bottom-5 flex flex-col items-center">
            <div className="relative">
              <Parcel kind="std" scan />
            </div>
          </div>
        </div>
      );
    case 3: /* air freight */
      return (
        <div className="relative w-44 h-24 flex items-center justify-center overflow-hidden">
          <Cloud className="cj-cloud-1 absolute top-2 right-4 w-10 h-5 text-[#D6E1EF]" />
          <Cloud className="cj-cloud-2 absolute bottom-3 left-3 w-8 h-4 text-[#D6E1EF]" />
          <div className="cj-plane relative flex items-center">
            <span className="absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col gap-1">
              <span className="w-8 h-0.5 bg-[#AEC3DE] rounded-full" />
              <span className="w-5 h-0.5 bg-[#D6E1EF] rounded-full" />
            </span>
            <svg className="w-[6.5rem] h-16" viewBox="0 0 84 50" fill="none" aria-hidden="true">
              <path d="M10 25C10 22 14 20 25 20H60C68 20 74 23 76 25C74 27 68 30 60 30H25C14 30 10 28 10 25Z" fill="#123562" />
              <path d="M68 22H71C72.5 22 74 23.5 74 25H68V22Z" fill="#AEC3DE" />
              <path d="M38 20L26 6H36L52 20H38Z" fill="#002147" />
              <path d="M38 30L26 44H36L52 30H38Z" fill="#082A52" />
              <path d="M14 20L8 8H16L22 20H14Z" fill="#002147" />
              <g transform="translate(24 21)">
                <rect width="14" height="8" rx="1.5" fill="#fff" />
                <image href={LOGO} x="1" y="0.5" width="12" height="7" preserveAspectRatio="xMidYMid meet" />
              </g>
              <rect x="35" y="32" width="10" height="4" rx="2" fill="#0F172A" />
            </svg>
          </div>
        </div>
      );
    case 4: /* customs: cleared parcel and a green check */
      return (
        <div className="relative w-44 h-24 flex items-center justify-center">
          <Building door="dual" />
          <div className="cj-arrive absolute bottom-5 left-10">
            <Parcel kind="std" />
          </div>
          <span className="absolute top-6 right-8 bg-emerald-600 text-white rounded-full p-1 flex items-center justify-center">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        </div>
      );
    case 5: /* final delivery: van at the house, parcel on the porch */
      return (
        <div className="relative w-44 h-24 flex items-center justify-center">
          <span className="absolute bottom-2 left-0 right-0 h-1 bg-slate-200 rounded-full" />
          <div className="absolute right-2 bottom-2">
            <svg className="w-20 h-20" viewBox="0 0 80 80" fill="none" aria-hidden="true">
              <polygon points="40,14 14,36 66,36" fill="#123562" />
              <polygon points="40,14 14,36 20,36 40,20" fill="#082A52" />
              <rect x="50" y="18" width="5" height="10" fill="#002147" />
              <rect x="19" y="36" width="42" height="34" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
              <rect x="35" y="48" width="10" height="22" rx="1" fill="#334155" />
              <circle cx="37" cy="59" r="1" fill="#F2B705" />
              <rect x="24" y="42" width="7" height="7" rx="1" fill="#D6E1EF" stroke="#94A3B8" />
              <rect x="49" y="42" width="7" height="7" rx="1" fill="#D6E1EF" stroke="#94A3B8" />
            </svg>
            <Parcel kind="porch" className="absolute bottom-2 left-1 z-10" />
          </div>
          <div className="absolute left-1 bottom-2">
            <Van className="w-20 h-12" badge={{ x: 18, y: 14, w: 24, h: 15 }} />
          </div>
        </div>
      );
    default: /* delivered */
      return (
        <div className="relative w-44 h-24 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center mb-1">
            <span className="cj-check w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <Parcel kind="std" className="absolute -right-3 -bottom-1" />
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 mt-1 text-[9px] font-extrabold tracking-wide uppercase text-emerald-800 leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Delivered and signed
          </span>
        </div>
      );
  }
};

export const CargoJourney: React.FC<{ className?: string }> = ({ className = '' }) => {
  const reduce = !!useReducedMotion();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setStage((s) => (s + 1) % STAGES.length);
    }, STAGE_MS);
    return () => window.clearInterval(id);
  }, [reduce]);

  const done = stage === STAGES.length - 1;

  return (
    <div className={`flex justify-center ${className}`}>
      <div
        className="relative w-[250px] h-[250px] sm:w-[312px] sm:h-[312px]"
        role="img"
        aria-label={`Parcel journey, step ${stage + 1} of ${STAGES.length}: ${STAGES[stage].title.replace(/^\d+\.\s*/, '')}`}
      >
        <div className="absolute top-0 left-0 w-[250px] h-[250px] origin-top-left sm:scale-[1.248] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col select-none">
          {/* header */}
          <div className="px-3.5 pt-2.5 pb-1 flex items-center justify-between border-b border-slate-100 bg-white">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-6 h-5 rounded bg-white border border-slate-200/70 overflow-hidden flex items-center justify-center p-0.5 shrink-0">
                <img src={LOGO} alt="" className="w-full h-full object-contain" />
              </span>
              <span className="uppercase tracking-wider text-[10px] font-extrabold text-[#002147] truncate">The BC Cargo</span>
            </div>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200/70 px-1.5 py-0.5 rounded leading-none">
              {stage + 1}/{STAGES.length}
            </span>
          </div>

          {/* stage viewport */}
          <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center">
            {STAGES.map((s, i) => (
              <div
                key={s.title}
                aria-hidden={i !== stage}
                className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ease-in-out ${i === stage ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              >
                {i === stage && <Scene index={i} />}
                <span className="text-xs font-bold text-slate-800 mt-1">{s.title}</span>
                <span className="text-[10px] text-slate-600 font-medium">{s.note}</span>
              </div>
            ))}
          </div>

          {/* progress: one segment per stage, also usable to jump */}
          <div className="px-3.5 pb-2.5 pt-1 border-t border-slate-100 bg-white flex items-center justify-between gap-1">
            {STAGES.map((s, i) => (
              <button
                key={s.title}
                type="button"
                onClick={() => setStage(i)}
                aria-label={`Show ${s.title.replace(/^\d+\.\s*/, '')}`}
                aria-current={i === stage ? 'step' : undefined}
                className="group flex-1 h-4 flex items-center cursor-pointer focus-visible:outline-none"
              >
                <span
                  className={`block w-full h-1 rounded-full transition-colors duration-300 group-focus-visible:ring-2 group-focus-visible:ring-[#F2B705] ${
                    i <= stage ? (done ? 'bg-emerald-600' : 'bg-[#002147]') : 'bg-slate-200'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
