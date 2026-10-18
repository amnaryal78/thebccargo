# Owner Action Items & Claim Verification Backlog

This document tracks marketing claims, performance statistics, and partner claims that were removed during the Phase 10 brand-integrity audit because they could not be substantiated from the live database or codebase.

To restore any of these claims to the live application, please provide the required evidence documented below.

---

## Removed Unsubstantiated Claims

### 1. "99.4% Verified On-Time Manifest Rate"
- **Where it was:** Home Page (`LandingPage.tsx`) operational metrics strip.
- **Current replacement:** "Daily Export Dispatch from Nepal".
- **Proof needed to restore:** Verified operational delivery logs or audit certificate proving actual on-time performance calculation over at least 6 months.

### 2. "190+ International Ports & Territories"
- **Where it was:** Home Page (`LandingPage.tsx`), `AboutPage.tsx`, `PartnerSlider.tsx`, `RatesPage.tsx`, and `chatbotData.ts`.
- **Current replacement:** "Worldwide Air, Road & Sea Routes".
- **Proof needed to restore:** Official partner routing matrix or database records in Supabase `international_rates` showing active rates/lanes to all 190+ sovereign countries or destination ports.

### 3. "GPS-Tracked Fleet Trucks" / "Real-Time Telematics Logs"
- **Where it was:** `src/services/serviceService.ts`, `AboutPage.tsx`, `ContactPage.tsx`, `chatbotData.ts`.
- **Current replacement:** "Scheduled Fleet Linehaul" and "Staff-updated milestone checkpoints".
- **Proof needed to restore:** Live telematics API integration (e.g. AIS/GPS webhook feed) piping active coordinates into the tracking database.

### 4. Domestic Nepal Rates and Hub-to-Hub Delivery
- **Where it was:** Rates page, Estimator, Services catalog, Booking form, Chatbot.
- **Status:** Entire application transformed to **International-Cargo-Only** per client mandate. Domestic Nepal delivery is restricted to local Kathmandu & Hetauda export doorstep pickup (+NPR 500 origin fee) for shipments leaving Nepal.
- **Database preservation note:** The Supabase table `national_rates` remains dormant and was NOT dropped.
