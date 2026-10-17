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
  ox50: '#EEF3F9',
  ox100: '#D6E1EF',
  ox200: '#AEC3DE',
  ox300: '#7F9DC4',
  ox400: '#4F76A8',
  ox500: '#2F5A8F',
  ox600: '#1D4577',
  ox700: '#123562',
  ox800: '#082A52',
  ox900: '#002147',
  ox950: '#00152D',

  // Golden Yellow
  gd50: '#FFF9E0',
  gd100: '#FFF0B3',
  gd200: '#FFE380',
  gd300: '#FFD54D',
  gd400: '#FAC623',
  gd500: '#F2B705',
  gd600: '#CC9704',
  gd700: '#8C6400', // Adjusted from #A07503 to ensure 4.5:1 against light surfaces
  gd800: '#735402',
  gd900: '#4A3601',

  // Ink
  ink0: '#FFFFFF',
  ink50: '#F6F6F4',
  ink100: '#ECEBE7',
  ink200: '#D9D8D2',
  ink300: '#B9B8B0',
  ink400: '#8E8D86',
  ink500: '#6A6963',
  ink600: '#474642', // Adjusted slightly from #4B4A46 to ensure robust >=4.5:1 against ink-100
  ink700: '#33322F',
  ink800: '#1F1E1C',
  ink900: '#121211',
  ink950: '#0A0A09',

  // Signal Red
  rd100: '#F8DAD7',
  rd400: '#ED6B60', // Light signal red for dark mode contrast (>= 4.5:1)
  rd500: '#C02E24', // Adjusted from #C8372D to guarantee >= 4.5:1 on light surfaces
  rd600: '#A82A22'
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
