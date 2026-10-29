import React, { useId } from 'react';
import { X, Printer, Download, ShieldCheck } from 'lucide-react';
import { downloadBill } from './billPdf';
import { BOX_CHARGE_NPR, LIQUID_FEE_PER_BOTTLE_NPR, SheetQuoteResult } from './engine';
import { numberToWords } from '../../utils/numberToWords';

interface EstimateBillModalProps {
  quote: SheetQuoteResult;
  onClose: () => void;
}

export const EstimateBillModal: React.FC<EstimateBillModalProps> = ({ quote, onClose }) => {
  const modalId = useId();
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Determine matched rate bracket(s) and pricing method
  const brackets = Array.from(new Set(quote.boxDetails.map((b) => b.bracketUsed)));
  const matchedBracket = brackets.join(', ') || (quote.totalWeightKg >= 20 ? '20_plus' : quote.totalWeightKg >= 10 ? '10_plus' : 'under_10');
  const pricingMethod = quote.totalWeightKg >= 10 ? 'Per-KG Tariff' : '0.5kg Flat Tier';

  // Format currency with standard 2 decimal places
  const fmt = (val: number) =>
    val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Generate deterministic bill number based on destination and weight
  const billCode = `BC-EST-${Math.round(quote.totalWeightKg * 10)}-${quote.destinationName.slice(0, 3).toUpperCase()}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`bill-title-${modalId}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-300 shadow-2xl overflow-hidden my-6">
        
        {/* =============================================================== */}
        {/* TOP ACTION BAR (Hidden in Print) */}
        {/* =============================================================== */}
        <div className="no-print bg-[#0B1F3A] text-white px-3 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#16345B]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#F5B301]" />
            <span id={`bill-title-${modalId}`} className="font-heading font-extrabold text-sm uppercase tracking-wide">
              Estimate Rate Bill
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadBill(quote, currentDate)}
              className="min-h-[44px] px-3 sm:px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-[#0B1F3A] font-heading font-extrabold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm active:translate-y-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B301]"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-[44px] px-4 py-2 rounded-lg bg-[#F5B301] hover:bg-[#ffc31f] text-[#0B1F3A] font-heading font-extrabold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm active:translate-y-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close bill preview"
              className="min-h-[44px] min-w-[44px] p-2 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B301]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =============================================================== */}
        {/* PRINTABLE BILL CONTAINER (5x8 inch / A5 layout matching reference) */}
        {/* =============================================================== */}
        <div
          id="printable-bill"
          className="p-3 sm:p-7 bg-white text-[#102033] font-sans text-[11px] leading-relaxed max-w-[5.4in] mx-auto"
        >
          {/* Header */}
          <div className="text-center border-b-[3px] border-[#0B1F3A] pb-2 mb-2">
            <div className="text-xl font-extrabold text-[#0B1F3A] tracking-wider uppercase font-heading">
              The BC <span className="text-[#F5B301]">Cargo</span> &amp; Courier
            </div>
            <div className="text-[9px] text-[#52657A] mt-0.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5">
              <span>School Road -4, Hetauda, Nepal</span>
              <span>Phone: 057-591816 / 9855019485</span>
              <span>Email: thebccargo@gmail.com</span>
            </div>
          </div>

          {/* Big title + bill number + date */}
          <div className="text-center py-3 my-2 bg-[#eef3f8] rounded-lg border-2 border-[#0B1F3A]">
            <div className="text-2xl sm:text-3xl font-black text-[#0B1F3A] tracking-wide uppercase font-heading">
              Estimated Rate
            </div>
            <div className="mt-1 text-[10px] text-[#52657A] font-semibold">
              Bill No: <span className="font-mono font-bold text-[#0B1F3A]">{billCode}</span> &nbsp;•&nbsp; Date: <span className="font-bold text-[#102033]">{currentDate}</span>
            </div>
          </div>
          {/* Parties: Sender (Hetauda Office) & Receiver (Destination) */}
          <div className="w-full my-2 pb-2 border-b border-[#d6e0ea]">
            <table className="w-full border-separate border-spacing-2 table-fixed text-[8.5px]">
              <tbody>
                <tr>
                  {/* Origin */}
                  <td className="w-1/2 align-top p-0">
                    <div className="bg-[#f8fafc] border-l-[3px] border-[#0B1F3A] rounded overflow-hidden p-2 space-y-1">
                      <div className="text-[9px] font-extrabold uppercase tracking-wide text-[#0B1F3A] border-b border-[#0B1F3A] pb-0.5">
                        From (Origin)
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-[#52657A]">Central Hub:</span>
                        <span className="font-bold text-[#102033]">Hetauda Office</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-[#52657A]">Location:</span>
                        <span className="font-bold text-[#102033]">School Road -4, Hetauda</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-[#52657A]">Country:</span>
                        <span className="font-bold text-[#102033]">Nepal</span>
                      </div>
                    </div>
                  </td>

                  {/* Destination */}
                  <td className="w-1/2 align-top p-0">
                    <div className="bg-[#f8fafc] border-r-[3px] border-[#0d9488] rounded overflow-hidden p-2 space-y-1">
                      <div className="text-[9px] font-extrabold uppercase tracking-wide text-[#0d9488] border-b border-[#0d9488] pb-0.5">
                        To (Destination)
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-[#52657A]">Country:</span>
                        <span className="font-bold text-[#102033]">{quote.destinationName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-[#52657A]">Freight:</span>
                        <span className="font-bold text-[#102033]">Air Cargo Express</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Itemized Tariff Breakdown */}
          <div className="my-2">
            <div className="text-[9px] font-extrabold uppercase tracking-wide text-[#0B1F3A] border-b-2 border-[#0B1F3A] pb-0.5 mb-1.5 inline-block">
              Charges Breakdown
            </div>
            <div className="overflow-x-auto"><table className="w-full border-collapse text-[8px] sm:text-[8.5px]">
              <thead>
                <tr className="bg-[#eef3f8] text-[#0B1F3A] uppercase font-bold text-[8px]">
                  <th className="border border-[#cbd5e1] p-1 text-center w-[6%]">#</th>
                  <th className="border border-[#cbd5e1] p-1 text-left w-[42%]">Item</th>
                  <th className="border border-[#cbd5e1] p-1 text-center w-[12%]">Qty</th>
                  <th className="border border-[#cbd5e1] p-1 text-right w-[14%]">Wt (kg)</th>
                  <th className="border border-[#cbd5e1] p-1 text-right w-[13%]">Rate (Rs)</th>
                  <th className="border border-[#cbd5e1] p-1 text-right w-[13%]">Amount (Rs)</th>
                </tr>
              </thead>
              <tbody>
                {/* 1. Base Freight */}
                <tr>
                  <td className="border border-[#cbd5e1] p-1 text-center">1</td>
                  <td className="border border-[#cbd5e1] p-1 text-left">
                    Base Shipping Charge ({quote.totalWeightKg} kg to {quote.destinationName})<span className="block text-[#718399] text-[7.5px]">{pricingMethod}</span>
                  </td>
                  <td className="border border-[#cbd5e1] p-1 text-center">
                    {quote.boxCount} {quote.boxCount === 1 ? 'box' : 'boxes'}
                  </td>
                  <td className="border border-[#cbd5e1] p-1 text-right font-mono">
                    {quote.totalWeightKg.toFixed(2)}
                  </td>
                  <td className="border border-[#cbd5e1] p-1 text-right font-mono">
                    {quote.totalWeightKg >= 10
                      ? fmt(quote.baseShippingCharge / quote.totalWeightKg)
                      : '-'}
                  </td>
                  <td className="border border-[#cbd5e1] p-1 text-right font-mono font-semibold">
                    {fmt(quote.baseShippingCharge)}
                  </td>
                </tr>

                {/* 2. Custom box charge */}
                <tr>
                  <td className="border border-[#cbd5e1] p-1 text-center">2</td>
                  <td className="border border-[#cbd5e1] p-1 text-left">
                    Custom box charge (max 20 kg per box)
                  </td>
                  <td className="border border-[#cbd5e1] p-1 text-center">
                    {quote.boxCount} {quote.boxCount === 1 ? 'box' : 'boxes'}
                  </td>
                  <td className="border border-[#cbd5e1] p-1 text-right font-mono">0.00</td>
                  <td className="border border-[#cbd5e1] p-1 text-right font-mono">{fmt(BOX_CHARGE_NPR)}</td>
                  <td className="border border-[#cbd5e1] p-1 text-right font-mono font-semibold">
                    {fmt(quote.boxCharge)}
                  </td>
                </tr>

                {/* Home pickup charge (only if selected) */}
                {(quote.pickupFeeNpr ?? 0) > 0 && (
                  <tr>
                    <td className="border border-[#cbd5e1] p-1 text-center">+</td>
                    <td className="border border-[#cbd5e1] p-1 text-left">
                      Home pickup charge{quote.pickupArea ? ` (${quote.pickupArea})` : ''}
                    </td>
                    <td className="border border-[#cbd5e1] p-1 text-center">1</td>
                    <td className="border border-[#cbd5e1] p-1 text-right font-mono">0.00</td>
                    <td className="border border-[#cbd5e1] p-1 text-right font-mono">{fmt(quote.pickupFeeNpr ?? 0)}</td>
                    <td className="border border-[#cbd5e1] p-1 text-right font-mono font-semibold">{fmt(quote.pickupFeeNpr ?? 0)}</td>
                  </tr>
                )}

                {/* 3. Liquid Charges (only if selected) */}
                {quote.liquidCharge > 0 && (
                  <tr>
                    <td className="border border-[#cbd5e1] p-1 text-center">3</td>
                    <td className="border border-[#cbd5e1] p-1 text-left">
                      Liquid Handling Surcharge
                    </td>
                    <td className="border border-[#cbd5e1] p-1 text-center">
                      {quote.liquidBottles ?? 1} btl
                    </td>
                    <td className="border border-[#cbd5e1] p-1 text-right font-mono">0.00</td>
                    <td className="border border-[#cbd5e1] p-1 text-right font-mono">{fmt(LIQUID_FEE_PER_BOTTLE_NPR)}</td>
                    <td className="border border-[#cbd5e1] p-1 text-right font-mono font-semibold">
                      {fmt(quote.liquidCharge)}
                    </td>
                  </tr>
                )}

                {/* 4. Meat Charges (only if selected) */}
                {quote.meatCharge > 0 && (
                  <tr>
                    <td className="border border-[#cbd5e1] p-1 text-center">4</td>
                    <td className="border border-[#cbd5e1] p-1 text-left">
                      Meat Compliance Surcharge
                    </td>
                    <td className="border border-[#cbd5e1] p-1 text-center">1 item</td>
                    <td className="border border-[#cbd5e1] p-1 text-right font-mono">-</td>
                    <td className="border border-[#cbd5e1] p-1 text-right font-mono">-</td>
                    <td className="border border-[#cbd5e1] p-1 text-right font-mono font-semibold">
                      {fmt(quote.meatCharge)}
                    </td>
                  </tr>
                )}

                {/* 5. Medicine Row: no fixed price, our team quotes it */}
                {quote.medicineOnRequest && (
                  <tr>
                    <td className="border border-[#cbd5e1] p-1 text-center">5</td>
                    <td className="border border-[#cbd5e1] p-1 text-left">
                      Medicine (price on request, contact us)
                    </td>
                    <td className="border border-[#cbd5e1] p-1 text-center">-</td>
                    <td className="border border-[#cbd5e1] p-1 text-right font-mono">-</td>
                    <td className="border border-[#cbd5e1] p-1 text-right font-mono">-</td>
                    <td className="border border-[#cbd5e1] p-1 text-right font-mono font-semibold">-</td>
                  </tr>
                )}

                {/* Total Row (Total must strictly equal the sum of lines above it) */}
                <tr className="bg-[#f8fafc] font-bold border-t-2 border-[#0B1F3A]">
                  <td colSpan={3} className="border border-[#cbd5e1] p-1.5 text-center font-extrabold uppercase">
                    TOTAL
                  </td>
                  <td className="border border-[#cbd5e1] p-1.5 text-right font-mono font-bold">
                    {quote.totalWeightKg.toFixed(2)}
                  </td>
                  <td className="border border-[#cbd5e1] p-1.5"></td>
                  <td className="border border-[#cbd5e1] p-1.5 text-right font-mono text-[9.5px] font-black text-[#0B1F3A]">
                    {fmt(quote.totalNpr)}
                  </td>
                </tr>
              </tbody>
            </table></div>
          </div>

          {/* Summary: Amount in Words & Grand Total */}
          <div className="flex justify-between items-start my-2 pt-2 border-t-2 border-[#0B1F3A] gap-4">
            <div className="flex-1 space-y-1.5">
              <div className="text-[8.5px] text-[#52657A] italic">
                <span className="font-bold text-[#102033] not-italic">Amount in Words: </span>
                {numberToWords(quote.totalNpr)} Rupees Only
              </div>
              <div className="p-1.5 bg-[#fffbeb] border-l-[3px] border-[#f59e0b] rounded text-[8px] text-[#92400e] leading-tight">
                <strong>Important Notice:</strong> Final bill is made after physical check at our office (School Road -4, Hetauda, Nepal). Weight verified via electronic certified scales.
              </div>
            </div>

            <div className="text-right min-w-[130px]">
              <div className="text-[9px] text-[#52657A] font-bold uppercase tracking-wider">
                Grand Total
              </div>
              <div className="text-[17px] font-black text-[#0B1F3A] font-mono leading-none mt-0.5">
                <span className="text-[12px] text-[#52657A] font-semibold mr-0.5">Rs.</span>
                {fmt(quote.totalNpr)}
              </div>
            </div>
          </div>

          {/* Footer: Signature & QR Verification */}
          <div className="flex justify-between items-end mt-4 pt-2 border-t border-[#d6e0ea]">
            <div>
              <div className="text-[8px] text-[#52657A] font-semibold uppercase tracking-wider">
                Authorized Signature
              </div>
              <div className="w-28 border-t border-[#102033] mt-6"></div>
            </div>
          </div>

          {/* Terms */}
          <div className="text-center text-[8px] text-[#718399] mt-3 pt-2 border-t border-[#d6e0ea]">
            Thank you for choosing <strong>The BC Cargo &amp; Courier</strong> • Fast &amp; Reliable Cargo Services
          </div>

        </div>

      </div>
    </div>
  );
};
