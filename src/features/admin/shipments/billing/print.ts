/**
 * Printable documents, built from a saved bill snapshot.
 *  - Customer bill: always A5.
 *  - Box sheet: one per box; the list may run long, so the page grows (A5 width, auto length).
 * Layout and CSS follow the formats supplied by The BC Cargo. Every user-typed value is HTML-escaped.
 */
import { amountInWords, fmtMoney, liquidName, money, type BillDraft, type BillResult } from './model';

export interface BillSnapshot {
  draft: BillDraft;
  result: BillResult;
}

export const COMPANY = {
  name: 'The BC Cargo',
  fullName: 'The BC Cargo & Courier Service',
  address: 'School Road, Hetauda-4, Nepal',
  phone: '+977-9855019485',
  email: 'info@thebccargo.com',
  pan: 'Pending',
  trackUrl: 'https://thebccargo.com',
};

const esc = (v: unknown): string =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function longDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${m[3]} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

const qtyText = (n: number): string => String(Number.isInteger(n) ? n : money(n));

// ----------------------------------------------------------------------------- customer bill
const BILL_CSS = `
@page { size: A5; margin: 0.2in; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; line-height: 1.4; background: #f4f7fb; padding: 8px; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
.bill-container { width: 100%; max-width: 5.4in; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(11,31,58,.1); padding: 0.3in 0.35in; border: 1px solid #d6e0ea; }
.header { text-align: center; border-bottom: 3px solid #0B1F3A; padding-bottom: 8px; margin-bottom: 6px; }
.company-name { font-size: 20px; font-weight: 800; color: #0B1F3A; letter-spacing: 1.5px; text-transform: uppercase; }
.company-name span { color: #F5B301; }
.company-details { font-size: 9px; color: #52657A; margin-top: 2px; }
.company-details span { margin: 0 6px; }
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 9.5px; }
.info-row .label { font-weight: 600; color: #52657A; }
.info-row .value { font-weight: 700; color: #102033; }
.info-divider { border: none; border-top: 1px solid #d6e0ea; margin: 2px 0 6px 0; }
.bill-number { text-align: center; padding: 6px 0; margin-bottom: 8px; background: #eef3f8; border-radius: 8px; border: 2px solid #0B1F3A; }
.bill-number .label { font-size: 9px; color: #52657A; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; }
.bill-number .number { font-size: 16px; font-weight: 900; color: #0B1F3A; letter-spacing: 1px; font-family: Consolas, 'Courier New', monospace; }
.party-wrapper { width: 100%; margin-bottom: 8px; padding: 4px 0; border-bottom: 1px solid #d6e0ea; }
.party-layout { width: 100%; border-collapse: separate; border-spacing: 8px 0; table-layout: fixed; }
.party-layout > tbody > tr > td { width: 50%; vertical-align: top; padding: 0; }
.sender-table, .receiver-table { width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 4px; overflow: hidden; }
.sender-table { border-left: 3px solid #0B1F3A; }
.receiver-table { border-right: 3px solid #0d9488; }
.title-cell { padding: 6px 10px 3px; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .5px; text-align: left; }
.sender-table .title-cell { color: #0B1F3A; border-bottom: 2px solid #0B1F3A; }
.receiver-table .title-cell { color: #0d9488; border-bottom: 2px solid #0d9488; }
td.lbl { padding: 2px 4px 2px 10px; font-size: 8.5px; font-weight: 600; color: #52657A; width: 55px; text-align: left; vertical-align: top; white-space: nowrap; }
td.val { padding: 2px 10px 2px 0; font-size: 8.5px; color: #102033; font-weight: 600; text-align: left; vertical-align: top; word-break: break-word; }
.products-section { margin: 4px 0; }
.section-title { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #0B1F3A; letter-spacing: .5px; border-bottom: 2px solid #0B1F3A; padding-bottom: 2px; margin-bottom: 3px; display: inline-block; }
.products-table { width: 100%; border-collapse: collapse; font-size: 8.5px; }
.products-table thead th { background: #eef3f8; border: 1px solid #cbd5e1; padding: 4px; text-align: center; font-weight: 700; font-size: 8px; color: #0B1F3A; text-transform: uppercase; }
.products-table tbody td { border: 1px solid #cbd5e1; padding: 3px 4px; text-align: center; font-size: 8.5px; }
.products-table td.left { text-align: left; } .products-table td.right { text-align: right; }
.products-table .total-row { background: #f8fafc; font-weight: 700; border-top: 2px solid #0B1F3A; }
.products-table .total-row td { padding: 4px; font-size: 9px; }
.summary-section { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 6px; padding-top: 4px; border-top: 2px solid #0B1F3A; gap: 10px; }
.summary-left { flex: 1; } .summary-right { text-align: right; min-width: 140px; }
.in-words { font-size: 8.5px; color: #52657A; font-style: italic; }
.in-words .word-label { font-weight: 700; color: #102033; font-style: normal; }
.insurance-banner { margin-top: 5px; padding: 4px 8px; background: #F8FAFC; border-left: 3px solid #0B1F3A; border-radius: 3px; font-size: 8.5px; font-weight: 700; color: #0B1F3A; display: inline-block; }
.total-amount { font-size: 16px; font-weight: 900; color: #0B1F3A; } .total-amount .currency { font-size: 12px; color: #52657A; font-weight: 600; }
.total-label { font-size: 9px; color: #52657A; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }
.footer-section { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 2px solid #0B1F3A; }
.signature-label { font-size: 8px; color: #52657A; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }
.signature-line { width: 120px; border-top: 1px solid #102033; margin-top: 24px; }
.qr-container { text-align: center; } .qr-container img { width: 48px; height: 48px; border: 1px solid #d6e0ea; border-radius: 4px; }
.qr-label { font-size: 7.5px; color: #718399; margin-top: 1px; } .qr-url { font-size: 7px; color: #718399; }
.terms { text-align: center; font-size: 8px; color: #718399; margin-top: 4px; padding-top: 4px; border-top: 1px solid #d6e0ea; }
.no-print { text-align: center; padding: 10px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.06); margin-bottom: 12px; }
.no-print button { padding: 8px 20px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; border-radius: 6px; margin: 0 4px; }
.btn-print { background: #0B1F3A; color: #fff; } .btn-close { background: #eef3f8; color: #52657A; }
@media print { @page { size: A5 portrait; margin: 5mm; } body { background: #fff; padding: 0; min-height: auto; display: block; }
  .bill-container { box-shadow: none; border: 1px solid #cbd5e1; border-radius: 0; padding: 0.15in; max-width: 100%; width: 100%; } .no-print { display: none !important; } }
`;

