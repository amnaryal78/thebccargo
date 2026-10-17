#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 1. Collect defined CSS variables from tokens.css and index.css
const definedVars = new Set();

function extractDefinedVars(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.matchAll(/--([a-zA-Z0-9_-]+)\s*:/g);
  for (const match of matches) {
    definedVars.add(`--${match[1]}`);
  }
}

extractDefinedVars(path.join(projectRoot, 'src', 'design', 'tokens.css'));
extractDefinedVars(path.join(projectRoot, 'src', 'index.css'));

console.log(`[check-css-vars] Found ${definedVars.size} defined CSS variables in tokens.css and index.css`);

// 2. Scan all .ts and .tsx files in src/
const srcDir = path.join(projectRoot, 'src');
const missingUsages = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Match var(--variable-name) or var(--variable-name, fallback)
  // Also match Tailwind arbitrary values like bg-[var(--variable-name)]
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
}

function traverseDir(dir) {
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
}

traverseDir(srcDir);

if (missingUsages.length > 0) {
  console.error(`❌ [check-css-vars] Found ${missingUsages.length} usages of undefined CSS variables without fallback:`);
  const grouped = {};
  for (const u of missingUsages) {
    grouped[u.varName] = (grouped[u.varName] || 0) + 1;
  }
  for (const [k, v] of Object.entries(grouped)) {
    console.error(`   • ${k}: ${v} occurrences`);
  }
  console.error('\nFirst 10 occurrences:');
  for (const u of missingUsages.slice(0, 10)) {
    console.error(`   ${u.file} -> ${u.varName}`);
  }
  process.exit(1);
} else {
  console.log('✅ [check-css-vars] Zero undefined CSS variables found! All CSS variables are defined.');
  process.exit(0);
}
