# BC Cargo — Next Changes (Phases)

Put this file in the project at `docs/PHASES.md`.
Do one phase at a time. Finish it, test it, then go to the next.

---

## Facts the agent must know

- Main office is **Hetauda**. Not Kathmandu. Fix it everywhere.
- Main countries: **South Korea, Malaysia, UK, Japan, Europe**. Also Gulf, Hong Kong, USA, and others in the sheet.
- Backend is **Supabase** (already connected). Everything must really work, no fake data.
- Design stays **clay morphism**. Colors: golden yellow, oxford blue, white, black.
- Users: a 6 year old and a 60 year old must both understand it.

---

## Rate rules (read carefully)

**Step 1. Country.** User picks a country. Only countries found in the sheet are shown.

**Step 2. Weight.** User types total weight in kg.

**Step 3. Boxes.**
- One box = max 20 kg.
- Boxes = weight ÷ 20, rounded up. Example: 30 kg = 2 boxes (20 kg + 10 kg).
- Box charge = Rs 1,000 per box.

**Step 4. Base price, per box, from the sheet.**
- Box has 20 kg or more → use the `20_plus` rate × box kg.
- Box has 10 kg to 19.99 kg → use the `10_plus` rate × box kg.
- Box has less than 10 kg → round up to the next 0.5 kg, use the `standard` row price.

Check with the sample bill: UK, 30 kg = (20 × 700) + (10 × 950) = 14,000 + 9,500 = **23,500**. This matches the bill image. Good.

**Step 5. Extra items.**
- Liquid: Rs 600 (per box that has liquid. The sample bill shows 1,200 for 2 boxes).
- Medicine: Rs 600 (same rule as liquid).
- Meat: Rs 600 per kg for Europe and UK. Rs 1,100 per kg for Hong Kong. User types how many kg of meat.
- Meat for any other country: the meat button is **disabled**. If user taps it, show: "Meat is not available for this country."

**Step 6. Total** = base + box charge + liquid + medicine + meat. Nothing else. No fuel fee. No handling fee. No USD.

**Live prices.**
- Prices come from the Google Sheet every time. No hardcoded prices anywhere.
- If the sheet cannot load, show: "Price not available now. Please chat with us." Never show a made-up number.

---

## Phase 0 — Safety and cleanup

Goal: make the project safe before we change it.

1. Make a new git branch.
2. Read `AGENTS.md` and `CHANGELOG.md` first.
3. The zip has a `.env` file. Make sure `.env` is in `.gitignore`. If any key was ever shared or committed, change that key in Supabase.
4. Remove old hardcoded money rules in `src/features/estimator/constants.ts` and `engine.ts` (fuel 12%, handling Rs 250, USD rate, min charge, old meat/medicine fees).
5. Run build and tests. Write what passes and what fails.

Done when: build works, old fee rules are gone.

---

## Phase 1 — Live rates from Google Sheet (backend)

Goal: real prices, fetched live.

1. Sheet must be shared as "Anyone with the link can view". Use the sheet id `1fYp7W6Q9Ri50wLQudjBWhI8J_gVGaOM47UCKrEoxS5o`.
2. Make a Supabase Edge Function `rates`. It reads the sheet as CSV and returns clean JSON. Cache it for 60 seconds only.
3. Columns: `rate_group, display_name, supported_countries, weight_tier, weight_kg, price_npr, currency, active`. Skip rows where `active` is not TRUE.
4. Check the data. If a row is broken, skip that row and log it. Do not guess.
5. Save the last good copy in a Supabase table. If the sheet is down, use that copy and show "Updated at (time)".
6. Replace the old rate fetch in `src/services/ratesService.ts` and `useEstimatorData.ts` to call this function.
7. Write the calculation as pure functions in `engine.ts`. Add tests in `tests/`:
   - UK 30 kg, liquid + meat 1 kg → base 23,500, box 2,000, liquid 1,200 (or 600, see open question), meat 600.
   - Korea 3 kg → 3,550 + 1,000.
   - Meat on Korea → blocked.

Done when: change a price in the sheet, refresh, and the site shows the new price.

---

## Phase 2 — Easy estimator screen

Goal: anyone can use it.

Four big steps, one at a time:
1. **Country** — big flag cards. Top 5 first: South Korea, Malaysia, UK, Japan, Europe. Then "More".
2. **Weight** — big number box with + and − buttons. Show "2 boxes" live.
3. **Inside?** — three big toggles: Liquid, Meat, Medicine. Meat is greyed out when not available, and shows the "not available" message on tap. If Meat is on, ask "How many kg?".
4. **Price** — big total, small list below, button "Get bill" and button "Chat".

Rules for the screen:
- Text size at least 18px. Buttons at least 48px high.
- Words are short. Icons come with words.
- Show errors in simple words: "Please type weight."
- Works with keyboard and screen readers.

Done when: someone who never saw the site can get a price in under 30 seconds.

---

## Phase 3 — Bill (must be the same)

Goal: the bill looks exactly like the company bill.

1. Put the original bill HTML from your other project in `docs/bill-reference.html`. Put the bill image in `docs/bill-sample.png`.
2. Copy the HTML and CSS from the reference exactly. Same fonts, spacing, colors, logo, order of rows, text.
3. Only the data changes. Fields: Date, Receiving Country, Total Shipment Weight, Matched Rate Bracket, Pricing Method, Base Shipping Charge, Box Charge, Liquid Charges, Meat Charges, Total, warning note.
4. Total must always equal the lines above it.
5. Show Medicine row only when medicine is chosen.
6. Print and PDF work on 5×8 inch paper. Reuse `PrintableAwbModal.tsx` only if it helps.
7. Add a picture test: render the bill and compare with the sample.

