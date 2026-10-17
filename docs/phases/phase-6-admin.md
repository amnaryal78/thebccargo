# Phase 6 — Admin repair and redesign

**Read:** 00_AUDIT §3, 01_PRD §5.9, 02_DESIGN §7 (Admin).

## Tasks
1. Split `AdminDashboardPage.tsx` (1,812 lines) into `features/admin/*`. One folder per tab, each tab is a route (`/admin/shipments`, `/admin/inquiries`, …), and shared layout and guards live in `shell/`. No file over ~400 lines.
2. **Dead-tab fix:** using the Phase 0 report, every nav item must render real content. Remove any that cannot.
3. **Single source of truth:** remove localStorage as initial data for inquiries, shipments and cursor messages. Supabase only, with loading, empty and error states, optimistic updates and rollback on failure.
4. New or completed modules:
   - Shipments: create, edit, quick-add milestone, print AWB (keep `PrintableAwbModal`), POD upload.
   - Inquiries: status workflow, filters, assign, and a reply template.
   - **Handling rules editor** (Phase 3 table), with a visible "placeholder" flag.
   - Rates editor for national and international, with **CSV import and preview**.
   - Blogs (keep the AI fixer), Careers and applicants, Users and roles, Settings (`site_settings`, `rate_settings`), and an Audit log viewer.
5. Restyle on the Phase 1 tokens (Oxford sidebar, paper content, dense tables with sticky headers). **Mobile:** the sidebar becomes a bottom tab bar, tables collapse to cards, and actions open in a bottom sheet.
6. Role-aware UI (hide what a role can't do) **and** matching RLS policies. Add Vitest or SQL tests for the anon and `read_only` roles.
7. Auth: confirm there is no mock path, MFA enrol and verify work against real Supabase, and session expiry returns the user to login with their route preserved.
8. Remove the `CustomCursor` and decorative motion from admin.

## Done when
No admin tab is dead, no stale-data glitch (edit in one browser, refresh in another), a role matrix is tested, and a 360px admin is usable for the common tasks (update milestone, reply to inquiry).
