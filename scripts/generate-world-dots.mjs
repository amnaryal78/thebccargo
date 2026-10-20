/**
 * Regenerates src/assets/world-dots.svg, the static dotted world map used by the 2D route table.
 * Run once after changing the grid; the site itself ships no map library.
 *   node scripts/generate-world-dots.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import DottedMap from 'dotted-map';

const here = path.dirname(fileURLToPath(import.meta.url));
const map = new DottedMap({ height: 80, grid: 'diagonal' });
const d = map
  .getPoints()
  .map((p) => `M${+p.x.toFixed(2)} ${+p.y.toFixed(2)}h0`)
  .join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 158 80"><path d="${d}" fill="none" stroke="#002147" stroke-width="0.44" stroke-linecap="round"/></svg>`;
fs.writeFileSync(path.join(here, '../src/assets/world-dots.svg'), svg);
console.log(`world-dots.svg written (${svg.length} bytes)`);
