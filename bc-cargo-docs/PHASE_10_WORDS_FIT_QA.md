# Phase 10: Plain words, text that fits, short navigation, release QA

Goal: every label fits where it sits, every sentence is easy for anyone to understand, navigation is short, no claim on the site is untrue, and the whole site is verified by real browser checks.
Evidence: `docs/QA_FINDINGS.md` sections 3 and 6. Depends on Phases 8 and 9. Size: L.

## Part A: text that fits (no more "t / elegram")
Root causes found: all-caps, wide letter-spacing, mono or heavy fonts in narrow buttons and chips; labels allowed to wrap or break inside a word; fixed heights (`h-9`) on controls whose label wraps (the header "SIGN IN" and "BOOK PICKUP" buttons); phone numbers and short tags that break at hyphens.
- [ ] **10.1 Label rules (hard).** For buttons, tabs, chips, badges, nav items, table headers and form labels: `white-space: nowrap; overflow-wrap: normal; word-break: normal; hyphens: manual;`. Fix by **shortening the text, reducing size/letter-spacing, or changing the layout**, never by letting a word break. Letter-spacing on uppercase text <= 0.04em below 400px. Icon `shrink-0`, label `min-w-0`. Chip rows scroll sideways with scroll-snap on mobile instead of wrapping. Phone numbers and emails never break mid-token (`white-space: nowrap` for phones; email may truncate with a tooltip). Controls use `min-height`, not a fixed `height`.
- [ ] **10.2 Header.** At < 640px show icon-only Sign in (with `aria-label`); "Book" with icon at < 400px, "Book pickup" above. Neither may wrap. Check the logo, theme button, bottom nav (5 labels, 360px), "More" sheet, sticky contact buttons, chatbot launcher and sheet, footer links and socials.
- [ ] **10.3 Component sweep.** Review every component under `src/components/**`, `src/features/**` and `src/design/primitives/**` at 320, 360, 412, 768 and 1440 px in light and dark. Use the existing `DesignKitPage` with a stress mode (`?stress=1`) that feeds each component long labels, long names, big numbers, and Devanagari text. Fix at source (the primitive) so every use gets fixed.
- [ ] **10.4 Tool.** Extend `scripts/qa-ui.mjs` with the copy limits in Part B as hard checks and a 320px viewport (`--small`). Drive `midword`, `labelWrap`, `clipped` and `smallTarget` (min 40px) to **0**.

## Part B: plain words
- [ ] **10.5 Writing rules.** Write for a first-time sender who is not a logistics person, reads in a second language and is on a phone. Short words. Active voice. "You" and "we". One idea per sentence. Say what it costs, how long, what to do next.
  | Limit | Max |
  |---|---|
  | Sentence | 15 words on average, never above 22 |
  | Paragraph | 3 sentences; 45 words on cards, 70 on pages |
  | Page heading (H1) | 8 words; section heading 8 words; card title 40 characters |
  | Hero sub-text | 20 words |
  | Nav label | 10 characters |
  | Button / chip / tab / badge | 3 words, 20 characters |
  | Form label | 24 characters; helper text 90 characters; toast 80 characters |
  | Page title / meta description | 60 / 155 characters |
  Enforce with a test `tests/copy-limits.test.ts` for the strings that live in one place: move nav, buttons, chips, headings, hero and footer text into `src/content/copy.ts`, and add the rendered-text checks to `qa-ui.mjs`.
- [ ] **10.6 Word list.** Replace jargon unless it is explained next to it:
  | Instead of | Use |
  |---|---|
  | Waybill, AWB, consignment note | Tracking number |
  | Consignee / shipper | Receiver / sender |
  | Consignment | Shipment or parcel |
  | Linehaul, trunk | Main transport |
  | Custody, chain of custody | Handling |
  | Manifest | Cargo list |
  | Volumetric divisor, dimensional weight | Size-based weight (say it once, with a one-line example) |
  | HS code | Item code (explain once) |
  | Customs brokerage / clearance | Customs paperwork |
  | Telematics, EDI, interline, port-to-door | Delete or say it in plain words |
  | Corridor | Route |
- [ ] **10.7 Short navigation.** Header: **Home, Rates, Track, Services, Blog, About**, then a **More** menu with Contact, Careers, FAQ, Policies. Bottom bar stays Home, Rates, Track, Book, More. The More sheet uses one word each: Services, About, Contact, Blog, Careers, FAQ, Policies, Staff login. Footer uses the same words. Page H1s match the nav word.
- [ ] **10.8 Rewrite everything visible.** Home, Rates, Services (+ detail pages), About, Careers (+ detail), Blogs (list and the seed posts), Contact, FAQ, Policies, Booking, Track, Login, 404, error and empty states, toasts, form errors, chatbot greeting and canned replies, admin labels. Keep meaning, cut length. Error messages say what happened and what to do ("Enter a weight above 0.1 kg").
- [ ] **10.9 Remove claims we cannot prove.** The site currently says things the owner has not supplied evidence for or that the system cannot do. Remove or replace each one unless the owner supplies proof, and list what you removed in the report:
  - "99.4% on-time" and similar statistics; "190+ ports" typed in many places (show a number only if computed from the rates data)
  - "IATA Certified Packaging", airline partner names in service text (Qatar Airways, Emirates, Thai Cargo), "Direct air manifests with ..."
  - "real-time", "GPS-tracked", "telematics", "EDI Live Sync", "live waypoint scanning". Tracking is updated by staff; say "We update your tracking by hand" or "Staff update tracking", and match the Track page.
  - Any price, time or guarantee not coming from the database.
  Put the claims you removed into `docs/OWNER_TODO.md` ("claim, where it was, proof needed").

## Part C: final QA (release gate)
- [ ] **10.10 Automated.** `npm run typecheck && npm test && npm run build`, then `npm run qa:ui -- --small` in both themes: **every HARD check = 0**, soft checks reviewed and the remainder justified in `docs/qa/final.md`. Lighthouse mobile on `/`, `/rates`, `/services`, `/contact`: Performance >= 85, Accessibility >= 95, SEO >= 95; initial JS stays under the existing budget (`npm run budget`).
- [ ] **10.11 Manual.** On a real Android phone and a laptop: tab through header, estimator and booking with the keyboard (focus always visible); tap every bottom-nav item; open and close the More sheet, chatbot and dialogs; switch theme on three pages; resize a desktop browser from 1440 down to 320; run the estimator with a liquid, a meat item and a medicine; read three pages aloud and rewrite anything you stumble on.
- [ ] **10.12 Paperwork.** Update `CHANGELOG.md` (phases 8-10), `docs/AI_WORKLOG.md`, `docs/OWNER_TODO.md`, and put the final `REPORT.md` and screenshots under `docs/qa/`.

## Gate
All of 10.10 and 10.11 pass; the final report follows `AGENTS.md` section D and lists "Not verified" honestly.

## Exit criteria
No label wraps or breaks inside a word; copy within limits; navigation short and consistent; no unprovable claims on the site; hard QA checks 0 in both themes at 320, 360, 412, 768, 1440 px.