const toolbar = (label: string) =>
  `<div class='no-print'><button class='btn-print' id='bc-print'>Print ${esc(label)}</button><button class='btn-close' id='bc-close'>Close</button></div>`;

export function buildCustomerBillHtml({ draft: d, result: r }: BillSnapshot): string {
  const rows = r.lines
    .map(
      (l, i) => `<tr>
<td>${i + 1}</td><td class='left'>${esc(l.description)}</td><td>${esc(l.qty)}</td><td class='right'>${esc(l.weight)}</td><td class='right'>${esc(l.rate)}</td><td class='right'>${fmtMoney(l.amount)}</td></tr>`
    )
    .join('');
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${COMPANY.trackUrl}/#track?t=${d.billNo}`)}`;
  const party = (title: string, cls: string, p: BillDraft['sender'], withAddress: boolean) => `<td><table class='${cls}'><tbody>
<tr><td class='title-cell' colspan='2'>${title}</td></tr>
<tr><td class='lbl'>Name:</td><td class='val'>${esc(p.name)}</td></tr>
<tr><td class='lbl'>Phone:</td><td class='val'>${esc(p.phone)}</td></tr>
${withAddress && p.address ? `<tr><td class='lbl'>Address:</td><td class='val'>${esc(p.address)}</td></tr>` : ''}
<tr><td class='lbl'>Country:</td><td class='val'>${esc(p.country)}</td></tr>
</tbody></table></td>`;

  return `<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>
<title>${esc(COMPANY.name)} - Customer Bill ${esc(d.billNo)}</title><style>${BILL_CSS}</style></head><body>
${toolbar('Customer Bill')}
<div class='bill-container'>
<div class='header'><div class='company-name'>The BC <span>Cargo</span></div>
<div class='company-details'>${esc(COMPANY.address)} <span>${esc(COMPANY.phone)}</span> <span>${esc(COMPANY.email)}</span></div></div>
<div class='info-row'><div><span class='label'>Date:</span> <span class='value'>${esc(longDate(d.date))}</span></div>
<div><span class='label'>PAN:</span> <span class='value'>${esc(COMPANY.pan)}</span></div></div>
<hr class='info-divider'>
<div class='bill-number'><span class='label'>BILL NUMBER</span><br><span class='number'>${esc(d.billNo)}</span></div>
<div class='party-wrapper'><table class='party-layout'><tbody><tr>
${party('SENDER', 'sender-table', d.sender, false)}${party('RECEIVER', 'receiver-table', d.receiver, true)}
</tr></tbody></table></div>
<div class='products-section'><div class='section-title'>Shipment Main Categories</div>
<table class='products-table'><thead><tr><th style='width:8%'>#</th><th style='width:38%;text-align:left'>Category Description</th><th style='width:10%'>Qty</th><th style='width:14%'>Wt (kg)</th><th style='width:14%'>Rate (Rs)</th><th style='width:16%'>Amount (Rs)</th></tr></thead>
<tbody>${rows}
<tr class='total-row'><td colspan='3'>TOTAL</td><td class='right'>${fmtMoney(d.totalWeightKg)}</td><td></td><td class='right'>${fmtMoney(r.total)}</td></tr>
</tbody></table></div>
<div class='summary-section'><div class='summary-left'>
<div class='in-words'><span class='word-label'>Amount in Words:</span> ${esc(amountInWords(r.total))}</div>
<div class='insurance-banner'>Value of item, Upto <strong>Rs. ${fmtMoney(d.valueUpToNpr).replace(/\.00$/, '')}</strong></div></div>
<div class='summary-right'><div class='total-label'>Grand Total</div><div class='total-amount'><span class='currency'>Rs.</span> ${fmtMoney(r.total)}</div></div></div>
<div class='footer-section'><div><div class='signature-label'>Authorized Signature</div><div class='signature-line'></div></div>
<div class='qr-container'><img src='${esc(qr)}' alt='QR code to track this bill' width='48' height='48'><div class='qr-label'>Scan to Track</div><div class='qr-url'>${esc(COMPANY.trackUrl)}</div></div></div>
<div class='terms'>Thank you for choosing <strong>The BC Cargo</strong> &bull; Fast &amp; Reliable Cargo Services</div>
</div></body></html>`;
}

