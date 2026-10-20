import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  BOOT_GIVE_UP_MS,
  BOOT_RECOVERY_MS,
  BOOT_SLOW_MS,
  type BootMark,
  isBootReady,
  isChunkLoadFailure,
  milestoneProgress,
  slowLevel,
  stageForProgress,
  stepProgress,
} from '../src/boot/bootProgress';

const marks = (...m: BootMark[]) => new Set<BootMark>(m);

describe('boot loader progress model', () => {
  it('is ready only once app, route and fonts are in (window load is optional)', () => {
    expect(isBootReady(marks('app', 'route'))).toBe(false);
    expect(isBootReady(marks('app', 'route', 'fonts'))).toBe(true);
    expect(milestoneProgress(marks('app', 'route', 'fonts'))).toBe(1);
  });

  it('milestones only ever move forward as signals arrive', () => {
    const a = milestoneProgress(marks());
    const b = milestoneProgress(marks('app'));
    const c = milestoneProgress(marks('app', 'route'));
    const d = milestoneProgress(marks('app', 'route', 'load'));
    expect(a).toBeLessThan(b);
    expect(b).toBeLessThan(c);
    expect(c).toBeLessThan(d);
    expect(d).toBeLessThan(1);
  });

  it('is monotonic and never reaches 100% while waiting', () => {
    let p = 0;
    for (let i = 0; i < 4000; i++) {
      const next = stepProgress(p, milestoneProgress(marks('app')), 16, false);
      expect(next).toBeGreaterThanOrEqual(p);
      p = next;
    }
    expect(p).toBeLessThan(0.97);
  });

  it('keeps creeping while stalled so the journey never looks frozen', () => {
    const target = milestoneProgress(marks('app'));
    let p = target;
    const before = p;
    for (let i = 0; i < 120; i++) p = stepProgress(p, target, 16, false);
    expect(p).toBeGreaterThan(before);
  });

  it('sprints to 100% quickly once ready (no artificial delay)', () => {
    let p = 0.3;
    let frames = 0;
    while (p < 1 && frames < 200) {
      p = stepProgress(p, 1, 16, true);
      frames++;
    }
    expect(p).toBe(1);
    expect(frames * 16).toBeLessThan(900);
  });

  it('maps progress to the five stages in order', () => {
    expect(stageForProgress(0.05, false)).toBe('preparing');
    expect(stageForProgress(0.3, false)).toBe('loading');
    expect(stageForProgress(0.6, false)).toBe('transit');
    expect(stageForProgress(0.9, false)).toBe('network');
    expect(stageForProgress(0.99, true)).toBe('network');
    expect(stageForProgress(1, true)).toBe('ready');
  });

  it('escalates to the slow state, then recovery actions; failure goes straight to recovery', () => {
    expect(slowLevel(1000, false)).toBe(0);
    expect(slowLevel(BOOT_SLOW_MS, false)).toBe(1);
    expect(slowLevel(BOOT_RECOVERY_MS, false)).toBe(2);
    expect(slowLevel(300, true)).toBe(2);
    expect(BOOT_GIVE_UP_MS).toBeGreaterThan(BOOT_RECOVERY_MS);
  });

  it('recognises chunk-load failures', () => {
    expect(isChunkLoadFailure(new Error('Failed to fetch dynamically imported module: /assets/x.js'))).toBe(true);
    expect(isChunkLoadFailure('Loading chunk 12 failed')).toBe(true);
    expect(isChunkLoadFailure(new Error('Network request failed'))).toBe(false);
    expect(isChunkLoadFailure(undefined)).toBe(false);
  });
});

describe('boot loader markup', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

  it('keeps the exact root placeholder the prerender script replaces', () => {
    expect(html).toContain('<div id="root"></div>');
  });

  it('ships the overlay inline with all five stages and an accessible status', () => {
    expect(html).toContain('id="bc-boot"');
    for (const label of ['Preparing', 'Loading', 'In Transit', 'Connecting to Network', 'Ready']) {
      expect(html).toContain(`<b>${label}</b>`);
    }
    expect(html).toContain('role="status"');
    expect(html).toContain('Taking longer than expected');
    expect(html).toContain('prefers-reduced-motion');
  });

  it('hides the prerendered root while booting (no layout shift) and reveals it without JavaScript', () => {
    expect(html).toContain('<html lang="en" class="bc-booting">');
    expect(html).toContain('html.bc-booting #root{visibility:hidden');
  });

  it('is hidden without JavaScript and never animates layout properties', () => {
    expect(html).toContain('<noscript><style>#bc-boot{display:none!important}html.bc-booting #root{visibility:visible!important}</style></noscript>');
    const css = html.slice(html.indexOf('<style id="bc-boot-css">'), html.indexOf('</style>'));
    expect(css).not.toMatch(/transition:[^;}]*\b(width|height|top|left|margin)\b/);
  });
});
