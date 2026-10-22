import React, { useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import { COUNTRY_GUIDES, type CountryGuide, type Lang } from '../../data/countryGuides';

/** Hetauda, where every parcel starts. */
const ORIGIN = { lat: 27.43, lon: 85.03 };

/**
 * A plain map abstraction: graticule, every destination we have a guide for as a faint dot,
 * and one arc from Hetauda to this guide's hub. Positions are real (equirectangular), so
 * Korea and Canada look as near or far as they are. No map tiles, no extra requests.
 */
export const RouteMap: React.FC<{ guide: CountryGuide; lang: Lang }> = ({ guide, lang }) => {
  const reduce = useReducedMotion();

  const geo = useMemo(() => {
    const d = guide.hub;
    // frame both points, padded, at a 16:10 shape
    let minX = Math.min(ORIGIN.lon, d.lon) - 14;
    let maxX = Math.max(ORIGIN.lon, d.lon) + 14;
    let minY = -Math.max(ORIGIN.lat, d.lat) - 12;
    let maxY = -Math.min(ORIGIN.lat, d.lat) + 12;
    const w = maxX - minX;
    const h = maxY - minY;
    if (w / h < 1.6) {
      const add = (h * 1.6 - w) / 2;
      minX -= add;
      maxX += add;
    } else {
      const add = (w / 1.6 - h) / 2;
      minY -= add;
      maxY += add;
    }
    const W = maxX - minX;
    const H = maxY - minY;
    const o = { x: ORIGIN.lon, y: -ORIGIN.lat };
    const t = { x: d.lon, y: -d.lat };
    // arc bows toward the pole side, like a flight path does on a flat map
    const mx = (o.x + t.x) / 2;
    const my = (o.y + t.y) / 2;
    const len = Math.hypot(t.x - o.x, t.y - o.y);
    const c = { x: mx, y: my - len * 0.28 };
    const path = `M ${o.x} ${o.y} Q ${c.x} ${c.y} ${t.x} ${t.y}`;
    const lines = [];
    for (let lon = Math.ceil(minX / 15) * 15; lon <= maxX; lon += 15) lines.push({ x1: lon, y1: minY, x2: lon, y2: maxY });
    for (let lat = Math.ceil(minY / 15) * 15; lat <= maxY; lat += 15) lines.push({ x1: minX, y1: lat, x2: maxX, y2: lat });
    return { minX, minY, W, H, o, t, path, lines, unit: W / 100 };
  }, [guide]);

  const { minX, minY, W, H, o, t, path, lines, unit } = geo;
  const others = COUNTRY_GUIDES.filter((g) => g.slug !== guide.slug);

  return (
    <svg
      viewBox={`${minX} ${minY} ${W} ${H}`}
      className="cg-map w-full h-auto"
      role="img"
      aria-label={lang === 'en' ? `Route from Hetauda, Nepal to ${guide.hub.city.en}, ${guide.name.en}` : `हेटौंडा, नेपालदेखि ${guide.hub.city.ne}, ${guide.name.ne} सम्मको रुट`}
    >
      {lines.map((l, i) => (
        <line key={i} {...l} stroke="currentColor" strokeOpacity="0.08" strokeWidth={unit * 0.15} />
      ))}
      {others.map((g) => (
        <circle key={g.slug} cx={g.hub.lon} cy={-g.hub.lat} r={unit * 0.55} fill="currentColor" fillOpacity="0.16" />
      ))}
      <path d={path} fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth={unit * 0.9} strokeLinecap="round" />
      <path
        d={path}
        fill="none"
        stroke="var(--gold)"
        strokeWidth={unit * 0.55}
        strokeLinecap="round"
        pathLength={1}
        className={reduce ? '' : 'cg-route-draw'}
      />
      {!reduce && (
        <circle r={unit * 1.1} fill="var(--gold)">
          <animateMotion dur="3.2s" repeatCount="indefinite" path={path} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.2 1" />
        </circle>
      )}
      <circle cx={o.x} cy={o.y} r={unit * 1.4} fill="var(--surface)" stroke="currentColor" strokeWidth={unit * 0.5} />
      <circle cx={t.x} cy={t.y} r={unit * 2.6} fill="var(--gold)" fillOpacity="0.22" className={reduce ? '' : 'cg-pulse'} />
      <circle cx={t.x} cy={t.y} r={unit * 1.4} fill="var(--gold)" stroke="currentColor" strokeWidth={unit * 0.4} />
      <text x={o.x} y={o.y + unit * 5} textAnchor="middle" fontSize={unit * 3.4} fontWeight="700" fill="currentColor">
        {lang === 'en' ? 'Hetauda' : 'हेटौंडा'}
      </text>
      <text x={t.x} y={t.y - unit * 3.4} textAnchor="middle" fontSize={unit * 3.4} fontWeight="700" fill="currentColor">
        {guide.hub.city[lang]}
      </text>
    </svg>
  );
};