Done when: bill and sample look the same side by side.

---

## Phase 4 — Hetauda, countries, and SEO

Goal: Google shows us for "cargo from Hetauda/Nepal to Korea" and similar.

1. Change Kathmandu to Hetauda in: `LandingPage.tsx`, `route-data.ts`, `RegionalHubsMap.tsx`, `HowItWorksTimeline.tsx`, `MiniEstimatorSlot.tsx`, `RouteTableHero.tsx`, `BookingSystem.tsx`, `PartnerSlider.tsx`, `FaqSection.tsx`, `ServicesSuite.tsx`, chatbot data.
2. Important: this app is a Vite single page app. Google is slow with these. Add **pre-rendering** (static HTML for each page) so Google reads the text.
3. Make one page per top country, each with its own title, text, FAQ, and live price example:
   - `/send-parcel-nepal-to-south-korea`
   - `/send-parcel-nepal-to-malaysia`
   - `/send-parcel-nepal-to-uk`
   - `/send-parcel-nepal-to-japan`
   - `/send-parcel-nepal-to-europe`
   - then Gulf, Hong Kong, USA, others
4. Each page also names Hetauda (example: "Cargo service from Hetauda to South Korea").
5. Add: sitemap.xml, robots.txt, canonical links, Open Graph, JSON-LD (LocalBusiness with Hetauda address, Service, FAQ).
6. Page speed: lazy-load 3D, compress images, use `font-display: swap`.

Done when: Lighthouse SEO is 95+ and each country page opens as real HTML with JavaScript off.

Note: no one can promise rank #1. The biggest extra help is a Google Business Profile for the Hetauda office and real reviews. Do that outside the code.

---

## Phase 5 — Globe update

Goal: globe shows our real plan.

File: `src/components/home/TacticalGlobe3D.tsx` and `route-data.ts`.

1. Origin pin is **Hetauda**.
2. Route lines go to the main countries first: South Korea, Malaysia, UK, Japan, Europe. Then Gulf and others.
3. Auto-rotate only moves between the country areas. It must not spin to the empty ocean side.
4. If the user drags, stop auto-rotate. After 5 seconds of no touch, ease back to the nearest country.
5. Quick select chips: South Korea, Malaysia, UK, Japan, Europe, Gulf, More. Tapping one turns the globe to it and shows a small panel: "From Hetauda to (country)", with a "Price" button.
6. Low-end phones: use a lighter globe. Respect reduced motion.

---

## Phase 6 — 3D look, scroll, and simple UI

Goal: feels 3D, still simple.

1. Keep clay morphism: soft shapes, soft shadows. Use `src/design/tokens.css`.
2. Add 3D tilt on cards (`Card3D`), 3D headline text, depth when scrolling (framer-motion `useScroll`).
3. Add 3D only where it helps: hero, country cards, cards, and section titles. Do not make everything 3D. It will slow the site and make text hard to read.
4. Mobile: simple effects. Desktop: full effects. Always respect "reduce motion".
5. **Buttons:** short words only, one icon from the same icon set (no emoji in buttons). Use: Price, Book, Chat, Call, Track, More, Send, Close, Back, Next.
6. **Feedback section:** show the top 3 feedback. A "More" button loads the rest from Supabase, 10 at a time. Admin can pick which 3 are top.
7. Check every page for broken text or emoji.

---

## Phase 7 — AI chat (always on, few rules)

Goal: AI answers everything, with a few simple rules instead of hardcoded answers.

1. Remove most of `src/data/chatbotData.ts`. Keep only contact details.
2. Make a Supabase Edge Function `chat`. The AI key stays on the server only.
3. Rules for the AI (keep it small):
   - Talk only about cargo, shipping, and BC Cargo.
   - Use short, easy words.
   - Prices come only from the live rates function. Never guess a price.
   - Say meat is only for Europe, UK, and Hong Kong.
   - If it does not know, send the user to WhatsApp.
   - Booking and tracking need a human: show WhatsApp button.
4. Add rate limits and the Turnstile check (already in the project) so nobody runs up the bill.
5. Admin can edit the rules in `AdminChatbotControl.tsx`.

---

## Phase 8 — Pinned buttons and cursor

1. `StickyContactButtons.tsx` is `lg:hidden` today. Remove that so PC also shows it.
2. Three pinned buttons: **Chat** (opens the AI chat), **WhatsApp**, **Location** (opens Google Maps for the Hetauda office).
3. On PC they sit on the right side. On Android they sit above the bottom bar. They must not cover the chat window or forms.
4. `CustomCursor.tsx`: change text every **6 seconds** (now 9000 ms → 6000 ms).

---

## Phase 9 — Final check

1. Run lint, build, and tests.
2. Test on Android Chrome, desktop Chrome, and slow 4G.
3. Test each country: price, boxes, meat lock, bill.
4. Test with the sheet offline: no fake numbers show.
5. Update `CHANGELOG.md`.

---

## Open questions (agent: do not guess, ask)

1. Liquid and medicine: Rs 600 per box, or per shipment?
2. "Europe" for meat: EU A, EU B, Malta, Cyprus. Is that right?
3. The sample bill lines add to Rs 27,300 but the total shows Rs 27,800. What is the missing Rs 500?
4. Under 10 kg the sheet is sometimes **more** than 10 kg. Example: UK 9.5 kg = Rs 12,100 but 10 kg = 950 × 10 = Rs 9,500. Charge the lower price?
5. Exact Google Maps link for the Hetauda office.
