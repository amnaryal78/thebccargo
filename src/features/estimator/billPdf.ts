import { BOX_CHARGE_NPR, SheetQuoteResult } from './engine';
import { numberToWords } from '../../utils/numberToWords';

/**
 * Dependency-free single-page, colored A4 PDF for the estimate bill.
 * Used by the "Download" button so the bill saves as a file on desktop and Android.
 */

const fmt = (v: number) =>
  v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ascii = (s: string) =>
  s.replace(/[•·]/g, '-').replace(/[–—]/g, '-').replace(/[^\x20-\x7E]/g, '');

const esc = (s: string) => ascii(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const wrap = (text: string, width: number): string[] => {
  const words = ascii(text).split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > width) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines;
};

export const billCodeFor = (q: SheetQuoteResult) =>
  `BC-EST-${Math.round(q.totalWeightKg * 10)}-${q.destinationName.slice(0, 3).toUpperCase()}`;

type Rgb = [number, number, number];
const hex = (h: string): Rgb => [
  parseInt(h.slice(1, 3), 16) / 255,
  parseInt(h.slice(3, 5), 16) / 255,
  parseInt(h.slice(5, 7), 16) / 255,
];
const NAVY = hex('#0B1F3A');
const GOLD = hex('#F5B301');
const INK = hex('#102033');
const MUTED = hex('#52657A');
const SOFT = hex('#EEF3F8');
const WHITE: Rgb = [1, 1, 1];

const col = (c: Rgb) => c.map((v) => v.toFixed(3)).join(' ');

class Page {
  ops: string[] = [];

  rect(x: number, y: number, w: number, h: number, fill: Rgb) {
    this.ops.push(`${col(fill)} rg ${x} ${y} ${w} ${h} re f`);
  }

  line(x1: number, y1: number, x2: number, y2: number, c: Rgb, lw = 0.8) {
    this.ops.push(`${col(c)} RG ${lw} w ${x1} ${y1} m ${x2} ${y2} l S`);
  }

  // font: 1 Helvetica, 2 Helvetica-Bold, 3 Courier-Bold (exact widths, used for numbers)
  text(t: string, x: number, y: number, size: number, c: Rgb, font = 1, align: 'l' | 'c' | 'r' = 'l') {
    const w = t.length * size * (font === 3 ? 0.6 : font === 2 ? 0.56 : 0.51);
    const px = align === 'l' ? x : align === 'c' ? x - w / 2 : x - w;
    this.ops.push(`BT /F${font} ${size} Tf ${col(c)} rg ${px.toFixed(2)} ${y} Td (${esc(t)}) Tj ET`);
  }
}

