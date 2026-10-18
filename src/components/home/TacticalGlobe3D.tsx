import React, { useEffect, useRef, useState, useMemo, useId, startTransition } from 'react';
import { RouteLocation, HUBS, DESTINATIONS } from './route-data';
import { COUNTRY_BY_ISO3, flagUrl } from '../../data/countries';
import { destinationForCountry, SHOWN_ISO2 } from './country-destination';

/* ========================================================================== */
/* Country Data — ISO numeric → [ISO3, name]                                   */
/* ========================================================================== */
const CD: Record<string, [string, string]> = {
  "004": ["AFG", "Afghanistan"],
  "008": ["ALB", "Albania"],
  "012": ["DZA", "Algeria"],
  "024": ["AGO", "Angola"],
  "032": ["ARG", "Argentina"],
  "036": ["AUS", "Australia"],
  "040": ["AUT", "Austria"],
  "031": ["AZE", "Azerbaijan"],
  "050": ["BGD", "Bangladesh"],
  "056": ["BEL", "Belgium"],
  "204": ["BEN", "Benin"],
  "064": ["BTN", "Bhutan"],
  "068": ["BOL", "Bolivia"],
  "070": ["BIH", "Bosnia and Herz."],
  "072": ["BWA", "Botswana"],
  "076": ["BRA", "Brazil"],
  "096": ["BRN", "Brunei"],
  "100": ["BGR", "Bulgaria"],
  "854": ["BFA", "Burkina Faso"],
  "108": ["BDI", "Burundi"],
  "116": ["KHM", "Cambodia"],
  "120": ["CMR", "Cameroon"],
  "124": ["CAN", "Canada"],
  "140": ["CAF", "Central African Rep."],
  "148": ["TCD", "Chad"],
  "152": ["CHL", "Chile"],
  "156": ["CHN", "China"],
  "170": ["COL", "Colombia"],
  "178": ["COG", "Congo"],
  "180": ["COD", "Dem. Rep. Congo"],
  "188": ["CRI", "Costa Rica"],
  "384": ["CIV", "Côte d'Ivoire"],
  "191": ["HRV", "Croatia"],
  "192": ["CUB", "Cuba"],
  "196": ["CYP", "Cyprus"],
  "203": ["CZE", "Czechia"],
  "208": ["DNK", "Denmark"],
  "262": ["DJI", "Djibouti"],
  "214": ["DOM", "Dominican Rep."],
  "218": ["ECU", "Ecuador"],
  "818": ["EGY", "Egypt"],
  "222": ["SLV", "El Salvador"],
  "226": ["GNQ", "Eq. Guinea"],
  "232": ["ERI", "Eritrea"],
  "233": ["EST", "Estonia"],
  "748": ["SWZ", "Eswatini"],
  "231": ["ETH", "Ethiopia"],
  "242": ["FJI", "Fiji"],
  "246": ["FIN", "Finland"],
  "250": ["FRA", "France"],
  "266": ["GAB", "Gabon"],
  "270": ["GMB", "Gambia"],
  "268": ["GEO", "Georgia"],
  "276": ["DEU", "Germany"],
  "288": ["GHA", "Ghana"],
  "300": ["GRC", "Greece"],
  "304": ["GRL", "Greenland"],
  "320": ["GTM", "Guatemala"],
  "324": ["GIN", "Guinea"],
  "624": ["GNB", "Guinea-Bissau"],
  "328": ["GUY", "Guyana"],
  "332": ["HTI", "Haiti"],
  "340": ["HND", "Honduras"],
  "348": ["HUN", "Hungary"],
  "352": ["ISL", "Iceland"],
  "356": ["IND", "India"],
  "360": ["IDN", "Indonesia"],
  "364": ["IRN", "Iran"],
  "368": ["IRQ", "Iraq"],
  "372": ["IRL", "Ireland"],
  "376": ["ISR", "Israel"],
  "380": ["ITA", "Italy"],
  "388": ["JAM", "Jamaica"],
  "392": ["JPN", "Japan"],
  "400": ["JOR", "Jordan"],
  "398": ["KAZ", "Kazakhstan"],
  "404": ["KEN", "Kenya"],
  "408": ["PRK", "North Korea"],
  "410": ["KOR", "South Korea"],
  "414": ["KWT", "Kuwait"],
  "417": ["KGZ", "Kyrgyzstan"],
  "418": ["LAO", "Laos"],
  "428": ["LVA", "Latvia"],
  "422": ["LBN", "Lebanon"],
  "426": ["LSO", "Lesotho"],
  "430": ["LBR", "Liberia"],
  "434": ["LBY", "Libya"],
  "440": ["LTU", "Lithuania"],
  "442": ["LUX", "Luxembourg"],
  "450": ["MDG", "Madagascar"],
  "454": ["MWI", "Malawi"],
  "458": ["MYS", "Malaysia"],
  "466": ["MLI", "Mali"],
  "478": ["MRT", "Mauritania"],
  "484": ["MEX", "Mexico"],
  "498": ["MDA", "Moldova"],
  "496": ["MNG", "Mongolia"],
  "499": ["MNE", "Montenegro"],
  "504": ["MAR", "Morocco"],
  "508": ["MOZ", "Mozambique"],
  "104": ["MMR", "Myanmar"],
  "516": ["NAM", "Namibia"],
  "524": ["NPL", "Nepal"],
  "528": ["NLD", "Netherlands"],
  "554": ["NZL", "New Zealand"],
  "558": ["NIC", "Nicaragua"],
  "562": ["NER", "Niger"],
  "566": ["NGA", "Nigeria"],
  "578": ["NOR", "Norway"],
  "512": ["OMN", "Oman"],
  "586": ["PAK", "Pakistan"],
  "591": ["PAN", "Panama"],
  "598": ["PNG", "Papua New Guinea"],
  "600": ["PRY", "Paraguay"],
  "604": ["PER", "Peru"],
  "608": ["PHL", "Philippines"],
  "616": ["POL", "Poland"],
  "620": ["PRT", "Portugal"],
  "634": ["QAT", "Qatar"],
  "642": ["ROU", "Romania"],
  "643": ["RUS", "Russia"],
  "646": ["RWA", "Rwanda"],
  "682": ["SAU", "Saudi Arabia"],
  "686": ["SEN", "Senegal"],
  "688": ["SRB", "Serbia"],
  "694": ["SLE", "Sierra Leone"],
  "702": ["SGP", "Singapore"],
  "703": ["SVK", "Slovakia"],
  "705": ["SVN", "Slovenia"],
  "706": ["SOM", "Somalia"],
  "710": ["ZAF", "South Africa"],
  "728": ["SSD", "South Sudan"],
  "724": ["ESP", "Spain"],
  "144": ["LKA", "Sri Lanka"],
  "729": ["SDN", "Sudan"],
  "740": ["SUR", "Suriname"],
  "752": ["SWE", "Sweden"],
  "756": ["CHE", "Switzerland"],
  "760": ["SYR", "Syria"],
  "158": ["TWN", "Taiwan"],
  "762": ["TJK", "Tajikistan"],
  "834": ["TZA", "Tanzania"],
  "764": ["THA", "Thailand"],
  "626": ["TLS", "Timor-Leste"],
  "768": ["TGO", "Togo"],
  "780": ["TTO", "Trinidad and Tobago"],
  "788": ["TUN", "Tunisia"],
  "792": ["TUR", "Turkey"],
  "795": ["TKM", "Turkmenistan"],
  "800": ["UGA", "Uganda"],
  "804": ["UKR", "Ukraine"],
  "784": ["ARE", "UAE"],
  "826": ["GBR", "United Kingdom"],
  "840": ["USA", "United States"],
  "858": ["URY", "Uruguay"],
  "860": ["UZB", "Uzbekistan"],
  "862": ["VEN", "Venezuela"],
  "704": ["VNM", "Vietnam"],
  "887": ["YEM", "Yemen"],
  "894": ["ZMB", "Zambia"],
  "716": ["ZWE", "Zimbabwe"],
  "275": ["PSE", "Palestine"],
  "807": ["MKD", "North Macedonia"],
  "051": ["ARM", "Armenia"],
  "112": ["BLR", "Belarus"],
  "174": ["COM", "Comoros"],
  "084": ["BLZ", "Belize"],
  "090": ["SLB", "Solomon Islands"],
  "540": ["NCL", "New Caledonia"],
  "548": ["VUT", "Vanuatu"],
  "010": ["ATA", "Antarctica"],
  "-99": ["XKX", "Kosovo"],
};

