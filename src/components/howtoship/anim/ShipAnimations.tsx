import React, { useEffect, useMemo, useRef } from 'react';
import './ship-anim.css';
import { ArtItem, BANNED_ART, BRING_MARKUP, PACK_MARKUP, RULES_ART, SEND_ART } from './art';

/**
 * Small looping illustrations for the How to Ship steps. Each one drives its own DOM with
 * timers (no React state, so nothing re-renders), runs only while it is on screen and the
 * tab is visible, and is purely decorative: the step's text list below says the same thing.
 * The markup is static and comes from ./art, never from user input.
 */

type Cleanup = () => void;

/** Calls start() while the element is in view and the tab is visible, stop() otherwise. */
function whileVisible(el: Element, start: () => void, stop: () => void): Cleanup {
  let inView = false;
  const sync = () => (inView && !document.hidden ? start() : stop());
  const io =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          ([entry]) => {
            inView = entry.isIntersecting;
            sync();
          },
          { threshold: 0.2 }
        )
      : null;
  if (io) io.observe(el);
  else {
    inView = true;
    sync();
  }
  document.addEventListener('visibilitychange', sync);
  return () => {
    io?.disconnect();
    document.removeEventListener('visibilitychange', sync);
    stop();
  };
}

function timerBag() {
  let ids: number[] = [];
  return {
    later(fn: () => void, ms: number) {
      ids.push(window.setTimeout(fn, ms));
    },
    clear() {
      ids.forEach(clearTimeout);
      ids = [];
    },
  };
}

/* ---------- carousel (send / rules / banned) ---------- */

const INFO_ICON =
  '<svg viewBox="0 0 16 16"><circle cx="8" cy="4" r="1.5" fill="#0B2D63"/><path d="M8 7.5v5" stroke="#0B2D63" stroke-width="2.2" stroke-linecap="round"/></svg>';
const BAN_SIGN =
  '<svg class="ban" viewBox="0 0 120 120"><circle class="halo" cx="60" cy="60" r="54"/><path class="halo" d="M22 22L98 98"/><circle class="no-ring" cx="60" cy="60" r="54" transform="rotate(-90 60 60)"/><path class="slash" d="M22 22L98 98"/></svg>';
const WARN_DOT =
  '<div class="warn"><svg viewBox="0 0 12 12"><path d="M6 1.5v5.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="6" cy="10" r="1.2" fill="#fff"/></svg></div>';

type Variant = 'send' | 'rules' | 'banned';

const itemHtml = (v: Variant, d: ArtItem): string => {
  if (v === 'rules') {
    return `<div class="item"><div class="art">${d.a}<div class="badge">${INFO_ICON}</div><div class="cue">${d.c ?? ''}</div></div><div class="name">${d.n}</div><div class="tag"><b></b>${d.t ?? ''}</div></div>`;
  }
  if (v === 'banned') {
    return `<div class="item"><div class="art"><div class="fl">${d.a}</div>${BAN_SIGN}${WARN_DOT}</div><div class="name">${d.n}</div><div class="tag"><b></b>Cannot be shipped</div></div>`;
  }
  return `<div class="item"><div class="art">${d.a}</div><div class="name">${d.n}</div><div class="tag">${d.t ?? ''}</div></div>`;
};

const HOLD: Record<Variant, number> = { send: 2600, rules: 2800, banned: 3100 };
const OUT = 600;

const Carousel: React.FC<{ variant: Variant; items: ArtItem[] }> = ({ variant, items }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const html = useMemo(() => items.map((d) => itemHtml(variant, d)).join(''), [variant, items]);
  const dotsHtml = useMemo(() => '<i></i>'.repeat(items.length), [items.length]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>('.item'));
    const dots = Array.from(root.querySelectorAll<HTMLElement>('.sa-dots i'));
    const t = timerBag();
    let cur = -1;
    let running = false;

    const show = (i: number) => {
      const prev = cur >= 0 ? els[cur] : null;
      const next = els[i];
      if (prev) {
        prev.classList.remove('in');
        prev.classList.add('out');
        t.later(() => prev.classList.remove('out'), OUT);
      }
      // the next item starts as the previous one finishes leaving: no blank frame, no overlap
      t.later(() => {
        next.classList.add('in');
        dots.forEach((d, k) => d.classList.toggle('on', k === i));
      }, prev ? OUT - 120 : 0);
      cur = i;
    };
    const tick = () => {
      show((cur + 1) % els.length);
      t.later(tick, HOLD[variant] + OUT + 900);
    };

    return whileVisible(
      root,
      () => {
        if (running) return;
        running = true;
        tick();
      },
      () => {
        running = false;
        t.clear();
        els.forEach((e) => e.classList.remove('out'));
      }
    );
  }, [variant, html]);

  return (
    <div ref={rootRef} className={`sa sa-car sa-${variant}`} aria-hidden="true">
      <div className="sa-stage">
        <div className="sa-orbit" />
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <div className="sa-dots" dangerouslySetInnerHTML={{ __html: dotsHtml }} />
    </div>
  );
};

/* ---------- what to bring ---------- */

