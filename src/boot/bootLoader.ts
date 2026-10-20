/**
 * Drives the #bc-boot overlay that index.html paints before any JavaScript loads.
 *
 * index.html owns the markup and CSS (so it shows instantly and animates with no
 * JS at all). This module only reports real loading progress to it by setting
 * `data-stage` / `--bc-p` / `data-slow`, then removes it once the page is usable.
 *
 * Nothing here ever blocks the site: a fast page removes the overlay before it
 * has faded in, and a hard timeout removes it no matter what.
 */
import {
  BOOT_GIVE_UP_MS,
  BOOT_STAGE_LABELS,
  type BootMark,
  type BootStage,
  isBootReady,
  isChunkLoadFailure,
  milestoneProgress,
  slowLevel,
  stageForProgress,
  stepProgress,
} from './bootProgress';

const FONT_CAP_MS = 3000; // web fonts must never hold the page hostage
const HOLD_READY_MS = 140; // let "Ready" register, only when the loader is visible
const LEAVE_MS = 380; // keep in sync with .is-leaving in index.html

const done = new Set<BootMark>();
let root: HTMLElement | null = null;
let started = 0;
let progress = 0;
let lastFrame = 0;
let lastTickAt = 0;
let frames = 0;
let lastWritten = -1;
let stage: BootStage = 'preparing';
let slow: 0 | 1 | 2 = 0;
let failed = false;
let finished = false;
let rafId = 0;

/** True once the overlay has had a chance to be seen (the browser has painted at least once). */
function visible(): boolean {
  if (!root) return false;
  return frames > 1 || performance.getEntriesByType('paint').length > 0;
}

function teardown() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  root?.remove();
  document.getElementById('bc-boot-css')?.remove();
  root = null;
}

function finish(force = false) {
  if (finished || !root) return;
  finished = true;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  // Nobody is looking (background tab): just release the page.
  if (document.hidden) return teardown();
  const painted = visible();
  root.dataset.stage = 'ready';
  root.style.setProperty('--bc-p', '1');
  setStatus('ready');

  let left = false;
  const leave = () => {
    if (left) return;
    left = true;
    root?.classList.add('is-leaving');
    window.setTimeout(teardown, LEAVE_MS);
  };
  if (painted) {
    window.setTimeout(leave, force ? 0 : HOLD_READY_MS);
  } else {
    // Fast page (cached assets): let the overlay paint once so the first paint is branded and there is
    // no blank flash, then fade straight out with no hold. The timer is a backstop if frames stall.
    requestAnimationFrame(() => requestAnimationFrame(leave));
    window.setTimeout(leave, 160);
  }
}

function setStatus(next: BootStage) {
  stage = next;
  if (!root) return;
  root.dataset.stage = next;
  const sr = root.querySelector('#bc-boot-sr');
  if (sr) sr.textContent = BOOT_STAGE_LABELS[next];
}

function tick(now: number) {
  if (!root || finished) return;
  lastTickAt = performance.now();
  frames++;
  const dt = lastFrame ? now - lastFrame : 16;
  lastFrame = now;

  const ready = isBootReady(done);
  // Fast page (cached assets): ready before anything painted. Drop the overlay, never flash it.
  if (ready && !visible()) return finish(true);
  progress = stepProgress(progress, milestoneProgress(done), dt, ready);

  if (Math.abs(progress - lastWritten) > 0.002 || progress === 1) {
    lastWritten = progress;
    root.style.setProperty('--bc-p', progress.toFixed(3));
  }

  const nextStage = stageForProgress(progress, ready);
  if (nextStage !== stage) setStatus(nextStage);

  const elapsed = performance.now() - started;
  const level = slowLevel(elapsed, failed);
  if (level !== slow) {
    slow = level;
    root.dataset.slow = String(level);
  }

  if (ready && progress >= 1) {
    return finish();
  }
  if (elapsed > BOOT_GIVE_UP_MS) return finish(true);

  rafId = requestAnimationFrame(tick);
}

/** Report a real loading signal. Safe to call any time, any number of times. */
export function markBoot(mark: BootMark) {
  if (done.has(mark)) return;
  done.add(mark);
  // A background tab does not run rAF; make sure it still gets released.
  if (document.hidden && isBootReady(done)) finish(true);
}

function fail() {
  failed = true;
  if (root) root.dataset.slow = '2';
}

function init() {
  root = document.getElementById('bc-boot');
  if (!root) return;
  started = performance.now();

  root.querySelector('[data-boot-reload]')?.addEventListener('click', () => window.location.reload());
  root.querySelector('[data-boot-continue]')?.addEventListener('click', () => finish(true));

  // Real signals that are not React's.
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => markBoot('fonts'), () => markBoot('fonts'));
  } else {
    markBoot('fonts');
  }
  window.setTimeout(() => {
    if (done.has('app') && done.has('route')) markBoot('fonts');
  }, FONT_CAP_MS);
  window.setTimeout(() => markBoot('fonts'), FONT_CAP_MS * 2);

  if (document.readyState === 'complete') markBoot('load');
  else window.addEventListener('load', () => markBoot('load'), { once: true });

  // Recovery: a chunk that 404s or fails to import will never resolve on its own.
  window.addEventListener('vite:preloadError', fail);
  window.addEventListener('unhandledrejection', (e) => {
    if (isChunkLoadFailure((e as PromiseRejectionEvent).reason)) fail();
  });
  window.addEventListener('visibilitychange', () => {
    if (!document.hidden && !rafId && !finished) rafId = requestAnimationFrame(tick);
  });

  lastTickAt = performance.now();
  rafId = requestAnimationFrame(tick);
  watchdog();
}

/**
 * Timer-based backstop. If animation frames stall (throttled or occluded window,
 * battery saver) the loader must still be released, never left covering the page.
 */
function watchdog() {
  if (finished || !root) return;
  const elapsed = performance.now() - started;
  if (elapsed > BOOT_GIVE_UP_MS || (isBootReady(done) && performance.now() - lastTickAt > 800)) {
    finish(true);
    return;
  }
  window.setTimeout(watchdog, 400);
}

if (typeof document !== 'undefined') init();