/* ========================================================================== */
/* 3D Sphere Math                                                             */
/* ========================================================================== */
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export interface ProjectedPoint {
  sx: number;
  sy: number;
  rx: number;
  ry: number;
  rz: number;
  v: boolean;
}

function project(
  lng: number,
  lat: number,
  lambda: number,
  phi: number,
  gamma: number,
  R: number,
  cx: number,
  cy: number
): ProjectedPoint {
  const lr = (lng - lambda) * D2R;
  const la = lat * D2R;
  const cl = Math.cos(la);

  const x0 = cl * Math.cos(lr);
  const y0 = cl * Math.sin(lr);
  const z0 = Math.sin(la);

  const cp = Math.cos(phi * D2R);
  const sp = Math.sin(phi * D2R);
  const x1 = x0 * cp + z0 * sp;
  const y1 = y0;
  const z1 = -x0 * sp + z0 * cp;

  const cg = Math.cos(gamma * D2R);
  const sg = Math.sin(gamma * D2R);
  const rx = x1;
  const ry = y1 * cg - z1 * sg;
  const rz = y1 * sg + z1 * cg;

  return {
    sx: cx + R * ry,
    sy: cy - R * rz,
    rx,
    ry,
    rz,
    v: rx >= 0,
  };
}

function unproject(
  px: number,
  py: number,
  lambda: number,
  phi: number,
  gamma: number,
  R: number,
  cx: number,
  cy: number
): { lng: number; lat: number } | null {
  const Ry = (px - cx) / R;
  const Rz = -(py - cy) / R;
  const r2 = Ry * Ry + Rz * Rz;
  if (r2 > 1) return null;

  const cg = Math.cos(gamma * D2R);
  const sg = Math.sin(gamma * D2R);
  const y1 = Ry * cg + Rz * sg;
  const z1 = -Ry * sg + Rz * cg;

  const x1 = Math.sqrt(Math.max(0, 1 - r2));

  const cp = Math.cos(phi * D2R);
  const sp = Math.sin(phi * D2R);
  const x0 = x1 * cp - z1 * sp;
  const y0 = y1;
  const z0 = x1 * sp + z1 * cp;

  const lat = Math.asin(clamp(z0, -1, 1)) * R2D;
  let lng = Math.atan2(y0, x0) * R2D + lambda;
  lng = (((lng + 180) % 360) + 360) % 360 - 180;
  return { lng, lat };
}

function limbIntersect(
  a: ProjectedPoint,
  b: ProjectedPoint,
  R: number,
  cx: number,
  cy: number
): ProjectedPoint | null {
  const dr = a.rx - b.rx;
  if (Math.abs(dr) < 1e-12) return null;
  const t = a.rx / dr;
  if (t < 0 || t > 1) return null;
  let ry = a.ry + t * (b.ry - a.ry);
  let rz = a.rz + t * (b.rz - a.rz);
  const norm = Math.sqrt(ry * ry + rz * rz);
  if (norm < 1e-9) return null;
  ry /= norm;
  rz /= norm;
  return {
    sx: cx + R * ry,
    sy: cy - R * rz,
    rx: 0,
    ry,
    rz,
    v: true,
  };
}

function ringToSegments(
  ring: [number, number][],
  lambda: number,
  phi: number,
  gamma: number,
  R: number,
  cx: number,
  cy: number
): ProjectedPoint[][] {
  const n = ring.length;
  if (n < 3) return [];
  const proj: ProjectedPoint[] = new Array(n);
  let visCount = 0;
  for (let i = 0; i < n; i++) {
    const p = ring[i];
    proj[i] = project(p[0], p[1], lambda, phi, gamma, R, cx, cy);
    if (proj[i].v) visCount++;
  }
  if (visCount === 0) return [];
  if (visCount === n) return [proj.slice()];

  let startIdx = -1;
  for (let i = 0; i < n; i++) {
    if (!proj[i].v && proj[(i + 1) % n].v) {
      startIdx = i;
      break;
    }
  }
  if (startIdx === -1) return [proj.slice()];

  const segments: ProjectedPoint[][] = [];
  let cur: ProjectedPoint[] = [];

  for (let k = 0; k < n; k++) {
    const i = (startIdx + k) % n;
    const j = (startIdx + k + 1) % n;
    const A = proj[i];
    const B = proj[j];

    if (A.v && B.v) {
      cur.push(B);
    } else if (A.v && !B.v) {
      const inter = limbIntersect(A, B, R, cx, cy);
      if (inter) cur.push(inter);
      if (cur.length >= 2) segments.push(cur);
      cur = [];
    } else if (!A.v && B.v) {
      const inter = limbIntersect(A, B, R, cx, cy);
      if (inter) cur.push(inter);
      cur.push(B);
    }
  }
  return segments;
}

function segmentsToPath(segs: ProjectedPoint[][]): string {
  if (segs.length === 0) return '';
  let out = '';
  for (const seg of segs) {
    for (let i = 0; i < seg.length; i++) {
      const p = seg[i];
      out += (i === 0 ? 'M' : 'L') + p.sx.toFixed(1) + ',' + p.sy.toFixed(1);
    }
    out += 'Z';
  }
  return out;
}