const BringAnim: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scenes = Array.from(root.querySelectorAll<HTMLElement>('.bcb-scene'));
    const t = timerBag();
    const SCENE_HOLD = 3100;
    const LEAVE = 460;
    let i = 0;
    let running = false;

    const enter = (n: number) => {
      const s = scenes[n];
      s.classList.remove('leaving');
      void s.offsetWidth; // restart the inner animations cleanly
      s.classList.add('active');
      t.later(() => leave(n), SCENE_HOLD);
    };
    const leave = (n: number) => {
      const s = scenes[n];
      s.classList.remove('active');
      s.classList.add('leaving');
      t.later(() => {
        s.classList.remove('leaving');
        i = (n + 1) % scenes.length;
        enter(i);
      }, LEAVE);
    };

    return whileVisible(
      root,
      () => {
        if (running) return;
        running = true;
        enter(i);
      },
      () => {
        running = false;
        t.clear();
        scenes.forEach((s) => s.classList.remove('active', 'leaving'));
      }
    );
  }, []);

  return (
    <div ref={rootRef} className="sa sa-bring" aria-hidden="true">
      <div className="sa-stage bcb-stage" dangerouslySetInnerHTML={{ __html: BRING_MARKUP }} />
    </div>
  );
};

/* ---------- how to pack ---------- */

const PACK_LABELS = ['Use a sturdy box', 'Place items inside', 'Add padding', 'Close the box', 'Seal with tape', 'Attach the label'];
const PACK_AT = [0, 2600, 5200, 7800, 10400, 13000];
const PACK_END = 16100;
const PACK_STATES = ['s-open', 's-item', 's-pad', 's-taped', 's-label'];

const PackAnim: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = (k: string) => root.querySelector<SVGElement>(`[data-k="${k}"]`)!;
    const parcel = q('bcp-parcel');
    const flapB = q('bcp-flapB');
    const inner2 = q('bcp-inner2');
    const face = q('bcp-face');
    const ui = root.querySelector<HTMLElement>('.bcp-ui')!;
    const text = root.querySelector<HTMLElement>('.bcp-text')!;
    const segs = Array.from(root.querySelectorAll<HTMLElement>('.bcp-bar i'));
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const t = timerBag();
    let running = false;

    // The back flap sits behind the contents while open and moves in front of them to close.
    const backAbove = () => face.parentNode!.insertBefore(flapB, face);
    const backBelow = () => inner2.parentNode!.insertBefore(flapB, inner2.nextSibling);

    const setLabel = (i: number) => {
      text.classList.add('out');
      t.later(() => {
        text.textContent = PACK_LABELS[i];
        text.classList.remove('out');
      }, 280);
    };
    const progress = (i: number) => {
      const dur = (PACK_AT[i + 1] ?? PACK_END) - PACK_AT[i];
      segs.forEach((s, k) => {
        s.classList.toggle('done', k < i);
        s.classList.toggle('act', k === i);
        if (k === i) s.style.setProperty('--dur', `${dur}ms`);
      });
    };
    const act = (i: number) => {
      if (i === 0) root.classList.add('s-open');
      if (i === 1) root.classList.add('s-item');
      if (i === 2) root.classList.add('s-pad');
      if (i === 3) {
        backAbove();
        root.classList.remove('s-open');
      }
      if (i === 4) root.classList.add('s-taped');
      if (i === 5) root.classList.add('s-label');
    };
    const step = (i: number) => {
      setLabel(i);
      progress(i);
      if (mq.matches) {
        // reduced motion: fade between finished steps instead of animating them
        if (i === 0) return act(0);
        parcel.style.opacity = '0';
        t.later(() => {
          act(i);
          parcel.style.opacity = '';
        }, 360);
      } else {
        t.later(() => act(i), i === 0 ? 900 : 350);
      }
    };
    const reset = () => {
      root.classList.add('noanim');
      PACK_STATES.forEach((c) => root.classList.remove(c));
      backBelow();
      segs.forEach((s) => s.classList.remove('act', 'done'));
      parcel.classList.remove('leaving');
      parcel.classList.add('is-hidden');
      parcel.style.opacity = '';
      ui.classList.remove('leaving');
      ui.classList.add('is-hidden');
      text.classList.remove('out');
      text.textContent = PACK_LABELS[0];
      void root.offsetWidth;
      root.classList.remove('noanim');
    };
    const cycle = () => {
      t.clear();
      reset();
      t.later(() => {
        parcel.classList.remove('is-hidden');
        ui.classList.remove('is-hidden');
      }, 40);
      PACK_AT.forEach((at, i) => t.later(() => step(i), 40 + at));
      t.later(() => {
        parcel.classList.add('leaving');
        ui.classList.add('leaving');
        t.later(cycle, 650);
      }, 40 + PACK_END);
    };

    return whileVisible(
      root,
      () => {
        if (running) return;
        running = true;
        cycle();
      },
      () => {
        running = false;
        t.clear();
        reset();
      }
    );
  }, []);

  return (
    <div ref={rootRef} className="sa sa-pack" aria-hidden="true">
      <div className="sa-stage">
        <svg className="bcp-art" viewBox="0 0 320 232" dangerouslySetInnerHTML={{ __html: PACK_MARKUP }} />
        <div className="bcp-ui is-hidden">
          <div className="bcp-label">
            <span className="bcp-text">{PACK_LABELS[0]}</span>
          </div>
          <div className="bcp-bar">
            {PACK_LABELS.map((l) => (
              <i key={l} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export type AnimKind = 'send' | 'rules' | 'banned' | 'bring' | 'pack';

export const ShipStepAnimation: React.FC<{ kind: AnimKind }> = ({ kind }) => {
  switch (kind) {
    case 'send':
      return <Carousel variant="send" items={SEND_ART} />;
    case 'rules':
      return <Carousel variant="rules" items={RULES_ART} />;
    case 'banned':
      return <Carousel variant="banned" items={BANNED_ART} />;
    case 'bring':
      return <BringAnim />;
    case 'pack':
      return <PackAnim />;
  }
};
