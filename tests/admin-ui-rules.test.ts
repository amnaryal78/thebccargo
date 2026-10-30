import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(n) ? [p] : [];
  });
const admin = [...files('src/features/admin'), ...files('src/pages/admin')];

describe('admin screens', () => {
  it('never use browser alert/confirm/prompt (they use the styled dialogs)', () => {
    const bad = admin.filter((f) => /(^|[^.\w])(window\.)?(alert|confirm|prompt)\(/.test(readFileSync(f, 'utf8').replace(/await confirm\(/g, '')));
    expect(bad).toEqual([]);
  });

  it('every table has a phone layout: stack-table, or cards shown below md', () => {
    const bad = admin.filter((f) => {
      const s = readFileSync(f, 'utf8');
      return /<table/.test(s) && !/stack-table/.test(s) && !/md:hidden/.test(s) && !/SheetRatesGrid|ShipmentEditorPage|billing\/print/.test(f.replace(/\\/g, '/'));
    });
    expect(bad).toEqual([]);
  });
});