// ----------------------------------------------------------------------------- box sheets
const BOX_CSS = `
@page { size: A5 portrait; margin: 5mm; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; line-height: 1.4; background: #f1f5f9; padding: 10px; display: flex; flex-direction: column; align-items: center; }
.woori-card { width: 100%; max-width: 5.4in; background: #fff; border-radius: 12px; border: 2px solid #0F172A; box-shadow: 0 4px 16px rgba(0,0,0,.08); padding: 0.3in; margin-bottom: 14px; }
.woori-header { text-align: center; border-bottom: 3px double #0F172A; padding-bottom: 8px; margin-bottom: 12px; }
.woori-title { font-size: 20px; font-weight: 900; color: #0F172A; letter-spacing: 1px; text-transform: uppercase; }
.woori-sub { font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }
.meta-grid { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
.meta-box { flex: 1; background: #0F172A; color: #fff; border-radius: 8px; padding: 10px; text-align: center; }
.meta-box .lbl { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #94A3B8; }
.meta-box .val { font-size: 18px; font-weight: 900; color: #FACC15; font-family: monospace; }
.receiver-card { background: #F8FAFC; border: 2px solid #0F172A; border-radius: 8px; padding: 12px; margin-bottom: 14px; }
.receiver-card .lbl { font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: .5px; }
.receiver-card .detail { font-size: 12px; font-weight: 600; color: #334155; margin-top: 2px; }
.section-block { margin-bottom: 12px; border: 1px solid #CBD5E1; border-radius: 8px; overflow: hidden; }
.section-header { background: #E2E8F0; color: #0F172A; padding: 6px 10px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid #CBD5E1; }
.section-body { padding: 8px 12px; font-size: 11.5px; color: #1E293B; }
.item-row { padding: 3px 0; border-bottom: 1px dotted #E2E8F0; display: flex; justify-content: space-between; gap: 10px; break-inside: avoid; }
.item-row:last-child { border-bottom: none; }
.item-row .name { font-weight: 600; color: #0F172A; } .item-row .detail { font-weight: 500; color: #475569; white-space: nowrap; }
.empty { color: #64748B; font-style: italic; }
.no-print { text-align: center; padding: 10px; background: #fff; border-radius: 8px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.no-print button { padding: 8px 20px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; border-radius: 6px; margin: 0 4px; }
.btn-print { background: #0F172A; color: #fff; } .btn-close { background: #E2E8F0; color: #475569; }
@media print { body { background: #fff; padding: 0; display: block; }
  .woori-card { box-shadow: none; border: 2px solid #000; border-radius: 0; padding: 0.15in; max-width: 100%; width: 100%; margin: 0; }
  .woori-card + .woori-card { break-before: page; } .no-print { display: none !important; } }
`;

