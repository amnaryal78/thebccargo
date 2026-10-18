import type { AdminShipment } from '../../types';
import { computeBill, newBillDraft, type BillDraft, type BillResult } from './model';
import type { BillSnapshot } from './print';

export const BILL_SCHEMA_VERSION = 1;

/** Columns written to public.shipments. The whole bill is also stored in `bill` so it can be re-opened and re-printed exactly. */
export function toShipmentRow(d: BillDraft, r: BillResult, status: string): Partial<AdminShipment> {
  const itemCount = d.boxes.slice(0, r.boxCount).reduce((s, b) => s + b.goods.length + b.liquids.length + b.meats.length, 0);
  return {
    tracking_number: d.billNo.trim(),
    mode: 'air',
    status,
    origin: d.sender.country || 'Nepal',
    destination: d.receiver.country,
    shipper_company: d.sender.name.trim(),
    shipper_country: d.sender.country,
    consignee_company: d.receiver.name.trim(),
    consignee_country: d.receiver.country,
    gross_weight_kg: d.totalWeightKg,
    chargeable_weight_kg: d.totalWeightKg,
    pieces: r.boxCount,
    commodity: itemCount ? `${itemCount} item lines` : 'General Cargo',
    sender_name: d.sender.name.trim(),
    sender_phone: d.sender.phone.trim(),
    sender_email: d.sender.email.trim() || null,
    sender_address: d.sender.address.trim() || null,
    receiver_name: d.receiver.name.trim(),
    receiver_phone: d.receiver.phone.trim(),
    receiver_email: d.receiver.email.trim() || null,
    receiver_address: d.receiver.address.trim(),
    total_npr: r.total,
    bill: { v: BILL_SCHEMA_VERSION, draft: d, baseAuto: r.baseAuto },
  };
}

/** Rebuild the editable draft from a saved row. Old rows without a `bill` still open, with what columns they have. */
export function fromShipmentRow(row: AdminShipment): { draft: BillDraft; baseAuto: number | null } {
  const saved = row.bill as { draft?: BillDraft; baseAuto?: number | null } | null | undefined;
  if (saved?.draft) return { draft: saved.draft, baseAuto: saved.baseAuto ?? null };
  const d = newBillDraft((row.created_at || new Date().toISOString()).slice(0, 10));
  d.billNo = row.tracking_number;
  d.sender = { name: row.sender_name || row.shipper_company || '', country: row.shipper_country || 'Nepal', phone: row.sender_phone || '', address: row.sender_address || '', email: row.sender_email || '' };
  d.receiver = {
    name: row.receiver_name || row.consignee_company || '',
    country: row.consignee_country || row.destination || '',
    phone: row.receiver_phone || '',
    address: row.receiver_address || '',
    email: row.receiver_email || '',
  };
  d.totalWeightKg = Number(row.gross_weight_kg || 0);
  return { draft: d, baseAuto: null };
}

export function snapshotOf(d: BillDraft, baseAuto: number | null): BillSnapshot {
  return { draft: d, result: computeBill(d, baseAuto) };
}
