import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Printer,
  Milestone as MilestoneIcon,
  Trash2,
  Edit,
  ArrowRight
} from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import { AdminShipment, AdminMilestone } from '../types';
import { useMyPermissions } from '../usePermissions';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MilestonesModal } from './MilestonesModal';
import { ShipmentMobileCard } from './ShipmentMobileCard';
import { useAdminDialogs } from '../AdminConfirmDialog';

export const ShipmentsTab: React.FC = () => {
  const { confirm, notify } = useAdminDialogs();
  const { role } = useAuth();
  const permissions = useMyPermissions();

  const [shipments, setShipments] = useState<AdminShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // The search lives in the URL (?q=), so the shell's search box and links can fill it.
  const [params, setParams] = useSearchParams();
  const searchTerm = params.get('q') ?? '';
  const setSearchTerm = (v: string) => setParams(v ? { q: v } : {}, { replace: true });
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');

  // Modals state
  const navigate = useNavigate();
  const [milestoneTarget, setMilestoneTarget] = useState<AdminShipment | null>(null);
  const [milestones, setMilestones] = useState<AdminMilestone[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneLocation, setNewMilestoneLocation] = useState('');

  const loadShipments = async () => {
    try {
      setError(null);
      const data = await adminDataService.fetchShipments();
      setShipments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch shipments from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, []);

  const handleOpenCreate = () => navigate('/admin/shipments/new');

  const handleOpenEdit = (s: AdminShipment) => navigate(`/admin/shipments/${s.id}`);

  const handleDelete = async (s: AdminShipment) => {
    if (!(await confirm({ title: 'Delete this shipment?', body: <>Shipment <strong className="font-mono">{s.tracking_number}</strong> and all its tracking updates will be deleted. The customer's tracking number will stop working. This cannot be undone.</>, confirmLabel: 'Delete shipment', danger: true }))) return;
    try {
      await adminDataService.deleteShipment(s.id, s.tracking_number);
      setShipments(prev => prev.filter(x => x.id !== s.id));
    } catch (err: any) {
      void notify(err.message, 'Shipment not deleted');
    }
  };

  const handleOpenMilestones = async (s: AdminShipment) => {
    setMilestoneTarget(s);
    setNewMilestoneLocation(s.origin);
    try {
      const ms = await adminDataService.fetchMilestones(s.id);
      setMilestones(ms);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMilestone = async () => {
    if (!milestoneTarget || !newMilestoneTitle.trim()) return;
    try {
      const m = await adminDataService.createMilestone({
        shipment_id: milestoneTarget.id,
        title: newMilestoneTitle.trim(),
        location: newMilestoneLocation.trim() || milestoneTarget.destination,
        timestamp: new Date().toISOString(),
        status: 'completed',
        completed: true,
        description: 'Updated via operational desk',
        sort_order: milestones.length + 1
      });
      setMilestones(prev => [...prev, m]);
      setNewMilestoneTitle('');
    } catch (err: any) {
      void notify(err.message, 'Tracking update not added');
    }
  };

  const handlePrint = (s: AdminShipment) => navigate(`/admin/shipments/${s.id}?print=1`);

  const filtered = shipments.filter(s => {
    const matchSearch =
      s.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.origin && s.origin.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.destination && s.destination.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.shipper_company && s.shipper_company.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchMode = modeFilter === 'all' || s.mode === modeFilter;

    return matchSearch && matchStatus && matchMode;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-slate-900 uppercase tracking-tight">
            Shipments &amp; Consignments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Single source of truth tracking desk backed directly by PostgreSQL tables.
          </p>
        </div>

        {permissions.canManageShipments && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-ox-900 text-white font-heading font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-hard-xs flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Shipment</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
          {error}
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-hard-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search AWB, route, shipper..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-heading font-semibold text-slate-700 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_transit">In Transit</option>
            <option value="customs_cleared">Customs Cleared</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
          </select>

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-heading font-semibold text-slate-700 cursor-pointer"
          >
            <option value="all">All Modes</option>
            <option value="air">Air Cargo</option>
            <option value="road">Overland</option>
            <option value="sea">Ocean</option>
          </select>
        </div>
      </div>

      {/* Desktop Dense Table (> 768px) */}
      <div className="hidden md:block rounded-2xl bg-white border border-slate-200 shadow-hard-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ox-900 text-white text-[11px] font-heading font-bold uppercase tracking-wider sticky top-0">
                <th className="py-2.5 px-4">AWB / Mode</th>
                <th className="py-2.5 px-4">Route</th>
                <th className="py-2.5 px-4">Receiver</th>
                <th className="py-2.5 px-4">Weight / Boxes · Total</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                    {loading ? 'Querying database...' : 'No matching consignments found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="font-mono font-bold text-slate-900">
                        {s.tracking_number}
                      </div>
                      <span className="text-[10px] font-mono uppercase text-slate-400">
                        {s.mode} · {s.commodity || 'Cargo'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <span>{s.origin}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{s.destination}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">
                      {s.receiver_name || s.consignee_company || '—'}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">
                      {s.chargeable_weight_kg || s.gross_weight_kg || 0} kg · {s.pieces || 1} box{(s.pieces || 1) > 1 ? 'es' : ''}{s.total_npr != null ? ` · Rs ${Number(s.total_npr).toLocaleString('en-US')}` : ''}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        s.status === 'delivered'
                          ? 'bg-emerald-500/15 text-emerald-600'
                          : s.status === 'in_transit'
                          ? 'bg-blue-500/15 text-blue-600'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {s.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenMilestones(s)}
                          title="Milestones Timeline"
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        >
                          <MilestoneIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePrint(s)}
                          title="Print bill and box sheets" aria-label="Print bill and box sheets"
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {permissions.canManageShipments && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(s)}
                              title="Edit shipment" aria-label="Edit shipment"
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-blue-600 transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(s)}
                              title="Delete shipment" aria-label="Delete shipment"
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (< 768px) */}
      <div className="md:hidden space-y-3">
        {filtered.map((s) => (
          <ShipmentMobileCard
            key={s.id}
            shipment={s}
            onOpenMilestones={handleOpenMilestones}
            onPrint={handlePrint}
            onOpenEdit={handleOpenEdit}
            canManageShipments={permissions.canManageShipments}
          />
        ))}
      </div>

      {/* MILESTONES QUICK-ADD MODAL */}
      <MilestonesModal
        milestoneTarget={milestoneTarget}
        milestones={milestones}
        newMilestoneTitle={newMilestoneTitle}
        setNewMilestoneTitle={setNewMilestoneTitle}
        newMilestoneLocation={newMilestoneLocation}
        setNewMilestoneLocation={setNewMilestoneLocation}
        onAddMilestone={handleAddMilestone}
        onClose={() => setMilestoneTarget(null)}
        canManageMilestones={permissions.canManageMilestones}
      />

    </div>
  );
};
