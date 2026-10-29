/**
 * WCAG 2.2 AA Contrast Ratio Validator for The BC Cargo Design Tokens
 * Run via: npx tsx scripts/contrast-check.ts or node with experimental strip types
 */

interface ColorRgb {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): ColorRgb {
  const clean = hex.replace('#', '').trim();
  const full = clean.length === 3 
    ? clean.split('').map(c => c + c).join('') 
    : clean;
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function channelLuminance(channel: number): number {
  const srgb = channel / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

function relativeLuminance(rgb: ColorRgb): number {
  return (
    0.2126 * channelLuminance(rgb.r) +
    0.7152 * channelLuminance(rgb.g) +
    0.0722 * channelLuminance(rgb.b)
  );
}

export function contrastRatio(hex1: string, hex2: string): number {
  const lum1 = relativeLuminance(hexToRgb(hex1));
  const lum2 = relativeLuminance(hexToRgb(hex2));
  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (brighter + 0.05) / (darker + 0.05);
}

// Token Scales
export const PALETTE = {
  // Oxford Blue
  ox50: '#EEF2F8',
  ox100: '#D9E2EF',
  ox200: '#B3C4DE',
  ox300: '#85A0C7',
  ox400: '#5779AC',
  ox500: '#345A92',
  ox600: '#224A82',
  ox700: '#183E74',
  ox800: '#10346A',
  ox900: '#0B2D63',
  ox950: '#071C3F',

  // Golden Yellow
  gd50: '#FEF8EA',
  gd100: '#FCEDC8',
  gd200: '#F9DD95',
  gd300: '#F6CC64',
  gd400: '#F4C04A',
  gd500: '#F2B632',
  gd600: '#D99B17',
  gd700: '#8A6200', // Adjusted from #A07503 to ensure 4.5:1 against light surfaces
  gd800: '#6E4E05',
  gd900: '#4A3504',

  // Ink
  ink0: '#FFFFFF',
  ink50: '#F7F5F0',
  ink100: '#EFEBE3',
  ink200: '#DEDAD1',
  ink300: '#C2BDB2',
  ink400: '#96918A',
  ink500: '#6C6862',
  ink600: '#4A4743', // Adjusted slightly from #4B4A46 to ensure robust >=4.5:1 against ink-100
  ink700: '#34322F',
  ink800: '#22211F',
  ink900: '#141312',
  ink950: '#0B0A09',

  // Signal Red
  rd100: '#F8DEDA',
  rd400: '#F4857C', // Light signal red for dark mode contrast (>= 4.5:1)
  rd500: '#B42A20', // Adjusted from #C8372D to guarantee >= 4.5:1 on light surfaces
  rd600: '#962219',

  // Semantic text + status
  text: '#16223A',
  textMuted: '#4B5263',
  gr100: '#E1F1E7',
  gr500: '#1D7A48'
};

export interface CheckItem {
  name: string;
  fg: string;
  bg: string;
  minRatio: number;
  theme: 'light' | 'dark';
  purpose: string;
}

export const CHECK_PAIRS: CheckItem[] = [
  // LIGHT MODE CHECKS
  { name: 'Light Body Text on Page Bg', fg: PALETTE.ink900, bg: PALETTE.ink50, minRatio: 4.5, theme: 'light', purpose: 'Body copy on page' },
  { name: 'Light Body Text on Surface', fg: PALETTE.ink900, bg: PALETTE.ink0, minRatio: 4.5, theme: 'light', purpose: 'Card & modal text' },
  { name: 'Light Body Text on Surface-2', fg: PALETTE.ink900, bg: PALETTE.ink100, minRatio: 4.5, theme: 'light', purpose: 'Secondary section text' },
  { name: 'Light Muted Text on Page Bg', fg: PALETTE.ink600, bg: PALETTE.ink50, minRatio: 4.5, theme: 'light', purpose: 'Metadata & captions' },
  { name: 'Light Muted Text on Surface', fg: PALETTE.ink600, bg: PALETTE.ink0, minRatio: 4.5, theme: 'light', purpose: 'Card secondary labels' },
  { name: 'Light Muted Text on Surface-2', fg: PALETTE.ink600, bg: PALETTE.ink100, minRatio: 4.5, theme: 'light', purpose: 'Table metadata' },
  { name: 'Light Brand Button (Oxford fill, white text)', fg: PALETTE.ink0, bg: PALETTE.ox900, minRatio: 4.5, theme: 'light', purpose: 'Secondary button' },
  { name: 'Light Primary CTA (Gold fill, Oxford text)', fg: PALETTE.ox900, bg: PALETTE.gd500, minRatio: 4.5, theme: 'light', purpose: 'Primary CTA button' },
  { name: 'Light Gold Accent Text on Surface', fg: PALETTE.gd700, bg: PALETTE.ink0, minRatio: 4.5, theme: 'light', purpose: 'Gold badges & markers' },
  { name: 'Light Gold Accent Text on Bg', fg: PALETTE.gd700, bg: PALETTE.ink50, minRatio: 4.5, theme: 'light', purpose: 'Highlight numbers' },
  { name: 'Light Danger Text on Surface', fg: PALETTE.rd500, bg: PALETTE.ink0, minRatio: 4.5, theme: 'light', purpose: 'Error messages' },
  { name: 'Light Danger Text on Bg', fg: PALETTE.rd500, bg: PALETTE.ink50, minRatio: 4.5, theme: 'light', purpose: 'Restricted items' },
  { name: 'Light UI Line on Surface', fg: PALETTE.ink200, bg: PALETTE.ink0, minRatio: 1.2, theme: 'light', purpose: 'Dividers & borders' },

  { name: 'Ink Text on Page Bg', fg: PALETTE.text, bg: PALETTE.ink50, minRatio: 4.5, theme: 'light', purpose: '--text on canvas' },
  { name: 'Ink Text on Surface-2', fg: PALETTE.text, bg: PALETTE.ink100, minRatio: 4.5, theme: 'light', purpose: '--text on wells' },
  { name: 'Muted Text on Page Bg', fg: PALETTE.textMuted, bg: PALETTE.ink50, minRatio: 4.5, theme: 'light', purpose: '--text-muted on canvas' },
  { name: 'Muted Text on Surface-2', fg: PALETTE.textMuted, bg: PALETTE.ink100, minRatio: 4.5, theme: 'light', purpose: '--text-muted on wells' },
  { name: 'Success Text on Success Bg', fg: PALETTE.gr500, bg: PALETTE.gr100, minRatio: 4.5, theme: 'light', purpose: 'Success badge' },
  { name: 'Warning Text on Warning Bg', fg: PALETTE.gd700, bg: PALETTE.gd100, minRatio: 4.5, theme: 'light', purpose: 'Warning badge' },
  { name: 'Danger Text on Danger Bg', fg: PALETTE.rd500, bg: PALETTE.rd100, minRatio: 4.5, theme: 'light', purpose: 'Danger badge' },


  // DARK MODE CHECKS
  { name: 'Dark Body Text on Page Bg', fg: PALETTE.ink50, bg: PALETTE.ox950, minRatio: 4.5, theme: 'dark', purpose: 'Body copy on dark page' },
  { name: 'Dark Body Text on Surface', fg: PALETTE.ink50, bg: PALETTE.ox900, minRatio: 4.5, theme: 'dark', purpose: 'Dark card copy' },
  { name: 'Dark Body Text on Surface-2', fg: PALETTE.ink50, bg: PALETTE.ox800, minRatio: 4.5, theme: 'dark', purpose: 'Dark secondary panels' },
  { name: 'Dark Muted Text on Page Bg', fg: PALETTE.ox200, bg: PALETTE.ox950, minRatio: 4.5, theme: 'dark', purpose: 'Dark metadata & subheaders' },
  { name: 'Dark Muted Text on Surface', fg: PALETTE.ox200, bg: PALETTE.ox900, minRatio: 4.5, theme: 'dark', purpose: 'Dark card muted labels' },
  { name: 'Dark Muted Text on Surface-2', fg: PALETTE.ox200, bg: PALETTE.ox800, minRatio: 4.5, theme: 'dark', purpose: 'Dark table subtext' },
  { name: 'Dark Primary CTA (Gold fill, Dark Oxford text)', fg: PALETTE.ox950, bg: PALETTE.gd500, minRatio: 4.5, theme: 'dark', purpose: 'Primary CTA in dark' },
  { name: 'Dark Accent Text on Page Bg', fg: PALETTE.gd400, bg: PALETTE.ox950, minRatio: 4.5, theme: 'dark', purpose: 'Gold headings & numbers' },
  { name: 'Dark Accent Text on Surface', fg: PALETTE.gd400, bg: PALETTE.ox900, minRatio: 4.5, theme: 'dark', purpose: 'Gold card highlights' },
  { name: 'Dark Danger Text on Page Bg', fg: PALETTE.rd400, bg: PALETTE.ox950, minRatio: 4.5, theme: 'dark', purpose: 'Dark errors' },
  { name: 'Dark Danger Text on Surface', fg: PALETTE.rd400, bg: PALETTE.ox900, minRatio: 4.5, theme: 'dark', purpose: 'Dark card errors' },
  { name: 'Dark UI Line on Surface', fg: PALETTE.ox700, bg: PALETTE.ox900, minRatio: 1.2, theme: 'dark', purpose: 'Dark dividers' }
];

export function runContrastAudit() {
  console.log('='.repeat(80));
  console.log(' THE BC CARGO DESIGN TOKENS — WCAG 2.2 AA CONTRAST AUDIT');
  console.log('='.repeat(80));

  let passed = 0;
  let failed = 0;

  for (const item of CHECK_PAIRS) {
    const ratio = contrastRatio(item.fg, item.bg);
    const ok = ratio >= item.minRatio;
    const ratioFormatted = ratio.toFixed(2) + ':1';
    const statusStr = ok ? '✓ PASS' : '✗ FAIL';
    if (ok) passed++; else failed++;

    console.log(
      `${statusStr.padEnd(8)} [${item.theme.toUpperCase().padEnd(5)}] ` +
      `${item.name.padEnd(42)} ` +
      `Ratio: ${ratioFormatted.padEnd(8)} (req: ${item.minRatio}:1) | ` +
      `FG: ${item.fg} BG: ${item.bg}`
    );
  }

  console.log('-'.repeat(80));
  console.log(`TOTAL: ${CHECK_PAIRS.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('='.repeat(80));

  if (failed > 0) {
    process.exit(1);
  }
}

if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/')) || process.argv[1]?.includes('contrast-check')) {
  runContrastAudit();
}
