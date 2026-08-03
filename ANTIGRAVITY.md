---
project_name: "BC Cargo Web App Refactoring"
tech_stack:
  - HTML5
  - CSS3 (Custom Properties & Design Tokens)
  - Vanilla JS (ES6+)
  - GSAP / ScrollTrigger
architecture: "Static Multi-Page App (MPA)"
---

# Project Context: BC Cargo Refactoring

## Primary Goal
Refactor the single-file monolithic `index.html` into a clean, modular Multi-Page Application (MPA) while preserving all styling, CSS variables, dark/light theme switching, and GSAP animations.

## Architectural Rules
1. **Separation of Concerns**:
   - Extraction target for styles: `css/style.css`
   - Extraction target for scripts: `js/main.js`
2. **Page Splits**:
   - `index.html`: Hero slider, Tracking input widget, Stats counter, Country Flags marquee.
   - `services.html`: Dedicated Services grid view.
   - `about.html`: Dedicated About/Map view + Client Testimonials.
   - `contact.html`: Dedicated Contact info & Social links.
3. **Navigation & Links**:
   - Replace anchor hashes (`/#about`, `/#services`) with clean multi-page paths (`about.html`, `services.html`, etc.).
   - Tracking link on subpages MUST target `index.html#tracking`.
4. **Design Preservation**:
   - NEVER alter CSS token names (`--orange`, `--navy`, etc.).
   - Do NOT modify element IDs or class names used by GSAP triggers (`data-animate`, `.service-card`, `.stat-number`).
5. **Clean Up**:
   - Remove the `PROTECTION: Disable Right Click & Shortcuts` IIFE block completely.