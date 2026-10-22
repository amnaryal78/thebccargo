import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { COUNTRY_GUIDES, type CountryGuide } from '../../data/countryGuides';
import { LAND_B64, LAND_H, LAND_W } from './landMask';

/**
 * Hero globe: real continents drawn as dots, a gold flight arc that draws itself from Hetauda to the
 * destination, and a parcel that travels along it. Drag sideways to turn it; it eases back to the route.
 * Three.js is only loaded on guide pages (this file is lazy-imported). Under reduced motion it renders
 * one still frame. If WebGL is missing, onFail lets the page keep the flat map.
 */

const ORIGIN = { lat: 27.43, lon: 85.03 };
const R = 1;

const toVec = (lat: number, lon: number, r = R) => {
  const φ = (lat * Math.PI) / 180;
  const λ = (lon * Math.PI) / 180;
  return new THREE.Vector3(r * Math.cos(φ) * Math.sin(λ), r * Math.sin(φ), r * Math.cos(φ) * Math.cos(λ));
};

let landBits: Uint8Array | null = null;
const isLand = (lat: number, lon: number) => {
  if (!landBits) {
    const bin = atob(LAND_B64);
    landBits = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  }
  const x = Math.min(LAND_W - 1, Math.max(0, Math.floor(((lon + 180) / 360) * LAND_W)));
  const y = Math.min(LAND_H - 1, Math.max(0, Math.floor(((90 - lat) / 180) * LAND_H)));
  const i = y * LAND_W + x;
  return (landBits[i >> 3] >> (i & 7)) & 1;
};

