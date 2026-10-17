import React from 'react';
import { Milestone as MilestoneIcon, Printer, Edit, ArrowRight } from 'lucide-react';
import { AdminShipment } from '../types';

interface ShipmentMobileCardProps {
  shipment: AdminShipment;
  onOpenMilestones: (s: AdminShipment) => void;
  onPrint: (s: AdminShipment) => void;
  onOpenEdit: (s: AdminShipment) => void;
  canManageShipments: boolean;
}

export const ShipmentMobileCard: React.FC<ShipmentMobileCardProps> = ({
  shipment: s,
  onOpenMilestones,
  onPrint,
  onOpenEdit,
  canManageShipments
}) => {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-hard-xs space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-mono font-bold text-sm text-slate-900">
            {s.tracking_number}
          </span>
          <span className="block text-[11px] font-mono text-slate-400 uppercase">
            {s.mode} · {s.service_name}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700">
          {s.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="text-xs text-slate-600 flex items-center gap-1.5">
        <span>{s.origin}</span>
        <ArrowRight className="w-3 h-3 text-slate-400" />
        <span className="font-bold">{s.destination}</span>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onOpenMilestones(s)}
          className="flex-1 min-h-[44px] rounded-xl bg-slate-100 text-xs font-heading font-bold text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <MilestoneIcon className="w-3.5 h-3.5" />
          <span>Timeline</span>
        </button>
        <button
          onClick={() => onPrint(s)}
          className="min-h-[44px] px-3 rounded-xl bg-slate-100 text-xs font-heading font-bold text-slate-800 flex items-center justify-center cursor-pointer"
          aria-label="Print AWB"
        >
          <Printer className="w-4 h-4" />
        </button>
        {canManageShipments && (
          <button
            onClick={() => onOpenEdit(s)}
            className="min-h-[44px] px-3 rounded-xl bg-blue-50 text-blue-600 text-xs font-heading font-bold flex items-center justify-center cursor-pointer"
            aria-label="Edit Shipment"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