export const buildBillPdf = (quote: SheetQuoteResult, date: string): Blob => {
  const pg = new Page();
  const L = 40;
  const R = 555;
  const boxes = `${quote.boxCount} ${quote.boxCount === 1 ? 'box' : 'boxes'}`;
  const rows: { desc: string; qty: string; wt: string; rate: string; amt: string }[] = [
    {
      desc: `Base shipping charge (${quote.totalWeightKg} kg to ${quote.destinationName})`,
      qty: boxes,
      wt: quote.totalWeightKg.toFixed(2),
      rate: quote.totalWeightKg >= 10 ? fmt(quote.baseShippingCharge / quote.totalWeightKg) : '-',
      amt: fmt(quote.baseShippingCharge),
    },
    { desc: 'Custom box charge (max 20 kg per box)', qty: boxes, wt: '-', rate: fmt(BOX_CHARGE_NPR), amt: fmt(quote.boxCharge) },
  ];
  if ((quote.pickupFeeNpr ?? 0) > 0)
    rows.push({ desc: `Home pickup charge${quote.pickupArea ? ` (${quote.pickupArea})` : ''}`, qty: '1', wt: '-', rate: fmt(quote.pickupFeeNpr ?? 0), amt: fmt(quote.pickupFeeNpr ?? 0) });
  if (quote.liquidCharge > 0)
    rows.push({ desc: 'Liquid handling charge', qty: boxes, wt: '-', rate: '600.00', amt: fmt(quote.liquidCharge) });
  if (quote.meatCharge > 0)
    rows.push({ desc: 'Meat compliance charge', qty: '1 item', wt: '-', rate: '-', amt: fmt(quote.meatCharge) });
  if (quote.medicineCharge > 0)
    rows.push({ desc: 'Medicine special handling', qty: boxes, wt: '-', rate: '600.00', amt: fmt(quote.medicineCharge) });

  // Header band
  pg.rect(0, 742, 595, 100, NAVY);
  pg.rect(0, 738, 595, 4, GOLD);
  pg.text('The BC Cargo & Courier', 297.5, 800, 22, WHITE, 2, 'c');
  pg.text('School Road -4, Hetauda, Nepal', 297.5, 779, 9.5, hex('#D6E0EA'), 1, 'c');
  pg.text('Phone: 057-591816 / 9855019485   |   Email: thebccargo@gmail.com', 297.5, 764, 9.5, hex('#D6E0EA'), 1, 'c');

  // Big title
  pg.text('ESTIMATED RATE', 297.5, 696, 34, NAVY, 2, 'c');
  pg.rect(217, 684, 161, 3, GOLD);
  pg.text(`Bill No: ${billCodeFor(quote)}      Date: ${date}`, 297.5, 666, 10, MUTED, 1, 'c');

  // From / To cards
  const card = (x: number, title: string, rowsT: [string, string][], accent: Rgb) => {
    pg.rect(x, 572, 250, 76, SOFT);
    pg.rect(x, 572, 5, 76, accent);
    pg.text(title, x + 16, 632, 11, NAVY, 2);
    rowsT.forEach(([k, v], i) => {
      pg.text(k, x + 16, 614 - i * 15, 9.5, MUTED, 1);
      pg.text(v, x + 240, 614 - i * 15, 9.5, INK, 2, 'r');
    });
  };
  card(L, 'FROM (ORIGIN)', [['Office', 'Hetauda Office'], ['Location', 'School Road -4, Hetauda'], ['Country', 'Nepal']], NAVY);
  card(
    305,
    'TO (DESTINATION)',
    [['Country', quote.destinationName.slice(0, 26)], ['Shipping', 'Air Cargo Express'], ['Weight', `${quote.totalWeightKg.toFixed(2)} kg (${boxes})`]],
    GOLD
  );

  // Charges table
  pg.text('CHARGES BREAKDOWN', L, 548, 11, NAVY, 2);
  let y = 530;
  pg.rect(L, y - 6, R - L, 22, NAVY);
  const cx = { n: L + 8, desc: L + 28, qty: 330, wt: 400, rate: 465, amt: R - 8 };
  pg.text('#', cx.n, y, 9, WHITE, 2);
  pg.text('ITEM', cx.desc, y, 9, WHITE, 2);
  pg.text('QTY', cx.qty, y, 9, WHITE, 2, 'c');
  pg.text('WEIGHT', cx.wt, y, 9, WHITE, 2, 'r');
  pg.text('RATE (Rs)', cx.rate, y, 9, WHITE, 2, 'r');
  pg.text('AMOUNT (Rs)', cx.amt, y, 9, WHITE, 2, 'r');
  y -= 24;
  rows.forEach((r, i) => {
    const d = wrap(r.desc, 38);
    const h = 12 + d.length * 12;
    pg.rect(L, y - h + 12, R - L, h, i % 2 ? WHITE : SOFT);
    pg.text(String(i + 1), cx.n, y, 9.5, INK, 1);
    d.forEach((ln, k) => pg.text(ln, cx.desc, y - k * 12, 9.5, INK, 1));
    pg.text(r.qty, cx.qty, y, 9.5, INK, 1, 'c');
    pg.text(r.wt, cx.wt, y, 9.5, INK, 3, 'r');
    pg.text(r.rate, cx.rate, y, 9.5, INK, 3, 'r');
    pg.text(r.amt, cx.amt, y, 9.5, INK, 3, 'r');
    y -= h;
  });
  pg.line(L, y + 10, R, y + 10, NAVY, 1.5);
  y -= 8;

  // Grand total
  pg.rect(L, y - 38, R - L, 52, NAVY);
  pg.rect(L, y - 38, 6, 52, GOLD);
  pg.text('GRAND TOTAL', L + 22, y - 6, 12, WHITE, 2);
  pg.text(`Rs. ${fmt(quote.totalNpr)}`, R - 16, y - 12, 24, GOLD, 3, 'r');
  y -= 64;

  wrap(`In words: ${numberToWords(quote.totalNpr)} Rupees Only`, 90).forEach((ln, k) =>
    pg.text(ln, L, y - k * 13, 10, INK, 1)
  );
  y -= 40;

  // Notice
  const notice = wrap(
    'Important: Final bill is made after physical check at our office (School Road -4, Hetauda, Nepal). Weight is verified on electronic certified scales.',
    92
  );
  const nh = 16 + notice.length * 13;
  pg.rect(L, y - nh + 14, R - L, nh, hex('#FFFBEB'));
  pg.rect(L, y - nh + 14, 4, nh, hex('#F59E0B'));
  notice.forEach((ln, k) => pg.text(ln, L + 14, y - k * 13, 9.5, hex('#92400E'), 1));
  y -= nh + 40;

  // Signature + footer
  pg.line(L, y, L + 160, y, INK, 0.8);
  pg.text('Authorized Signature', L, y - 13, 9, MUTED, 1);
  pg.rect(0, 0, 595, 4, GOLD);
  pg.text('Thank you for choosing The BC Cargo & Courier - Fast & Reliable Cargo Services', 297.5, 30, 9.5, MUTED, 1, 'c');

  const content = pg.ops.join('\n');
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objs.forEach((o, k) => {
    offsets.push(pdf.length);
    pdf += `${k + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => {
    pdf += `${String(o).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
};

export const downloadBill = (quote: SheetQuoteResult, date: string) => {
  const url = URL.createObjectURL(buildBillPdf(quote, date));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${billCodeFor(quote)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};
