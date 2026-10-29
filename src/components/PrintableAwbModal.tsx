import React from 'react';
import { X, Printer, Barcode, ShieldCheck, CheckCircle2, Plane } from 'lucide-react';
import { Shipment } from '../types';
import { BcLogo } from './BcLogo';

interface PrintableAwbModalProps {
  shipment: Shipment | null;
  onClose: () => void;
}

export const PrintableAwbModal: React.FC<PrintableAwbModalProps> = ({
  shipment,
  onClose
}) => {
  if (!shipment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-[var(--r-lg)] max-w-3xl w-full border border-[var(--line)] shadow-hard-lg overflow-hidden my-8">
        
        {/* Modal Top Control Bar */}
        <div className="bg-[#0E1638] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-sm uppercase">Package Waybill &amp; Receipt</span>
            <span className="bg-ox-900 text-gd-500 text-[10px] font-mono font-bold px-2 py-0.5 rounded-[var(--r-xs)]">
              Official Courier Document
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="min-h-[44px] px-4 py-2 rounded-[var(--r-sm)] bg-ox-900 hover:bg-[#123562] text-white font-heading font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gd-500"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close document modal"
              className="min-h-[44px] min-w-[44px] p-2 rounded-[var(--r-sm)] hover:bg-white/10 text-white transition-colors cursor-pointer inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gd-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div id="printable-awb" className="p-8 bg-white text-[#0b1c30] font-mono text-xs flex flex-col gap-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-900 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <BcLogo size="md" showSubtitle={false} />
              <div>
                <h2 className="font-heading font-extrabold text-base tracking-tight text-slate-900">
                  THE BC CARGO &amp; COURIER
                </h2>
                <p className="text-[11px] text-slate-600">Central Operations: School Road -4, Hetauda, Nepal</p>
                <p className="text-[10px] text-slate-500">Phone: 057-591816 / 9855019485 • Email: thebccargo@gmail.com</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Tracking Number</span>
              <span className="font-heading font-extrabold text-xl text-ox-900 tracking-wider block">
                {shipment.trackingNumber}
              </span>
              <span className="text-[10px] text-slate-600 block">Booking Number: {shipment.bookingRef}</span>
            </div>
          </div>

          {/* Trade Parties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b-2 border-slate-900 pb-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                1. SENDER (YOUR DETAILS)
              </span>
              <p className="font-bold text-slate-900 text-sm">{shipment.shipper.company}</p>
              <p>Name: {shipment.shipper.name}</p>
              <p>{shipment.shipper.address || shipment.shipper.city}, {shipment.shipper.country}</p>
              <p className="text-slate-600 mt-1">Phone: {shipment.shipper.contact || 'Registered'}</p>
              <p className="text-[10px] text-slate-500">Sent From: {shipment.originHub}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                2. RECEIVER
              </span>
              <p className="font-bold text-slate-900 text-sm">{shipment.consignee.company}</p>
              <p>Name: {shipment.consignee.name}</p>
              <p>{shipment.consignee.address || shipment.consignee.city}, {shipment.consignee.country}</p>
              <p className="text-slate-600 mt-1">Phone: {shipment.consignee.contact || 'Verified Importer'}</p>
              <p className="text-[10px] text-slate-500">Destination: {shipment.destinationGateway}</p>
            </div>
          </div>

          {/* Freight Routing & Carrier */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b-2 border-slate-900 pb-4 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Departure City</span>
              <span className="font-bold">{shipment.origin}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Arrival City</span>
              <span className="font-bold">{shipment.destination}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Transport / Route</span>
              <span className="font-bold text-blue-800">{shipment.carrierInfo}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Delivery Terms</span>
              <span className="font-bold">{shipment.incoterm}</span>
            </div>
          </div>

          {/* Cargo Weights & Dimensions Table */}
          <div className="border border-slate-300 rounded overflow-hidden">
            <div className="bg-slate-100 p-2 font-bold text-[11px] grid grid-cols-5 text-slate-800 border-b border-slate-300">
              <span>Boxes / Packages</span>
              <span>Weight</span>
              <span>Billed Weight</span>
              <span>Items Inside</span>
              <span className="text-right">Volume</span>
            </div>
            <div className="p-2.5 grid grid-cols-5 text-xs text-slate-800">
              <span className="font-bold">{shipment.pieces} Pkgs</span>
              <span>{shipment.grossWeightKg.toLocaleString()} KG</span>
              <span className="font-bold text-ox-900">{shipment.chargeableWeightKg.toLocaleString()} KG</span>
              <span>{shipment.commodity}</span>
              <span className="text-right font-bold">{shipment.volumeCbm.toFixed(2)} CBM</span>
            </div>
          </div>

          {/* Environmental E-Seal & Telemetry Sign-off */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Security Seal: {shipment.telemetry.eSealStatus}</span>
              </div>
              <p className="text-slate-600">
                Seal #: <strong>{shipment.telemetry.sealNumber}</strong> • Temperature Sensor: <strong>{shipment.telemetry.temperature}</strong>
              </p>
              <p className="text-slate-500 text-[10px]">
                Package accepted in good condition for safe delivery according to carriage terms.
              </p>
            </div>

            {/* Barcode representation */}
            <div className="flex flex-col items-center">
              <div className="h-9 w-44 bg-slate-900 flex items-center justify-center text-white px-2">
                <Barcode className="w-full h-7 text-white" />
              </div>
              <span className="text-[10px] tracking-widest text-slate-600 mt-0.5">
                *{shipment.trackingNumber}*
              </span>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-300 text-[11px]">
            <div>
              <div className="border-b border-dashed border-slate-400 pb-8 mb-1"></div>
              <span className="text-slate-500 block">Sender's Signature</span>
            </div>
            <div className="text-right">
              <div className="border-b border-dashed border-slate-400 pb-8 mb-1"></div>
              <span className="text-slate-500 block">Handled by The BC Cargo &amp; Courier Pvt. Ltd.</span>
            </div>
          </div>

        </div>

        {/* Modal Bottom Action */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 rounded-[var(--r-sm)] bg-slate-800 hover:bg-slate-900 text-white font-heading font-bold text-xs uppercase shadow-hard-xs hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
