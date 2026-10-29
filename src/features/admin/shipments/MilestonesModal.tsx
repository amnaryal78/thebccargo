import React from 'react';
import { X } from 'lucide-react';
import { AdminShipment, AdminMilestone } from '../types';

interface MilestonesModalProps {
  milestoneTarget: AdminShipment | null;
  milestones: AdminMilestone[];
  newMilestoneTitle: string;
  setNewMilestoneTitle: (val: string) => void;
  newMilestoneLocation: string;
  setNewMilestoneLocation: (val: string) => void;
  onAddMilestone: () => void;
  onClose: () => void;
  canManageMilestones: boolean;
}

export const MilestonesModal: React.FC<MilestonesModalProps> = ({
  milestoneTarget,
  milestones,
  newMilestoneTitle,
  setNewMilestoneTitle,
  newMilestoneLocation,
  setNewMilestoneLocation,
  onAddMilestone,
  onClose,
  canManageMilestones
}) => {
  if (!milestoneTarget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-hard-lg my-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-heading font-bold text-sm text-slate-900 uppercase tracking-wider">
              Custody Milestones: {milestoneTarget.tracking_number}
            </h2>
            <span className="text-[10px] font-mono text-slate-400">
              {milestoneTarget.origin} ➔ {milestoneTarget.destination}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Milestones List */}
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {milestones.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 font-mono">
              No tracking milestones logged yet.
            </div>
          ) : (
            milestones.map((m) => (
              <div key={m.id} className="p-2.5 rounded-xl bg-slate-50 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">{m.title}</span>
                    <span className="text-[10px] text-slate-500">{m.location}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Quick Add Form */}
        {canManageMilestones && (
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <span className="text-[11px] font-heading font-bold uppercase text-slate-700">
              Quick-Add Checkpoint Event
            </span>
            <div className="space-y-2">
              <input
                type="text"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                placeholder="e.g. Customs Escort Cleared at TIA bonded zone"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMilestoneLocation}
                  onChange={(e) => setNewMilestoneLocation(e.target.value)}
                  placeholder="Checkpoint Location"
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900"
                />
                <button
                  onClick={onAddMilestone}
                  disabled={!newMilestoneTitle.trim()}
                  className="px-4 py-1.5 rounded-xl bg-ox-900 text-white font-heading font-bold text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer shadow-hard-xs"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
