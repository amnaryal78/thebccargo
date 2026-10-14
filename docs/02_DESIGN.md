# 02 — DESIGN SYSTEM

Visual identity: **industrial, confident, trustworthy, like a freight company's signage and paperwork, not a SaaS landing page.**
Reference feel: shipping labels, waybills, hazard and handling marks, port signage, and Oxford-blue uniforms with golden-yellow safety gear.

## 1. Colour (flat only)

Brand anchors: **Oxford Blue `#002147`**, **Golden Yellow `#F2B705`**, white, black. Every UI colour is a *step on a flat scale*. The scales are the "shades" you asked for.

```css
:root {
  /* OXFORD BLUE */
  --ox-50:#EEF3F9; --ox-100:#D6E1EF; --ox-200:#AEC3DE; --ox-300:#7F9DC4; --ox-400:#4F76A8;
  --ox-500:#2F5A8F; --ox-600:#1D4577; --ox-700:#123562; --ox-800:#082A52; --ox-900:#002147; --ox-950:#00152D;
  /* GOLDEN YELLOW */
  --gd-50:#FFF9E0; --gd-100:#FFF0B3; --gd-200:#FFE380; --gd-300:#FFD54D; --gd-400:#FAC623;
  --gd-500:#F2B705; --gd-600:#CC9704; --gd-700:#A07503; --gd-800:#735402; --gd-900:#4A3601;
  /* INK (black / neutral, slightly warm) */
  --ink-0:#FFFFFF; --ink-50:#F6F6F4; --ink-100:#ECEBE7; --ink-200:#D9D8D2; --ink-300:#B9B8B0; --ink-400:#8E8D86;
  --ink-500:#6A6963; --ink-600:#4B4A46; --ink-700:#33322F; --ink-800:#1F1E1C; --ink-900:#121211; --ink-950:#0A0A09;
  /* SIGNAL RED: sparing */
  --rd-100:#F8DAD7; --rd-500:#C8372D; --rd-600:#A82A22;
}
```
> The hex values are starting points. **Run a contrast script and adjust the steps** so every text and background pair below passes WCAG AA (4.5:1 body, 3:1 large text and UI).

### Semantic tokens (components use only these)
| Token | Light | Dark ("Oxford night") |
|---|---|---|
| `--bg` | ink-50 | ox-950 |
| `--surface` | ink-0 | ox-900 |
| `--surface-2` | ink-100 | ox-800 |
| `--text` | ink-900 | ink-50 |
| `--text-muted` | ink-600 | ox-200 |
| `--line` | ink-200 | ox-700 |
| `--brand` | ox-900 | gd-500 |
| `--on-brand` | ink-0 | ox-950 |
| `--accent` | gd-500 | gd-400 |
| `--accent-text` (gold used as text) | **gd-700 on light only** | gd-400 |
| `--danger` | rd-500 | rd-500 |
| `--focus` | ox-500 ring + 2px gap | gd-400 ring |

### Colour rules
- **Ratio:** about 60% neutral (paper / white / ink), 25% Oxford Blue (bands, nav, footer, hero), 12% gold (CTAs, active states, one highlight per section), 3% red.
- **Red** only for destructive actions, errors, and "restricted/prohibited" item states in the estimator. Nowhere else.
- **Gold is never body text on white.** Gold is a fill with Oxford or black text on it, or a thin underline or marker.
- **Banned:** gradients (CSS, SVG, Tailwind `bg-gradient-*`, gradient text, gradient borders), blur-glow blobs, glassmorphism, neon glows, any blue outside the Oxford scale (`#0B5ED7`, `#2F80ED`, `#60A5FA`, `#38BDF8` must be removed), and any green other than a tiny status dot in admin.
- **Depth without gradients:** layered flat planes, 1–2px solid borders, and **hard offset shadows** (`box-shadow: 4px 4px 0 var(--ox-900)`) on key cards and buttons. No soft blurry drop shadows.
- Dark mode is kept (the 913 `dark:` variants prove it is wired), but **rebuilt on the semantic tokens**. Light is the default.

## 2. Typography
| Role | Font | Notes |
|---|---|---|
| Display / headings | **Archivo** (variable, use the `wdth` axis: semi-expanded for H1/H2, normal for H3+) | Signage-like. Weights 600–800. |
| Body / UI | **Public Sans** | Highly legible on small Android screens. 400/500/600. |
| Data (AWB numbers, prices, weights) | **JetBrains Mono** | Only for numbers and codes, never for labels. |

- **Self-host** via `@fontsource-variable/*`. Remove the Google Fonts links. Use `font-display: swap`, preload only the two used files, and subset to Latin. Plan for Devanagari later.
- Fluid scale: `--fs-h1: clamp(2rem, 1.2rem + 3.6vw, 4.25rem)`, `--fs-h2: clamp(1.625rem, 1.1rem + 2vw, 2.75rem)`, `--fs-body: 1rem` (**never below 16px on mobile**), `--fs-small: .875rem`.
- Line height 1.1 for H1/H2, 1.5 for body. Tracking is normal, with a slight negative only on display sizes. Max measure 68ch.
- Sentence case. **No ALL-CAPS micro-labels and no mono eyebrow text.**

