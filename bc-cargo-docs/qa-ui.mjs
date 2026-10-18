#!/usr/bin/env node
/**
 * qa-ui.mjs: objective UI QA for The BC Cargo & Courier.
 * Opens every public route in a real Chromium at phone and desktop sizes, in light and dark theme,
 * and reports things a human would call "weird": invisible text, text that wraps or breaks in the
 * wrong place, missing pointer cursor, missing hover feedback, tiny tap targets, sideways scroll.
 *
 * Setup (once):   npm i -D playwright   &&   npx playwright install chromium
 * Run:            npm run build && node server.js   (in another terminal; default port 3000)
 *                 node tools/qa-ui.mjs --base http://127.0.0.1:3000
 * Options:        --theme light|dark|both (default both)   --out qa-report   --max-links 3
 *                 --small (adds a 320px phone)   --only /,/rates (limit routes)
 * Exit code 1 if any HARD check fails. Screenshots + report.json + REPORT.md go to --out.
 * Env:            CHROMIUM_PATH=/path/to/chrome  (optional, to use an existing browser)
 */
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => {
  if (x.startsWith('--')) a.push([x.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return a;
}, []));
const BASE = (args.base || 'http://127.0.0.1:3000').replace(/\/$/, '');
const OUT = args.out || 'qa-report';
const THEMES = args.theme === 'light' ? ['light'] : args.theme === 'dark' ? ['dark'] : ['light', 'dark'];
const MAX_LINKS = parseInt(args['max-links'] || '3', 10);
const SMALL = args.small === 'true';
const ONLY = args.only ? args.only.split(',') : null;
const THEME_KEY = 'bc_cargo_theme';
const ROUTES = ['/', '/rates', '/services', '/about', '/careers', '/blogs', '/contact', '/faq', '/policies', '/track', '/book', '/login', '/admin/login', '/does-not-exist'];
const VPS = [
  ...(SMALL ? [{ name: 'm320', w: 320, h: 640, touch: true }] : []),
  { name: 'm360', w: 360, h: 800, touch: true },
  { name: 'm412', w: 412, h: 915, touch: true },
  { name: 'd1440', w: 1440, h: 900, touch: false },
];

let pw;
try { pw = await import('playwright'); } catch { pw = await import('playwright-core'); }
const { chromium } = pw.default?.chromium ? pw.default : pw;

// Helpers injected into every page
function installHelpers() {
  const cv = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const parse = (c) => { cv.clearRect(0, 0, 1, 1); cv.fillStyle = '#000'; cv.fillStyle = c; cv.fillRect(0, 0, 1, 1); const d = cv.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const lum = (r, g, b) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const la = lum(a[0], a[1], a[2]), lb = lum(b[0], b[1], b[2]); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
  const over = (t, b) => { const a = t[3]; return [t[0] * a + b[0] * (1 - a), t[1] * a + b[1] * (1 - a), t[2] * a + b[2] * (1 - a), 1]; };
  const effBg = (el) => { const layers = []; let n = el, unknown = false; while (n && n.nodeType === 1) { const cs = getComputedStyle(n); if (cs.backgroundImage && cs.backgroundImage !== 'none') unknown = true; const c = parse(cs.backgroundColor); if (c[3] > 0) layers.push(c); if (c[3] >= 1) break; n = n.parentElement; } let base = [255, 255, 255, 1]; for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base); return { bg: base, unknown }; };
  const vis = (el) => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; const cs = getComputedStyle(el); return !(cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0); };
  const sel = (el) => { let s = el.tagName.toLowerCase(); if (el.id) s += '#' + el.id; const c = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 3).join('.'); return c ? s + '.' + c : s; };
  window.__qa = { parse, ratio, over, effBg, vis, sel };
}

