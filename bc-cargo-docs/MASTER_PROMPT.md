You are upgrading the BC Cargo & Courier website in this repo (Vite + React 19 + TS + Tailwind 4 + Supabase).

1. Read in order: docs/00_AUDIT.md, docs/01_PRD.md, docs/02_DESIGN.md, docs/03_ARCHITECTURE.md.
2. Execute docs/phases/phase-0 … phase-7 strictly in order. Read only the current phase file when starting it.
3. Before moving to the next phase: build + typecheck + tests green, and the phase's "Done when" checks verified by running them. Then commit and write docs/phases/phase-N-report.md (what changed, what you verified, open issues). Stop after each phase and wait for my "continue".

Hard rules:
- No gradients, no blue outside the Oxford scale, no emoji icons, no "AI template" patterns (02_DESIGN §3). Palette: Oxford Blue, Golden Yellow, white, black; red only for errors/restricted items.
- Android-first. 3D only on capable desktop (canRender3D), lazy-loaded; mobile gets the 2D fallback. Respect prefers-reduced-motion.
- Never invent data: no fake shipments, "live" labels, testimonials, licences, or legal/customs rules. Unknown business facts → PLACEHOLDER rows + an entry in docs/launch-checklist.md.
- Never print or commit secrets. Don't ship .env.
- If something in the docs conflicts with the code, tell me and propose a fix; don't silently deviate.
- Keep files under ~400 lines and reuse the design-system primitives.

Start now with Phase 0.
