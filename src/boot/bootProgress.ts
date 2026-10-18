/**
 * Pure progress model for the full-screen BC Cargo boot loader.
 *
 * Progress is driven by real loading signals ("marks"), not a timer. Between
 * marks the display creeps slowly so a long wait never looks frozen, and once
 * every required mark is in it sprints to 100% so a fast page is never held up.
 */

export type BootStage = 'preparing' | 'loading' | 'transit' | 'network' | 'ready';

export type BootMark = 'app' | 'route' | 'fonts' | 'load';

export const BOOT_STAGES: readonly BootStage[] = ['preparing', 'loading', 'transit', 'network', 'ready'];

export const BOOT_STAGE_LABELS: Record<BootStage, string> = {
  preparing: 'Preparing',
  loading: 'Loading',
  transit: 'In Transit',
  network: 'Connecting to Network',
  ready: 'Ready',
};

/** Share of the journey each real signal is worth. `BASE` is "HTML received". */
export const BOOT_BASE = 0.08;
export const BOOT_MARK_WEIGHTS: Record<BootMark, number> = {
  app: 0.3, // app bundle executed and React committed
  route: 0.3, // the current route's code-split chunk resolved
  fonts: 0.2, // web fonts settled
  load: 0.12, // window load event (images etc.) - nice to have, not required
};

/** A page is usable once these are in. `load` is intentionally not required. */
export const BOOT_REQUIRED: readonly BootMark[] = ['app', 'route', 'fonts'];

/** Slow-state thresholds (ms). */
export const BOOT_SLOW_MS = 7000;
export const BOOT_RECOVERY_MS = 12000;
export const BOOT_GIVE_UP_MS = 25000;

export function isBootReady(done: ReadonlySet<BootMark>): boolean {
  return BOOT_REQUIRED.every((m) => done.has(m));
}

/** Progress the real signals justify, 0..1 (1 only when ready). */
export function milestoneProgress(done: ReadonlySet<BootMark>): number {
  if (isBootReady(done)) return 1;
  let p = BOOT_BASE;
  for (const mark of Object.keys(BOOT_MARK_WEIGHTS) as BootMark[]) {
    if (done.has(mark)) p += BOOT_MARK_WEIGHTS[mark];
  }
  return Math.min(p, 0.97);
}

/**
 * Advance the displayed progress by `dtMs`. Always monotonic.
 * - ready:      sprint to 1 (about 300ms)
 * - behind:     catch up to the real milestone quickly
 * - at/ahead:   creep slowly toward a small headroom above the milestone
 */
export function stepProgress(prev: number, target: number, dtMs: number, ready: boolean): number {
  const dt = Math.max(0, Math.min(dtMs, 250));
  let next: number;
  if (ready) {
    next = prev + (1 - prev) * (1 - Math.exp(-dt / 90));
    if (next > 0.995) next = 1;
  } else if (prev < target) {
    next = prev + (target - prev) * (1 - Math.exp(-dt / 180));
  } else {
    const goal = Math.min(target + 0.1, 0.96);
    next = prev + (goal - prev) * (1 - Math.exp(-dt / 2600));
  }
  return Math.max(prev, Math.min(next, 1));
}

export function stageForProgress(progress: number, ready: boolean): BootStage {
  if (ready && progress >= 1) return 'ready';
  if (progress < 0.2) return 'preparing';
  if (progress < 0.45) return 'loading';
  if (progress < 0.75) return 'transit';
  return 'network';
}

/** 0 = normal, 1 = "taking longer than expected", 2 = also show recovery actions. */
export function slowLevel(elapsedMs: number, failed: boolean): 0 | 1 | 2 {
  if (failed || elapsedMs >= BOOT_RECOVERY_MS) return 2;
  if (elapsedMs >= BOOT_SLOW_MS) return 1;
  return 0;
}

/** Errors that mean a code-split chunk will never arrive without a reload. */
export function isChunkLoadFailure(message: unknown): boolean {
  const text = typeof message === 'string' ? message : (message as { message?: string } | null)?.message ?? '';
  return /dynamically imported module|importing a module script failed|Loading chunk|Failed to fetch dynamically|error loading dynamically/i.test(
    text,
  );
}