async function staticChecks(page, touch) {
  return page.evaluate((touch) => {
    const { parse, ratio, over, effBg, vis, sel } = window.__qa;
    const out = { overflowX: document.documentElement.scrollWidth > window.innerWidth + 1, invisible: [], lowContrast: [], midword: [], labelWrap: [], clipped: [], noPointer: [], smallTarget: [], undefinedVars: [], copyLabel: [], copyNav: [], copySentence: [], copyHeading: [] };
    const seen = new Set();
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
      const tn = w.currentNode; const txt = tn.textContent.trim(); if (!txt) continue;
      const el = tn.parentElement; if (!el || seen.has(el) || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName) || !vis(el)) continue;
      seen.add(el);
      const range = document.createRange(); range.selectNodeContents(tn);
      const rects = [...range.getClientRects()].filter((r) => r.width > 1);
      const lines = new Set(rects.map((r) => Math.round(r.top / 4))).size;
      const cs = getComputedStyle(el); const words = txt.split(/\s+/);
      if (txt.length >= 3 && lines > 1 && words.length === 1) out.midword.push({ s: sel(el), t: txt.slice(0, 40) });
      const ctl = el.closest('button,a,[role=button],[role=tab],label,th,[class*=badge],[class*=chip],[class*=tag]');
      if (ctl && txt.length <= 28 && lines > 1 && words.length <= 4) out.labelWrap.push({ s: sel(ctl), t: txt.slice(0, 40), lines });
      if (el.scrollWidth > el.clientWidth + 2 && ['hidden', 'clip'].includes(cs.overflowX) && cs.textOverflow !== 'ellipsis') out.clipped.push({ s: sel(el), t: txt.slice(0, 40) });
      const fg = parse(cs.color); const { bg, unknown } = effBg(el);
      if (!unknown) {
        const f = fg[3] < 1 ? over(fg, bg) : fg; const r = ratio(f, bg); const fs = parseFloat(cs.fontSize);
        const large = fs >= 24 || (fs >= 18.66 && parseInt(cs.fontWeight) >= 700);
        const item = { s: sel(el), t: txt.slice(0, 30), r: +r.toFixed(2), fg: cs.color, bg: `rgb(${bg.slice(0, 3).map(Math.round)})` };
        if (r < 2) out.invisible.push(item); else if (r < (large ? 3 : 4.5)) out.lowContrast.push(item);
      }
    }
    document.querySelectorAll('button,a[href],[role=button],[role=tab],summary,select,input[type=checkbox],input[type=radio],label[for]').forEach((el) => {
      if (!vis(el)) return; const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
      if (cs.cursor !== 'pointer' && !el.disabled && el.getAttribute('aria-disabled') !== 'true') out.noPointer.push({ s: sel(el), t: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30) });
      if (touch && (r.width < 40 || r.height < 40) && !el.closest('p,li,span') ) out.smallTarget.push({ s: sel(el), t: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24), w: Math.round(r.width), h: Math.round(r.height) });
    });

    // ---- copy limits (plain words, short labels)
    const wc = (t) => t.trim().split(/\s+/).filter(Boolean).length;
    document.querySelectorAll('header a, nav a, nav button').forEach((el) => {
      if (!vis(el)) return; const t = (el.textContent || '').trim(); if (t && t.length > 10 && !el.querySelector('img,svg+span+span')) out.copyNav.push({ s: sel(el), t: t.slice(0, 40) });
    });
    document.querySelectorAll('button,[role=tab],[role=button],a[class*=btn],a[class*=button]').forEach((el) => {
      if (!vis(el)) return; const r = el.getBoundingClientRect(); const t = (el.textContent || '').trim();
      if (!t || r.height > 90 || el.children.length > 4 || el.closest('header nav,nav')) return;
      if (wc(t) > 3 || t.length > 20) out.copyLabel.push({ s: sel(el), t: t.slice(0, 50) });
    });
    document.querySelectorAll('p, li, dd').forEach((el) => {
      if (!vis(el) || el.closest('nav,footer,script')) return; const t = (el.textContent || '').trim(); if (t.length < 30) return;
      const sentences = t.split(/(?<=[.!?])\s+/);
      const longest = Math.max(...sentences.map(wc));
      if (longest > 22) out.copySentence.push({ s: sel(el), t: `${longest} words: ` + t.slice(0, 50) });
      else if (el.tagName === 'P' && wc(t) > 70) out.copySentence.push({ s: sel(el), t: `${wc(t)}-word paragraph: ` + t.slice(0, 40) });
    });
    document.querySelectorAll('h1,h2').forEach((el) => { if (!vis(el)) return; const t = (el.textContent || '').trim(); if (wc(t) > 8) out.copyHeading.push({ s: sel(el), t: t.slice(0, 60) + ` (${wc(t)} words)` }); });
    // Elements whose background/colour came from a CSS variable that does not exist resolve to nothing.
    // Detect by scanning stylesheets for var(--x) where --x is not defined on :root/html.
    try {
      const rootCs = getComputedStyle(document.documentElement); const bad = new Set();
      for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch { continue; }
        const walk = (rs) => { for (const r of rs) { if (r.cssRules && !r.style) walk(r.cssRules); else if (r.cssText) { for (const m of r.cssText.matchAll(/var\((--[a-z0-9-]+)(?!\s*,)\s*\)/gi)) { if (!rootCs.getPropertyValue(m[1]).trim()) bad.add(m[1]); } } } };
        walk(rules); }
      out.undefinedVars = [...bad].slice(0, 30);
    } catch {}
    return out;
  }, touch);
}

