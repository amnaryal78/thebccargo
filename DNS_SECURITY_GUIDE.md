# DNS & TLS Security Configuration Guide

This guide provides step-by-step instructions for completing domain-level cybersecurity configurations at your domain registrar/DNS provider (e.g., Cloudflare, Namecheap, GoDaddy, Route 53) and hosting platforms (Netlify & Render).

---

## 1. How to Enable DNSSEC (Domain Name System Security Extensions)

DNSSEC protects your domain against DNS spoofing and cache poisoning by digitally signing DNS records.

### Step-by-Step Instructions:
1. Log in to your domain registrar or DNS management console (e.g., Cloudflare, Namecheap, GoDaddy).
2. Locate the **DNS Settings** or **DNSSEC Management** section for `thebccargo.com`.
3. Click **Enable DNSSEC** (or "Activate DNSSEC").
4. If your DNS is managed separately from your registrar (e.g., domain on Namecheap, DNS on Cloudflare):
   - Copy the generated **DS Record** details (Key Tag, Algorithm, Digest Type, and Digest Value).
   - Go to your domain registrar's panel, find **Advanced DNS / Custom DS Records**, and paste the DS record values.
5. Save changes and verify activation using a public DNSSEC analyzer (e.g., `dnsviz.net` or `dnssec-analyzer.verisignlabs.com`).

---

## 2. How to Add a CAA (Certification Authority Authorization) Record

A CAA record specifies which Certificate Authorities (CAs) are allowed to issue SSL/TLS certificates for your domain, preventing unauthorized certificate issuance.

### Step-by-Step Instructions:
1. Open your DNS provider's record editor for `thebccargo.com`.
2. Add a new DNS record with the following parameters:

| Field / Property | Value | Notes |
| :--- | :--- | :--- |
| **Type** | `CAA` | Certification Authority Authorization |
| **Name / Host** | `@` (or `thebccargo.com`) | Target root domain |
| **Flag** | `0` | Standard non-critical flag |
| **Tag** | `issue` | Grants authorization to issue certificates |
| **Value / CA** | `"letsencrypt.org"` | Allows Let's Encrypt (used by Netlify / Render) |
| **TTL** | `Auto` or `3600` | 1 Hour |

3. *(Optional)* Add a second CAA record for DigiCert / Sectigo if your platform uses multiple fallback CAs:
   - **Tag**: `issue` | **Value**: `"digicert.com"`
4. Save the record and verify using `dig CAA thebccargo.com`.

---

## 3. How to Set Up a DMARC Policy TXT Record

DMARC (Domain-based Message Authentication, Reporting, and Conformance) protects your domain from email spoofing and phishing attacks.

### Step-by-Step Instructions:
1. Open your DNS provider's record editor for `thebccargo.com`.
2. Add a new `TXT` record with the following parameters:

| Field / Property | Value |
| :--- | :--- |
| **Type** | `TXT` |
| **Name / Host** | `_dmarc` (or `_dmarc.thebccargo.com`) |
| **TTL** | `Auto` or `3600` |
| **TXT Value / Content** | `v=DMARC1; p=reject; rua=mailto:dmarc-reports@thebccargo.com; ruf=mailto:dmarc-reports@thebccargo.com; pct=100; sp=reject;` |

### Breakdown of Policy Directives:
- `v=DMARC1;`: Identifies the protocol version.
- `p=reject;`: Instructs receiving mail servers to **reject** any emails that fail SPF/DKIM authentication.
- `rua=mailto:...`: Aggregate feedback reporting email address.
- `ruf=mailto:...`: Forensic failure reporting email address.
- `pct=100;`: Applies policy to 100% of messages.
- `sp=reject;`: Applies strict policy to all subdomains.

---

## 4. Explanation & Mitigation: "Weak Cipher Suites Supported in TLS 1.2"

### Why this vulnerability is flagged:
Automated scanners flag TLS 1.2 cipher suites that support legacy CBC-mode or RSA key exchange ciphers if enabled at the edge network layer.

### Where TLS & Cipher Suites are Managed:
- Web application code cannot modify TLS cipher suites directly when hosted behind edge platforms like **Netlify** or **Render**.
- TLS termination occurs at the hosting platform's **Edge Load Balancers & Cloud CDN Edge Nodes** before requests reach Express.

### How to Ensure Strict TLS Enforcement:

1. **Netlify Edge Configuration**:
   - Netlify automatically enforces **TLS 1.2 and TLS 1.3** across all endpoints with automated Let's Encrypt SSL certificates.
   - Netlify manages cipher suite rotation at the CDN edge layer.

2. **Render Backend Configuration**:
   - Render handles TLS termination at their load balancer layer and enforces modern TLS standards.

3. **Cloudflare Proxying (Recommended for Total Cipher Control)**:
   - If using Cloudflare for DNS/CDN:
     - Navigate to **SSL/TLS -> Edge Certificates**.
     - Set **Minimum TLS Version** to `1.2` or `1.3`.
     - Enable **TLS 1.3** and **Automatic HTTPS Rewrites**.
     - Turn on **HTTP Strict Transport Security (HSTS)** settings under Cloudflare SSL/TLS configuration.