function buildSphericalPath(
  type: string,
  coords: any,
  lambda: number,
  phi: number,
  gamma: number,
  R: number,
  cx: number,
  cy: number
): string {
  if (!coords) return '';
  if (type === 'Polygon') {
    let out = '';
    for (const ring of coords) {
      out += segmentsToPath(ringToSegments(ring, lambda, phi, gamma, R, cx, cy));
    }
    return out;
  }
  if (type === 'MultiPolygon') {
    let out = '';
    for (const poly of coords) {
      for (const ring of poly) {
        out += segmentsToPath(ringToSegments(ring, lambda, phi, gamma, R, cx, cy));
      }
    }
    return out;
  }
  return '';
}

function buildGraticule(
  lambda: number,
  phi: number,
  gamma: number,
  R: number,
  cx: number,
  cy: number
): string {
  let out = '';
  // Parallels
  for (let lat = -60; lat <= 60; lat += 30) {
    let started = false;
    let prev: ProjectedPoint | null = null;
    for (let lng = -180; lng <= 180; lng += 5) {
      const p = project(lng, lat, lambda, phi, gamma, R, cx, cy);
      if (p.v) {
        if (!started || (prev && !prev.v)) {
          out += 'M' + p.sx.toFixed(1) + ',' + p.sy.toFixed(1);
          started = true;
        } else {
          out += 'L' + p.sx.toFixed(1) + ',' + p.sy.toFixed(1);
        }
      }
      prev = p;
    }
  }
  // Meridians
  for (let lng = -180; lng < 180; lng += 30) {
    let started = false;
    let prev: ProjectedPoint | null = null;
    for (let lat = -80; lat <= 80; lat += 5) {
      const p = project(lng, lat, lambda, phi, gamma, R, cx, cy);
      if (p.v) {
        if (!started || (prev && !prev.v)) {
          out += 'M' + p.sx.toFixed(1) + ',' + p.sy.toFixed(1);
          started = true;
        } else {
          out += 'L' + p.sx.toFixed(1) + ',' + p.sy.toFixed(1);
        }
      }
      prev = p;
    }
  }
  return out;
}

/**
 * Builds 3D parabolic great-circle flight arc SVG path
 */
function buildFlightArc(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  lambda: number,
  phi: number,
  gamma: number,
  R: number,
  cx: number,
  cy: number,
  steps = 24,
  altitude = 0.12
): string {
  const phi1 = lat1 * D2R;
  const lam1 = lng1 * D2R;
  const p1 = {
    x: Math.cos(phi1) * Math.cos(lam1),
    y: Math.cos(phi1) * Math.sin(lam1),
    z: Math.sin(phi1),
  };

  const phi2 = lat2 * D2R;
  const lam2 = lng2 * D2R;
  const p2 = {
    x: Math.cos(phi2) * Math.cos(lam2),
    y: Math.cos(phi2) * Math.sin(lam2),
    z: Math.sin(phi2),
  };

  const dot = clamp(p1.x * p2.x + p1.y * p2.y + p1.z * p2.z, -1, 1);
  const omega = Math.acos(dot);
  if (omega < 0.01) return '';

  const sinOmega = Math.sin(omega);
  let d = '';
  let started = false;
  let prevVisible = false;

  const cosL = Math.cos(-lambda * D2R);
  const sinL = Math.sin(-lambda * D2R);
  const cp = Math.cos(phi * D2R);
  const sp = Math.sin(phi * D2R);
  const cg = Math.cos(gamma * D2R);
  const sg = Math.sin(gamma * D2R);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = Math.sin((1 - t) * omega) / sinOmega;
    const b = Math.sin(t * omega) / sinOmega;
    const alt = 1 + altitude * Math.sin(t * Math.PI);

    const ux = (a * p1.x + b * p2.x) * alt;
    const uy = (a * p1.y + b * p2.y) * alt;
    const uz = (a * p1.z + b * p2.z) * alt;

    const x0 = ux * cosL - uy * sinL;
    const y0 = ux * sinL + uy * cosL;
    const z0 = uz;

    const x1 = x0 * cp + z0 * sp;
    const y1 = y0;
    const z1 = -x0 * sp + z0 * cp;

    const rx = x1;
    const ry = y1 * cg - z1 * sg;
    const rz = y1 * sg + z1 * cg;

    const visible = rx >= -0.05;
    const sx = cx + R * ry;
    const sy = cy - R * rz;

    if (visible) {
      if (!started || !prevVisible) {
        d += `M${sx.toFixed(1)},${sy.toFixed(1)}`;
        started = true;
      } else {
        d += `L${sx.toFixed(1)},${sy.toFixed(1)}`;
      }
    }
    prevVisible = visible;
  }
  return d;
}

/* ========================================================================== */
/* TopoJSON Decoder                                                           */
/* ========================================================================== */
function decArcs(t: any): [number, number][][] {
  const tf = t.transform;
  if (!tf) return t.arcs;
  const sx = tf.scale[0],
    sy = tf.scale[1],
    dx = tf.translate[0],
    dy = tf.translate[1];
  return t.arcs.map((a: number[][]) => {
    let x = 0,
      y = 0;
    return a.map((p: number[]) => {
      x += p[0];
      y += p[1];
      return [x * sx + dx, y * sy + dy];
    });
  });
}

function resolveRing(idx: number[], arcs: any): [number, number][] {
  const out: [number, number][] = [];
  for (const i of idx) {
    const a = i >= 0 ? arcs[i] : arcs[~i].slice().reverse();
    for (let j = out.length > 0 ? 1 : 0; j < a.length; j++) {
      out.push(a[j]);
    }
  }
  return out;
}

function extractFeatures(t: any) {
  const arcs = decArcs(t);
  const gs = t.objects.countries?.geometries;
  if (!gs) return [];
  return gs.map((g: any) => {
    let c: any = null;
    if (g.type === 'Polygon') {
      c = g.arcs.map((r: number[]) => resolveRing(r, arcs));
    } else if (g.type === 'MultiPolygon') {
      c = g.arcs.map((p: number[][]) => p.map((r: number[]) => resolveRing(r, arcs)));
    }
    return { id: String(g.id ?? ''), type: g.type, coords: c };
  });
}