## 3. Anti-template rules (acceptance criteria)
A reviewer will reject a screen that has any of these:
1. Centered "pill badge → giant H1 → grey subtitle → input card" hero.
2. Pulsing green dots, "Live" labels, or ping animations on anything not actually live.
3. Identical 3-up icon cards with a title and two lines of text, repeated section after section.
4. Rounded-2xl on everything. Use a **radius scale of 0 / 4 / 8 px**. Signage and labels are crisp. Pills are allowed only for filter chips.
5. Lucide icon-in-a-tinted-square as the only visual device. Use the custom icon set (§6) and real or illustrated imagery.
6. Emoji as icons.
7. Placeholder-only form fields, lorem ipsum, "Welcome to…", "Seamless/Unlock/Elevate/Revolutionize" copy.
8. Every section the same height, the same padding, centered, on the same background.
9. Stock photos on About. If real photos are missing, use an honest illustrated or typographic treatment.

**What to do instead:** asymmetric grids; oversized numbers and codes as graphic elements; a waybill/label motif (dashed tear lines, barcode strips, stamp marks, corner registration ticks); full-bleed Oxford bands alternating with paper; real data and real copy; and copy written in the voice of a logistics operator (specific, short, no hype).

## 4. Layout and spacing
- 4-pt base. Space scale: 4 8 12 16 24 32 48 64 96 128.
- Grid: 4 columns mobile (16px gutter), 8 tablet, 12 desktop (max 1280, wide 1440 for hero).
- Section padding: 64px mobile / 112px desktop. **Vary rhythm.** Alternate dense and airy sections.
- Mobile: single column, thumb-zone actions at the bottom, sticky bottom nav (56px + safe-area inset), a 48px minimum row height for tappable items, and no horizontal scroll except deliberate swipe carousels with a visible peek.

## 5. Motion and 3D

### Motion tokens
`--t-fast:120ms  --t-med:240ms  --t-slow:480ms  --ease-out:cubic-bezier(.2,.8,.2,1)  --ease-io:cubic-bezier(.65,0,.35,1)`
Animate only `transform` and `opacity`. Honour `prefers-reduced-motion` globally (replace motion with instant state changes). **No motion should block input.**

### 3D (desktop-advanced, mobile-light)
| Element | Desktop (WebGL) | Android / fallback |
|---|---|---|
| Hero globe | three.js globe built from dots, arcs between Kathmandu/Hetauda and destinations, drag to rotate, click a destination for a panel | 2D dotted map (SVG/canvas), tap for a bottom sheet |
| Hero object | Low-poly parcel / air-cargo container that opens to reveal service icons on scroll | CSS 3D transforms on a flat-coloured box, pointer or device-tilt parallax (optional) |
| Section art | Isometric truck → plane → ship scroll story (GLB, ≤ 400 KB each, Draco-compressed) | The same story as 3 flat SVG illustrations that cross-fade |
| Cards | Pointer-tilt (max 6°) with a hard-shadow shift | No tilt. Tap feedback = translate 2px |

- **3D art style:** flat-shaded low-poly in palette colours only (Oxford, gold, ink, white, a red accent on one detail). Real lighting on 3D models is fine (that is shading, not a UI gradient). **Do not use gradient textures or env-map rainbow reflections.**
- Scroll: Lenis smooth scroll and GSAP ScrollTrigger for pinned scenes, **desktop only**. Mobile uses native scroll with IntersectionObserver reveals. Never hijack scroll on touch.
- Budget: 3D chunk lazy-loaded after first paint, ≤ 250 KB gz plus models, dispose geometries on unmount, cap DPR at 1.75, and pause the render loop when off-screen or the tab is hidden.

## 6. Components (build once, reuse everywhere)
Button (primary gold / secondary Oxford / ghost, hard-shadow press state), Link, Input, Select (searchable combobox for countries), Toggle, Checkbox, Stepper, Tabs, Accordion, Chip, Card (flat and "waybill" variants), Table → card collapse, Bottom sheet, Modal, Toast, Tooltip, Skeleton, EmptyState, Counter (animated number), Timeline, Map panel, Section header (title + optional marker), Stat block, Breadcrumb, Pagination.
Icon set: use **one** consistent set at 1.75px stroke (e.g. Phosphor or Tabler) to replace lucide where it hurts the identity, plus custom SVG marks for air / road / sea / customs.
Logo: redraw `BcLogo` as a flat two-colour (Oxford + gold) SVG, with **no gradients**.

## 7. Page-level notes
- **Home:** hero is a full-bleed Oxford plane with the 3D globe at right (desktop) or the map above the fold (mobile). The headline sits left and is aligned left. Gold marker underline on one word.
- **Rates:** looks like a physical **waybill form**: a dashed border, a field-box grid, and the total printed in mono on a gold "stamp". Restricted-item warnings use red and a hazard-stripe edge.
- **Services:** alternating image/diagram rows. The comparison table sticks its header.
- **About / Careers / Blogs / Contact:** use the same section system, with the section header, grid, band rhythm and components above. No page invents its own layout language.
- **Admin:** Oxford sidebar (collapses to a bottom tab bar on mobile), paper content area, dense tables with sticky headers, 36px rows (48px on touch), gold only for the primary action and the active nav item, red for destructive actions. No 3D, no cursor effects, and minimal motion.

## 8. Accessibility
Visible focus ring on every interactive element, label every input, error text linked via `aria-describedby`, colour never the only signal, 44px targets, a skip link, landmarks, keyboard-operable map and globe alternatives (a list of destinations), and a reduced-motion pass on every animated component.