async function hoverPass(page) {
  const n = await page.evaluate(() => {
    const items = [...document.querySelectorAll('button,a[href],[role=button],[role=tab],summary')].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 8 && r.height > 8 && window.__qa.vis(el); });
    const pick = []; const seen = new Set();
    for (const el of items) { const k = el.tagName + (el.textContent || '').trim().slice(0, 24) + (el.getAttribute('class') || '').slice(0, 30); if (seen.has(k)) continue; seen.add(k); pick.push(el); if (pick.length >= 40) break; }
    pick.forEach((el, i) => el.setAttribute('data-qa-i', i)); return pick.length;
  });
  const snap = (i) => page.evaluate((i) => {
    const el = document.querySelector(`[data-qa-i="${i}"]`); if (!el) return null; const cs = getComputedStyle(el); const { parse, ratio, over, effBg } = window.__qa;
    const { bg } = effBg(el); const fg = parse(cs.color); const f = fg[3] < 1 ? over(fg, bg) : fg;
    return { c: cs.color, bg: cs.backgroundColor, bc: cs.borderTopColor, sh: cs.boxShadow, tf: cs.transform, op: cs.opacity, ul: cs.textDecorationLine, r: +ratio(f, bg).toFixed(2), t: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 28), s: window.__qa.sel(el) };
  }, i);
  const noHover = [], hoverInvisible = [];
  for (let i = 0; i < n; i++) {
    const before = await snap(i); if (!before) continue;
    const loc = page.locator(`[data-qa-i="${i}"]`).first();
    try { await loc.scrollIntoViewIfNeeded({ timeout: 1500 }); await loc.hover({ timeout: 1500, force: true }); await page.waitForTimeout(450); } catch { continue; }
    const after = await snap(i); if (!after) continue;
    const same = ['c', 'bg', 'bc', 'sh', 'tf', 'op', 'ul'].every((k) => before[k] === after[k]);
    if (same) noHover.push({ s: before.s, t: before.t });
    if (after.r < 2.5) hoverInvisible.push({ s: after.s, t: after.t, r: after.r });
    await page.mouse.move(2, 2);
  }
  return { tested: n, noHover, hoverInvisible };
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
fs.mkdirSync(OUT, { recursive: true });
const report = { base: BASE, date: new Date().toISOString(), results: {} };