/* ========================================================================== */
/* Hover hit-test (point-in-polygon over lng/lat)                             */
/* ========================================================================== */
function pointInRing(x: number, y: number, ring: [number, number][]): boolean {
  let inside = false;
  const n = ring.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = ring[i][0],
      yi = ring[i][1];
    const xj = ring[j][0],
      yj = ring[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function findCountryAt(lng: number, lat: number, index: any[]): any {
  for (const c of index) {
    if (lng < c.bbox.minLng || lng > c.bbox.maxLng) continue;
    if (lat < c.bbox.minLat || lat > c.bbox.maxLat) continue;
    let inside = false;
    for (const ring of c.rings) {
      if (pointInRing(lng, lat, ring)) inside = !inside;
    }
    if (inside) return c;
  }
  return null;
}

function rgba(c: string, a: number): string {
  if (typeof c !== 'string' || !c) return `rgba(0,0,0,${a})`;
  const s = c.trim();
  if (s.startsWith('rgb')) {
    const m = s.match(/-?[\d.]+/g);
    if (m && m.length >= 3) {
      return `rgba(${m[0]},${m[1]},${m[2]},${a})`;
    }
    return `rgba(0,0,0,${a})`;
  }
  if (s.startsWith('hsl')) {
    const m = s.match(/-?[\d.]+/g);
    if (m && m.length >= 3) {
      return `hsla(${m[0]},${m[1]}%,${m[2]}%,${a})`;
    }
    return `rgba(0,0,0,${a})`;
  }
  const h = s.replace('#', '');
  if (h.length !== 3 && h.length !== 6 && h.length !== 8) {
    return `rgba(0,0,0,${a})`;
  }
  const f = h.length === 3 ? h.split('').map((x) => x + x).join('') : h.slice(0, 6);
  return `rgba(${parseInt(f.slice(0, 2), 16)},${parseInt(f.slice(2, 4), 16)},${parseInt(f.slice(4, 6), 16)},${a})`;
}

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 1831565813) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DATA_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

/* ========================================================================== */
/* Props Interface                                                            */
/* ========================================================================== */
export interface TacticalGlobe3DProps {
  onSelectDestination?: (dest: RouteLocation) => void;
  selectedDest?: RouteLocation | null;
  onGetEstimate?: (dest: RouteLocation) => void;
  onBookPickup?: (dest: RouteLocation) => void;
  className?: string;
  autoRotateSpeed?: number;
  initialLambda?: number;
  initialPhi?: number;
}

export const TacticalGlobe3D: React.FC<TacticalGlobe3DProps> = ({
  onSelectDestination,
  selectedDest,
  className = '',
  autoRotateSpeed = 4.5,
  initialLambda = 85, // Centered near Nepal / Asia longitude
  initialPhi = 15,
}) => {
  // The site is light only
  const isDark = false;

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef(new Map<string, SVGPathElement>());
  const ghostPathRefs = useRef(new Map<string, SVGPathElement>());
  const markerRefs = useRef(new Map<string, SVGGElement>());
  const arcRefs = useRef(new Map<string, SVGPathElement>());
  const gridPathRef = useRef<SVGPathElement>(null);
  const flagRefs = useRef(new Map<string, SVGImageElement>());
  const nepalLabelRef = useRef<SVGTextElement>(null);
  const clickStartRef = useRef<{ x: number; y: number } | null>(null);

  // SVG spherical shape circle refs for real-time 60fps zooming
  const oceanCircleRef = useRef<SVGCircleElement>(null);
  const shadingCircleRef = useRef<SVGCircleElement>(null);
  const rimCircleRef = useRef<SVGCircleElement>(null);
  const haloCircleRef = useRef<SVGCircleElement>(null);
  const clipCircleRef = useRef<SVGCircleElement>(null);

  const [isClient, setIsClient] = useState(false);
  const [dims, setDims] = useState({ w: 600, h: 440 });
  const [feats, setFeats] = useState<any[] | null>(null);
  const [err, setErr] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);

  const [hM, setHM] = useState<{
    screenX: number;
    screenY: number;
    label: string;
    description?: string;
    price?: string;
    transit?: string;
  } | null>(null);
  const [hC, setHC] = useState<{
    screenX: number;
    screenY: number;
    name: string;
    code: string;
  } | null>(null);

  const rotRef = useRef({ lambda: initialLambda, phi: initialPhi, gamma: 0 });
  const sweepDirRef = useRef<number>(1); // 1 = East, -1 = West (oscillates between -10° and 140° to avoid empty Pacific)
  const targetRotRef = useRef<{ lambda: number; phi: number } | null>(null);
  const isEasingAfterInactivityRef = useRef<boolean>(false);
  const zoomRef = useRef(1.0);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startLambda: 0,
    startPhi: 0,
  });

  // Touch and pinch tracking refs
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(1.0);

  const lastMouseRef = useRef<{ x: number; y: number } | null>(null);
  const userInteractedRef = useRef(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener?.('change', handler);
    return () => mediaQuery.removeEventListener?.('change', handler);
  }, []);

  // When selectedDest changes from outside, smoothly ease to face destination
  useEffect(() => {
    if (!selectedDest) return;
    userInteractedRef.current = performance.now();
    targetRotRef.current = {
      lambda: selectedDest.lng,
      phi: clamp(selectedDest.lat * 0.45, -45, 45),
    };
  }, [selectedDest]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ResizeObserver for responsive SVG dimensions
  useEffect(() => {
    if (!isClient) return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r && r.width > 0 && r.height > 0) {
        startTransition(() => {
          setDims({ w: r.width, h: r.height });
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isClient]);

  // Non-passive wheel event listener on container for smooth desktop trackpad/mouse zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.0018;
      const newZoom = clamp(zoomRef.current + delta, 0.6, 2.5);
      zoomRef.current = newZoom;
      userInteractedRef.current = performance.now();
      startTransition(() => {
        setZoomLevel(newZoom);
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Load TopoJSON countries
  useEffect(() => {
    if (!isClient) return;
    let dead = false;
    fetch(DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error('CDN error');
        return r.json();
      })
      .then((t) => {
        if (!dead) {
          startTransition(() => {
            setFeats(extractFeatures(t));
          });
        }
      })
      .catch(() => {
        if (!dead) {
          startTransition(() => {
            setErr(true);
          });
        }
      });
    return () => {
      dead = true;
    };
  }, [isClient]);

  // Base Geometry dimensions
  const { w: W, h: H } = dims;
  const pad = 12;
  const innerW = Math.max(0, W - pad * 2);
  const innerH = Math.max(0, H - pad * 2);
  const baseR = Math.max(20, Math.min(innerW, innerH) / 2 - 10);
  const cx = W / 2;
  const cy = H / 2;

  // Build Country Index
  const countryIndex = useMemo(() => {
    if (!feats) return [];
    const out: any[] = [];
    feats.forEach((f, idx) => {
      const pad3 = String(f.id).padStart(3, '0');
      const e = CD[pad3];
      // Some map shapes have no id; give each a unique one so React keys never collide.
      const a3 = e ? e[0] : `${pad3}-${idx}`;
      const nm = e ? e[1] : a3;
      if (a3 === 'ATA') return;

      const rings: [number, number][][] = [];
      let minLng = Infinity,
        maxLng = -Infinity,
        minLat = Infinity,
        maxLat = -Infinity;
      let bigArea = -1;
      let cLng = 0,
        cLat = 0,
        size = 0;
      const visit = (ring: [number, number][]) => {
        rings.push(ring);
        let rMinLng = Infinity,
          rMaxLng = -Infinity,
          rMinLat = Infinity,
          rMaxLat = -Infinity;
        for (const p of ring) {
          if (p[0] < minLng) minLng = p[0];
          if (p[0] > maxLng) maxLng = p[0];
          if (p[1] < minLat) minLat = p[1];
          if (p[1] > maxLat) maxLat = p[1];
          if (p[0] < rMinLng) rMinLng = p[0];
          if (p[0] > rMaxLng) rMaxLng = p[0];
          if (p[1] < rMinLat) rMinLat = p[1];
          if (p[1] > rMaxLat) rMaxLat = p[1];
        }
        const area = (rMaxLng - rMinLng) * (rMaxLat - rMinLat);
        if (area > bigArea) {
          bigArea = area;
          cLng = (rMinLng + rMaxLng) / 2;
          cLat = (rMinLat + rMaxLat) / 2;
          size = Math.max(rMaxLng - rMinLng, rMaxLat - rMinLat);
        }
      };

      if (f.type === 'Polygon') {
        for (const r of f.coords) visit(r);
      } else if (f.type === 'MultiPolygon') {
        for (const poly of f.coords) {
          for (const r of poly) visit(r);
        }
      }
      out.push({
        id: a3,
        name: nm,
        type: f.type,
        coords: f.coords,
        rings,
        bbox: { minLng, maxLng, minLat, maxLat },
        cLng,
        cLat,
        size,
        iso2: COUNTRY_BY_ISO3[a3]?.iso2 ?? '',
      });
    });
    return out;
  }, [feats]);

  // Starfield background
  const stars = useMemo(() => {
    if (!isDark) return [];
    const rnd = mulberry32(1584243068);
    const N = 60;
    const out: { x: number; y: number; r: number; o: number }[] = [];
    for (let i = 0; i < N; i++) {
      const x = rnd() * W;
      const y = rnd() * H;
      const dx = x - cx,
        dy = y - cy;
      if (dx * dx + dy * dy < (baseR + 14) * (baseR + 14)) continue;
      out.push({ x, y, r: 0.5 + rnd() * 0.9, o: 0.15 + rnd() * 0.5 });
    }
    return out;
  }, [W, H, cx, cy, baseR, isDark]);

  // Palette tokens based on BC Cargo Brand System
  const palette = useMemo(() => {
    if (isDark) {
      return {
        oceanColor: '#00152D',
        landFill: '#0F2644',
        landStroke: 'rgba(242, 183, 5, 0.22)',
        strokeWidth: 0.6,
        hoverColor: '#1E497C',
        disabledColor: '#00152D',
        gridColor: 'rgba(255, 255, 255, 0.09)',
        gridOpacity: 0.8,
        glowColor: '#F2B705',
        glowIntensity: 0.45,
        arcColor: '#F2B705',
        tooltipBg: 'rgba(0, 21, 45, 0.94)',
        tooltipBorder: 'rgba(242, 183, 5, 0.35)',
        tooltipText: '#FAFAF8',
      };
    } else {
      return {
        oceanColor: '#EBF2FA',
        landFill: '#FFFFFF',
        landStroke: 'rgba(0, 33, 71, 0.16)',
        strokeWidth: 0.65,
        hoverColor: '#FDF6D8',
        disabledColor: '#EBF2FA',
        gridColor: 'rgba(0, 33, 71, 0.08)',
        gridOpacity: 0.7,
        glowColor: '#002147',
        glowIntensity: 0.25,
        arcColor: '#CC9704',
        tooltipBg: 'rgba(255, 255, 255, 0.96)',
        tooltipBorder: 'rgba(0, 33, 71, 0.2)',
        tooltipText: '#002147',
      };
    }
  }, [isDark]);

  const originHub = HUBS[0];

  // Animation Loop (requestAnimationFrame updating SVG nodes imperatively)
  useEffect(() => {
    if (!isClient) return;
    if (W <= 0 || H <= 0 || baseR <= 0) return;

    let raf = 0;
    let lastTime = performance.now();
    const idleMs = 5000; // 5-second inactivity timeout per Phase 5 spec

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const sinceUser = now - userInteractedRef.current;
      const isReduced = prefersReducedMotion || autoRotateSpeed <= 0;

      if (!dragRef.current.active && pinchStartDistRef.current === null && !isReduced) {
        if (targetRotRef.current) {
          // Smoothly lerp towards target destination
          const dLambda = targetRotRef.current.lambda - rotRef.current.lambda;
          const dPhi = targetRotRef.current.phi - rotRef.current.phi;
          rotRef.current.lambda += dLambda * Math.min(1, dt * 3.2);
          rotRef.current.phi += dPhi * Math.min(1, dt * 3.2);
          if (Math.abs(dLambda) < 0.25 && Math.abs(dPhi) < 0.25) {
            rotRef.current.lambda = targetRotRef.current.lambda;
            rotRef.current.phi = targetRotRef.current.phi;
            targetRotRef.current = null;
          }
        } else if (sinceUser > idleMs) {
          // After 5 seconds of inactivity: ease to nearest country corridor, then resume corridor sweep
          if (!isEasingAfterInactivityRef.current) {
            isEasingAfterInactivityRef.current = true;
            const candidates = [originHub, ...DESTINATIONS.slice(0, 7)];
            let best = candidates[0];
            let bestDist = Infinity;
            for (const c of candidates) {
              const diff = Math.abs(((c.lng - rotRef.current.lambda + 180) % 360) - 180);
              if (diff < bestDist) {
                bestDist = diff;
                best = c;
              }
            }
            targetRotRef.current = {
              lambda: best.lng,
              phi: clamp(best.lat * 0.4, -30, 30),
            };
          } else {
            // Auto-rotate only between country corridors (-10° to 140°), avoiding the empty Pacific ocean
            if (rotRef.current.lambda >= 140) {
              sweepDirRef.current = -1;
            } else if (rotRef.current.lambda <= -10) {
              sweepDirRef.current = 1;
            }
            rotRef.current.lambda += sweepDirRef.current * autoRotateSpeed * dt;
          }
        }
      }

      const { lambda, phi, gamma } = rotRef.current;
      const currentZoom = zoomRef.current;
      const R = baseR * currentZoom;
      const rStr = R.toFixed(1);

      // Real-time sphere circle & clip path radius updates on zoom
      if (oceanCircleRef.current) oceanCircleRef.current.setAttribute('r', rStr);
      if (shadingCircleRef.current) shadingCircleRef.current.setAttribute('r', rStr);
      if (rimCircleRef.current) rimCircleRef.current.setAttribute('r', rStr);
      if (haloCircleRef.current) haloCircleRef.current.setAttribute('r', (R + 50 * currentZoom).toFixed(1));
      if (clipCircleRef.current) clipCircleRef.current.setAttribute('r', rStr);

      // 1. Update Country Polygons
      if (countryIndex.length > 0) {
        for (const c of countryIndex) {
          const d = buildSphericalPath(c.type, c.coords, lambda, phi, gamma, R, cx, cy);
          const p = pathRefs.current.get(c.id);
          if (p) p.setAttribute('d', d);
          const g = ghostPathRefs.current.get(c.id);
          if (g) g.setAttribute('d', d);
        }
      }

      // 2. Update Grid
      if (gridPathRef.current) {
        gridPathRef.current.setAttribute('d', buildGraticule(lambda, phi, gamma, R, cx, cy));
      }

      // 3. Update Flight Corridor Arcs (starting from Hetauda Central HQ)
      for (const dest of DESTINATIONS) {
        const arcEl = arcRefs.current.get(dest.id);
        if (arcEl) {
          const d = buildFlightArc(
            originHub.lat,
            originHub.lng,
            dest.lat,
            dest.lng,
            lambda,
            phi,
            gamma,
            R,
            cx,
            cy
          );
          arcEl.setAttribute('d', d);
        }
      }

      // 4. Update Hetauda Central HQ Hub Marker
      const originEl = markerRefs.current.get(originHub.id);
      if (originEl) {
        const pOrigin = project(originHub.lng, originHub.lat, lambda, phi, gamma, R, cx, cy);
        if (pOrigin.v) {
          const fade = clamp(pOrigin.rx * 4, 0, 1);
          originEl.style.opacity = String(fade);
          originEl.style.display = '';
          originEl.setAttribute('transform', `translate(${pOrigin.sx.toFixed(1)},${pOrigin.sy.toFixed(1)})`);
        } else {
          originEl.style.opacity = '0';
          originEl.style.display = 'none';
        }
      }

      // 5. Update Destination Markers
      for (const dest of DESTINATIONS) {
        const el = markerRefs.current.get(dest.id);
        if (!el) continue;
        const p = project(dest.lng, dest.lat, lambda, phi, gamma, R, cx, cy);
        if (p.v) {
          const fade = clamp(p.rx * 4, 0, 1);
          el.style.opacity = String(fade);
          el.style.display = '';
          el.setAttribute('transform', `translate(${p.sx.toFixed(1)},${p.sy.toFixed(1)})`);
        } else {
          el.style.opacity = '0';
          el.style.display = 'none';
        }
      }

      // 5b. Flags: Nepal (with the BC Cargo Hetauda label) plus the countries we ship to. No country names.
      for (const c of countryIndex) {
        const img = flagRefs.current.get(c.id);
        if (!img) continue;
        const isNepal = c.iso2 === 'NP';
        if (!isNepal && !SHOWN_ISO2.has(c.iso2)) continue;
        const lng = isNepal ? originHub.lng : c.cLng;
        const lat = isNepal ? originHub.lat : c.cLat;
        const p = project(lng, lat, lambda, phi, gamma, R, cx, cy);
        if (!p.v || p.rx < 0.12) {
          if (img.style.display !== 'none') img.style.display = 'none';
          if (isNepal && nepalLabelRef.current) nepalLabelRef.current.style.display = 'none';
          continue;
        }
        const px = c.size * D2R * R;
        const w = isNepal ? 28 : clamp(px * 0.5, 17, 26);
        const h = w * 0.7;
        img.style.display = '';
        img.setAttribute('x', (p.sx - w / 2).toFixed(1));
        img.setAttribute('y', (p.sy - h / 2).toFixed(1));
        img.setAttribute('width', w.toFixed(1));
        img.setAttribute('height', h.toFixed(1));
        img.style.opacity = String(clamp(p.rx * 3, 0, 1));
        if (isNepal && nepalLabelRef.current) {
          const t = nepalLabelRef.current;
          t.style.display = '';
          t.style.opacity = String(clamp(p.rx * 3, 0, 1));
          t.setAttribute('x', (p.sx + w / 2 + 5).toFixed(1));
          t.setAttribute('y', (p.sy + 4).toFixed(1));
        }
      }

      // 6. Country hover under cursor
      if (lastMouseRef.current && !dragRef.current.active && pinchStartDistRef.current === null && countryIndex.length > 0) {
        const m = lastMouseRef.current;
        const ll = unproject(m.x, m.y, lambda, phi, gamma, R, cx, cy);
        if (ll) {
          const c = findCountryAt(ll.lng, ll.lat, countryIndex);
          if (c) {
            if (!hC || hC.code !== c.id) {
              startTransition(() => {
                setHC({ screenX: m.x, screenY: m.y, name: c.name, code: c.id });
              });
            } else if (hC.screenX !== m.x || hC.screenY !== m.y) {
              startTransition(() => {
                setHC({ ...hC, screenX: m.x, screenY: m.y });
              });
            }
          } else if (hC) {
            startTransition(() => {
              setHC(null);
            });
          }
        } else if (hC) {
          startTransition(() => {
            setHC(null);
          });
        }
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isClient, countryIndex, W, H, baseR, cx, cy, autoRotateSpeed, originHub.lat, originHub.lng, originHub.id, prefersReducedMotion, hC]);

  // Sync country hover fills
  useEffect(() => {
    for (const c of countryIndex) {
      const el = pathRefs.current.get(c.id);
      if (!el) continue;
      const isHov = hC?.code === c.id;
      const isSelected = selectedDest?.country.toLowerCase().includes(c.name.toLowerCase());
      const fill = isHov || isSelected ? palette.hoverColor : palette.landFill;
      el.setAttribute('fill', fill);
    }
  }, [countryIndex, hC, selectedDest, palette.hoverColor, palette.landFill]);

  // Pointer & Multi-touch Handlers (Supports Drag-to-Rotate + Pinch-to-Zoom on mobile)
  const localMouse = (e: React.PointerEvent) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Multi-touch pinch detected
    if (activePointersRef.current.size >= 2) {
      const pts = Array.from(activePointersRef.current.values());
      pinchStartDistRef.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchStartZoomRef.current = zoomRef.current;
      dragRef.current.active = false;
      return;
    }

    const m = localMouse(e);
    clickStartRef.current = { x: m.x, y: m.y };
    const dx = m.x - cx,
      dy = m.y - cy;
    const currentR = baseR * zoomRef.current;
    if (dx * dx + dy * dy > (currentR + 10) * (currentR + 10)) return;

    dragRef.current = {
      active: true,
      startX: m.x,
      startY: m.y,
      startLambda: rotRef.current.lambda,
      startPhi: rotRef.current.phi,
    };
    targetRotRef.current = null;
    isEasingAfterInactivityRef.current = false;
    userInteractedRef.current = performance.now();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // fallback
    }
    startTransition(() => {
      setHC(null);
      setHM(null);
    });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // Handle active pinch-to-zoom on touchscreen
    if (activePointersRef.current.size >= 2 && pinchStartDistRef.current) {
      const pts = Array.from(activePointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const factor = dist / Math.max(pinchStartDistRef.current, 1);
      const newZoom = clamp(pinchStartZoomRef.current * factor, 0.6, 2.5);
      zoomRef.current = newZoom;
      userInteractedRef.current = performance.now();
      targetRotRef.current = null;
      isEasingAfterInactivityRef.current = false;
      startTransition(() => {
        setZoomLevel(newZoom);
      });
      return;
    }

    const m = localMouse(e);
    lastMouseRef.current = m;

    if (dragRef.current.active) {
      userInteractedRef.current = performance.now();
      targetRotRef.current = null;
      isEasingAfterInactivityRef.current = false;
      const sens = 0.38 / zoomRef.current; // Dynamic sensitivity scaling with zoom level
      const dx = m.x - dragRef.current.startX;
      const dy = m.y - dragRef.current.startY;
      rotRef.current.lambda = dragRef.current.startLambda - dx * sens;
      rotRef.current.phi = clamp(dragRef.current.startPhi + dy * sens, -75, 75);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const start = clickStartRef.current;
    clickStartRef.current = null;
    if (start && e.type === 'pointerup' && activePointersRef.current.size <= 1 && onSelectDestination) {
      const m = localMouse(e);
      if (Math.hypot(m.x - start.x, m.y - start.y) < 6) {
        const { lambda, phi, gamma } = rotRef.current;
        const ll = unproject(m.x, m.y, lambda, phi, gamma, baseR * zoomRef.current, cx, cy);
        const hit = ll ? findCountryAt(ll.lng, ll.lat, countryIndex) : null;
        if (hit && SHOWN_ISO2.has(hit.iso2)) {
          onSelectDestination(destinationForCountry(hit.iso2, hit.name, hit.cLat, hit.cLng));
        }
      }
    }
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size < 2) {
      pinchStartDistRef.current = null;
    }
    if (activePointersRef.current.size === 0) {
      if (dragRef.current.active) {
        dragRef.current.active = false;
        userInteractedRef.current = performance.now();
        isEasingAfterInactivityRef.current = false;
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          // fallback
        }
      }
    }
  };

  const onPointerLeave = () => {
    lastMouseRef.current = null;
    if (!dragRef.current.active) {
      startTransition(() => {
        setHC(null);
        setHM(null);
      });
    }
  };

  // Zoom Button Handlers
  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newZoom = clamp(zoomRef.current + 0.25, 0.6, 2.5);
    zoomRef.current = newZoom;
    userInteractedRef.current = performance.now();
    startTransition(() => {
      setZoomLevel(newZoom);
    });
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newZoom = clamp(zoomRef.current - 0.25, 0.6, 2.5);
    zoomRef.current = newZoom;
    userInteractedRef.current = performance.now();
    startTransition(() => {
      setZoomLevel(newZoom);
    });
  };

  const handleResetView = (e: React.MouseEvent) => {
    e.stopPropagation();
    zoomRef.current = 1.0;
    rotRef.current.lambda = 85.324;
    rotRef.current.phi = 20;
    userInteractedRef.current = performance.now();
    startTransition(() => {
      setZoomLevel(1.0);
    });
  };

  // Marker hover handlers
  const handleMarkerEnter = (dest: RouteLocation, e: React.MouseEvent) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    startTransition(() => {
      setHM({
        screenX: e.clientX - r.left,
        screenY: e.clientY - r.top,
        label: `${dest.flag ? `${dest.flag} ` : ''}${dest.name}`,
        description: dest.serviceName,
        price: dest.fromPrice,
        transit: dest.transitTime,
      });
    });
  };

  const handleMarkerMove = (dest: RouteLocation, e: React.MouseEvent) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    startTransition(() => {
      setHM({
        screenX: e.clientX - r.left,
        screenY: e.clientY - r.top,
        label: `${dest.flag ? `${dest.flag} ` : ''}${dest.name}`,
        description: dest.serviceName,
        price: dest.fromPrice,
        transit: dest.transitTime,
      });
    });
  };

  const handleMarkerLeave = () => {
    startTransition(() => {
      setHM(null);
    });
  };

  const handleMarkerClick = (dest: RouteLocation) => {
    if (onSelectDestination) {
      onSelectDestination(dest);
    }
  };

  const rawId = useId();
  const uid = useMemo(() => rawId.replace(/[^a-zA-Z0-9]/g, ''), [rawId]);
  const fG = 'g' + uid;
  const gO = 'o' + uid;
  const gShade = 's' + uid;
  const gAtm = 'a' + uid;
  const clipDisc = 'c' + uid;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none touch-none ${className}`}
      style={{
        fontFamily: 'var(--font-data, monospace)',
      }}
    >
      <style>{`
        .mm-c { transition: fill 140ms ease; }
        .mm-c:hover { filter: brightness(1.15); }
        @keyframes mm-pulse {
          0%, 100% { transform: scale(1); opacity: 0.65; }
          50% { transform: scale(1.8); opacity: 0.05; }
        }
        .mm-pulse {
          animation: mm-pulse 2.2s ease-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        @keyframes mm-dash {
          to { stroke-dashoffset: -32; }
        }
        .mm-flight-arc {
          stroke-dasharray: 4, 3;
          animation: mm-dash 1.8s linear infinite;
        }
      `}</style>

      {/* Tactile On-Screen Zoom & Reset Controls */}
      <div className="absolute top-3 left-3 z-20 flex flex-col items-center bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--line)] rounded-[var(--r-xs)] shadow-hard-xs overflow-hidden">
        <button
          type="button"
          onClick={handleZoomIn}
          disabled={zoomLevel >= 2.4}
          aria-label="Zoom in globe"
          title="Zoom in (+)"
          className="w-7 h-7 flex items-center justify-center text-xs font-bold text-[var(--text)] hover:bg-[var(--surface-muted)] active:bg-[var(--surface-subtle)] disabled:opacity-30 transition-colors"
        >
          +
        </button>
        <div className="w-full h-[1px] bg-[var(--line)]" />
        <span className="text-[9px] font-mono px-1 py-0.5 text-[var(--text-muted)] select-none">
          {Math.round(zoomLevel * 100)}%
        </span>
        <div className="w-full h-[1px] bg-[var(--line)]" />
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={zoomLevel <= 0.65}
          aria-label="Zoom out globe"
          title="Zoom out (-)"
          className="w-7 h-7 flex items-center justify-center text-xs font-bold text-[var(--text)] hover:bg-[var(--surface-muted)] active:bg-[var(--surface-subtle)] disabled:opacity-30 transition-colors"
        >
          –
        </button>
        <div className="w-full h-[1px] bg-[var(--line)]" />
        <button
          type="button"
          onClick={handleResetView}
          aria-label="Reset globe zoom and orientation"
          title="Reset orientation & zoom"
          className="w-7 h-7 flex items-center justify-center text-[11px] font-bold text-[var(--gold-dark)] hover:bg-[var(--surface-muted)] active:bg-[var(--surface-subtle)] transition-colors"
        >
          ⟲
        </button>
      </div>

      {/* SVG Globe */}
      <svg
        ref={svgRef}
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerLeave}
        className="block w-full h-full cursor-grab active:cursor-grabbing"
      >
        <defs>
          <filter id={fG} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 3D Sphere Shading Mask */}
          <radialGradient id={gShade} cx="36%" cy="30%" r="76%">
            <stop offset="0%" stopColor={rgba('#ffffff', isDark ? 0.12 : 0.28)} />
            <stop offset="50%" stopColor={rgba('#ffffff', 0)} />
            <stop offset="88%" stopColor={rgba('#000000', isDark ? 0.35 : 0.12)} />
            <stop offset="100%" stopColor={rgba('#000000', isDark ? 0.65 : 0.28)} />
          </radialGradient>

          {/* Glowing Atmosphere Rim */}
          <radialGradient id={gAtm} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={rgba(palette.glowColor, 0)} />
            <stop
              offset={`${((baseR / Math.max(baseR + 50, 1)) * 100).toFixed(1)}%`}
              stopColor={rgba(palette.glowColor, 0)}
            />
            <stop
              offset={`${(((baseR + 4) / Math.max(baseR + 50, 1)) * 100).toFixed(1)}%`}
              stopColor={rgba(palette.glowColor, 0.42 * palette.glowIntensity)}
            />
            <stop offset="100%" stopColor={rgba(palette.glowColor, 0)} />
          </radialGradient>

          {/* Ocean Radial Depth */}
          <linearGradient id={gO} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={rgba(palette.oceanColor, 1)} />
            <stop offset="100%" stopColor={rgba(isDark ? '#000c1c' : '#d2e3f5', 1)} />
          </linearGradient>

          {/* Spherical Clip Mask */}
          <clipPath id={clipDisc}>
            <circle ref={clipCircleRef} cx={cx} cy={cy} r={baseR * zoomLevel} />
          </clipPath>
        </defs>

        {/* Ambient Stars */}
        {stars.map((s, i) => (
          <circle
            key={`s-${i}`}
            cx={s.x.toFixed(1)}
            cy={s.y.toFixed(1)}
            r={s.r.toFixed(2)}
            fill={rgba('#ffffff', s.o)}
          />
        ))}

        {/* Atmospheric Outer Halo */}
        <circle
          ref={haloCircleRef}
          cx={cx}
          cy={cy}
          r={baseR * zoomLevel + 50 * zoomLevel}
          fill={`url(#${gAtm})`}
          pointerEvents="none"
        />

        {/* Ocean Spherical Body */}
        <circle
          ref={oceanCircleRef}
          cx={cx}
          cy={cy}
          r={baseR * zoomLevel}
          fill={`url(#${gO})`}
        />

        {/* Clipped Spherical Land & Corridors */}
        <g clipPath={`url(#${clipDisc})`}>
          {/* Graticule Longitude / Latitude Coordinate Grid */}
          <path
            ref={gridPathRef}
            fill="none"
            stroke={palette.gridColor}
            strokeWidth={0.5}
            strokeOpacity={palette.gridOpacity}
            vectorEffect="non-scaling-stroke"
            pointerEvents="none"
          />

          {/* Country Polygons */}
          {countryIndex.map((c) => (
            <path
              key={`c-${c.id}`}
              ref={(el) => {
                if (el) pathRefs.current.set(c.id, el);
                else pathRefs.current.delete(c.id);
              }}
              className="mm-c"
              fill={palette.landFill}
              stroke={palette.landStroke}
              strokeWidth={palette.strokeWidth}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Flight Corridor Arcs */}
          {DESTINATIONS.map((dest) => (
            <path
              key={`arc-${dest.id}`}
              ref={(el) => {
                if (el) arcRefs.current.set(dest.id, el);
                else arcRefs.current.delete(dest.id);
              }}
              className="mm-flight-arc"
              fill="none"
              stroke={palette.arcColor}
              strokeWidth={1.25}
              strokeOpacity={selectedDest?.id === dest.id ? 1 : 0.55}
              pointerEvents="none"
            />
          ))}

          {/* Flags of every country (no names, flags only) */}
          {countryIndex.map((c) =>
            c.iso2 && (c.iso2 === 'NP' || SHOWN_ISO2.has(c.iso2)) ? (
              <image
                key={`f-${c.id}`}
                ref={(el) => {
                  if (el) flagRefs.current.set(c.id, el);
                  else flagRefs.current.delete(c.id);
                }}
                href={flagUrl(c.iso2, 40)}
                preserveAspectRatio="xMidYMid slice"
                style={{ display: 'none', pointerEvents: 'none' }}
              />
            ) : null
          )}
          <text
            ref={nepalLabelRef}
            fill={isDark ? '#F2B705' : '#002147'}
            fontSize={11}
            fontWeight={800}
            stroke={palette.oceanColor}
            strokeWidth={3}
            strokeLinejoin="round"
            paintOrder="stroke"
            style={{ display: 'none', pointerEvents: 'none', userSelect: 'none' }}
          >
            BC Cargo Hetauda
          </text>
        </g>

        {/* 3D Sphere Shading Lighting Mask */}
        <circle
          ref={shadingCircleRef}
          cx={cx}
          cy={cy}
          r={baseR * zoomLevel}
          fill={`url(#${gShade})`}
          pointerEvents="none"
        />

        {/* Fine Sphere Horizon Stroke */}
        <circle
          ref={rimCircleRef}
          cx={cx}
          cy={cy}
          r={baseR * zoomLevel}
          fill="none"
          stroke={rgba(palette.glowColor, 0.45 * palette.glowIntensity)}
          strokeWidth={1}
          pointerEvents="none"
        />

        {/* Destination Corridors (Interactive Pins) */}
        {DESTINATIONS.map((dest) => {
          const isSelected = selectedDest?.id === dest.id;
          const pinColor = isSelected ? '#F2B705' : isDark ? '#38BDF8' : '#002147';

          return (
            <g
              key={`m-${dest.id}`}
              ref={(el) => {
                if (el) markerRefs.current.set(dest.id, el);
                else markerRefs.current.delete(dest.id);
              }}
              style={{ cursor: 'pointer', opacity: 0 }}
              onClick={() => handleMarkerClick(dest)}
              onMouseEnter={(e) => handleMarkerEnter(dest, e)}
              onMouseMove={(e) => handleMarkerMove(dest, e)}
              onMouseLeave={handleMarkerLeave}
            >
              <circle
                className={isSelected ? 'mm-pulse' : undefined}
                r={isSelected ? 10 : 7}
                fill={rgba(pinColor, isSelected ? 0.35 : 0)}
              />
              <circle r={isSelected ? 4.5 : 3.5} fill={pinColor} opacity={isSelected ? 1 : 0} />
            </g>
          );
        })}
      </svg>

    </div>
  );
};
