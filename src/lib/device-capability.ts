/**
 * Device capability detection for adaptive 2D / 3D rendering.
 * Gating rules (01_PRD §6):
 * 1. Screen / pointer: min-width: 1024px and pointer: fine (desktop viewports)
 * 2. User preference: prefers-reduced-motion is NOT reduce
 * 3. Network: navigator.connection.saveData is NOT true
 * 4. Hardware: navigator.hardwareConcurrency >= 6 (if reported)
 * 5. Graphics: WebGL2 context is available
 */

export interface DeviceCapabilityOptions {
  windowObj?: Window;
  navigatorObj?: Navigator;
}

export function hasWebGL2Support(customWindow?: Window): boolean {
  try {
    const win = customWindow || (typeof window !== 'undefined' ? window : undefined);
    if (!win || !win.document) return false;
    const canvas = win.document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    return Boolean(gl);
  } catch {
    return false;
  }
}

export function canRender3D(options?: DeviceCapabilityOptions): boolean {
  const win = options?.windowObj || (typeof window !== 'undefined' ? window : undefined);
  const nav = options?.navigatorObj || (typeof navigator !== 'undefined' ? navigator : undefined);

  if (!win || !nav) {
    return false;
  }

  // 1. Desktop viewport & fine precision pointer check
  if (typeof win.matchMedia === 'function') {
    const isDesktopPointer = win.matchMedia('(min-width: 1024px) and (pointer: fine)').matches;
    if (!isDesktopPointer) return false;

    // 2. Reduced motion preference
    const prefersReducedMotion = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return false;
  } else {
    return false;
  }

  // 3. Data saver check
  const connection = (nav as unknown as { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) {
    return false;
  }

  // 4. Hardware concurrency check (>= 6 cores recommended for smooth 60fps 3D)
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency > 0) {
    if (nav.hardwareConcurrency < 6) {
      return false;
    }
  }

  // 5. WebGL2 availability check
  if (!hasWebGL2Support(win)) {
    return false;
  }

  return true;
}
