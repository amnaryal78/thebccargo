import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('Phase 8 — CSS Variable Token Integrity', () => {
  it('asserts that every var(--x) used in src/ is explicitly defined in tokens.css or index.css', () => {
    const definedVars = new Set<string>();

    const extractDefinedVars = (filePath: string) => {
      if (!fs.existsSync(filePath)) return;
      const content = fs.readFileSync(filePath, 'utf8');
      const matches = content.matchAll(/--([a-zA-Z0-9_-]+)\s*:/g);
      for (const match of matches) {
        definedVars.add(`--${match[1]}`);
      }
    };

    extractDefinedVars(path.join(projectRoot, 'src', 'design', 'tokens.css'));
    extractDefinedVars(path.join(projectRoot, 'src', 'index.css'));

    expect(definedVars.size).toBeGreaterThan(50);
    expect(definedVars.has('--oxford-deep')).toBe(true);
    expect(definedVars.has('--gold')).toBe(true);
    expect(definedVars.has('--surface-muted')).toBe(true);
    expect(definedVars.has('--text-secondary')).toBe(true);

    const missingUsages: Array<{ file: string; varName: string }> = [];
    const srcDir = path.join(projectRoot, 'src');

    const scanFile = (filePath: string) => {
      const content = fs.readFileSync(filePath, 'utf8');
      const varMatches = content.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)(\s*,\s*[^)]+)?\s*\)/g);
      for (const match of varMatches) {
        const varName = match[1];
        const hasFallback = Boolean(match[2]);
        if (!definedVars.has(varName) && !hasFallback) {
          missingUsages.push({
            file: path.relative(projectRoot, filePath),
            varName,
          });
        }
      }
    };

    const traverseDir = (dir: string) => {
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          traverseDir(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.css')) {
          scanFile(fullPath);
        }
      }
    };

    traverseDir(srcDir);

    expect(missingUsages, `Found undefined CSS variables: ${JSON.stringify(missingUsages)}`).toEqual([]);
  });
});