for (const theme of THEMES) for (const vp of VPS) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, hasTouch: vp.touch, isMobile: vp.touch, deviceScaleFactor: vp.touch ? 2 : 1 });
  await ctx.addInitScript(([k, t]) => { try { localStorage.setItem(k, t); } catch {} }, [THEME_KEY, theme]);
  await ctx.addInitScript(installHelpers);
  const page = await ctx.newPage(); const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)); });
  page.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e).slice(0, 140)));
  let routes = ONLY ? [...ONLY] : [...ROUTES];
  if (!ONLY) for (const list of ['/services', '/blogs', '/careers']) {
    try { await page.goto(BASE + list, { waitUntil: 'networkidle', timeout: 20000 });
      const links = await page.evaluate((p) => [...new Set([...document.querySelectorAll(`a[href^="${p}/"]`)].map((a) => a.getAttribute('href')))], list);
      routes.push(...links.slice(0, MAX_LINKS)); } catch {}
  }
  for (const r of routes) {
    errs.length = 0; const key = `${theme}/${vp.name}${r}`;
    try { await page.goto(BASE + r, { waitUntil: 'networkidle', timeout: 25000 }); } catch (e) { report.results[key] = { error: String(e).slice(0, 100) }; continue; }
    await page.waitForTimeout(1000);
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += Math.round(vp.h * 0.8)) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(100); }
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(250);
    const res = await staticChecks(page, vp.touch);
    res.console = [...new Set(errs)].filter((e) => !/favicon|ERR_NAME_NOT_RESOLVED|Turnstile|challenges\.cloudflare/i.test(e)).slice(0, 5);
    if (vp.name === 'd1440') res.hover = await hoverPass(page);
    const shot = path.join(OUT, `${theme}_${vp.name}${r.replace(/\//g, '_') || '_home'}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    report.results[key] = res;
  }
  await ctx.close();
}
await browser.close();

// ---- summarise
const HARD = ['overflowX', 'invisible', 'midword', 'labelWrap', 'noPointer', 'undefinedVars', 'console', 'hoverInvisible', 'noHover', 'copyNav', 'copyLabel', 'copySentence', 'copyHeading'];
const SOFT = ['lowContrast', 'clipped', 'smallTarget'];
const tally = {}; const sample = {};
const add = (cat, key, item) => { tally[cat] = (tally[cat] || 0) + 1; (sample[cat] ||= []).length < 12 && sample[cat].push(`${key}  ${item.s || ''}  ${item.t || ''}`.trim()); };
for (const [key, v] of Object.entries(report.results)) {
  if (v.error) { add('console', key, { t: 'LOAD ERROR ' + v.error }); continue; }
  if (v.overflowX) add('overflowX', key, { t: 'page scrolls sideways' });
  for (const c of [...HARD, ...SOFT]) { if (c === 'overflowX' || c === 'console' || c === 'hoverInvisible' || c === 'noHover') continue; for (const it of v[c] || []) add(c, key, it); }
  for (const e of v.console || []) add('console', key, { t: e });
  for (const it of v.hover?.hoverInvisible || []) add('hoverInvisible', key, it);
  for (const it of v.hover?.noHover || []) add('noHover', key, it);
}
const lines = [`# UI QA report`, ``, `Base: ${BASE}  |  ${report.date}  |  themes: ${THEMES.join(', ')}`, ``, `| Check | Type | Count |`, `|---|---|---|`];
for (const c of [...HARD, ...SOFT]) lines.push(`| ${c} | ${HARD.includes(c) ? 'HARD' : 'soft'} | ${tally[c] || 0} |`);
lines.push('', '## Samples (first 12 per check)');
for (const c of [...HARD, ...SOFT]) if (sample[c]) { lines.push('', `### ${c}`); sample[c].forEach((s) => lines.push('- ' + s)); }
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
fs.writeFileSync(path.join(OUT, 'REPORT.md'), lines.join('\n'));
console.log(lines.slice(0, 4 + HARD.length + SOFT.length + 2).join('\n'));
const failed = HARD.filter((c) => (tally[c] || 0) > 0);
console.log(failed.length ? `\nFAIL: ${failed.join(', ')} (see ${OUT}/REPORT.md)` : '\nPASS: all hard checks clean');
process.exit(failed.length ? 1 : 0);
