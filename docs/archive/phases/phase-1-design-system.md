# Phase 1 — Design system and shell

**Goal:** the new visual foundation, with no gradients and no old blue. Public shell (header, footer, bottom nav) rebuilt.
**Read:** 02_DESIGN (all).

## Tasks
1. `src/design/tokens.css`: the colour scales, semantic tokens (light and dark), spacing, radius (0/4/8), motion tokens and the hard-shadow utilities. Wire them into Tailwind 4 `@theme`.
2. Self-host fonts (Archivo, Public Sans, JetBrains Mono) with fontsource. Remove the Google Fonts `<link>`s from `index.html`. Preload only the used files.
3. `scripts/contrast-check.ts`: validate every text/background pair. Adjust the scale steps until all pass AA. Commit the passing output.
4. Build the primitives list from DESIGN §6 (Button, Input, Select/combobox, Toggle, Tabs, Accordion, Chip, Card, BottomSheet, Modal, Toast, Skeleton, EmptyState, Counter, Timeline, Stepper). Add a hidden `/_kit` route (noindex, dev only) that shows them all in light and dark.
5. Redraw the logo (flat, two-colour). Create the custom icon set for air, road, sea, customs, and a tear-line / barcode / stamp motif.
6. New Header (desktop), Android bottom nav, Footer (Oxford band, no gradient social icons), sticky Call and WhatsApp buttons. Keep `CustomCursor` and `MagneticButton` only on `(hover:hover) and (pointer:fine)`, and restyle them to the tokens.
7. Global sweep: remove **every** gradient, every `#0B5ED7`-family colour, and the pulsing-dot patterns.

## Verify
- `grep -rniE "gradient|#0B5ED7|#2F80ED|#60A5FA|#38BDF8" src` returns nothing (an exception is allowed only inside 3D shaders, if any, with a comment).
- Screenshot `/_kit` at 360px and 1440px, in light and dark.

## Done when
`/_kit` is clean and accessible, the shell works on mobile and desktop, and the contrast check passes.
