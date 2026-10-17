import fs from 'node:fs';
import path from 'node:path';

function walk(dir) {
  let res = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) res = res.concat(walk(full));
    else if (full.endsWith('.tsx') || full.endsWith('.ts')) res.push(full);
  }
  return res;
}

const files = walk('src');
console.log('Total files in src:', files.length);

// 1. Check for break-all
for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  if (c.includes('break-all')) {
    console.log('[break-all found]:', f);
  }
}

// 2. Search for phone numbers with hyphens lacking whitespace-nowrap
const phoneMatches = [];
for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  const lines = c.split('\n');
  lines.forEach((l, idx) => {
    if (l.match(/\+?977[-0-9]+/)) {
      if (!l.includes('whitespace-nowrap')) {
        phoneMatches.push({ file: f, line: idx + 1, code: l.trim() });
      }
    }
  });
}
console.log('Hyphenated phone numbers without nowrap:', phoneMatches.length);
phoneMatches.forEach(p => console.log(`  ${p.file}:${p.line}: ${p.code}`));

// 3. Search for SVG/Lucide icons without shrink-0 in flex layouts
const iconMatches = [];
for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  const lines = c.split('\n');
  lines.forEach((l, idx) => {
    // Check icon component usages like <Phone className="w-4 h-4" /> without shrink-0
    const m = l.match(/<([A-Z][a-zA-Z0-9]+Icon|[A-Z][a-zA-Z0-9]+)\s+className="([^"]*w-\d+[^"]*)"/);
    if (m) {
      const cls = m[2];
      if (!cls.includes('shrink-0') && (cls.includes('w-') || cls.includes('h-'))) {
        iconMatches.push({ file: f, line: idx + 1, icon: m[1], cls });
      }
    }
  });
}
console.log('\nIcons with explicit size but missing shrink-0:', iconMatches.length);
console.log('Sample missing shrink-0 icons:', iconMatches.slice(0, 15));

// 4. Check for button / [role=tab] / [role=button] lacking whitespace-nowrap
const buttonNoNowrap = [];
for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  const lines = c.split('\n');
  lines.forEach((l, idx) => {
    if ((l.includes('<button') || l.includes('role="tab"') || l.includes('role="button"')) && l.includes('className=')) {
      if (!l.includes('whitespace-nowrap') && !l.includes('w-full') && !l.includes('flex-col') && !l.includes('text-left') && !l.includes('w-') && (l.includes('h-') || l.includes('px-') || l.includes('py-'))) {
        buttonNoNowrap.push({ file: f, line: idx + 1, snippet: l.trim().slice(0, 80) });
      }
    }
  });
}
console.log('\nButtons without whitespace-nowrap or w-full:', buttonNoNowrap.length);
console.log('Sample:', buttonNoNowrap.slice(0, 15));
