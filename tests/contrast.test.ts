import { describe, it, expect } from 'vitest';
import { CHECK_PAIRS, contrastRatio } from '../scripts/contrast-check';

describe('WCAG 2.2 AA Contrast Compliance', () => {
  for (const item of CHECK_PAIRS) {
    it(`validates ${item.theme.toUpperCase()} - ${item.name} >= ${item.minRatio}:1`, () => {
      const ratio = contrastRatio(item.fg, item.bg);
      expect(ratio).toBeGreaterThanOrEqual(item.minRatio);
    });
  }
});