const row = (name: string, detail: string) => `<div class='item-row'><span class='name'>&bull; ${esc(name)}</span><span class='detail'>${esc(detail)}</span></div>`;

function boxSheet({ draft: d, result: r }: BillSnapshot, index: number): string {
  const b = d.boxes[index];
  const goods = b.goods.map((g) => row(`${g.name} — ${g.unit}`, `Qty: ${qtyText(g.qty)}`)).join('');
  const liquids = b.liquids.map((l) => row(`${liquidName(l)} — ${l.unit}`, `Qty: ${qtyText(l.qty)}`)).join('');
  const meats = b.meats.map((m) => row(`${m.name}`, `${qtyText(m.kgPerUnit)} kg × Qty: ${qtyText(m.qty)}`)).join('');
  const block = (title: string, body: string) => (body ? `<div class='section-block'><div class='section-header'>${title}</div><div class='section-body'>${body}</div></div>` : '');
  const weight = b.weightKg ? `${money(b.weightKg).toFixed(2)}` : r.boxCount === 1 ? money(d.totalWeightKg).toFixed(2) : '-';
  const any = goods || liquids || meats;
  return `<div class='woori-card'>
<div class='woori-header'><div class='woori-title'>${esc('The BC Cargo & Courier Service')}</div><div class='woori-sub'>OPERATIONAL &amp; WAREHOUSE DISPATCH FORM &middot; ${esc(d.billNo)}</div></div>
<div class='meta-grid'>
<div class='meta-box'><div class='lbl'>BILLING DATE</div><div class='val' style='font-size:14px'>${esc(longDate(d.date))}</div></div>
<div class='meta-box'><div class='lbl'>BOX</div><div class='val'>${index + 1} / ${r.boxCount}</div></div>
<div class='meta-box'><div class='lbl'>${b.weightKg || r.boxCount === 1 ? 'WEIGHT (KG)' : 'WEIGHT'}</div><div class='val'>${esc(weight)}</div></div>
</div>
<div class='receiver-card'><div class='lbl'>RECEIVER DETAILS</div>
<div class='detail'><strong>Name:</strong> ${esc(d.receiver.name)}</div>
<div class='detail'><strong>Phone:</strong> ${esc(d.receiver.phone)}</div>
<div class='detail'><strong>Address:</strong> ${esc(d.receiver.address)}</div>
<div class='detail'><strong>Country:</strong> ${esc(d.receiver.country)}</div></div>
<div class='section-block'><div class='section-header'>Custom Box Charge</div><div class='section-body'>${row('Number of Boxes', `${r.boxCount} Boxes`)}</div></div>
${block('Weight Package Items', goods)}${block('Liquid Items', liquids)}${block('Meat Items', meats)}
${any ? '' : `<div class='section-block'><div class='section-header'>Items</div><div class='section-body empty'>No items listed for this box.</div></div>`}
</div>`;
}

/** @param boxes 0-based box indexes to print; omit for all. */
export function buildBoxSheetsHtml(snap: BillSnapshot, boxes?: number[]): string {
  const idx = (boxes ?? snap.draft.boxes.slice(0, snap.result.boxCount).map((_, i) => i)).filter((i) => i >= 0 && i < snap.result.boxCount);
  return `<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>
<title>Box sheets ${esc(snap.draft.billNo)}</title><style>${BOX_CSS}</style></head><body>
${toolbar(idx.length === 1 ? `Box ${idx[0] + 1}` : 'All Box Sheets')}
${idx.map((i) => boxSheet(snap, i)).join('')}
</body></html>`;
}

/** Opens the document in a new window and wires the Print / Close buttons (no inline scripts, so CSP-safe). */
export function openPrintWindow(html: string): boolean {
  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.document.getElementById('bc-print')?.addEventListener('click', () => w.print());
  w.document.getElementById('bc-close')?.addEventListener('click', () => w.close());
  return true;
}