const dotTexture = () => {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.55, 'rgba(255,255,255,0.9)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

export interface Globe3DProps {
  guide: CountryGuide;
  originLabel: string;
  destLabel: string;
  ariaLabel: string;
  reducedMotion: boolean;
  onFail: () => void;
}

export const Globe3D: React.FC<Globe3DProps> = ({ guide, originLabel, destLabel, ariaLabel, reducedMotion, onFail }) => {
  const host = useRef<HTMLDivElement>(null);
  const originEl = useRef<HTMLSpanElement>(null);
  const destEl = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      onFail();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab';
    el.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);

    const globe = new THREE.Group();
    scene.add(globe);

    // ocean: deep Oxford blue, lit from the top left, with a cool rim
    const ocean = new THREE.Mesh(
      new THREE.SphereGeometry(R * 0.995, 64, 48),
      new THREE.ShaderMaterial({
        vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} ',
        fragmentShader:
          'varying vec3 vN; void main(){ vec3 n=normalize(vN); float l=dot(n,normalize(vec3(-0.55,0.6,0.75)))*0.5+0.5; vec3 a=vec3(0.0,0.09,0.20); vec3 b=vec3(0.13,0.30,0.52); vec3 c=mix(a,b,pow(l,1.6)); float f=pow(1.0-max(n.z,0.0),2.6); c+=f*vec3(0.31,0.46,0.66)*0.55; gl_FragColor=vec4(c,1.0);} ',
      })
    );
    globe.add(ocean);

    // soft atmosphere
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.12, 48, 32),
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} ',
        fragmentShader: 'varying vec3 vN; void main(){ float i=pow(0.62-dot(vN,vec3(0.0,0.0,1.0)),3.0); gl_FragColor=vec4(0.40,0.58,0.85,1.0)*clamp(i,0.0,1.0)*0.9;} ',
      })
    );
    scene.add(halo);

    // continents as dots (Fibonacci sphere, keep the land ones)
    const tex = dotTexture();
    const N = 9000;
    const land: number[] = [];
    const ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const lat = (Math.asin(y) * 180) / Math.PI;
      const lon = ((((i * ga) % (2 * Math.PI)) * 180) / Math.PI) - 180;
      if (isLand(lat, lon)) {
        const v = toVec(lat, lon, R * 1.001);
        land.push(v.x, v.y, v.z);
      }
    }
    const landGeo = new THREE.BufferGeometry();
    landGeo.setAttribute('position', new THREE.Float32BufferAttribute(land, 3));
    const landPts = new THREE.Points(
      landGeo,
      new THREE.PointsMaterial({ color: 0xaec3de, size: 0.058, map: tex, transparent: true, alphaTest: 0.2, depthWrite: false, sizeAttenuation: true, opacity: 1 })
    );
    globe.add(landPts);

    // faint graticule
    const grat: number[] = [];
    for (let lon = -180; lon < 180; lon += 30) {
      for (let lat = -80; lat < 80; lat += 5) {
        const a = toVec(lat, lon, R * 1.0015);
        const b = toVec(lat + 5, lon, R * 1.0015);
        grat.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      for (let lon = -180; lon < 180; lon += 5) {
        const a = toVec(lat, lon, R * 1.0015);
        const b = toVec(lat, lon + 5, R * 1.0015);
        grat.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    const gratGeo = new THREE.BufferGeometry();
    gratGeo.setAttribute('position', new THREE.Float32BufferAttribute(grat, 3));
    globe.add(new THREE.LineSegments(gratGeo, new THREE.LineBasicMaterial({ color: 0x7f9dc4, transparent: true, opacity: 0.16 })));

    // every other destination we ship to, as small gold points
    const others: number[] = [];
    COUNTRY_GUIDES.forEach((g) => {
      if (g.slug === guide.slug) return;
      const v = toVec(g.hub.lat, g.hub.lon, R * 1.004);
      others.push(v.x, v.y, v.z);
    });
    const othersGeo = new THREE.BufferGeometry();
    othersGeo.setAttribute('position', new THREE.Float32BufferAttribute(others, 3));
    globe.add(new THREE.Points(othersGeo, new THREE.PointsMaterial({ color: 0xf2b705, size: 0.1, map: tex, transparent: true, alphaTest: 0.2, depthWrite: false, opacity: 0.7 })));

    // route arc: great circle, lifted off the surface
    const A = toVec(ORIGIN.lat, ORIGIN.lon).normalize();
    const B = toVec(guide.hub.lat, guide.hub.lon).normalize();
    const ang = A.angleTo(B);
    const lift = 0.1 + 0.28 * (ang / Math.PI);
    const pts: THREE.Vector3[] = [];
    const SEG = 120;
    for (let i = 0; i <= SEG; i++) {
      const t = i / SEG;
      const p = new THREE.Vector3().copy(A).multiplyScalar(Math.sin((1 - t) * ang)).add(B.clone().multiplyScalar(Math.sin(t * ang))).divideScalar(Math.sin(ang));
      p.normalize().multiplyScalar(R * 1.005 + lift * Math.sin(Math.PI * t));
      pts.push(p);
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const RAD = 8;
    const tube = new THREE.TubeGeometry(curve, SEG, 0.0085, RAD, false);
    const glow = new THREE.TubeGeometry(curve, SEG, 0.024, RAD, false);
    const tubeMat = new THREE.MeshBasicMaterial({ color: 0xf2b705 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xf2b705, transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending });
    const tubeMesh = new THREE.Mesh(tube, tubeMat);
    const glowMesh = new THREE.Mesh(glow, glowMat);
    globe.add(glowMesh, tubeMesh);
    const total = SEG * RAD * 6;

    // parcel
    const parcel = new THREE.Group();
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.036, 0.05), new THREE.MeshBasicMaterial({ color: 0xffe380 }));
    const tape = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.0375, 0.012), new THREE.MeshBasicMaterial({ color: 0xcc9704 }));
    const halo2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0xf2b705, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo2.scale.setScalar(0.2);
    parcel.add(box, tape, halo2);
    globe.add(parcel);

    // endpoints
    const pin = (v: THREE.Vector3, color: number, ring: number) => {
      const g = new THREE.Group();
      g.position.copy(v.clone().multiplyScalar(1.006));
      g.lookAt(v.clone().multiplyScalar(2));
      const dot = new THREE.Mesh(new THREE.CircleGeometry(0.03, 24), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
      const rim = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.04, 32), new THREE.MeshBasicMaterial({ color: 0x002147, side: THREE.DoubleSide }));
      const pulse = new THREE.Mesh(new THREE.RingGeometry(0.04, ring, 40), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }));
      g.add(pulse, dot, rim);
      globe.add(g);
      return pulse;
    };
    const pulseA = pin(A, 0xffffff, 0.06);
    const pulseB = pin(B, 0xf2b705, 0.07);

    // short routes get a closer camera, long ones pull back so both ends stay in view
    const baseZ = 3.25 + Math.min(1, ang / 1.7) * 1.1;

    // face the route
    const mid = A.clone().add(B).normalize();
    const midLat = (Math.asin(mid.y) * 180) / Math.PI;
    const midLon = (Math.atan2(mid.x, mid.z) * 180) / Math.PI;
    const baseX = (midLat * Math.PI) / 180;
    const baseY = (-midLon * Math.PI) / 180;
    globe.rotation.set(baseX, baseY, 0, 'XYZ');
    halo.rotation.set(0, 0, 0);

    // sizing
    const resize = () => {
      const w = el.clientWidth || 300;
      const h = el.clientHeight || 300;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // keep the whole globe in view on tall phones as well as wide cards
      const z = camera.aspect < 1 ? (baseZ / Math.max(camera.aspect, 0.72)) * 0.86 : baseZ;
      // a little below the equator, so the lifted arc visibly curves upward
      camera.position.set(0, -z * 0.17, z);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reducedMotion) frame(0, true);
    });
    ro.observe(el);

    // drag to turn
    let yaw = 0;
    let dragging = false;
    let lastX = 0;
    const down = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      renderer.domElement.style.cursor = 'grabbing';
      renderer.domElement.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      yaw += (e.clientX - lastX) * 0.008;
      yaw = Math.max(-1.6, Math.min(1.6, yaw));
      lastX = e.clientX;
      if (reducedMotion) frame(0, true);
    };
    const up = () => {
      dragging = false;
      renderer.domElement.style.cursor = 'grab';
    };
    renderer.domElement.addEventListener('pointerdown', down);
    renderer.domElement.addEventListener('pointermove', move);
    renderer.domElement.addEventListener('pointerup', up);
    renderer.domElement.addEventListener('pointercancel', up);

    // labels follow their points
    const tmp = new THREE.Vector3();
    const place = (node: HTMLSpanElement | null, v: THREE.Vector3) => {
      if (!node) return;
      tmp.copy(v).multiplyScalar(1.02);
      globe.localToWorld(tmp);
      const facing = tmp.z > 0.05;
      tmp.project(camera);
      const w = el.clientWidth;
      const h = el.clientHeight;
      node.style.opacity = facing ? '1' : '0';
      node.style.transform = `translate(${((tmp.x + 1) / 2) * w}px, ${((1 - tmp.y) / 2) * h}px) translate(-50%, -140%)`;
    };

    // animation
    const DRAW = 2.2; // seconds to draw the route
    const start = performance.now();
    let raf = 0;
    let running = true;
    const frame = (now: number, still = false) => {
      const t = still ? 99 : (now - start) / 1000;
      const prog = still ? 1 : Math.min(1, t / DRAW);
      const eased = 1 - Math.pow(1 - prog, 3);
      tubeMesh.geometry.setDrawRange(0, Math.floor(eased * SEG) * RAD * 6);
      glowMesh.geometry.setDrawRange(0, Math.floor(eased * SEG) * RAD * 6);
      // parcel loops along the finished arc
      const u = still ? 0.5 : prog < 1 ? eased : ((t - DRAW) / 4.5) % 1;
      curve.getPointAt(Math.min(0.999, Math.max(0, u)), parcel.position);
      parcel.visible = still ? true : prog >= 0.02;
      parcel.rotation.y = still ? 0.6 : t * 1.4;
      if (!still) {
        if (!dragging) yaw += (0 - yaw) * 0.035;
        globe.rotation.y = baseY + yaw + Math.sin(t * 0.35) * 0.06;
        const s = (Math.sin(t * 2.4) + 1) / 2;
        pulseA.scale.setScalar(1 + s * 0.45);
        pulseB.scale.setScalar(1 + s * 0.6);
        (pulseA.material as THREE.MeshBasicMaterial).opacity = 0.5 - s * 0.3;
        (pulseB.material as THREE.MeshBasicMaterial).opacity = 0.55 - s * 0.35;
      } else {
        globe.rotation.y = baseY + yaw;
      }
      globe.updateMatrixWorld(true);
      place(originEl.current, A);
      place(destEl.current, B);
      renderer.render(scene, camera);
    };
    const loop = (now: number) => {
      if (!running) return;
      frame(now);
      raf = requestAnimationFrame(loop);
    };
    if (reducedMotion) {
      frame(0, true);
    } else {
      raf = requestAnimationFrame(loop);
    }

    // pause when off screen or in a background tab
    const io = new IntersectionObserver(([entry]) => {
      if (reducedMotion) return;
      const visible = entry.isIntersecting && !document.hidden;
      if (visible && !running) {
        running = true;
        raf = requestAnimationFrame(loop);
      } else if (!visible && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(el);
    const onVis = () => {
      if (reducedMotion) return;
      if (document.hidden && running) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!document.hidden && !running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      renderer.domElement.removeEventListener('pointerdown', down);
      renderer.domElement.removeEventListener('pointermove', move);
      renderer.domElement.removeEventListener('pointerup', up);
      renderer.domElement.removeEventListener('pointercancel', up);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
      });
      tex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
    // the globe is rebuilt only when the destination changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guide.slug, reducedMotion]);

  const chip = 'absolute left-0 top-0 pointer-events-none whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[12px] font-bold text-[var(--oxford-deep)] shadow-[0_6px_14px_-6px_rgba(0,33,71,0.45)] border border-[var(--line)] transition-opacity duration-200';
  return (
    <div ref={host} role="img" aria-label={ariaLabel} className="cg-globe relative w-full aspect-[5/4] sm:aspect-[16/11] select-none">
      <span ref={originEl} className={chip} style={{ opacity: 0 }}>{originLabel}</span>
      <span ref={destEl} className={chip} style={{ opacity: 0 }}>{destLabel}</span>
    </div>
  );
};

export default Globe3D;
