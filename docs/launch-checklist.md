# The BC Cargo & Courier — Production Launch Checklist

> [!CAUTION]
> **LAUNCH BLOCKER:** Production launch is officially **BLOCKED** until the business owner reviews and confirms the regulatory handling rules, surcharges, and country-specific prohibitions marked with `[PLACEHOLDER]`.

---

## 1. Regulatory & Cargo Handling Rules (OWNER CONFIRMATION REQUIRED)

The following handling rules and fee formulas are currently deployed with the `[PLACEHOLDER]` flag in PostgreSQL table `public.handling_rules`. They must be formally signed off or revised according to current Civil Aviation Authority of Nepal (CAAN) and destination customs decrees:

| Cargo Class | Flag | Scope | Current Setting | Legal / Operational Source Required | Status |
|---|---|---|---|---|---|
| **Liquid / Flammables** | `liquid` | Global | Allowed with **+15% surcharge** on base freight. Requires leak-proof sealed container & MSDS sheet. | IATA Dangerous Goods Regulations (DGR) Cat 3 & airline acceptance matrix. | ⚠️ `[PLACEHOLDER]` |
| **Meat & Foodstuffs** | `meat` | General | Allowed with **NPR 1,000 flat surcharge**. Factory-sealed, cured, non-perishable only. | Nepal Quarantine Department phyto-sanitary certificate requirement. | ⚠️ `[PLACEHOLDER]` |
| **Meat & Foodstuffs** | `meat` | **USA (Air)** | **PROHIBITED** (`allowed: false`). | USDA Animal and Plant Health Inspection Service (APHIS) import restriction. | ⚠️ `[PLACEHOLDER]` |
| **Pharmaceuticals** | `medicine` | International | Allowed with **NPR 500 flat surcharge**. Doctor prescription & pharmacy tax invoice required. | Department of Drug Administration (DDA) export clearance rules. | ⚠️ `[PLACEHOLDER]` |
| **Pharmaceuticals** | `medicine` | National Overland | Allowed with **NPR 150 flat surcharge**. Medical prescription copy attached to consignment. | Domestic narcotics & controlled substance transit guideline. | ⚠️ `[PLACEHOLDER]` |

**Owner Action Required:**
- [ ] Confirm or replace surcharge rates (% vs flat NPR).
- [ ] Approve prohibited commodities per corridor (e.g. animal products to US/EU).
- [ ] Toggle `is_placeholder = false` in `/admin/handling-rules` once verified.

---

## 2. Business Identity, Contact Details & Operational Hubs

Verify the accuracy of all corporate contact metadata across the public website and legal disclosures:

| Item | Current Production Code Value | Owner Verification / Real Value | Status |
|---|---|---|---|
| **Corporate Legal Name** | The BC Cargo & Courier Pvt. Ltd. | Official registration certificate name | ⬜ Pending |
| **Company Reg Number** | `REG-2080-BC-0912` | Company Registrar Office (CRO) Number | ⬜ Pending |
| **PAN / VAT Number** | `PAN: 601234567` | Inland Revenue Department (IRD) PAN | ⬜ Pending |
| **IATA Agent Code** | `IATA-NP-90214` | IATA / CAAN Cargo Agent Accreditation Number | ⬜ Pending |
| **Primary Hotline** | `+977-057-520000` | Real central reception landline | ⬜ Pending |
| **Direct Ops Mobile** | `+977-9855012345` | Official duty operations officer mobile | ⬜ Pending |
| **Official WhatsApp** | `+977-9855012345` | Dedicated business WhatsApp account | ⬜ Pending |
| **General Inquiries Email**| `info@thebccargo.com` | Verified Zoho / Google Workspace inbox | ⬜ Pending |
| **Operations Email** | `ops@thebccargo.com` | Verified dispatch and customs desk inbox | ⬜ Pending |
| **Central HQ Address** | Kantirajpath-4, Hetauda, Makwanpur, Bagmati Province | Physical premises confirmation | ⬜ Pending |
| **TIA Hub Address** | Cargo Terminal Building, Gate 3, TIA, Sinamangal, Kathmandu | Air freight cargo warehouse bay | ⬜ Pending |
| **Birgunj ICD Address** | Sirsiya Dry Port Road, Birgunj-22, Parsa | Overland container terminal desk | ⬜ Pending |
| **Pokhara Hub Address** | Prithvi Chowk, Pokhara-9, Kaski, Gandaki Province | Regional branch desk | ⬜ Pending |
| **Opening Hours** | Mon–Sat: 08:00 – 19:00 NPT (Emergency customs 24/7) | Working hours schedule | ⬜ Pending |

---

## 3. Brand Assets & Photography

| Asset | Location | Requirement | Status |
|---|---|---|---|
| **Master Logo** | `src/components/BcLogo.tsx` | Owner to provide official master vector SVG (clean flat vectors without legacy gradients). | ⬜ Pending Owner File |
| **Hub Photos** | `/about`, `/services` | Replace vector placeholders with real high-resolution photographs of Hetauda HQ, TIA air cargo ramp, and Birgunj ICD. | ⬜ Pending Real Photos |
| **Fleet Photos** | `/services`, `/about` | Photos of dedicated BC Cargo container trucks, delivery vans, and customs handlers. | ⬜ Pending Real Photos |
| **Team Leadership** | `/about` | Real portrait photographs and bios of the Managing Director and Head of Operations (stock avatars forbidden). | ⬜ Pending Real Photos |

---

## 4. Production Security & Infrastructure Verification (COMPLETED BY AGENT)

- [x] **Zero Secrets in Repository or Bundle:** Verified via automated scan; `dist/` contains 0 private keys, tokens, or `service_role` credentials.
- [x] **Environment Isolation:** `.dockerignore` excludes `.env` and `.env.*`; multi-stage `Dockerfile` runs as non-root `USER node` and never copies `.env`.
- [x] **Production Security Headers:** Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Content-Type-Options, Permissions-Policy, Referrer-Policy active in `server.js`.
- [x] **API Rate Limiter:** 60 requests/minute sliding window per client IP enforced on all `/api/*` and AI proxy endpoints.
- [x] **Role-Based Access Control:** `super_admin`, `admin`, `operations`, `editor`, `support`, and `read_only` strictly enforced in `/admin/*` and backed by unit tests.
- [x] **Database Single Source of Truth:** Live connection verified against Supabase PostgreSQL `https://xtipmcthdyyubohspjro.supabase.co`.
- [x] **PWA & Offline Capability:** Web App Manifest and Service Worker pre-caching registered; custom Claymorphic `offline.html` deployed.
- [x] **SEO Prerendering:** All 26 public routes prerendered to static HTML with unique meta tags and schema markup.
- [x] **Mobile Performance Budget:** Initial JavaScript bundle is **51.88 KB gzip**, beating the $\le 170\text{ KB}$ performance target by $3.2\times$.
