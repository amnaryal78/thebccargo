import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 8 — Pinned Buttons & Cursor Rotation', () => {
  const stickyPath = path.resolve(__dirname, '../src/components/StickyContactButtons.tsx');
  const cursorPath = path.resolve(__dirname, '../src/components/CustomCursor.tsx');

  const stickyContent = fs.readFileSync(stickyPath, 'utf8');
  const cursorContent = fs.readFileSync(cursorPath, 'utf8');

  it('ensures StickyContactButtons is visible on PC (lg:hidden removed)', () => {
    expect(stickyContent.includes('lg:hidden')).toBe(false);
    expect(stickyContent.includes('fixed')).toBe(true);
    expect(stickyContent.includes('bottom-20')).toBe(true);
    expect(stickyContent.includes('lg:bottom-10')).toBe(true);
  });

  it('contains all 3 required pinned buttons: Chat, WhatsApp, and Location', () => {
    // 1. Chat
    expect(stickyContent).toContain('Chat');
    expect(stickyContent).toContain('bc-cargo-ai-chatbot');

    // 2. WhatsApp
    expect(stickyContent).toContain('WhatsApp');
    expect(stickyContent).toContain('wa.me/9779855019485');

    // 3. Location (Google Maps for Hetauda HQ)
    expect(stickyContent).toContain('Location');
    expect(stickyContent).toContain('maps.app.goo.gl/pYyv4DPf69xwDV9J7');
  });

  it('rotates CustomCursor messages every 6 seconds (6000ms)', () => {
    expect(cursorContent).toContain('6000');
    expect(cursorContent.includes('9000')).toBe(false);
  });
});
