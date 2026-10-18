/**
 * CI Bundle Budget Check (PRD §6 & ARCHITECTURE §6)
 * Target: Initial mobile JS budget <= 170 KB gzip.
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

const BUDGET_KB_GZIP = 170; // 170 KB gzip target per PRD §6

function checkBudget() {
  const indexHtmlPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('[BUDGET] dist/index.html not found. Run "npm run build" first.');
    process.exit(1);
  }

  const html = fs.readFileSync(indexHtmlPath, 'utf8');

  // Match initial script tags: <script type="module" crossorigin src="/assets/index-*.js"></script>
  const scriptRegex = /src="(\/assets\/[^"]+\.js)"/g;
  let match;
  const initialScripts = [];

  while ((match = scriptRegex.exec(html)) !== null) {
    initialScripts.push(match[1].replace(/^\//, ''));
  }

  console.log('================================================================');
  console.log(' Phase 5 — Initial Mobile Bundle Budget Verification');
  console.log(` Target Budget: <= ${BUDGET_KB_GZIP} KB gzip`);
  console.log('================================================================');

  let totalRawBytes = 0;
  let totalGzipBytes = 0;

  for (const scriptRelPath of initialScripts) {
    const fullPath = path.join(DIST_DIR, scriptRelPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath);
      const gzipped = zlib.gzipSync(content);

      const rawKb = (content.length / 1024).toFixed(2);
      const gzKb = (gzipped.length / 1024).toFixed(2);

      totalRawBytes += content.length;
      totalGzipBytes += gzipped.length;

      console.log(`  • ${path.basename(fullPath)}: ${rawKb} KB (gz: ${gzKb} KB)`);
    } else {
      console.warn(`  ! Script not found on disk: ${fullPath}`);
    }
  }

  const totalGzipKb = (totalGzipBytes / 1024).toFixed(2);
  const totalRawKb = (totalRawBytes / 1024).toFixed(2);

  console.log('----------------------------------------------------------------');
  console.log(` TOTAL Initial Bundle: ${totalRawKb} KB raw | ${totalGzipKb} KB gzip`);

  if (parseFloat(totalGzipKb) > BUDGET_KB_GZIP) {
    console.error(`❌ FAILED: Initial bundle size (${totalGzipKb} KB gz) exceeds budget (${BUDGET_KB_GZIP} KB gz)!`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: Initial bundle (${totalGzipKb} KB gz) is well within the ${BUDGET_KB_GZIP} KB gz budget.`);
    process.exit(0);
  }
}

checkBudget();
