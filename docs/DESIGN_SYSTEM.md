# DESIGN_SYSTEM (truth = `src/design/tokens.css`)
- Brand: Oxford `--ox-900 #002147`, Gold `--gd-500 #F2B705`; scales ox/gd/ink (+ rd for errors only). Semantic: `--bg --surface --surface-2 --text --text-muted --brand --accent --on-accent --danger --focus-ring`. Dark mode = `.dark` class ("Oxford night": brand flips to gold). Gold text on light uses `--gd-700 #8C6400`.
- Type: Archivo Variable (display), Public Sans Variable (body), JetBrains Mono (data). Fluid `--fs-h1..h3`, body >= 1rem.
- Claymorphism: radii `--r-xs 4 / sm 12 / md 18 / lg 24 / pill`; surfaces = inset top-left highlight + inset bottom-right shade + soft outer shadow (`--clay-*`, `--shadow-hard-*` names are clay stacks); `--clay-inset` for inputs; `--shadow-press` for active. No gradients.
- Motion: 120/240/480ms, `--ease-out`; honour prefers-reduced-motion. Spotlight (`components/ui/spotlight.tsx`, tokens `--spotlight-*`), `Card3D`, `CustomCursor` (6s prompt cycle), three.js globe (`RouteTable3D`) with 2D fallback gated by `lib/device-capability.ts`.
- Primitives: `src/design/primitives/*` (preferred) vs legacy `src/components/ui/*` (duplicated Button/Card/Card3D — consolidate carefully). Kit page: `/_kit`.
- Checks: `scripts/check-css-vars.mjs`, `scripts/contrast-check.ts`, tests css-vars/contrast.
